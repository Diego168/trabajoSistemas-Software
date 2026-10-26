package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import com.artesanialegado.dto.Dtos;
import java.util.List;
import java.util.Map;

public class JdbcProduccionDao extends JdbcSupport implements ProduccionDao {
    public JdbcProduccionDao(Database db) { super(db); }

    @Override public List<Map<String, Object>> findAll() {
        return db.all("SELECT pp.id_produccion,pi.codigo,pi.nombre AS pieza,a.nombre AS artesano,pp.etapa,pp.fecha_inicio,pp.fecha_fin,pp.id_pieza,pp.id_artesano,"
                + "pi.id_taller,t.nombre AS taller,t.tecnica AS tecnica_taller FROM produccion_pieza pp JOIN pieza pi ON pp.id_pieza=pi.id_pieza "
                + "JOIN taller t ON pi.id_taller=t.id_taller JOIN artesano a ON pp.id_artesano=a.id_artesano ORDER BY pp.id_produccion DESC");
    }
    @Override public Map<String, Object> findById(int id) {
        return db.get("SELECT pp.*,pi.id_taller,t.nombre AS taller,t.tecnica AS tecnica_taller FROM produccion_pieza pp "
                + "JOIN pieza pi ON pp.id_pieza=pi.id_pieza JOIN taller t ON pi.id_taller=t.id_taller WHERE pp.id_produccion=?", id);
    }
    @Override public long insert(Dtos.Produccion d) {
        return db.insert("INSERT INTO produccion_pieza (id_pieza,id_artesano,etapa,fecha_inicio) VALUES (?,?,?,?)",
                d.idPieza(), d.idArtesano(), d.etapa(), fecha(d.fechaInicio()));
    }
    @Override public int update(int id, Dtos.Produccion d) {
        return db.run("UPDATE produccion_pieza SET id_pieza=?,id_artesano=?,etapa=?,fecha_inicio=? WHERE id_produccion=?",
                d.idPieza(), d.idArtesano(), d.etapa(), fecha(d.fechaInicio()), id);
    }
    @Override public int delete(int id) { return db.run("DELETE FROM produccion_pieza WHERE id_produccion=?", id); }
    @Override public void setEtapa(int id, String etapa) { db.run("UPDATE produccion_pieza SET etapa=? WHERE id_produccion=?", etapa, id); }
    @Override public void finalizar(int id, int idPieza) {
        db.run("UPDATE produccion_pieza SET fecha_fin=CURRENT_DATE WHERE id_produccion=?", id);
        db.run("UPDATE pieza SET estado='DISPONIBLE' WHERE id_pieza=?", idPieza);
    }
}
