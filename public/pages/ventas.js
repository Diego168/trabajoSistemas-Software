"use strict";
let piezas = [], talleres = [], clientes = [], carrito = [];
montarShell({ activa: "ventas.html", titulo: "Ventas y catálogo", descripcion: "Arma la venta con piezas disponibles y mantén el catálogo al día.",
  acciones: '<button class="btn primary" id="nueva" type="button">Nueva pieza</button>' });
$("#main").insertAdjacentHTML("beforeend", `<div class="pos"><section aria-label="Catálogo" id="cat"></section>
  <aside class="panel ticket" aria-label="Venta actual"><header><h2>Venta actual</h2><button class="btn link sm" id="vaciar" type="button">Vaciar</button></header><div class="body">
  <div id="lineas"></div><div class="total"><span>Total</span><b id="total">S/ 0.00</b></div>
  <form class="stack-form" id="fv" novalidate><label>Cliente <small>(opcional)</small><select id="cliente"></select></label>
  <label>Canal de venta<select id="canal"><option value="TIENDA">Tienda</option><option value="FERIA">Feria</option><option value="EN_LINEA">En línea</option></select></label>
  <button class="btn primary" id="cobrar" type="submit" disabled>Registrar venta</button></form></div></aside></div>`);
const FILTROS = { opciones: [["TODAS", "Todas"], ["DISPONIBLE", "Disponibles"], ["EN_PRODUCCION", "En producción"], ["VENDIDA", "Vendidas"]], test: (f, v) => f.estado === v };
let vista;

