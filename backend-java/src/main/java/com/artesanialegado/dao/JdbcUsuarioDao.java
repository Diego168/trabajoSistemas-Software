package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import java.util.Map;

public class JdbcUsuarioDao extends JdbcSupport implements UsuarioDao {
    public JdbcUsuarioDao(Database db) { super(db); }

    @Override public Map<String, Object> findByUsuario(String u) { return db.get("SELECT id_usuario, usuario, nombre, clave_hash, rol, activo FROM usuario WHERE usuario = ?", u); }
    @Override public long count() { return ((Number) db.get("SELECT COUNT(*) AS n FROM usuario").get("n")).longValue(); }
    @Override public void insert(String usuario, String nombre, String claveHash, String rol) {
        db.run("INSERT INTO usuario(usuario,nombre,clave_hash,rol) VALUES (?,?,?,?)", usuario, nombre, claveHash, rol);
    }
}
