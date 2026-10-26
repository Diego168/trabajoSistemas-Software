// Módulo Dirección / Gerencia General.
class ReporteService {
  constructor({ reporteDao }) { this.dao = reporteDao; }
  dashboard() {
    const d = this.dao;
    return { ventasHoy: d.ventasHoy(), ventasTotal: d.ventasTotal(), insumosBajo: d.insumosBajo(), piezasPorEstado: d.piezasPorEstado(),
      ventasPorTecnica: d.ventasPorTecnica(), encargosPorEstado: d.encargosPorEstado() };
  }
  ventasPorPeriodo(desde, hasta) {
    const ok = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || "") ? v : null);
    return this.dao.ventasPorPeriodo(ok(desde) || "2000-01-01", ok(hasta) || "2100-01-01");
  }
  produccionPorTaller() { return this.dao.produccionPorTaller(); }
}
module.exports = { ReporteService };
