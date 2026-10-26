class ProveedorDAO {
  constructor(db) { this.db = db; }
  findById(id) { return this.db.get(`SELECT id_proveedor,nombre,contacto,tipo_insumo FROM proveedor WHERE id_proveedor=?`, [id]); }
  insert(d) { return Number(this.db.run(`INSERT INTO proveedor (nombre,contacto,tipo_insumo) VALUES (?,?,?)`, [d.nombre, d.contacto, d.tipo_insumo]).lastInsertRowid); }
  update(id, d) { return this.db.run(`UPDATE proveedor SET nombre=?,contacto=?,tipo_insumo=? WHERE id_proveedor=?`, [d.nombre, d.contacto, d.tipo_insumo, id]).changes; }
  delete(id) { return this.db.run(`DELETE FROM proveedor WHERE id_proveedor=?`, [id]).changes; }
}
module.exports = { ProveedorDAO };
