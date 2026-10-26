"use strict";
let artesanos = [], talleres = [];
montarShell({ activa: "artesanos.html", titulo: "Artesanos", descripcion: "Cada artesano pertenece a un taller y solo puede trabajar piezas de ese taller.",
  acciones: '<button class="btn primary" id="nuevo" type="button">Nuevo artesano</button>' });
$("#main").insertAdjacentHTML("beforeend", '<div id="lista"></div>');
async function cargar() {
  cargando("#lista");
  try { [artesanos, talleres] = await Promise.all([api("/api/artesanos"), api("/api/talleres")]); } catch (e) { $("#lista").innerHTML = `<div class="panel empty"><b>No se pudo cargar</b>${esc(e.message)}</div>`; return; }
  const filtros = { opciones: [["TODOS", "Todos los talleres"], ...talleres.map((t) => [String(t.id_taller), t.nombre])], test: (f, v) => String(f.id_taller) === v };
  tabla({ el: "#lista", etiqueta: "artesanos", buscar: ["nombre", "especialidad", "taller"], filtros, vacio: "<b>Aún no hay artesanos</b>Agrega el primero con «Nuevo artesano».",
    columnas: [{ t: "Nombre", k: "nombre" }, { t: "Especialidad", k: "especialidad" }, { t: "Taller", k: "taller", html: (a) => tecChip(a.taller) }],
    filas: artesanos, acciones: (a) => `<button class="btn sm link" data-edit="${a.id_artesano}">Editar</button><button class="btn sm link danger" data-del="${a.id_artesano}" aria-label="Eliminar ${esc(a.nombre)}">Eliminar</button>` });
}
function formulario(a = {}) {
  return campo("Nombre completo", "nombre", { valor: a.nombre, full: true, attrs: `maxlength="100" ${textoSeguro}` }) + campo("Especialidad", "especialidad", { valor: a.especialidad, attrs: `maxlength="60" ${textoSeguro}`, ayuda: "Ej.: Ceramista, Ebanista, Tejedora" })
    + selector("Taller", "id_taller", talleres.map((t) => [t.id_taller, t.nombre]), a.id_taller);
}
function editor(a) {
  abrirModal({ titulo: a ? `Editar a ${a.nombre}` : "Nuevo artesano", campos: formulario(a || {}), enviar: a ? "Guardar cambios" : "Crear artesano",
    onSubmit: async (d) => { await api(a ? `/api/artesanos/${a.id_artesano}` : "/api/artesanos", { method: a ? "PUT" : "POST", body: d }); toast(a ? "Artesano actualizado" : "Artesano creado"); await cargar(); } });
}
$("#nuevo").addEventListener("click", () => editor());
document.addEventListener("click", async (e) => {
  const id = (k) => Number(e.target.closest(`[data-${k}]`)?.dataset[k]);
  if (e.target.closest("[data-edit]")) editor(artesanos.find((a) => a.id_artesano === id("edit")));
  else if (e.target.closest("[data-del]")) {
    const a = artesanos.find((x) => x.id_artesano === id("del"));
    if (await confirmar({ titulo: "Eliminar artesano", texto: `Se eliminará a ${a.nombre}. Si tiene producción o encargos asignados no se podrá eliminar.`, si: "Eliminar artesano", peligro: true })) {
      try { await api(`/api/artesanos/${a.id_artesano}`, { method: "DELETE" }); toast("Artesano eliminado"); await cargar(); } catch (x) { toast(x.message, "error"); } }
  }
});
cargar();
