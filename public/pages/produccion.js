"use strict";
const ETQ = { MODELADO: "Modelado", SECADO: "Secado", COCCION: "Cocción", TALLADO: "Tallado", TEJIDO: "Tejido", ACABADO: "Acabado" };
let trabajos = [], piezas = [], artesanos = [], talleres = [], idTaller = null, filtroArtesano = "";
montarShell({ activa: "produccion.html", titulo: "Producción por taller", descripcion: "Cada taller tiene su propio tablero, sus artesanos, sus piezas y su proceso. Avanza una pieza cuando el artesano termine la etapa; al cerrar el acabado queda disponible para la venta.",
  acciones: '<button class="btn primary" id="nuevo" type="button">Nuevo registro</button>' });
$("#main").insertAdjacentHTML("beforeend", '<div class="talleres" id="tabs" role="tablist" aria-label="Talleres"></div><p class="taller-info" id="info"></p><div class="toolbar"><label class="sr" for="fa">Filtrar por artesano</label><select id="fa" style="max-width:280px"></select><span class="count" id="cuenta" aria-live="polite"></span></div><div class="board" id="tablero" aria-label="Tablero del taller"></div>');
const taller = () => talleres.find((t) => t.id_taller === idTaller);
const delTaller = (id) => trabajos.filter((t) => t.id_taller === id);

