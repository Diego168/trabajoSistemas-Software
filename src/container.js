// Composition root: único lugar donde se crean y conectan las dependencias (inyección).
const { PiezaDAO } = require("./dao/PiezaDAO"); const { VentaDAO } = require("./dao/VentaDAO");
const { InsumoDAO } = require("./dao/InsumoDAO"); const { ProduccionDAO } = require("./dao/ProduccionDAO");
const { EncargoDAO } = require("./dao/EncargoDAO"); const { ClienteDAO } = require("./dao/ClienteDAO");
const { CatalogoDAO } = require("./dao/CatalogoDAO"); const { ReporteDAO } = require("./dao/ReporteDAO");
const { VentaService } = require("./services/VentaService"); const { InsumoService } = require("./services/InsumoService");
const { ProduccionService } = require("./services/ProduccionService"); const { EncargoService } = require("./services/EncargoService");
const { CatalogoService } = require("./services/CatalogoService"); const { ArchivoService } = require("./services/ArchivoService");
const { ArtesanoDAO } = require("./dao/ArtesanoDAO"); const { ProveedorDAO } = require("./dao/ProveedorDAO"); const { ClienteService, ArtesanoService, ProveedorService } = require("./services/MaestrosService"); const { UsuarioDAO } = require("./dao/UsuarioDAO"); const { AuthService } = require("./services/AuthService"); const { ReporteService } = require("./services/ReporteService");

function buildContainer(db) {
  const piezaDao = new PiezaDAO(db), ventaDao = new VentaDAO(db), insumoDao = new InsumoDAO(db), produccionDao = new ProduccionDAO(db),
    encargoDao = new EncargoDAO(db), clienteDao = new ClienteDAO(db), catalogoDao = new CatalogoDAO(db), reporteDao = new ReporteDAO(db), artesanoDao = new ArtesanoDAO(db), proveedorDao = new ProveedorDAO(db);
  const ventaService = new VentaService({ db, piezaDao, ventaDao }), insumoService = new InsumoService({ db, insumoDao }),
    produccionService = new ProduccionService({ db, produccionDao, piezaDao, artesanoDao, catalogoDao }), encargoService = new EncargoService({ db, encargoDao, clienteDao }),
    catalogoService = new CatalogoService({ catalogoDao, clienteDao }), reporteService = new ReporteService({ reporteDao });
  return { db, authService: new AuthService({ usuarioDao: new UsuarioDAO(db) }), clienteService: new ClienteService({ clienteDao }), artesanoService: new ArtesanoService({ artesanoDao }), proveedorService: new ProveedorService({ proveedorDao }), ventaService, insumoService, produccionService, encargoService, catalogoService, reporteService,
    archivoService: new ArchivoService({ db, ventaService, insumoService, produccionService, encargoService, reporteService }) };
}
module.exports = { buildContainer };
