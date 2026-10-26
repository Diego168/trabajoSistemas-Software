package com.artesanialegado.dao;

import com.artesanialegado.dto.Dtos;
import java.util.List;
import java.util.Map;

public interface EncargoDao {
    List<Map<String, Object>> findAll();
    Map<String, Object> findById(int id);
    long insert(Dtos.Encargo d);
    int update(int id, Dtos.Encargo d);
    int delete(int id);
    void setEntregado(int id);
}
