const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { createTestDatabase, loginHeaders } = require("./helpers");
const { buildContainer } = require("../src/container");
const { createApp } = require("../src/http/app");

const J = { "Content-Type": "application/json" };
const AUTH = J;
let server, base;
before(async () => {
  server = createApp({ container: buildContainer(createTestDatabase()), publicDir: path.join(__dirname, "..", "public") });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
  Object.assign(J, await loginHeaders(base));
});
after(() => server.close());

test("GET /api/piezas responde 200 con cabeceras de seguridad y sin CORS abierto", async () => {
  const r = await fetch(base + "/api/piezas", { headers: J });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
  assert.ok(r.headers.get("content-security-policy"));
  assert.equal(r.headers.get("access-control-allow-origin"), null);
  assert.equal((await r.json()).length, 3);
});
test("Crear una pieza válida responde 201", async () => {
  const body = JSON.stringify({ codigo: "PZ-77", nombre: "Taza", tecnica: "Cerámica", id_taller: 1, precio: 30 });
  assert.equal((await fetch(base + "/api/piezas", { method: "POST", headers: J, body })).status, 201);
});
test("JSON inválido → 400", async () => {
  assert.equal((await fetch(base + "/api/piezas", { method: "POST", headers: AUTH, body: "{no-json" })).status, 400);
});
test("Payload de XSS → 400", async () => {
  const body = JSON.stringify({ codigo: "X1", nombre: "<img src=x onerror=alert(1)>", tecnica: "t", id_taller: 1, precio: 1 });
  assert.equal((await fetch(base + "/api/piezas", { method: "POST", headers: AUTH, body })).status, 400);
});
test("Cuerpo demasiado grande → 413", async () => {
  const r = await fetch(base + "/api/piezas", { method: "POST", headers: AUTH, body: JSON.stringify({ x: "a".repeat(200000) }) });
  assert.equal(r.status, 413);
});
test("Path traversal en estáticos no filtra archivos", async () => {
  const r = await fetch(base + "/..%2f..%2fpackage.json");
  assert.ok([400, 403, 404].includes(r.status));
  assert.ok(!(await r.text()).includes("sistema-gestion"));
});
test("Venta ignora precio manipulado del cliente", async () => {
  const r = await fetch(base + "/api/ventas", { method: "POST", headers: AUTH, body: JSON.stringify({ canal: "TIENDA", items: [{ id_pieza: 1, cantidad: 1, precio: 0.01 }] }) });
  assert.equal(r.status, 201); assert.equal((await r.json()).total, 180);
});
test("Error de BD no filtra detalles internos (SQL) al cliente", async () => {
  const r = await fetch(base + "/api/piezas", { method: "POST", headers: AUTH, body: JSON.stringify({ codigo: "PZ-001", nombre: "dup", tecnica: "t", id_taller: 1, precio: 1 }) });
  assert.equal(r.status, 409);
  const t = await r.text();
  assert.ok(!/SQLITE|constraint|UNIQUE/i.test(t));
});
test("Ruta desconocida → 404 JSON y frontend se sirve", async () => {
  assert.equal((await fetch(base + "/api/nada", { headers: J })).status, 404);
  const r = await fetch(base + "/ventas.html", { headers: J }); assert.equal(r.status, 200);
});
