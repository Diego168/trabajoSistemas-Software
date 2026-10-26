package com.artesanialegado.config;

import com.artesanialegado.error.AppException;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/**
 * Única clase que conoce JDBC. Todo el SQL se ejecuta con parámetros (PreparedStatement) y las
 * operaciones compuestas corren dentro de una transacción: COMMIT si todo sale bien, ROLLBACK ante cualquier error.
 */
public class Database implements AutoCloseable {
    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final Connection conn;
    private final ReentrantLock lock = new ReentrantLock();
    private int depth;

    private Database(Connection conn) { this.conn = conn; }

    public static Database open(String jdbcUrl, String user, String password) {
        try {
            return new Database(DriverManager.getConnection(jdbcUrl, user, password));
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo abrir la base de datos: " + e.getMessage(), e);
        }
    }

    public List<Map<String, Object>> all(String sql, Object... params) {
        lock.lock();
        try (PreparedStatement ps = prepare(sql, false, params); ResultSet rs = ps.executeQuery()) {
            List<Map<String, Object>> rows = new ArrayList<>();
            ResultSetMetaData md = rs.getMetaData();
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                for (int i = 1; i <= md.getColumnCount(); i++) row.put(md.getColumnLabel(i).toLowerCase(), convertir(rs.getObject(i)));
                rows.add(row);
            }
            return rows;
        } catch (SQLException e) {
            throw traducir(e);
        } finally {
            lock.unlock();
        }
    }

    /** Primera fila o null. */
    public Map<String, Object> get(String sql, Object... params) {
        List<Map<String, Object>> rows = all(sql, params);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public int run(String sql, Object... params) {
        lock.lock();
        try (PreparedStatement ps = prepare(sql, false, params)) {
            return ps.executeUpdate();
        } catch (SQLException e) {
            throw traducir(e);
        } finally {
            lock.unlock();
        }
    }

    /** INSERT que devuelve la clave generada. */
    public long insert(String sql, Object... params) {
        lock.lock();
        try (PreparedStatement ps = prepare(sql, true, params)) {
            ps.executeUpdate();
            try (ResultSet k = ps.getGeneratedKeys()) {
                return k.next() ? k.getLong(1) : -1;
            }
        } catch (SQLException e) {
            throw traducir(e);
        } finally {
            lock.unlock();
        }
    }

    public <T> T transaction(Supplier<T> work) {
        lock.lock();
        try {
            if (depth > 0) return work.get();   // transacción anidada: participa de la actual
            conn.setAutoCommit(false);
            depth++;
            try {
                T r = work.get();
                conn.commit();
                return r;
            } catch (RuntimeException | SQLException e) {
                conn.rollback();
                if (e instanceof RuntimeException re) throw re;
                throw traducir((SQLException) e);
            } finally {
                depth--;
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw traducir(e);
        } finally {
            lock.unlock();
        }
    }

    /** Ejecuta un script SQL (varias sentencias separadas por ';'). */
    public void script(String sql) {
        lock.lock();
        try (Statement st = conn.createStatement()) {
            for (String s : sql.split(";\\s*(\\r?\\n|$)")) {
                String limpio = s.lines().filter(l -> !l.trim().startsWith("--")).reduce("", (a, b) -> a + b + "\n").trim();
                if (!limpio.isEmpty()) st.execute(limpio);
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Error al ejecutar el script: " + e.getMessage(), e);
        } finally {
            lock.unlock();
        }
    }

    private PreparedStatement prepare(String sql, boolean keys, Object... params) throws SQLException {
        PreparedStatement ps = keys ? conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS) : conn.prepareStatement(sql);
        for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
        return ps;
    }

    private static Object convertir(Object v) {
        if (v instanceof Date d) return d.toString();
        if (v instanceof Timestamp t) return t.toLocalDateTime().format(TS);
        if (v instanceof java.time.LocalDate d) return d.toString();
        if (v instanceof java.time.LocalDateTime t) return t.format(TS);
        if (v instanceof BigDecimal b) return b.stripTrailingZeros().scale() < 0 ? b.setScale(0) : b.stripTrailingZeros();
        return v;
    }

    /** Traduce errores del motor a errores de dominio: nunca se filtra SQL al cliente. */
    private static RuntimeException traducir(SQLException e) {
        String st = e.getSQLState() == null ? "" : e.getSQLState();
        if (st.equals("23505")) return new AppException.Conflict("Ya existe un registro con ese valor único");
        if (st.startsWith("23")) return new AppException.Conflict("La operación viola una regla de integridad de datos");
        return new IllegalStateException("Error de base de datos", e);
    }

    @Override
    public void close() {
        try { conn.close(); } catch (SQLException ignored) { /* nada que hacer */ }
    }
}
