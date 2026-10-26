"use strict";
// Pantalla de acceso. Si ya hay sesión, entra directo.
const destino = () => {
  const n = new URLSearchParams(location.search).get("next");
  return /^[a-z]+\.html$/.test(n || "") && n !== "login.html" ? n : "dashboard.html"; // solo páginas propias: sin open redirect
};
api("/api/auth/me").then(() => location.replace(destino()), () => { /* sin sesión: mostrar el formulario */ });
$("#ver").addEventListener("click", (e) => {
  const c = $("#clave"), v = c.type === "password"; c.type = v ? "text" : "password";
  e.currentTarget.textContent = v ? "Ocultar" : "Mostrar"; e.currentTarget.setAttribute("aria-pressed", v);
});
$("#form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const err = $("#error"), b = $("#entrar"); err.textContent = "";
  const usuario = $("#usuario").value.trim(), clave = $("#clave").value;
  if (!usuario || !clave) { err.textContent = "Ingresa tu usuario y contraseña."; return; }
  b.disabled = true; b.textContent = "Entrando…";
  try { await api("/api/auth/login", { method: "POST", body: { usuario, clave } }); location.replace(destino()); }
  catch (e) { err.textContent = e.message; $("#clave").value = ""; $("#clave").focus(); b.disabled = false; b.textContent = "Entrar"; }
});
