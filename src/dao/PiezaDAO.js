class PiezaDAO {
  constructor(db) { this.db = db; }
  findAll() { return this.db.all(`SELECT id_pieza, codigo, nombre, tecnica, precio, estado, id_taller FROM pieza ORDER BY id_pieza DESC`); }
  findById(id) { return this.db.get(`SELECT * FROM pieza WHERE id_pieza=?`, [id]); }
  insert(d) {
    const r = this.db.run(`INSERT INTO pieza (codigo,nombre,tecnica,id_taller,precio,estado) VALUES (?,?,?,?,?,?)`,
      [d.codigo, d.nombre, d.tecnica, d.id_taller, d.precio, d.estado]);
    return Number(r.lastInsertRowid);
  }
  update(id, d) {
    return this.db.run(`UPDATE pieza SET codigo=?,nombre=?,tecnica=?,id_taller=?,precio=?,estado=? WHERE id_pieza=?`,
      [d.codigo, d.nombre, d.tecnica, d.id_taller, d.precio, d.estado, id]).changes;
  }
  delete(id) { return this.db.run(`DELETE FROM pieza WHERE id_pieza=?`, [id]).changes; }
  marcarVendida(id) { this.db.run(`UPDATE pieza SET estado='VENDIDA' WHERE id_pieza=?`, [id]); }
}
module.exports = { PiezaDAO };
