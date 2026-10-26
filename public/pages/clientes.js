"use strict";
let clientes = [];
montarShell({ activa: "clientes.html", titulo: "Clientes", descripcion: "Quienes compran o encargan piezas. Los puntos de fidelización se suman solos con cada entrega.",
  acciones: '<button class="btn primary" id="nuevo" type="button">Nuevo cliente</button>' });
$("#main").insertAdjacentHTML("beforeend", '<div id="lista"></div>');
const TIPOS = [["PARTICULAR", "Particular"], ["COLECCIONISTA", "Coleccionista"], ["MAYORISTA", "Mayorista"]];
const FILTROS = { opciones: [["TODOS", "Todos"], ...TIPOS], test: (f, v) => f.tipo === v };
async function cargar() {
  cargando("#lista");
  try { clientes = await api("/api/clientes"); } catch (e) { $("#lista").innerHTML = `<div class="panel empty"><b>No se pudo cargar</b>${esc(e.message)}</div>`; return; }
  tabla({ el: "#lista", etiqueta: "clientes", buscar: ["nombre", "documento", "telefono"], filtros: FILTROS, vacio: "<b>Aún no hay clientes</b>Agrega el primero con «Nuevo cliente».",
    columnas: [{ t: "Nombre", k: "nombre" }, { t: "Documento", k: "documento" }, { t: "Tipo", k: "tipo", html: (c) => esc((TIPOS.find(([v]) => v === c.tipo) || [0, c.tipo])[1]) }, { t: "Teléfono", k: "telefono", html: (c) => esc(c.telefono || "—") },
      { t: "Puntos", k: "puntos_fidelizacion", num: true, html: (c) => fmtNum(c.puntos_fidelizacion) }],
    filas: clientes, acciones: (c) => `<button class="btn sm link" data-edit="${c.id_cliente}">Editar</button><button class="btn sm link danger" data-del="${c.id_cliente}" aria-label="Eliminar ${esc(c.nombre)}">Eliminar</button>` });
}
function formulario(c = {}) {
  return campo("Nombre o razón social", "nombre", { valor: c.nombre, full: true, attrs: `maxlength="120" ${textoSeguro}` })
    + campo("Documento (DNI o RUC)", "documento", { valor: c.documento, attrs: 'minlength="6" maxlength="15" pattern="[0-9A-Za-z]{6,15}" title="De 6 a 15 letras o números"' })
    + selector("Tipo de cliente", "tipo", TIPOS, c.tipo || "PARTICULAR")
    + campo("Teléfono", "telefono", { valor: c.telefono, req: false, full: true, attrs: 'maxlength="20" pattern="[0-9 +\\(\\)\\-]{6,20}" title="Solo números, espacios y + ( ) -"' });
}
function editor(c) {
  abrirModal({ titulo: c ? `Editar a ${c.nombre}` : "Nuevo cliente", campos: formulario(c || {}), enviar: c ? "Guardar cambios" : "Crear cliente",
    onSubmit: async (d) => { await api(c ? `/api/clientes/${c.id_cliente}` : "/api/clientes", { method: c ? "PUT" : "POST", body: d }); toast(c ? "Cliente actualizado" : "Cliente creado"); await cargar(); } });
}
$("#nuevo").addEventListener("click", () => editor());
document.addEventListener("click", async (e) => {
  const id = (a) => Number(e.target.closest(`[data-${a}]`)?.dataset[a]);
  if (e.target.closest("[data-edit]")) editor(clientes.find((c) => c.id_cliente === id("edit")));
  else if (e.target.closest("[data-del]")) {
    const c = clientes.find((x) => x.id_cliente === id("del"));
    if (await confirmar({ titulo: "Eliminar cliente", texto: `Se eliminará a ${c.nombre}. Si tiene encargos o ventas no se podrá eliminar.`, si: "Eliminar cliente", peligro: true })) {
      try { await api(`/api/clientes/${c.id_cliente}`, { method: "DELETE" }); toast("Cliente eliminado"); await cargar(); } catch (x) { toast(x.message, "error"); } }
  }
});
cargar();
