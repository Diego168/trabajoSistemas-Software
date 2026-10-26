const { test } = require("node:test");
const assert = require("node:assert/strict");
const { VentaService } = require("../src/services/VentaService");
const { ProduccionService } = require("../src/services/ProduccionService");
const { ValidationError, NotFoundError, ConflictError } = require("../src/errors");

// DAOs falsos (principio D de SOLID: el servicio depende de abstracciones)
const fakeDb = { transaction: (fn) => fn() };
function fakePiezaDao(piezas) {
  return { findById: (id) => piezas[id] || null, marcarVendida: (id) => { piezas[id].estado = "VENDIDA"; } };
}
test("VentaService calcula el total con precios del servidor", () => {
  const piezas = { 1: { id_pieza: 1, precio: 100, estado: "DISPONIBLE" }, 2: { id_pieza: 2, precio: 50, estado: "DISPONIBLE" } };
  const detalles = [];
  const ventaDao = { insertVenta: () => 10, insertDetalle: (d) => detalles.push(d) };
  const svc = new VentaService({ db: fakeDb, piezaDao: fakePiezaDao(piezas), ventaDao });
  const r = svc.registrarVenta({ id_cliente: null, canal: "TIENDA", items: [{ id_pieza: 1, cantidad: 2 }, { id_pieza: 2, cantidad: 1 }] });
  assert.equal(r.total, 250); assert.equal(detalles[0].precio, 100); assert.equal(piezas[1].estado, "VENDIDA");
});
test("VentaService rechaza pieza inexistente (404) y ya vendida (409)", () => {
  const piezas = { 1: { id_pieza: 1, precio: 100, estado: "VENDIDA" } };
  const svc = new VentaService({ db: fakeDb, piezaDao: fakePiezaDao(piezas), ventaDao: { insertVenta() {}, insertDetalle() {} } });
  assert.throws(() => svc.registrarVenta({ canal: "TIENDA", items: [{ id_pieza: 99, cantidad: 1 }] }), NotFoundError);
  assert.throws(() => svc.registrarVenta({ canal: "TIENDA", items: [{ id_pieza: 1, cantidad: 1 }] }), ConflictError);
});
test("ProduccionService avanza etapa y al final deja la pieza DISPONIBLE", () => {
  let row = { id_produccion: 1, id_pieza: 5, etapa: "MODELADO" };
  const calls = [];
  const dao = { findById: () => row, setEtapa: (id, e) => { row = { ...row, etapa: e }; }, finalizar: (id, p) => calls.push(["fin", id, p]) };
  const svc = new ProduccionService({ db: fakeDb, produccionDao: dao });
  assert.equal(svc.avanzarEtapa({ id_produccion: 1 }).etapa, "SECADO");
  row.etapa = "ACABADO";
  assert.equal(svc.avanzarEtapa({ id_produccion: 1 }).finalizado, true);
  assert.deepEqual(calls[0], ["fin", 1, 5]);
});
test("ProduccionService lanza 404 si no existe", () => {
  const svc = new ProduccionService({ db: fakeDb, produccionDao: { findById: () => null } });
  assert.throws(() => svc.avanzarEtapa({ id_produccion: 9 }), NotFoundError);
});
