// Configuración y acceso a la base de datos
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { ConflictError } = require("../errors");

class Database {
  constructor(raw) { this.raw = raw; this.depth = 0; }
  all(sql, p = []) { return this.#exec(() => this.raw.prepare(sql).all(...p)); }
  get(sql, p = []) { return this.#exec(() => this.raw.prepare(sql).get(...p)); }
  run(sql, p = []) { return this.#exec(() => this.raw.prepare(sql).run(...p)); }
  // Transacción atómica: COMMIT si todo sale bien, ROLLBACK ante cualquier error.
  transaction(fn) {
    if (this.depth > 0) return fn();
    this.raw.exec("BEGIN"); this.depth++;
    try { const r = fn(); this.raw.exec("COMMIT"); return r; }
    catch (e) { this.raw.exec("ROLLBACK"); throw e; }
    finally { this.depth--; }
  }
  // Traduce errores del motor a errores de dominio (no se filtra SQL al cliente).
  #exec(fn) {
    try { return fn(); } catch (e) {
      if (/UNIQUE constraint/i.test(e.message)) throw new ConflictError("Ya existe un registro con ese valor único");
      if (/FOREIGN KEY|CHECK constraint|NOT NULL/i.test(e.message)) throw new ConflictError("La operación viola una regla de integridad de datos");
      throw e;
    }
  }
}
// Migración idempotente: crea la tabla de usuarios si la base es anterior al login.
function asegurarEsquema(db) {
  db.raw.exec(`CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT, usuario VARCHAR(30) NOT NULL UNIQUE, nombre VARCHAR(120) NOT NULL,
    clave_hash VARCHAR(300) NOT NULL, rol VARCHAR(12) NOT NULL CHECK (rol IN ('ADMIN','OPERADOR','CONSULTA')),
    activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0,1)))`);
  return db;
}
function openDatabase(file = process.env.DB_PATH || path.join(__dirname, "..", "..", "data", "artesanias_legado.db")) {
  const raw = new DatabaseSync(file);
  raw.exec("PRAGMA foreign_keys = ON");
  return new Database(raw);
}
module.exports = { Database, openDatabase, asegurarEsquema };
