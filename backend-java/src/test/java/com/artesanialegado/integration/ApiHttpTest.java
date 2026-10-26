package com.artesanialegado.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.artesanialegado.Container;
import com.artesanialegado.TestDb;
import com.artesanialegado.logging.EventLogger;
import com.artesanialegado.web.HttpApp;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Pruebas de extremo a extremo: servidor real en un puerto libre y cliente HTTP real. */
class ApiHttpTest {
    static final ObjectMapper JSON = new ObjectMapper();
    HttpServer server;
    String base;
    Path publico;
    HttpClient http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();

    @BeforeEach
    void arrancar() throws Exception {
        publico = Files.createTempDirectory("public");
        Files.writeString(publico.resolve("index.html"), "<html>inicio</html>");
        Files.writeString(publico.resolve("login.html"), "<html>login</html>");
        Files.writeString(publico.resolve("ventas.html"), "<html>ventas</html>");
        Files.writeString(publico.resolve("app.css"), "body{}");
        Container c = TestDb.contenedor(TestDb.nueva());
        server = new HttpApp(c, publico, null, false, new EventLogger(ApiHttpTest.class)).start(0);
        base = "http://localhost:" + server.getAddress().getPort();
    }

    @AfterEach
    void parar() { server.stop(0); }

    // ---- ayudas ----
    record Resp(int status, String body, java.net.http.HttpHeaders h) {
        JsonNode json() throws Exception { return JSON.readTree(body); }
    }

