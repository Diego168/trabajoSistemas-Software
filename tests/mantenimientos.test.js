const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createTestDatabase } = require("./helpers");
const { buildContainer } = require("../src/container");
const { ValidationError, ConflictError, NotFoundError } = require("../src/errors");
const { ClienteDTO, ArtesanoDTO, ProveedorDTO } = require("../src/dto");
const setup = () => buildContainer(createTestDatabase());
const cli = (o = {}) => ({ nombre: "Lucía Paredes", documento: "46789123", tipo: "PARTICULAR", telefono: "999 888 777", ...o });

// ---------- DTO ----------
test("ClienteDTO normaliza y valida documento, tipo y teléfono", () => {
  const d = ClienteDTO.from(cli({ nombre: " Lucía  " }));
  assert.equal(d.nombre, "Lucía"); assert.equal(d.tipo, "PARTICULAR");
  assert.throws(() => ClienteDTO.from(cli({ documento: "12-34" })), ValidationError);
  assert.throws(() => ClienteDTO.from(cli({ tipo: "VIP" })), ValidationError);
  assert.throws(() => ClienteDTO.from(cli({ telefono: "abc" })), ValidationError);
  assert.throws(() => ClienteDTO.from(cli({ nombre: "<b>x</b>" })), ValidationError);
});
test("ClienteDTO no acepta puntos de fidelización desde el cliente", () => {
  assert.equal(ClienteDTO.from(cli({ puntos_fidelizacion: 9999 })).puntos_fidelizacion, undefined);
});
test("ArtesanoDTO y ProveedorDTO exigen sus campos", () => {
  assert.throws(() => ArtesanoDTO.from({ nombre: "A", especialidad: "", id_taller: 1 }), ValidationError);
  assert.throws(() => ArtesanoDTO.from({ nombre: "A", especialidad: "B" }), ValidationError);
  assert.throws(() => ProveedorDTO.from({ nombre: "", contacto: "1", tipo_insumo: "x" }), ValidationError);
  assert.equal(ProveedorDTO.from({ nombre: "Lanas SAC", tipo_insumo: "Lana" }).contacto, null);
});

// ---------- Clientes ----------
test("Clientes: crear empieza con 0 puntos y aparece en el listado", () => {
  const { clienteService, catalogoService } = setup();
  const c = clienteService.crear(cli());
  assert.equal(c.puntos_fidelizacion, 0);
  assert.equal(catalogoService.clientes().length, 2);
});
test("Clientes: documento duplicado → ConflictError", () => {
  assert.throws(() => setup().clienteService.crear(cli({ documento: "45678912" })), ConflictError);
});
test("Clientes: actualizar conserva los puntos acumulados", () => {
  const { clienteService } = setup();
  const r = clienteService.actualizar(1, cli({ nombre: "Ana T. Actualizada", documento: "45678912" }));
  assert.equal(r.nombre, "Ana T. Actualizada"); assert.equal(r.puntos_fidelizacion, 100);
});
test("Clientes: actualizar inexistente → NotFoundError", () => {
  assert.throws(() => setup().clienteService.actualizar(99, cli()), NotFoundError);
});
test("Clientes: eliminar con encargos explica el motivo (409)", () => {
  assert.throws(() => setup().clienteService.eliminar(1), (e) => e instanceof ConflictError && /registros asociados/.test(e.message));
});
test("Clientes: eliminar uno sin registros funciona", () => {
  const { clienteService, catalogoService } = setup();
  const c = clienteService.crear(cli());
  clienteService.eliminar(c.id_cliente);
  assert.equal(catalogoService.clientes().length, 1);
});

// ---------- Artesanos ----------
test("Artesanos: crear en un taller existente", () => {
  const { artesanoService, catalogoService } = setup();
  const a = artesanoService.crear({ nombre: "Luz Ccori", especialidad: "Tejedora", id_taller: 1 });
  assert.equal(a.id_taller, 1); assert.equal(catalogoService.artesanos().length, 3);
});
test("Artesanos: taller inexistente → ConflictError", () => {
  assert.throws(() => setup().artesanoService.crear({ nombre: "X", especialidad: "Y", id_taller: 99 }), ConflictError);
});
test("Artesanos: actualizar y eliminar (con y sin registros asociados)", () => {
  const { artesanoService } = setup();
  assert.equal(artesanoService.actualizar(1, { nombre: "Rosa Q.", especialidad: "Ceramista", id_taller: 1 }).nombre, "Rosa Q.");
  assert.throws(() => artesanoService.eliminar(2), (e) => e instanceof ConflictError && /registros asociados/.test(e.message));
  const nuevo = artesanoService.crear({ nombre: "Libre", especialidad: "Aprendiz", id_taller: 2 });
  assert.deepEqual(artesanoService.eliminar(nuevo.id_artesano), { ok: true });
  assert.throws(() => artesanoService.eliminar(999), NotFoundError);
});

// ---------- Proveedores ----------
test("Proveedores: crear, actualizar y eliminar", () => {
  const { proveedorService, catalogoService } = setup();
  const p = proveedorService.crear({ nombre: "Barnices del Valle", contacto: "955 000 111", tipo_insumo: "Barniz" });
  assert.equal(catalogoService.proveedores().length, 2);
  assert.equal(proveedorService.actualizar(p.id_proveedor, { nombre: "Barnices Valle", contacto: "955 000 111", tipo_insumo: "Barniz" }).nombre, "Barnices Valle");
  proveedorService.eliminar(p.id_proveedor);
  assert.equal(catalogoService.proveedores().length, 1);
});
test("Proveedores: eliminar uno con insumos asociados → 409 explicativo", () => {
  assert.throws(() => setup().proveedorService.eliminar(1), (e) => e instanceof ConflictError && /registros asociados/.test(e.message));
});
