package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import com.artesanialegado.dto.Dtos;
import java.util.Map;

public class JdbcArtesanoDao extends JdbcSupport implements ArtesanoDao {
    public JdbcArtesanoDao(Database db) { super(db); }

    @Override public Map<String, Object> findById(int id) {
        return db.get("SELECT a.id_artesano,a.nombre,a.especialidad,a.id_taller,t.nombre AS taller FROM artesano a JOIN taller t ON a.id_taller=t.id_taller WHERE a.id_artesano=?", id);
    }
    @Override public long insert(Dtos.Artesano d) { return db.insert("INSERT INTO artesano (nombre,especialidad,id_taller) VALUES (?,?,?)", d.nombre(), d.especialidad(), d.idTaller()); }
    @Override public int update(int id, Dtos.Artesano d) { return db.run("UPDATE artesano SET nombre=?,especialidad=?,id_taller=? WHERE id_artesano=?", d.nombre(), d.especialidad(), d.idTaller(), id); }
    @Override public int delete(int id) { return db.run("DELETE FROM artesano WHERE id_artesano=?", id); }
}
