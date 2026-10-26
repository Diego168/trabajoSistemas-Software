const { NotFoundError, ConflictError, ValidationError } = require("../errors");
const { ProduccionDTO, AvanceDTO, IdDTO } = require("../dto");
const { etapasDeTaller } = require("../domain/etapas");
// Módulo Producción y Operaciones. Cada taller tiene su propio proceso y sus propios artesanos y piezas.
class ProduccionService {
  constructor({ db, produccionDao, piezaDao, artesanoDao, catalogoDao }) { Object.assign(this, { db, produccionDao, piezaDao, artesanoDao, catalogoDao }); }
  listar() { return this.produccionDao.findAll(); }

  // Valida que pieza y artesano sean del mismo taller y que la etapa pertenezca al proceso de ese taller.
  #validar(d) {
    const pieza = this.piezaDao.findById(d.id_pieza); if (!pieza) throw new NotFoundError("La pieza no existe");
    const art = this.artesanoDao.findById(d.id_artesano); if (!art) throw new NotFoundError("El artesano no existe");
    if (pieza.id_taller !== art.id_taller) throw new ConflictError("El artesano y la pieza pertenecen a talleres distintos");
    const taller = this.catalogoDao.tallerPorId(pieza.id_taller);
    const etapas = etapasDeTaller(taller && taller.tecnica);
    const etapa = d.etapa || etapas[0];
    if (!etapas.includes(etapa)) throw new ValidationError(`La etapa ${etapa} no corresponde al proceso de ${taller ? taller.nombre : "este taller"} (${etapas.join(", ")})`);
    return { ...d, etapa };
  }
  crear(body) {
    const d = this.#validar(ProduccionDTO.from(body));
    d.fecha_inicio = d.fecha_inicio || new Date().toISOString().slice(0, 10);
    return this.produccionDao.findById(this.produccionDao.insert(d));
  }
  actualizar(id, body) {
    id = IdDTO.from(id); const d = this.#validar(ProduccionDTO.from(body));
    if (!this.produccionDao.update(id, d)) throw new NotFoundError("Registro de producción no encontrado");
    return this.produccionDao.findById(id);
  }
  eliminar(id) { if (!this.produccionDao.delete(IdDTO.from(id))) throw new NotFoundError("Registro no encontrado"); return { ok: true }; }
  avanzarEtapa(body) {
    const { id_produccion } = AvanceDTO.from(body);
    return this.db.transaction(() => {
      const row = this.produccionDao.findById(id_produccion);
      if (!row) throw new NotFoundError("Registro de producción no encontrado");
      const etapas = etapasDeTaller(row.tecnica_taller), idx = etapas.indexOf(row.etapa);
      if (idx < etapas.length - 1) { const etapa = etapas[idx + 1]; this.produccionDao.setEtapa(id_produccion, etapa); return { ...row, etapa }; }
      this.produccionDao.finalizar(id_produccion, row.id_pieza);
      return { ...row, finalizado: true };
    });
  }
}
module.exports = { ProduccionService };
