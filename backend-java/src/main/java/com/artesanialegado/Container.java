package com.artesanialegado;

import com.artesanialegado.archivo.ArchivoService;
import com.artesanialegado.config.Database;
import com.artesanialegado.dao.*;
import com.artesanialegado.security.PasswordHasher;
import com.artesanialegado.service.*;

/**
 * Raíz de composición: único lugar donde se crean y conectan DAO y servicios (inyección de dependencias, SOLID-D).
 * Nada más en el sistema usa {@code new} sobre un DAO o un servicio.
 */
public record Container(Database db, AuthService auth, VentaService ventas, InsumoService insumos, ProduccionService produccion,
                        EncargoService encargos, CatalogoService catalogo, ReporteService reportes, ArchivoService archivos,
                        ClienteService clientes, ArtesanoService artesanos, ProveedorService proveedores) {

    public static Container build(Database db, AuthService auth) {
        PiezaDao piezaDao = new JdbcPiezaDao(db);
        VentaDao ventaDao = new JdbcVentaDao(db);
        InsumoDao insumoDao = new JdbcInsumoDao(db);
        ProduccionDao produccionDao = new JdbcProduccionDao(db);
        EncargoDao encargoDao = new JdbcEncargoDao(db);
        ClienteDao clienteDao = new JdbcClienteDao(db);
        ArtesanoDao artesanoDao = new JdbcArtesanoDao(db);
        ProveedorDao proveedorDao = new JdbcProveedorDao(db);
        CatalogoDao catalogoDao = new JdbcCatalogoDao(db);
        ReporteDao reporteDao = new JdbcReporteDao(db);

        VentaService ventas = new VentaService(db, piezaDao, ventaDao);
        InsumoService insumos = new InsumoService(insumoDao);
        ProduccionService produccion = new ProduccionService(db, produccionDao, piezaDao, artesanoDao, catalogoDao);
        EncargoService encargos = new EncargoService(db, encargoDao, clienteDao);
        ReporteService reportes = new ReporteService(reporteDao);
        return new Container(db, auth, ventas, insumos, produccion, encargos, new CatalogoService(catalogoDao, clienteDao), reportes,
                new ArchivoService(db, ventas, insumos, produccion, encargos, reportes),
                new ClienteService(clienteDao), new ArtesanoService(artesanoDao), new ProveedorService(proveedorDao));
    }

    /** Contenedor completo con la implementación real de autenticación. */
    public static Container build(Database db) {
        return build(db, new AuthService(new JdbcUsuarioDao(db), new PasswordHasher()));
    }
}
