#!/usr/bin/env python3
"""Genera src/main/resources/db/demo-data.sql: datos de demostración coherentes, con al menos 50 filas por tabla, salvo taller (3, con 20 artesanos cada uno).
Es determinista (semilla fija): ejecutarlo dos veces da el mismo archivo.   Uso:  python3 tools/generar_datos_demo.py
Los usuarios (tabla usuario) los crea la aplicación al arrancar (AuthService.sembrarDemo), porque sus claves se guardan cifradas."""
import random, pathlib
R = random.Random(2026)
q = lambda s: "'" + str(s).replace("'", "''") + "'"
def nul(v): return "NULL" if v is None else (q(v) if isinstance(v, str) else str(v))
out = ["-- Datos de demostración (generados por tools/generar_datos_demo.py). Al menos 50 filas por tabla, salvo taller (3 talleres con 20 artesanos cada uno); usuario lo siembra la aplicación."]
def ins(tabla, cols, filas):
    for f in filas: out.append(f"INSERT INTO {tabla} ({','.join(cols)}) VALUES ({','.join(nul(v) for v in f)});")

# ---------------- proveedores (50) ----------------
tipos = ["Arcilla", "Madera", "Lana/Hilo", "Pigmentos", "Barniz y lacas", "Herramientas", "Esmaltes", "Tintes naturales", "Herrajes", "Embalaje"]
pre = ["Andes", "Cusco", "Sol", "Valle", "Inca", "Quinua", "Titicaca", "Pacha", "Wayra", "Illari"]
suf = {"Arcilla": "Arcillas", "Madera": "Maderas", "Lana/Hilo": "Hilos y Fibras", "Pigmentos": "Pigmentos", "Barniz y lacas": "Barnices",
       "Herramientas": "Herramientas", "Esmaltes": "Esmaltes", "Tintes naturales": "Tintes", "Herrajes": "Herrajes", "Embalaje": "Embalajes"}
razon = ["S.A.C.", "E.I.R.L.", "S.R.L."]
prov = []
for i in range(50):
    t = tipos[i % 10]
    prov.append((i + 1, f"{suf[t]} {pre[(i // 10 + i) % 10]} {razon[i % 3]}", f"9{R.randint(10,99)} {R.randint(100,999)} {R.randint(100,999)}", t))
ins("proveedor", ["id_proveedor", "nombre", "contacto", "tipo_insumo"], prov)

# ---------------- talleres (3, como en el modelo original): lo que crece es el número de artesanos por taller ----------------
tecnicas = [("Cerámica", "Alfarería y cerámica", "Cerámica", ["MODELADO", "SECADO", "COCCION", "ACABADO"]),
            ("Ebanistería", "Tallado en madera", "Ebanistería", ["MODELADO", "TALLADO", "ACABADO"]),
            ("Mueblería Rústica", "Mueblería rústica", "Mueblería", ["MODELADO", "TALLADO", "ACABADO"]),
            ("Tejidos", "Hilados y tejidos", "Tejido", ["TEJIDO", "ACABADO"]),
            ("Telares", "Tejido en telar", "Tejido", ["TEJIDO", "ACABADO"])]
talleres = [(1, "Taller de Cerámica", "Alfarería y cerámica", 0),
            (2, "Taller de Ebanistería", "Tallado en madera", 1),
            (3, "Taller de Tejidos", "Hilados y tejidos", 3)]  # (id, nombre, tecnica_texto, idx_tecnica)
ins("taller", ["id_taller", "nombre", "tecnica"], [t[:3] for t in talleres])

# ---------------- artesanos (60): 20 por taller ----------------
nombres = ["María", "Pedro", "Rosa", "Juan", "Luz", "Carlos", "Elena", "José", "Marta", "Luis", "Ana", "Mario", "Julia", "Víctor", "Carmen", "Hugo", "Sofía", "Raúl", "Delia", "Néstor"]
apell = ["Quispe", "Huamán", "Mamani", "Condori", "Flores", "Ccori", "Paucar", "Choque", "Apaza", "Yupanqui", "Ramos", "Torres", "Callo", "Huanca", "Salas"]
oficio = {0: ["Ceramista", "Alfarero", "Alfarera"], 1: ["Ebanista", "Tallador"], 2: ["Carpintero rústico", "Ebanista"], 3: ["Tejedora", "Hilandera"], 4: ["Tejedora", "Maestra de telar"]}
usados = set(); artes = []
def nombre_unico():
    while True:
        n = f"{R.choice(nombres)} {R.choice(apell)} {R.choice(apell)}"
        if n not in usados: usados.add(n); return n
tall_de_art = []
for i in range(60):
    tid = i % 3 + 1
    t = talleres[tid - 1]
    artes.append((i + 1, nombre_unico(), R.choice(oficio[t[3]]), tid))
