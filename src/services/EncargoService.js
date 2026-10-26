const { NotFoundError } = require("../errors");
const { EncargoDTO, EntregaDTO, IdDTO } = require("../dto");
const PUNTOS_POR_ENTREGA = 50;
// Módulo Encargos y Fidelización.
class EncargoService {
  constructor({ db, encargoDao, clienteDao }) { Object.assign(this, { db, encargoDao, clienteDao }); }
  listar() { return this.encargoDao.findAll(); }
  registrar(body) { return { id_encargo: this.encargoDao.insert(EncargoDTO.from(body)) }; }
  actualizar(id, body) {
    id = IdDTO.from(id);
    if (!this.encargoDao.update(id, EncargoDTO.from(body))) throw new NotFoundError("Encargo no encontrado");
    return this.encargoDao.findById(id);
  }
  eliminar(id) { if (!this.encargoDao.delete(IdDTO.from(id))) throw new NotFoundError("Encargo no encontrado"); return { ok: true }; }
  entregar(body) {
    const { id_encargo } = EntregaDTO.from(body);
    return this.db.transaction(() => {
      const enc = this.encargoDao.findById(id_encargo);
      if (!enc) throw new NotFoundError("Encargo no encontrado");
      if (enc.estado !== "ENTREGADO") { this.encargoDao.setEntregado(id_encargo); this.clienteDao.sumarPuntos(enc.id_cliente, PUNTOS_POR_ENTREGA); }
      return { ok: true };
    });
  }
}
module.exports = { EncargoService };
