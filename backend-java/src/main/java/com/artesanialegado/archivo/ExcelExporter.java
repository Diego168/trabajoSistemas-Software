package com.artesanialegado.archivo;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * Exporta reportes a Excel con Apache POI. El código es el mismo para los dos formatos porque usa la interfaz
 * {@link Workbook}: {@code .xlsx} (XSSF, formato actual) y {@code .xls} (HSSF, Excel 97-2003).
 * El texto se escribe siempre como texto (nunca como fórmula), por lo que no hay inyección de fórmulas.
 */
public final class ExcelExporter {
    private ExcelExporter() { }

    public static byte[] toXlsx(String hoja, List<Map<String, Object>> filas, List<String> columnas) {
        return escribir(XSSFWorkbook::new, hoja, filas, columnas);
    }

    public static byte[] toXls(String hoja, List<Map<String, Object>> filas, List<String> columnas) {
        return escribir(HSSFWorkbook::new, hoja, filas, columnas);
    }

    /** true si el formato .xlsx puede usarse (requiere poi-ooxml-schemas completo, que Maven descarga junto con poi-ooxml). */
    public static boolean xlsxDisponible() {
        try (Workbook wb = new XSSFWorkbook()) {
            return wb != null;
        } catch (IOException | LinkageError e) {
            return false;
        }
    }

    private static byte[] escribir(Supplier<Workbook> fabrica, String hoja, List<Map<String, Object>> filas, List<String> columnas) {
        try (Workbook wb = fabrica.get(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sh = wb.createSheet(hoja);
            CellStyle negrita = wb.createCellStyle();
            Font f = wb.createFont();
            f.setBold(true);
            negrita.setFont(f);
            Row cab = sh.createRow(0);
            for (int c = 0; c < columnas.size(); c++) {
                Cell cell = cab.createCell(c);
                cell.setCellValue(columnas.get(c));
                cell.setCellStyle(negrita);
            }
            int r = 1;
            for (Map<String, Object> fila : filas) {
                Row row = sh.createRow(r++);
                for (int c = 0; c < columnas.size(); c++) {
                    Object v = fila.get(columnas.get(c));
                    if (v == null) continue;   // celda vacía: no se crea
                    Cell cell = row.createCell(c);
                    if (v instanceof BigDecimal b) cell.setCellValue(b.doubleValue());
                    else if (v instanceof Number n) cell.setCellValue(n.doubleValue());
                    else if (v instanceof Boolean b) cell.setCellValue(b);
                    else cell.setCellValue(String.valueOf(v));
                }
            }
            for (int c = 0; c < columnas.size(); c++) sh.setColumnWidth(c, Math.min(60, Math.max(12, columnas.get(c).length() + 4)) * 256);
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
