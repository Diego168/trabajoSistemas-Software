# Historial de versiones

## [3.0.0] – backend en Java
- Nuevo `backend-java/`: backend en Java 21 con las mismas capas (controlador, DTO, servicio, DAO, base de datos) y la **misma API**; reutiliza el frontend de `public/`.
- Librerías de apoyo: Google Guava, Apache POI, Apache Commons (CSV, Lang, IO) y Logback/SLF4J.
- Persistencia JDBC sobre H2 en modo PostgreSQL con el mismo esquema (`schema.sql`); configurable hacia PostgreSQL por variables de entorno.
- Seguridad: PBKDF2 con sal, sesión HttpOnly/SameSite=Strict, bloqueo por intentos (caché de Guava con caducidad), CSRF, roles, límites de cuerpo.
- Exportación nueva a Excel (.xls y .xlsx) además de CSV.
- 62 pruebas JUnit 5 (1 condicional por entorno). La versión Node.js se mantiene con sus 146 pruebas.

## [2.2.1] – hotfix
- Diccionario de datos: las restricciones CHECK ya no pierden el paréntesis final.

## [2.2.0] – documentación versionada
- Diccionario de datos generado desde el esquema real, modelo de reportes RPT-*, inventario de documentación verificado por pruebas.
- Documentación de los talleres anteriores incorporada al repositorio (`documentacion/`).
- Diagrama de arquitectura con login y control de versiones; gráfico de red del repositorio.
- Colaboración: nota de versión mínima de Node en el README.

## [2.1.1] – hotfix
- Login: los intentos fallidos y sesiones vencidas se olvidan (antes crecían sin límite).

## [2.1.0] – login y control de versiones
- Login con usuario y contraseña (hash scrypt), sesión por cookie HttpOnly/SameSite=Strict, roles ADMIN/OPERADOR/CONSULTA.
- Bloqueo tras 5 intentos fallidos, chequeo de origen (CSRF), páginas internas protegidas.
- Respeta la preferencia de movimiento reducido del sistema.
- Repositorio Git: flujo de ramas, hooks, restauración de la BD desde el respaldo.

## [2.0.0] – línea base
- Arquitectura MVC/DAO/DTO, producción por taller, registros de clientes, artesanos y proveedores.
