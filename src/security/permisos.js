function permitido(rol, metodo, ruta) {
  switch (rol) {
    case "ADMIN": return true;
    case "OPERADOR": return metodo !== "DELETE" && !ruta.startsWith("/api/import/");
    case "CONSULTA": return metodo === "GET";
    default: return false;
  }
}
module.exports = { permitido };
