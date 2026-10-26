package com.artesanialegado.dao;

import java.math.BigDecimal;

public interface VentaDao {
    long insertVenta(Integer idCliente, BigDecimal total, String canal);
    void insertDetalle(long idVenta, int idPieza, int cantidad, BigDecimal precio);
}
