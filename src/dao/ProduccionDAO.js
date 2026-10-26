class ProduccionDAO {
  constructor(db) { this.db = db; }
  findAll() {
    return this.db.all(`SELECT pp.id_produccion,pi.codigo,pi.nombre AS pieza,a.nombre AS artesano,pp.etapa,pp.fecha_inicio,pp.fecha_fin,pp.id_pieza,pp.id_artesano,
      pi.id_taller,t.nombre AS taller,t.tecnica AS tecnica_taller
      FROM produccion_pieza pp JOIN pieza pi ON pp.id_pieza=pi.id_pieza JOIN taller t ON pi.id_taller=t.id_taller JOIN artesano a ON pp.id_artesano=a.id_artesano ORDER BY pp.id_produccion DESC`);
  }
  findById(id) {
    return this.db.get(`SELECT pp.*,pi.id_taller,t.nombre AS taller,t.tecnica AS tecnica_taller FROM produccion_pieza pp JOIN pieza pi ON pp.id_pieza=pi.id_pieza JOIN taller t ON pi.id_taller=t.id_taller WHERE pp.id_produccion=?`, [id]);
  }
  insert(d) {
    return Number(this.db.run(`INSERT INTO produccion_pieza (id_pieza,id_artesano,etapa,fecha_inicio) VALUES (?,?,?,?)`,
      [d.id_pieza, d.id_artesano, d.etapa, d.fecha_inicio]).lastInsertRowid);
  }
  update(id, d) {
    return this.db.run(`UPDATE produccion_pieza SET id_pieza=?,id_artesano=?,etapa=?,fecha_inicio=? WHERE id_produccion=?`,
      [d.id_pieza, d.id_artesano, d.etapa, d.fecha_inicio, id]).changes;
  }
  delete(id) { return this.db.run(`DELETE FROM produccion_pieza WHERE id_produccion=?`, [id]).changes; }
  setEtapa(id, etapa) { this.db.run(`UPDATE produccion_pieza SET etapa=? WHERE id_produccion=?`, [etapa, id]); }
  finalizar(id, idPieza) {
    this.db.run(`UPDATE produccion_pieza SET fecha_fin=date('now') WHERE id_produccion=?`, [id]);
    this.db.run(`UPDATE pieza SET estado='DISPONIBLE' WHERE id_pieza=?`, [idPieza]);
  }
}
module.exports = { ProduccionDAO };
