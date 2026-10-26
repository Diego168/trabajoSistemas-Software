package com.artesanialegado.dao;

import com.artesanialegado.config.Database;
import java.sql.Date;

/** Base de los DAO JDBC: guarda la conexión única y convierte fechas de texto. */
abstract class JdbcSupport {
    protected final Database db;

    protected JdbcSupport(Database db) { this.db = db; }

    protected static Date fecha(String s) { return s == null ? null : Date.valueOf(s); }
}
