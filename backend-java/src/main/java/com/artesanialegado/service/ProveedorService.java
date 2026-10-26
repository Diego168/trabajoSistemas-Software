package com.artesanialegado.service;

import com.artesanialegado.dao.ProveedorDao;
import com.artesanialegado.dto.Dtos;

public class ProveedorService extends Mantenimiento<Dtos.Proveedor> {
    public ProveedorService(ProveedorDao dao) { super(dao, Dtos.Proveedor::from, "Proveedor"); }
}
