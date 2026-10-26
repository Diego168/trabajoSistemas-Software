"use strict";
let insumos = [], talleres = [], proveedores = [];
montarShell({ activa: "insumos.html", titulo: "Insumos y almacén", descripcion: "Controla el stock de materia prima y registra entradas de proveedores.",
  acciones: '<button class="btn primary" id="nuevo" type="button">Nuevo insumo</button>' });
$("#main").insertAdjacentHTML("beforeend", '<div id="aviso"></div><div id="lista"></div>');
const bajo = (i) => Number(i.stock) <= Number(i.stock_minimo);
const FILTROS = { opciones: [["TODOS", "Todos"], ["BAJO", "Stock bajo"], ["OK", "Stock suficiente"]], test: (f, v) => (v === "BAJO" ? bajo(f) : !bajo(f)) };

async function cargar() {
  cargando("#lista");
  try { [insumos, talleres, proveedores] = await Promise.all([api("/api/insumos"), api("/api/talleres"), api("/api/proveedores")]); }
  catch (e) { $("#lista").innerHTML = `<div class="panel empty"><b>No se pudo cargar el inventario</b>${esc(e.message)}</div>`; return; }
  const n = insumos.filter(bajo).length;
  $("#aviso").innerHTML = n ? `<div class="aviso" role="status"><b>${n} insumo(s) en o bajo el stock mínimo.</b> Filtra por «Stock bajo» para ver cuáles reponer.</div>` : "";
  tabla({ el: "#lista", etiqueta: "insumos", buscar: ["nombre", "categoria", "taller", "proveedor"], filtros: FILTROS, vacio: "<b>Aún no hay insumos</b>Crea el primero o importa un CSV.",
    columnas: [{ t: "Insumo", k: "nombre" }, { t: "Taller", k: "taller" }, { t: "Proveedor", k: "proveedor", html: (i) => esc(i.proveedor || "—") },
      { t: "Stock", k: "stock", num: true, html: (i) => `${fmtNum(i.stock)} ${esc(i.unidad)}<span class="stockbar${bajo(i) ? " low" : ""}"><i style="width:${Math.min(100, Math.round((i.stock / Math.max(i.stock_minimo * 2, 1)) * 100))}%"></i></span>` },
      { t: "Mínimo", k: "stock_minimo", num: true, html: (i) => `${fmtNum(i.stock_minimo)} ${esc(i.unidad)}` },
      { t: "Estado", valor: bajo, html: (i) => (bajo(i) ? '<span class="badge b-bad">Reponer</span>' : '<span class="badge b-ok">Suficiente</span>') }],
    filas: insumos, acciones: (i) => `<button class="btn sm primary" data-ent="${i.id_insumo}">Registrar entrada</button> <button class="btn sm link" data-edit="${i.id_insumo}">Editar</button> <button class="btn sm link danger" data-del="${i.id_insumo}" aria-label="Eliminar ${esc(i.nombre)}">Eliminar</button>` });
}
const completo = (i) => insumos.find((x) => x.id_insumo === i);
function formulario(i = {}) {
  return campo("Nombre", "nombre", { valor: i.nombre, full: true, attrs: `maxlength="100" ${textoSeguro}` }) + campo("Categoría", "categoria", { valor: i.categoria, attrs: `maxlength="40" ${textoSeguro}`, ayuda: "Ej.: Materia prima" })
    + campo("Unidad", "unidad", { valor: i.unidad, attrs: `maxlength="20" ${textoSeguro}`, ayuda: "kg, m, unidad…" }) + campo("Stock actual", "stock", { tipo: "number", valor: i.stock ?? 0, attrs: 'min="0" step="0.01"' })
    + campo("Stock mínimo", "stock_minimo", { tipo: "number", valor: i.stock_minimo ?? 0, attrs: 'min="0" step="0.01"' }) + selector("Taller", "id_taller", talleres.map((t) => [t.id_taller, t.nombre]), i.id_taller)
    + selector("Proveedor", "id_proveedor", proveedores.map((p) => [p.id_proveedor, p.nombre]), i.id_proveedor, { req: false, vacio: "Sin proveedor" });
}
function editor(i) {
  abrirModal({ titulo: i ? `Editar ${i.nombre}` : "Nuevo insumo", campos: formulario(i || {}), enviar: i ? "Guardar cambios" : "Crear insumo",
    onSubmit: async (d) => { await api(i ? `/api/insumos/${i.id_insumo}` : "/api/insumos", { method: i ? "PUT" : "POST", body: d }); toast(i ? "Insumo actualizado" : "Insumo creado"); await cargar(); } });
}
$("#nuevo").addEventListener("click", () => editor());
document.addEventListener("click", async (e) => {
  const id = (a) => Number(e.target.closest(`[data-${a}]`)?.dataset[a]);
  if (e.target.closest("[data-edit]")) editor(completo(id("edit")));
  else if (e.target.closest("[data-ent]")) {
    const i = completo(id("ent"));
    abrirModal({ titulo: `Registrar entrada · ${i.nombre}`, ayuda: `Stock actual: ${fmtNum(i.stock)} ${i.unidad}.`, campos: campo("Cantidad recibida", "cantidad", { tipo: "number", attrs: 'min="0.01" step="0.01"', full: true }), enviar: "Registrar entrada",
      onSubmit: async (d) => { const r = await api("/api/insumos/entrada", { method: "POST", body: { id_insumo: i.id_insumo, cantidad: Number(d.cantidad) } }); toast(`Entrada registrada. Nuevo stock: ${fmtNum(r.stock)} ${i.unidad}`); await cargar(); } });
  } else if (e.target.closest("[data-del]")) {
    const i = completo(id("del"));
    if (await confirmar({ titulo: "Eliminar insumo", texto: `Se eliminará ${i.nombre}. Esta acción no se puede deshacer.`, si: "Eliminar insumo", peligro: true })) {
      try { await api(`/api/insumos/${i.id_insumo}`, { method: "DELETE" }); toast("Insumo eliminado"); await cargar(); } catch (x) { toast(x.message, "error"); } }
  }
});
cargar();
