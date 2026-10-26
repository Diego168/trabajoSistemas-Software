package com.artesanialegado.dao;

import java.util.List;
import java.util.Map;

public interface ReporteDao {
    Map<String, Object> ventasHoy();
    Map<String, Object> ventasTotal();
    Map<String, Object> insumosBajo();
    List<Map<String, Object>> piezasPorEstado();
    List<Map<String, Object>> ventasPorTecnica();
    List<Map<String, Object>> encargosPorEstado();
    List<Map<String, Object>> ventasPorPeriodo(String desde, String hasta);
    List<Map<String, Object>> produccionPorTaller();
}
