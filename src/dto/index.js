const { ValidationError } = require("../errors");
const BAD = /[<>"'`\\]/;
const ESTADOS_PIEZA = ["EN_PRODUCCION", "DISPONIBLE", "VENDIDA"];
const CANALES = ["TIENDA", "FERIA", "EN_LINEA"];
const ETAPAS = ["MODELADO", "SECADO", "COCCION", "TALLADO", "TEJIDO", "ACABADO"];
const ESTADOS_ENCARGO = ["REGISTRADO", "EN_PRODUCCION", "ENTREGADO"];

function str(v, campo, { max = 100, req = true } = {}) {
  if (v === undefined || v === null || v === "") { if (req) throw new ValidationError(`${campo} es obligatorio`); return null; }
  if (typeof v !== "string") throw new ValidationError(`${campo} debe ser texto`);
  const s = v.trim();
  if (req && !s) throw new ValidationError(`${campo} es obligatorio`);
  if (s.length > max) throw new ValidationError(`${campo} excede ${max} caracteres`);
  if (BAD.test(s)) throw new ValidationError(`${campo} contiene caracteres no permitidos`);
  return s;
}
function int(v, campo, { min = 1, req = true } = {}) {
  if (v === undefined || v === null || v === "") { if (req) throw new ValidationError(`${campo} es obligatorio`); return null; }
  const n = Number(v);
  if (!Number.isInteger(n) || n < min) throw new ValidationError(`${campo} debe ser un entero >= ${min}`);
  return n;
}
function num(v, campo, { min = 0, req = true } = {}) {
  if (v === undefined || v === null || v === "") { if (req) throw new ValidationError(`${campo} es obligatorio`); return null; }
  const n = Number(v);
  if (!Number.isFinite(n) || n < min) throw new ValidationError(`${campo} debe ser un número >= ${min}`);
  return n;
}
function oneOf(v, campo, list, def) {
  const x = v === undefined || v === null || v === "" ? def : v;
  if (!list.includes(x)) throw new ValidationError(`${campo} inválido`);
  return x;
}
function fecha(v, campo, req = false) {
  if (!v) { if (req) throw new ValidationError(`${campo} es obligatorio`); return null; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(Date.parse(v))) throw new ValidationError(`${campo} debe tener formato AAAA-MM-DD`);
  return v;
}
const obj = (b) => { if (!b || typeof b !== "object" || Array.isArray(b)) throw new ValidationError("Cuerpo inválido"); return b; };

const IdDTO = { from(v) { return int(v, "id"); } };
const PiezaDTO = { from(b) { b = obj(b); return {
  codigo: str(b.codigo, "codigo", { max: 20 }), nombre: str(b.nombre, "nombre"), tecnica: str(b.tecnica, "tecnica", { max: 40 }),
  id_taller: int(b.id_taller, "id_taller"), precio: num(b.precio, "precio"), estado: oneOf(b.estado, "estado", ESTADOS_PIEZA, "EN_PRODUCCION") }; } };
const VentaDTO = { from(b) {
  b = obj(b);
  if (!Array.isArray(b.items) || b.items.length === 0 || b.items.length > 50) throw new ValidationError("La venta requiere entre 1 y 50 ítems");
  return { id_cliente: int(b.id_cliente, "id_cliente", { req: false }), canal: oneOf(b.canal, "canal", CANALES),
    // El precio NUNCA se toma del cliente: se descarta y el servicio lo lee de la BD.
    items: b.items.map((it) => ({ id_pieza: int(obj(it).id_pieza, "id_pieza"), cantidad: int(it.cantidad, "cantidad") })) }; } };
const InsumoDTO = { from(b) { b = obj(b); return {
  nombre: str(b.nombre, "nombre"), categoria: str(b.categoria, "categoria", { max: 40 }), unidad: str(b.unidad, "unidad", { max: 20 }),
  stock: num(b.stock, "stock", { req: false }) ?? 0, stock_minimo: num(b.stock_minimo, "stock_minimo", { req: false }) ?? 0,
  id_taller: int(b.id_taller, "id_taller"), id_proveedor: int(b.id_proveedor, "id_proveedor", { req: false }) }; } };
const EntradaDTO = { from(b) { b = obj(b); return { id_insumo: int(b.id_insumo, "id_insumo"), cantidad: num(b.cantidad, "cantidad", { min: 0.01 }) }; } };
const ProduccionDTO = { from(b) { b = obj(b); return {
  id_pieza: int(b.id_pieza, "id_pieza"), id_artesano: int(b.id_artesano, "id_artesano"),
  // La etapa por defecto depende del taller; la decide el servicio.
  etapa: b.etapa ? oneOf(b.etapa, "etapa", ETAPAS) : null, fecha_inicio: fecha(b.fecha_inicio, "fecha_inicio") }; } };
const AvanceDTO = { from(b) { return { id_produccion: int(obj(b).id_produccion, "id_produccion") }; } };
const EncargoDTO = { from(b) { b = obj(b); return {
  id_cliente: int(b.id_cliente, "id_cliente"), id_taller: int(b.id_taller, "id_taller"), id_artesano: int(b.id_artesano, "id_artesano", { req: false }),
  descripcion: str(b.descripcion, "descripcion", { max: 300 }), fecha_entrega: fecha(b.fecha_entrega, "fecha_entrega"),
  estado: oneOf(b.estado, "estado", ESTADOS_ENCARGO, "REGISTRADO") }; } };
const EntregaDTO = { from(b) { return { id_encargo: int(obj(b).id_encargo, "id_encargo") }; } };
function texto(v, campo, o) { return str(v, campo, o); }
function patron(v, campo, re, msg, req) {
  const s = str(v, campo, { max: 20, req }); if (s !== null && !re.test(s)) throw new ValidationError(`${campo} ${msg}`); return s;
}
const TIPOS_CLIENTE = ["COLECCIONISTA", "MAYORISTA", "PARTICULAR"];
const ClienteDTO = { from(b) { b = obj(b); return {
  nombre: str(b.nombre, "nombre", { max: 120 }), documento: patron(b.documento, "documento", /^[0-9A-Za-z]{6,15}$/, "debe tener entre 6 y 15 letras o números", true),
  tipo: oneOf(b.tipo, "tipo", TIPOS_CLIENTE, "PARTICULAR"), telefono: patron(b.telefono, "telefono", /^[0-9 +()-]{6,20}$/, "solo admite números, espacios y + ( ) -", false) }; } };
const ArtesanoDTO = { from(b) { b = obj(b); return { nombre: str(b.nombre, "nombre"), especialidad: str(b.especialidad, "especialidad", { max: 60 }), id_taller: int(b.id_taller, "id_taller") }; } };
const ProveedorDTO = { from(b) { b = obj(b); return { nombre: str(b.nombre, "nombre"), contacto: str(b.contacto, "contacto", { max: 60, req: false }), tipo_insumo: str(b.tipo_insumo, "tipo_insumo", { max: 40 }) }; } };
module.exports = { ClienteDTO, ArtesanoDTO, ProveedorDTO, TIPOS_CLIENTE, IdDTO, PiezaDTO, VentaDTO, InsumoDTO, EntradaDTO, ProduccionDTO, AvanceDTO, EncargoDTO, EntregaDTO, ETAPAS };
