package com.artesanialegado.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.artesanialegado.Container;
import com.artesanialegado.TestDb;
import com.artesanialegado.config.Database;
import com.artesanialegado.error.AppException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Servicios + DAO reales sobre H2 en memoria (datos de demostración: piezas 1 y 3 disponibles, 2 en producción). */
class ServiciosTest {
    Database db;
    Container c;

    @BeforeEach
    void preparar() { db = TestDb.nueva(); c = TestDb.contenedor(db); }

    private static Map<String, Object> venta(int idPieza, int cant) {
        return Map.of("canal", "TIENDA", "id_cliente", 1, "items", List.of(Map.of("id_pieza", idPieza, "cantidad", cant)));
    }

    // ---------------- Ventas ----------------
    @Test @DisplayName("la venta toma el precio de la base, marca la pieza VENDIDA y guarda el detalle")
    void ventaOk() {
        Map<String, Object> r = c.ventas().registrarVenta(Map.of("canal", "FERIA", "items", List.of(Map.of("id_pieza", 1, "cantidad", 1, "precio", 1))));
        assertEquals(0, new BigDecimal("180").compareTo((BigDecimal) r.get("total")));   // el precio 1 enviado se ignora
        assertEquals("VENDIDA", c.ventas().catalogo().stream().filter(p -> p.get("id_pieza").equals(1)).findFirst().orElseThrow().get("estado"));
        assertEquals(2L, ((Number) db.get("SELECT COUNT(*) AS n FROM venta").get("n")).longValue());
    }

    @Test @DisplayName("una pieza vendida no se puede vender otra vez (409) y una inexistente da 404")
    void ventaConflicto() {
        c.ventas().registrarVenta(venta(1, 1));
        assertEquals(409, assertThrows(AppException.class, () -> c.ventas().registrarVenta(venta(1, 1))).status());
        assertEquals(409, assertThrows(AppException.class, () -> c.ventas().registrarVenta(venta(2, 1))).status());   // en producción
        assertEquals(404, assertThrows(AppException.class, () -> c.ventas().registrarVenta(venta(99, 1))).status());
    }

    @Test @DisplayName("si una línea falla, la transacción se deshace y no queda nada a medias")
    void ventaAtomica() {
        Map<String, Object> body = Map.of("canal", "TIENDA", "items", List.of(Map.of("id_pieza", 1, "cantidad", 1), Map.of("id_pieza", 2, "cantidad", 1)));
        assertThrows(AppException.class, () -> c.ventas().registrarVenta(body));
        assertEquals(1L, ((Number) db.get("SELECT COUNT(*) AS n FROM venta").get("n")).longValue());
        assertEquals("DISPONIBLE", db.get("SELECT estado FROM pieza WHERE id_pieza=1").get("estado"));
    }

    @Test @DisplayName("CRUD de piezas: código único (409), actualizar y eliminar")
    void piezas() {
        Map<String, Object> nueva = Map.of("codigo", "PZ-100", "nombre", "Plato", "tecnica", "Cerámica", "id_taller", 1, "precio", 50);
        Map<String, Object> p = c.ventas().crearPieza(nueva);
        assertEquals("PZ-100", p.get("codigo"));
        assertEquals(409, assertThrows(AppException.class, () -> c.ventas().crearPieza(nueva)).status());
        Map<String, Object> act = c.ventas().actualizarPieza(p.get("id_pieza"), Map.of("codigo", "PZ-100", "nombre", "Plato grande", "tecnica", "Cerámica", "id_taller", 1, "precio", 60));
        assertEquals("Plato grande", act.get("nombre"));
        assertEquals(Map.of("ok", true), c.ventas().eliminarPieza(p.get("id_pieza")));
        assertEquals(404, assertThrows(AppException.class, () -> c.ventas().eliminarPieza(p.get("id_pieza"))).status());
        assertEquals(409, assertThrows(AppException.class, () -> c.ventas().crearPieza(Map.of("codigo", "X", "nombre", "x", "tecnica", "t", "id_taller", 99, "precio", 1))).status());
    }

