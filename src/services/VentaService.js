const { NotFoundError, ConflictError } = require("../errors");
const { PiezaDTO, VentaDTO, IdDTO } = require("../dto");
// Módulo Marketing y Ventas. Depende de abstracciones inyectadas (DIP).
class VentaService {
  constructor({ db, piezaDao, ventaDao }) { Object.assign(this, { db, piezaDao, ventaDao }); }
  catalogo() { return this.piezaDao.findAll(); }
  crearPieza(body) { const d = PiezaDTO.from(body); return this.piezaDao.findById(this.piezaDao.insert(d)); }
  actualizarPieza(id, body) {
    id = IdDTO.from(id); const d = PiezaDTO.from(body);
    if (!this.piezaDao.update(id, d)) throw new NotFoundError("Pieza no encontrada");
    return this.piezaDao.findById(id);
  }
  eliminarPieza(id) { if (!this.piezaDao.delete(IdDTO.from(id))) throw new NotFoundError("Pieza no encontrada"); return { ok: true }; }
  registrarVenta(body) {
    const d = VentaDTO.from(body);
    return this.db.transaction(() => {
      let total = 0; const lineas = [];
      for (const it of d.items) {
        const p = this.piezaDao.findById(it.id_pieza);
        if (!p) throw new NotFoundError(`Pieza ${it.id_pieza} no existe`);
        if (p.estado !== "DISPONIBLE") throw new ConflictError(`Pieza ${p.codigo} no está disponible`);
        total += p.precio * it.cantidad; lineas.push({ ...it, precio: p.precio });
      }
      const id_venta = this.ventaDao.insertVenta({ id_cliente: d.id_cliente, total, canal: d.canal });
      for (const l of lineas) { this.ventaDao.insertDetalle({ id_venta, ...l }); this.piezaDao.marcarVendida(l.id_pieza); }
      return { id_venta, total };
    });
  }
}
module.exports = { VentaService };
