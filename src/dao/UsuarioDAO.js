// DAO de usuarios (SQL parametrizado).
class UsuarioDAO {
  constructor(db) { this.db = db; }
  findByUsuario(u) { return this.db.get("SELECT id_usuario, usuario, nombre, clave_hash, rol, activo FROM usuario WHERE usuario = ?", [u]); }
  count() { return this.db.get("SELECT COUNT(*) AS n FROM usuario").n; }
  insert({ usuario, nombre, clave_hash, rol }) { return this.db.run("INSERT INTO usuario(usuario,nombre,clave_hash,rol) VALUES (?,?,?,?)", [usuario, nombre, clave_hash, rol]); }
}
module.exports = { UsuarioDAO };
