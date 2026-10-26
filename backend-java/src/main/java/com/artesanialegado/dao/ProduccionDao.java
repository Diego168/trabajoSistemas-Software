package com.artesanialegado.dao;

import com.artesanialegado.dto.Dtos;
import java.util.List;
import java.util.Map;

public interface ProduccionDao {
    List<Map<String, Object>> findAll();
    Map<String, Object> findById(int id);
    long insert(Dtos.Produccion d);
    int update(int id, Dtos.Produccion d);
    int delete(int id);
    void setEtapa(int id, String etapa);
    /** Cierra el registro (fecha_fin) y deja la pieza DISPONIBLE. */
    void finalizar(int id, int idPieza);
}
