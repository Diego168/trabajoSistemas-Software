package com.artesanialegado.dto;

import com.artesanialegado.error.AppException;
import com.google.common.base.CharMatcher;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Collection;
import java.util.Map;
import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;

/** Validadores reutilizables de los DTO: validan y normalizan lo que entra; nada llega sin pasar por aquí. */
final class Campos {
    static final CharMatcher PROHIBIDOS = CharMatcher.anyOf("<>\"'`\\");
    static final ImmutableSet<String> ESTADOS_PIEZA = ImmutableSet.of("EN_PRODUCCION", "DISPONIBLE", "VENDIDA");
    static final ImmutableSet<String> CANALES = ImmutableSet.of("TIENDA", "FERIA", "EN_LINEA");
    static final ImmutableSet<String> ETAPAS = ImmutableSet.of("MODELADO", "SECADO", "COCCION", "TALLADO", "TEJIDO", "ACABADO");
    static final ImmutableSet<String> ESTADOS_ENCARGO = ImmutableSet.of("REGISTRADO", "EN_PRODUCCION", "ENTREGADO");
    static final ImmutableSet<String> TIPOS_CLIENTE = ImmutableSet.of("COLECCIONISTA", "MAYORISTA", "PARTICULAR");
    private static final Pattern FECHA = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");

    private Campos() { }

    static AppException.Validation error(String m) { return new AppException.Validation(m); }

    @SuppressWarnings("unchecked")
    static Map<String, Object> obj(Object b) {
        if (!(b instanceof Map)) throw error("Cuerpo inválido");
        return (Map<String, Object>) b;
    }

    static boolean vacio(Object v) { return v == null || (v instanceof String s && s.isEmpty()); }

    static String str(Object v, String campo, int max, boolean req) {
        if (vacio(v)) { if (req) throw error(campo + " es obligatorio"); return null; }
        if (!(v instanceof String)) throw error(campo + " debe ser texto");
        String s = ((String) v).trim();
        if (req && s.isEmpty()) throw error(campo + " es obligatorio");
        if (s.length() > max) throw error(campo + " excede " + max + " caracteres");
        if (PROHIBIDOS.matchesAnyOf(s)) throw error(campo + " contiene caracteres no permitidos");
        return s;
    }

    static Integer entero(Object v, String campo, int min, boolean req) {
        if (vacio(v)) { if (req) throw error(campo + " es obligatorio"); return null; }
        BigDecimal n = numero(v, campo + " debe ser un entero >= " + min);
        if (n.stripTrailingZeros().scale() > 0 || n.compareTo(BigDecimal.valueOf(min)) < 0 || n.compareTo(BigDecimal.valueOf(Integer.MAX_VALUE)) > 0)
            throw error(campo + " debe ser un entero >= " + min);
        return n.intValueExact();
    }

    static BigDecimal decimal(Object v, String campo, BigDecimal min, boolean req) {
        if (vacio(v)) { if (req) throw error(campo + " es obligatorio"); return null; }
        BigDecimal n = numero(v, campo + " debe ser un número >= " + min.stripTrailingZeros().toPlainString());
        if (n.compareTo(min) < 0) throw error(campo + " debe ser un número >= " + min.stripTrailingZeros().toPlainString());
        return n;
    }

    private static BigDecimal numero(Object v, String mensaje) {
        try {
            if (v instanceof Number || v instanceof String) return new BigDecimal(v.toString().trim());
        } catch (NumberFormatException e) {
            // cae al error de abajo
        }
        throw error(mensaje);
    }

    static String uno(Object v, String campo, Collection<String> permitidos, String porDefecto) {
        Object x = vacio(v) ? porDefecto : v;
        if (!(x instanceof String) || !permitidos.contains(x)) throw error(campo + " inválido");
        return (String) x;
    }

    static String fecha(Object v, String campo, boolean req) {
        if (vacio(v)) { if (req) throw error(campo + " es obligatorio"); return null; }
        String s = String.valueOf(v);
        try {
            if (!FECHA.matcher(s).matches()) throw new DateTimeParseException("x", s, 0);
            LocalDate.parse(s);
            return s;
        } catch (DateTimeParseException e) {
            throw error(campo + " debe tener formato AAAA-MM-DD");
        }
    }

    static String patron(Object v, String campo, Pattern re, String msg, boolean req) {
        String s = str(v, campo, 20, req);
        if (StringUtils.isNotEmpty(s) && !re.matcher(s).matches()) throw error(campo + " " + msg);
        return s;
    }

    static ImmutableList<Object> lista(Object v) { return v instanceof java.util.List<?> l ? ImmutableList.copyOf(l) : ImmutableList.of(); }
}