function pintarTabs() {
  $("#tabs").innerHTML = talleres.map((t) => `<button class="taller-tab" role="tab" type="button" data-taller="${t.id_taller}" aria-selected="${t.id_taller === idTaller}" style="--c:${colorTec(t.tecnica)}">${esc(t.nombre)} <small>${delTaller(t.id_taller).filter((x) => !x.fecha_fin).length}</small></button>`).join("");
}
function pintar() {
  const t = taller(); if (!t) { $("#tablero").innerHTML = '<div class="panel empty"><b>No hay talleres</b>Crea un taller en la base de datos para comenzar.</div>'; return; }
  const arts = artesanos.filter((a) => a.id_taller === t.id_taller);
  $("#info").textContent = `${t.tecnica} · ${arts.length} artesano(s) · proceso: ${t.etapas.map((e) => ETQ[e]).join(" → ")}`;
  $("#fa").innerHTML = '<option value="">Todos los artesanos del taller</option>' + arts.map((a) => `<option value="${a.id_artesano}"${String(a.id_artesano) === filtroArtesano ? " selected" : ""}>${esc(a.nombre)}</option>`).join("");
  const lista = delTaller(t.id_taller).filter((x) => !filtroArtesano || String(x.id_artesano) === filtroArtesano);
  $("#cuenta").textContent = `${lista.length} pieza(s) en este taller`;
  const tablero = $("#tablero"); tablero.className = `board etapas-${t.etapas.length}`; tablero.style.setProperty("--c", colorTec(t.tecnica));
  tablero.innerHTML = t.etapas.map((k, i) => {
    const col = lista.filter((x) => x.etapa === k);
    return `<section class="col" aria-label="${esc(ETQ[k])}"><header>${esc(ETQ[k])}<span>${col.length}</span></header><div class="cards">${col.length ? col.map((x) => {
      const hecho = !!x.fecha_fin, ultima = i === t.etapas.length - 1;
      return `<article class="job${hecho ? " done" : ""}" style="--c:${colorTec(t.tecnica)}"><strong>${esc(x.pieza)}</strong>
        <div class="meta"><span>${esc(x.codigo)} · ${esc(x.artesano)}</span><span>Inicio: ${fmtFecha(x.fecha_inicio)}</span></div>
        <div class="pipe" aria-label="Etapa ${i + 1} de ${t.etapas.length}">${t.etapas.map((_, n) => `<i class="${n <= i ? "on" : ""}"></i>`).join("")}</div>
        <div class="row">${hecho ? '<span class="badge b-ok">Terminada · disponible</span>' : `<button class="btn sm primary" data-av="${x.id_produccion}">${ultima ? "Terminar pieza" : `Pasar a ${esc(ETQ[t.etapas[i + 1]].toLowerCase())}`}</button>`}
        <button class="btn sm link" data-edit="${x.id_produccion}">Editar</button><button class="btn sm link danger" data-del="${x.id_produccion}" aria-label="Eliminar registro de ${esc(x.pieza)}">Eliminar</button></div></article>`;
    }).join("") : '<p class="none">Sin piezas en esta etapa.</p>'}</div></section>`;
  }).join("");
}
function seleccionar(id) { idTaller = id; filtroArtesano = ""; try { history.replaceState(null, "", `#taller-${id}`); } catch { /* sin historial */ } pintarTabs(); pintar(); }
async function cargar() {
  try { [trabajos, piezas, artesanos, talleres] = await Promise.all([api("/api/produccion"), api("/api/piezas"), api("/api/artesanos"), api("/api/talleres")]); }
  catch (e) { $("#tablero").innerHTML = `<div class="panel empty"><b>No se pudo cargar la producción</b>${esc(e.message)}</div>`; return; }
  const pedido = Number((location.hash.match(/taller-(\d+)/) || [])[1]);
  if (!talleres.some((t) => t.id_taller === idTaller)) idTaller = talleres.some((t) => t.id_taller === pedido) ? pedido : talleres[0]?.id_taller;
  pintarTabs(); pintar();
}
// Solo se ofrecen las piezas y los artesanos del taller elegido: no se mezclan con los de otros talleres.
function formulario(t, x) {
  const ocupadas = new Set(trabajos.map((r) => r.id_pieza)); if (x) ocupadas.delete(x.id_pieza);
  const disponibles = piezas.filter((p) => p.id_taller === t.id_taller && !ocupadas.has(p.id_pieza) && (p.estado === "EN_PRODUCCION" || (x && p.id_pieza === x.id_pieza)));
  const arts = artesanos.filter((a) => a.id_taller === t.id_taller);
  return { disponibles, arts, html: selector("Pieza", "id_pieza", disponibles.map((p) => [p.id_pieza, `${p.codigo} · ${p.nombre}`]), x?.id_pieza, { full: true })
    + selector("Artesano", "id_artesano", arts.map((a) => [a.id_artesano, a.nombre]), x?.id_artesano, { full: true })
    + selector("Etapa", "etapa", t.etapas.map((e) => [e, ETQ[e]]), x?.etapa || t.etapas[0]) + campo("Fecha de inicio", "fecha_inicio", { tipo: "date", valor: x?.fecha_inicio || new Date().toISOString().slice(0, 10) }) };
}
function editor(x) {
  const t = taller(); const f = formulario(t, x);
  if (!f.disponibles.length || !f.arts.length) {
    return abrirModal({ titulo: `${t.nombre}: no se puede registrar todavía`, ayuda: !f.arts.length ? "Este taller no tiene artesanos. Agrégalos en Registros › Artesanos." : "Este taller no tiene piezas pendientes de producción. Crea una pieza con estado «En producción» en Ventas y catálogo.",
      enviar: !f.arts.length ? "Ir a artesanos" : "Ir a ventas y catálogo", onSubmit: async () => { location.href = !f.arts.length ? "artesanos.html" : "ventas.html"; } });
  }
  abrirModal({ titulo: x ? `Editar registro · ${t.nombre}` : `Nuevo registro · ${t.nombre}`, ayuda: "Solo aparecen las piezas y los artesanos de este taller.", campos: f.html, enviar: x ? "Guardar cambios" : "Crear registro",
    onSubmit: async (d) => { await api(x ? `/api/produccion/${x.id_produccion}` : "/api/produccion", { method: x ? "PUT" : "POST", body: d }); toast(x ? "Registro actualizado" : "Registro creado"); await cargar(); } });
}
$("#nuevo").addEventListener("click", () => editor());
$("#fa").addEventListener("change", (e) => { filtroArtesano = e.target.value; pintar(); });
document.addEventListener("click", async (e) => {
  const id = (a) => Number(e.target.closest(`[data-${a}]`)?.dataset[a]);
  if (e.target.closest("[data-taller]")) seleccionar(id("taller"));
  else if (e.target.closest("[data-av]")) {
    try { const r = await api("/api/produccion/avanzar", { method: "POST", body: { id_produccion: id("av") } }); toast(r.finalizado ? "Pieza terminada: ya está disponible para la venta" : `Pieza movida a ${ETQ[r.etapa].toLowerCase()}`); await cargar(); } catch (x) { toast(x.message, "error"); }
  } else if (e.target.closest("[data-edit]")) editor(trabajos.find((t) => t.id_produccion === id("edit")));
  else if (e.target.closest("[data-del]")) {
    const t = trabajos.find((x) => x.id_produccion === id("del"));
    if (await confirmar({ titulo: "Eliminar registro", texto: `Se quitará ${t.pieza} del tablero de producción.`, si: "Eliminar registro", peligro: true })) {
      try { await api(`/api/produccion/${t.id_produccion}`, { method: "DELETE" }); toast("Registro eliminado"); await cargar(); } catch (x) { toast(x.message, "error"); } }
  }
});
cargar();
