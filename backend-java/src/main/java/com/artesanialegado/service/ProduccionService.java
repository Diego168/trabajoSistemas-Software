package com.artesanialegado.service;

import com.artesanialegado.config.Database;
import com.artesanialegado.dao.ArtesanoDao;
import com.artesanialegado.dao.CatalogoDao;
import com.artesanialegado.dao.PiezaDao;
import com.artesanialegado.dao.ProduccionDao;
import com.artesanialegado.domain.Etapas;
import com.artesanialegado.dto.Dtos;
import com.artesanialegado.error.AppException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** Módulo Producción y Operaciones. Cada taller tiene su propio proceso y sus propios artesanos y piezas. */
public class ProduccionService {
    private final Database db;
    private final ProduccionDao produccionDao;
    private final PiezaDao piezaDao;
    private final ArtesanoDao artesanoDao;
    private final CatalogoDao catalogoDao;

    public ProduccionService(Database db, ProduccionDao produccionDao, PiezaDao piezaDao, ArtesanoDao artesanoDao, CatalogoDao catalogoDao) {
        this.db = db; this.produccionDao = produccionDao; this.piezaDao = piezaDao; this.artesanoDao = artesanoDao; this.catalogoDao = catalogoDao;
    }

    public List<Map<String, Object>> listar() { return produccionDao.findAll(); }

    /** Pieza y artesano deben ser del mismo taller y la etapa debe pertenecer al proceso de ese taller. */
    private Dtos.Produccion validar(Dtos.Produccion d) {
        Map<String, Object> pieza = piezaDao.findById(d.idPieza());
        if (pieza == null) throw new AppException.NotFound("La pieza no existe");
        Map<String, Object> art = artesanoDao.findById(d.idArtesano());
        if (art == null) throw new AppException.NotFound("El artesano no existe");
        if (!Objects.equals(pieza.get("id_taller"), art.get("id_taller")))
            throw new AppException.Conflict("El artesano y la pieza pertenecen a talleres distintos");
        Map<String, Object> taller = catalogoDao.tallerPorId(((Number) pieza.get("id_taller")).intValue());
        List<String> etapas = Etapas.deTaller(taller == null ? null : (String) taller.get("tecnica"));
        String etapa = d.etapa() != null ? d.etapa() : etapas.get(0);
        if (!etapas.contains(etapa))
            throw new AppException.Validation("La etapa " + etapa + " no corresponde al proceso de " + (taller == null ? "este taller" : taller.get("nombre"))
                    + " (" + String.join(", ", etapas) + ")");
        return d.con(etapa, d.fechaInicio());
    }

    public Map<String, Object> crear(Object body) {
        Dtos.Produccion d = validar(Dtos.Produccion.from(body));
        if (d.fechaInicio() == null) d = d.con(d.etapa(), LocalDate.now().toString());
        return produccionDao.findById((int) produccionDao.insert(d));
    }

    public Map<String, Object> actualizar(Object id, Object body) {
        int i = Dtos.id(id);
        Dtos.Produccion d = validar(Dtos.Produccion.from(body));
        if (produccionDao.update(i, d) == 0) throw new AppException.NotFound("Registro de producción no encontrado");
        return produccionDao.findById(i);
    }

    public Map<String, Object> eliminar(Object id) {
        if (produccionDao.delete(Dtos.id(id)) == 0) throw new AppException.NotFound("Registro no encontrado");
        return Map.of("ok", true);
    }

    /** Pasa a la siguiente etapa del taller; si ya estaba en la última, finaliza y deja la pieza DISPONIBLE. */
    public Map<String, Object> avanzarEtapa(Object body) {
        int id = Dtos.Avance.from(body).idProduccion();
        return db.transaction(() -> {
            Map<String, Object> row = produccionDao.findById(id);
            if (row == null) throw new AppException.NotFound("Registro de producción no encontrado");
            List<String> etapas = Etapas.deTaller((String) row.get("tecnica_taller"));
            int idx = etapas.indexOf(row.get("etapa"));
            Map<String, Object> r = new LinkedHashMap<>(row);
            if (idx < etapas.size() - 1) {
                String etapa = etapas.get(idx + 1);
                produccionDao.setEtapa(id, etapa);
                r.put("etapa", etapa);
            } else {
                produccionDao.finalizar(id, ((Number) row.get("id_pieza")).intValue());
                r.put("finalizado", true);
            }
            return r;
        });
    }
}
