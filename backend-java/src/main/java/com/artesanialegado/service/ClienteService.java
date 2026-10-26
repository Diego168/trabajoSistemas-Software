package com.artesanialegado.service;

import com.artesanialegado.dao.ClienteDao;
import com.artesanialegado.dto.Dtos;

public class ClienteService extends Mantenimiento<Dtos.Cliente> {
    public ClienteService(ClienteDao dao) { super(dao, Dtos.Cliente::from, "Cliente"); }
}
