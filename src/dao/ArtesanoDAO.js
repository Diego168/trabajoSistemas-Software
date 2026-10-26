class ArtesanoDAO {
  constructor(db) { this.db = db; }
  findById(id) { return this.db.get(`SELECT a.id_artesano,a.nombre,a.especialidad,a.id_taller,t.nombre AS taller FROM artesano a JOIN taller t ON a.id_taller=t.id_taller WHERE a.id_artesano=?`, [id]); }
  insert(d) { return Number(this.db.run(`INSERT INTO artesano (nombre,especialidad,id_taller) VALUES (?,?,?)`, [d.nombre, d.especialidad, d.id_taller]).lastInsertRowid); }
  update(id, d) { return this.db.run(`UPDATE artesano SET nombre=?,especialidad=?,id_taller=? WHERE id_artesano=?`, [d.nombre, d.especialidad, d.id_taller, id]).changes; }
  delete(id) { return this.db.run(`DELETE FROM artesano WHERE id_artesano=?`, [id]).changes; }
}
module.exports = { ArtesanoDAO };
