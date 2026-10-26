package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import java.math.BigDecimal;

public class JdbcVentaDao extends JdbcSupport implements VentaDao {
    public JdbcVentaDao(Database db) { super(db); }

    @Override public long insertVenta(Integer idCliente, BigDecimal total, String canal) {
        return db.insert("INSERT INTO venta (id_cliente,fecha,total,canal) VALUES (?,CURRENT_TIMESTAMP,?,?)", idCliente, total, canal);
    }
    @Override public void insertDetalle(long idVenta, int idPieza, int cantidad, BigDecimal precio) {
        db.run("INSERT INTO venta_detalle (id_venta,id_pieza,cantidad,precio) VALUES (?,?,?,?)", idVenta, idPieza, cantidad, precio);
    }
}
