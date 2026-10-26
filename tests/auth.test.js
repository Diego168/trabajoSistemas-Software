const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createTestDatabase, CLAVES } = require("./helpers");
const { hashClave, verificarClave } = require("../src/security/password");
const { permitido } = require("../src/security/permisos");
const { UsuarioDAO } = require("../src/dao/UsuarioDAO");
const { AuthService } = require("../src/services/AuthService");

const nuevo = (extra = {}) => new AuthService({ usuarioDao: new UsuarioDAO(createTestDatabase()), ...extra });

test("hashClave usa sal aleatoria y nunca guarda la clave en claro", () => {
  const a = hashClave("Secreta#1"), b = hashClave("Secreta#1");
  assert.notEqual(a, b); assert.ok(!a.includes("Secreta#1")); assert.match(a, /^scrypt\$/);
});
test("verificarClave acepta la correcta y rechaza la incorrecta o un hash corrupto", () => {
  const h = hashClave("Secreta#1");
  assert.equal(verificarClave("Secreta#1", h), true);
  assert.equal(verificarClave("secreta#1", h), false);
  assert.equal(verificarClave("x", "basura"), false);
});
test("login correcto devuelve token opaco y datos del usuario sin el hash", () => {
  const r = nuevo().login("admin", CLAVES.admin, "1.1.1.1");
  assert.match(r.token, /^[A-Za-z0-9_-]{40,}$/);
  assert.deepEqual(Object.keys(r.usuario).sort(), ["nombre", "rol", "usuario"]);
});
test("login con clave o usuario incorrectos da el mismo 401 genérico", () => {
  const s = nuevo();
  const e1 = assert.throws(() => s.login("admin", "mala", "ip"), { status: 401 }) ?? null;
  assert.throws(() => s.login("noexiste", "mala", "ip"), { status: 401, message: "Usuario o contraseña incorrectos" });
});
test("login valida el formato de los datos (400)", () => {
  assert.throws(() => nuevo().login("", "x", "ip"), { status: 400 });
  assert.throws(() => nuevo().login("a b<>", "x", "ip"), { status: 400 });
  assert.throws(() => nuevo().login("admin", "", "ip"), { status: 400 });
});
test("usuario inactivo no puede entrar", () => {
  const db = createTestDatabase(); db.run("UPDATE usuario SET activo=0 WHERE usuario='consulta'");
  assert.throws(() => new AuthService({ usuarioDao: new UsuarioDAO(db) }).login("consulta", CLAVES.consulta, "ip"), { status: 401 });
});
test("5 intentos fallidos bloquean con 429, incluso con la clave correcta; luego se libera", () => {
  let t = 1000; const s = nuevo({ now: () => t, maxIntentos: 5, bloqueoMs: 60000 });
  for (let i = 0; i < 5; i++) assert.throws(() => s.login("admin", "mala", "ip"), { status: 401 });
  assert.throws(() => s.login("admin", CLAVES.admin, "ip"), { status: 429 });
  assert.doesNotThrow(() => s.login("admin", CLAVES.admin, "otra-ip"));
  t += 61000; assert.doesNotThrow(() => s.login("admin", CLAVES.admin, "ip"));
});
test("la sesión se resuelve por token, expira y se cierra", () => {
  let t = 0; const s = nuevo({ now: () => t, ttlMs: 1000 });
  const { token } = s.login("operador", CLAVES.operador, "ip");
  assert.equal(s.sesion(token).rol, "OPERADOR");
  assert.equal(s.sesion("token-falso"), null);
  s.logout(token); assert.equal(s.sesion(token), null);
  const o = s.login("operador", CLAVES.operador, "ip").token; t += 1001; assert.equal(s.sesion(o), null);
});
test("sembrar crea el administrador solo si no hay usuarios", () => {
  const db = createTestDatabase(); db.run("DELETE FROM usuario");
  const s = new AuthService({ usuarioDao: new UsuarioDAO(db) });
  const r = s.sembrar({ claveAdmin: "Inicial#2026" }); assert.equal(r.creado, true);
  assert.doesNotThrow(() => s.login("admin", "Inicial#2026", "ip"));
  assert.equal(s.sembrar({ claveAdmin: "Otra#2026" }).creado, false);
});
test("permisos por rol: ADMIN todo; OPERADOR sin borrar ni importar; CONSULTA solo lectura", () => {
  assert.equal(permitido("ADMIN", "DELETE", "/api/piezas/1"), true);
  assert.equal(permitido("OPERADOR", "POST", "/api/ventas"), true);
  assert.equal(permitido("OPERADOR", "DELETE", "/api/piezas/1"), false);
  assert.equal(permitido("OPERADOR", "POST", "/api/import/piezas"), false);
  assert.equal(permitido("CONSULTA", "GET", "/api/piezas"), true);
  assert.equal(permitido("CONSULTA", "POST", "/api/ventas"), false);
  assert.equal(permitido("DESCONOCIDO", "GET", "/api/piezas"), false);
});
test("sembrar con demo crea admin, operador y consulta", () => {
  const db = createTestDatabase(); db.run("DELETE FROM usuario");
  const s = new AuthService({ usuarioDao: new UsuarioDAO(db) }); s.sembrar({ claveAdmin: "Inicial#2026", demo: true });
  assert.equal(s.login("consulta", "Consulta#2026", "ip").usuario.rol, "CONSULTA");
});
test("los intentos fallidos antiguos se olvidan y no se acumulan en memoria", () => {
  let t = 0; const s = nuevo({ now: () => t, bloqueoMs: 1000 });
  for (let i = 0; i < 50; i++) assert.throws(() => s.login("admin", "mala", "ip" + i), { status: 401 });
  assert.equal(s.fallos.size, 50);
  t += 2000; s.login("admin", CLAVES.admin, "ip-nueva");
  assert.equal(s.fallos.size, 0);
});
test("4 fallos separados por más de la ventana no producen bloqueo", () => {
  let t = 0; const s = nuevo({ now: () => t, maxIntentos: 5, bloqueoMs: 1000 });
  for (let i = 0; i < 4; i++) assert.throws(() => s.login("admin", "mala", "ip"), { status: 401 });
  t += 2000; assert.throws(() => s.login("admin", "mala", "ip"), { status: 401 });
  assert.doesNotThrow(() => s.login("admin", CLAVES.admin, "ip"));
});
