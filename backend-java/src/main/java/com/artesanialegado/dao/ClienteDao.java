package com.artesanialegado.dao;

import com.artesanialegado.dto.Dtos;
import java.util.List;
import java.util.Map;

public interface ClienteDao extends MaestroDao<Dtos.Cliente> {
    List<Map<String, Object>> findAll();
    /** Los puntos NO se editan a mano: solo cambian con las entregas de encargos. */
    void sumarPuntos(int id, int puntos);
}
