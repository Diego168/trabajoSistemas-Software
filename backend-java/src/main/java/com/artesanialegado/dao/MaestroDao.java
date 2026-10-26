package com.artesanialegado.dao;

import java.util.Map;

/** Operaciones comunes de los datos maestros (clientes, artesanos, proveedores). T es el DTO de entrada. */
public interface MaestroDao<T> {
    Map<String, Object> findById(int id);
    long insert(T dto);
    int update(int id, T dto);
    int delete(int id);
}
