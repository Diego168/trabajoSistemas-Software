const { test } = require("node:test");
const assert = require("node:assert/strict");
const { DatabaseSync } = require("node:sqlite");
const { Database, asegurarEsquema } = require("../src/config/database");
test("asegurarEsquema crea la tabla usuario y es idempotente", () => {
  const db = new Database(new DatabaseSync(":memory:"));
  asegurarEsquema(db); asegurarEsquema(db);
  assert.equal(db.get("SELECT COUNT(*) n FROM usuario").n, 0);
  assert.throws(() => db.run("INSERT INTO usuario(usuario,nombre,clave_hash,rol) VALUES ('a','b','c','SUPERMAN')"));
});
