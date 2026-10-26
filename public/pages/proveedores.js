"use strict";
let proveedores = [];
montarShell({ activa: "proveedores.html", titulo: "Proveedores", descripcion: "Quienes abastecen la materia prima de los talleres.",
  acciones: '<button class="btn primary" id="nuevo" type="button">Nuevo proveedor</button>' });
$("#main").insertAdjacentHTML("beforeend", '<div id="lista"></div>');
async function cargar() {
  cargando("#lista");
  try { proveedores = await api("/api/proveedores"); } catch (e) { $("#lista").innerHTML = `<div class="panel empty"><b>No se pudo cargar</b>${esc(e.message)}</div>`; return; }
  tabla({ el: "#lista", etiqueta: "proveedores", buscar: ["nombre", "contacto", "tipo_insumo"], vacio: "<b>Aún no hay proveedores</b>Agrega el primero con «Nuevo proveedor».",
    columnas: [{ t: "Proveedor", k: "nombre" }, { t: "Contacto", k: "contacto", html: (p) => esc(p.contacto || "—") }, { t: "Tipo de insumo", k: "tipo_insumo" }],
    filas: proveedores, acciones: (p) => `<button class="btn sm link" data-edit="${p.id_proveedor}">Editar</button><button class="btn sm link danger" data-del="${p.id_proveedor}" aria-label="Eliminar ${esc(p.nombre)}">Eliminar</button>` });
}
function formulario(p = {}) {
  return campo("Nombre del proveedor", "nombre", { valor: p.nombre, full: true, attrs: `maxlength="100" ${textoSeguro}` }) + campo("Contacto", "contacto", { valor: p.contacto, req: false, attrs: `maxlength="60" ${textoSeguro}`, ayuda: "Teléfono o correo" })
    + campo("Tipo de insumo", "tipo_insumo", { valor: p.tipo_insumo, attrs: `maxlength="40" ${textoSeguro}`, ayuda: "Ej.: Arcilla, Madera, Lana" });
}
function editor(p) {
  abrirModal({ titulo: p ? `Editar ${p.nombre}` : "Nuevo proveedor", campos: formulario(p || {}), enviar: p ? "Guardar cambios" : "Crear proveedor",
    onSubmit: async (d) => { await api(p ? `/api/proveedores/${p.id_proveedor}` : "/api/proveedores", { method: p ? "PUT" : "POST", body: d }); toast(p ? "Proveedor actualizado" : "Proveedor creado"); await cargar(); } });
}
$("#nuevo").addEventListener("click", () => editor());
document.addEventListener("click", async (e) => {
  const id = (k) => Number(e.target.closest(`[data-${k}]`)?.dataset[k]);
  if (e.target.closest("[data-edit]")) editor(proveedores.find((p) => p.id_proveedor === id("edit")));
  else if (e.target.closest("[data-del]")) {
    const p = proveedores.find((x) => x.id_proveedor === id("del"));
    if (await confirmar({ titulo: "Eliminar proveedor", texto: `Se eliminará a ${p.nombre}. Si abastece insumos no se podrá eliminar.`, si: "Eliminar proveedor", peligro: true })) {
      try { await api(`/api/proveedores/${p.id_proveedor}`, { method: "DELETE" }); toast("Proveedor eliminado"); await cargar(); } catch (x) { toast(x.message, "error"); } }
  }
});
cargar();
