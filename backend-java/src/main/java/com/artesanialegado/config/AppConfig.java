package com.artesanialegado.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;

/** Configuración tomada de variables de entorno, con valores por defecto para desarrollo local. */
public record AppConfig(int port, String jdbcUrl, String dbUser, String dbPassword, Path publicDir,
                        String adminPassword, boolean cookieSecure, String corsOrigin) {

    public static AppConfig fromEnv(Map<String, String> env) {
        String dbPath = StringUtils.defaultIfBlank(env.get("DB_PATH"), "data/artesanias_legado");
        String url = StringUtils.defaultIfBlank(env.get("DB_URL"),
                "jdbc:h2:file:" + Paths.get(dbPath).toAbsolutePath() + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH");
        return new AppConfig(
                Integer.parseInt(StringUtils.defaultIfBlank(env.get("PORT"), "4000")),
                url,
                StringUtils.defaultIfBlank(env.get("DB_USER"), "sa"),
                StringUtils.defaultString(env.get("DB_PASSWORD")),
                Paths.get(StringUtils.defaultIfBlank(env.get("PUBLIC_DIR"), "../public")).toAbsolutePath().normalize(),
                env.get("ADMIN_PASSWORD"),
                "1".equals(env.get("COOKIE_SECURE")),
                env.get("CORS_ORIGIN"));
    }
}
