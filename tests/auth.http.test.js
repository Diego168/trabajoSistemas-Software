const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { createTestDatabase, loginHeaders, CLAVES } = require("./helpers");
const { buildContainer } = require("../src/container");
const { createApp } = require("../src/http/app");

let server, base; const lines = [];
before(async () => {
  const logger = { info: (m, d) => lines.push(JSON.stringify({ m, ...d })), warn: (m, d) => lines.push(JSON.stringify({ m, ...d })), error() {} };
  server = createApp({ container: buildContainer(createTestDatabase()), publicDir: path.join(__dirname, "..", "public"), logger });
  await new Promise((r) => server.listen(0, "127.0.0.1", r)); base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());
const J = { "Content-Type": "application/json" };
const post = (p, b, h = J) => fetch(base + p, { method: "POST", headers: h, body: JSON.stringify(b), redirect: "manual" });

test("sin sesión la API responde 401 (datos, reportes y CSV)", async () => {
  for (const p of ["/api/piezas", "/api/reportes/dashboard", "/api/export/piezas.csv", "/api/clientes", "/api/auth/me"]) assert.equal((await fetch(base + p)).status, 401, p);
  assert.equal((await post("/api/ventas", { items: [] })).status, 401);
});
test("login correcto: cookie HttpOnly, SameSite=Strict, sin token en el cuerpo", async () => {
  const r = await post("/api/auth/login", { usuario: "admin", clave: CLAVES.admin });
  assert.equal(r.status, 200);
  const c = r.headers.get("set-cookie"); assert.match(c, /HttpOnly/i); assert.match(c, /SameSite=Strict/i); assert.match(c, /Path=\//); assert.match(c, /Max-Age=\d+/);
  const b = await r.json(); assert.equal(b.rol, "ADMIN"); assert.ok(!JSON.stringify(b).includes("token") && !JSON.stringify(b).includes("hash"));
  assert.match(r.headers.get("cache-control"), /no-store/);
});
test("login incorrecto → 401 genérico y sin cookie", async () => {
  const r = await post("/api/auth/login", { usuario: "admin", clave: "mala" });
  assert.equal(r.status, 401); assert.equal(r.headers.get("set-cookie"), null);
  assert.equal((await r.json()).error, "Usuario o contraseña incorrectos");
});
test("con la cookie se accede; /api/auth/me devuelve el usuario", async () => {
  const h = await loginHeaders(base, "operador");
  assert.equal((await fetch(base + "/api/piezas", { headers: h })).status, 200);
  const me = await (await fetch(base + "/api/auth/me", { headers: h })).json(); assert.equal(me.usuario, "operador"); assert.equal(me.rol, "OPERADOR");
});
test("una cookie falsa no sirve", async () => {
  assert.equal((await fetch(base + "/api/piezas", { headers: { Cookie: "sid=inventado" } })).status, 401);
});
test("OPERADOR: puede vender pero no borrar (403)", async () => {
  const h = await loginHeaders(base, "operador");
  assert.equal((await fetch(base + "/api/piezas/1", { method: "DELETE", headers: h })).status, 403);
  assert.equal((await post("/api/ventas", { canal: "TIENDA", items: [{ id_pieza: 1, cantidad: 1 }] }, h)).status, 201);
});
test("CONSULTA: lee pero no escribe (403)", async () => {
  const h = await loginHeaders(base, "consulta");
  assert.equal((await fetch(base + "/api/piezas", { headers: h })).status, 200);
  assert.equal((await post("/api/clientes", { nombre: "X Y", documento: "12345678" }, h)).status, 403);
});
test("ADMIN puede borrar", async () => {
  const h = await loginHeaders(base, "admin");
  const c = await post("/api/piezas", { codigo: "PZ-DEL", nombre: "Pieza temporal", tecnica: "Cerámica", id_taller: 1, precio: 10 }, h);
  const { id_pieza } = await c.json();
  assert.equal((await fetch(base + "/api/piezas/" + id_pieza, { method: "DELETE", headers: h })).status, 200);
});
test("logout invalida la sesión y borra la cookie", async () => {
  const h = await loginHeaders(base, "admin");
  const r = await fetch(base + "/api/auth/logout", { method: "POST", headers: h });
  assert.equal(r.status, 200); assert.match(r.headers.get("set-cookie"), /Max-Age=0/);
  assert.equal((await fetch(base + "/api/piezas", { headers: h })).status, 401);
});
test("petición de otro origen (CSRF) → 403 aunque lleve cookie", async () => {
  const h = { ...(await loginHeaders(base, "admin")), Origin: "http://sitio-malo.example" };
  assert.equal((await post("/api/clientes", { nombre: "Ana Ruiz", documento: "99887766" }, h)).status, 403);
});
test("las páginas internas redirigen al login sin sesión; login.html es pública", async () => {
  const r = await fetch(base + "/produccion.html", { redirect: "manual" });
  assert.equal(r.status, 302); assert.match(r.headers.get("location"), /^login\.html\?next=produccion\.html$/);
  assert.equal((await fetch(base + "/login.html")).status, 200);
  assert.equal((await fetch(base + "/app.css")).status, 200);
  const h = await loginHeaders(base, "admin"); assert.equal((await fetch(base + "/produccion.html", { headers: h })).status, 200);
});
test("tras 5 fallos el login responde 429", async () => {
  for (let i = 0; i < 5; i++) await post("/api/auth/login", { usuario: "consulta", clave: "mala" });
  assert.equal((await post("/api/auth/login", { usuario: "consulta", clave: CLAVES.consulta })).status, 429);
});
test("el log registra accesos sin contraseñas", () => {
  const t = lines.join("\n"); assert.match(t, /login/); assert.ok(!t.includes(CLAVES.admin)); assert.ok(!t.includes("mala"));
});
