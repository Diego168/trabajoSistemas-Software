package com.artesanialegado.service;

import com.artesanialegado.dao.UsuarioDao;
import com.artesanialegado.error.AppException;
import com.artesanialegado.security.PasswordHasher;
import com.google.common.base.Ticker;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Autenticación: verificación de clave, bloqueo por intentos fallidos y sesiones con caducidad.
 * Las sesiones y los intentos viven en cachés de Guava con caducidad por escritura, así que se olvidan solos
 * y no crecen sin límite.
 */
public class AuthService {
    public record Sesion(String usuario, String nombre, String rol) { }
    public record Login(String token, Sesion sesion) { }
    private record Fallo(int n) { }

    private static final String GENERICO = "Usuario o contraseña incorrectos";
    private static final Pattern USUARIO = Pattern.compile("^[A-Za-z0-9._-]{3,30}$");

    private final UsuarioDao usuarioDao;
    private final PasswordHasher hasher;
    private final int maxIntentos;
    private final Duration ttl;
    private final Cache<String, Sesion> sesiones;
    private final Cache<String, Fallo> fallos;
    private final String hashFalso;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UsuarioDao usuarioDao, PasswordHasher hasher, Ticker ticker, Duration ttl, int maxIntentos, Duration bloqueo) {
        this.usuarioDao = usuarioDao; this.hasher = hasher; this.ttl = ttl; this.maxIntentos = maxIntentos;
        this.sesiones = CacheBuilder.newBuilder().ticker(ticker).expireAfterWrite(ttl).maximumSize(10_000).build();
        this.fallos = CacheBuilder.newBuilder().ticker(ticker).expireAfterWrite(bloqueo).maximumSize(10_000).build();
        this.hashFalso = hasher.hash("clave-inexistente");   // iguala el tiempo de respuesta cuando el usuario no existe
    }

    public AuthService(UsuarioDao usuarioDao, PasswordHasher hasher) {
        this(usuarioDao, hasher, Ticker.systemTicker(), Duration.ofHours(8), 5, Duration.ofMinutes(5));
    }

    public Login login(Object usuario, Object clave, String ip) {
        if (!(usuario instanceof String u0) || !USUARIO.matcher(u0).matches()) throw new AppException.Validation("Ingresa un usuario válido");
        if (!(clave instanceof String c) || c.isEmpty() || c.length() > 100) throw new AppException.Validation("Ingresa tu contraseña");
        String u = u0.toLowerCase(Locale.ROOT);
        String llave = u + "|" + ip;
        Fallo f = fallos.getIfPresent(llave);
        if (f != null && f.n() >= maxIntentos) throw new AppException.TooManyRequests("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
        Map<String, Object> fila = usuarioDao.findByUsuario(u);
        boolean ok = hasher.verificar(c, fila != null ? (String) fila.get("clave_hash") : hashFalso) && fila != null && Boolean.TRUE.equals(fila.get("activo"));
        if (!ok) {
            fallos.put(llave, new Fallo((f == null ? 0 : f.n()) + 1));
            throw new AppException.Unauthorized(GENERICO);
        }
        fallos.invalidate(llave);
        byte[] raw = new byte[32];
        random.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        Sesion s = new Sesion((String) fila.get("usuario"), (String) fila.get("nombre"), (String) fila.get("rol"));
        sesiones.put(token, s);
        return new Login(token, s);
    }

    /** Sesión vigente del token o null. */
    public Sesion sesion(String token) { return token == null ? null : sesiones.getIfPresent(token); }

    public void logout(String token) { if (token != null) sesiones.invalidate(token); }

    public long maxAgeSeg() { return ttl.toSeconds(); }

    /**
     * Completa la demostración hasta {@code total} usuarios: operador01, consulta01, operador02... con las mismas claves
     * que operador y consulta. Los hashes se calculan en paralelo (cada uno con su propia sal).
     */
    public int sembrarDemo(int total) {
        long existentes = usuarioDao.count();
        int faltan = (int) Math.max(0, total - existentes);
        if (faltan == 0) return 0;
        record Nuevo(String usuario, String nombre, String rol, String clave) { }
        List<Nuevo> lista = new ArrayList<>();
        for (int i = 0; i < faltan; i++) {
            int n = i / 2 + 1;
            boolean operador = i % 2 == 0;
            lista.add(operador ? new Nuevo(String.format("operador%02d", n), "Operador de tienda " + n, "OPERADOR", "Operador#2026")
                    : new Nuevo(String.format("consulta%02d", n), "Solo consulta " + n, "CONSULTA", "Consulta#2026"));
        }
        List<String> hashes = lista.parallelStream().map(u -> hasher.hash(u.clave())).toList();
        for (int i = 0; i < lista.size(); i++) usuarioDao.insert(lista.get(i).usuario(), lista.get(i).nombre(), hashes.get(i), lista.get(i).rol());
        return faltan;
    }

    /** Crea el administrador inicial solo si no hay usuarios. Con demo=true agrega operador y consulta (solo para clase). */
    public boolean sembrar(String claveAdmin, boolean demo) {
        if (usuarioDao.count() > 0) return false;
        usuarioDao.insert("admin", "Administrador", hasher.hash(claveAdmin), "ADMIN");
        if (demo) {
            usuarioDao.insert("operador", "Operador de tienda", hasher.hash("Operador#2026"), "OPERADOR");
            usuarioDao.insert("consulta", "Solo consulta", hasher.hash("Consulta#2026"), "CONSULTA");
        }
        return true;
    }
}
