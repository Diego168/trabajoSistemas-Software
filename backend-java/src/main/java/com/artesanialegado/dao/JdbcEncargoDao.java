package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import com.artesanialegado.dto.Dtos;
import java.util.List;
import java.util.Map;

public class JdbcEncargoDao extends JdbcSupport implements EncargoDao {
    public JdbcEncargoDao(Database db) { super(db); }

    @Override public List<Map<String, Object>> findAll() {
        return db.all("SELECT e.id_encargo,c.nombre AS cliente,t.nombre AS taller,a.nombre AS artesano,e.descripcion,e.fecha_entrega,e.estado,e.id_cliente,e.id_taller,e.id_artesano "
                + "FROM encargo e JOIN cliente c ON e.id_cliente=c.id_cliente JOIN taller t ON e.id_taller=t.id_taller "
                + "LEFT JOIN artesano a ON e.id_artesano=a.id_artesano ORDER BY e.id_encargo DESC");
    }
    @Override public Map<String, Object> findById(int id) { return db.get("SELECT * FROM encargo WHERE id_encargo=?", id); }
    @Override public long insert(Dtos.Encargo d) {
        return db.insert("INSERT INTO encargo (id_cliente,id_taller,id_artesano,descripcion,fecha_entrega,estado) VALUES (?,?,?,?,?,'REGISTRADO')",
                d.idCliente(), d.idTaller(), d.idArtesano(), d.descripcion(), fecha(d.fechaEntrega()));
    }
    @Override public int update(int id, Dtos.Encargo d) {
        return db.run("UPDATE encargo SET id_cliente=?,id_taller=?,id_artesano=?,descripcion=?,fecha_entrega=?,estado=? WHERE id_encargo=?",
                d.idCliente(), d.idTaller(), d.idArtesano(), d.descripcion(), fecha(d.fechaEntrega()), d.estado(), id);
    }
    @Override public int delete(int id) { return db.run("DELETE FROM encargo WHERE id_encargo=?", id); }
    @Override public void setEntregado(int id) { db.run("UPDATE encargo SET estado='ENTREGADO' WHERE id_encargo=?", id); }
}
