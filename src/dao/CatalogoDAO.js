class CatalogoDAO {
  constructor(db) { this.db = db; }
  talleres() { return this.db.all(`SELECT id_taller,nombre,tecnica FROM taller ORDER BY nombre`); }
  tallerPorId(id) { return this.db.get(`SELECT id_taller,nombre,tecnica FROM taller WHERE id_taller=?`, [id]); }
  artesanos() { return this.db.all(`SELECT a.id_artesano,a.nombre,a.especialidad,a.id_taller,t.nombre AS taller FROM artesano a JOIN taller t ON a.id_taller=t.id_taller ORDER BY a.nombre`); }
  proveedores() { return this.db.all(`SELECT id_proveedor,nombre,contacto,tipo_insumo FROM proveedor ORDER BY nombre`); }
}
module.exports = { CatalogoDAO };
