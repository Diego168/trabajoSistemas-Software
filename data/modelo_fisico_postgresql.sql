-- =====================================================================
-- Script de Base de Datos (Modelo Físico) — PostgreSQL
-- Sistema de Gestión — Artesanías Legado S.A.C.
-- =====================================================================

CREATE TABLE proveedor (
    id_proveedor    SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    contacto        VARCHAR(60),
    tipo_insumo     VARCHAR(40)
);

CREATE TABLE taller (
    id_taller       SERIAL PRIMARY KEY,
    nombre          VARCHAR(80)  NOT NULL,
    tecnica         VARCHAR(40)  NOT NULL
);

CREATE TABLE artesano (
    id_artesano     SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    especialidad    VARCHAR(60)  NOT NULL,
    id_taller       INTEGER      NOT NULL REFERENCES taller(id_taller)
);

CREATE TABLE insumo (
    id_insumo       SERIAL PRIMARY KEY,
    nombre          VARCHAR(100)  NOT NULL,
    categoria       VARCHAR(40)   NOT NULL,
    unidad          VARCHAR(20)   NOT NULL,
    stock           NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock_minimo    NUMERIC(10,2) NOT NULL DEFAULT 0,
    id_taller       INTEGER       NOT NULL REFERENCES taller(id_taller),
    id_proveedor    INTEGER       REFERENCES proveedor(id_proveedor)
);

CREATE TABLE pieza (
    id_pieza        SERIAL PRIMARY KEY,
    codigo          VARCHAR(20)   NOT NULL UNIQUE,
    nombre          VARCHAR(100)  NOT NULL,
    tecnica         VARCHAR(40)   NOT NULL,
    id_taller       INTEGER       NOT NULL REFERENCES taller(id_taller),
    precio          NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    estado          VARCHAR(20)   NOT NULL DEFAULT 'EN_PRODUCCION'
                    CHECK (estado IN ('EN_PRODUCCION','DISPONIBLE','VENDIDA'))
);

CREATE TABLE produccion_pieza (
    id_produccion       SERIAL PRIMARY KEY,
    id_pieza            INTEGER NOT NULL REFERENCES pieza(id_pieza),
    id_artesano         INTEGER NOT NULL REFERENCES artesano(id_artesano),
    etapa               VARCHAR(20) NOT NULL
                        CHECK (etapa IN ('MODELADO','SECADO','COCCION','TALLADO','TEJIDO','ACABADO')),
    fecha_inicio        DATE,
    fecha_fin           DATE,
    merma_descripcion   VARCHAR(200)
);

CREATE TABLE cliente (
    id_cliente          SERIAL PRIMARY KEY,
    nombre              VARCHAR(120) NOT NULL,
    documento           VARCHAR(20)  NOT NULL UNIQUE,
    tipo                VARCHAR(20)  NOT NULL
                        CHECK (tipo IN ('COLECCIONISTA','MAYORISTA','PARTICULAR')),
    telefono            VARCHAR(20),
    puntos_fidelizacion INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE venta (
    id_venta        SERIAL PRIMARY KEY,
    id_cliente      INTEGER REFERENCES cliente(id_cliente),
    fecha           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total           NUMERIC(10,2) NOT NULL DEFAULT 0,
    canal           VARCHAR(20) NOT NULL CHECK (canal IN ('TIENDA','FERIA','EN_LINEA'))
);

CREATE TABLE venta_detalle (
    id_detalle      SERIAL PRIMARY KEY,
    id_venta        INTEGER NOT NULL REFERENCES venta(id_venta) ON DELETE CASCADE,
    id_pieza        INTEGER NOT NULL REFERENCES pieza(id_pieza),
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio          NUMERIC(10,2) NOT NULL CHECK (precio >= 0)
);

CREATE TABLE encargo (
    id_encargo      SERIAL PRIMARY KEY,
    id_cliente      INTEGER NOT NULL REFERENCES cliente(id_cliente),
    id_taller       INTEGER NOT NULL REFERENCES taller(id_taller),
    id_artesano     INTEGER REFERENCES artesano(id_artesano),
    descripcion     VARCHAR(300) NOT NULL,
    fecha_entrega   DATE,
    estado          VARCHAR(20) NOT NULL DEFAULT 'REGISTRADO'
                    CHECK (estado IN ('REGISTRADO','EN_PRODUCCION','ENTREGADO'))
);

-- Índices de apoyo a consultas frecuentes
CREATE INDEX idx_insumo_taller       ON insumo(id_taller);
CREATE INDEX idx_pieza_taller        ON pieza(id_taller);
CREATE INDEX idx_produccion_pieza    ON produccion_pieza(id_pieza);
CREATE INDEX idx_venta_cliente       ON venta(id_cliente);
CREATE INDEX idx_ventadetalle_venta  ON venta_detalle(id_venta);
CREATE INDEX idx_encargo_cliente     ON encargo(id_cliente);
CREATE INDEX idx_encargo_estado      ON encargo(estado);

-- Usuarios del sistema (login). La clave se guarda como hash scrypt, nunca en claro.
CREATE TABLE usuario (
    id_usuario  SERIAL PRIMARY KEY,
    usuario     VARCHAR(30)  NOT NULL UNIQUE,
    nombre      VARCHAR(120) NOT NULL,
    clave_hash  VARCHAR(300) NOT NULL,
    rol         VARCHAR(12)  NOT NULL CHECK (rol IN ('ADMIN','OPERADOR','CONSULTA')),
    activo      BOOLEAN      NOT NULL DEFAULT TRUE
);
