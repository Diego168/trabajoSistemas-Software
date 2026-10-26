package com.artesanialegado.service;

import com.artesanialegado.config.Database;
import com.artesanialegado.dao.ClienteDao;
import com.artesanialegado.dao.EncargoDao;
import com.artesanialegado.dto.Dtos;
import com.artesanialegado.error.AppException;
import java.util.List;
import java.util.Map;

/** Módulo Encargos y Fidelización: al entregar un encargo el cliente suma puntos. */
public class EncargoService {
    public static final int PUNTOS_POR_ENTREGA = 50;
    private final Database db;
    private final EncargoDao encargoDao;
    private final ClienteDao clienteDao;

    public EncargoService(Database db, EncargoDao encargoDao, ClienteDao clienteDao) {
        this.db = db; this.encargoDao = encargoDao; this.clienteDao = clienteDao;
    }

    public List<Map<String, Object>> listar() { return encargoDao.findAll(); }

    public Map<String, Object> registrar(Object body) { return Map.of("id_encargo", encargoDao.insert(Dtos.Encargo.from(body))); }

    public Map<String, Object> actualizar(Object id, Object body) {
        int i = Dtos.id(id);
        if (encargoDao.update(i, Dtos.Encargo.from(body)) == 0) throw new AppException.NotFound("Encargo no encontrado");
        return encargoDao.findById(i);
    }

    public Map<String, Object> eliminar(Object id) {
        if (encargoDao.delete(Dtos.id(id)) == 0) throw new AppException.NotFound("Encargo no encontrado");
        return Map.of("ok", true);
    }

    public Map<String, Object> entregar(Object body) {
        int id = Dtos.Entrega.from(body).idEncargo();
        return db.transaction(() -> {
            Map<String, Object> enc = encargoDao.findById(id);
            if (enc == null) throw new AppException.NotFound("Encargo no encontrado");
            if (!"ENTREGADO".equals(enc.get("estado"))) {
                encargoDao.setEntregado(id);
                clienteDao.sumarPuntos(((Number) enc.get("id_cliente")).intValue(), PUNTOS_POR_ENTREGA);
            }
            return Map.of("ok", true);
        });
    }
}
