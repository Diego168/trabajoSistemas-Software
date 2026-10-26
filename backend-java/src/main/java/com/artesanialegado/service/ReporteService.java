package com.artesanialegado.service;

import com.artesanialegado.dao.ReporteDao;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** Módulo Dirección / Gerencia General. */
public class ReporteService {
    private static final Pattern FECHA = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");
    private final ReporteDao dao;

    public ReporteService(ReporteDao dao) { this.dao = dao; }

    public Map<String, Object> dashboard() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("ventasHoy", dao.ventasHoy());
        m.put("ventasTotal", dao.ventasTotal());
        m.put("insumosBajo", dao.insumosBajo());
        m.put("piezasPorEstado", dao.piezasPorEstado());
        m.put("ventasPorTecnica", dao.ventasPorTecnica());
        m.put("encargosPorEstado", dao.encargosPorEstado());
        return m;
    }

    /** Fechas ausentes o con formato inválido se reemplazan por un rango abierto. */
    public List<Map<String, Object>> ventasPorPeriodo(String desde, String hasta) {
        return dao.ventasPorPeriodo(valida(desde, "2000-01-01"), valida(hasta, "2100-01-01"));
    }

    public List<Map<String, Object>> produccionPorTaller() { return dao.produccionPorTaller(); }

    private static String valida(String v, String porDefecto) {
        if (v == null || !FECHA.matcher(v).matches()) return porDefecto;
        try { java.time.LocalDate.parse(v); return v; } catch (java.time.format.DateTimeParseException e) { return porDefecto; }
    }
}
