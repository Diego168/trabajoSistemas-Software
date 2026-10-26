const { test } = require("node:test");
const assert = require("node:assert/strict");
const { PiezaDTO, VentaDTO, InsumoDTO, EntradaDTO, IdDTO } = require("../src/dto");
const { ValidationError } = require("../src/errors");

test("PiezaDTO acepta datos válidos y normaliza tipos", () => {
  const d = PiezaDTO.from({ codigo: " PZ-9 ", nombre: "Vasija", tecnica: "Alfarería", id_taller: "1", precio: "99.5" });
  assert.equal(d.codigo, "PZ-9"); assert.equal(d.id_taller, 1); assert.equal(d.precio, 99.5); assert.equal(d.estado, "EN_PRODUCCION");
});
test("PiezaDTO rechaza precio negativo", () => {
  assert.throws(() => PiezaDTO.from({ codigo: "A", nombre: "B", tecnica: "C", id_taller: 1, precio: -1 }), ValidationError);
});
test("PiezaDTO rechaza caracteres peligrosos (XSS)", () => {
  assert.throws(() => PiezaDTO.from({ codigo: "A", nombre: "<script>alert(1)</script>", tecnica: "C", id_taller: 1, precio: 1 }), ValidationError);
});
test("PiezaDTO rechaza estado fuera de catálogo", () => {
  assert.throws(() => PiezaDTO.from({ codigo: "A", nombre: "B", tecnica: "C", id_taller: 1, precio: 1, estado: "HACKEADO" }), ValidationError);
});
test("VentaDTO ignora precios enviados por el cliente", () => {
  const d = VentaDTO.from({ canal: "TIENDA", items: [{ id_pieza: 1, cantidad: 1, precio: 0.01 }] });
  assert.equal(d.items[0].precio, undefined);
});
test("VentaDTO exige al menos un ítem y canal válido", () => {
  assert.throws(() => VentaDTO.from({ canal: "TIENDA", items: [] }), ValidationError);
  assert.throws(() => VentaDTO.from({ canal: "OTRO", items: [{ id_pieza: 1, cantidad: 1 }] }), ValidationError);
});
test("InsumoDTO y EntradaDTO validan cantidades", () => {
  assert.throws(() => InsumoDTO.from({ nombre: "x", categoria: "c", unidad: "kg", stock: -5, id_taller: 1 }), ValidationError);
  assert.throws(() => EntradaDTO.from({ id_insumo: 1, cantidad: 0 }), ValidationError);
});
test("IdDTO rechaza ids no numéricos", () => {
  assert.throws(() => IdDTO.from("1; DROP TABLE pieza"), ValidationError);
  assert.equal(IdDTO.from("7"), 7);
});
