const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { Database } = require("../src/config/database");
const { hashClave } = require("../src/security/password");

const CLAVES = { admin: "Admin#2026", operador: "Operador#2026", consulta: "Consulta#2026" };

function createTestDatabase() {
  const raw = new DatabaseSync(":memory:");
  raw.exec("PRAGMA foreign_keys = ON");
  raw.exec(fs.readFileSync(path.join(__dirname, "fixtures", "schema.sql"), "utf8").replace(/CREATE TABLE sqlite_sequence\(name,seq\);/, ""));
  raw.exec(`
    INSERT INTO proveedor(nombre,contacto,tipo_insumo) VALUES ('Arcillas del Sur','999111222','Arcilla');
    INSERT INTO taller(nombre,tecnica) VALUES ('Taller Barro','Alfarería'),('Taller Madera','Ebanistería');
    INSERT INTO artesano(nombre,especialidad,id_taller) VALUES ('Rosa Quispe','Alfarera',1),('Juan Mamani','Ebanista',2);
    INSERT INTO insumo(nombre,categoria,unidad,stock,stock_minimo,id_taller,id_proveedor) VALUES
      ('Arcilla roja','Materia prima','kg',120,30,1,1),('Madera de cedro','Materia prima','m',15,20,2,NULL);
    INSERT INTO pieza(codigo,nombre,tecnica,id_taller,precio,estado) VALUES
      ('PZ-001','Jarrón de barro','Alfarería',1,180,'DISPONIBLE'),
      ('PZ-002','Mesa rústica','Ebanistería',2,320,'DISPONIBLE'),
      ('PZ-003','Cofre tallado','Ebanistería',2,500,'VENDIDA');
    INSERT INTO cliente(nombre,documento,tipo,telefono,puntos_fidelizacion) VALUES ('Ana Torres','45678912','COLECCIONISTA','987654321',100);
    INSERT INTO produccion_pieza(id_pieza,id_artesano,etapa,fecha_inicio) VALUES (2,2,'TALLADO','2026-09-01');
    INSERT INTO encargo(id_cliente,id_taller,id_artesano,descripcion,fecha_entrega,estado) VALUES (1,1,1,'Juego de tazas','2026-11-01','REGISTRADO');
  `);
  const ins = raw.prepare("INSERT INTO usuario(usuario,nombre,clave_hash,rol) VALUES (?,?,?,?)");
  ins.run("admin", "Administrador", hashClave(CLAVES.admin), "ADMIN");
  ins.run("operador", "Operador de tienda", hashClave(CLAVES.operador), "OPERADOR");
  ins.run("consulta", "Consulta", hashClave(CLAVES.consulta), "CONSULTA");
  return new Database(raw);
}
/** Inicia sesión por HTTP y devuelve las cabeceras (con cookie) para las siguientes peticiones. */
async function loginHeaders(base, usuario = "admin") {
  const r = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario, clave: CLAVES[usuario] }) });
  if (r.status !== 200) throw new Error("login de prueba falló: " + r.status);
  return { "Content-Type": "application/json", Cookie: r.headers.get("set-cookie").split(";")[0] };
}
module.exports = { createTestDatabase, loginHeaders, CLAVES };
