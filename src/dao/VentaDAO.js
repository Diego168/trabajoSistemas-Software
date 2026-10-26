class VentaDAO {
  constructor(db) { this.db = db; }
  insertVenta({ id_cliente, total, canal }) {
    return Number(this.db.run(`INSERT INTO venta (id_cliente,fecha,total,canal) VALUES (?,datetime('now'),?,?)`, [id_cliente || null, total, canal]).lastInsertRowid);
  }
  insertDetalle({ id_venta, id_pieza, cantidad, precio }) {
    this.db.run(`INSERT INTO venta_detalle (id_venta,id_pieza,cantidad,precio) VALUES (?,?,?,?)`, [id_venta, id_pieza, cantidad, precio]);
  }
}
module.exports = { VentaDAO };
