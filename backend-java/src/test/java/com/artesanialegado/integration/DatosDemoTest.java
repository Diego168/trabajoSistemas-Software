package com.artesanialegado.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.artesanialegado.Container;
import com.artesanialegado.config.Database;
import com.artesanialegado.config.SchemaInitializer;
import com.artesanialegado.dao.JdbcUsuarioDao;
import com.artesanialegado.domain.Etapas;
import com.artesanialegado.error.AppException;
import com.artesanialegado.security.PasswordHasher;
import com.artesanialegado.service.AuthService;
import com.google.common.base.Ticker;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/** Los datos de demostración deben tener al menos 50 filas por tabla y respetar las reglas del negocio. */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DatosDemoTest {
    Database db;
    Container c;
    AuthService auth;

    @BeforeAll
    void preparar() {
        db = Database.open("jdbc:h2:mem:" + UUID.randomUUID() + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1", "sa", "");
        SchemaInitializer.init(db, SchemaInitializer.Datos.DEMO);
        auth = new AuthService(new JdbcUsuarioDao(db), new PasswordHasher(1000), Ticker.systemTicker(), Duration.ofHours(8), 5, Duration.ofMinutes(5));
        auth.sembrar("Admin#2026", true);
        auth.sembrarDemo(50);
        c = Container.build(db, auth);
    }

    private long n(String sql) { return ((Number) db.get(sql).get("n")).longValue(); }

    @Test @DisplayName("las tablas tienen al menos 50 filas (taller: 3 talleres con 20 artesanos cada uno)")
    void cincuentaPorTabla() {
        for (String t : List.of("proveedor", "artesano", "insumo", "pieza", "produccion_pieza", "cliente", "venta", "venta_detalle", "encargo", "usuario"))
            assertTrue(n("SELECT COUNT(*) AS n FROM " + t) >= 50, t + " tiene menos de 50 filas");
        assertEquals(3, n("SELECT COUNT(*) AS n FROM taller"));
        assertEquals(20, n("SELECT MIN(c) AS n FROM (SELECT COUNT(*) AS c FROM artesano GROUP BY id_taller) x"));
    }

    @Test @DisplayName("sembrarDemo es idempotente y los usuarios generados pueden iniciar sesión")
    void usuarios() {
        assertEquals(0, auth.sembrarDemo(50));
        assertEquals("OPERADOR", auth.login("operador24", "Operador#2026", "ip").sesion().rol());
        assertEquals("CONSULTA", auth.login("consulta23", "Consulta#2026", "ip").sesion().rol());
    }

    @Test @DisplayName("cada venta suma exactamente su detalle y cada pieza vendida está en una sola venta")
    void ventasCoherentes() {
        assertEquals(0, n("SELECT COUNT(*) AS n FROM venta v WHERE v.total <> (SELECT SUM(d.cantidad*d.precio) FROM venta_detalle d WHERE d.id_venta=v.id_venta)"));
        assertEquals(0, n("SELECT COUNT(*) AS n FROM venta v WHERE NOT EXISTS (SELECT 1 FROM venta_detalle d WHERE d.id_venta=v.id_venta)"));
        assertEquals(0, n("SELECT COUNT(*) AS n FROM venta_detalle d JOIN pieza p ON p.id_pieza=d.id_pieza WHERE p.estado <> 'VENDIDA' OR d.precio <> p.precio"));
        assertEquals(0, n("SELECT COUNT(*) AS n FROM pieza p WHERE p.estado='VENDIDA' AND (SELECT COUNT(*) FROM venta_detalle d WHERE d.id_pieza=p.id_pieza) <> 1"));
    }

    @Test @DisplayName("producción: artesano y pieza del mismo taller, etapa del proceso del taller y estados coherentes")
    void produccionCoherente() {
        assertEquals(0, n("SELECT COUNT(*) AS n FROM produccion_pieza pp JOIN pieza p ON p.id_pieza=pp.id_pieza JOIN artesano a ON a.id_artesano=pp.id_artesano WHERE a.id_taller <> p.id_taller"));
        for (Map<String, Object> r : c.produccion().listar()) {
            List<String> etapas = Etapas.deTaller((String) r.get("tecnica_taller"));
            assertTrue(etapas.contains(r.get("etapa")), "etapa inválida " + r);
            boolean cerrada = r.get("fecha_fin") != null;
            if (cerrada) assertEquals(etapas.get(etapas.size() - 1), r.get("etapa"));
        }
        assertEquals(0, n("SELECT COUNT(*) AS n FROM produccion_pieza pp JOIN pieza p ON p.id_pieza=pp.id_pieza WHERE (pp.fecha_fin IS NULL) <> (p.estado='EN_PRODUCCION')"));
        assertEquals(0, n("SELECT COUNT(*) AS n FROM pieza p WHERE p.estado='EN_PRODUCCION' AND NOT EXISTS (SELECT 1 FROM produccion_pieza pp WHERE pp.id_pieza=p.id_pieza)"));
    }

    @Test @DisplayName("encargos: el artesano pertenece al taller del encargo y los puntos cubren las entregas")
    void encargosCoherentes() {
        assertEquals(0, n("SELECT COUNT(*) AS n FROM encargo e JOIN artesano a ON a.id_artesano=e.id_artesano WHERE a.id_taller <> e.id_taller"));
        assertEquals(0, n("SELECT COUNT(*) AS n FROM cliente c WHERE c.puntos_fidelizacion < 50*(SELECT COUNT(*) FROM encargo e WHERE e.id_cliente=c.id_cliente AND e.estado='ENTREGADO')"));
    }

    @Test @DisplayName("todos los talleres tienen artesano y los datos usan los contratos del frontend")
    void talleresYContrato() {
        assertEquals(0, n("SELECT COUNT(*) AS n FROM taller t WHERE NOT EXISTS (SELECT 1 FROM artesano a WHERE a.id_taller=t.id_taller)"));
        assertEquals(3, c.catalogo().talleres().size());
        assertTrue(((Number) ((Map<?, ?>) c.reportes().dashboard().get("insumosBajo")).get("n")).intValue() > 0);
        assertTrue(c.insumos().alertasStockBajo().size() >= 10);
    }

    @Test @DisplayName("el sistema funciona sobre estos datos: vender una pieza disponible y avanzar una producción en curso")
    void operaSobreDatos() {
        Map<String, Object> disponible = c.ventas().catalogo().stream().filter(p -> "DISPONIBLE".equals(p.get("estado"))).findFirst().orElseThrow();
        Map<String, Object> venta = c.ventas().registrarVenta(Map.of("canal", "TIENDA", "items", List.of(Map.of("id_pieza", disponible.get("id_pieza"), "cantidad", 1))));
        assertEquals(0, ((java.math.BigDecimal) disponible.get("precio")).compareTo((java.math.BigDecimal) venta.get("total")));
        assertEquals(409, org.junit.jupiter.api.Assertions.assertThrows(AppException.class,
                () -> c.ventas().registrarVenta(Map.of("canal", "TIENDA", "items", List.of(Map.of("id_pieza", disponible.get("id_pieza"), "cantidad", 1))))).status());
        Map<String, Object> enCurso = c.produccion().listar().stream().filter(r -> r.get("fecha_fin") == null).findFirst().orElseThrow();
        Map<String, Object> av = c.produccion().avanzarEtapa(Map.of("id_produccion", enCurso.get("id_produccion")));
        assertTrue(!av.get("etapa").equals(enCurso.get("etapa")) || Boolean.TRUE.equals(av.get("finalizado")));
    }
}
