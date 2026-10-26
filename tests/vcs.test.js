const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"); const os = require("os"); const path = require("path");
const { spawnSync } = require("child_process");
const hook = path.join(__dirname, "..", ".githooks", "commit-msg");
const probar = (msg) => { const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cm-")), "MSG"); fs.writeFileSync(f, msg + "\n"); return spawnSync("sh", [hook, f]).status; };

test("commit-msg acepta mensajes con la convención", () => {
  for (const m of ["feat(login): agrega sesión por cookie", "fix: corrige el bloqueo de intentos", "docs(vcs): flujo de ramas", "test(red): pruebas del login", "Merge branch 'develop'", 'Revert "feat: algo"']) assert.equal(probar(m), 0, m);
});
test("commit-msg rechaza mensajes sin tipo o demasiado cortos", () => {
  for (const m of ["arreglos varios", "feat:", "Feat: mayúscula", "wip"]) assert.notEqual(probar(m), 0, m);
});
test("el flujo de ramas está documentado", () => {
  const t = fs.readFileSync(path.join(__dirname, "..", "CONTRIBUTING.md"), "utf8");
  for (const w of ["main", "develop", "feature/", "release/", "hotfix/", "revert", "tag"]) assert.ok(t.includes(w), w);
});
