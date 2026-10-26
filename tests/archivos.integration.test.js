const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createTestDatabase } = require("./helpers");
const { buildContainer } = require("../src/container");
const { ValidationError } = require("../src/errors");

const setup = () => buildContainer(createTestDatabase());

test("exportar piezas genera CSV con cabecera y filas", () => {
  const { archivoService } = setup();
  const r = archivoService.exportar("piezas");
  assert.equal(r.filename, "piezas.csv");
  const lineas = r.csv.trim().split("\r\n");
  assert.equal(lineas[0], "id_pieza,codigo,nombre,tecnica,precio,estado,id_taller");
  assert.equal(lineas.length, 4);
});
test("exportar entidad desconocida → 400", () => {
  assert.throws(() => setup().archivoService.exportar("usuarios"), ValidationError);
});
test("plantilla de importación trae solo la cabecera", () => {
  const r = setup().archivoService.plantilla("insumos");
  assert.equal(r.csv, "nombre,categoria,unidad,stock,stock_minimo,id_taller,id_proveedor\r\n");
});
test("importar piezas válidas las guarda todas", () => {
  const { archivoService, ventaService } = setup();
  const r = archivoService.importar("piezas", "codigo,nombre,tecnica,id_taller,precio,estado\nPZ-10,Taza,Cerámica,1,40,DISPONIBLE\nPZ-11,Banco,Ebanistería,2,210,EN_PRODUCCION\n");
  assert.equal(r.importadas, 2);
  assert.equal(ventaService.catalogo().length, 5);
});
test("importar con filas inválidas no guarda nada y reporta fila y motivo", () => {
  const { archivoService, ventaService } = setup();
  try {
    archivoService.importar("piezas", "codigo,nombre,tecnica,id_taller,precio\nPZ-20,Bien,Cerámica,1,40\nPZ-21,<b>mal</b>,Cerámica,1,40\nPZ-22,Neg,Cerámica,1,-5\n");
    assert.fail("debió lanzar");
  } catch (e) {
    assert.ok(e instanceof ValidationError);
    assert.deepEqual(e.details.map((d) => d.fila), [3, 4]);
  }
  assert.equal(ventaService.catalogo().length, 3);
});
test("importar con código duplicado revierte todo", () => {
  const { archivoService, ventaService } = setup();
  assert.throws(() => archivoService.importar("piezas", "codigo,nombre,tecnica,id_taller,precio\nPZ-30,Ok,Cerámica,1,10\nPZ-001,Dup,Cerámica,1,10\n"));
  assert.equal(ventaService.catalogo().length, 3);
});
test("importar insumos y rechazar archivo sin filas ni cabecera esperada", () => {
  const { archivoService, insumoService } = setup();
  assert.equal(archivoService.importar("insumos", "nombre,categoria,unidad,stock,stock_minimo,id_taller\nLana,Materia prima,kg,10,2,1\n").importadas, 1);
  assert.equal(insumoService.listar().length, 3);
  assert.throws(() => archivoService.importar("insumos", "nombre,categoria,unidad,stock,stock_minimo,id_taller\n"), ValidationError);
  assert.throws(() => archivoService.importar("insumos", "otra,cosa\n1,2\n"), ValidationError);
});
test("límite de 500 filas por importación", () => {
  const filas = Array.from({ length: 501 }, (_, i) => `PZ-9${i},N,T,1,1`).join("\n");
  assert.throws(() => setup().archivoService.importar("piezas", "codigo,nombre,tecnica,id_taller,precio\n" + filas), /500/);
});