    // ---------------- Logística ----------------
    @Test @DisplayName("insumos: entradas suman stock y las alertas muestran los que están en el mínimo o debajo")
    void insumos() {
        assertEquals(1, c.insumos().alertasStockBajo().size());   // madera de cedro: 15 <= 20
        Map<String, Object> r = c.insumos().registrarEntrada(Map.of("id_insumo", 2, "cantidad", 10));
        assertEquals(0, new BigDecimal("25").compareTo((BigDecimal) r.get("stock")));
        assertTrue(c.insumos().alertasStockBajo().isEmpty());
        assertEquals(404, assertThrows(AppException.class, () -> c.insumos().registrarEntrada(Map.of("id_insumo", 99, "cantidad", 1))).status());
        assertThrows(AppException.Validation.class, () -> c.insumos().registrarEntrada(Map.of("id_insumo", 1, "cantidad", 0)));
    }

    @Test @DisplayName("insumos: crear, actualizar y eliminar")
    void insumosCrud() {
        Map<String, Object> i = c.insumos().crear(Map.of("nombre", "Barniz", "categoria", "Acabado", "unidad", "lt", "stock", 5, "id_taller", 2));
        assertEquals("Barniz", i.get("nombre"));
        assertEquals("Barniz mate", c.insumos().actualizar(i.get("id_insumo"), Map.of("nombre", "Barniz mate", "categoria", "Acabado", "unidad", "lt", "id_taller", 2)).get("nombre"));
        c.insumos().eliminar(i.get("id_insumo"));
        assertEquals(404, assertThrows(AppException.class, () -> c.insumos().eliminar(i.get("id_insumo"))).status());
    }

    // ---------------- Producción por taller ----------------
    @Test @DisplayName("la etapa por defecto depende del taller y debe pertenecer a su proceso")
    void produccionEtapas() {
        Map<String, Object> r = c.produccion().crear(Map.of("id_pieza", 1, "id_artesano", 1));
        assertEquals("MODELADO", r.get("etapa"));
        AppException e = assertThrows(AppException.Validation.class, () -> c.produccion().crear(Map.of("id_pieza", 1, "id_artesano", 1, "etapa", "TEJIDO")));
        assertTrue(e.getMessage().contains("no corresponde"));
        assertEquals("TEJIDO", c.produccion().crear(Map.of("id_pieza", 3, "id_artesano", 3)).get("etapa"));
    }

    @Test @DisplayName("pieza y artesano deben ser del mismo taller (409)")
    void produccionMismoTaller() {
        assertEquals(409, assertThrows(AppException.class, () -> c.produccion().crear(Map.of("id_pieza", 1, "id_artesano", 2))).status());
        assertEquals(404, assertThrows(AppException.class, () -> c.produccion().crear(Map.of("id_pieza", 99, "id_artesano", 1))).status());
    }

    @Test @DisplayName("avanzar recorre las etapas del taller y al final deja la pieza DISPONIBLE")
    void produccionAvanza() {
        // registro 1: banco de cedro (ebanistería) en TALLADO → ACABADO → finaliza
        assertEquals("ACABADO", c.produccion().avanzarEtapa(Map.of("id_produccion", 1)).get("etapa"));
        Map<String, Object> fin = c.produccion().avanzarEtapa(Map.of("id_produccion", 1));
        assertEquals(true, fin.get("finalizado"));
        assertEquals("DISPONIBLE", db.get("SELECT estado FROM pieza WHERE id_pieza=2").get("estado"));
        assertTrue(db.get("SELECT fecha_fin FROM produccion_pieza WHERE id_produccion=1").get("fecha_fin") != null);
        assertEquals(404, assertThrows(AppException.class, () -> c.produccion().avanzarEtapa(Map.of("id_produccion", 99))).status());
    }

    // ---------------- Encargos y fidelización ----------------
    @Test @DisplayName("entregar un encargo suma 50 puntos una sola vez")
    void encargoEntrega() {
        c.encargos().entregar(Map.of("id_encargo", 1));
        c.encargos().entregar(Map.of("id_encargo", 1));   // repetir no vuelve a sumar
        assertEquals(1030, ((Number) db.get("SELECT puntos_fidelizacion AS p FROM cliente WHERE id_cliente=1").get("p")).intValue());
        assertEquals("ENTREGADO", db.get("SELECT estado FROM encargo WHERE id_encargo=1").get("estado"));
        assertEquals(404, assertThrows(AppException.class, () -> c.encargos().entregar(Map.of("id_encargo", 99))).status());
    }

