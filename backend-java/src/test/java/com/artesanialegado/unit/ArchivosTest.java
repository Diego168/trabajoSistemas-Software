package com.artesanialegado.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.artesanialegado.archivo.CsvCodec;
import com.artesanialegado.archivo.ExcelExporter;
import com.artesanialegado.error.AppException;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ArchivosTest {
    private static Map<String, Object> fila(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }

    @Test @DisplayName("CSV: cabecera, CRLF y comillas según RFC 4180")
    void escribe() {
        String csv = CsvCodec.toCsv(List.of(fila("a", "uno, dos", "b", "dijo \"hola\"", "c", 5)), List.of("a", "b", "c"));
        assertEquals("a,b,c\r\n\"uno, dos\",\"dijo \"\"hola\"\"\",5\r\n", csv);
    }

    @Test @DisplayName("CSV: neutraliza fórmulas (= + - @) para evitar inyección en Excel")
    void inyeccion() {
        String csv = CsvCodec.toCsv(List.of(fila("a", "=1+1", "b", "+cmd", "c", "-5", "d", "@x", "e", "normal")), List.of("a", "b", "c", "d", "e"));
        assertTrue(csv.contains("'=1+1,'+cmd,'-5,'@x,normal"), csv);
    }

    @Test @DisplayName("CSV: lee con BOM, comillas, saltos de línea internos y espacios")
    void lee() {
        String texto = "﻿codigo, nombre \r\nA1,\"Jarrón, grande\"\r\nA2,\"línea1\nlínea2\"\r\n\r\n";
        List<Map<String, Object>> f = CsvCodec.parse(texto);
        assertEquals(2, f.size());
        assertEquals("Jarrón, grande", f.get(0).get("nombre"));
        assertEquals("línea1\nlínea2", f.get(1).get("nombre"));
    }

    @Test @DisplayName("CSV: rechaza comillas sin cerrar y devuelve vacío si solo hay cabecera")
    void malFormado() {
        assertThrows(AppException.Validation.class, () -> CsvCodec.parse("a,b\r\n\"abierta,2\r\n"));
        assertTrue(CsvCodec.parse("a,b\r\n").isEmpty());
    }

    @Test @DisplayName("CSV: escribir y leer da los mismos datos")
    void ida_y_vuelta() {
        String csv = CsvCodec.toCsv(List.of(fila("nombre", "Ñandú, \"el grande\"", "n", 3)), List.of("nombre", "n"));
        List<Map<String, Object>> f = CsvCodec.parse(csv);
        assertEquals("Ñandú, \"el grande\"", f.get(0).get("nombre"));
        assertEquals("3", f.get(0).get("n"));
    }

    @Test @DisplayName("Excel .xls (Apache POI): archivo legible con cabecera en negrita y números como números")
    void excelXls() throws Exception {
        byte[] x = ExcelExporter.toXls("piezas", List.of(fila("codigo", "PZ-1", "precio", new BigDecimal("180.50"), "nota", null)), List.of("codigo", "precio", "nota"));
        assertEquals((byte) 0xD0, x[0]);   // contenedor OLE2 de Excel 97-2003
        try (Workbook wb = WorkbookFactory.create(new ByteArrayInputStream(x))) {
            Sheet sh = wb.getSheet("piezas");
            assertEquals("codigo", sh.getRow(0).getCell(0).getStringCellValue());
            assertTrue(wb.getFontAt(sh.getRow(0).getCell(0).getCellStyle().getFontIndex()).getBold());
            assertEquals("PZ-1", sh.getRow(1).getCell(0).getStringCellValue());
            assertEquals(180.5, sh.getRow(1).getCell(1).getNumericCellValue(), 0.0001);
            assertEquals(null, sh.getRow(1).getCell(2));
        }
    }

    @Test @DisplayName("Excel: un texto que parece fórmula se guarda como texto")
    void excelSinFormulas() throws Exception {
        byte[] x = ExcelExporter.toXls("h", List.of(fila("a", "=SUM(1,2)")), List.of("a"));
        try (Workbook wb = WorkbookFactory.create(new ByteArrayInputStream(x))) {
            assertEquals(org.apache.poi.ss.usermodel.CellType.STRING, wb.getSheet("h").getRow(1).getCell(0).getCellType());
        }
    }

    @Test @DisplayName("Excel .xlsx: mismo código con XSSF (se omite si el entorno no trae poi-ooxml-schemas completo)")
    void excelXlsx() throws Exception {
        org.junit.jupiter.api.Assumptions.assumeTrue(ExcelExporter.xlsxDisponible(), "poi-ooxml-schemas completo no disponible en este entorno");
        byte[] x = ExcelExporter.toXlsx("piezas", List.of(fila("codigo", "PZ-1", "precio", new BigDecimal("180.50"))), List.of("codigo", "precio"));
        assertEquals('P', (char) x[0]);   // un .xlsx es un zip: empieza con "PK"
        try (Workbook wb = WorkbookFactory.create(new ByteArrayInputStream(x))) {
            assertEquals(180.5, wb.getSheet("piezas").getRow(1).getCell(1).getNumericCellValue(), 0.0001);
        }
    }
}
