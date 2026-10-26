// Punto de entrada (composition root + arranque).
const path = require("path");
const { openDatabase, asegurarEsquema } = require("./src/config/database");
const { buildContainer } = require("./src/container");
const { createApp } = require("./src/http/app");
const { Logger } = require("./src/config/logger");
const logger = new Logger({ dir: process.env.LOG_DIR || path.join(__dirname, "logs") });
const PORT = process.env.PORT || 4000;
const container = buildContainer(asegurarEsquema(openDatabase()));

if (container.authService.sembrar({ claveAdmin: process.env.ADMIN_PASSWORD || "Admin#2026", demo: !process.env.ADMIN_PASSWORD, total: 50 }).creado)
  console.log(process.env.ADMIN_PASSWORD ? "Usuario admin creado con ADMIN_PASSWORD." : "Usuarios de demostración creados (admin, operador, consulta). Cambia las claves antes de un uso real.");
createApp({ container, publicDir: path.join(__dirname, "public"), logger })
  .listen(PORT, () => console.log(`Servidor backend escuchando en http://localhost:${PORT}`));
