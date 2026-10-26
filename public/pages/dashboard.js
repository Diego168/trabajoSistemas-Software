"use strict";
montarShell({ activa: "dashboard.html", titulo: "Resumen de dirección", descripcion: "Ventas, inventario, piezas y encargos en una sola vista.",
  acciones: '<button class="btn primary" id="pdf" type="button">Descargar reporte PDF</button>' });
$("#main").insertAdjacentHTML("beforeend", '<div id="kpis"></div><div class="grid2"><section class="panel" aria-label="Ventas por técnica"><header><h2>Ventas por técnica</h2></header><div class="body" id="tec"></div></section><section class="panel" aria-label="Piezas por estado"><header><h2>Piezas por estado</h2></header><div class="body" id="est"></div></section></div><div class="grid2"><section class="panel" aria-label="Últimas ventas"><header><h2>Últimas ventas</h2></header><div class="table-wrap" id="ult"></div></section><section class="panel" aria-label="Alertas de stock"><header><h2>Insumos por reponer</h2><a class="btn sm" href="insumos.html">Ir a insumos</a></header><div class="body" id="alertas"></div></section></div>');
let datos = null, ventas = [], alertas = [];
const COL_ESTADO = { DISPONIBLE: "var(--ok)", EN_PRODUCCION: "var(--info)", VENDIDA: "var(--idle)" };
const ETQ_ESTADO = { DISPONIBLE: "Disponibles", EN_PRODUCCION: "En producción", VENDIDA: "Vendidas" };

function pintar() {
  const d = datos, enc = d.encargosPorEstado.filter((e) => e.estado !== "ENTREGADO").reduce((s, e) => s + e.n, 0);
  $("#kpis").innerHTML = `<div class="kpis"><div class="kpi"><span>Ventas de hoy</span><b>${fmtMoney(d.ventasHoy.total)}</b><small>${d.ventasHoy.n} venta(s)</small></div>
    <div class="kpi"><span>Ventas acumuladas</span><b>${fmtMoney(d.ventasTotal.total)}</b><small>${d.ventasTotal.n} venta(s) en total</small></div>
    <div class="kpi${d.insumosBajo.n ? " alert" : ""}"><span>Insumos por reponer</span><b>${d.insumosBajo.n}</b><a href="insumos.html">Ver inventario</a></div>
    <div class="kpi"><span>Encargos activos</span><b>${enc}</b><a href="encargos.html">Ver encargos</a></div></div>`;
  const max = Math.max(1, ...d.ventasPorTecnica.map((t) => t.total));
  $("#tec").innerHTML = d.ventasPorTecnica.length ? `<div class="bars">${d.ventasPorTecnica.map((t) => `<div class="bar-row"><span>${tecChip(t.tecnica)}</span><span class="track"><span class="fill" style="display:block;width:${Math.round((t.total / max) * 100)}%;--c:${colorTec(t.tecnica)}"></span></span><b class="num">${fmtMoney(t.total)}</b></div>`).join("")}</div>`
    : '<div class="empty"><b>Aún no hay ventas</b>Registra una venta para ver el reporte por técnica.</div>';
  const tot = d.piezasPorEstado.reduce((s, e) => s + e.n, 0) || 1;
  $("#est").innerHTML = `<div class="stack" role="img" aria-label="Distribución de piezas por estado">${d.piezasPorEstado.map((e) => `<i style="width:${(e.n / tot) * 100}%;background:${colorEstado(e.estado)}"></i>`).join("")}</div><div class="legend">${d.piezasPorEstado.map((e) => `<div><i style="background:${colorEstado(e.estado)}"></i>${esc(ETQ_ESTADO[e.estado] || e.estado)}<b>${e.n}</b></div>`).join("")}</div>`;
  $("#ult").innerHTML = ventas.length ? `<table><thead><tr><th scope="col">N.º</th><th scope="col">Fecha</th><th scope="col">Cliente</th><th scope="col">Canal</th><th class="num" scope="col">Total</th></tr></thead><tbody>${ventas.slice(0, 8).map((v) => `<tr><td>${v.id_venta}</td><td>${fmtFecha(v.fecha)}</td><td>${esc(v.cliente || "Sin cliente")}</td><td>${esc(v.canal.replace("_", " ").toLowerCase())}</td><td class="num">${fmtMoney(v.total)}</td></tr>`).join("")}</tbody></table>`
    : '<div class="empty"><b>Sin ventas registradas</b>Las ventas aparecerán aquí.</div>';
  $("#alertas").innerHTML = alertas.length ? alertas.map((a) => `<div class="line"><div>${esc(a.nombre)}<small>Mínimo ${fmtNum(a.stock_minimo)}</small></div><span class="badge b-bad">${fmtNum(a.stock)} en stock</span></div>`).join("") : '<div class="empty"><b>Todo en orden</b>Ningún insumo bajo el mínimo.</div>';
}
function colorEstado(e) { return COL_ESTADO[e] || "var(--idle)"; }

async function cargar() {
  cargando("#kpis");
  try { [datos, ventas, alertas] = await Promise.all([api("/api/reportes/dashboard"), api("/api/reportes/ventas"), api("/api/insumos/alertas")]); }
  catch (e) { $("#kpis").innerHTML = `<div class="panel empty"><b>No se pudo cargar el resumen</b>${esc(e.message)}</div>`; return; }
  pintar();
}
$("#pdf").addEventListener("click", () => {
  if (!datos) return toast("Espera a que carguen los datos", "error");
  const doc = new window.jspdf.jsPDF(); let y = 20;
  const t = (s, x = 15, sz = 11, b = false) => { doc.setFontSize(sz); doc.setFont("helvetica", b ? "bold" : "normal"); doc.text(String(s), x, y); y += sz * 0.65; };
  t("Artesanías Legado S.A.C.", 15, 16, true); t("Reporte gerencial", 15, 12); t(`Generado: ${new Date().toLocaleString("es-PE")}`, 15, 9); y += 6;
  t(`Ventas de hoy: ${fmtMoney(datos.ventasHoy.total)} (${datos.ventasHoy.n})`); t(`Ventas acumuladas: ${fmtMoney(datos.ventasTotal.total)} (${datos.ventasTotal.n})`); t(`Insumos por reponer: ${datos.insumosBajo.n}`); y += 6;
  t("Ventas por técnica", 15, 12, true); datos.ventasPorTecnica.forEach(({ tecnica, total }) => t(`${tecnica}: ${fmtMoney(total)}`)); y += 6;
  t("Piezas por estado", 15, 12, true); datos.piezasPorEstado.forEach(({ estado, n }) => t(`${ETQ_ESTADO[estado] || estado}: ${n}`)); y += 6;
  t("Encargos por estado", 15, 12, true); datos.encargosPorEstado.forEach(({ estado, n }) => t(`${estado}: ${n}`));
  doc.save("reporte_gerencial.pdf"); toast("Reporte PDF generado");
});
cargar();
