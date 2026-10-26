const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"); const os = require("os"); const path = require("path");
const { Logger } = require("../src/config/logger");

test("respeta el nivel mínimo", () => {
  const lines = []; const log = new Logger({ level: "warn", sink: (l) => lines.push(l) });
  log.debug("d"); log.info("i"); log.warn("w"); log.error("e");
  assert.equal(lines.length, 2);
});
test("cada línea es JSON con fecha, nivel y mensaje", () => {
  const lines = []; const log = new Logger({ level: "info", sink: (l) => lines.push(l) });
  log.info("venta registrada", { id_venta: 7 });
  const o = JSON.parse(lines[0]);
  assert.equal(o.level, "INFO"); assert.equal(o.msg, "venta registrada"); assert.equal(o.id_venta, 7); assert.ok(!isNaN(Date.parse(o.ts)));
});
test("oculta datos sensibles (token, password, authorization)", () => {
  const lines = []; const log = new Logger({ level: "info", sink: (l) => lines.push(l) });
  log.info("x", { authorization: "Bearer abc", token: "t", password: "p", ok: 1 });
  const o = JSON.parse(lines[0]);
  assert.equal(o.authorization, "***"); assert.equal(o.token, "***"); assert.equal(o.password, "***"); assert.equal(o.ok, 1);
});
test("escribe en archivo diario dentro del directorio indicado", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "logs-"));
  const log = new Logger({ level: "info", dir, console: false });
  log.info("hola");
  const files = fs.readdirSync(dir);
  assert.equal(files.length, 1); assert.match(files[0], /^app-\d{4}-\d{2}-\d{2}\.log$/);
  assert.ok(fs.readFileSync(path.join(dir, files[0]), "utf8").includes('"msg":"hola"'));
});
