package com.artesanialegado.service;

import com.artesanialegado.dao.CatalogoDao;
import com.artesanialegado.dao.ClienteDao;
import com.artesanialegado.domain.Etapas;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Listas de apoyo para los formularios (talleres con sus etapas, artesanos, proveedores y clientes). */
public class CatalogoService {
    private final CatalogoDao catalogoDao;
    private final ClienteDao clienteDao;

    public CatalogoService(CatalogoDao catalogoDao, ClienteDao clienteDao) { this.catalogoDao = catalogoDao; this.clienteDao = clienteDao; }

    public List<Map<String, Object>> talleres() {
        return catalogoDao.talleres().stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>(t);
            m.put("etapas", Etapas.deTaller((String) t.get("tecnica")));
            return m;
        }).toList();
    }
    public List<Map<String, Object>> artesanos() { return catalogoDao.artesanos(); }
    public List<Map<String, Object>> proveedores() { return catalogoDao.proveedores(); }
    public List<Map<String, Object>> clientes() { return clienteDao.findAll(); }
}
