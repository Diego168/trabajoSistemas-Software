package com.artesanialegado;

import com.artesanialegado.config.AppConfig;
import com.artesanialegado.config.Database;
import com.artesanialegado.config.SchemaInitializer;
import com.artesanialegado.logging.EventLogger;
import com.artesanialegado.web.HttpApp;
import java.io.IOException;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;

/** Punto de entrada: lee la configuración, abre la base, crea los usuarios iniciales y arranca el servidor. */
public final class App {
    private App() { }

    public static void main(String[] args) throws IOException {
        EventLogger log = new EventLogger(App.class);
        AppConfig cfg = AppConfig.fromEnv(System.getenv());
        Database db = Database.open(cfg.jdbcUrl(), cfg.dbUser(), cfg.dbPassword());
        SchemaInitializer.init(db, SchemaInitializer.Datos.DEMO);
        Container container = Container.build(db);
        boolean demo = StringUtils.isBlank(cfg.adminPassword());
        if (container.auth().sembrar(demo ? "Admin#2026" : cfg.adminPassword(), demo)) {
            if (demo) container.auth().sembrarDemo(50);
            log.warn(demo ? "Usuarios de demostración creados (admin, operador, consulta y operador01..., consulta01...). Cambia las claves antes de un uso real."
                    : "Usuario admin creado con ADMIN_PASSWORD.", Map.of());
        }
        new HttpApp(container, cfg.publicDir(), cfg.corsOrigin(), cfg.cookieSecure(), log).start(cfg.port());
        log.info("Servidor escuchando", Map.of("url", "http://localhost:" + cfg.port(), "publicDir", cfg.publicDir().toString()));
    }
}
