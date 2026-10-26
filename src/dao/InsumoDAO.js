class InsumoDAO {
  constructor(db) { this.db = db; }
  findAll() {
    return this.db.all(`SELECT i.id_insumo,i.nombre,i.categoria,i.unidad,i.stock,i.stock_minimo,i.id_taller,i.id_proveedor,t.nombre AS taller,p.nombre AS proveedor
      FROM insumo i JOIN taller t ON i.id_taller=t.id_taller LEFT JOIN proveedor p ON i.id_proveedor=p.id_proveedor ORDER BY i.id_insumo`);
  }
  findById(id) { return this.db.get(`SELECT * FROM insumo WHERE id_insumo=?`, [id]); }
  insert(d) {
    return Number(this.db.run(`INSERT INTO insumo (nombre,categoria,unidad,stock,stock_minimo,id_taller,id_proveedor) VALUES (?,?,?,?,?,?,?)`,
      [d.nombre, d.categoria, d.unidad, d.stock, d.stock_minimo, d.id_taller, d.id_proveedor]).lastInsertRowid);
  }
  update(id, d) {
    return this.db.run(`UPDATE insumo SET nombre=?,categoria=?,unidad=?,stock=?,stock_minimo=?,id_taller=?,id_proveedor=? WHERE id_insumo=?`,
      [d.nombre, d.categoria, d.unidad, d.stock, d.stock_minimo, d.id_taller, d.id_proveedor, id]).changes;
  }
  delete(id) { return this.db.run(`DELETE FROM insumo WHERE id_insumo=?`, [id]).changes; }
  sumarStock(id, cantidad) { return this.db.run(`UPDATE insumo SET stock=stock+? WHERE id_insumo=?`, [cantidad, id]).changes; }
  findStockBajo() { return this.db.all(`SELECT nombre,stock,stock_minimo FROM insumo WHERE stock <= stock_minimo`); }
}
module.exports = { InsumoDAO };
