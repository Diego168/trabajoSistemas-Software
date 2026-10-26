// Servidor HTTP: seguridad transversal (cabeceras, límites) + despacho a controladores + estáticos (Vista).
const http = require("http"); const fs = require("fs"); const path = require("path");
const { buildRoutes } = require("../controllers/routes");
const { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, PayloadTooLargeError } = require("../errors");
const { permitido } = require("../security/permisos");

const MAX_BODY = 100 * 1024;
const SEC = {
  "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'" };
const PUBLICAS = new Set(["/login.html"]); // páginas accesibles sin sesión (los .css/.js/.svg no contienen datos)
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0, over = false; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > MAX_BODY) { over = true; chunks.length = 0; } else if (!over) chunks.push(c); });
    req.on("end", () => { if (over) return reject(new PayloadTooLargeError()); const t = Buffer.concat(chunks).toString("utf8"); if (!t) return resolve({}); try { resolve(JSON.parse(t)); } catch { reject(new ValidationError("JSON inválido")); } });
    req.on("error", reject);
  });
}

function cookie(req, nombre) {
  const m = String(req.headers.cookie || "").split(";").map((c) => c.trim()).find((c) => c.startsWith(nombre + "="));
  return m ? m.slice(nombre.length + 1) : null;
}

function createApp({ container, publicDir, corsOrigin = process.env.CORS_ORIGIN, logger = { info() {}, warn() {}, error() {} } }) {
  const routes = buildRoutes(container);
  const root = path.resolve(publicDir);
  const headers = (extra = {}) => ({ ...SEC, ...(corsOrigin ? { "Access-Control-Allow-Origin": corsOrigin, "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE" } : {}), ...extra });
  const json = (res, status, obj) => { res.writeHead(status, headers({ "Content-Type": "application/json; charset=utf-8" })); res.end(JSON.stringify(obj)); };
  const csv = (res, d) => { res.writeHead(200, headers({ "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${d.filename}"` })); res.end("\uFEFF" + d.csv); };

  const auth = container.authService;
  const seguro = (req) => process.env.COOKIE_SECURE === "1" || req.headers["x-forwarded-proto"] === "https";
  const setCookie = (req, valor, maxAge) => `sid=${valor}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${seguro(req) ? "; Secure" : ""}`;
  const sinCache = { "Cache-Control": "no-store" };

  function serveStatic(req, res, pathname) {
    let rel; try { rel = decodeURIComponent(pathname); } catch { return json(res, 400, { error: "Ruta inválida" }); }
    if (rel.includes("\0")) return json(res, 400, { error: "Ruta inválida" });
    const file = path.resolve(root, "." + (rel === "/" ? "/index.html" : rel));
    if (file !== root && !file.startsWith(root + path.sep)) return json(res, 403, { error: "Acceso denegado" });
    const relPub = "/" + path.relative(root, file).split(path.sep).join("/");
    if (path.extname(file) === ".html" && relPub !== "/index.html" && !PUBLICAS.has(relPub) && !auth.sesion(cookie(req, "sid"))) {
      res.writeHead(302, headers({ Location: "login.html?next=" + encodeURIComponent(path.basename(file)) })); return res.end();
    }
    fs.readFile(file, (err, data) => {
      if (err) return json(res, 404, { error: "No encontrado" });
      res.writeHead(200, headers({ "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" })); res.end(data);
    });
  }

  return http.createServer(async (req, res) => {
    const t0 = Date.now();
    res.on("finish", () => logger.info("http", { method: req.method, path: (req.url || "").split("?")[0], status: res.statusCode, ms: Date.now() - t0 }));
    try {
      const u = new URL(req.url, "http://localhost"); const pathname = u.pathname;
      if (req.method === "OPTIONS") { res.writeHead(204, headers()); return res.end(); }
      if (pathname.startsWith("/api/")) {
        if (["POST", "PUT", "DELETE"].includes(req.method) && req.headers.origin) { // defensa CSRF adicional a SameSite
          let o; try { o = new URL(req.headers.origin).host; } catch { o = ""; }
          if (o !== req.headers.host && req.headers.origin !== corsOrigin) throw new ForbiddenError("Origen no permitido");
        }
        const sid = cookie(req, "sid");
        if (pathname === "/api/auth/login" && req.method === "POST") {
          const b = await readBody(req);
          const ip = req.socket.remoteAddress || "";
          try {
            const r = auth.login(b.usuario, b.clave, ip);
            logger.info("login", { usuario: r.usuario.usuario, rol: r.usuario.rol });
            res.writeHead(200, headers({ "Content-Type": "application/json; charset=utf-8", "Set-Cookie": setCookie(req, r.token, auth.maxAgeSeg), ...sinCache })); return res.end(JSON.stringify(r.usuario));
          } catch (e) { if (e instanceof AppError) logger.warn("login fallido", { usuario: typeof b.usuario === "string" ? b.usuario.slice(0, 30) : "", status: e.status }); throw e; }
        }
        if (pathname === "/api/auth/logout" && req.method === "POST") {
          auth.logout(sid);
          res.writeHead(200, headers({ "Content-Type": "application/json; charset=utf-8", "Set-Cookie": setCookie(req, "", 0), ...sinCache })); return res.end(JSON.stringify({ ok: true }));
        }
        const usuario = auth.sesion(sid);
        if (!usuario) throw new UnauthorizedError("Inicia sesión para continuar");
        if (pathname === "/api/auth/me" && req.method === "GET") { res.writeHead(200, headers({ "Content-Type": "application/json; charset=utf-8", ...sinCache })); return res.end(JSON.stringify(usuario)); }
        if (!permitido(usuario.rol, req.method, pathname)) throw new ForbiddenError();
        const route = routes.find((r) => r.method === req.method && r.pattern.test(pathname));
        if (!route) return json(res, 404, { error: "Ruta no encontrada" });
        const body = ["POST", "PUT"].includes(req.method) ? await readBody(req) : {};
        const [status, data] = route.handler({ params: pathname.match(route.pattern).slice(1).map((v) => (/^\d+$/.test(v) ? Number(v) : v)), query: u.searchParams, body });
        return data && data.csv !== undefined && data.filename ? csv(res, data) : json(res, status, data);
      }
      if (req.method === "GET") return serveStatic(req, res, pathname);
      throw new NotFoundError();
    } catch (e) {
      if (e instanceof AppError) { logger.warn("rechazo", { status: e.status, code: e.code, motivo: e.message }); return json(res, e.status, { error: e.message, code: e.code, ...(e.details ? { errores: e.details } : {}) }); }
      logger.error("error no controlado", { error: e.message, stack: String(e.stack).split("\n").slice(0, 4).join(" | ") }); // el detalle queda en el log, no en la respuesta
      json(res, 500, { error: "Error interno del servidor" });
    }
  });
}
module.exports = { createApp };
