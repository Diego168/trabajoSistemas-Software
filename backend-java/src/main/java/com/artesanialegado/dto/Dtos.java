package com.artesanialegado.dto;

import static com.artesanialegado.dto.Campos.CANALES;
import static com.artesanialegado.dto.Campos.ESTADOS_ENCARGO;
import static com.artesanialegado.dto.Campos.ESTADOS_PIEZA;
import static com.artesanialegado.dto.Campos.ETAPAS;
import static com.artesanialegado.dto.Campos.TIPOS_CLIENTE;
import static com.artesanialegado.dto.Campos.decimal;
import static com.artesanialegado.dto.Campos.entero;
import static com.artesanialegado.dto.Campos.error;
import static com.artesanialegado.dto.Campos.fecha;
import static com.artesanialegado.dto.Campos.lista;
import static com.artesanialegado.dto.Campos.obj;
import static com.artesanialegado.dto.Campos.patron;
import static com.artesanialegado.dto.Campos.str;
import static com.artesanialegado.dto.Campos.uno;

import com.google.common.collect.ImmutableList;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * DTO de entrada: cada record se construye únicamente con {@code from(...)}, que valida y normaliza,
 * y descarta cualquier campo no esperado.
 */
public final class Dtos {
    private Dtos() { }

    /** Identificador de recurso (>= 1). */
    public static int id(Object v) { return entero(v, "id", 1, true); }

    public record Pieza(String codigo, String nombre, String tecnica, int idTaller, BigDecimal precio, String estado) {
        public static Pieza from(Object body) {
            Map<String, Object> b = obj(body);
            return new Pieza(str(b.get("codigo"), "codigo", 20, true), str(b.get("nombre"), "nombre", 100, true),
                    str(b.get("tecnica"), "tecnica", 40, true), entero(b.get("id_taller"), "id_taller", 1, true),
                    decimal(b.get("precio"), "precio", BigDecimal.ZERO, true), uno(b.get("estado"), "estado", ESTADOS_PIEZA, "EN_PRODUCCION"));
        }
    }

    public record Item(int idPieza, int cantidad) { }

    /** El precio NUNCA se toma del cliente: se descarta y el servicio lo lee de la base de datos. */
    public record Venta(Integer idCliente, String canal, List<Item> items) {
        public static Venta from(Object body) {
            Map<String, Object> b = obj(body);
            ImmutableList<Object> raw = lista(b.get("items"));
            if (raw.isEmpty() || raw.size() > 50) throw error("La venta requiere entre 1 y 50 ítems");
            ImmutableList.Builder<Item> items = ImmutableList.builder();
            for (Object o : raw) {
                Map<String, Object> it = obj(o);
                items.add(new Item(entero(it.get("id_pieza"), "id_pieza", 1, true), entero(it.get("cantidad"), "cantidad", 1, true)));
            }
            return new Venta(entero(b.get("id_cliente"), "id_cliente", 1, false), uno(b.get("canal"), "canal", CANALES, null), items.build());
        }
    }

    public record Insumo(String nombre, String categoria, String unidad, BigDecimal stock, BigDecimal stockMinimo, int idTaller, Integer idProveedor) {
        public static Insumo from(Object body) {
            Map<String, Object> b = obj(body);
            BigDecimal stock = decimal(b.get("stock"), "stock", BigDecimal.ZERO, false);
            BigDecimal min = decimal(b.get("stock_minimo"), "stock_minimo", BigDecimal.ZERO, false);
            return new Insumo(str(b.get("nombre"), "nombre", 100, true), str(b.get("categoria"), "categoria", 40, true),
                    str(b.get("unidad"), "unidad", 20, true), stock == null ? BigDecimal.ZERO : stock, min == null ? BigDecimal.ZERO : min,
                    entero(b.get("id_taller"), "id_taller", 1, true), entero(b.get("id_proveedor"), "id_proveedor", 1, false));
        }
    }

    public record Entrada(int idInsumo, BigDecimal cantidad) {
        public static Entrada from(Object body) {
            Map<String, Object> b = obj(body);
            return new Entrada(entero(b.get("id_insumo"), "id_insumo", 1, true), decimal(b.get("cantidad"), "cantidad", new BigDecimal("0.01"), true));
        }
    }

    /** La etapa por defecto depende del taller; la decide el servicio. */
    public record Produccion(int idPieza, int idArtesano, String etapa, String fechaInicio) {
        public static Produccion from(Object body) {
            Map<String, Object> b = obj(body);
            return new Produccion(entero(b.get("id_pieza"), "id_pieza", 1, true), entero(b.get("id_artesano"), "id_artesano", 1, true),
                    Campos.vacio(b.get("etapa")) ? null : uno(b.get("etapa"), "etapa", ETAPAS, null), fecha(b.get("fecha_inicio"), "fecha_inicio", false));
        }
        public Produccion con(String nuevaEtapa, String nuevaFecha) { return new Produccion(idPieza, idArtesano, nuevaEtapa, nuevaFecha); }
    }

    public record Avance(int idProduccion) {
        public static Avance from(Object body) { return new Avance(entero(obj(body).get("id_produccion"), "id_produccion", 1, true)); }
    }

    public record Encargo(int idCliente, int idTaller, Integer idArtesano, String descripcion, String fechaEntrega, String estado) {
        public static Encargo from(Object body) {
            Map<String, Object> b = obj(body);
            return new Encargo(entero(b.get("id_cliente"), "id_cliente", 1, true), entero(b.get("id_taller"), "id_taller", 1, true),
                    entero(b.get("id_artesano"), "id_artesano", 1, false), str(b.get("descripcion"), "descripcion", 300, true),
                    fecha(b.get("fecha_entrega"), "fecha_entrega", false), uno(b.get("estado"), "estado", ESTADOS_ENCARGO, "REGISTRADO"));
        }
    }

    public record Entrega(int idEncargo) {
        public static Entrega from(Object body) { return new Entrega(entero(obj(body).get("id_encargo"), "id_encargo", 1, true)); }
    }

    public record Cliente(String nombre, String documento, String tipo, String telefono) {
        private static final Pattern DOC = Pattern.compile("^[0-9A-Za-z]{6,15}$");
        private static final Pattern TEL = Pattern.compile("^[0-9 +()-]{6,20}$");
        public static Cliente from(Object body) {
            Map<String, Object> b = obj(body);
            return new Cliente(str(b.get("nombre"), "nombre", 120, true),
                    patron(b.get("documento"), "documento", DOC, "debe tener entre 6 y 15 letras o números", true),
                    uno(b.get("tipo"), "tipo", TIPOS_CLIENTE, "PARTICULAR"),
                    patron(b.get("telefono"), "telefono", TEL, "solo admite números, espacios y + ( ) -", false));
        }
    }

    public record Artesano(String nombre, String especialidad, int idTaller) {
        public static Artesano from(Object body) {
            Map<String, Object> b = obj(body);
            return new Artesano(str(b.get("nombre"), "nombre", 100, true), str(b.get("especialidad"), "especialidad", 60, true),
                    entero(b.get("id_taller"), "id_taller", 1, true));
        }
    }

    public record Proveedor(String nombre, String contacto, String tipoInsumo) {
        public static Proveedor from(Object body) {
            Map<String, Object> b = obj(body);
            return new Proveedor(str(b.get("nombre"), "nombre", 100, true), str(b.get("contacto"), "contacto", 60, false),
                    str(b.get("tipo_insumo"), "tipo_insumo", 40, true));
        }
    }
}
