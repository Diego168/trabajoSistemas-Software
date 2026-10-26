package com.artesanialegado.service;

import com.artesanialegado.dao.MaestroDao;
import com.artesanialegado.dto.Dtos;
import com.artesanialegado.error.AppException;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;

/** Mantenimiento de datos maestros (crear, editar, eliminar). Una sola lógica sirve a clientes, artesanos y proveedores. */
public class Mantenimiento<T> {
    private final MaestroDao<T> dao;
    private final Function<Object, T> dto;
    private final String entidad;

    public Mantenimiento(MaestroDao<T> dao, Function<Object, T> dto, String entidad) {
        this.dao = dao; this.dto = dto; this.entidad = entidad;
    }

    public Map<String, Object> crear(Object body) { return dao.findById((int) dao.insert(dto.apply(body))); }

    public Map<String, Object> actualizar(Object id, Object body) {
        int i = Dtos.id(id);
        T d = dto.apply(body);
        if (dao.update(i, d) == 0) throw new AppException.NotFound(entidad + " no encontrado");
        return dao.findById(i);
    }

    public Map<String, Object> eliminar(Object id) {
        int i = Dtos.id(id);
        try {
            if (dao.delete(i) == 0) throw new AppException.NotFound(entidad + " no encontrado");
        } catch (AppException.Conflict e) {
            throw new AppException.Conflict("No se puede eliminar: este " + entidad.toLowerCase(Locale.ROOT)
                    + " tiene registros asociados (ventas, encargos, producción o insumos).");
        }
        return Map.of("ok", true);
    }
}
