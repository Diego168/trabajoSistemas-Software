package com.artesanialegado.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.artesanialegado.TestDb;
import com.artesanialegado.dao.UsuarioDao;
import com.artesanialegado.error.AppException;
import com.artesanialegado.logging.EventLogger;
import com.artesanialegado.security.PasswordHasher;
import com.artesanialegado.security.Permisos;
import com.artesanialegado.service.AuthService;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SeguridadTest {

    // ---------------- PasswordHasher ----------------
    @Test @DisplayName("la clave se guarda con PBKDF2 y sal: nunca en claro y distinta cada vez")
    void hashConSal() {
        PasswordHasher h = new PasswordHasher(1000);
        String a = h.hash("Clave#123"), b = h.hash("Clave#123");
        assertTrue(a.startsWith("pbkdf2$1000$"));
        assertFalse(a.contains("Clave#123"));
        assertNotEquals(a, b);
    }

    @Test @DisplayName("verifica la clave correcta y rechaza la incorrecta o un hash dañado")
    void verifica() {
        PasswordHasher h = new PasswordHasher(1000);
        String g = h.hash("Clave#123");
        assertTrue(h.verificar("Clave#123", g));
        assertFalse(h.verificar("otra", g));
        assertFalse(h.verificar("Clave#123", "texto-que-no-es-un-hash"));
        assertFalse(h.verificar("Clave#123", null));
    }

    // ---------------- Permisos (RBAC) ----------------
    @Test @DisplayName("ADMIN puede todo")
    void admin() {
        assertTrue(Permisos.permitido("ADMIN", "DELETE", "/api/piezas/1"));
        assertTrue(Permisos.permitido("ADMIN", "POST", "/api/import/piezas"));
    }

    @Test @DisplayName("OPERADOR lee y registra, pero no borra ni importa")
    void operador() {
        assertTrue(Permisos.permitido("OPERADOR", "GET", "/api/piezas"));
        assertTrue(Permisos.permitido("OPERADOR", "POST", "/api/ventas"));
        assertFalse(Permisos.permitido("OPERADOR", "DELETE", "/api/piezas/1"));
        assertFalse(Permisos.permitido("OPERADOR", "POST", "/api/import/piezas"));
    }

    @Test @DisplayName("CONSULTA solo lee; un rol desconocido no puede nada")
    void consulta() {
        assertTrue(Permisos.permitido("CONSULTA", "GET", "/api/reportes/dashboard"));
        assertFalse(Permisos.permitido("CONSULTA", "POST", "/api/ventas"));
        assertFalse(Permisos.permitido("INVITADO", "GET", "/api/piezas"));
        assertFalse(Permisos.permitido(null, "GET", "/api/piezas"));
    }

    // ---------------- Registro de eventos ----------------
    @Test @DisplayName("el logger oculta authorization, token, password, clave y secret")
    void loggerOculta() {
        String linea = EventLogger.linea("INFO", "x", Map.of("password", "123", "clave", "abc", "Token", "t", "secret", "s", "usuario", "ana"));
        for (String clave : List.of("password", "clave", "Token", "secret")) assertTrue(linea.contains("\"" + clave + "\":\"***\""), clave);
        assertFalse(linea.contains("\"123\"") || linea.contains("\"abc\""));
        assertTrue(linea.contains("\"usuario\":\"ana\""));
        assertTrue(linea.contains("***"));
        assertTrue(linea.startsWith("{\"ts\":"));
    }

    // ---------------- AuthService con un DAO simulado (sustitución de Liskov) ----------------
    /** DAO en memoria: prueba el servicio sin base de datos. */
    static class UsuariosEnMemoria implements UsuarioDao {
        final Map<String, Map<String, Object>> filas = new HashMap<>();
        @Override public Map<String, Object> findByUsuario(String u) { return filas.get(u); }
        @Override public long count() { return filas.size(); }
        @Override public void insert(String u, String n, String h, String r) {
            filas.put(u, new HashMap<>(Map.of("usuario", u, "nombre", n, "clave_hash", h, "rol", r, "activo", true)));
        }
    }

    UsuariosEnMemoria dao;
    TestDb.Reloj reloj;
    AuthService auth;

    @BeforeEach
    void preparar() {
        dao = new UsuariosEnMemoria();
        reloj = new TestDb.Reloj();
        auth = new AuthService(dao, new PasswordHasher(1000), reloj, Duration.ofHours(8), 5, Duration.ofMinutes(5));
        auth.sembrar("Admin#2026", true);
    }

    @Test @DisplayName("sembrar crea admin, operador y consulta solo si no hay usuarios")
    void sembrar() {
        assertEquals(3, dao.count());
        assertFalse(auth.sembrar("otra", true));
        assertEquals(3, dao.count());
    }

    @Test @DisplayName("login correcto devuelve un token y la sesión con su rol")
    void loginOk() {
        AuthService.Login l = auth.login("admin", "Admin#2026", "1.1.1.1");
        assertEquals("ADMIN", l.sesion().rol());
        assertEquals("ADMIN", auth.sesion(l.token()).rol());
        assertTrue(l.token().length() >= 40);
    }

    @Test @DisplayName("el mensaje de error no revela si el usuario existe")
    void mensajeGenerico() {
        AppException a = assertThrows(AppException.Unauthorized.class, () -> auth.login("admin", "mala", "ip"));
        AppException b = assertThrows(AppException.Unauthorized.class, () -> auth.login("noexiste", "mala", "ip"));
        assertEquals(a.getMessage(), b.getMessage());
    }

    @Test @DisplayName("entradas inválidas se rechazan con 400")
    void validacion() {
        assertThrows(AppException.Validation.class, () -> auth.login("a'; --", "x", "ip"));
        assertThrows(AppException.Validation.class, () -> auth.login("admin", "", "ip"));
        assertThrows(AppException.Validation.class, () -> auth.login(null, "x", "ip"));
        assertThrows(AppException.Validation.class, () -> auth.login("admin", 123, "ip"));
    }

    @Test @DisplayName("tras 5 fallos se bloquea (429) incluso con la clave correcta, y se libera con el tiempo")
    void bloqueo() {
        for (int i = 0; i < 5; i++) assertThrows(AppException.Unauthorized.class, () -> auth.login("admin", "mala", "9.9.9.9"));
        AppException e = assertThrows(AppException.TooManyRequests.class, () -> auth.login("admin", "Admin#2026", "9.9.9.9"));
        assertEquals(429, e.status());
        assertEquals("ADMIN", auth.login("admin", "Admin#2026", "8.8.8.8").sesion().rol());   // otra IP no se ve afectada
        reloj.avanzar(Duration.ofMinutes(6));
        assertEquals("ADMIN", auth.login("admin", "Admin#2026", "9.9.9.9").sesion().rol());
    }

    @Test @DisplayName("los intentos fallidos antiguos se olvidan solos")
    void olvidaFallos() {
        for (int i = 0; i < 4; i++) assertThrows(AppException.Unauthorized.class, () -> auth.login("admin", "mala", "ip"));
        reloj.avanzar(Duration.ofMinutes(6));
        assertThrows(AppException.Unauthorized.class, () -> auth.login("admin", "mala", "ip"));   // vuelve a contar desde 1: no bloquea
        assertEquals("ADMIN", auth.login("admin", "Admin#2026", "ip").sesion().rol());
    }

    @Test @DisplayName("la sesión caduca a las 8 horas y se cierra con logout")
    void caducidad() {
        String t = auth.login("admin", "Admin#2026", "ip").token();
        reloj.avanzar(Duration.ofHours(7));
        assertEquals("ADMIN", auth.sesion(t).rol());
        reloj.avanzar(Duration.ofHours(2));
        assertEquals(null, auth.sesion(t));
        String t2 = auth.login("admin", "Admin#2026", "ip").token();
        auth.logout(t2);
        assertEquals(null, auth.sesion(t2));
        assertEquals(28800, auth.maxAgeSeg());
    }

    @Test @DisplayName("un usuario inactivo no puede entrar")
    void inactivo() {
        dao.filas.get("operador").put("activo", false);
        assertThrows(AppException.Unauthorized.class, () -> auth.login("operador", "Operador#2026", "ip"));
    }
}
