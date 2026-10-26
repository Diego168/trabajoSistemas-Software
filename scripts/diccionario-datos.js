// node scripts/diccionario-datos.js [salida.md]   (restaura una base temporal desde el respaldo SQL y la documenta)
const fs = require("fs"); const os = require("os"); const path = require("path");
const { DatabaseSync } = require("node:sqlite");

function extraerChecks(sql) {
  const res = []; const re = /CHECK\s*\(/g; let m;
  while ((m = re.exec(sql))) {
    let d = 1, i = re.lastIndex;
    while (i < sql.length && d > 0) { if (sql[i] === "(") d++; else if (sql[i] === ")") d--; i++; }
    res.push(sql.slice(re.lastIndex, i - 1).replace(/\s+/g, " ").trim());
  }
  return res;
}
function generarDiccionario(db) {
  const tablas = db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  const out = ["# Diccionario de datos · Artesanías Legado S.A.C.", "", `Generado desde el esquema real (${tablas.length} tablas). PK = clave primaria · FK = clave foránea · NN = no nulo.`, ""];
  for (const t of tablas) {
    const cols = db.all(`PRAGMA table_info(${t.name})`), fks = db.all(`PRAGMA foreign_key_list(${t.name})`);
    const uniques = [...String(t.sql).matchAll(/(\w+)\s+[A-Z]+(?:\(\d+\))?[^,]*\bUNIQUE\b/g)].map((m) => m[1]);
    const checks = extraerChecks(String(t.sql));
    out.push(`## ${t.name}`, "", "| Columna | Tipo | Clave | Nulo | Por defecto | Restricciones |", "|---|---|---|---|---|---|");
    for (const c of cols) {
      const fk = fks.find((f) => f.from === c.name);
      const clave = [c.pk ? "PK" : "", fk ? `FK → ${fk.table}.${fk.to}` : ""].filter(Boolean).join(", ") || "—";
      const r = [uniques.includes(c.name) ? "UNIQUE" : "", ...checks.filter((x) => new RegExp(`\\b${c.name}\\b`).test(x)).map((x) => "CHECK (" + x + ")")].filter(Boolean).join("; ") || "—";
      out.push(`| \`${c.name}\` | ${c.type || "—"} | ${clave} | ${c.notnull || c.pk ? "NN" : "puede ser nulo"} | ${c.dflt_value ?? "—"} | ${r} |`);
    }
    out.push("");
  }
  return out.join("\n");
}
if (require.main === module) {
  const { Database, asegurarEsquema } = require("../src/config/database"); const { restaurar } = require("./restaurar-bd");
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "dic-")), "t.db");
  restaurar({ sql: path.join(__dirname, "..", "data", "backup_artesanias_legado.sql"), destino: tmp });
  const db = asegurarEsquema(new Database(new DatabaseSync(tmp)));
  const md = generarDiccionario(db); const salida = process.argv[2];
  if (salida) { fs.writeFileSync(salida, md); console.log("Escrito " + salida); } else console.log(md);
}
module.exports = { generarDiccionario };
