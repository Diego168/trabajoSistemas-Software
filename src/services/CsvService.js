// Lectura y escritura de CSV (RFC 4180) con protección contra inyección de fórmulas.
const { ValidationError } = require("../errors");

function celda(v) {
  if (v === null || v === undefined) return "";
  let s = String(v);
  // CSV injection: una celda que empiece con = + - @ se interpretaría como fórmula en Excel.
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function toCsv(rows, columns) {
  return [columns.join(","), ...rows.map((r) => columns.map((c) => celda(r[c])).join(","))].join("\r\n") + "\r\n";
}
function parseCsv(text) {
  const src = String(text).replace(/^﻿/, "");
  const filas = []; let fila = [], campo = "", enComillas = false, huboCampo = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (enComillas) {
      if (ch === '"') { if (src[i + 1] === '"') { campo += '"'; i++; } else enComillas = false; }
      else campo += ch;
    } else if (ch === '"') { enComillas = true; huboCampo = true; }
    else if (ch === ",") { fila.push(campo); campo = ""; huboCampo = true; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      if (huboCampo || campo) { fila.push(campo); filas.push(fila); }
      fila = []; campo = ""; huboCampo = false;
    } else { campo += ch; huboCampo = true; }
  }
  if (enComillas) throw new ValidationError("El archivo tiene comillas sin cerrar");
  if (huboCampo || campo) { fila.push(campo); filas.push(fila); }
  const util = filas.filter((f) => f.some((c) => c.trim() !== ""));
  if (!util.length) return [];
  const cab = util[0].map((c) => c.trim());
  return util.slice(1).map((f) => Object.fromEntries(cab.map((c, i) => [c, (f[i] ?? "").trim()])));
}
module.exports = { toCsv, parseCsv };
