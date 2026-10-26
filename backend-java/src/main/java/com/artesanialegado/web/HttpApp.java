package com.artesanialegado.web;

import com.artesanialegado.Container;
import com.artesanialegado.archivo.ArchivoService;
import com.artesanialegado.error.AppException;
import com.artesanialegado.logging.EventLogger;
import com.artesanialegado.security.Permisos;
import com.artesanialegado.service.AuthService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Stopwatch;
import com.google.common.collect.ImmutableMap;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;

/**
 * Servidor HTTP (servidor integrado del JDK). Aplica la seguridad transversal (cabeceras, límite de cuerpo, CSRF,
 * sesión, roles), despacha a los controladores y sirve la vista estática.
 */
public class HttpApp {
    static final int MAX_BODY = 100 * 1024;
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Map<String, String> SEC = ImmutableMap.of(
            "X-Content-Type-Options", "nosniff",
            "X-Frame-Options", "DENY",
            "Referrer-Policy", "no-referrer",
            "Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'");
    private static final Set<String> PUBLICAS = Set.of("/login.html");
    private static final Map<String, String> TIPOS = Map.of(
            "html", "text/html; charset=utf-8", "css", "text/css", "js", "application/javascript", "png", "image/png",
            "svg", "image/svg+xml", "ico", "image/x-icon", "json", "application/json");

    private final Container container;
    private final AuthService auth;
    private final Path root;
    private final String corsOrigin;
    private final boolean cookieSecure;
    private final EventLogger log;
    private final List<Route> routes;

    public HttpApp(Container container, Path publicDir, String corsOrigin, boolean cookieSecure, EventLogger log) {
        this.container = container;
        this.auth = container.auth();
        this.root = publicDir.toAbsolutePath().normalize();
        this.corsOrigin = StringUtils.trimToNull(corsOrigin);
        this.cookieSecure = cookieSecure;
        this.log = log;
        this.routes = Controllers.todos(container);
    }

    public HttpServer start(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", this::handle);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();
        return server;
    }

