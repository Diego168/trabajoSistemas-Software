package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import java.util.List;
import java.util.Map;

public class JdbcReporteDao extends JdbcSupport implements ReporteDao {
    public JdbcReporteDao(Database db) { super(db); }

    @Override public Map<String, Object> ventasHoy() { return db.get("SELECT COALESCE(SUM(total),0) AS total,COUNT(*) AS n FROM venta WHERE CAST(fecha AS DATE)=CURRENT_DATE"); }
    @Override public Map<String, Object> ventasTotal() { return db.get("SELECT COALESCE(SUM(total),0) AS total,COUNT(*) AS n FROM venta"); }
    @Override public Map<String, Object> insumosBajo() { return db.get("SELECT COUNT(*) AS n FROM insumo WHERE stock <= stock_minimo"); }
    @Override public List<Map<String, Object>> piezasPorEstado() { return db.all("SELECT estado,COUNT(*) AS n FROM pieza GROUP BY estado"); }
    @Override public List<Map<String, Object>> ventasPorTecnica() {
        return db.all("SELECT p.tecnica,COALESCE(SUM(vd.cantidad*vd.precio),0) AS total FROM venta_detalle vd JOIN pieza p ON vd.id_pieza=p.id_pieza GROUP BY p.tecnica ORDER BY total DESC");
    }
    @Override public List<Map<String, Object>> encargosPorEstado() { return db.all("SELECT estado,COUNT(*) AS n FROM encargo GROUP BY estado"); }
    @Override public List<Map<String, Object>> ventasPorPeriodo(String desde, String hasta) {
        return db.all("SELECT v.id_venta,c.nombre AS cliente,v.fecha,v.total,v.canal FROM venta v LEFT JOIN cliente c ON v.id_cliente=c.id_cliente "
                + "WHERE CAST(v.fecha AS DATE) BETWEEN ? AND ? ORDER BY v.fecha DESC", fecha(desde), fecha(hasta));
    }
    @Override public List<Map<String, Object>> produccionPorTaller() {
        return db.all("SELECT t.nombre AS taller,COUNT(pp.id_produccion) AS piezas_en_proceso FROM taller t "
                + "LEFT JOIN produccion_pieza pp ON pp.id_pieza IN (SELECT id_pieza FROM pieza WHERE id_taller=t.id_taller) GROUP BY t.nombre");
    }
}
