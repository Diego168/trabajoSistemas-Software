const { ValidationError } = require("../errors");
const { PiezaDTO, InsumoDTO } = require("../dto");
const { toCsv, parseCsv } = require("./CsvService");
const MAX_FILAS = 500;

// Importación / exportación de ficheros CSV para los módulos de Ventas y Logística (y exportación de los demás).
class ArchivoService {
  constructor({ db, ventaService, insumoService, produccionService, encargoService, reporteService }) {
    Object.assign(this, { db, ventaService, insumoService, produccionService, encargoService, reporteService });
    this.entidades = {
      piezas: { cols: ["id_pieza", "codigo", "nombre", "tecnica", "precio", "estado", "id_taller"], datos: () => this.ventaService.catalogo(),
        plantilla: ["codigo", "nombre", "tecnica", "id_taller", "precio", "estado"], dto: PiezaDTO, crear: (d) => this.ventaService.crearPieza(d) },
      insumos: { cols: ["id_insumo", "nombre", "categoria", "unidad", "stock", "stock_minimo", "taller", "proveedor"], datos: () => this.insumoService.listar(),
        plantilla: ["nombre", "categoria", "unidad", "stock", "stock_minimo", "id_taller", "id_proveedor"], dto: InsumoDTO, crear: (d) => this.insumoService.crear(d) },
      produccion: { cols: ["id_produccion", "codigo", "pieza", "artesano", "etapa", "fecha_inicio"], datos: () => this.produccionService.listar() },
      encargos: { cols: ["id_encargo", "cliente", "taller", "artesano", "descripcion", "fecha_entrega", "estado"], datos: () => this.encargoService.listar() },
      ventas: { cols: ["id_venta", "cliente", "fecha", "total", "canal"], datos: () => this.reporteService.ventasPorPeriodo() },
    };
  }
  #ent(nombre) { const e = this.entidades[nombre]; if (!e) throw new ValidationError("Entidad no exportable"); return e; }
  exportar(nombre) { const e = this.#ent(nombre); return { csv: toCsv(e.datos(), e.cols), filename: `${nombre}.csv` }; }
  plantilla(nombre) { const e = this.#ent(nombre); if (!e.plantilla) throw new ValidationError("Esta entidad no admite importación"); return { csv: toCsv([], e.plantilla), filename: `plantilla_${nombre}.csv` }; }
  importar(nombre, csv) {
    const e = this.#ent(nombre);
    if (!e.dto) throw new ValidationError("Esta entidad no admite importación");
    if (typeof csv !== "string" || !csv.trim()) throw new ValidationError("El archivo está vacío");
    const filas = parseCsv(csv);
    if (!filas.length) throw new ValidationError("El archivo no tiene filas de datos");
    if (filas.length > MAX_FILAS) throw new ValidationError(`Máximo ${MAX_FILAS} filas por importación`);
    const faltan = e.plantilla.filter((c) => !(c in filas[0]) && !["estado", "id_proveedor", "stock", "stock_minimo"].includes(c));
    if (faltan.length) throw new ValidationError(`Faltan columnas: ${faltan.join(", ")}`);
    const validos = []; const errores = [];
    filas.forEach((f, i) => { try { validos.push(e.dto.from(f)); } catch (err) { errores.push({ fila: i + 2, error: err.message }); } });
    if (errores.length) { const v = new ValidationError(`${errores.length} fila(s) con errores; no se importó nada`); v.details = errores; throw v; }
    this.db.transaction(() => validos.forEach((d) => e.crear(d)));
    return { importadas: validos.length };
  }
}
module.exports = { ArchivoService };
