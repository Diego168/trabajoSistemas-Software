package com.artesanialegado.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.artesanialegado.domain.Etapas;
import com.artesanialegado.dto.Dtos;
import com.artesanialegado.error.AppException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class DominioTest {

    // ---------------- Etapas por taller ----------------
    @Test @DisplayName("cada técnica tiene su propio proceso")
    void etapas() {
        assertEquals(List.of("MODELADO", "SECADO", "COCCION", "ACABADO"), Etapas.deTaller("Alfarería y cerámica"));
        assertEquals(List.of("MODELADO", "TALLADO", "ACABADO"), Etapas.deTaller("Tallado en madera"));
        assertEquals(List.of("MODELADO", "TALLADO", "ACABADO"), Etapas.deTaller("Ebanistería"));
        assertEquals(List.of("TEJIDO", "ACABADO"), Etapas.deTaller("Hilados y tejidos"));
        assertEquals(Etapas.TODAS, Etapas.deTaller("Joyería"));
        assertEquals(Etapas.TODAS, Etapas.deTaller(null));
    }

    // ---------------- DTO ----------------
    @Test @DisplayName("PiezaDto normaliza los datos válidos y aplica el estado por defecto")
    void piezaValida() {
        Dtos.Pieza p = Dtos.Pieza.from(Map.of("codigo", " PZ-9 ", "nombre", "Jarrón", "tecnica", "Cerámica", "id_taller", 1, "precio", "99.5"));
        assertEquals("PZ-9", p.codigo());
        assertEquals(new BigDecimal("99.5"), p.precio());
        assertEquals("EN_PRODUCCION", p.estado());
    }

    @Test @DisplayName("rechaza caracteres peligrosos, campos obligatorios, números y estados inválidos")
    void piezaInvalida() {
        Map<String, Object> ok = Map.of("codigo", "A1", "nombre", "x", "tecnica", "t", "id_taller", 1, "precio", 10);
        assertThrows(AppException.Validation.class, () -> Dtos.Pieza.from(Map.of("codigo", "A1", "nombre", "<script>", "tecnica", "t", "id_taller", 1, "precio", 10)));
        assertThrows(AppException.Validation.class, () -> Dtos.Pieza.from(Map.of("nombre", "x", "tecnica", "t", "id_taller", 1, "precio", 10)));
        assertThrows(AppException.Validation.class, () -> Dtos.Pieza.from(Map.of("codigo", "A1", "nombre", "x", "tecnica", "t", "id_taller", 1, "precio", -1)));
        assertThrows(AppException.Validation.class, () -> Dtos.Pieza.from(Map.of("codigo", "A1", "nombre", "x", "tecnica", "t", "id_taller", 0, "precio", 1)));
        assertThrows(AppException.Validation.class, () -> Dtos.Pieza.from(Map.of("codigo", "A1", "nombre", "x", "tecnica", "t", "id_taller", 1.5, "precio", 1)));
        assertThrows(AppException.Validation.class, () -> Dtos.Pieza.from(Map.of("codigo", "A1", "nombre", "x", "tecnica", "t", "id_taller", 1, "precio", "abc")));
        assertThrows(AppException.Validation.class, () -> Dtos.Pieza.from(java.util.stream.Stream.of(ok).flatMap(m -> m.entrySet().stream()).collect(java.util.stream.Collectors.toMap(Map.Entry::getKey, e -> e.getKey().equals("precio") ? (Object) "-" : e.getValue()))));
        assertThrows(AppException.Validation.class, () -> Dtos.Pieza.from("no es un objeto"));
        assertThrows(AppException.Validation.class, () -> Dtos.Pieza.from(Map.of("codigo", "A".repeat(21), "nombre", "x", "tecnica", "t", "id_taller", 1, "precio", 1)));
    }

    @Test @DisplayName("la venta descarta el precio enviado por el cliente y limita los ítems")
    void venta() {
        Dtos.Venta v = Dtos.Venta.from(Map.of("canal", "TIENDA", "items", List.of(Map.of("id_pieza", 1, "cantidad", 2, "precio", 1))));
        assertEquals(1, v.items().size());
        assertEquals(2, v.items().get(0).cantidad());
        assertNull(v.idCliente());
        assertThrows(AppException.Validation.class, () -> Dtos.Venta.from(Map.of("canal", "TIENDA", "items", List.of())));
        assertThrows(AppException.Validation.class, () -> Dtos.Venta.from(Map.of("canal", "OTRO", "items", List.of(Map.of("id_pieza", 1, "cantidad", 1)))));
        assertThrows(AppException.Validation.class, () -> Dtos.Venta.from(Map.of("canal", "TIENDA", "items", List.of(Map.of("id_pieza", 1, "cantidad", 0)))));
        List<Object> muchos = java.util.Collections.nCopies(51, Map.of("id_pieza", 1, "cantidad", 1));
        assertThrows(AppException.Validation.class, () -> Dtos.Venta.from(Map.of("canal", "TIENDA", "items", muchos)));
    }

    @Test @DisplayName("cliente: documento y teléfono con formato, tipo por defecto PARTICULAR")
    void cliente() {
        Dtos.Cliente c = Dtos.Cliente.from(Map.of("nombre", "Ana", "documento", "45678912"));
        assertEquals("PARTICULAR", c.tipo());
        assertNull(c.telefono());
        assertThrows(AppException.Validation.class, () -> Dtos.Cliente.from(Map.of("nombre", "Ana", "documento", "12")));
        assertThrows(AppException.Validation.class, () -> Dtos.Cliente.from(Map.of("nombre", "Ana", "documento", "45678912", "telefono", "abc")));
        assertThrows(AppException.Validation.class, () -> Dtos.Cliente.from(Map.of("nombre", "Ana", "documento", "45678912", "tipo", "VIP")));
    }

    @Test @DisplayName("fechas: formato AAAA-MM-DD y calendario real")
    void fechas() {
        assertEquals("2026-10-15", Dtos.Encargo.from(Map.of("id_cliente", 1, "id_taller", 1, "descripcion", "d", "fecha_entrega", "2026-10-15")).fechaEntrega());
        assertThrows(AppException.Validation.class, () -> Dtos.Encargo.from(Map.of("id_cliente", 1, "id_taller", 1, "descripcion", "d", "fecha_entrega", "15/10/2026")));
        assertThrows(AppException.Validation.class, () -> Dtos.Encargo.from(Map.of("id_cliente", 1, "id_taller", 1, "descripcion", "d", "fecha_entrega", "2026-02-30")));
    }

    @Test @DisplayName("identificadores: enteros positivos")
    void ids() {
        assertEquals(5, Dtos.id(5L));
        assertEquals(5, Dtos.id("5"));
        assertThrows(AppException.Validation.class, () -> Dtos.id(0));
        assertThrows(AppException.Validation.class, () -> Dtos.id("x"));
        assertTrue(Dtos.Insumo.from(Map.of("nombre", "a", "categoria", "b", "unidad", "kg", "id_taller", 1)).stock().signum() == 0);
    }
}
