package com.artesanialegado.web;

import static com.artesanialegado.web.Route.created;
import static com.artesanialegado.web.Route.of;
import static com.artesanialegado.web.Route.ok;

import com.artesanialegado.Container;
import com.artesanialegado.service.Mantenimiento;
import java.util.ArrayList;
import java.util.List;

/**
 * Controladores (C de MVC). Cada uno traduce rutas HTTP a llamadas de servicio:
 * no tienen lógica de negocio ni SQL. Hay uno por área, así cada área solo conoce lo que usa (segregación de interfaces).
 */
public final class Controllers {
    private Controllers() { }

    public static List<Route> todos(Container c) {
        List<Route> r = new ArrayList<>();
        r.addAll(ventas(c));
        r.addAll(logistica(c));
        r.addAll(produccion(c));
        r.addAll(encargos(c));
        r.addAll(direccion(c));
        r.addAll(catalogo(c));
        r.addAll(maestro("clientes", c.clientes()));
        r.addAll(maestro("artesanos", c.artesanos()));
        r.addAll(maestro("proveedores", c.proveedores()));
        r.addAll(archivos(c));
        return r;
    }

    static List<Route> ventas(Container c) {
        var s = c.ventas();
        return List.of(
                of("GET", "/api/piezas", x -> ok(s.catalogo())),
                of("POST", "/api/piezas", x -> created(s.crearPieza(x.body()))),
                of("PUT", "/api/piezas/:id", x -> ok(s.actualizarPieza(x.params().get(0), x.body()))),
                of("DELETE", "/api/piezas/:id", x -> ok(s.eliminarPieza(x.params().get(0)))),
                of("POST", "/api/ventas", x -> created(s.registrarVenta(x.body()))));
    }

    static List<Route> logistica(Container c) {
        var s = c.insumos();
        return List.of(
                of("GET", "/api/insumos", x -> ok(s.listar())),
                of("GET", "/api/insumos/alertas", x -> ok(s.alertasStockBajo())),
                of("POST", "/api/insumos", x -> created(s.crear(x.body()))),
                of("POST", "/api/insumos/entrada", x -> ok(s.registrarEntrada(x.body()))),
                of("PUT", "/api/insumos/:id", x -> ok(s.actualizar(x.params().get(0), x.body()))),
                of("DELETE", "/api/insumos/:id", x -> ok(s.eliminar(x.params().get(0)))));
    }

    static List<Route> produccion(Container c) {
        var s = c.produccion();
        return List.of(
                of("GET", "/api/produccion", x -> ok(s.listar())),
                of("POST", "/api/produccion", x -> created(s.crear(x.body()))),
                of("POST", "/api/produccion/avanzar", x -> ok(s.avanzarEtapa(x.body()))),
                of("PUT", "/api/produccion/:id", x -> ok(s.actualizar(x.params().get(0), x.body()))),
                of("DELETE", "/api/produccion/:id", x -> ok(s.eliminar(x.params().get(0)))));
    }

    static List<Route> encargos(Container c) {
        var s = c.encargos();
        return List.of(
                of("GET", "/api/encargos", x -> ok(s.listar())),
                of("POST", "/api/encargos", x -> created(s.registrar(x.body()))),
                of("POST", "/api/encargos/entregar", x -> ok(s.entregar(x.body()))),
                of("PUT", "/api/encargos/:id", x -> ok(s.actualizar(x.params().get(0), x.body()))),
                of("DELETE", "/api/encargos/:id", x -> ok(s.eliminar(x.params().get(0)))));
    }

    static List<Route> direccion(Container c) {
        var s = c.reportes();
        return List.of(
                of("GET", "/api/reportes/dashboard", x -> ok(s.dashboard())),
                of("GET", "/api/reportes/ventas", x -> ok(s.ventasPorPeriodo(x.query().get("desde"), x.query().get("hasta")))),
                of("GET", "/api/reportes/produccion-taller", x -> ok(s.produccionPorTaller())));
    }

    static List<Route> catalogo(Container c) {
        var s = c.catalogo();
        return List.of(
                of("GET", "/api/talleres", x -> ok(s.talleres())),
                of("GET", "/api/artesanos", x -> ok(s.artesanos())),
                of("GET", "/api/clientes", x -> ok(s.clientes())),
                of("GET", "/api/proveedores", x -> ok(s.proveedores())));
    }

    /** Altas, cambios y bajas de un dato maestro; la lectura (GET) la sirve el catálogo. */
    static List<Route> maestro(String recurso, Mantenimiento<?> m) {
        return List.of(
                of("POST", "/api/" + recurso, x -> created(m.crear(x.body()))),
                of("PUT", "/api/" + recurso + "/:id", x -> ok(m.actualizar(x.params().get(0), x.body()))),
                of("DELETE", "/api/" + recurso + "/:id", x -> ok(m.eliminar(x.params().get(0)))));
    }

    static List<Route> archivos(Container c) {
        var s = c.archivos();
        return List.of(
                of("GET", "/api/export/(piezas|insumos|produccion|encargos|ventas)\\.csv", x -> ok(s.exportarCsv((String) x.params().get(0)))),
                of("GET", "/api/export/(piezas|insumos|produccion|encargos|ventas)\\.xlsx", x -> ok(s.exportarExcel((String) x.params().get(0), "xlsx"))),
                of("GET", "/api/export/(piezas|insumos|produccion|encargos|ventas)\\.xls", x -> ok(s.exportarExcel((String) x.params().get(0), "xls"))),
                of("GET", "/api/plantilla/(piezas|insumos)\\.csv", x -> ok(s.plantilla((String) x.params().get(0)))),
                of("POST", "/api/import/(piezas|insumos)", x -> {
                    Object body = x.body();
                    Object csv = body instanceof java.util.Map<?, ?> m ? m.get("csv") : null;
                    return created(s.importar((String) x.params().get(0), csv));
                }));
    }
}
