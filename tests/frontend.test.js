const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"); const path = require("path");
const dir = path.join(__dirname, "..", "public");
const pages = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));

test("hay 10 pantallas HTML", () => assert.deepEqual(pages.sort(), ["artesanos.html", "clientes.html", "dashboard.html", "encargos.html", "index.html", "insumos.html", "login.html", "produccion.html", "proveedores.html", "ventas.html"]));
for (const p of pages) {
  const html = fs.readFileSync(path.join(dir, p), "utf8");
  test(`${p}: sin scripts en línea ni manejadores on*=`, () => {
    assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>/i.test(html), "script en línea");
    assert.ok(!/\son[a-z]+\s*=/i.test(html), "manejador en línea");
  });
  test(`${p}: idioma, viewport y título`, () => {
    assert.match(html, /<html lang="es"/); assert.match(html, /name="viewport"/); assert.match(html, /<title>[^<]{3,}<\/title>/);
  });
}
test("app.js define las utilidades compartidas", () => {
  const js = fs.readFileSync(path.join(dir, "app.js"), "utf8");
  for (const fn of ["function esc", "function api", "function toast", "function abrirModal", "function confirmar", "function tabla", "function montarShell"]) assert.ok(js.includes(fn), fn);
});
test("el JS de las pantallas no interpola texto del servidor en HTML sin esc()", () => {
  // Una interpolación "pelada" (${x.nombre} o ${x.nombre || "—"}) es el patrón típico de XSS.
  const campos = "nombre|codigo|descripcion|cliente|artesano|taller|pieza|tecnica|proveedor|etapa|estado|canal|categoria|unidad|contacto";
  const pelada = new RegExp(`^\\s*[a-z]\\w*\\.(${campos})\\s*(\\|\\|.*)?$`);
  for (const f of fs.readdirSync(path.join(dir, "pages"))) {
    const js = fs.readFileSync(path.join(dir, "pages", f), "utf8");
    // Sumideros seguros: toast (textContent), confirmar/abrirModal/selector/campo (escapan internamente), PDF.
    const seguro = /toast\(|confirmar\(|abrirModal\(|selector\(|campo\(|textContent|\bt\(`/;
    js.split("\n").filter((l) => !seguro.test(l)).forEach((l) => { for (const m of l.matchAll(/\$\{([^}]+)\}/g)) assert.ok(!pelada.test(m[1]), `${f}: \${${m[1]}} sin escapar`); });
  }
});
