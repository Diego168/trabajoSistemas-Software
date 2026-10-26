const { NotFoundError } = require("../errors");
const { InsumoDTO, EntradaDTO, IdDTO } = require("../dto");
// Módulo Logística y Almacén.
class InsumoService {
  constructor({ db, insumoDao }) { Object.assign(this, { db, insumoDao }); }
  listar() { return this.insumoDao.findAll(); }
  alertasStockBajo() { return this.insumoDao.findStockBajo(); }
  crear(body) { return this.insumoDao.findById(this.insumoDao.insert(InsumoDTO.from(body))); }
  actualizar(id, body) {
    id = IdDTO.from(id);
    if (!this.insumoDao.update(id, InsumoDTO.from(body))) throw new NotFoundError("Insumo no encontrado");
    return this.insumoDao.findById(id);
  }
  eliminar(id) { if (!this.insumoDao.delete(IdDTO.from(id))) throw new NotFoundError("Insumo no encontrado"); return { ok: true }; }
  registrarEntrada(body) {
    const d = EntradaDTO.from(body);
    if (!this.insumoDao.sumarStock(d.id_insumo, d.cantidad)) throw new NotFoundError("Insumo no encontrado");
    return this.insumoDao.findById(d.id_insumo);
  }
}
module.exports = { InsumoService };
