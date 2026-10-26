"use strict";
let encargos = [], clientes = [], talleres = [], artesanos = [];
montarShell({ activa: "encargos.html", titulo: "Encargos y fidelización", descripcion: "Pedidos a medida por cliente. Cada entrega suma 50 puntos de fidelización.",
  acciones: '<button class="btn primary" id="nuevo" type="button">Nuevo encargo</button>' });
$("#main").insertAdjacentHTML("beforeend", '<div class="pos"><section id="lista" aria-label="Encargos"></section><aside class="panel ticket" aria-label="Clientes con más puntos"><header><h2>Clientes con más puntos</h2></header><div class="body" id="top"></div></aside></div>');
const ORDEN = ["REGISTRADO", "EN_PRODUCCION", "ENTREGADO"];
const FILTROS = { opciones: [["TODOS", "Todos"], ["REGISTRADO", "Registrados"], ["EN_PRODUCCION", "En producción"], ["ENTREGADO", "Entregados"]], test: (f, v) => f.estado === v };
const pasos = (estado) => `<span class="pipe" aria-hidden="true">${ORDEN.map((_, n) => `<i class="${n <= ORDEN.indexOf(estado) ? "on" : ""}"></i>`).join("")}</span>`;
const hoy = () => new Date().toISOString().slice(0, 10);
const atrasado = (e) => e.estado !== "ENTREGADO" && e.fecha_entrega && e.fecha_entrega < hoy();

async function cargar() {
  cargando("#lista");
  try { [encargos, clientes, talleres, artesanos] = await Promise.all([api("/api/encargos"), api("/api/clientes"), api("/api/talleres"), api("/api/artesanos")]); }
  catch (e) { $("#lista").innerHTML = `<div class="panel empty"><b>No se pudieron cargar los encargos</b>${esc(e.message)}</div>`; return; }
  tabla({ el: "#lista", etiqueta: "encargos", buscar: ["cliente", "descripcion", "taller", "artesano"], filtros: FILTROS, vacio: "<b>Aún no hay encargos</b>Registra el primero con «Nuevo encargo».",
    columnas: [{ t: "Cliente", k: "cliente" }, { t: "Encargo", k: "descripcion", html: (e) => `${esc(e.descripcion)}<br><small class="count">${esc(e.taller)} · ${esc(e.artesano || "Sin artesano")}</small>` },
      { t: "Entrega", k: "fecha_entrega", html: (e) => fmtFecha(e.fecha_entrega) + (atrasado(e) ? ' <span class="badge b-bad">Atrasado</span>' : "") },
      { t: "Avance", valor: (e) => ORDEN.indexOf(e.estado), html: (e) => `${badge(e.estado)}<br>${pasos(e.estado)}` }],
    filas: encargos, acciones: (e) => `${e.estado !== "ENTREGADO" ? `<button class="btn sm primary" data-ent="${e.id_encargo}">Entregar</button> ` : ""}<button class="btn sm link" data-edit="${e.id_encargo}">Editar</button> <button class="btn sm link danger" data-del="${e.id_encargo}" aria-label="Eliminar encargo de ${esc(e.cliente)}">Eliminar</button>` });
  const top = [...clientes].sort((a, b) => b.puntos_fidelizacion - a.puntos_fidelizacion).slice(0, 6);
  $("#top").innerHTML = top.length ? top.map((c) => `<div class="line"><div>${esc(c.nombre)}<small>${esc(c.tipo.charAt(0) + c.tipo.slice(1).toLowerCase())}</small></div><b class="num">${fmtNum(c.puntos_fidelizacion)} pts</b></div>`).join("") : '<div class="empty">Aún no hay clientes.</div>';
}
function formulario(e = {}) {
  return selector("Cliente", "id_cliente", clientes.map((c) => [c.id_cliente, c.nombre]), e.id_cliente, { full: true }) + selector("Taller", "id_taller", talleres.map((t) => [t.id_taller, t.nombre]), e.id_taller)
    + selector("Artesano", "id_artesano", artesanos.map((a) => [a.id_artesano, `${a.nombre} (${a.taller})`]), e.id_artesano, { req: false, vacio: "Por asignar" })
    + campo("Descripción del encargo", "descripcion", { valor: e.descripcion, full: true, attrs: `maxlength="300" ${textoSeguro}` }) + campo("Fecha de entrega", "fecha_entrega", { tipo: "date", valor: e.fecha_entrega, req: false })
    + selector("Estado", "estado", [["REGISTRADO", "Registrado"], ["EN_PRODUCCION", "En producción"], ["ENTREGADO", "Entregado"]], e.estado || "REGISTRADO");
}
function editor(e) {
  abrirModal({ titulo: e ? "Editar encargo" : "Nuevo encargo", campos: formulario(e || {}), enviar: e ? "Guardar cambios" : "Crear encargo",
    onSubmit: async (d) => { await api(e ? `/api/encargos/${e.id_encargo}` : "/api/encargos", { method: e ? "PUT" : "POST", body: d }); toast(e ? "Encargo actualizado" : "Encargo creado"); await cargar(); } });
}
$("#nuevo").addEventListener("click", () => editor());
document.addEventListener("click", async (ev) => {
  const id = (a) => Number(ev.target.closest(`[data-${a}]`)?.dataset[a]);
  if (ev.target.closest("[data-edit]")) editor(encargos.find((e) => e.id_encargo === id("edit")));
  else if (ev.target.closest("[data-ent]")) {
    const e = encargos.find((x) => x.id_encargo === id("ent"));
    if (await confirmar({ titulo: "Registrar entrega", texto: `Se marcará como entregado el encargo de ${e.cliente} y se sumarán 50 puntos a su cuenta.`, si: "Registrar entrega" })) {
      try { await api("/api/encargos/entregar", { method: "POST", body: { id_encargo: e.id_encargo } }); toast(`Entrega registrada: +50 puntos para ${e.cliente}`); await cargar(); } catch (x) { toast(x.message, "error"); } }
  } else if (ev.target.closest("[data-del]")) {
    const e = encargos.find((x) => x.id_encargo === id("del"));
    if (await confirmar({ titulo: "Eliminar encargo", texto: `Se eliminará el encargo de ${e.cliente}. Esta acción no se puede deshacer.`, si: "Eliminar encargo", peligro: true })) {
      try { await api(`/api/encargos/${e.id_encargo}`, { method: "DELETE" }); toast("Encargo eliminado"); await cargar(); } catch (x) { toast(x.message, "error"); } }
  }
});
cargar();
