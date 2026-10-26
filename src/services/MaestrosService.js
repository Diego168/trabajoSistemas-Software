const { NotFoundError, ConflictError } = require("../errors");
const { ClienteDTO, ArtesanoDTO, ProveedorDTO, IdDTO } = require("../dto");

// Mantenimiento de datos maestros: clientes, artesanos y proveedores (crear, editar, eliminar).
class Mantenimiento {
  constructor(dao, dto, nombreEntidad) { Object.assign(this, { dao, dto, nombreEntidad }); }
  crear(body) { return this.dao.findById(this.dao.insert(this.dto.from(body))); }
  actualizar(id, body) {
    id = IdDTO.from(id); const d = this.dto.from(body);
    if (!this.dao.update(id, d)) throw new NotFoundError(`${this.nombreEntidad} no encontrado`);
    return this.dao.findById(id);
  }
  eliminar(id) {
    id = IdDTO.from(id);
    try { if (!this.dao.delete(id)) throw new NotFoundError(`${this.nombreEntidad} no encontrado`); }
    catch (e) {
      if (e instanceof ConflictError) throw new ConflictError(`No se puede eliminar: este ${this.nombreEntidad.toLowerCase()} tiene registros asociados (ventas, encargos, producción o insumos).`);
      throw e;
    }
    return { ok: true };
  }
}
class ClienteService extends Mantenimiento { constructor({ clienteDao }) { super(clienteDao, ClienteDTO, "Cliente"); } }
class ArtesanoService extends Mantenimiento { constructor({ artesanoDao }) { super(artesanoDao, ArtesanoDTO, "Artesano"); } }
class ProveedorService extends Mantenimiento { constructor({ proveedorDao }) { super(proveedorDao, ProveedorDTO, "Proveedor"); } }
module.exports = { ClienteService, ArtesanoService, ProveedorService };
