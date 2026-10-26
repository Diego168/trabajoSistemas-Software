package com.artesanialegado.archivo;

import com.artesanialegado.config.Database;
import com.artesanialegado.dto.Dtos;
import com.artesanialegado.error.AppException;
import com.artesanialegado.service.EncargoService;
import com.artesanialegado.service.InsumoService;
import com.artesanialegado.service.ProduccionService;
import com.artesanialegado.service.ReporteService;
import com.artesanialegado.service.VentaService;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

/** Importación (solo piezas e insumos) y exportación (CSV y Excel) de datos. */
public class ArchivoService {
    public static final int MAX_FILAS = 500;
    public record Descarga(byte[] bytes, String filename, String contentType) { }

    private record Entidad(List<String> cols, Supplier<List<Map<String, Object>>> datos, List<String> plantilla,
                           Function<Object, Object> dto, Consumer<Object> crear) { }

    private final Database db;
    private final Map<String, Entidad> entidades;

    public ArchivoService(Database db, VentaService ventas, InsumoService insumos, ProduccionService produccion, EncargoService encargos, ReporteService reportes) {
        this.db = db;
        this.entidades = ImmutableMap.of(
                "piezas", new Entidad(ImmutableList.of("id_pieza", "codigo", "nombre", "tecnica", "precio", "estado", "id_taller"), ventas::catalogo,
                        ImmutableList.of("codigo", "nombre", "tecnica", "id_taller", "precio", "estado"), Dtos.Pieza::from, d -> ventas.crearPieza((Dtos.Pieza) d)),
                "insumos", new Entidad(ImmutableList.of("id_insumo", "nombre", "categoria", "unidad", "stock", "stock_minimo", "taller", "proveedor"), insumos::listar,
                        ImmutableList.of("nombre", "categoria", "unidad", "stock", "stock_minimo", "id_taller", "id_proveedor"), Dtos.Insumo::from, d -> insumos.crear((Dtos.Insumo) d)),
                "produccion", new Entidad(ImmutableList.of("id_produccion", "codigo", "pieza", "artesano", "etapa", "fecha_inicio"), produccion::listar, null, null, null),
                "encargos", new Entidad(ImmutableList.of("id_encargo", "cliente", "taller", "artesano", "descripcion", "fecha_entrega", "estado"), encargos::listar, null, null, null),
                "ventas", new Entidad(ImmutableList.of("id_venta", "cliente", "fecha", "total", "canal"), () -> reportes.ventasPorPeriodo(null, null), null, null, null));
    }

    private Entidad ent(String nombre) {
        Entidad e = entidades.get(nombre);
        if (e == null) throw new AppException.Validation("Entidad no exportable");
        return e;
    }

    public Descarga exportarCsv(String nombre) {
        Entidad e = ent(nombre);
        String csv = "﻿" + CsvCodec.toCsv(e.datos().get(), e.cols());
        return new Descarga(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8), nombre + ".csv", "text/csv; charset=utf-8");
    }

    /** formato: "xlsx" (Excel actual) o "xls" (Excel 97-2003). */
    public Descarga exportarExcel(String nombre, String formato) {
        Entidad e = ent(nombre);
        if ("xls".equals(formato))
            return new Descarga(ExcelExporter.toXls(nombre, e.datos().get(), e.cols()), nombre + ".xls", "application/vnd.ms-excel");
        return new Descarga(ExcelExporter.toXlsx(nombre, e.datos().get(), e.cols()), nombre + ".xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    public Descarga plantilla(String nombre) {
        Entidad e = ent(nombre);
        if (e.plantilla() == null) throw new AppException.Validation("Esta entidad no admite importación");
        String csv = "﻿" + CsvCodec.toCsv(List.of(), e.plantilla());
        return new Descarga(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8), "plantilla_" + nombre + ".csv", "text/csv; charset=utf-8");
    }

    /** Todo o nada: si una sola fila es inválida no se importa ninguna y se informa cuáles fallaron. */
    public Map<String, Object> importar(String nombre, Object csv) {
        Entidad e = ent(nombre);
        if (e.dto() == null) throw new AppException.Validation("Esta entidad no admite importación");
        if (!(csv instanceof String texto) || texto.isBlank()) throw new AppException.Validation("El archivo está vacío");
        List<Map<String, Object>> filas = CsvCodec.parse(texto);
        if (filas.isEmpty()) throw new AppException.Validation("El archivo no tiene filas de datos");
        if (filas.size() > MAX_FILAS) throw new AppException.Validation("Máximo " + MAX_FILAS + " filas por importación");
        List<String> opcionales = List.of("estado", "id_proveedor", "stock", "stock_minimo");
        List<String> faltan = e.plantilla().stream().filter(c -> !filas.get(0).containsKey(c) && !opcionales.contains(c)).toList();
        if (!faltan.isEmpty()) throw new AppException.Validation("Faltan columnas: " + String.join(", ", faltan));
        List<Object> validos = new ArrayList<>();
        List<Map<String, Object>> errores = new ArrayList<>();
        for (int i = 0; i < filas.size(); i++) {
            try {
                validos.add(e.dto().apply(filas.get(i)));
            } catch (AppException.Validation ex) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("fila", i + 2);
                err.put("error", ex.getMessage());
                errores.add(err);
            }
        }
        if (!errores.isEmpty()) throw new AppException.Validation(errores.size() + " fila(s) con errores; no se importó nada", errores);
        db.transaction(() -> { validos.forEach(e.crear()); return null; });
        return Map.of("importadas", validos.size());
    }
}
