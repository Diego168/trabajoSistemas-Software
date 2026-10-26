package com.artesanialegado.service;

import com.artesanialegado.dao.InsumoDao;
import com.artesanialegado.dto.Dtos;
import com.artesanialegado.error.AppException;
import java.util.List;
import java.util.Map;

/** Módulo Logística y Almacén. */
public class InsumoService {
    private final InsumoDao insumoDao;

    public InsumoService(InsumoDao insumoDao) { this.insumoDao = insumoDao; }

    public List<Map<String, Object>> listar() { return insumoDao.findAll(); }
    public List<Map<String, Object>> alertasStockBajo() { return insumoDao.findStockBajo(); }

    public Map<String, Object> crear(Object body) { return crear(Dtos.Insumo.from(body)); }
    public Map<String, Object> crear(Dtos.Insumo d) { return insumoDao.findById((int) insumoDao.insert(d)); }

    public Map<String, Object> actualizar(Object id, Object body) {
        int i = Dtos.id(id);
        if (insumoDao.update(i, Dtos.Insumo.from(body)) == 0) throw new AppException.NotFound("Insumo no encontrado");
        return insumoDao.findById(i);
    }

    public Map<String, Object> eliminar(Object id) {
        if (insumoDao.delete(Dtos.id(id)) == 0) throw new AppException.NotFound("Insumo no encontrado");
        return Map.of("ok", true);
    }

    public Map<String, Object> registrarEntrada(Object body) {
        Dtos.Entrada d = Dtos.Entrada.from(body);
        if (insumoDao.sumarStock(d.idInsumo(), d.cantidad()) == 0) throw new AppException.NotFound("Insumo no encontrado");
        return insumoDao.findById(d.idInsumo());
    }
}
