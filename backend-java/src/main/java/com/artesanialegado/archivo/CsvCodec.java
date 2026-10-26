package com.artesanialegado.archivo;

import com.artesanialegado.error.AppException;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.lang3.StringUtils;

/** Lectura y escritura de CSV (RFC 4180, Apache Commons CSV) con protección contra inyección de fórmulas. */
public final class CsvCodec {
    private CsvCodec() { }

    /** Una celda de texto que empiece con = + - @ se interpretaría como fórmula en Excel: se antepone una comilla simple. */
    static Object neutralizar(Object v) {
        if (v instanceof String s && !s.isEmpty() && "=+-@\t\r".indexOf(s.charAt(0)) >= 0) return "'" + s;
        return v;
    }

    public static String toCsv(List<Map<String, Object>> filas, List<String> columnas) {
        StringWriter out = new StringWriter();
        try (CSVPrinter p = new CSVPrinter(out, CSVFormat.RFC4180)) {
            p.printRecord(columnas);
            for (Map<String, Object> f : filas) {
                List<Object> celdas = new ArrayList<>();
                for (String c : columnas) celdas.add(neutralizar(f.get(c)));
                p.printRecord(celdas);
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return out.toString();
    }

    /** Devuelve una fila por registro (clave = nombre de columna). Rechaza archivos mal formados. */
    public static List<Map<String, Object>> parse(String texto) {
        String src = StringUtils.removeStart(texto, "﻿");
        CSVFormat fmt = CSVFormat.RFC4180.builder().setHeader().setSkipHeaderRecord(true).setTrim(true).setIgnoreEmptyLines(true).build();
        List<Map<String, Object>> filas = new ArrayList<>();
        try (CSVParser parser = CSVParser.parse(new StringReader(src), fmt)) {
            for (CSVRecord r : parser) {
                Map<String, Object> fila = new LinkedHashMap<>();
                for (String h : parser.getHeaderNames()) fila.put(h.trim(), r.isMapped(h) && r.isSet(h) ? r.get(h) : "");
                if (fila.values().stream().anyMatch(v -> !String.valueOf(v).isBlank())) filas.add(fila);
            }
        } catch (IOException | IllegalArgumentException | IllegalStateException e) {
            throw new AppException.Validation("El archivo CSV no tiene un formato válido");
        }
        return filas;
    }
}
