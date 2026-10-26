package com.artesanialegado.error;

import java.util.List;
import java.util.Map;

/** Error de negocio con código HTTP. El servidor lo convierte en una respuesta JSON sin exponer detalles internos. */
public class AppException extends RuntimeException {
    private final int status;
    private final String code;
    private final transient List<Map<String, Object>> details;

    public AppException(String message, int status, String code) { this(message, status, code, null); }

    public AppException(String message, int status, String code, List<Map<String, Object>> details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }

    public int status() { return status; }
    public String code() { return code; }
    public List<Map<String, Object>> details() { return details; }

    // ---- Errores tipados (uno por situación) ----
    public static class Validation extends AppException {
        public Validation(String m) { super(m, 400, "VALIDATION"); }
        public Validation(String m, List<Map<String, Object>> d) { super(m, 400, "VALIDATION", d); }
    }
    public static class Unauthorized extends AppException {
        public Unauthorized(String m) { super(m, 401, "UNAUTHORIZED"); }
    }
    public static class Forbidden extends AppException {
        public Forbidden() { this("Tu rol no permite esta acción"); }
        public Forbidden(String m) { super(m, 403, "FORBIDDEN"); }
    }
    public static class NotFound extends AppException {
        public NotFound() { this("Recurso no encontrado"); }
        public NotFound(String m) { super(m, 404, "NOT_FOUND"); }
    }
    public static class Conflict extends AppException {
        public Conflict(String m) { super(m, 409, "CONFLICT"); }
    }
    public static class PayloadTooLarge extends AppException {
        public PayloadTooLarge() { super("Cuerpo demasiado grande", 413, "TOO_LARGE"); }
    }
    public static class TooManyRequests extends AppException {
        public TooManyRequests(String m) { super(m, 429, "TOO_MANY"); }
    }
}
