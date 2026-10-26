package com.artesanialegado.web;

import com.artesanialegado.archivo.ArchivoService;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** Una ruta HTTP: método, patrón de la URL y el manejador que la atiende. */
public record Route(String method, Pattern pattern, Handler handler) {

    /** Datos de la petición ya procesados: parámetros de la ruta, query y cuerpo JSON. */
    public record Ctx(List<Object> params, Map<String, String> query, Object body) { }

    /** Respuesta: código HTTP y datos (se serializan a JSON, salvo {@link ArchivoService.Descarga}). */
    public record Result(int status, Object data) { }

    @FunctionalInterface
    public interface Handler { Result handle(Ctx c); }

    public static Route of(String method, String pattern, Handler h) {
        return new Route(method, Pattern.compile("^" + pattern.replace(":id", "(\\d+)") + "$"), h);
    }
    public static Result ok(Object data) { return new Result(200, data); }
    public static Result created(Object data) { return new Result(201, data); }
}
