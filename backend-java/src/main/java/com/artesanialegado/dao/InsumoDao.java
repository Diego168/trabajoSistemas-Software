package com.artesanialegado.dao;

import com.artesanialegado.dto.Dtos;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface InsumoDao {
    List<Map<String, Object>> findAll();
    Map<String, Object> findById(int id);
    long insert(Dtos.Insumo d);
    int update(int id, Dtos.Insumo d);
    int delete(int id);
    int sumarStock(int id, BigDecimal cantidad);
    List<Map<String, Object>> findStockBajo();
}
