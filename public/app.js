"use strict";
/* Artesanías Legado · utilidades compartidas del frontend */

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const moneda = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const fmtMoney = (n) => moneda.format(Number(n) || 0);
const fmtNum = (n) => new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 }).format(Number(n) || 0);
function fmtFecha(f) {
  if (!f) return "—";
  const d = new Date(String(f).replace(" ", "T") + (String(f).length <= 10 ? "T00:00:00" : "Z"));
  return isNaN(d) ? esc(f) : d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}
const sinTildes = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* ---------- acceso al servidor ---------- */
async function api(ruta, { method = "GET", body } = {}) {
  const headers = {}; if (body !== undefined) headers["Content-Type"] = "application/json";
  let r;
  try { r = await fetch(ruta, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }); }
  catch { throw new Error("No hay conexión con el servidor. Revisa que esté en marcha."); }
  let data = null; try { data = await r.json(); } catch { /* respuesta sin cuerpo */ }
  if (r.status === 401 && ruta !== "/api/auth/login" && ruta !== "/api/auth/me" && !location.pathname.endsWith("login.html")) {
    location.replace("login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() || "dashboard.html")); // sesión vencida
  }
  if (!r.ok) {
    const e = new Error((data && data.error) || "No se pudo completar la acción.");
    e.status = r.status; e.detalle = data && data.errores; throw e;
  }
  return data;
}

/* ---------- avisos ---------- */
function toast(msg, tipo = "ok") {
  let z = $(".toast-zone"); if (!z) { z = document.createElement("div"); z.className = "toast-zone"; z.setAttribute("role", "status"); z.setAttribute("aria-live", "polite"); document.body.appendChild(z); }
  const t = document.createElement("div"); t.className = "toast" + (tipo === "error" ? " err" : ""); t.textContent = msg; z.appendChild(t);
  setTimeout(() => t.remove(), tipo === "error" ? 6500 : 3200);
}

/* ---------- insignias ---------- */
const ESTADOS = {
  DISPONIBLE: ["b-ok", "Disponible"], EN_PRODUCCION: ["b-info", "En producción"], VENDIDA: ["b-idle", "Vendida"],
  REGISTRADO: ["b-warn", "Registrado"], ENTREGADO: ["b-ok", "Entregado"],
};
function badge(estado) { const [c, t] = ESTADOS[estado] || ["b-idle", estado]; return `<span class="badge ${c}">${esc(t)}</span>`; }
function claseTec(t) {
  const s = sinTildes(t);
  if (s.includes("ceram")) return "tec-ceramica"; if (s.includes("alfar")) return "tec-alfareria"; if (s.includes("ebanis") || s.includes("tallad") || s.includes("madera")) return "tec-ebanisteria";
  if (s.includes("muebl")) return "tec-muebleria"; if (s.includes("tej") || s.includes("hilad")) return "tec-tejido"; return "";
}
const COLORES_TEC = { "tec-ceramica": "var(--t-ceramica)", "tec-alfareria": "var(--t-alfareria)", "tec-ebanisteria": "var(--t-ebanisteria)", "tec-muebleria": "var(--t-muebleria)", "tec-tejido": "var(--t-tejido)" };
/** Color CSS de la técnica; solo devuelve valores de una lista fija (nunca texto del servidor). */
function colorTec(t) { return COLORES_TEC[claseTec(t)] || "var(--t-otro)"; }
function tecChip(t) { return `<span class="tec ${claseTec(t)}">${esc(t)}</span>`; }

