package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import com.artesanialegado.dto.Dtos;
import java.util.List;
import java.util.Map;

public class JdbcClienteDao extends JdbcSupport implements ClienteDao {
    private static final String COLS = "id_cliente,nombre,documento,tipo,telefono,puntos_fidelizacion";
    public JdbcClienteDao(Database db) { super(db); }

    @Override public List<Map<String, Object>> findAll() { return db.all("SELECT " + COLS + " FROM cliente ORDER BY nombre"); }
    @Override public Map<String, Object> findById(int id) { return db.get("SELECT " + COLS + " FROM cliente WHERE id_cliente=?", id); }
    @Override public long insert(Dtos.Cliente d) {
        return db.insert("INSERT INTO cliente (nombre,documento,tipo,telefono,puntos_fidelizacion) VALUES (?,?,?,?,0)", d.nombre(), d.documento(), d.tipo(), d.telefono());
    }
    @Override public int update(int id, Dtos.Cliente d) {
        return db.run("UPDATE cliente SET nombre=?,documento=?,tipo=?,telefono=? WHERE id_cliente=?", d.nombre(), d.documento(), d.tipo(), d.telefono(), id);
    }
    @Override public int delete(int id) { return db.run("DELETE FROM cliente WHERE id_cliente=?", id); }
    @Override public void sumarPuntos(int id, int puntos) { db.run("UPDATE cliente SET puntos_fidelizacion=puntos_fidelizacion+? WHERE id_cliente=?", puntos, id); }
}
