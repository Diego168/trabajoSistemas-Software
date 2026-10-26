class ReporteDAO {
  constructor(db) { this.db = db; }
  ventasHoy() { return this.db.get(`SELECT COALESCE(SUM(total),0) AS total,COUNT(*) AS n FROM venta WHERE date(fecha)=date('now')`); }
  ventasTotal() { return this.db.get(`SELECT COALESCE(SUM(total),0) AS total,COUNT(*) AS n FROM venta`); }
  insumosBajo() { return this.db.get(`SELECT COUNT(*) AS n FROM insumo WHERE stock <= stock_minimo`); }
  piezasPorEstado() { return this.db.all(`SELECT estado,COUNT(*) AS n FROM pieza GROUP BY estado`); }
  ventasPorTecnica() {
    return this.db.all(`SELECT p.tecnica,COALESCE(SUM(vd.cantidad*vd.precio),0) AS total FROM venta_detalle vd JOIN pieza p ON vd.id_pieza=p.id_pieza GROUP BY p.tecnica ORDER BY total DESC`);
  }
  encargosPorEstado() { return this.db.all(`SELECT estado,COUNT(*) AS n FROM encargo GROUP BY estado`); }
  ventasPorPeriodo(desde, hasta) {
    return this.db.all(`SELECT v.id_venta,c.nombre AS cliente,v.fecha,v.total,v.canal FROM venta v LEFT JOIN cliente c ON v.id_cliente=c.id_cliente
      WHERE date(v.fecha) BETWEEN date(?) AND date(?) ORDER BY v.fecha DESC`, [desde, hasta]);
  }
  produccionPorTaller() {
    return this.db.all(`SELECT t.nombre AS taller,COUNT(pp.id_produccion) AS piezas_en_proceso FROM taller t
      LEFT JOIN produccion_pieza pp ON pp.id_pieza IN (SELECT id_pieza FROM pieza WHERE id_taller=t.id_taller) GROUP BY t.nombre`);
  }
}
module.exports = { ReporteDAO };