    Resp pedir(String metodo, String ruta, String cuerpo, String cookie, String... cab) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(base + ruta))
                .method(metodo, cuerpo == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(cuerpo));
        if (cuerpo != null) b.header("Content-Type", "application/json");
        if (cookie != null) b.header("Cookie", cookie);
        for (int i = 0; i < cab.length; i += 2) b.header(cab[i], cab[i + 1]);
        HttpResponse<byte[]> r = http.send(b.build(), HttpResponse.BodyHandlers.ofByteArray());
        return new Resp(r.statusCode(), new String(r.body(), StandardCharsets.UTF_8), r.headers());
    }

    String login(String usuario, String clave) throws Exception {
        Resp r = pedir("POST", "/api/auth/login", "{\"usuario\":\"" + usuario + "\",\"clave\":\"" + clave + "\"}", null);
        assertEquals(200, r.status(), r.body());
        return r.h().firstValue("set-cookie").orElseThrow().split(";")[0];
    }

    // ---- autenticación ----
    @Test @DisplayName("login correcto: cookie HttpOnly + SameSite=Strict y datos del usuario")
    void loginCookie() throws Exception {
        Resp r = pedir("POST", "/api/auth/login", "{\"usuario\":\"admin\",\"clave\":\"" + TestDb.ADMIN + "\"}", null);
        String sc = r.h().firstValue("set-cookie").orElseThrow();
        assertTrue(sc.contains("HttpOnly") && sc.contains("SameSite=Strict") && sc.contains("Max-Age=28800"), sc);
        assertEquals("ADMIN", r.json().get("rol").asText());
        assertFalse(r.body().contains("clave"));
        assertEquals("no-store", r.h().firstValue("cache-control").orElse(""));
    }

    @Test @DisplayName("sin sesión la API responde 401 y con clave mala el mensaje es genérico")
    void sinSesion() throws Exception {
        assertEquals(401, pedir("GET", "/api/piezas", null, null).status());
        Resp r = pedir("POST", "/api/auth/login", "{\"usuario\":\"admin\",\"clave\":\"mala\"}", null);
        assertEquals(401, r.status());
        assertEquals("Usuario o contraseña incorrectos", r.json().get("error").asText());
        assertEquals(400, pedir("POST", "/api/auth/login", "{\"usuario\":\"a b\",\"clave\":\"x\"}", null).status());
        assertEquals(400, pedir("POST", "/api/auth/login", "esto no es json", null).status());
    }

    @Test @DisplayName("5 intentos fallidos bloquean con 429")
    void bloqueo() throws Exception {
        for (int i = 0; i < 5; i++) pedir("POST", "/api/auth/login", "{\"usuario\":\"operador\",\"clave\":\"mala\"}", null);
        assertEquals(429, pedir("POST", "/api/auth/login", "{\"usuario\":\"operador\",\"clave\":\"" + TestDb.OPERADOR + "\"}", null).status());
    }

    @Test @DisplayName("me devuelve la sesión y logout la invalida")
    void meYLogout() throws Exception {
        String ck = login("consulta", TestDb.CONSULTA);
        assertEquals("CONSULTA", pedir("GET", "/api/auth/me", null, ck).json().get("rol").asText());
        assertEquals(200, pedir("POST", "/api/auth/logout", "{}", ck).status());
        assertEquals(401, pedir("GET", "/api/auth/me", null, ck).status());
    }

    // ---- roles ----
    @Test @DisplayName("CONSULTA solo lee; OPERADOR no borra ni importa; ADMIN borra")
    void roles() throws Exception {
        String consulta = login("consulta", TestDb.CONSULTA), operador = login("operador", TestDb.OPERADOR), admin = login("admin", TestDb.ADMIN);
        assertEquals(200, pedir("GET", "/api/piezas", null, consulta).status());
        assertEquals(403, pedir("POST", "/api/ventas", "{}", consulta).status());
        assertEquals(403, pedir("DELETE", "/api/piezas/3", null, operador).status());
        assertEquals(403, pedir("POST", "/api/import/piezas", "{}", operador).status());
        String nueva = "{\"codigo\":\"PZ-77\",\"nombre\":\"Plato\",\"tecnica\":\"Cerámica\",\"id_taller\":1,\"precio\":40}";
        Resp creada = pedir("POST", "/api/piezas", nueva, operador);
        assertEquals(201, creada.status(), creada.body());
        assertEquals(200, pedir("DELETE", "/api/piezas/" + creada.json().get("id_pieza").asInt(), null, admin).status());
    }

    // ---- CSRF ----
    @Test @DisplayName("un Origin ajeno en una escritura se rechaza con 403; el propio se acepta")
    void csrf() throws Exception {
        String ck = login("admin", TestDb.ADMIN);
        String body = "{\"codigo\":\"PZ-88\",\"nombre\":\"Plato\",\"tecnica\":\"Cerámica\",\"id_taller\":1,\"precio\":40}";
        assertEquals(403, pedir("POST", "/api/piezas", body, ck, "Origin", "http://sitio-malo.com").status());
        assertEquals(201, pedir("POST", "/api/piezas", body, ck, "Origin", base).status());
    }

    // ---- API de negocio ----
    @Test @DisplayName("flujo de venta: 201, luego 409 al repetir, y el total sale de la base")
    void venta() throws Exception {
        String ck = login("operador", TestDb.OPERADOR);
        String v = "{\"canal\":\"TIENDA\",\"id_cliente\":1,\"items\":[{\"id_pieza\":3,\"cantidad\":1,\"precio\":0.01}]}";
        Resp r = pedir("POST", "/api/ventas", v, ck);
        assertEquals(201, r.status(), r.body());
        assertEquals(250, r.json().get("total").asDouble(), 0.001);
        assertEquals(409, pedir("POST", "/api/ventas", v, ck).status());
    }

    @Test @DisplayName("las respuestas tienen la misma forma que usa el frontend (números, fechas de texto, etapas)")
    void formas() throws Exception {
        String ck = login("admin", TestDb.ADMIN);
        JsonNode piezas = pedir("GET", "/api/piezas", null, ck).json();
        assertEquals(3, piezas.size());
        assertTrue(piezas.get(0).get("precio").isNumber());
        JsonNode prod = pedir("GET", "/api/produccion", null, ck).json().get(0);
        assertEquals("2026-08-20", prod.get("fecha_inicio").asText());
        assertTrue(prod.get("fecha_fin").isNull());
        JsonNode talleres = pedir("GET", "/api/talleres", null, ck).json();
        assertTrue(talleres.get(0).get("etapas").isArray());
        JsonNode dash = pedir("GET", "/api/reportes/dashboard", null, ck).json();
        assertTrue(dash.has("ventasHoy"));
        assertEquals(1, dash.get("insumosBajo").get("n").asInt());
        assertEquals(180, dash.get("ventasTotal").get("total").asDouble(), 0.001);
    }

    @Test @DisplayName("datos inválidos devuelven 400 con mensaje; ruta inexistente 404")
    void errores() throws Exception {
        String ck = login("admin", TestDb.ADMIN);
        Resp r = pedir("POST", "/api/piezas", "{\"codigo\":\"X\",\"nombre\":\"<b>\",\"tecnica\":\"t\",\"id_taller\":1,\"precio\":1}", ck);
        assertEquals(400, r.status());
        assertTrue(r.json().get("error").asText().contains("caracteres no permitidos"));
        assertEquals(404, pedir("GET", "/api/no-existe", null, ck).status());
        assertEquals(404, pedir("DELETE", "/api/piezas/999", null, ck).status());
    }

    @Test @DisplayName("un cuerpo de más de 100 KB se rechaza con 413")
    void cuerpoGrande() throws Exception {
        String ck = login("admin", TestDb.ADMIN);
        String grande = "{\"nombre\":\"" + "a".repeat(110 * 1024) + "\"}";
        assertEquals(413, pedir("POST", "/api/piezas", grande, ck).status());
    }

    @Test @DisplayName("exportación: CSV con BOM y Content-Disposition; Excel como .xlsx")
    void exportacion() throws Exception {
        String ck = login("admin", TestDb.ADMIN);
        Resp csv = pedir("GET", "/api/export/piezas.csv", null, ck);
        assertEquals(200, csv.status());
        assertTrue(csv.body().startsWith("﻿id_pieza"));
        assertTrue(csv.h().firstValue("content-disposition").orElse("").contains("piezas.csv"));
        assertTrue(csv.h().firstValue("content-type").orElse("").startsWith("text/csv"));
        Resp xls = pedir("GET", "/api/export/ventas.xls", null, ck);
        assertEquals(200, xls.status());
        assertEquals("application/vnd.ms-excel", xls.h().firstValue("content-type").orElse(""));
    }

    @Test @DisplayName("importación por la API: el ADMIN importa y los errores traen el detalle por fila")
    void importacion() throws Exception {
        String ck = login("admin", TestDb.ADMIN);
        String ok = JSON.writeValueAsString(java.util.Map.of("csv", "codigo,nombre,tecnica,id_taller,precio\nIM-1,Taza,Cerámica,1,20\n"));
        assertEquals(201, pedir("POST", "/api/import/piezas", ok, ck).status());
        String mal = JSON.writeValueAsString(java.util.Map.of("csv", "codigo,nombre,tecnica,id_taller,precio\nIM-2,<b>,Cerámica,1,20\n"));
        Resp r = pedir("POST", "/api/import/piezas", mal, ck);
        assertEquals(400, r.status());
        assertEquals(2, r.json().get("errores").get(0).get("fila").asInt());
    }

    // ---- seguridad de los estáticos ----
    @Test @DisplayName("cabeceras de seguridad en todas las respuestas")
    void cabeceras() throws Exception {
        Resp r = pedir("GET", "/app.css", null, null);
        assertEquals(200, r.status());
        assertEquals("nosniff", r.h().firstValue("x-content-type-options").orElse(""));
        assertEquals("DENY", r.h().firstValue("x-frame-options").orElse(""));
        assertTrue(r.h().firstValue("content-security-policy").orElse("").contains("script-src 'self'"));
    }

    @Test @DisplayName("las páginas internas redirigen al login sin sesión; login e inicio son públicas")
    void paginas() throws Exception {
        Resp r = pedir("GET", "/ventas.html", null, null);
        assertEquals(302, r.status());
        assertEquals("login.html?next=ventas.html", r.h().firstValue("location").orElse(""));
        assertEquals(200, pedir("GET", "/login.html", null, null).status());
        assertEquals(200, pedir("GET", "/", null, null).status());
        assertEquals(200, pedir("GET", "/ventas.html", null, login("admin", TestDb.ADMIN)).status());
    }

    @Test @DisplayName("el recorrido de rutas (../) se rechaza con 403 y un archivo inexistente da 404")
    void recorrido() throws Exception {
        Files.writeString(publico.getParent().resolve("secreto.txt"), "secreto");
        assertEquals(403, pedir("GET", "/..%2fsecreto.txt", null, null).status());
        assertEquals(403, pedir("GET", "/%2e%2e/secreto.txt", null, null).status());
        assertEquals(404, pedir("GET", "/nada.css", null, null).status());
    }
}
