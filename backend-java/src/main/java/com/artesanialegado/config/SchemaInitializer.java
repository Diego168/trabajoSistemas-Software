package com.artesanialegado.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.apache.commons.io.IOUtils;

/** Crea el esquema y carga los datos iniciales la primera vez; es idempotente. */
public final class SchemaInitializer {
    private static final List<String[]> SECUENCIAS = List.of(
            new String[]{"proveedor", "id_proveedor"}, new String[]{"taller", "id_taller"}, new String[]{"artesano", "id_artesano"},
            new String[]{"insumo", "id_insumo"}, new String[]{"pieza", "id_pieza"}, new String[]{"produccion_pieza", "id_produccion"},
            new String[]{"cliente", "id_cliente"}, new String[]{"venta", "id_venta"}, new String[]{"venta_detalle", "id_detalle"},
            new String[]{"encargo", "id_encargo"});

    /** Qué datos cargar al crear la base: ninguno, los mínimos (pruebas) o los de demostración (50 o más filas por tabla). */
    public enum Datos { NINGUNOS, MINIMOS, DEMO }

    private SchemaInitializer() { }

    public static void init(Database db, Datos datos) {
        boolean existe = ((Number) db.get("SELECT COUNT(*) AS n FROM information_schema.tables WHERE LOWER(table_name) = 'taller'").get("n")).intValue() > 0;
        if (existe) return;
        db.script(recurso("/db/schema.sql"));
        if (datos != Datos.NINGUNOS) {
            db.script(recurso(datos == Datos.DEMO ? "/db/demo-data.sql" : "/db/data-minimo.sql"));
            // Los datos iniciales llevan id explícito: se reinician los contadores para que el siguiente id no choque.
            for (String[] s : SECUENCIAS) {
                long max = ((Number) db.get("SELECT COALESCE(MAX(" + s[1] + "),0) AS m FROM " + s[0]).get("m")).longValue();
                db.script("ALTER TABLE " + s[0] + " ALTER COLUMN " + s[1] + " RESTART WITH " + (max + 1));
            }
        }
    }

    private static String recurso(String ruta) {
        try (InputStream in = SchemaInitializer.class.getResourceAsStream(ruta)) {
            if (in == null) throw new IllegalStateException("Falta el recurso " + ruta);
            return IOUtils.toString(in, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer " + ruta, e);
        }
    }
}
