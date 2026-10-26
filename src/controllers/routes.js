// Cada ruta: método, patrón, handler(ctx) ; ctx = { params, query, body }.
const R = (m, p, h) => ({ method: m, pattern: new RegExp("^" + p.replace(/:id/g, "(\\d+)") + "$"), handler: h });

function VentasController(s) { return [
  R("GET", "/api/piezas", () => [200, s.catalogo()]),
  R("POST", "/api/piezas", (c) => [201, s.crearPieza(c.body)]),
  R("PUT", "/api/piezas/:id", (c) => [200, s.actualizarPieza(c.params[0], c.body)]),
  R("DELETE", "/api/piezas/:id", (c) => [200, s.eliminarPieza(c.params[0])]),
  R("POST", "/api/ventas", (c) => [201, s.registrarVenta(c.body)]) ]; }
function LogisticaController(s) { return [
  R("GET", "/api/insumos", () => [200, s.listar()]),
  R("GET", "/api/insumos/alertas", () => [200, s.alertasStockBajo()]),
  R("POST", "/api/insumos", (c) => [201, s.crear(c.body)]),
  R("POST", "/api/insumos/entrada", (c) => [200, s.registrarEntrada(c.body)]),
  R("PUT", "/api/insumos/:id", (c) => [200, s.actualizar(c.params[0], c.body)]),
  R("DELETE", "/api/insumos/:id", (c) => [200, s.eliminar(c.params[0])]) ]; }
function ProduccionController(s) { return [
  R("GET", "/api/produccion", () => [200, s.listar()]),
  R("POST", "/api/produccion", (c) => [201, s.crear(c.body)]),
  R("POST", "/api/produccion/avanzar", (c) => [200, s.avanzarEtapa(c.body)]),
  R("PUT", "/api/produccion/:id", (c) => [200, s.actualizar(c.params[0], c.body)]),
  R("DELETE", "/api/produccion/:id", (c) => [200, s.eliminar(c.params[0])]) ]; }
function EncargosController(s) { return [
  R("GET", "/api/encargos", () => [200, s.listar()]),
  R("POST", "/api/encargos", (c) => [201, s.registrar(c.body)]),
  R("POST", "/api/encargos/entregar", (c) => [200, s.entregar(c.body)]),
  R("PUT", "/api/encargos/:id", (c) => [200, s.actualizar(c.params[0], c.body)]),
  R("DELETE", "/api/encargos/:id", (c) => [200, s.eliminar(c.params[0])]) ]; }
function DireccionController(s) { return [
  R("GET", "/api/reportes/dashboard", () => [200, s.dashboard()]),
  R("GET", "/api/reportes/ventas", (c) => [200, s.ventasPorPeriodo(c.query.get("desde"), c.query.get("hasta"))]),
  R("GET", "/api/reportes/produccion-taller", () => [200, s.produccionPorTaller()]) ]; }
function MaestrosController(c) { return [
  R("POST", "/api/clientes", (x) => [201, c.clienteService.crear(x.body)]), R("PUT", "/api/clientes/:id", (x) => [200, c.clienteService.actualizar(x.params[0], x.body)]), R("DELETE", "/api/clientes/:id", (x) => [200, c.clienteService.eliminar(x.params[0])]),
  R("POST", "/api/artesanos", (x) => [201, c.artesanoService.crear(x.body)]), R("PUT", "/api/artesanos/:id", (x) => [200, c.artesanoService.actualizar(x.params[0], x.body)]), R("DELETE", "/api/artesanos/:id", (x) => [200, c.artesanoService.eliminar(x.params[0])]),
  R("POST", "/api/proveedores", (x) => [201, c.proveedorService.crear(x.body)]), R("PUT", "/api/proveedores/:id", (x) => [200, c.proveedorService.actualizar(x.params[0], x.body)]), R("DELETE", "/api/proveedores/:id", (x) => [200, c.proveedorService.eliminar(x.params[0])]) ]; }
function CatalogoController(s) { return [
  R("GET", "/api/talleres", () => [200, s.talleres()]), R("GET", "/api/artesanos", () => [200, s.artesanos()]),
  R("GET", "/api/clientes", () => [200, s.clientes()]), R("GET", "/api/proveedores", () => [200, s.proveedores()]) ]; }

function ArchivosController(s) { return [
  R("GET", "/api/export/(piezas|insumos|produccion|encargos|ventas)\\.csv", (c) => [200, s.exportar(c.params[0])]),
  R("GET", "/api/plantilla/(piezas|insumos)\\.csv", (c) => [200, s.plantilla(c.params[0])]),
  R("POST", "/api/import/(piezas|insumos)", (c) => [201, s.importar(c.params[0], c.body && c.body.csv)]) ]; }

function buildRoutes(c) { return [
  ...VentasController(c.ventaService), ...LogisticaController(c.insumoService), ...ProduccionController(c.produccionService),
  ...EncargosController(c.encargoService), ...DireccionController(c.reporteService), ...CatalogoController(c.catalogoService), ...MaestrosController(c), ...ArchivosController(c.archivoService) ]; }
module.exports = { buildRoutes };
