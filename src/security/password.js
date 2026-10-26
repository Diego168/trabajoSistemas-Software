const crypto = require("crypto");
const N = 16384, R = 8, P = 1, KEYLEN = 64;

function hashClave(clave) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(String(clave), salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${salt.toString("base64")}$${h.toString("base64")}`;
}
function verificarClave(clave, guardado) {
  try {
    const [alg, n, salt, hash] = String(guardado).split("$");
    if (alg !== "scrypt") return false;
    const esperado = Buffer.from(hash, "base64");
    const h = crypto.scryptSync(String(clave), Buffer.from(salt, "base64"), esperado.length, { N: Number(n), r: R, p: P });
    return h.length === esperado.length && crypto.timingSafeEqual(h, esperado); // comparación en tiempo constante
  } catch { return false; }
}
module.exports = { hashClave, verificarClave };