    @Test @DisplayName("encargos: registrar, listar con nombres, actualizar y eliminar")
    void encargoCrud() {
        Map<String, Object> r = c.encargos().registrar(Map.of("id_cliente", 2, "id_taller", 1, "descripcion", "Juego de tazas", "fecha_entrega", "2026-12-01"));
        Object id = r.get("id_encargo");
        Map<String, Object> primero = c.encargos().listar().get(0);
        assertEquals("Decoraciones Lima S.A.C.", primero.get("cliente"));
        assertEquals("2026-12-01", primero.get("fecha_entrega"));
        c.encargos().actualizar(id, Map.of("id_cliente", 2, "id_taller", 1, "descripcion", "Juego de 6 tazas", "estado", "EN_PRODUCCION"));
        assertEquals("EN_PRODUCCION", c.encargos().listar().get(0).get("estado"));
        c.encargos().eliminar(id);
        assertEquals(404, assertThrows(AppException.class, () -> c.encargos().eliminar(id)).status());
    }

    // ---------------- Mantenimientos ----------------
    @Test @DisplayName("clientes: documento único (409), los puntos no se editan y no se borra con registros asociados")
    void clientes() {
        Map<String, Object> cl = c.clientes().crear(Map.of("nombre", "Luis Vega", "documento", "70123456", "tipo", "MAYORISTA"));
        assertEquals(0, ((Number) cl.get("puntos_fidelizacion")).intValue());
        assertEquals(409, assertThrows(AppException.class, () -> c.clientes().crear(Map.of("nombre", "Otro", "documento", "70123456"))).status());
        c.clientes().actualizar(cl.get("id_cliente"), Map.of("nombre", "Luis Vega R.", "documento", "70123456", "tipo", "MAYORISTA", "puntos_fidelizacion", 9999));
        assertEquals(0, ((Number) c.clientes().actualizar(cl.get("id_cliente"), Map.of("nombre", "Luis", "documento", "70123456")).get("puntos_fidelizacion")).intValue());
        AppException e = assertThrows(AppException.Conflict.class, () -> c.clientes().eliminar(1));   // tiene venta y encargo
        assertTrue(e.getMessage().contains("registros asociados"));
        assertEquals(Map.of("ok", true), c.clientes().eliminar(cl.get("id_cliente")));
        assertEquals(404, assertThrows(AppException.class, () -> c.clientes().eliminar(cl.get("id_cliente"))).status());
    }

    @Test @DisplayName("artesanos y proveedores: alta, cambio y baja; con registros asociados no se borran")
    void artesanosProveedores() {
        Map<String, Object> a = c.artesanos().crear(Map.of("nombre", "Luz Paredes", "especialidad", "Alfarera", "id_taller", 1));
        assertEquals("Taller de Cerámica", a.get("taller"));
        assertEquals(Map.of("ok", true), c.artesanos().eliminar(a.get("id_artesano")));
        assertEquals(409, assertThrows(AppException.class, () -> c.artesanos().eliminar(2)).status());   // tiene producción y encargo
        Map<String, Object> p = c.proveedores().crear(Map.of("nombre", "Pinturas Sur", "tipo_insumo", "Pigmentos"));
        assertEquals("Pinturas Sur", c.proveedores().actualizar(p.get("id_proveedor"), Map.of("nombre", "Pinturas Sur", "tipo_insumo", "Pigmentos", "contacto", "999 888 777")).get("nombre"));
        assertEquals(409, assertThrows(AppException.class, () -> c.proveedores().eliminar(1)).status());   // tiene insumos
    }

    // ---------------- Reportes y catálogo ----------------
    @Test @DisplayName("dashboard: totales, piezas por estado y ventas por técnica")
    void dashboard() {
        Map<String, Object> d = c.reportes().dashboard();
        assertEquals(1L, ((Number) ((Map<?, ?>) d.get("ventasTotal")).get("n")).longValue());
        // el frontend lee insumosBajo.n: la forma de la respuesta es parte del contrato con la vista
        assertEquals(1L, ((Number) ((Map<?, ?>) d.get("insumosBajo")).get("n")).longValue());
        assertEquals(2, ((List<?>) d.get("piezasPorEstado")).size());
        assertEquals("Cerámica", ((Map<?, ?>) ((List<?>) d.get("ventasPorTecnica")).get(0)).get("tecnica"));
    }

