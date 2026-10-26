// Genera documentacion/INVENTARIO.md desde inventario.json.
const fs = require("fs"); const path = require("path");
const dir = path.join(__dirname, "..", "documentacion");
const inv = JSON.parse(fs.readFileSync(path.join(dir, "inventario.json"), "utf8"));
const out = [`# Inventario de documentación · ${inv.proyecto}`, "", `${inv.documentos.length} documentos. La lista se mantiene en \`documentacion/inventario.json\` y una prueba verifica que cada ruta exista.`, ""];
for (const [n, titulo] of Object.entries(inv.puntos)) {
  const filas = inv.documentos.filter((d) => String(d.punto) === n); if (!filas.length) continue;
  out.push(`## ${n}. ${titulo}`, "", "| Documento | Módulo | Ruta | Formato | Desde | Estado |", "|---|---|---|---|---|---|");
  for (const d of filas) out.push(`| ${d.documento} | ${d.modulo} | \`${d.ruta}\` | ${d.formato} | ${d.version} | ${d.estado} |`);
  out.push("");
}
fs.writeFileSync(path.join(dir, "INVENTARIO.md"), out.join("\n")); console.log("INVENTARIO.md generado");