ins("artesano", ["id_artesano", "nombre", "especialidad", "id_taller"], artes)
arts_por_taller = {}
for a in artes: arts_por_taller.setdefault(a[3], []).append(a[0])

# ---------------- insumos (60) ----------------
mat = {0: [("Arcilla roja", "Materia prima", "kg"), ("Arcilla blanca", "Materia prima", "kg"), ("Engobe", "Acabado", "lt"), ("Esmalte transparente", "Acabado", "lt"), ("Óxido de hierro", "Pigmento", "kg")],
       1: [("Madera de cedro", "Materia prima", "pza"), ("Madera de tornillo", "Materia prima", "pza"), ("Barniz marino", "Acabado", "lt"), ("Lija al agua", "Herramienta", "pza"), ("Cera de abeja", "Acabado", "kg")],
       2: [("Madera de eucalipto", "Materia prima", "pza"), ("Clavos de forja", "Herraje", "kg"), ("Laca rústica", "Acabado", "lt"), ("Cola vinílica", "Insumo", "lt"), ("Cuero crudo", "Materia prima", "m")],
       3: [("Lana de alpaca", "Materia prima", "kg"), ("Lana de oveja", "Materia prima", "kg"), ("Hilo de algodón", "Materia prima", "kg"), ("Tinte de cochinilla", "Tinte", "kg"), ("Tinte de molle", "Tinte", "kg")],
       4: [("Lana de vicuña", "Materia prima", "kg"), ("Hilo de alpaca", "Materia prima", "kg"), ("Tinte de añil", "Tinte", "kg"), ("Fibra de llama", "Materia prima", "kg"), ("Hilo metálico", "Insumo", "kg")]}
prov_tipo = {0: ["Arcilla", "Esmaltes", "Pigmentos"], 1: ["Madera", "Barniz y lacas"], 2: ["Madera", "Herrajes"], 3: ["Lana/Hilo", "Tintes naturales"], 4: ["Lana/Hilo", "Tintes naturales"]}
ins_rows = []
for i in range(60):
    tid = i % 3 + 1
    t = talleres[tid - 1]; n, c, u = R.choice(mat[t[3]])
    minimo = R.choice([10, 15, 20, 25, 30, 40])
    stock = R.randint(2, minimo - 1) if i % 4 == 0 else R.randint(minimo, minimo * 5)  # ~25% por debajo del mínimo
    cand = [p[0] for p in prov if p[3] in prov_tipo[t[3]]]
    pid = None if i % 11 == 0 else R.choice(cand)
    ins_rows.append((i + 1, n, c, u, stock, minimo, tid, pid))
ins("insumo", ["id_insumo", "nombre", "categoria", "unidad", "stock", "stock_minimo", "id_taller", "id_proveedor"], ins_rows)

# ---------------- piezas (120): 62 vendidas, 33 disponibles, 25 en producción ----------------
nom_p = {0: ["Jarrón", "Plato decorativo", "Cántaro", "Tazón", "Fuente", "Maceta", "Florero"], 1: ["Banco tallado", "Cofre", "Marco tallado", "Espejo tallado", "Puerta decorativa", "Atril"],
         2: ["Mesa rústica", "Silla rústica", "Aparador", "Banca de comedor", "Baúl", "Repisa"], 3: ["Poncho", "Chalina", "Manta", "Chullo", "Alfombra", "Bufanda"], 4: ["Tapiz", "Chal", "Camino de mesa", "Manta tejida", "Cojín tejido"]}
ad = ["Sol Andino", "Inca", "Chakana", "Pachamama", "Wari", "Nazca", "Mochica", "Colibrí", "Cóndor", "Puma", "Quinua", "Machu", "Titicaca", "Ayni"]
estados = ["VENDIDA"] * 62 + ["DISPONIBLE"] * 33 + ["EN_PRODUCCION"] * 25
R.shuffle(estados)
piezas = []
for i in range(120):
    tid = R.randint(1, 3); t = talleres[tid - 1]
    base = {0: 120, 1: 220, 2: 300, 3: 150, 4: 180}[t[3]]
    piezas.append((i + 1, f"PZ-{i + 1:03d}", f"{R.choice(nom_p[t[3]])} {R.choice(ad)}", tecnicas[t[3]][2], tid, base + R.randint(0, 40) * 10, estados[i]))
ins("pieza", ["id_pieza", "codigo", "nombre", "tecnica", "id_taller", "precio", "estado"], piezas)
pz = {p[0]: p for p in piezas}

# ---------------- producción (55): 25 en curso + 30 finalizadas ----------------
prod = []
en_curso = [p for p in piezas if p[6] == "EN_PRODUCCION"]
final = R.sample([p for p in piezas if p[6] == "DISPONIBLE"], 30)
def fecha(a, b):
    from datetime import date, timedelta
    return (date(2026, 1, 5) + timedelta(days=R.randint(a, b))).isoformat()
