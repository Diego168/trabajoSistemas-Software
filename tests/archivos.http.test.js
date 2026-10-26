const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { createTestDatabase, loginHeaders } = require("./helpers");
const { buildContainer } = require("../src/container");
const { createApp } = require("../src/http/app");
const { Logger } = require("../src/config/logger");

const AUTH = { "Content-Type": "application/json" };
let server, base; const lines = [];
before(async () => {
  const logger = new Logger({ level: "info", sink: (l) => lines.push(l) });
  server = createApp({ container: buildContainer(createTestDatabase()), publicDir: path.join(__dirname, "..", "public"), logger });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
  Object.assign(AUTH, await loginHeaders(base));
});
after(() => server.close());

test("GET /api/export/piezas.csv entrega CSV descargable", async () => {
  const r = await fetch(base + "/api/export/piezas.csv", { headers: AUTH });
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /text\/csv/);
  assert.match(r.headers.get("content-disposition"), /attachment; filename="piezas\.csv"/);
  assert.ok((await r.text()).startsWith("id_pieza,codigo"));
});
test("POST /api/import/piezas importa y devuelve el conteo", async () => {
  const csv = "codigo,nombre,tecnica,id_taller,precio\nPZ-501,Plato,Cerámica,1,35\n";
  const r = await fetch(base + "/api/import/piezas", { method: "POST", headers: AUTH, body: JSON.stringify({ csv }) });
  assert.equal(r.status, 201); assert.equal((await r.json()).importadas, 1);
});
test("importación inválida → 400 con detalle por fila", async () => {
  const csv = "codigo,nombre,tecnica,id_taller,precio\nPZ-502,<x>,Cerámica,1,35\n";
  const r = await fetch(base + "/api/import/piezas", { method: "POST", headers: AUTH, body: JSON.stringify({ csv }) });
  assert.equal(r.status, 400);
  const b = await r.json(); assert.equal(b.errores[0].fila, 2);
});
test("el servidor registra cada petición con método, ruta y estado", async () => {
  await fetch(base + "/api/piezas", { method: "POST", headers: AUTH, body: JSON.stringify({}) });
  const all = lines.join("\n");
  assert.ok(all.includes('"msg":"http"') && all.includes('"status":400'));
});
