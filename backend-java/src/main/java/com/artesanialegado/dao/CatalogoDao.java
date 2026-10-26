package com.artesanialegado.dao;

import java.util.List;
import java.util.Map;

public interface CatalogoDao {
    List<Map<String, Object>> talleres();
    Map<String, Object> tallerPorId(int id);
    List<Map<String, Object>> artesanos();
    List<Map<String, Object>> proveedores();
}
