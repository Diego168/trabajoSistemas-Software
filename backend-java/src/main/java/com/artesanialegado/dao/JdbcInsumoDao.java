package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import com.artesanialegado.dto.Dtos;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class JdbcInsumoDao extends JdbcSupport implements InsumoDao {
    public JdbcInsumoDao(Database db) { super(db); }

    @Override public List<Map<String, Object>> findAll() {
        return db.all("SELECT i.id_insumo,i.nombre,i.categoria,i.unidad,i.stock,i.stock_minimo,i.id_taller,i.id_proveedor,t.nombre AS taller,p.nombre AS proveedor "
                + "FROM insumo i JOIN taller t ON i.id_taller=t.id_taller LEFT JOIN proveedor p ON i.id_proveedor=p.id_proveedor ORDER BY i.id_insumo");
    }
    @Override public Map<String, Object> findById(int id) { return db.get("SELECT * FROM insumo WHERE id_insumo=?", id); }
    @Override public long insert(Dtos.Insumo d) {
        return db.insert("INSERT INTO insumo (nombre,categoria,unidad,stock,stock_minimo,id_taller,id_proveedor) VALUES (?,?,?,?,?,?,?)",
                d.nombre(), d.categoria(), d.unidad(), d.stock(), d.stockMinimo(), d.idTaller(), d.idProveedor());
    }
    @Override public int update(int id, Dtos.Insumo d) {
        return db.run("UPDATE insumo SET nombre=?,categoria=?,unidad=?,stock=?,stock_minimo=?,id_taller=?,id_proveedor=? WHERE id_insumo=?",
                d.nombre(), d.categoria(), d.unidad(), d.stock(), d.stockMinimo(), d.idTaller(), d.idProveedor(), id);
    }
    @Override public int delete(int id) { return db.run("DELETE FROM insumo WHERE id_insumo=?", id); }
    @Override public int sumarStock(int id, BigDecimal cantidad) { return db.run("UPDATE insumo SET stock=stock+? WHERE id_insumo=?", cantidad, id); }
    @Override public List<Map<String, Object>> findStockBajo() { return db.all("SELECT nombre,stock,stock_minimo FROM insumo WHERE stock <= stock_minimo"); }
}
