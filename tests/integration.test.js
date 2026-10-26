const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createTestDatabase } = require("./helpers");
const { buildContainer } = require("../src/container");
const { ConflictError, NotFoundError } = require("../src/errors");

const setup = () => buildContainer(createTestDatabase());

test("Catálogo lista piezas desde la BD real", () => {
  const { ventaService } = setup();
  assert.equal(ventaService.catalogo().length, 3);
});
test("CRUD de pieza con DAO real", () => {
  const { ventaService } = setup();
  const p = ventaService.crearPieza({ codigo: "PZ-100", nombre: "Plato", tecnica: "Cerámica", id_taller: 1, precio: 60 });
  assert.equal(p.estado, "EN_PRODUCCION");
  assert.equal(ventaService.actualizarPieza(p.id_pieza, { ...p, precio: 75 }).precio, 75);
  ventaService.eliminarPieza(p.id_pieza);
  assert.throws(() => ventaService.actualizarPieza(p.id_pieza, p), NotFoundError);
});
test("Código de pieza duplicado → ConflictError", () => {
  const { ventaService } = setup();
  assert.throws(() => ventaService.crearPieza({ codigo: "PZ-001", nombre: "x", tecnica: "y", id_taller: 1, precio: 1 }), ConflictError);
});
test("Venta es atómica: si falla un ítem se hace rollback completo", () => {
  const { ventaService, db } = setup();
  assert.throws(() => ventaService.registrarVenta({ canal: "TIENDA", items: [{ id_pieza: 1, cantidad: 1 }, { id_pieza: 3, cantidad: 1 }] }), ConflictError);
  assert.equal(db.get("SELECT COUNT(*) n FROM venta").n, 0);
  assert.equal(db.get("SELECT estado FROM pieza WHERE id_pieza=1").estado, "DISPONIBLE");
});
test("Venta correcta persiste cabecera, detalle y estado", () => {
  const { ventaService, db } = setup();
  const r = ventaService.registrarVenta({ id_cliente: 1, canal: "FERIA", items: [{ id_pieza: 1, cantidad: 1 }, { id_pieza: 2, cantidad: 1 }] });
  assert.equal(r.total, 500);
  assert.equal(db.get("SELECT COUNT(*) n FROM venta_detalle").n, 2);
  assert.equal(db.get("SELECT estado FROM pieza WHERE id_pieza=2").estado, "VENDIDA");
});
test("Insumos: entrada de stock y alertas de stock bajo", () => {
  const { insumoService } = setup();
  assert.equal(insumoService.alertasStockBajo().length, 1);
  assert.equal(insumoService.registrarEntrada({ id_insumo: 2, cantidad: 10 }).stock, 25);
  assert.equal(insumoService.alertasStockBajo().length, 0);
});
test("Producción: avanzar hasta ACABADO deja pieza DISPONIBLE y fecha_fin", () => {
  const { produccionService, db } = setup();
  // Taller de ebanistería: MODELADO → TALLADO → ACABADO (sin etapas de otros talleres)
  assert.equal(produccionService.avanzarEtapa({ id_produccion: 1 }).etapa, "ACABADO");
  assert.equal(produccionService.avanzarEtapa({ id_produccion: 1 }).finalizado, true);
  assert.ok(db.get("SELECT fecha_fin FROM produccion_pieza WHERE id_produccion=1").fecha_fin);
});
test("Encargo entregado suma 50 puntos al cliente", () => {
  const { encargoService, db } = setup();
  encargoService.entregar({ id_encargo: 1 });
  assert.equal(db.get("SELECT puntos_fidelizacion p FROM cliente WHERE id_cliente=1").p, 150);
  assert.equal(db.get("SELECT estado e FROM encargo WHERE id_encargo=1").e, "ENTREGADO");
});
test("FK inexistente en encargo → ConflictError", () => {
  const { encargoService } = setup();
  assert.throws(() => encargoService.registrar({ id_cliente: 999, id_taller: 1, descripcion: "x", fecha_entrega: "2026-12-01" }), ConflictError);
});
test("Dashboard gerencial agrega datos", () => {
  const { reporteService } = setup();
  const d = reporteService.dashboard();
  assert.equal(d.insumosBajo.n, 1); assert.ok(d.piezasPorEstado.length >= 2);
});
