package com.artesanialegado.service;

import com.artesanialegado.config.Database;
import com.artesanialegado.dao.PiezaDao;
import com.artesanialegado.dao.VentaDao;
import com.artesanialegado.dto.Dtos;
import com.artesanialegado.error.AppException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Módulo Marketing y Ventas. Depende de abstracciones (DAO) que recibe por constructor (inversión de dependencias). */
public class VentaService {
    private final Database db;
    private final PiezaDao piezaDao;
    private final VentaDao ventaDao;

    public VentaService(Database db, PiezaDao piezaDao, VentaDao ventaDao) {
        this.db = db; this.piezaDao = piezaDao; this.ventaDao = ventaDao;
    }

    public List<Map<String, Object>> catalogo() { return piezaDao.findAll(); }

    public Map<String, Object> crearPieza(Object body) { return crearPieza(Dtos.Pieza.from(body)); }
    public Map<String, Object> crearPieza(Dtos.Pieza d) { return piezaDao.findById((int) piezaDao.insert(d)); }

    public Map<String, Object> actualizarPieza(Object id, Object body) {
        int i = Dtos.id(id);
        if (piezaDao.update(i, Dtos.Pieza.from(body)) == 0) throw new AppException.NotFound("Pieza no encontrada");
        return piezaDao.findById(i);
    }

    public Map<String, Object> eliminarPieza(Object id) {
        if (piezaDao.delete(Dtos.id(id)) == 0) throw new AppException.NotFound("Pieza no encontrada");
        return Map.of("ok", true);
    }

    /** Valida disponibilidad, toma el precio de la base y registra venta y detalle en una sola transacción. */
    public Map<String, Object> registrarVenta(Object body) {
        Dtos.Venta d = Dtos.Venta.from(body);
        return db.transaction(() -> {
            BigDecimal total = BigDecimal.ZERO;
            List<Object[]> lineas = new ArrayList<>();
            for (Dtos.Item it : d.items()) {
                Map<String, Object> p = piezaDao.findById(it.idPieza());
                if (p == null) throw new AppException.NotFound("Pieza " + it.idPieza() + " no existe");
                if (!"DISPONIBLE".equals(p.get("estado"))) throw new AppException.Conflict("Pieza " + p.get("codigo") + " no está disponible");
                BigDecimal precio = (BigDecimal) p.get("precio");
                total = total.add(precio.multiply(BigDecimal.valueOf(it.cantidad())));
                lineas.add(new Object[]{it, precio});
            }
            long idVenta = ventaDao.insertVenta(d.idCliente(), total, d.canal());
            for (Object[] l : lineas) {
                Dtos.Item it = (Dtos.Item) l[0];
                ventaDao.insertDetalle(idVenta, it.idPieza(), it.cantidad(), (BigDecimal) l[1]);
                piezaDao.marcarVendida(it.idPieza());
            }
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("id_venta", idVenta);
            r.put("total", total);
            return r;
        });
    }
}