for p in en_curso:
    et = tecnicas[talleres[p[4] - 1][3]][3]
    prod.append((len(prod) + 1, p[0], R.choice(arts_por_taller[p[4]]), R.choice(et[:-1] if len(et) > 2 else et), fecha(180, 280), None))
for p in final:
    et = tecnicas[talleres[p[4] - 1][3]][3]
    ini = fecha(0, 170)
    from datetime import date, timedelta
    fin = (date.fromisoformat(ini) + timedelta(days=R.randint(10, 40))).isoformat()
    prod.append((len(prod) + 1, p[0], R.choice(arts_por_taller[p[4]]), et[-1], ini, fin))
ins("produccion_pieza", ["id_produccion", "id_pieza", "id_artesano", "etapa", "fecha_inicio", "fecha_fin"], prod)

# ---------------- clientes (60) ----------------
tipo_c = ["COLECCIONISTA", "MAYORISTA", "PARTICULAR"]
emp = ["Decoraciones", "Hogar y Arte", "Galería", "Artesanías", "Importadora", "Regalos"]
lug2 = ["Lima", "Miraflores", "San Isidro", "Cusco", "Arequipa", "Trujillo", "Piura", "Surco"]
docs = set(); clientes = []
for i in range(60):
    t = "MAYORISTA" if i % 6 == 0 else R.choice(["COLECCIONISTA", "PARTICULAR"])
    while True:
        d = str(R.randint(20000000, 20999999999)) if t == "MAYORISTA" else str(R.randint(10000000, 79999999))
        if d not in docs: docs.add(d); break
    nom = f"{R.choice(emp)} {R.choice(lug2)} S.A.C." if t == "MAYORISTA" else nombre_unico()
    clientes.append([i + 1, nom, d, t, f"9{R.randint(10,99)} {R.randint(100,999)} {R.randint(100,999)}", 0])

# ---------------- ventas (60) y detalle (62) ----------------
vendidas = [p for p in piezas if p[6] == "VENDIDA"]; R.shuffle(vendidas)
ventas, det = [], []; k = 0
for v in range(60):
    n = 2 if v < 2 else 1
    items = vendidas[k:k + n]; k += n
    total = sum(p[5] for p in items)
    mes, dia = R.randint(1, 10), R.randint(1, 28)
    cli = None if v % 15 == 7 else R.choice(clientes)[0]
    ventas.append((v + 1, cli, f"2026-{mes:02d}-{dia:02d} {R.randint(9,19):02d}:{R.randint(0,59):02d}:00", total, R.choice(["TIENDA", "FERIA", "EN_LINEA"])))
    for p in items: det.append((len(det) + 1, v + 1, p[0], 1, p[5]))
assert k == 62 and len(det) == 62

# ---------------- encargos (55) ----------------
desc = {0: ["Juego de tazas personalizado", "Cántaro decorativo grande", "Vajilla de 12 piezas", "Maceta con relieve"], 1: ["Marco tallado para espejo", "Cofre con iniciales", "Puerta tallada", "Atril para biblia"],
        2: ["Juego de comedor en madera", "Banca para jardín", "Aparador de cedro", "Mesa de centro rústica"], 3: ["Poncho a medida", "Manta de alpaca", "Juego de chullos", "Alfombra tejida"], 4: ["Tapiz con diseño propio", "Camino de mesa", "Chal de vicuña", "Cojines tejidos"]}
enc = []
for i in range(55):
    tid = R.randint(1, 3); t = talleres[tid - 1]
    est = R.choice(["REGISTRADO", "EN_PRODUCCION", "ENTREGADO", "ENTREGADO"])
    art = None if i % 9 == 0 else R.choice(arts_por_taller[tid])
    cli = R.choice(clientes)
    if est == "ENTREGADO": cli[5] += 50
    enc.append((i + 1, cli[0], tid, art, R.choice(desc[t[3]]), fecha(100, 330), est))
for c in clientes: c[5] += R.randint(0, 8) * 10
ins("cliente", ["id_cliente", "nombre", "documento", "tipo", "telefono", "puntos_fidelizacion"], clientes)
ins("venta", ["id_venta", "id_cliente", "fecha", "total", "canal"], ventas)
ins("venta_detalle", ["id_detalle", "id_venta", "id_pieza", "cantidad", "precio"], det)
ins("encargo", ["id_encargo", "id_cliente", "id_taller", "id_artesano", "descripcion", "fecha_entrega", "estado"], enc)

ruta = pathlib.Path(__file__).resolve().parent.parent / "src/main/resources/db/demo-data.sql"
ruta.write_text("\n".join(out) + "\n", encoding="utf-8")
print("escrito", ruta, "-", len([l for l in out if l.startswith("INSERT")]), "filas")
