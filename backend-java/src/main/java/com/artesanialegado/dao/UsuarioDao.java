package com.artesanialegado.dao;

import java.util.Map;

public interface UsuarioDao {
    Map<String, Object> findByUsuario(String usuario);
    long count();
    void insert(String usuario, String nombre, String claveHash, String rol);
}
