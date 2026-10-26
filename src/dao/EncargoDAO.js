class EncargoDAO {
  constructor(db) { this.db = db; }
  findAll() {
    return this.db.all(`SELECT e.id_encargo,c.nombre AS cliente,t.nombre AS taller,a.nombre AS artesano,e.descripcion,e.fecha_entrega,e.estado,e.id_cliente,e.id_taller,e.id_artesano
      FROM encargo e JOIN cliente c ON e.id_cliente=c.id_cliente JOIN taller t ON e.id_taller=t.id_taller LEFT JOIN artesano a ON e.id_artesano=a.id_artesano ORDER BY e.id_encargo DESC`);
  }
  findById(id) { return this.db.get(`SELECT * FROM encargo WHERE id_encargo=?`, [id]); }
  insert(d) {
    return Number(this.db.run(`INSERT INTO encargo (id_cliente,id_taller,id_artesano,descripcion,fecha_entrega,estado) VALUES (?,?,?,?,?,'REGISTRADO')`,
      [d.id_cliente, d.id_taller, d.id_artesano, d.descripcion, d.fecha_entrega]).lastInsertRowid);
  }
  update(id, d) {
    return this.db.run(`UPDATE encargo SET id_cliente=?,id_taller=?,id_artesano=?,descripcion=?,fecha_entrega=?,estado=? WHERE id_encargo=?`,
      [d.id_cliente, d.id_taller, d.id_artesano, d.descripcion, d.fecha_entrega, d.estado, id]).changes;
  }
  delete(id) { return this.db.run(`DELETE FROM encargo WHERE id_encargo=?`, [id]).changes; }
  setEntregado(id) { this.db.run(`UPDATE encargo SET estado='ENTREGADO' WHERE id_encargo=?`, [id]); }
}
module.exports = { EncargoDAO };
