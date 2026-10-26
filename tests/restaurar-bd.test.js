const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"); const os = require("os"); const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { restaurar } = require("../scripts/restaurar-bd");
const sql = path.join(__dirname, "..", "data", "backup_artesanias_legado.sql");

test("el respaldo SQL se restaura en una base nueva con sus tablas y datos", () => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "rest-")), "t.db");
  restaurar({ sql, destino: f });
  const db = new DatabaseSync(f);
  assert.ok(db.prepare("SELECT COUNT(*) n FROM pieza").get().n >= 1);
  assert.ok(db.prepare("SELECT COUNT(*) n FROM taller").get().n >= 1);
  db.close();
});
test("no reemplaza una base existente sin --force", () => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "rest-")), "t.db");
  restaurar({ sql, destino: f });
  assert.throws(() => restaurar({ sql, destino: f }), /ya existe/);
  assert.doesNotThrow(() => restaurar({ sql, destino: f, force: true }));
});
