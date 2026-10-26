package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import com.artesanialegado.dto.Dtos;
import java.util.Map;

public class JdbcProveedorDao extends JdbcSupport implements ProveedorDao {
    public JdbcProveedorDao(Database db) { super(db); }

    @Override public Map<String, Object> findById(int id) { return db.get("SELECT id_proveedor,nombre,contacto,tipo_insumo FROM proveedor WHERE id_proveedor=?", id); }
    @Override public long insert(Dtos.Proveedor d) { return db.insert("INSERT INTO proveedor (nombre,contacto,tipo_insumo) VALUES (?,?,?)", d.nombre(), d.contacto(), d.tipoInsumo()); }
    @Override public int update(int id, Dtos.Proveedor d) { return db.run("UPDATE proveedor SET nombre=?,contacto=?,tipo_insumo=? WHERE id_proveedor=?", d.nombre(), d.contacto(), d.tipoInsumo(), id); }
    @Override public int delete(int id) { return db.run("DELETE FROM proveedor WHERE id_proveedor=?", id); }
}
