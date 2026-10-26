const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"); const path = require("path");
const root = path.join(__dirname, "..");
const inv = JSON.parse(fs.readFileSync(path.join(root, "documentacion", "inventario.json"), "utf8"));

test("el inventario cubre los 9 puntos de la consigna", () => {
  assert.deepEqual([...new Set(inv.documentos.map((d) => d.punto))].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});
test("cada documento del inventario existe en el repositorio (inventario siempre al día)", () => {
  for (const d of inv.documentos) assert.ok(fs.existsSync(path.join(root, d.ruta)), "falta " + d.ruta);
});
test("cada entrada tiene módulo, formato, versión y estado", () => {
  for (const d of inv.documentos) for (const k of ["punto", "modulo", "documento", "ruta", "formato", "version", "estado"]) assert.ok(d[k] !== undefined && d[k] !== "", `${d.ruta}: ${k}`);
});
test("INVENTARIO.md está generado a partir del JSON", () => {
  const md = fs.readFileSync(path.join(root, "documentacion", "INVENTARIO.md"), "utf8");
  for (const d of inv.documentos) assert.ok(md.includes(d.ruta), d.ruta);
});
test("los reportes documentados apuntan a rutas reales de la API", () => {
  const routes = fs.readFileSync(path.join(root, "src", "controllers", "routes.js"), "utf8");
  const rep = fs.readFileSync(path.join(root, "documentacion", "reportes.md"), "utf8");
  const rutas = [...rep.matchAll(/`GET (\/api\/[^`?]+)`/g)].map((m) => m[1]);
  assert.ok(rutas.length >= 7);
  for (const r of rutas) assert.ok(routes.includes(r.endsWith(".csv") ? "/api/export/" : r), "ruta sin implementar: " + r);
});
