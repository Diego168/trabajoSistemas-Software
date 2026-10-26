const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createTestDatabase } = require("./helpers");
const { generarDiccionario } = require("../scripts/diccionario-datos");

test("el diccionario de datos lista todas las tablas y columnas del esquema", () => {
  const db = createTestDatabase();
  const md = generarDiccionario(db);
  for (const t of db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")) {
    assert.ok(md.includes(`## ${t.name}`), "tabla " + t.name);
    for (const c of db.all(`PRAGMA table_info(${t.name})`)) assert.ok(md.includes("`" + c.name + "`"), `${t.name}.${c.name}`);
  }
});
test("marca claves primarias, foráneas y restricciones UNIQUE/CHECK", () => {
  const md = generarDiccionario(createTestDatabase());
  assert.match(md, /PK/); assert.match(md, /FK → taller\.id_taller/); assert.match(md, /UNIQUE/); assert.match(md, /CHECK/);
});
test("no expone datos: el diccionario no incluye filas ni hashes", () => {
  const md = generarDiccionario(createTestDatabase());
  assert.ok(!md.includes("scrypt$")); assert.ok(!md.includes("Rosa Quispe"));
});
test("las restricciones CHECK conservan sus paréntesis balanceados", () => {
  const md = generarDiccionario(createTestDatabase());
  const lineas = md.split("\n").filter((l) => l.includes("CHECK ("));
  assert.ok(lineas.length >= 3);
  for (const l of lineas) assert.equal((l.match(/\(/g) || []).length, (l.match(/\)/g) || []).length, l);
});
