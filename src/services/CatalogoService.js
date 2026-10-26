const { etapasDeTaller } = require("../domain/etapas");
class CatalogoService {
  constructor({ catalogoDao, clienteDao }) { Object.assign(this, { catalogoDao, clienteDao }); }
  talleres() { return this.catalogoDao.talleres().map((t) => ({ ...t, etapas: etapasDeTaller(t.tecnica) })); }
  artesanos() { return this.catalogoDao.artesanos(); }
  proveedores() { return this.catalogoDao.proveedores(); }
  clientes() { return this.clienteDao.findAll(); }
}
module.exports = { CatalogoService };
