const test = require("node:test"); const assert = require("node:assert/strict");
const fs = require("fs"); const os = require("os"); const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { poblar, TABLAS } = require("../scripts/poblar-demo");

const destino = path.join(os.tmpdir(), `demo-test-${process.pid}.db`);
poblar({ destino, escribirRespaldo: false });
const db = new DatabaseSync(destino);
const n = (sql) => db.prepare(sql).get().n;

test("cada tabla tiene al menos 50 filas, salvo taller: 3 talleres con 20 artesanos cada uno", () => {
  assert.equal(n("SELECT COUNT(*) n FROM taller"), 3);
  assert.equal(n("SELECT MIN(c) n FROM (SELECT COUNT(*) c FROM artesano GROUP BY id_taller)"), 20);
  for (const t of TABLAS.filter((x) => x !== "taller")) assert.ok(n(`SELECT COUNT(*) n FROM ${t}`) >= 50, `${t} tiene menos de 50 filas`);
});
test("hay 50 usuarios con clave cifrada", () => {
  assert.equal(n("SELECT COUNT(*) n FROM usuario"), 50);
  assert.equal(n("SELECT COUNT(*) n FROM usuario WHERE clave_hash LIKE '%Admin#%' OR clave_hash LIKE '%Operador#%'"), 0);
});
test("no hay violaciones de llaves foráneas", () => {
  assert.equal(db.prepare("PRAGMA foreign_key_check").all().length, 0);
});
test("coherencia: total de venta = suma de sus detalles", () => {
  assert.equal(n(`SELECT COUNT(*) n FROM venta v WHERE ABS(v.total - (SELECT COALESCE(SUM(d.cantidad*d.precio),0) FROM venta_detalle d WHERE d.id_venta=v.id_venta)) > 0.01`), 0);
});
test("el respaldo SQL versionado restaura 50+ filas por tabla", () => {
  const tmp = path.join(os.tmpdir(), `resp-${process.pid}.db`);
  require("../scripts/restaurar-bd").restaurar({ sql: path.join(__dirname, "..", "data", "backup_artesanias_legado.sql"), destino: tmp, force: true });
  const r = new DatabaseSync(tmp);
  for (const t of TABLAS.filter((x) => x !== "taller")) assert.ok(r.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n >= 50, t);
  r.close(); fs.unlinkSync(tmp);
});