function pintarCarrito() {
  const t = carrito.reduce((s, p) => s + p.precio, 0);
  $("#lineas").innerHTML = carrito.length ? carrito.map((p) => `<div class="line"><div>${esc(p.nombre)}<small>${esc(p.codigo)} · ${esc(p.tecnica)}</small></div><div><b class="num">${fmtMoney(p.precio)}</b> <button class="btn link sm" data-quitar="${p.id_pieza}" aria-label="Quitar ${esc(p.nombre)}">Quitar</button></div></div>`).join("")
    : '<div class="empty"><b>La venta está vacía</b>Usa «Agregar» en una pieza disponible.</div>';
  $("#total").textContent = fmtMoney(t); $("#cobrar").disabled = !carrito.length;
}
function pintarCatalogo() {
  vista = tabla({ el: "#cat", etiqueta: "piezas", buscar: ["codigo", "nombre", "tecnica"], filtros: FILTROS, vacio: "<b>Aún no hay piezas</b>Crea la primera con «Nueva pieza» o importa un CSV.",
    columnas: [{ t: "Código", k: "codigo" }, { t: "Pieza", k: "nombre" }, { t: "Técnica", k: "tecnica", html: (p) => tecChip(p.tecnica) }, { t: "Precio", k: "precio", num: true, html: (p) => fmtMoney(p.precio) }, { t: "Estado", k: "estado", html: (p) => badge(p.estado) }],
    filas: piezas, acciones: (p) => `${p.estado === "DISPONIBLE" ? `<button class="btn sm primary" data-add="${p.id_pieza}"${carrito.some((c) => c.id_pieza === p.id_pieza) ? " disabled" : ""}>Agregar</button> ` : ""}<button class="btn sm link" data-edit="${p.id_pieza}">Editar</button> <button class="btn sm link danger" data-del="${p.id_pieza}" aria-label="Eliminar ${esc(p.nombre)}">Eliminar</button>` });
}
async function cargar() {
  cargando("#cat");
  try { [piezas, talleres, clientes] = await Promise.all([api("/api/piezas"), api("/api/talleres"), api("/api/clientes")]); }
  catch (e) { $("#cat").innerHTML = `<div class="panel empty"><b>No se pudo cargar el catálogo</b>${esc(e.message)}</div>`; return; }
  carrito = carrito.filter((c) => piezas.some((p) => p.id_pieza === c.id_pieza && p.estado === "DISPONIBLE"));
  $("#cliente").innerHTML = '<option value="">Sin cliente</option>' + clientes.map((c) => `<option value="${c.id_cliente}">${esc(c.nombre)}</option>`).join("");
  pintarCatalogo(); pintarCarrito();
}
function formPieza(p = {}) {
  return campo("Código", "codigo", { valor: p.codigo, attrs: `maxlength="20" ${textoSeguro}` }) + campo("Nombre de la pieza", "nombre", { valor: p.nombre, attrs: `maxlength="100" ${textoSeguro}` })
    + campo("Técnica", "tecnica", { valor: p.tecnica, attrs: `maxlength="40" list="tecnicas" ${textoSeguro}`, ayuda: "Ej.: Cerámica, Ebanistería, Tejido" }) + '<datalist id="tecnicas"><option>Cerámica<option>Alfarería<option>Ebanistería<option>Tejido<option>Mueblería rústica</datalist>'
    + selector("Taller", "id_taller", talleres.map((t) => [t.id_taller, t.nombre]), p.id_taller) + campo("Precio (S/)", "precio", { tipo: "number", valor: p.precio, attrs: 'min="0" step="0.01"' })
    + selector("Estado", "estado", [["EN_PRODUCCION", "En producción"], ["DISPONIBLE", "Disponible"], ["VENDIDA", "Vendida"]], p.estado || "EN_PRODUCCION");
}
function editor(p) {
  abrirModal({ titulo: p ? `Editar ${p.codigo}` : "Nueva pieza", campos: formPieza(p || {}), enviar: p ? "Guardar cambios" : "Crear pieza",
    onSubmit: async (d) => { await api(p ? `/api/piezas/${p.id_pieza}` : "/api/piezas", { method: p ? "PUT" : "POST", body: d }); toast(p ? "Pieza actualizada" : "Pieza creada"); await cargar(); } });
}
$("#nueva").addEventListener("click", () => editor());
document.addEventListener("click", async (e) => {
  const id = (a) => Number(e.target.closest(`[data-${a}]`)?.dataset[a]);
  if (e.target.closest("[data-add]")) { const p = piezas.find((x) => x.id_pieza === id("add")); if (p && !carrito.some((c) => c.id_pieza === p.id_pieza)) { carrito.push(p); pintarCarrito(); pintarCatalogo(); } }
  else if (e.target.closest("[data-quitar]")) { carrito = carrito.filter((c) => c.id_pieza !== id("quitar")); pintarCarrito(); pintarCatalogo(); }
  else if (e.target.closest("[data-edit]")) editor(piezas.find((x) => x.id_pieza === id("edit")));
  else if (e.target.closest("[data-del]")) {
    const p = piezas.find((x) => x.id_pieza === id("del"));
    if (await confirmar({ titulo: "Eliminar pieza", texto: `Se eliminará ${p.codigo} · ${p.nombre}. Esta acción no se puede deshacer.`, si: "Eliminar pieza", peligro: true })) {
      try { await api(`/api/piezas/${p.id_pieza}`, { method: "DELETE" }); toast("Pieza eliminada"); await cargar(); } catch (x) { toast(x.message, "error"); } }
  }
});
$("#vaciar").addEventListener("click", () => { carrito = []; pintarCarrito(); pintarCatalogo(); });
$("#fv").addEventListener("submit", async (e) => {
  e.preventDefault(); const b = $("#cobrar"); b.disabled = true;
  try {
    const r = await api("/api/ventas", { method: "POST", body: { id_cliente: $("#cliente").value ? Number($("#cliente").value) : null, canal: $("#canal").value, items: carrito.map((p) => ({ id_pieza: p.id_pieza, cantidad: 1 })) } });
    toast(`Venta N.º ${r.id_venta} registrada por ${fmtMoney(r.total)}`); carrito = []; await cargar();
  } catch (x) { toast(x.message, "error"); b.disabled = false; }
});
cargar();