/* ---------- estructura común ---------- */
const MODULOS = [
  ["Inicio", [["dashboard.html", "Resumen de dirección"]]],
  ["Comercial", [["ventas.html", "Ventas y catálogo"], ["encargos.html", "Encargos y fidelización"]]],
  ["Operaciones", [["insumos.html", "Insumos y almacén"], ["produccion.html", "Producción por taller"]]],
  ["Registros", [["clientes.html", "Clientes"], ["artesanos.html", "Artesanos"], ["proveedores.html", "Proveedores"]]],
];
const ROLES = { ADMIN: "Administrador", OPERADOR: "Operador", CONSULTA: "Solo consulta" };
function montarShell({ activa, titulo, descripcion = "", acciones = "" }) {
  const nav = MODULOS.map(([g, items]) => `<div class="nav-group">${esc(g)}</div>` + items.map(([h, t]) =>
    `<a href="${h}"${h === activa ? ' aria-current="page"' : ""}>${esc(t)}</a>`).join("")).join("");
  document.body.insertAdjacentHTML("afterbegin", `
    <aside class="side" id="side">
      <div class="logo"><b>Artesanías Legado</b><span>Gestión de talleres y tienda</span></div>
      <button class="btn sm menu-btn" id="menuBtn" aria-expanded="false" aria-controls="side">Menú</button>
      <nav aria-label="Módulos">${nav}</nav>
      <div class="foot">
        <div class="user" id="userBox" hidden><b id="userNombre"></b><span id="userRol" class="rol"></span></div>
        <button class="btn sm" id="btnTema" type="button">Cambiar tema</button>
        <button class="btn sm" id="btnSalir" type="button">Cerrar sesión</button>
      </div>
    </aside>`);
  const main = $("#main"); main.insertAdjacentHTML("afterbegin", `<div class="head"><div><h1>${esc(titulo)}</h1>${descripcion ? `<p>${esc(descripcion)}</p>` : ""}</div><div class="actions">${acciones}</div></div>`);
  $("#menuBtn").addEventListener("click", (e) => { const o = $("#side").classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", o); });
  $("#btnTema").addEventListener("click", () => { const d = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = d; try { localStorage.setItem("tema", d); } catch { /* sin almacenamiento */ } });
  $("#btnSalir").addEventListener("click", async () => { try { await api("/api/auth/logout", { method: "POST" }); } catch { /* ya sin sesión */ } location.replace("login.html"); });
  api("/api/auth/me").then((u) => { document.body.dataset.rol = u.rol; $("#userNombre").textContent = u.nombre; $("#userRol").textContent = ROLES[u.rol] || u.rol; $("#userBox").hidden = false; }, () => { /* api() ya redirige */ });
  try { const t = localStorage.getItem("tema"); if (t) document.documentElement.dataset.theme = t; } catch { /* sin almacenamiento */ }
}
/* ---------- diálogos ---------- */
function abrirModal({ titulo, ayuda = "", campos = "", enviar = "Guardar", cancelar = "Cancelar", onSubmit, peligro = false }) {
  const dlg = document.createElement("dialog");
  dlg.innerHTML = `<form method="dialog" novalidate><header><h2>${esc(titulo)}</h2></header>${ayuda ? `<p class="hint">${esc(ayuda)}</p>` : ""}
    <div class="fields">${campos}</div><div class="form-error" role="alert"></div>
    <footer><button type="button" class="btn" data-x>${esc(cancelar)}</button><button type="submit" class="btn ${peligro ? "danger" : "primary"}">${esc(enviar)}</button></footer></form>`;
  document.body.appendChild(dlg);
  const form = $("form", dlg), err = $(".form-error", dlg), ok = $("button[type=submit]", dlg);
  const cerrar = () => { dlg.close(); dlg.remove(); };
  $("[data-x]", dlg).addEventListener("click", cerrar);
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); cerrar(); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); err.textContent = "";
    const malo = $$("input,select,textarea", form).find((c) => !c.checkValidity());
    if (malo) { err.textContent = (malo.labels?.[0]?.firstChild?.textContent || "Un campo") .trim() + ": " + (malo.validationMessage || "valor no válido"); malo.focus(); return; }
    const datos = Object.fromEntries(new FormData(form).entries());
    ok.disabled = true;
    try { await onSubmit(datos, dlg); if (dlg.isConnected) cerrar(); }
    catch (x) { err.textContent = x.message; if (x.detalle) err.innerHTML = esc(x.message) + "<br>" + x.detalle.slice(0, 8).map((d) => `Fila ${esc(d.fila)}: ${esc(d.error)}`).join("<br>"); }
    finally { ok.disabled = false; }
  });
  dlg.showModal(); const primero = $("input,select,textarea", dlg); if (primero) primero.focus(); else ok.focus();
  return { cerrar, dlg };
}
function confirmar({ titulo, texto, si = "Confirmar", peligro = false }) {
  return new Promise((res) => {
    let resuelto = false;
    const { dlg } = abrirModal({ titulo, ayuda: texto, enviar: si, peligro, onSubmit: async () => { resuelto = true; res(true); } });
    const fin = () => { if (!resuelto) res(false); };
    $("[data-x]", dlg).addEventListener("click", fin); dlg.addEventListener("cancel", fin);
  });
}

