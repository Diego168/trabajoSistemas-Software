package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import java.util.List;
import java.util.Map;

public class JdbcCatalogoDao extends JdbcSupport implements CatalogoDao {
    public JdbcCatalogoDao(Database db) { super(db); }

    @Override public List<Map<String, Object>> talleres() { return db.all("SELECT id_taller,nombre,tecnica FROM taller ORDER BY nombre"); }
    @Override public Map<String, Object> tallerPorId(int id) { return db.get("SELECT id_taller,nombre,tecnica FROM taller WHERE id_taller=?", id); }
    @Override public List<Map<String, Object>> artesanos() {
        return db.all("SELECT a.id_artesano,a.nombre,a.especialidad,a.id_taller,t.nombre AS taller FROM artesano a JOIN taller t ON a.id_taller=t.id_taller ORDER BY a.nombre");
    }
    @Override public List<Map<String, Object>> proveedores() { return db.all("SELECT id_proveedor,nombre,contacto,tipo_insumo FROM proveedor ORDER BY nombre"); }
}
