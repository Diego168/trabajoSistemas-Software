package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import com.artesanialegado.dto.Dtos;
import java.util.List;
import java.util.Map;

public class JdbcPiezaDao extends JdbcSupport implements PiezaDao {
    public JdbcPiezaDao(Database db) { super(db); }

    @Override public List<Map<String, Object>> findAll() {
        return db.all("SELECT id_pieza, codigo, nombre, tecnica, precio, estado, id_taller FROM pieza ORDER BY id_pieza DESC");
    }
    @Override public Map<String, Object> findById(int id) { return db.get("SELECT * FROM pieza WHERE id_pieza=?", id); }
    @Override public long insert(Dtos.Pieza d) {
        return db.insert("INSERT INTO pieza (codigo,nombre,tecnica,id_taller,precio,estado) VALUES (?,?,?,?,?,?)",
                d.codigo(), d.nombre(), d.tecnica(), d.idTaller(), d.precio(), d.estado());
    }
    @Override public int update(int id, Dtos.Pieza d) {
        return db.run("UPDATE pieza SET codigo=?,nombre=?,tecnica=?,id_taller=?,precio=?,estado=? WHERE id_pieza=?",
                d.codigo(), d.nombre(), d.tecnica(), d.idTaller(), d.precio(), d.estado(), id);
    }
    @Override public int delete(int id) { return db.run("DELETE FROM pieza WHERE id_pieza=?", id); }
    @Override public void marcarVendida(int id) { db.run("UPDATE pieza SET estado='VENDIDA' WHERE id_pieza=?", id); }
}
