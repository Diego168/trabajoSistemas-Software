// Restaura la base de datos SQLite desde el respaldo SQL versionado (data/backup_artesanias_legado.sql).
// Uso:  node scripts/restaurar-bd.js [archivo_destino] [--force]
// La base .db no se versiona (es un binario que cambia con cada uso); el respaldo .sql sí.
const fs = require("fs"); const path = require("path");
const { DatabaseSync } = require("node:sqlite");

function restaurar({ sql, destino, force = false }) {
  if (fs.existsSync(destino)) { if (!force) throw new Error(`${destino} ya existe; usa --force para reemplazarla`); fs.unlinkSync(destino); }
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const db = new DatabaseSync(destino);
  try { db.exec("PRAGMA foreign_keys = OFF"); db.exec(fs.readFileSync(sql, "utf8")); db.exec("PRAGMA foreign_keys = ON"); }
  finally { db.close(); }
  return destino;
}
if (require.main === module) {
  const args = process.argv.slice(2), force = args.includes("--force"), destino = path.resolve(args.find((a) => !a.startsWith("--")) || path.join(__dirname, "..", "data", "artesanias_legado.db"));
  try { restaurar({ sql: path.join(__dirname, "..", "data", "backup_artesanias_legado.sql"), destino, force }); console.log("Base restaurada en " + destino); }
  catch (e) { console.error("Error: " + e.message); process.exit(1); }
}
module.exports = { restaurar };
