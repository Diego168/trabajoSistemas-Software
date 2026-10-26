const { test } = require("node:test");
const assert = require("node:assert/strict");
const { toCsv, parseCsv } = require("../src/services/CsvService");

test("toCsv escapa comas, comillas y saltos de línea", () => {
  const out = toCsv([{ a: 'x,y', b: 'di "hola"', c: "l1\nl2" }], ["a", "b", "c"]);
  assert.equal(out, 'a,b,c\r\n"x,y","di ""hola""","l1\nl2"\r\n');
});
test("toCsv neutraliza fórmulas de Excel (CSV injection)", () => {
  const out = toCsv([{ a: "=CMD()", b: "+1", c: "@x", d: "-5 normal" }], ["a", "b", "c", "d"]);
  assert.ok(out.includes("'=CMD()") && out.includes("'+1") && out.includes("'@x") && out.includes("'-5 normal"));
});
test("toCsv no altera números ni nulos", () => {
  assert.equal(toCsv([{ a: -3, b: null, c: 2.5 }], ["a", "b", "c"]), "a,b,c\r\n-3,,2.5\r\n");
});
test("toCsv con lista vacía devuelve solo la cabecera", () => {
  assert.equal(toCsv([], ["a", "b"]), "a,b\r\n");
});
test("parseCsv lee cabecera, comillas, comas internas, CRLF y BOM", () => {
  const rows = parseCsv('﻿codigo,nombre\r\nPZ-1,"Taza, grande"\r\nPZ-2,"Dice ""hola"""\r\n');
  assert.deepEqual(rows, [{ codigo: "PZ-1", nombre: "Taza, grande" }, { codigo: "PZ-2", nombre: 'Dice "hola"' }]);
});
test("parseCsv ignora líneas vacías y recorta espacios", () => {
  assert.deepEqual(parseCsv("a,b\n 1 , 2 \n\n"), [{ a: "1", b: "2" }]);
});
test("parseCsv rechaza comillas sin cerrar", () => {
  assert.throws(() => parseCsv('a\n"abc'), /comillas/i);
});