/* ---------- campos de formulario ---------- */
function campo(etq, nombre, { tipo = "text", valor = "", req = true, attrs = "", full = false, ayuda = "" } = {}) {
  return `<label class="${full ? "full" : ""}">${esc(etq)}<input name="${nombre}" type="${tipo}" value="${esc(valor)}" ${req ? "required" : ""} ${attrs}>${ayuda ? `<small>${esc(ayuda)}</small>` : ""}</label>`;
}
function selector(etq, nombre, opciones, actual, { req = true, vacio = "", full = false } = {}) {
  return `<label class="${full ? "full" : ""}">${esc(etq)}<select name="${nombre}" ${req ? "required" : ""}>${vacio ? `<option value="">${esc(vacio)}</option>` : ""}${opciones.map(([v, t]) =>
    `<option value="${esc(v)}"${String(v) === String(actual ?? "") ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
}
const textoSeguro = 'pattern="[^<>&quot;\'`\\\\]*" title="No uses los caracteres < > &quot; \' ` \\"';

/* ---------- tabla con búsqueda, filtro y orden ---------- */
function tabla({ el, columnas, filas, buscar = [], filtros = null, acciones = null, vacio = "No hay registros todavía.", etiqueta = "registros" }) {
  const raiz = typeof el === "string" ? $(el) : el;
  const est = { q: "", filtro: filtros ? filtros.opciones[0][0] : null, orden: null, asc: true };
  raiz.innerHTML = `<div class="toolbar"><input class="search" type="search" placeholder="Buscar…" aria-label="Buscar en ${esc(etiqueta)}">
    ${filtros ? `<div class="chips" role="group" aria-label="Filtrar">${filtros.opciones.map(([v, t]) => `<button class="chip" type="button" data-f="${esc(v)}" aria-pressed="${v === est.filtro}">${esc(t)}</button>`).join("")}</div>` : ""}
    <span class="count" aria-live="polite"></span></div>
    <div class="panel"><div class="table-wrap"><table><thead><tr>${columnas.map((c, i) => `<th class="${c.num ? "num" : ""}" scope="col">${c.ordenar === false ? esc(c.t) : `<button type="button" data-o="${i}" aria-label="Ordenar por ${esc(c.t)}">${esc(c.t)} <span aria-hidden="true"></span></button>`}</th>`).join("")}${acciones ? '<th scope="col"><span class="sr">Acciones</span></th>' : ""}</tr></thead><tbody></tbody></table></div></div>`;
  const cuerpo = $("tbody", raiz), cuenta = $(".count", raiz);
  function pintar() {
    let r = filas.filter((f) => (!filtros || est.filtro === filtros.opciones[0][0] || filtros.test(f, est.filtro)) &&
      (!est.q || buscar.some((k) => sinTildes(f[k]).includes(sinTildes(est.q)))));
    if (est.orden !== null) { const c = columnas[est.orden]; const v = (f) => (c.valor ? c.valor(f) : f[c.k]); r = [...r].sort((a, b) => { const x = v(a), y = v(b); return (typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), "es", { numeric: true })) * (est.asc ? 1 : -1); }); }
    cuenta.textContent = `${r.length} de ${filas.length} ${etiqueta}`;
    $$("th button[data-o]", raiz).forEach((b) => { const on = Number(b.dataset.o) === est.orden; b.lastElementChild.textContent = on ? (est.asc ? "▲" : "▼") : ""; b.closest("th").setAttribute("aria-sort", on ? (est.asc ? "ascending" : "descending") : "none"); });
    cuerpo.innerHTML = r.length ? r.map((f) => `<tr>${columnas.map((c) => `<td class="${c.num ? "num" : ""}">${c.html ? c.html(f) : esc(f[c.k])}</td>`).join("")}${acciones ? `<td class="act"><div class="acts">${acciones(f)}</div></td>` : ""}</tr>`).join("")
      : `<tr><td colspan="${columnas.length + (acciones ? 1 : 0)}"><div class="empty">${filas.length ? "<b>Sin resultados</b>Prueba con otra búsqueda o quita el filtro." : vacio}</div></td></tr>`;
  }
  $(".search", raiz).addEventListener("input", (e) => { est.q = e.target.value; pintar(); });
  raiz.addEventListener("click", (e) => {
    const f = e.target.closest("[data-f]"), o = e.target.closest("[data-o]");
    if (f) { est.filtro = f.dataset.f; $$("[data-f]", raiz).forEach((b) => b.setAttribute("aria-pressed", b === f)); pintar(); }
    if (o) { const i = Number(o.dataset.o); est.asc = est.orden === i ? !est.asc : true; est.orden = i; pintar(); }
  });
  pintar(); return { pintar };
}
function cargando(el) { (typeof el === "string" ? $(el) : el).innerHTML = '<div class="panel body"><div class="skeleton"></div><br><div class="skeleton"></div><br><div class="skeleton"></div></div>'; }