    // ------------------------------------------------------------------ despacho
    private void handle(HttpExchange ex) throws IOException {
        Stopwatch reloj = Stopwatch.createStarted();
        String ruta = ex.getRequestURI().getRawPath();
        try {
            procesar(ex);
        } catch (AppException e) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("error", e.getMessage());
            m.put("code", e.code());
            if (e.details() != null) m.put("errores", e.details());
            log.warn("rechazo", Map.of("status", e.status(), "code", e.code(), "motivo", e.getMessage()));
            json(ex, e.status(), m, Map.of());
        } catch (RuntimeException | Error e) {
            // el detalle queda en el log; al usuario solo se le muestra un error genérico
            log.error("error no controlado", Map.of("error", String.valueOf(e.getMessage()), "tipo", e.getClass().getSimpleName()));
            json(ex, 500, Map.of("error", "Error interno del servidor"), Map.of());
        } finally {
            Object st = ex.getAttribute("status");
            log.info("http", ImmutableMap.of("method", ex.getRequestMethod(), "path", ruta, "status", st == null ? 0 : st, "ms", reloj.elapsed().toMillis()));
            ex.close();
        }
    }

    private void procesar(HttpExchange ex) throws IOException {
        String metodo = ex.getRequestMethod();
        String path = ex.getRequestURI().getPath();
        if ("OPTIONS".equals(metodo)) { enviar(ex, 204, null, null, Map.of()); return; }
        if (path.startsWith("/api/")) { api(ex, metodo, path); return; }
        if ("GET".equals(metodo)) { estatico(ex, ex.getRequestURI().getRawPath()); return; }
        throw new AppException.NotFound();
    }

    private void api(HttpExchange ex, String metodo, String path) throws IOException {
        if (Set.of("POST", "PUT", "DELETE").contains(metodo) && ex.getRequestHeaders().getFirst("Origin") != null) {   // defensa CSRF adicional a SameSite
            String origin = ex.getRequestHeaders().getFirst("Origin");
            String host;
            try { host = URI.create(origin).getAuthority(); } catch (IllegalArgumentException e) { host = ""; }
            if (!StringUtils.equals(host, ex.getRequestHeaders().getFirst("Host")) && !origin.equals(corsOrigin))
                throw new AppException.Forbidden("Origen no permitido");
        }
        String sid = cookie(ex, "sid");
        if (path.equals("/api/auth/login") && metodo.equals("POST")) { login(ex); return; }
        if (path.equals("/api/auth/logout") && metodo.equals("POST")) {
            auth.logout(sid);
            json(ex, 200, Map.of("ok", true), Map.of("Set-Cookie", setCookie(ex, "", 0), "Cache-Control", "no-store"));
            return;
        }
        AuthService.Sesion s = auth.sesion(sid);
        if (s == null) throw new AppException.Unauthorized("Inicia sesión para continuar");
        if (path.equals("/api/auth/me") && metodo.equals("GET")) { json(ex, 200, s, Map.of("Cache-Control", "no-store")); return; }
        if (!Permisos.permitido(s.rol(), metodo, path)) throw new AppException.Forbidden();
        for (Route r : routes) {
            if (!r.method().equals(metodo)) continue;
            Matcher m = r.pattern().matcher(path);
            if (!m.matches()) continue;
            List<Object> params = new ArrayList<>();
            for (int i = 1; i <= m.groupCount(); i++) params.add(m.group(i).matches("\\d+") ? (Object) Long.valueOf(m.group(i)) : m.group(i));
            Object body = metodo.equals("POST") || metodo.equals("PUT") ? leerCuerpo(ex) : Map.of();
            Route.Result res = r.handler().handle(new Route.Ctx(params, query(ex), body));
            if (res.data() instanceof ArchivoService.Descarga d) {
                enviar(ex, 200, d.bytes(), d.contentType(), Map.of("Content-Disposition", "attachment; filename=\"" + d.filename() + "\""));
            } else {
                json(ex, res.status(), res.data(), Map.of());
            }
            return;
        }
        json(ex, 404, Map.of("error", "Ruta no encontrada"), Map.of());
    }

    private void login(HttpExchange ex) throws IOException {
        Object body = leerCuerpo(ex);
        Map<?, ?> b = body instanceof Map<?, ?> m ? m : Map.of();
        String ip = ex.getRemoteAddress().getAddress().getHostAddress();
        try {
            AuthService.Login r = auth.login(b.get("usuario"), b.get("clave"), ip);
            log.info("login", Map.of("usuario", r.sesion().usuario(), "rol", r.sesion().rol()));
            json(ex, 200, r.sesion(), Map.of("Set-Cookie", setCookie(ex, r.token(), auth.maxAgeSeg()), "Cache-Control", "no-store"));
        } catch (AppException e) {
            Object u = b.get("usuario");
            log.warn("login fallido", Map.of("usuario", u instanceof String s ? StringUtils.left(s, 30) : "", "status", e.status()));
            throw e;
        }
    }

    // ------------------------------------------------------------------ entrada y salida
    private Object leerCuerpo(HttpExchange ex) throws IOException {
        byte[] datos = ex.getRequestBody().readNBytes(MAX_BODY + 1);
        if (datos.length > MAX_BODY) throw new AppException.PayloadTooLarge();
        if (datos.length == 0) return Map.of();
        try {
            return JSON.readValue(datos, Object.class);
        } catch (JsonProcessingException e) {
            throw new AppException.Validation("JSON inválido");
        }
    }

    private static Map<String, String> query(HttpExchange ex) {
        Map<String, String> q = new LinkedHashMap<>();
        String raw = ex.getRequestURI().getRawQuery();
        if (raw == null) return q;
        for (String par : raw.split("&")) {
            if (par.isEmpty()) continue;
            int i = par.indexOf('=');
            String k = URLDecoder.decode(i < 0 ? par : par.substring(0, i), StandardCharsets.UTF_8);
            q.putIfAbsent(k, i < 0 ? "" : URLDecoder.decode(par.substring(i + 1), StandardCharsets.UTF_8));
        }
        return q;
    }

    private static String cookie(HttpExchange ex, String nombre) {
        String h = ex.getRequestHeaders().getFirst("Cookie");
        if (h == null) return null;
        for (String c : h.split(";")) {
            String t = c.trim();
            if (t.startsWith(nombre + "=")) return t.substring(nombre.length() + 1);
        }
        return null;
    }

    private String setCookie(HttpExchange ex, String valor, long maxAge) {
        boolean seguro = cookieSecure || "https".equals(ex.getRequestHeaders().getFirst("X-Forwarded-Proto"));
        return "sid=" + valor + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=" + maxAge + (seguro ? "; Secure" : "");
    }

    private void json(HttpExchange ex, int status, Object data, Map<String, String> extra) throws IOException {
        byte[] bytes;
        try {
            bytes = JSON.writeValueAsBytes(data);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("No se pudo serializar la respuesta", e);
        }
        enviar(ex, status, bytes, "application/json; charset=utf-8", extra);
    }

    private void enviar(HttpExchange ex, int status, byte[] bytes, String tipo, Map<String, String> extra) throws IOException {
        SEC.forEach((k, v) -> ex.getResponseHeaders().set(k, v));
        if (corsOrigin != null) {
            ex.getResponseHeaders().set("Access-Control-Allow-Origin", corsOrigin);
            ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
            ex.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");
            ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        }
        if (tipo != null) ex.getResponseHeaders().set("Content-Type", tipo);
        extra.forEach((k, v) -> ex.getResponseHeaders().set(k, v));
        ex.setAttribute("status", status);
        if (bytes == null || bytes.length == 0) {
            ex.sendResponseHeaders(status, -1);
            return;
        }
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = ex.getResponseBody()) { out.write(bytes); }
    }

    // ------------------------------------------------------------------ archivos estáticos (la Vista)
    private void estatico(HttpExchange ex, String rawPath) throws IOException {
        String rel;
        try {
            rel = URLDecoder.decode(rawPath.replace("+", "%2B"), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw new AppException.Validation("Ruta inválida");
        }
        if (rel.indexOf('\0') >= 0) throw new AppException.Validation("Ruta inválida");
        Path file = root.resolve("." + (rel.equals("/") ? "/index.html" : rel)).normalize();
        if (!file.equals(root) && !file.startsWith(root)) throw new AppException.Forbidden("Acceso denegado");   // recorrido de rutas
        String relPub = "/" + root.relativize(file).toString().replace('\\', '/');
        String ext = FilenameUtils.getExtension(file.toString());
        if (ext.equals("html") && !relPub.equals("/index.html") && !PUBLICAS.contains(relPub) && auth.sesion(cookie(ex, "sid")) == null) {
            enviar(ex, 302, null, null, Map.of("Location", "login.html?next=" + java.net.URLEncoder.encode(file.getFileName().toString(), StandardCharsets.UTF_8)));
            return;
        }
        if (!Files.isRegularFile(file)) throw new AppException.NotFound("No encontrado");
        enviar(ex, 200, Files.readAllBytes(file), TIPOS.getOrDefault(ext, "application/octet-stream"), Map.of());
    }
}
