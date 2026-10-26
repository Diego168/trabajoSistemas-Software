// Autenticación: verificación de clave, bloqueo por intentos, sesiones en memoria con caducidad.
const crypto = require("crypto");
const { hashClave, verificarClave } = require("../security/password");
const { ValidationError, UnauthorizedError, TooManyRequestsError } = require("../errors");

const GENERICO = "Usuario o contraseña incorrectos";
const HASH_FALSO = hashClave("clave-inexistente"); // iguala el tiempo de respuesta cuando el usuario no existe

class AuthService {
  constructor({ usuarioDao, ttlMs = 8 * 3600 * 1000, maxIntentos = 5, bloqueoMs = 5 * 60 * 1000, now = Date.now }) {
    Object.assign(this, { usuarioDao, ttlMs, maxIntentos, bloqueoMs, now });
    this.sesiones = new Map(); this.fallos = new Map();
  }
  login(usuario, clave, ip = "") {
    if (typeof usuario !== "string" || !/^[A-Za-z0-9._-]{3,30}$/.test(usuario)) throw new ValidationError("Ingresa un usuario válido");
    if (typeof clave !== "string" || clave.length < 1 || clave.length > 100) throw new ValidationError("Ingresa tu contraseña");
    const u = usuario.toLowerCase(), clavePeticion = `${u}|${ip}`, t = this.now();
    this.#purgar(t);
    const f = this.fallos.get(clavePeticion);
    if (f && f.hasta > t) throw new TooManyRequestsError("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
    const fila = this.usuarioDao.findByUsuario(u);
    const ok = verificarClave(clave, fila ? fila.clave_hash : HASH_FALSO) && fila && fila.activo === 1;
    if (!ok) {
      const n = (f ? f.n : 0) + 1;
      this.fallos.set(clavePeticion, { n, hasta: n >= this.maxIntentos ? t + this.bloqueoMs : 0, ultimo: t });
      throw new UnauthorizedError(GENERICO);
    }
    this.fallos.delete(clavePeticion);
    const token = crypto.randomBytes(32).toString("base64url");
    const datos = { usuario: fila.usuario, nombre: fila.nombre, rol: fila.rol };
    this.sesiones.set(token, { ...datos, expira: t + this.ttlMs });
    return { token, usuario: datos };
  }
  /** Olvida bloqueos vencidos, fallos fuera de la ventana y sesiones caducadas (evita crecer sin límite). */
  #purgar(t) {
    for (const [k, f] of this.fallos) if (f.hasta > 0 ? f.hasta <= t : f.ultimo + this.bloqueoMs <= t) this.fallos.delete(k);
    for (const [k, v] of this.sesiones) if (v.expira <= t) this.sesiones.delete(k);
  }
  sesion(token) {
    const s = token && this.sesiones.get(token); if (!s) return null;
    if (s.expira <= this.now()) { this.sesiones.delete(token); return null; }
    return { usuario: s.usuario, nombre: s.nombre, rol: s.rol };
  }
  logout(token) { this.sesiones.delete(token); }
  get maxAgeSeg() { return Math.floor(this.ttlMs / 1000); }
  /** Crea el administrador inicial solo si no hay usuarios. */
  /** total (solo con demo): completa hasta ese número de usuarios con operador01, consulta01, operador02... */
  sembrar({ claveAdmin, demo = false, total = 0 }) {
    if (this.usuarioDao.count() > 0) return { creado: false };
    this.usuarioDao.insert({ usuario: "admin", nombre: "Administrador", clave_hash: hashClave(claveAdmin), rol: "ADMIN" });
    if (demo) { // cuentas de demostración para clase; deben cambiarse o eliminarse en un despliegue real
      this.usuarioDao.insert({ usuario: "operador", nombre: "Operador de tienda", clave_hash: hashClave("Operador#2026"), rol: "OPERADOR" });
      this.usuarioDao.insert({ usuario: "consulta", nombre: "Solo consulta", clave_hash: hashClave("Consulta#2026"), rol: "CONSULTA" });
      for (let i = 0; i < total - 3; i++) {
        const n = Math.floor(i / 2) + 1, op = i % 2 === 0, nn = String(n).padStart(2, "0");
        this.usuarioDao.insert(op ? { usuario: `operador${nn}`, nombre: `Operador de tienda ${n}`, clave_hash: hashClave("Operador#2026"), rol: "OPERADOR" }
          : { usuario: `consulta${nn}`, nombre: `Solo consulta ${n}`, clave_hash: hashClave("Consulta#2026"), rol: "CONSULTA" });
      }
    }
    return { creado: true };
  }
}
module.exports = { AuthService };
