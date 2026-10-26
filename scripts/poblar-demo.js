// Uso:  node scripts/poblar-demo.js [archivo_destino.db]
//   1. Crea la base con el esquema del respaldo vigente.   2. Vacía las tablas y carga data/demo-data.sql.
// Los datos de data/demo-data.sql los genera backend-java/tools/generar_datos_demo.py (semilla fija).
const fs = require("fs"); const os = require("os"); const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { restaurar } = require("./restaurar-bd");
const { Database, asegurarEsquema } = require("../src/config/database");
const { UsuarioDAO } = require("../src/dao/UsuarioDAO");
const { AuthService } = require("../src/services/AuthService");

const DATA = path.join(__dirname, "..", "data");
const TABLAS = ["proveedor", "taller", "artesano", "insumo", "pieza", "produccion_pieza", "cliente", "venta", "venta_detalle", "encargo"]; // orden de dependencias

const lit = (v) => (v === null ? "NULL" : typeof v === "number" ? String(v) : "'" + String(v).replace(/'/g, "''") + "'");

/** Genera el respaldo SQL (esquema + datos) de las tablas del negocio. */
function volcar(raw) {
  const out = ["BEGIN TRANSACTION;"];
  for (const t of TABLAS) {
    out.push(raw.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(t).sql + ";");
    for (const r of raw.prepare(`SELECT * FROM ${t} ORDER BY 1`).all()) out.push(`INSERT INTO "${t}" VALUES(${Object.values(r).map(lit).join(",")});`);
  }
  out.push('DELETE FROM "sqlite_sequence";');
  for (const s of raw.prepare("SELECT name, seq FROM sqlite_sequence WHERE name IN (" + TABLAS.map(() => "?").join(",") + ")").all(...TABLAS)) out.push(`INSERT INTO "sqlite_sequence" VALUES('${s.name}',${s.seq});`);
  out.push("COMMIT;");
  return out.join("\n") + "\n";
}

function poblar({ destino, respaldo = path.join(DATA, "backup_artesanias_legado.sql"), demo = path.join(DATA, "demo-data.sql"), escribirRespaldo = true }) {
  const tmp = path.join(os.tmpdir(), `poblar-${process.pid}-${Date.now()}.db`);
  restaurar({ sql: respaldo, destino: tmp, force: true });                   // esquema vigente
  const raw = new DatabaseSync(tmp); raw.exec("PRAGMA foreign_keys = OFF");
  for (const t of [...TABLAS].reverse()) raw.exec(`DELETE FROM ${t}`);
  raw.exec(fs.readFileSync(demo, "utf8"));
  for (const t of TABLAS) raw.exec(`DELETE FROM sqlite_sequence WHERE name='${t}'; INSERT INTO sqlite_sequence(name,seq) SELECT '${t}', COALESCE(MAX(rowid),0) FROM ${t}`);
  raw.exec("PRAGMA foreign_keys = ON");
  if (escribirRespaldo) fs.writeFileSync(respaldo, volcar(raw));
  // usuarios: se agregan después de volcar, porque sus hashes no se versionan en el respaldo
  const db = asegurarEsquema(new Database(raw));
  new AuthService({ usuarioDao: new UsuarioDAO(db) }).sembrar({ claveAdmin: "Admin#2026", demo: true, total: 50 });
  raw.exec("PRAGMA wal_checkpoint(TRUNCATE)"); raw.close();
  fs.mkdirSync(path.dirname(destino), { recursive: true }); fs.copyFileSync(tmp, destino); fs.unlinkSync(tmp);
  return destino;
}

if (require.main === module) {
  const destino = path.resolve(process.argv[2] || path.join(DATA, "artesanias_legado.db"));
  poblar({ destino });
  const db = new DatabaseSync(destino);
  for (const t of [...TABLAS, "usuario"]) console.log(t.padEnd(18), db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n);
  console.log("Base creada en " + destino + " y respaldo regenerado.");
}
module.exports = { poblar, volcar, TABLAS };
