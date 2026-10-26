package com.artesanialegado.logging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class EventLogger {
    private static final Pattern SENSIBLE = Pattern.compile("^(authorization|token|password|clave|secret)$", Pattern.CASE_INSENSITIVE);
    private static final ObjectMapper JSON = new ObjectMapper();
    private final Logger log;

    public EventLogger(Class<?> origen) { this(LoggerFactory.getLogger(origen)); }
    public EventLogger(Logger log) { this.log = log; }

    public void debug(String msg, Map<String, ?> extra) { if (log.isDebugEnabled()) log.debug(linea("DEBUG", msg, extra)); }
    public void info(String msg, Map<String, ?> extra) { if (log.isInfoEnabled()) log.info(linea("INFO", msg, extra)); }
    public void warn(String msg, Map<String, ?> extra) { if (log.isWarnEnabled()) log.warn(linea("WARN", msg, extra)); }
    public void error(String msg, Map<String, ?> extra) { if (log.isErrorEnabled()) log.error(linea("ERROR", msg, extra)); }

    /** Construye la línea JSON con los datos sensibles ya ocultos (público para poder probarlo). */
    public static String linea(String nivel, String msg, Map<String, ?> extra) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("ts", Instant.now().toString());
        m.put("level", nivel);
        m.put("msg", msg);
        if (extra != null) extra.forEach((k, v) -> m.put(k, SENSIBLE.matcher(k).matches() ? "***" : v));
        try {
            return JSON.writeValueAsString(m);
        } catch (JsonProcessingException e) {
            return "{\"level\":\"ERROR\",\"msg\":\"no se pudo serializar el evento\"}";
        }
    }
}
