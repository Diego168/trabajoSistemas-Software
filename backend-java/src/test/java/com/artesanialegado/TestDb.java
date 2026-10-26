package com.artesanialegado;

import com.artesanialegado.config.Database;
import com.artesanialegado.config.SchemaInitializer;
import com.artesanialegado.dao.JdbcUsuarioDao;
import com.artesanialegado.security.PasswordHasher;
import com.artesanialegado.service.AuthService;
import com.google.common.base.Ticker;
import java.time.Duration;
import java.util.UUID;

/** Base H2 en memoria con el esquema y los datos de demostración, y un contenedor completo para las pruebas. */
public final class TestDb {
    public static final String ADMIN = "Admin#2026";
    public static final String OPERADOR = "Operador#2026";
    public static final String CONSULTA = "Consulta#2026";

    /** Ticker manejable para probar caducidades sin esperar. */
    public static final class Reloj extends Ticker {
        private long nanos;
        @Override public long read() { return nanos; }
        public void avanzar(Duration d) { nanos += d.toNanos(); }
    }

    private TestDb() { }

    public static Database nueva() {
        Database db = Database.open("jdbc:h2:mem:" + UUID.randomUUID() + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1", "sa", "");
        SchemaInitializer.init(db, SchemaInitializer.Datos.MINIMOS);
        return db;
    }

    public static Container contenedor(Database db, Reloj reloj) {
        AuthService auth = new AuthService(new JdbcUsuarioDao(db), new PasswordHasher(1000), reloj, Duration.ofHours(8), 5, Duration.ofMinutes(5));
        auth.sembrar(ADMIN, true);
        return Container.build(db, auth);
    }

    public static Container contenedor(Database db) { return contenedor(db, new Reloj()); }
}
