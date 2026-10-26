const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs"); const path = require("path");
const dir = path.join(__dirname, "..", "public");
test("login.html y pages/login.js existen, sin scripts en línea", () => {
  const html = fs.readFileSync(path.join(dir, "login.html"), "utf8");
  assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>/i.test(html)); assert.ok(!/\son[a-z]+\s*=/i.test(html));
  assert.match(html, /type="password"/); assert.match(html, /autocomplete="current-password"/); assert.match(html, /name="usuario"|id="usuario"/);
  assert.ok(fs.existsSync(path.join(dir, "pages", "login.js")));
});
test("app.js redirige al login en 401 y valida el parámetro next (sin open redirect)", () => {
  const js = fs.readFileSync(path.join(dir, "app.js"), "utf8");
  assert.match(js, /login\.html/); assert.match(js, /api\/auth\/logout/); assert.match(js, /api\/auth\/me/);
  const l = fs.readFileSync(path.join(dir, "pages", "login.js"), "utf8"); assert.match(l, /\^\[a-z\]\+\\\.html\$/);
});
