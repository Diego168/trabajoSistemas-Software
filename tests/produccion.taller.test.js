const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createTestDatabase } = require("./helpers");
const { buildContainer } = require("../src/container");
const { etapasDeTaller } = require("../src/domain/etapas");
const { ValidationError, ConflictError } = require("../src/errors");
const setup = () => buildContainer(createTestDatabase());

test("cada taller tiene su propio proceso de etapas", () => {
  assert.deepEqual(etapasDeTaller("Alfarería y cerámica"), ["MODELADO", "SECADO", "COCCION", "ACABADO"]);
  assert.deepEqual(etapasDeTaller("Tallado en madera"), ["MODELADO", "TALLADO", "ACABADO"]);
  assert.deepEqual(etapasDeTaller("Hilados y tejidos"), ["TEJIDO", "ACABADO"]);
  assert.deepEqual(etapasDeTaller("Ebanistería"), ["MODELADO", "TALLADO", "ACABADO"]);
  assert.equal(etapasDeTaller("Otra técnica").length, 6);
});
test("listar incluye el taller de cada registro", () => {
  const r = setup().produccionService.listar()[0];
  assert.equal(r.id_taller, 2); assert.equal(r.taller, "Taller Madera");
});
test("pieza y artesano de talleres distintos → ConflictError", () => {
  const { produccionService } = setup();
  assert.throws(() => produccionService.crear({ id_pieza: 1, id_artesano: 2 }), (e) => e instanceof ConflictError && /talleres distintos/.test(e.message));
});
test("una etapa que no pertenece al proceso del taller → ValidationError", () => {
  const { produccionService } = setup();
  assert.throws(() => produccionService.crear({ id_pieza: 3, id_artesano: 2, etapa: "TEJIDO" }), ValidationError);
  assert.throws(() => produccionService.crear({ id_pieza: 1, id_artesano: 1, etapa: "TALLADO" }), ValidationError);
});
test("sin etapa, el registro empieza en la primera etapa del taller", () => {
  const { produccionService } = setup();
  assert.equal(produccionService.crear({ id_pieza: 1, id_artesano: 1 }).etapa, "MODELADO");
});
test("actualizar también respeta taller y etapas", () => {
  const { produccionService } = setup();
  assert.throws(() => produccionService.actualizar(1, { id_pieza: 2, id_artesano: 1, etapa: "TALLADO" }), ConflictError);
  assert.throws(() => produccionService.actualizar(1, { id_pieza: 2, id_artesano: 2, etapa: "COCCION" }), ValidationError);
});
test("avanzar sigue solo las etapas del taller de cerámica", () => {
  const { produccionService } = setup();
  const r = produccionService.crear({ id_pieza: 1, id_artesano: 1 });
  const seq = [];
  for (let i = 0; i < 3; i++) seq.push(produccionService.avanzarEtapa({ id_produccion: r.id_produccion }).etapa);
  assert.deepEqual(seq, ["SECADO", "COCCION", "ACABADO"]);
  assert.equal(produccionService.avanzarEtapa({ id_produccion: r.id_produccion }).finalizado, true);
});
test("la API de talleres informa las etapas de cada taller (una sola fuente de verdad)", () => {
  const ts = setup().catalogoService.talleres();
  assert.deepEqual(ts.find((t) => t.id_taller === 2).etapas, ["MODELADO", "TALLADO", "ACABADO"]);
  assert.deepEqual(ts.find((t) => t.id_taller === 1).etapas, ["MODELADO", "SECADO", "COCCION", "ACABADO"]);
});
