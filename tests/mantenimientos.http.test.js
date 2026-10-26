const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { createTestDatabase, loginHeaders } = require("./helpers");
const { buildContainer } = require("../src/container");
const { createApp } = require("../src/http/app");
let H; let server, base;
before(async () => {
  server = createApp({ container: buildContainer(createTestDatabase()), publicDir: path.join(__dirname, "..", "public") });
  await new Promise((r) => server.listen(0, "127.0.0.1", r)); base = `http://127.0.0.1:${server.address().port}`; H = await loginHeaders(base);
});
after(() => server.close());
const send = (m, p, b) => fetch(base + p, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined });

test("clientes: crear, editar y eliminar por la API", async () => {
  const c = { nombre: "Cliente Web", documento: "70112233", tipo: "PARTICULAR", telefono: "999111222" };
  const r = await send("POST", "/api/clientes", c); assert.equal(r.status, 201);
  const { id_cliente } = await r.json();
  assert.equal((await send("PUT", `/api/clientes/${id_cliente}`, { ...c, nombre: "Cliente Web 2" })).status, 200);
  assert.equal((await send("DELETE", `/api/clientes/${id_cliente}`)).status, 200);
});
test("clientes: duplicado 409 y eliminar con encargos 409 con mensaje", async () => {
  assert.equal((await send("POST", "/api/clientes", { nombre: "Dup", documento: "45678912", tipo: "PARTICULAR" })).status, 409);
  const r = await send("DELETE", "/api/clientes/1"); assert.equal(r.status, 409);
  assert.match((await r.json()).error, /registros asociados/);
});
test("artesanos y proveedores: crear 201 y XSS 400", async () => {
  assert.equal((await send("POST", "/api/artesanos", { nombre: "Nuevo Artesano", especialidad: "Tallista", id_taller: 2 })).status, 201);
  assert.equal((await send("POST", "/api/proveedores", { nombre: "Proveedor Nuevo", contacto: "955 111 222", tipo_insumo: "Hilo" })).status, 201);
  assert.equal((await send("POST", "/api/proveedores", { nombre: "<script>", tipo_insumo: "x" })).status, 400);
  assert.equal((await send("POST", "/api/artesanos", { nombre: "X", especialidad: "<i>", id_taller: 1 })).status, 400);
});
test("producción: pieza de otro taller → 409 y etapa ajena → 400", async () => {
  assert.equal((await send("POST", "/api/produccion", { id_pieza: 1, id_artesano: 2 })).status, 409);
  assert.equal((await send("POST", "/api/produccion", { id_pieza: 3, id_artesano: 2, etapa: "TEJIDO" })).status, 400);
});
