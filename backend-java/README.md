# Artesanías Legado S.A.C. — Backend en Java

Versión Java 21 del sistema de gestión. Reutiliza **el mismo frontend** (`../public`) y expone **la misma API** que la
versión Node.js, por lo que las pantallas funcionan sin cambios.

| Capa | Paquete | Qué hace |
|---|---|---|
| Vista (V de MVC) | `../public` | HTML + CSS + JavaScript |
| Controlador (C) | `web` (`Controllers`, `HttpApp`) | Rutas HTTP → servicios; seguridad transversal |
| DTO | `dto` (`Dtos`, `Campos`) | Valida y normaliza todo lo que entra |
| Servicio (M) | `service`, `archivo` | Reglas de negocio y transacciones |
| DAO | `dao` (interfaces + `Jdbc*Dao`) | Todo el SQL, siempre con parámetros |
| Persistencia | `config` (`Database`, `SchemaInitializer`) | JDBC, transacciones, esquema |
| Raíz de composición | `Container` | Único lugar donde se crean y conectan las dependencias (SOLID-D) |

## Librerías de apoyo

| Librería | Dónde se usa |
|---|---|
| **Google Guava** | `ImmutableList/Set/Map` (constantes y respuestas), `CharMatcher` (DTO), `Cache` + `Ticker` (sesiones e intentos fallidos con caducidad), `Stopwatch` (duración de cada petición) |
| **Apache POI** | `archivo/ExcelExporter`: reportes `.xlsx` y `.xls` con la interfaz `Workbook` |
| **Apache Commons** | `commons-csv` (CSV RFC 4180), `commons-lang3` (`StringUtils`), `commons-io` (`IOUtils`, `FilenameUtils`) |
| **Logback + SLF4J** | `logging/EventLogger` + `src/main/resources/logback.xml` |
| Jackson, H2, JUnit 5 | JSON, base de datos (modo PostgreSQL) y pruebas |

## Requisitos

* JDK 21
* Maven 3.9+ (con acceso a Maven Central) — o, sin Maven, el script `build.sh` (ver abajo)

## Ejecutar (Windows, desde la carpeta `backend-java`)

```
mvn package
set ADMIN_PASSWORD=ClaveSegura#1
java -jar target\artesanias-legado.jar
```

Abre <http://localhost:4000>. Si no defines `ADMIN_PASSWORD` se crean usuarios de demostración, solo para pruebas:

| Usuario | Clave | Rol |
|---|---|---|
| `admin` | `Admin#2026` | ADMIN |
| `operador`, `operador01` … `operador24` | `Operador#2026` | OPERADOR |
| `consulta`, `consulta01` … `consulta23` | `Consulta#2026` | CONSULTA |

La primera vez se cargan datos de demostración (50 o más filas por tabla: 50 proveedores, 3 talleres (20 artesanos cada uno), 60 artesanos,
60 insumos, 120 piezas, 55 registros de producción, 60 clientes, 60 ventas con 62 líneas, 55 encargos y 50 usuarios).
Se generan con `python3 tools/generar_datos_demo.py` → `src/main/resources/db/demo-data.sql`. Para empezar de nuevo, borra la carpeta `data/`.

Pruebas: `mvn test`.

### Sin Maven (Linux con las bibliotecas del sistema)

```
./build.sh         # compila y ejecuta las pruebas
./build.sh run     # compila y arranca el servidor
```

## Configuración (variables de entorno)

| Variable | Por defecto | Uso |
|---|---|---|
| `PORT` | `4000` | Puerto HTTP |
| `DB_PATH` | `data/artesanias_legado` | Archivo de la base H2 (se crea sola) |
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | H2 en archivo | Para usar **PostgreSQL**: `DB_URL=jdbc:postgresql://localhost:5432/artesanias` (agregar el driver `org.postgresql:postgresql` al `pom.xml`) |
| `PUBLIC_DIR` | `../public` | Carpeta del frontend |
| `ADMIN_PASSWORD` | — | Clave del administrador inicial |
| `COOKIE_SECURE` | — | `1` agrega `Secure` a la cookie (HTTPS) |
| `CORS_ORIGIN` | — | Origen permitido si el frontend se sirve aparte |
| `LOG_DIR` / `LOG_LEVEL` | `logs` / `INFO` | Logback |

## Seguridad

PBKDF2-HMAC-SHA256 con sal (210 000 iteraciones) · sesión en cookie `HttpOnly; SameSite=Strict` de 8 h ·
bloqueo tras 5 fallos (429) · verificación de `Origin` (CSRF) · roles ADMIN / OPERADOR / CONSULTA ·
consultas parametrizadas · validación en DTO · cuerpo máximo 100 KB (413) · protección contra recorrido de rutas ·
CSP `script-src 'self'` · errores internos genéricos (500) · registro que oculta `password`, `clave`, `token`,
`authorization` y `secret`.

## Registro de eventos (Logback)

`logback.xml` escribe a consola y a `logs/app.log` con rotación diaria (`app-AAAA-MM-DD.log`, 30 días).
Cada línea es un JSON armado por `EventLogger`.

## API adicional respecto a la versión Node

`GET /api/export/{piezas|insumos|produccion|encargos|ventas}.xlsx` y `.xls` (Excel, Apache POI).

## Documentación del código

`javadoc -d docs/javadoc -sourcepath src/main/java -subpackages com.artesanialegado` (o `mvn javadoc:javadoc`).