    @Test @DisplayName("ventas por periodo: filtra por fechas y tolera fechas inválidas")
    void periodo() {
        assertEquals(1, c.reportes().ventasPorPeriodo("2026-08-01", "2026-08-31").size());
        assertEquals(0, c.reportes().ventasPorPeriodo("2026-09-01", "2026-09-30").size());
        assertEquals(1, c.reportes().ventasPorPeriodo("no-fecha", "2026-02-31").size());
        assertEquals(3, c.reportes().produccionPorTaller().size());
    }

    @Test @DisplayName("el catálogo de talleres incluye las etapas de cada uno")
    void talleres() {
        List<Map<String, Object>> t = c.catalogo().talleres();
        Map<String, Object> ceramica = t.stream().filter(x -> x.get("nombre").equals("Taller de Cerámica")).findFirst().orElseThrow();
        assertEquals(List.of("MODELADO", "SECADO", "COCCION", "ACABADO"), ceramica.get("etapas"));
        assertEquals(2, c.catalogo().clientes().size());
    }

    // ---------------- Importación y exportación ----------------
    @Test @DisplayName("importar piezas: todo o nada con detalle por fila")
    void importar() {
        String malo = "codigo,nombre,tecnica,id_taller,precio\nIM-1,Taza,Cerámica,1,20\nIM-2,<b>,Cerámica,1,20\nIM-3,Vaso,Cerámica,1,-3\n";
        AppException.Validation e = assertThrows(AppException.Validation.class, () -> c.archivos().importar("piezas", malo));
        assertEquals(2, e.details().size());
        assertEquals(3, e.details().get(0).get("fila"));
        assertEquals(3, c.ventas().catalogo().size());   // no se importó nada
        String bueno = "codigo,nombre,tecnica,id_taller,precio\nIM-1,Taza,Cerámica,1,20\nIM-2,Vaso,Cerámica,1,15.5\n";
        assertEquals(2, c.archivos().importar("piezas", bueno).get("importadas"));
        assertEquals(5, c.ventas().catalogo().size());
    }

    @Test @DisplayName("importar valida columnas, vacío, límite de 500 filas y entidades no importables")
    void importarLimites() {
        assertTrue(assertThrows(AppException.Validation.class, () -> c.archivos().importar("piezas", "codigo,nombre\nA,B\n")).getMessage().startsWith("Faltan columnas"));
        assertThrows(AppException.Validation.class, () -> c.archivos().importar("piezas", "  "));
        assertThrows(AppException.Validation.class, () -> c.archivos().importar("piezas", null));
        assertThrows(AppException.Validation.class, () -> c.archivos().importar("ventas", "a\n1"));
        StringBuilder sb = new StringBuilder("nombre,categoria,unidad,id_taller\n");
        for (int i = 0; i < 501; i++) sb.append("I").append(i).append(",c,kg,1\n");
        assertTrue(assertThrows(AppException.Validation.class, () -> c.archivos().importar("insumos", sb.toString())).getMessage().contains("500"));
        assertEquals(1, c.archivos().importar("insumos", "nombre,categoria,unidad,id_taller\nCal,Mineral,kg,1\n").get("importadas"));
    }

    @Test @DisplayName("exportar CSV lleva BOM y datos; la plantilla solo la cabecera; Excel genera archivo")
    void exportar() {
        var csv = c.archivos().exportarCsv("piezas");
        String t = new String(csv.bytes(), java.nio.charset.StandardCharsets.UTF_8);
        assertTrue(t.startsWith("﻿id_pieza,codigo,nombre"));
        assertTrue(t.contains("Jarrón Sol Andino"));
        assertEquals("piezas.csv", csv.filename());
        assertEquals("plantilla_piezas.csv", c.archivos().plantilla("piezas").filename());
        assertThrows(AppException.Validation.class, () -> c.archivos().plantilla("ventas"));
        assertThrows(AppException.Validation.class, () -> c.archivos().exportarCsv("usuarios"));
        assertTrue(c.archivos().exportarExcel("ventas", "xls").bytes().length > 1000);
        assertEquals("ventas.xls", c.archivos().exportarExcel("ventas", "xls").filename());
    }
}
