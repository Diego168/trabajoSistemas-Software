class ClienteDAO {
  constructor(db) { this.db = db; }
  findAll() { return this.db.all(`SELECT id_cliente,nombre,documento,tipo,telefono,puntos_fidelizacion FROM cliente ORDER BY nombre`); }
  findById(id) { return this.db.get(`SELECT id_cliente,nombre,documento,tipo,telefono,puntos_fidelizacion FROM cliente WHERE id_cliente=?`, [id]); }
  insert(d) { return Number(this.db.run(`INSERT INTO cliente (nombre,documento,tipo,telefono,puntos_fidelizacion) VALUES (?,?,?,?,0)`, [d.nombre, d.documento, d.tipo, d.telefono]).lastInsertRowid); }
  // Los puntos NO se editan a mano: solo cambian con las entregas de encargos.
  update(id, d) { return this.db.run(`UPDATE cliente SET nombre=?,documento=?,tipo=?,telefono=? WHERE id_cliente=?`, [d.nombre, d.documento, d.tipo, d.telefono, id]).changes; }
  delete(id) { return this.db.run(`DELETE FROM cliente WHERE id_cliente=?`, [id]).changes; }
  sumarPuntos(id, puntos) { this.db.run(`UPDATE cliente SET puntos_fidelizacion=puntos_fidelizacion+? WHERE id_cliente=?`, [puntos, id]); }
}
module.exports = { ClienteDAO };
