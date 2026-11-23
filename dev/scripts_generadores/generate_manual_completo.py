import os
import json
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

BASE_DIR = r"c:\AppServ\www\Proyecto"
OUTPUT_DIR = os.path.join(BASE_DIR, "manual_usuario")
CAPTURES_SRC = os.path.join(BASE_DIR, "catalogo_capturas", "capturas")
CAPTURES_DEST = os.path.join(OUTPUT_DIR, "capturas")

DOCX_OUTPUT = os.path.join(OUTPUT_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO.docx")
MD_OUTPUT = os.path.join(OUTPUT_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO.md")
HTML_OUTPUT = os.path.join(OUTPUT_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO.html")

DOCX_ROOT = os.path.join(BASE_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO.docx")
MD_ROOT = os.path.join(BASE_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO.md")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(CAPTURES_DEST, exist_ok=True)

# Copiar las capturas
for f in os.listdir(CAPTURES_SRC):
    if f.lower().endswith(".png"):
        shutil.copy2(os.path.join(CAPTURES_SRC, f), os.path.join(CAPTURES_DEST, f))

# Cargar fichas de pantallas
with open(os.path.join(BASE_DIR, "scratch", "screens_dump.json"), "r", encoding="utf-8") as f:
    screens_data = json.load(f)

# Mapa de imágenes exactas
IMAGE_MAP = {
    1: "01_portal_bienvenida.png",
    2: "02_login_admin.png",
    3: "03_modal_recuperar_password.png",
    4: "04_login_docente.png",
    5: "05_superadmin_dashboard.png",
    6: "06_superadmin_modal_nuevo_admin.png",
    7: "32_superadmin_docentes_acciones.png",
    8: "33_superadmin_estudiantes_filtros.png",
    9: "34_superadmin_base_datos_metricas.png",
    10: "35_superadmin_base_datos_optimizacion.png",
    11: "36_superadmin_modal_restaurar_bd.png",
    12: "07_admin_inicio.png",
    13: "08_admin_usuarios_todos.png",
    14: "09_admin_profesores.png",
    15: "10_admin_administradores.png",
    16: "11_admin_secciones_y_anos.png",
    17: "12_admin_estudiantes.png",
    18: "13_admin_registrar_notas.png",
    19: "14_admin_reporte_notas.png",
    20: "15_admin_menciones.png",
    21: "16_admin_asignaturas.png",
    22: "17_admin_periodos.png",
    23: "18_admin_modal_seccion.png",
    24: "19_admin_modal_profesor.png",
    25: "20_admin_modal_estudiante.png",
    26: "21_admin_modal_detalle_seccion.png",
    27: "22_admin_modal_perfil_estudiante.png",
    28: "23_profesor_inicio.png",
    29: "24_profesor_secciones.png",
    30: "25_profesor_estudiantes.png",
    31: "26_profesor_registrar_notas.png",
    32: "27_profesor_reporte_notas.png",
    33: "28_profesor_menciones.png",
    34: "29_profesor_evaluaciones_plan.png",
    35: "30_profesor_modal_config_evaluaciones.png",
    36: "31_profesor_modal_calificar_evaluaciones.png"
}

COLOR_BURGUNDY = RGBColor(0x4A, 0x15, 0x1B)
COLOR_WINE = RGBColor(0x7B, 0x1A, 0x1A)
COLOR_TEXT = RGBColor(0x1E, 0x29, 0x3B)
COLOR_MUTED = RGBColor(0x64, 0x74, 0x8B)

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_borders(cell, border_color="CBD5E1"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(22)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_BURGUNDY
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(12.5)
    r.font.bold = True
    r.font.color.rgb = COLOR_WINE
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = COLOR_BURGUNDY
    return p

def add_p(doc, text, bold_prefix=None, space_after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(9.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_BURGUNDY
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(9.5)
    r.font.color.rgb = COLOR_TEXT
    return p

def add_bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(9)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_BURGUNDY
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(9)
    r.font.color.rgb = COLOR_TEXT
    return p

def add_screen_card(doc, s_idx):
    s = screens_data[s_idx - 1]
    img_filename = IMAGE_MAP[s_idx]
    img_path = os.path.join(CAPTURES_DEST, img_filename)

    p_head = doc.add_paragraph()
    p_head.paragraph_format.space_before = Pt(12)
    p_head.paragraph_format.space_after = Pt(4)
    p_head.paragraph_format.keep_with_next = True
    r_head = p_head.add_run(s["title"])
    r_head.font.name = "Calibri"
    r_head.font.size = Pt(11)
    r_head.font.bold = True
    r_head.font.color.rgb = COLOR_WINE

    tbl = doc.add_table(rows=4, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    labels = ["Perfil Autorizado:", "Ruta / Navegación:", "Propósito Funcional:", "Componentes Clave:"]
    values = [s.get("perfil", ""), s.get("ruta", ""), s.get("proposito", ""), s.get("componentes", "")]

    for row_idx in range(4):
        row = tbl.rows[row_idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(1.8)
        c1.width = Inches(5.0)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0)
        set_cell_margins(c1)
        set_cell_borders(c0)
        set_cell_borders(c1)

        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(1)
        p0.paragraph_format.space_after = Pt(1)
        r0 = p0.add_run(labels[row_idx])
        r0.font.name = "Calibri"
        r0.font.size = Pt(8.5)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_BURGUNDY

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(1)
        p1.paragraph_format.space_after = Pt(1)
        r1 = p1.add_run(values[row_idx])
        r1.font.name = "Calibri"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_TEXT

    p_img = doc.add_paragraph()
    p_img.paragraph_format.space_before = Pt(6)
    p_img.paragraph_format.space_after = Pt(4)
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.keep_with_next = True
    r_img = p_img.add_run()
    if os.path.exists(img_path):
        r_img.add_picture(img_path, width=Inches(5.8))
    else:
        r_img.add_text(f"[Captura: {img_filename}]")

    p_act = doc.add_paragraph()
    p_act.paragraph_format.space_before = Pt(2)
    p_act.paragraph_format.space_after = Pt(12)
    r_act_lbl = p_act.add_run("Acciones Permitidas: ")
    r_act_lbl.font.name = "Calibri"
    r_act_lbl.font.size = Pt(8.5)
    r_act_lbl.font.bold = True
    r_act_lbl.font.color.rgb = COLOR_BURGUNDY

    r_act_val = p_act.add_run(s.get("actions", ""))
    r_act_val.font.name = "Calibri"
    r_act_val.font.size = Pt(8.5)
    r_act_val.font.color.rgb = COLOR_TEXT

def build_full_manual():
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    # PORTADA
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(2)
    r_inst = p_inst.add_run(
        "REPÚBLICA BOLIVARIANA DE VENEZUELA\n"
        "MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN\n"
        "ESCUELA TÉCNICA ROBINSONIANA Y ZAMORANA \"ALÍ PRIMERA\"\n"
        "DEPARTAMENTO DE CONTROL DE ESTUDIOS Y SISTEMAS"
    )
    r_inst.font.name = "Calibri"
    r_inst.font.size = Pt(10)
    r_inst.font.bold = True
    r_inst.font.color.rgb = COLOR_BURGUNDY

    p_tit = doc.add_paragraph()
    p_tit.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tit.paragraph_format.space_before = Pt(16)
    p_tit.paragraph_format.space_after = Pt(4)
    r_tit = p_tit.add_run("MANUAL DE USUARIO INTEGRAL DEL SISTEMA ESCOLAR")
    r_tit.font.name = "Calibri"
    r_tit.font.size = Pt(18)
    r_tit.font.bold = True
    r_tit.font.color.rgb = COLOR_WINE

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("Guía Operativa, Pedagógica y Administrativa con Capturas Reales en Alta Resolución\nActualizado con Módulo de Evaluaciones 100%, Calculadora, Gestión de Claves y Mantenimiento MySQL")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(10)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_MUTED

    # Ficha Técnica en Portada
    t_meta = doc.add_table(rows=5, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_rows = [
        ("Institución:", "E.T.R.Z. \"Alí Primera\" (Control de Estudios y Dirección)"),
        ("Plataforma:", "Sistema Web Escolar (Apache 2.4 / PHP 7-8 / MySQL 8.0 InnoDB)"),
        ("Perfiles:", "Docente / Profesor, Administrador (Control de Estudios) y Superadministrador"),
        ("Versión del Manual:", "Versión 2.5 Consolidada con Nuevas Capturas Reales (Noviembre 2026)"),
        ("Contenido Gráfico:", "36 Vistas y Modales Interactivos Documentados con Fichas de Navegación")
    ]
    for row_idx, (k, v) in enumerate(info_rows):
        row = t_meta.rows[row_idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.0)
        c1.width = Inches(4.8)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0)
        set_cell_margins(c1)
        set_cell_borders(c0)
        set_cell_borders(c1)

        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.name = "Calibri"
        r0.font.size = Pt(8.5)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_BURGUNDY

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.name = "Calibri"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_TEXT

    doc.add_page_break()

    # CAPÍTULO 1
    add_heading_1(doc, "1. Bienvenido al Sistema Escolar E.T.R. \"Alí Primera\"")
    add_p(doc, "El Sistema Escolar de la Escuela Técnica Robinsoniana y Zamorana \"Alí Primera\" es una plataforma integral desarrollada para optimizar el control de estudios, la gestión académica, la planificación evaluativa y la emisión de reportes oficiales. El software ha sido diseñado con una arquitectura modular orientada a tres perfiles de usuario:")
    add_bullet(doc, "Personal docente encargado de planificar evaluaciones al 100%, calificar estudiantes sobre la escala ministerial de 20 puntos, vaciar notas por momentos y emitir boletines.", "Docente / Profesor: ")
    add_bullet(doc, "Personal directivo y de secretaría responsable de la matrícula escolar oficial, asignación de carga docente con contraseñas, estructuración de secciones y cierre de períodos escolares.", "Administrador (Control de Estudios): ")
    add_bullet(doc, "Rol raíz con privilegios superiores para auditoría docente con inhabilitación/reactivación y cambio de claves, filtros multidimensionales de matrícula y consola de mantenimiento de base de datos MySQL.", "Superadministrador: ")

    add_heading_2(doc, "Requisitos Técnicos Mínimos de Uso")
    add_bullet(doc, "Cualquier computadora con navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox u Opera).")
    add_bullet(doc, "Resolución de pantalla recomendada de 1366 × 768 píxeles o superior para una cómoda visualización de las tablas de vaciado de notas.")
    add_bullet(doc, "Conexión a la red local (intranet escolar) o servidor institucional activo en Apache y MySQL.")

    # CAPÍTULO 2
    add_heading_1(doc, "2. Conceptos Clave y Reglas Operativas del Sistema")
    add_p(doc, "Para garantizar la integridad académica y ministerial, el sistema opera bajo las siguientes reglas fundamentales:")
    add_bullet(doc, "La escala oficial de calificación es de 0 a 20 puntos enteros o con decimales según la ponderación. Las notas definitivas aprobatorias se sitúan entre 10 y 20 puntos.", "Escala Ministerial de 20 Puntos: ")
    add_bullet(doc, "El año escolar se divide en tres momentos pedagógicos obligatorios. Cada momento cuenta con su propia sábana de notas, fecha límite institucional y calculadora de evaluaciones.", "Tres Momentos Pedagógicos (MP1, MP2, MP3): ")
    add_bullet(doc, "En el módulo docente, las evaluaciones de cada momento deben sumar exactamente el 100%. El sistema calcula automáticamente la equivalencia en puntos sobre 20 (ejemplo: 25% equivale a 5.0 pts / 20).", "Planificación de Evaluaciones al 100%: ")
    add_bullet(doc, "Todos los nombres y apellidos de los estudiantes se formatean y guardan automáticamente en MAYÚSCULAS en la base de datos para cumplir con la normativa de actas oficiales del MPPE.", "Formato Estandarizado en Mayúsculas: ")
    add_bullet(doc, "Al finalizar el período académico, el Administrador ejecuta el protocolo de cierre institucional. Las calificaciones pasan a ser inmutables (sólo lectura) para proteger el historial académico de alteraciones.", "Actas Congeladas e Inmutables: ")
    add_bullet(doc, "Tanto el Administrador como el Superadministrador pueden inhabilitar temporalmente a un estudiante sin borrar su expediente, sincronizándose de inmediato en todas las vistas docentes.", "Inhabilitación Controlada de Matrícula: ")

    # CAPÍTULO 3
    add_heading_1(doc, "3. Primer Ingreso y Autenticación en la Plataforma")
    add_p(doc, "El acceso al sistema está protegido por mecanismos de autenticación diferenciados según el perfil del usuario. A continuación se presentan las pantallas de acceso institucional:")

    add_screen_card(doc, 1) # 01 Bienvenida
    add_screen_card(doc, 2) # 02 Login Admin
    add_screen_card(doc, 3) # 03 Modal Reset Password
    add_screen_card(doc, 4) # 04 Login Docente

    # CAPÍTULO 4
    add_heading_1(doc, "4. Guía Operativa para el Docente / Profesor")
    add_p(doc, "El entorno docente ha sido renovado con herramientas pedagógicas de alta precisión. A continuación se detalla el flujo de trabajo completo del profesor:")

    add_heading_2(doc, "4.1. Panel de Inicio y Accesos Directos")
    add_p(doc, "Al iniciar sesión, el docente visualiza su nombre en sesión, las estadísticas de sus asignaciones y tarjetas de acceso directo para vaciado de calificaciones, planificación de evaluaciones y reportes.")
    add_screen_card(doc, 28) # 23 Profesor Inicio

    add_heading_2(doc, "4.2. Consulta de Secciones y Estudiantes Asignados")
    add_p(doc, "El docente solo puede consultar los grupos y secciones donde posee carga horaria aprobada por la institución.")
    add_screen_card(doc, 29) # 24 Profesor Secciones
    add_screen_card(doc, 30) # 25 Profesor Estudiantes

    add_heading_2(doc, "4.3. Nuevo Módulo de Planificación de Evaluaciones (100% / 20 Puntos)")
    add_p(doc, "Este módulo exclusivo para profesores permite estructurar el plan de evaluación de cada materia y sección por cada momento pedagógico:")
    add_bullet(doc, "Seleccionar la sección, materia y período escolar.")
    add_bullet(doc, "Hacer clic en '+ Configurar Evaluaciones'. El docente puede definir de 1 a 7 actividades evaluativas.")
    add_bullet(doc, "Asignar porcentaje a cada actividad. La barra interactiva calcula la equivalencia en puntos sobre 20 (ej. Taller 20% = 4.0 pts; Examen 30% = 6.0 pts; Proyecto 50% = 10.0 pts). El botón 'Distribuir Equitativamente' reparte los porcentajes de forma automática.")
    add_bullet(doc, "El sistema valida que la sumatoria sea exactamente 100% (20.0 pts / 20) antes de habilitar el guardado.")
    add_screen_card(doc, 34) # 29 Profesor Evaluaciones Plan
    add_screen_card(doc, 35) # 30 Profesor Modal Config Evaluaciones

    add_heading_2(doc, "4.4. Calificación Detallada de Evaluaciones y Vaciado Automático")
    add_p(doc, "Desde la tabla de planes guardados o desde el botón de calculadora en la sábana de notas, se abre el modal de calificación detallada:")
    add_bullet(doc, "El docente ingresa la nota obtenida por cada estudiante en cada evaluación individual (escala 0 a 20 pts).")
    add_bullet(doc, "El sistema pondera en tiempo real cada nota según su porcentaje y calcula la Nota Definitiva del Momento.")
    add_bullet(doc, "Al presionar 'Guardar y Aplicar a Vaciado de Notas', la calificación calculada se transfiere automáticamente a la sábana oficial del momento (MP1, MP2 o MP3).")
    add_screen_card(doc, 36) # 31 Profesor Modal Calificar Evaluaciones

    add_heading_2(doc, "4.5. Vaciado Oficial de Calificaciones y Reportes Docentes")
    add_p(doc, "En la sábana oficial de notas, cada cabecera de momento (M.P.1, M.P.2, M.P.3) dispone de un botón de calculadora que permite alternar entre vaciado directo manual o cálculo automático por evaluaciones detalladas.")
    add_screen_card(doc, 31) # 26 Profesor Registrar Notas
    add_screen_card(doc, 32) # 27 Profesor Reporte Notas
    add_screen_card(doc, 33) # 28 Profesor Menciones

    # CAPÍTULO 5
    add_heading_1(doc, "5. Guía para el Administrador (Control de Estudios)")
    add_p(doc, "El perfil de Administrador centraliza la gestión académica, la matrícula escolar, la estructura curricular y la consolidación de actas oficiales.")

    add_heading_2(doc, "5.1. Dashboard y Directorio de Usuarios")
    add_screen_card(doc, 12) # 07 Admin Inicio
    add_screen_card(doc, 13) # 08 Admin Usuarios Todos
    add_screen_card(doc, 14) # 09 Admin Profesores
    add_screen_card(doc, 15) # 10 Admin Administradores
    add_screen_card(doc, 24) # 19 Modal Profesor con Clave

    add_heading_2(doc, "5.2. Estructura de Secciones, Menciones y Asignaturas")
    add_screen_card(doc, 16) # 11 Admin Secciones y Años
    add_screen_card(doc, 23) # 18 Modal Nueva Sección
    add_screen_card(doc, 26) # 21 Modal Detalle Sección
    add_screen_card(doc, 20) # 15 Admin Menciones
    add_screen_card(doc, 21) # 16 Admin Asignaturas

    add_heading_2(doc, "5.3. Padrón General de Estudiantes, Mayúsculas e Inhabilitación")
    add_p(doc, "El padrón de estudiantes garantiza el registro formal de la matrícula con nombres en mayúsculas forzadas para actas ministeriales. Incluye la nueva función de inhabilitar/habilitar estudiantes con confirmación.")
    add_screen_card(doc, 17) # 12 Admin Estudiantes
    add_screen_card(doc, 25) # 20 Modal Estudiante
    add_screen_card(doc, 27) # 22 Modal Expediente Estudiante

    add_heading_2(doc, "5.4. Calificaciones, Cronograma de Períodos y Cierre de Año Escolar")
    add_p(doc, "El administrador supervisa las notas consolidadas de todas las menciones y gestiona el ciclo lectivo mediante el botón 'Finalizar Año Escolar', que congela las notas en estado inmutable.")
    add_screen_card(doc, 18) # 13 Admin Registrar Notas
    add_screen_card(doc, 19) # 14 Admin Reporte Notas
    add_screen_card(doc, 22) # 17 Admin Períodos

    # CAPÍTULO 6
    add_heading_1(doc, "6. Guía para el Superadministrador (Consola de Seguridad y BD)")
    add_p(doc, "El Superadministrador dispone de acceso exclusivo para la auditoría y mantenimiento de la infraestructura técnica del sistema:")

    add_heading_2(doc, "6.1. Panel Principal y Cuentas de Administradores")
    add_screen_card(doc, 5) # 05 Superadmin Dashboard
    add_screen_card(doc, 6) # 06 Modal Nuevo Admin

    add_heading_2(doc, "6.2. Auditoría Docente y Filtros Dinámicos de Matrícula")
    add_p(doc, "Permite inhabilitar o habilitar docentes al instante, restablecer contraseñas docentes en caliente y filtrar la matrícula por Mención y Sección en tiempo real.")
    add_screen_card(doc, 7) # 32 SA Docentes Acciones
    add_screen_card(doc, 8) # 33 SA Estudiantes Filtros

    add_heading_2(doc, "6.3. Consola de Mantenimiento de Base de Datos (Métricas, Respaldos SQL e Indexado InnoDB)")
    add_p(doc, "El nuevo módulo de Base de Datos proporciona herramientas preventivas y de recuperación ante desastres:")
    add_bullet(doc, "Tarjetas métricas con el estado de almacenamiento físico de MySQL, tamaño en MB y número de registros.", "Métricas en Tiempo Real: ")
    add_bullet(doc, "Genera archivos .SQL institucionales completos mediante mysqldump con un solo clic, listos para descargar.", "Copias de Seguridad Instantáneas: ")
    add_bullet(doc, "Inspecciona las 12 tablas del sistema, verifica su integridad (CHECK TABLE) y desfragmenta el espacio en disco (OPTIMIZE / ANALYZE TABLE).", "Diagnóstico e Indexado InnoDB: ")
    add_bullet(doc, "Permite restaurar cualquier copia de seguridad previa mediante diálogo de confirmación con advertencia.", "Restauración Asistida: ")
    add_screen_card(doc, 9) # 34 SA Base de Datos Métricas
    add_screen_card(doc, 10) # 35 SA Optimización InnoDB
    add_screen_card(doc, 11) # 36 SA Modal Restaurar BD

    # CAPÍTULO 7
    add_heading_1(doc, "7. Preguntas Frecuentes y Solución de Problemas (FAQ)")
    add_p(doc, "No, el módulo de evaluaciones es una herramienta exclusiva del docente. Los administradores solo visualizan la sábana consolidada oficial.", bold_prefix="P: ¿Por qué el Administrador no ve el botón 'Evaluaciones'? R: ")
    add_p(doc, "Multiplicando el porcentaje por 20 y dividiendo entre 100. Por ejemplo, una evaluación con 25% equivale a (25 * 20)/100 = 5.0 puntos sobre 20.", bold_prefix="P: ¿Cómo calcula el sistema la equivalencia en 20 puntos? R: ")
    add_p(doc, "El sistema exige que la sumatoria de todas las actividades sea exactamente 100% (20.0 pts / 20) para evitar desajustes matemáticos en las actas.", bold_prefix="P: ¿Por qué el botón 'Guardar Configuración' está deshabilitado? R: ")
    add_p(doc, "Al cerrar el año escolar, todas las calificaciones pasan a ser inmutables (sólo lectura). Ningún docente ni administrador puede alterarlas sin reabrir formalmente el período.", bold_prefix="P: ¿Qué ocurre con las calificaciones al finalizar el año escolar? R: ")
    add_p(doc, "No es un error. Es un requisito estricto del Ministerio del Poder Popular para la Educación (MPPE) para la uniformidad ortográfica de actas y títulos.", bold_prefix="P: Los nombres de estudiantes se convierten automáticamente a MAYÚSCULAS, ¿es un error? R: ")

    # CAPÍTULO 8
    add_heading_1(doc, "8. Buenas Prácticas y Cierre de Sesión Seguro")
    add_bullet(doc, "Cerrar sesión siempre utilizando el botón 'Cerrar sesión' del menú lateral para destruir las credenciales en sessionStorage.")
    add_bullet(doc, "Generar respaldos de base de datos (.SQL) semanalmente desde el panel de Superadministrador y descargarlos a un dispositivo externo.")
    add_bullet(doc, "Verificar que la suma de porcentajes de evaluación sea 100% antes de iniciar la carga de notas de cada momento.")

    # Guardar en output y en root
    doc.save(DOCX_OUTPUT)
    print(f"SUCCESS: DOCX guardado en {DOCX_OUTPUT}")
    shutil.copy2(DOCX_OUTPUT, DOCX_ROOT)
    print(f"SUCCESS: Copia DOCX guardada en {DOCX_ROOT}")

def build_markdown_and_html():
    # Markdown
    md_lines = [
        "# 📘 Manual de Usuario Integral – Sistema Escolar E.T.R. \"Alí Primera\"",
        "**Departamento de Control de Estudios y Sistemas**  ",
        "*Versión 2.5 Consolidada con Nuevas Capturas Reales (Noviembre 2026)*",
        "",
        "---",
        "",
        "## 📑 Tabla de Contenidos",
        "1. [Bienvenido al Sistema](#1-bienvenido-al-sistema)",
        "2. [Conceptos Clave y Reglas Operativas](#2-conceptos-clave-y-reglas-operativas)",
        "3. [Primer Ingreso y Autenticación](#3-primer-ingreso-y-autenticacion)",
        "4. [Guía para el Docente / Profesor](#4-guia-para-el-docente--profesor)",
        "5. [Guía para el Administrador (Control de Estudios)](#5-guia-para-el-administrador-control-de-estudios)",
        "6. [Guía para el Superadministrador (Seguridad y BD)](#6-guia-para-el-superadministrador-seguridad-y-bd)",
        "7. [Preguntas Frecuentes (FAQ)](#7-preguntas-frecuentes-faq)",
        "8. [Buenas Prácticas y Seguridad](#8-buenas-practicas-y-seguridad)",
        "",
        "---",
        "",
        "## 1. Bienvenido al Sistema",
        "El Sistema Escolar de la E.T.R.Z. \"Alí Primera\" es una plataforma web desarrollada en Apache, PHP 7-8 y MySQL 8.0 (motor InnoDB) diseñada para digitalizar y automatizar los procesos pedagógicos, administrativos y de control de estudios.",
        "",
        "### Perfiles de Usuario:",
        "- **Docente / Profesor:** Planificación de evaluaciones al 100% sobre 20 pts, vaciado de notas con calculadora interactiva, inasistencias y emisión de sábanas/boletines.",
        "- **Administrador (Control de Estudios):** Matrícula escolar (nombres en mayúsculas), control de docentes con contraseña asignada, inhabilitación de alumnos, secciones, asignaturas, menciones y cierre de año escolar.",
        "- **Superadministrador:** Consola de seguridad institucional, auditoría docente con reseteo de claves, filtros multidimensionales de matrícula y panel de mantenimiento de base de datos MySQL (respaldos .SQL, diagnóstico e indexado InnoDB).",
        "",
        "---",
        "",
        "## 2. Conceptos Clave y Reglas Operativas",
        "- **Escala de 20 Puntos:** Notas oficiales entre 0 y 20 puntos. Mínima aprobatoria: 10 puntos.",
        "- **Tres Momentos Pedagógicos (MP1, MP2, MP3):** Lapsos escolares con cronograma institucional y fechas de cierre.",
        "- **Evaluaciones al 100% (20 pts):** Las actividades evaluativas deben sumar exactamente 100% y el sistema calcula la equivalencia en puntos sobre 20 (ej. 25% = 5.0 pts / 20).",
        "- **Mayúsculas Forzadas:** Los nombres y apellidos de los estudiantes se estandarizan en mayúsculas en la base de datos para actas ministeriales.",
        "- **Actas Congeladas:** El cierre de año escolar bloquea la edición de notas a los docentes y las vuelve inmutables.",
        "",
        "---",
        "",
        "## 3. Primer Ingreso y Autenticación",
        ""
    ]

    def add_md_screen(s_idx):
        s = screens_data[s_idx - 1]
        img_fn = IMAGE_MAP[s_idx]
        return [
            f"### {s['title']}",
            "",
            "| Parámetro | Detalle |",
            "| :--- | :--- |",
            f"| **Perfil Autorizado:** | {s.get('perfil', '')} |",
            f"| **Ruta / Navegación:** | `{s.get('ruta', '')}` |",
            f"| **Propósito Funcional:** | {s.get('proposito', '')} |",
            f"| **Componentes Clave:** | {s.get('componentes', '')} |",
            "",
            f"![{s['title']}](capturas/{img_fn})",
            "",
            f"**Acciones Permitidas:** {s.get('actions', '')}",
            "",
            "---",
            ""
        ]

    for idx in [1, 2, 3, 4]:
        md_lines.extend(add_md_screen(idx))

    md_lines.extend([
        "## 4. Guía para el Docente / Profesor",
        "El entorno docente permite planificar evaluaciones, calificar por actividades individuales, vaciar notas por momento y generar boletines oficiales.",
        ""
    ])
    for idx in [28, 29, 30, 34, 35, 36, 31, 32, 33]:
        md_lines.extend(add_md_screen(idx))

    md_lines.extend([
        "## 5. Guía para el Administrador (Control de Estudios)",
        "El administrador gestiona la matrícula estudiantil con nombres en mayúsculas, la asignación de profesores con claves, las secciones y el cierre de año escolar.",
        ""
    ])
    for idx in [12, 13, 14, 15, 24, 16, 23, 26, 20, 21, 17, 25, 27, 18, 19, 22]:
        md_lines.extend(add_md_screen(idx))

    md_lines.extend([
        "## 6. Guía para el Superadministrador (Seguridad y BD)",
        "Consola de administración raíz para auditoría docente, filtros avanzados de estudiantes y mantenimiento de base de datos MySQL con respaldos e indexado InnoDB.",
        ""
    ])
    for idx in [5, 6, 7, 8, 9, 10, 11]:
        md_lines.extend(add_md_screen(idx))

    md_lines.extend([
        "## 7. Preguntas Frecuentes (FAQ)",
        "- **¿Por qué el Administrador no ve el botón 'Evaluaciones'?** Porque es una herramienta pedagógica exclusiva de los docentes.",
        "- **¿Cómo funciona la equivalencia en 20 puntos?** Multiplicando el porcentaje por 20 y dividiendo entre 100 (ej. 25% = 5.0 pts).",
        "- **¿Por qué no puedo guardar el plan de evaluaciones?** Porque la suma debe ser exactamente 100% (20.0 pts / 20).",
        "- **¿Qué pasa con las notas al cerrar el año escolar?** Se congelan y pasan a estado inmutable de solo lectura.",
        "",
        "---",
        "",
        "## 8. Buenas Prácticas y Seguridad",
        "- Cerrar siempre la sesión al culminar las labores en el sistema.",
        "- Generar respaldos semanales .SQL de la base de datos desde la consola de Superadministrador.",
        "- No compartir las credenciales de acceso institucional.",
        ""
    ])

    with open(MD_OUTPUT, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"SUCCESS: MD guardado en {MD_OUTPUT}")
    shutil.copy2(MD_OUTPUT, MD_ROOT)
    print(f"SUCCESS: Copia MD guardada en {MD_ROOT}")

if __name__ == "__main__":
    build_full_manual()
    build_markdown_and_html()
