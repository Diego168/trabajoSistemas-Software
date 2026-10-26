# Artesanías Legado S.A.C. · Sistema de gestión

Sistema web para talleres de artesanía de alto valor (ventas, insumos, producción por taller, encargos, registros).
Arquitectura MVC por capas (Controller → DTO → Service → DAO → BD), TDD con `node:test`, sin dependencias de npm.

## Puesta en marcha
```
node scripts/restaurar-bd.js      # crea data/artesanias_legado.db desde el respaldo versionado
npm test                          # pruebas (Node 22+)
npm start                         # http://localhost:4000
```
Variables: `PORT`, `DB_PATH`, `LOG_DIR`, `LOG_LEVEL`, `CORS_ORIGIN`.

## Backend en Java
La carpeta `backend-java/` contiene la versión Java 21 (Guava, Apache POI, Apache Commons, Logback) que sirve el mismo frontend.
Instrucciones en `backend-java/README.md`.

## Control de versiones
Ver [CONTRIBUTING.md](CONTRIBUTING.md): ramas, convención de commits, hooks, releases y reversiones.
Historial de versiones en [CHANGELOG.md](CHANGELOG.md).

## Carpetas
`src/` backend por capas · `public/` frontend · `tests/` pruebas · `data/` respaldo y modelo físico · `docs/` evidencias · `scripts/` utilidades.

> Nota del colaborador: usar Node 22 o superior.
# trabajoSistemas-Software
