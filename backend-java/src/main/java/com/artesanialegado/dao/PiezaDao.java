package com.artesanialegado.dao;

import com.artesanialegado.dto.Dtos;
import java.util.List;
import java.util.Map;

public interface PiezaDao {
    List<Map<String, Object>> findAll();
    Map<String, Object> findById(int id);
    long insert(Dtos.Pieza d);
    int update(int id, Dtos.Pieza d);
    int delete(int id);
    void marcarVendida(int id);
}
