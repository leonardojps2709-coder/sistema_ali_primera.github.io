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
CAPTURES_DIR = os.path.join(OUTPUT_DIR, "capturas")

TARGET_DOCX_GUIA = os.path.join(OUTPUT_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO_GUIA.docx")
TARGET_DOCX_ARREGLOS = os.path.join(OUTPUT_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO arreglos.docx")
TARGET_MD = os.path.join(OUTPUT_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO.md")
TARGET_HTML = os.path.join(OUTPUT_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO.html")
ROOT_DOCX = os.path.join(BASE_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO.docx")
ROOT_MD = os.path.join(BASE_DIR, "MANUAL_DE_USUARIO_ACTUALIZADO.md")

with open(os.path.join(BASE_DIR, "scratch", "screens_dump.json"), "r", encoding="utf-8") as f:
    screens_data = json.load(f)

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
COLOR_STEP = RGBColor(0x0F, 0x17, 0x2A)

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

def add_p(doc, text, bold_prefix=None, space_after=6, italic=False):
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
    r.font.italic = italic
    r.font.color.rgb = COLOR_TEXT
    return p

def add_step(doc, num_str, title, desc):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.left_indent = Inches(0.2)
    p.paragraph_format.line_spacing = 1.15

    r_num = p.add_run(f"Paso {num_str}: ")
    r_num.font.name = "Calibri"
    r_num.font.size = Pt(9.5)
    r_num.font.bold = True
    r_num.font.color.rgb = COLOR_WINE

    r_tit = p.add_run(f"{title}. ")
    r_tit.font.name = "Calibri"
    r_tit.font.size = Pt(9.5)
    r_tit.font.bold = True
    r_tit.font.color.rgb = COLOR_STEP

    r_desc = p.add_run(desc)
    r_desc.font.name = "Calibri"
    r_desc.font.size = Pt(9.5)
    r_desc.font.color.rgb = COLOR_TEXT

def add_tip_box(doc, text, tip_type="TIP"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = tbl.rows[0].cells[0]
    c.width = Inches(6.8)
    
    bg = "F0FDF4" if tip_type == "TIP" else ("FEF2F2" if tip_type == "ALERT" else "EFF6FF")
    border_col = "86EFAC" if tip_type == "TIP" else ("FECACA" if tip_type == "ALERT" else "BFDBFE")
    prefix_col = RGBColor(0x16, 0x65, 0x34) if tip_type == "TIP" else (RGBColor(0x99, 0x1B, 0x1B) if tip_type == "ALERT" else RGBColor(0x1E, 0x40, 0xAF))
    
    set_cell_background(c, bg)
    set_cell_margins(c, 80, 80, 120, 120)
    set_cell_borders(c, border_col)

    p = c.paragraphs[0]
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(1)
    p.paragraph_format.line_spacing = 1.15
    
    label = "💡 Consejo Práctico: " if tip_type == "TIP" else ("⚠️ Regla Importante del Sistema: " if tip_type == "ALERT" else "📌 Información Institucional: ")
    r_pre = p.add_run(label)
    r_pre.font.name = "Calibri"
    r_pre.font.size = Pt(9)
    r_pre.font.bold = True
    r_pre.font.color.rgb = prefix_col

    r_txt = p.add_run(text)
    r_txt.font.name = "Calibri"
    r_txt.font.size = Pt(9)
    r_txt.font.color.rgb = COLOR_TEXT

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(4)

def add_bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
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

def add_screen_card(doc, s_idx):
    s = screens_data[s_idx - 1]
    img_filename = IMAGE_MAP[s_idx]
    img_path = os.path.join(CAPTURES_DIR, img_filename)

    p_head = doc.add_paragraph()
    p_head.paragraph_format.space_before = Pt(10)
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
    p_img.paragraph_format.space_before = Pt(5)
    p_img.paragraph_format.space_after = Pt(3)
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.keep_with_next = True
    r_img = p_img.add_run()
    if os.path.exists(img_path):
        r_img.add_picture(img_path, width=Inches(5.8))
    else:
        r_img.add_text(f"[Captura: {img_filename}]")

    p_act = doc.add_paragraph()
    p_act.paragraph_format.space_before = Pt(2)
    p_act.paragraph_format.space_after = Pt(10)
    r_act_lbl = p_act.add_run("Acciones Permitidas: ")
    r_act_lbl.font.name = "Calibri"
    r_act_lbl.font.size = Pt(8.5)
    r_act_lbl.font.bold = True
    r_act_lbl.font.color.rgb = COLOR_BURGUNDY

    r_act_val = p_act.add_run(s.get("actions", ""))
    r_act_val.font.name = "Calibri"
    r_act_val.font.size = Pt(8.5)
    r_act_val.font.color.rgb = COLOR_TEXT

print("Iniciando generación de documento docx...")
doc = docx.Document()
for s in doc.sections:
    s.top_margin = Inches(0.8)
    s.bottom_margin = Inches(0.8)
    s.left_margin = Inches(0.8)
    s.right_margin = Inches(0.8)

# ==============================================================================
# PORTADA
# ==============================================================================
p_inst = doc.add_paragraph()
p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_inst.paragraph_format.space_after = Pt(2)
r_inst = p_inst.add_run(
    "REPÚBLICA BOLIVARIANA DE VENEZUELA\n"
    "MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN\n"
    "ESCUELA TÉCNICA ROBINSONIANA \"ALÍ PRIMERA\"\n"
    "DEPARTAMENTO DE CONTROL DE ESTUDIOS Y SISTEMAS"
)
r_inst.font.name = "Calibri"
r_inst.font.size = Pt(10)
r_inst.font.bold = True
r_inst.font.color.rgb = COLOR_BURGUNDY

p_tit = doc.add_paragraph()
p_tit.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_tit.paragraph_format.space_before = Pt(14)
p_tit.paragraph_format.space_after = Pt(4)
r_tit = p_tit.add_run("MANUAL DE USUARIO INTEGRAL DEL SISTEMA ESCOLAR")
r_tit.font.name = "Calibri"
r_tit.font.size = Pt(17)
r_tit.font.bold = True
r_tit.font.color.rgb = COLOR_WINE

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_sub.paragraph_format.space_after = Pt(12)
r_sub = p_sub.add_run("Guía Operativa Paso a Paso: Cómo Usar Cada Módulo, Flujos de Trabajo y Capturas de Interfaz\nActualizado con Evaluaciones 100% sobre 20 Puntos, Calculadora de Vaciado, Reseteo de Claves y Mantenimiento MySQL")
r_sub.font.name = "Calibri"
r_sub.font.size = Pt(9.5)
r_sub.font.italic = True
r_sub.font.color.rgb = COLOR_MUTED

t_meta = doc.add_table(rows=5, cols=2)
t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
meta_data = [
    ("Institución:", "Escuela Técnica Robinsoniana \"Alí Primera\" (Control de Estudios)"),
    ("Entorno Operativo:", "Plataforma Web (Apache 2.4 / PHP 7-8 / MySQL 8.0 Motor InnoDB)"),
    ("Perfiles Documentados:", "Docente / Profesor, Administrador (Control de Estudios) y Superadministrador"),
    ("Fecha de Actualización:", "Noviembre 2026 (Versión 2.5 Consolidada con Guía Didáctica Integral)"),
    ("Estructura de Contenido:", "Paso a Paso Detallado + Consejos Prácticos + Ficha Visual con 36 Capturas Reales")
]
for idx, (k, v) in enumerate(meta_data):
    row = t_meta.rows[idx]
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

# ==============================================================================
# CAPÍTULO 1: BIENVENIDA Y ROLES
# ==============================================================================
add_heading_1(doc, "1. Bienvenido al Sistema Escolar E.T.R. \"Alí Primera\"")
add_p(doc, "El Sistema Escolar de la Escuela Técnica Robinsoniana \"Alí Primera\" es la plataforma web institucional desarrollada para transformar y automatizar la gestión académica, la matrícula escolar, la planificación evaluativa por competencias técnicas y la emisión de sábanas y boletines oficiales bajo la normativa del Ministerio del Poder Popular para la Educación (MPPE).")

add_heading_2(doc, "1.1. Estructura de Perfiles de Usuario y Alcance Operativo")
add_p(doc, "Para garantizar la seguridad de la información y la separación de funciones, el sistema divide su operativa en tres niveles de acceso:")
add_bullet(doc, "Ámbito exclusivo del personal docente. Permite consultar las secciones asignadas por horario, revisar la nómina de estudiantes, planificar evaluaciones al 100% sobre la escala ministerial de 20 puntos, calificar detalladamente por actividad con calculadora interactiva, vaciar notas por momentos (MP1, MP2, MP3) y generar boletines.", "Docente / Profesor: ")
add_bullet(doc, "Ámbito de la directiva y del departamento de control de estudios. Permite matricular estudiantes (con nombres y apellidos estandarizados en mayúsculas), inhabilitar o reactivar matrículas, dar de alta profesores asignándoles contraseña institucional y carga académica, configurar secciones y asignaturas, y ejecutar el protocolo de cierre de año escolar.", "Administrador (Control de Estudios): ")
add_bullet(doc, "Consola raíz (Root). Supervisa integralmente las cuentas directivas, audita a los docentes (inhabilitación y cambio directo de clave de emergencia), aplica filtros dinámicos multidimensionales a la matrícula y administra el mantenimiento del motor de base de datos MySQL (respaldos .SQL instantáneos, indexado InnoDB y restauración).", "Superadministrador: ")

add_heading_2(doc, "1.2. Requisitos Técnicos y Consejos de Navegación")
add_bullet(doc, "Navegador Web: Google Chrome, Microsoft Edge, Mozilla Firefox u Opera en sus versiones más recientes.")
add_bullet(doc, "Resolución de Pantalla: Se recomienda 1366 × 768 píxeles o superior para apreciar cómodamente las sábanas de calificaciones.")
add_bullet(doc, "Sesión de Usuario: El sistema utiliza sessionStorage. Si cierras la pestaña o ventana del navegador por completo, se cerrará tu sesión automáticamente para salvaguardar la privacidad de las notas.")

# ==============================================================================
# CAPÍTULO 2: CONCEPTOS CLAVE Y REGLAS
# ==============================================================================
add_heading_1(doc, "2. Conceptos Clave y Reglas Operativas del Sistema")
add_p(doc, "Antes de operar los módulos, es fundamental familiarizarse con las reglas institucionales implementadas en el software:")

add_bullet(doc, "La escala oficial de calificación va de 0 a 20 puntos. La nota mínima aprobatoria para el régimen técnico es de 10 puntos.", "Escala Ministerial de 20 Puntos: ")
add_bullet(doc, "El año escolar se divide en tres lapsos o momentos evaluativos. Cada momento cuenta con su respectiva sábana de notas, fecha de cierre y vinculación a un plan de evaluación.", "Momentos Pedagógicos (MP1, MP2, MP3): ")
add_bullet(doc, "Cada profesor debe diseñar su plan de actividades de tal manera que la suma exacta de los porcentajes sea 100%. El sistema calcula automáticamente la equivalencia en puntos sobre 20 (ejemplo: 25% = 5.0 pts / 20).", "Planificación al 100%: ")
add_bullet(doc, "Los nombres y apellidos de los alumnos son transformados automáticamente a MAYÚSCULAS para cumplir con los estándares requeridos por el MPPE en sábanas y títulos técnicos.", "Formato Estandarizado en Mayúsculas: ")
add_bullet(doc, "Al finalizar el período académico, el Administrador congela el año escolar. Las calificaciones pasan a ser inmutables (sólo lectura), blindando las actas contra cualquier modificación posterior.", "Actas Inmutables y Congeladas: ")
add_bullet(doc, "Permite suspender temporalmente el acceso o la emisión de notas de un alumno sin borrar su historial ni sus calificaciones registradas previamente.", "Inhabilitación de Matrícula: ")

# ==============================================================================
# CAPÍTULO 3: PRIMER INGRESO Y AUTENTICACIÓN
# ==============================================================================
add_heading_1(doc, "3. Primer Ingreso y Autenticación en la Plataforma")
add_p(doc, "El acceso al sistema se realiza a través de un portal unificado con derivación de roles. A continuación se explica el procedimiento paso a paso para ingresar según tu perfil:")

add_heading_2(doc, "3.1. Cómo Ingresar al Sistema desde la Pantalla de Bienvenida")
add_step(doc, "1", "Abrir el Navegador", "Ingresa a la dirección web institucional del plantel (ejemplo: http://localhost/Proyecto/login/bienvenida.html).")
add_step(doc, "2", "Seleccionar tu Ámbito", "En la pantalla de bienvenida, verás dos opciones destacadas: botón granate 'PROFESOR' (para docentes) o botón 'ADMINISTRADOR' (para control de estudios y directores). Haz clic sobre tu perfil correspondiente.")
add_screen_card(doc, 1)

add_heading_2(doc, "3.2. Cómo Iniciar Sesión como Administrador")
add_step(doc, "1", "Ingresar Usuario", "En la pantalla de inicio de sesión administrativo, introduce tu usuario institucional (o cédula de identidad con prefijo, ej. V-31072861).")
add_step(doc, "2", "Ingresar Contraseña", "Escribe tu clave secreta. Puedes hacer clic en el icono del ojo si deseas comprobar los caracteres introducidos.")
add_step(doc, "3", "Hacer Clic en 'Iniciar Sesión'", "El sistema verificará tus privilegios en la base de datos y te redirigirá de inmediato al Panel de Administración.")
add_screen_card(doc, 2)

add_heading_2(doc, "3.3. ¿Olvidaste tu Contraseña? Cómo Solicitar un Restablecimiento")
add_p(doc, "Si no recuerdas tu clave de acceso institucional, no intentes ingresar múltiples veces erróneamente. El sistema cuenta con un canal asistido:")
add_step(doc, "1", "Hacer Clic en '¿Olvidaste tu contraseña?'", "Ubicado debajo del campo de contraseña en el formulario de login.")
add_step(doc, "2", "Ingresar Cédula o Correo", "Escribe tu número de cédula registrado o el correo electrónico institucional.")
add_step(doc, "3", "Enviar Solicitud", "Presiona el botón de envío. El sistema enviará una notificación visual directa a la bandeja del Superadministrador, quien restablecerá tu clave a la brevedad.")
add_screen_card(doc, 3)

add_heading_2(doc, "3.4. Cómo Iniciar Sesión como Profesor / Docente")
add_step(doc, "1", "Acceder a la Pantalla Docente", "Selecciona 'Profesor' en la bienvenida o ingresa directamente a login-maestros.html.")
add_step(doc, "2", "Escribir Cédula Completa", "Ingresa tu cédula con el prefijo correspondiente (ejemplo: V-10000003).")
add_step(doc, "3", "Escribir Contraseña Asignada", "Introduce la contraseña entregada por el departamento de Control de Estudios.")
add_step(doc, "4", "Entrar al Panel", "Presiona 'Acceder como Profesor'. El sistema cargará automáticamente tus secciones y materias asignadas.")
add_tip_box(doc, "Si eres docente nuevo y aún no posees contraseña, acude a Control de Estudios para que el Administrador active tu cuenta desde el módulo de Gestión de Profesores.", "TIP")
add_screen_card(doc, 4)

# ==============================================================================
# CAPÍTULO 4: GUÍA COMPLETA PARA EL PROFESOR
# ==============================================================================
add_heading_1(doc, "4. Guía Operativa para el Docente / Profesor")
add_p(doc, "El entorno de trabajo del docente ha sido completamente rediseñado para facilitar la planificación evaluativa y el vaciado de calificaciones. A continuación se detalla cómo utilizar cada una de sus funciones:")

add_heading_2(doc, "4.1. Recorrido por el Panel de Inicio Docente")
add_p(doc, "Al ingresar, encontrarás:")
add_bullet(doc, "Saludo personalizado con tu nombre completo y estado activo.")
add_bullet(doc, "Tarjetas de acceso rápido: 'Mis Secciones', 'Estudiantes', 'Calificaciones' y 'Evaluaciones'.")
add_bullet(doc, "Resumen del año escolar en curso y momento pedagógico activo.")
add_screen_card(doc, 28)

add_heading_2(doc, "4.2. Consulta de Secciones Asignadas y Estudiantes")
add_step(doc, "1", "Ver tus Secciones", "Haz clic en el menú lateral 'Mis Secciones'. Aparecerán tarjetas por cada curso que tienes asignado con el año formativo, la letra de sección, la mención técnica y el total de estudiantes inscritos.")
add_step(doc, "2", "Consultar la Nómina", "Haz clic en el menú 'Estudiantes'. Puedes filtrar por sección o buscar a cualquier alumno por su cédula o apellido.")
add_screen_card(doc, 29)
add_screen_card(doc, 30)

add_heading_2(doc, "4.3. Cómo Usar el Módulo de Evaluaciones (100% sobre 20 Puntos)")
add_p(doc, "Este módulo es exclusivo del docente y permite planificar las actividades evaluativas de cada momento:")
add_step(doc, "1", "Entrar a 'Evaluaciones'", "Haz clic en la opción 'Evaluaciones' en el menú lateral.")
add_step(doc, "2", "Filtrar Curso y Materia", "En la barra superior, selecciona la Sección, la Asignatura y el Período escolar que deseas planificar.")
add_step(doc, "3", "Abrir el Configurador", "Haz clic en el botón granate '+ Configurar Evaluaciones' o en el icono de lápiz/edición.")
add_screen_card(doc, 34)

add_step(doc, "4", "Seleccionar Momento Pedagógico", "En el modal interactivo, elige la pestaña: '1er Momento', '2do Momento' o '3er Momento'.")
add_step(doc, "5", "Definir Actividades", "Usa el selector para definir cuántas evaluaciones realizarás (entre 1 y 7 actividades).")
add_step(doc, "6", "Asignar Nombres y Porcentajes", "Escribe el nombre de la actividad (ej. Taller Práctico, Examen Parcial, Proyecto Técnico) e ingresa su porcentaje.")
add_tip_box(doc, "El sistema cuenta con el botón 'Distribuir Equitativamente', el cual calcula y reparte automáticamente el 100% en partes iguales entre las actividades configuradas.", "TIP")
add_step(doc, "7", "Comprobar la Equivalencia en 20 Puntos", "A medida que escribes el porcentaje, el badge azul muestra los puntos exactos sobre 20 (ejemplo: 25% = 5.0 pts / 20; 50% = 10.0 pts / 20).")
add_step(doc, "8", "Guardar Plan", "Verifica que la barra total indique '100% (20.0 / 20 pts)'. Presiona 'Guardar Configuración'.")
add_tip_box(doc, "Si la sumatoria es menor o mayor a 100%, el botón de guardar permanecerá deshabilitado para evitar descuadres en las actas ministeriales.", "ALERT")
add_screen_card(doc, 35)

add_heading_2(doc, "4.4. Cómo Usar la Calculadora de Evaluaciones Detalladas")
add_p(doc, "Una vez planificado el momento, no necesitas calcular promedios manualmente. La calculadora del sistema lo hace por ti:")
add_step(doc, "1", "Abrir la Calculadora", "Haz clic en el botón con icono de calculadora en la tabla de planes de evaluación, o presiona el botón de calculadora en la cabecera M.P.1, M.P.2 o M.P.3 en la sábana de notas.")
add_step(doc, "2", "Cargar Calificaciones de Cada Actividad", "Aparecerá la lista de estudiantes con una columna para cada evaluación planificada. Ingresa la nota obtenida (escala 0 a 20 pts).")
add_step(doc, "3", "Observar el Cálculo en Vivo", "El sistema pondera automáticamente cada actividad según su porcentaje y calcula la 'Nota Momento' en tiempo real:")
add_bullet(doc, "Si la nota es mayor o igual a 10: badge verde de Aprobado.", "Verde: ")
add_bullet(doc, "Si la nota es menor a 10: badge rojo de Reprobado.", "Rojo: ")
add_step(doc, "4", "Aplicar a la Sábana Oficial", "Haz clic en 'Guardar y Aplicar a Vaciado de Notas'. La nota calculada se transferirá automáticamente a la sábana de calificaciones oficial sin que tengas que transcribirla.")
add_screen_card(doc, 36)

add_heading_2(doc, "4.5. Vaciado de Calificaciones, Inasistencias y Boletines")
add_p(doc, "Si prefieres vaciar las notas directamente en la sábana o registrar inasistencias:")
add_step(doc, "1", "Ir a 'Registrar Notas'", "Selecciona Período, Mención, Sección y Asignatura, y haz clic en 'Cargar Estudiantes'.")
add_step(doc, "2", "Ingresar Notas e Inasistencias", "Escribe las calificaciones de cada lapso (0 a 20) y las inasistencias acumuladas. La columna 'Definitiva Final' se actualizará automáticamente con el promedio de los 3 momentos.")
add_step(doc, "3", "Guardar Calificaciones", "Presiona el botón 'Guardar Calificaciones' para persistir los cambios en la base de datos.")
add_step(doc, "4", "Emitir Boletines", "Ve al menú 'Reporte de Notas', busca al estudiante por cédula y genera la vista previa o impresión del boletín individual.")
add_screen_card(doc, 31)
add_screen_card(doc, 32)
add_screen_card(doc, 33)

# ==============================================================================
# CAPÍTULO 5: GUÍA PARA EL ADMINISTRADOR (CONTROL DE ESTUDIOS)
# ==============================================================================
add_heading_1(doc, "5. Guía para el Administrador (Control de Estudios)")
add_p(doc, "El Administrador es responsable de la infraestructura académica del plantel. A continuación se explica cómo operar cada módulo:")

add_heading_2(doc, "5.1. Dashboard Principal y Gestión de Usuarios")
add_p(doc, "El dashboard muestra el censo global: matrícula total, docentes activos, secciones habilitadas y períodos escolares.")
add_screen_card(doc, 12)
add_screen_card(doc, 13)
add_screen_card(doc, 14)
add_screen_card(doc, 15)

add_heading_2(doc, "5.2. Cómo Dar de Alta a un Docente con Contraseña y Carga Horaria")
add_step(doc, "1", "Ir a 'Usuarios' → 'Profesores'", "Haz clic en el botón granate '+ Nuevo Profesor'.")
add_step(doc, "2", "Completar Datos Básicos", "Ingresa Cédula (V/E), Nombres, Apellidos, Teléfono, Email y Contraseña inicial de acceso.")
add_step(doc, "3", "Asignar Carga Académica", "En la pestaña 'Materias y Secciones', marca las asignaturas y aulas donde el profesor impartirá clases.")
add_step(doc, "4", "Guardar Docente", "Presiona 'Guardar Profesor'. El profesor ya podrá iniciar sesión con su cédula y contraseña asignada.")
add_screen_card(doc, 24)

add_heading_2(doc, "5.3. Cómo Crear Secciones, Menciones y Asignaturas")
add_step(doc, "1", "Crear Sección", "En 'Académico' → 'Secciones y Años', presiona '+ Nueva Sección'. Selecciona el Año (1ro a 6to), la Letra (A, B, C...) y la Mención Técnica.")
add_tip_box(doc, "El sistema valida automáticamente que no existan secciones duplicadas con el mismo Año, Letra y Mención.", "ALERT")
add_step(doc, "2", "Asignar Docente Guía", "Selecciona al profesor tutor responsable de la sección.")
add_step(doc, "3", "Consultar Detalle de Sección", "Haz clic en el icono del ojo en la tabla de secciones para ver la lista completa de alumnos inscritos y los profesores asignados.")
add_screen_card(doc, 16)
add_screen_card(doc, 23)
add_screen_card(doc, 26)
add_screen_card(doc, 20)
add_screen_card(doc, 21)

add_heading_2(doc, "5.4. Padrón de Estudiantes, Mayúsculas e Inhabilitación")
add_step(doc, "1", "Inscribir Estudiante", "En 'Académico' → 'Estudiantes', haz clic en '+ Nuevo Estudiante'.")
add_step(doc, "2", "Llenar Formulario", "Ingresa Cédula (con validación de duplicados), Nombres y Apellidos. Observa cómo el sistema convierte automáticamente el texto a MAYÚSCULAS.")
add_step(doc, "3", "Asignar Sección", "Elige la mención y la sección correspondiente. Presiona 'Guardar Estudiante'.")
add_step(doc, "4", "Inhabilitar / Habilitar Alumno", "Si un estudiante es retirado o suspendido temporalmente, presiona el botón ámbar 'Inhabilitar'. El sistema solicitará confirmación antes de cambiar su estado. Para reactivarlo, presiona 'Habilitar'.")
add_step(doc, "5", "Consultar Expediente y Semáforo", "Haz clic en el icono de expediente para abrir el historial del alumno con su semáforo de riesgo (Verde: Regular; Amarillo: En observación; Rojo: Reprobando materias clave).")
add_screen_card(doc, 17)
add_screen_card(doc, 25)
add_screen_card(doc, 27)

add_heading_2(doc, "5.5. Cronograma de Períodos y Protocolo de Cierre de Año Escolar")
add_step(doc, "1", "Aperturar Año Escolar", "En 'Gestión' → 'Períodos', haz clic en '+ Nuevo Período', define el nombre oficial (ej. 2026-2027) y las fechas límites de MP1, MP2 y MP3.")
add_step(doc, "2", "Activar Período", "Establece el período como 'Activo'. El sistema solo permite tener un año escolar activo a la vez.")
add_step(doc, "3", "Finalizar Año Escolar (Acción Crítica)", "Al culminar el período académico, presiona el botón rojo 'Finalizar Año Escolar'. El sistema solicitará doble confirmación. Al ejecutarse:")
add_bullet(doc, "Todas las calificaciones de todos los estudiantes y asignaturas quedan CONGELADAS e INMUTABLES.")
add_bullet(doc, "Los profesores ya no pueden alterar notas de ese ciclo escolar.")
add_bullet(doc, "El sistema habilita el botón de promoción de sección para transferir la matrícula al siguiente año formativo.")
add_screen_card(doc, 18)
add_screen_card(doc, 19)
add_screen_card(doc, 22)

# ==============================================================================
# CAPÍTULO 6: GUÍA PARA EL SUPERADMINISTRADOR
# ==============================================================================
add_heading_1(doc, "6. Guía para el Superadministrador (Seguridad y Base de Datos)")
add_p(doc, "El Superadministrador dispone de herramientas avanzadas para la salud y seguridad de la plataforma:")

add_heading_2(doc, "6.1. Panel Principal y Cuentas Administrativas")
add_step(doc, "1", "Monitorear Cuentas", "Visualiza el listado de administradores y el registro de solicitudes de cambio de contraseña.")
add_step(doc, "2", "Crear Nuevo Administrador", "Haz clic en '+ Nuevo Administrador' e introduce las credenciales del directivo autorizado.")
add_screen_card(doc, 5)
add_screen_card(doc, 6)

add_heading_2(doc, "6.2. Auditoría Docente y Filtros Dinámicos de Matrícula")
add_step(doc, "1", "Pestaña 'Profesores'", "Visualiza a todo el personal docente. Puedes inhabilitar un profesor con el botón ámbar, reactivarlo con el botón verde o cambiar directamente su contraseña con el botón azul de llave.")
add_step(doc, "2", "Pestaña 'Estudiantes'", "Aplica filtros dinámicos combinados por Mención y Sección en tiempo real. Usa el botón 'Sincronizar' para refrescar los datos desde MySQL al instante.")
add_screen_card(doc, 7)
add_screen_card(doc, 8)

add_heading_2(doc, "6.3. Consola de Mantenimiento de Base de Datos MySQL (Respaldos e Indexado)")
add_p(doc, "Ubicada en la pestaña 'Base de Datos' del panel Superadmin:")
add_step(doc, "1", "Revisar Métricas Físicas", "Observa las tarjetas superiores: Motor MySQL, número de tablas (12), total de registros y tamaño en MB de datos e índices.")
add_step(doc, "2", "Crear Respaldo Ahora (.SQL)", "Presiona el botón 'Crear Respaldo Ahora'. El sistema invocará mysqldump y generará una copia completa al instante.")
add_step(doc, "3", "Descargar Copia", "En la tabla de respaldos, haz clic en 'Descargar' para almacenar el archivo .sql en un pendrive o disco externo.")
add_step(doc, "4", "Optimizar e Indexar Tablas InnoDB", "Presiona el botón 'Optimizar e Indexar Tablas'. El sistema ejecutará diagnósticos CHECK TABLE, creará índices de alto rendimiento faltantes y ejecutará OPTIMIZE TABLE para desfragmentar el espacio en disco.")
add_step(doc, "5", "Restaurar Copia de Seguridad", "Si necesitas recuperar datos históricos, haz clic en 'Restaurar' en el archivo deseado y confirma en el modal de advertencia.")
add_tip_box(doc, "La restauración sobrescribe los datos actuales de la base de datos con los del archivo seleccionado. Ejecútala únicamente en caso de contingencia o recuperación de desastres.", "ALERT")
add_screen_card(doc, 9)
add_screen_card(doc, 10)
add_screen_card(doc, 11)

# ==============================================================================
# CAPÍTULO 7: FAQ
# ==============================================================================
add_heading_1(doc, "7. Preguntas Frecuentes y Solución de Problemas (FAQ)")
add_p(doc, "Porque la planificación y ponderación de actividades es una potestad pedagógica exclusiva del docente. Los administradores supervisan las actas y sábanas finales consolidadas.", bold_prefix="P: ¿Por qué el Administrador no ve el botón 'Evaluaciones'? R: ")
add_p(doc, "El sistema aplica una regla de tres directa: (Porcentaje * 20) / 100. Así, un 20% son 4.0 pts, 35% son 7.0 pts y 50% son 10.0 pts sobre 20.", bold_prefix="P: ¿Cómo calcula el sistema la equivalencia en 20 puntos? R: ")
add_p(doc, "El software exige que la suma total sea exactamente 100% (20.0 pts / 20) para evitar desajustes aritméticos. Usa el botón 'Distribuir Equitativamente' si deseas repartir los porcentajes en partes iguales.", bold_prefix="P: ¿Por qué no se habilita el botón 'Guardar Configuración' en Evaluaciones? R: ")
add_p(doc, "Al finalizar el año escolar, el sistema congela las notas volviéndolas inmutables (sólo lectura). Esto protege legalmente las calificaciones contra alteraciones posteriores.", bold_prefix="P: ¿Qué sucede con las calificaciones al cerrar el año escolar? R: ")
add_p(doc, "No es ningún fallo. Es un estándar institucional estricto para garantizar la uniformidad en los reportes ministeriales y títulos de bachiller técnico.", bold_prefix="P: Escribo nombres en minúsculas pero se guardan en MAYÚSCULAS, ¿es un error? R: ")
add_p(doc, "Desde la pestaña 'Profesores' del panel Superadministrador, haz clic en el botón azul de llave ('Cambiar Clave') y asígnale una nueva clave de acceso inmediato.", bold_prefix="P: Un profesor olvidó su contraseña, ¿cómo se la restablezco? R: ")

# ==============================================================================
# CAPÍTULO 8: BUENAS PRÁCTICAS
# ==============================================================================
add_heading_1(doc, "8. Buenas Prácticas y Seguridad Institucional")
add_bullet(doc, "Cerrar sesión al levantarse del puesto de trabajo utilizando el botón 'Cerrar sesión' del menú lateral.")
add_bullet(doc, "Generar respaldos .SQL semanales desde la consola de Superadministrador y guardarlos en almacenamiento externo fuera del servidor.")
add_bullet(doc, "Comprobar que todas las secciones cuenten con su Docente Guía asignado antes de iniciar el vaciado de calificaciones.")
add_bullet(doc, "No compartir contraseñas de nivel Administrador ni Superadministrador bajo ninguna circunstancia.")

# Guardar
doc.save(TARGET_DOCX_GUIA)
print(f"SUCCESS: {TARGET_DOCX_GUIA} generado exitosamente.")

# Intentar guardar también en TARGET_DOCX_ARREGLOS si no está bloqueado
try:
    doc.save(TARGET_DOCX_ARREGLOS)
    print(f"SUCCESS: {TARGET_DOCX_ARREGLOS} actualizado con éxito.")
except Exception as e:
    print(f"AVISO: {TARGET_DOCX_ARREGLOS} está abierto en Word ({e}). Se guardó como {TARGET_DOCX_GUIA}.")

try:
    shutil.copy2(TARGET_DOCX_GUIA, ROOT_DOCX)
    print(f"SUCCESS: Copiado a {ROOT_DOCX}")
except Exception as e:
    print(f"AVISO copiando a raíz: {e}")

# ==============================================================================
# GENERAR MARKDOWN COMPLETO CON GUÍAS
# ==============================================================================
md_content = """# 📘 Manual de Usuario Integral – Sistema Escolar E.T.R. "Alí Primera"
**Departamento de Control de Estudios y Sistemas**  
*Versión 2.5 Consolidada con Guía Didáctica Paso a Paso y Capturas Reales (Noviembre 2026)*

---

## 📑 Tabla de Contenidos
1. [Bienvenido al Sistema](#1-bienvenido-al-sistema)
2. [Conceptos Clave y Reglas Operativas](#2-conceptos-clave-y-reglas-operativas)
3. [Primer Ingreso y Autenticación](#3-primer-ingreso-y-autenticación)
4. [Guía para el Docente / Profesor](#4-guía-para-el-docente--profesor)
   - 4.1. Panel de Inicio
   - 4.2. Mis Secciones y Nómina
   - 4.3. Módulo de Evaluaciones (100% sobre 20 Puntos)
   - 4.4. Calculadora Detallada de Calificaciones
   - 4.5. Vaciado de Calificaciones, Inasistencias y Boletines
5. [Guía para el Administrador (Control de Estudios)](#5-guía-para-el-administrador-control-de-estudios)
   - 5.1. Dashboard y Usuarios
   - 5.2. Alta de Profesores con Contraseña y Asignaciones
   - 5.3. Secciones, Menciones y Asignaturas
   - 5.4. Padrón de Estudiantes, Mayúsculas e Inhabilitación
   - 5.5. Cronograma de Períodos y Cierre de Año Escolar
6. [Guía para el Superadministrador (Seguridad y Base de Datos)](#6-guía-para-el-superadministrador-seguridad-y-base-de-datos)
   - 6.1. Cuentas Directivas
   - 6.2. Auditoría Docente y Filtros de Matrícula
   - 6.3. Consola de Mantenimiento MySQL (Respaldos e Indexado)
7. [Preguntas Frecuentes (FAQ)](#7-preguntas-frecuentes-y-solución-de-problemas-faq)
8. [Buenas Prácticas y Seguridad](#8-buenas-prácticas-y-seguridad-institucional)

---

## 1. Bienvenido al Sistema
El Sistema Escolar de la E.T.R. "Alí Primera" es la plataforma web desarrollada en Apache, PHP 7-8 y MySQL 8.0 (motor InnoDB) para centralizar la matrícula estudiantil, la planificación evaluativa por competencias técnicas y la emisión de actas oficiales.

### Perfiles de Usuario:
- **Docente / Profesor:** Planificación de evaluaciones al 100% sobre 20 pts, calculadora interactiva de momentos, vaciado de calificaciones e inasistencias, y emisión de boletines.
- **Administrador (Control de Estudios):** Matrícula escolar con nombres en mayúsculas forzadas, inhabilitación y reactivación de alumnos, alta de profesores con clave y carga horaria, secciones, asignaturas y cierre formal del ciclo lectivo.
- **Superadministrador:** Consola de seguridad root, auditoría y reseteo de claves de profesores, filtros dinámicos de estudiantes y panel de mantenimiento físico de base de datos MySQL.

---

## 2. Conceptos Clave y Reglas Operativas
- **Escala de 20 Puntos:** Notas oficiales entre 0 y 20 puntos. Mínima aprobatoria: 10 puntos.
- **Tres Momentos Pedagógicos (MP1, MP2, MP3):** Lapsos formativos con calendario y fechas límites.
- **Regla del 100% en Evaluaciones:** La sumatoria de actividades de cada momento debe ser exactamente 100% (equivalente a 20.0 pts / 20).
- **Nombres en MAYÚSCULAS:** Estandarización automática en base de datos para cumplimiento de normativas del MPPE.
- **Actas Inmutables:** El cierre de año escolar congela las calificaciones volviéndolas de sólo lectura.
- **Inhabilitación de Matrícula:** Suspende el acceso o notas de un estudiante sin borrar su récord histórico.

---

## 3. Primer Ingreso y Autenticación

### 3.1. Cómo Ingresar al Sistema desde la Pantalla de Bienvenida
1. Abre tu navegador e ingresa a `http://localhost/Proyecto/login/bienvenida.html`.
2. Haz clic en el botón **PROFESOR** o **ADMINISTRADOR** según tu función.

![Portal de Bienvenida](capturas/01_portal_bienvenida.png)

### 3.2. Cómo Iniciar Sesión como Administrador
1. En `login.html`, introduce tu Usuario o Cédula (ej. `V-31072861`).
2. Escribe tu Contraseña institucional.
3. Presiona **Iniciar Sesión**.

![Login Administrador](capturas/02_login_admin.png)

### 3.3. ¿Olvidaste tu Contraseña?
1. Haz clic en el enlace *"¿Olvidaste tu contraseña?"*.
2. Escribe tu Cédula o Correo institucional.
3. Presiona Enviar. El Superadministrador recibirá la solicitud para restablecer tu clave.

![Modal Recuperar Clave](capturas/03_modal_recuperar_password.png)

### 3.4. Cómo Iniciar Sesión como Profesor / Docente
1. Accede a `login-maestros.html`.
2. Escribe tu Cédula completa con prefijo (ej. `V-10000003`).
3. Ingresa tu Contraseña asignada por Control de Estudios.
4. Presiona **Acceder como Profesor**.

![Login Docente](capturas/04_login_docente.png)

---

## 4. Guía para el Docente / Profesor

### 4.1. Panel de Inicio del Docente
Al ingresar visualizarás tu nombre completo, las tarjetas de acceso rápido ('Mis Secciones', 'Estudiantes', 'Calificaciones', 'Evaluaciones') y el período escolar activo.

![Inicio Docente](capturas/23_profesor_inicio.png)

### 4.2. Mis Secciones y Nómina de Estudiantes
- En **Mis Secciones** consulta los cursos donde impartes clases según tu carga horaria.
- En **Estudiantes** filtra por sección o busca a cualquier alumno por cédula o nombre en mayúsculas.

![Mis Secciones](capturas/24_profesor_secciones.png)
![Estudiantes Docente](capturas/25_profesor_estudiantes.png)

### 4.3. Módulo de Evaluaciones (100% sobre 20 Puntos)
1. Ve al menú **Evaluaciones**.
2. Filtra por Sección, Asignatura y Período.
3. Presiona **+ Configurar Evaluaciones** (o el lápiz de edición).
4. Elige el momento pedagógico (1er, 2do o 3er Momento).
5. Selecciona la cantidad de actividades (1 a 7 actividades).
6. Escribe el nombre de la actividad y asigna su porcentaje. Observa el cálculo automático de equivalencia en puntos sobre 20 (ej. $25\% = 5.0\text{ pts}$).
7. Puedes usar el botón **Distribuir Equitativamente** para repartir el porcentaje automáticamente.
8. Verifica que la barra total sume exactamente **100% (20.0 / 20 pts)** y haz clic en **Guardar Configuración**.

![Plan de Evaluaciones](capturas/29_profesor_evaluaciones_plan.png)
![Modal Configurar Evaluaciones](capturas/30_profesor_modal_config_evaluaciones.png)

### 4.4. Calculadora Detallada de Calificaciones
1. Abre la calculadora haciendo clic en el icono de calculadora en la tabla de planes o en los encabezados M.P.1/M.P.2/M.P.3 de la sábana de notas.
2. Ingresa la calificación obtenida por cada estudiante en cada actividad (escala 0 a 20 pts).
3. El sistema calcula en tiempo real la **Nota Momento** ponderada (badge verde para aprobados, rojo para reprobados).
4. Presiona **Guardar y Aplicar a Vaciado de Notas** para transferir automáticamente la calificación al registro oficial del momento.

![Modal Calificar Evaluaciones](capturas/31_profesor_modal_calificar_evaluaciones.png)

### 4.5. Vaciado de Calificaciones, Inasistencias y Boletines
1. En **Calificaciones**, selecciona Sección y Materia, y haz clic en **Cargar Estudiantes**.
2. Introduce las notas de los momentos (o usa los botones de calculadora de cabecera) e inasistencias.
3. Revisa la **Definitiva Final** calculada automáticamente y presiona **Guardar Calificaciones**.
4. En **Reporte de Notas**, consulta e imprime los boletines individuales de rendimiento.

![Registrar Notas Docente](capturas/26_profesor_registrar_notas.png)
![Reporte de Notas Docente](capturas/27_profesor_reporte_notas.png)
![Menciones Docente](capturas/28_profesor_menciones.png)

---

## 5. Guía para el Administrador (Control de Estudios)

### 5.1. Dashboard y Directorio de Usuarios
El administrador supervisa las estadísticas globales del plantel y gestiona el censo de personal directivo y docente.

![Inicio Admin](capturas/07_admin_inicio.png)
![Directorio Usuarios](capturas/08_admin_usuarios_todos.png)
![Gestión Profesores](capturas/09_admin_profesores.png)
![Gestión Administradores](capturas/10_admin_administradores.png)

### 5.2. Alta de Profesores con Contraseña y Carga Académica
1. En *Profesores*, presiona **+ Nuevo Profesor**.
2. Llena los datos personales y asigna una contraseña inicial.
3. En la pestaña *Materias y Secciones*, marca las asignaciones docentes del profesor.
4. Presiona **Guardar Profesor**.

![Modal Registro Profesor](capturas/19_admin_modal_profesor.png)

### 5.3. Secciones, Menciones y Asignaturas
1. En *Secciones y Años*, presiona **+ Nueva Sección** (Año, Letra, Mención). El sistema valida que no existan duplicados.
2. Asigna el Docente Guía de la sección.
3. Haz clic en el icono del ojo para consultar la **Ficha Detallada de Sección** (matrícula inscrita y docentes).
4. Administra las especialidades técnicas en *Menciones* y los planes de estudio en *Asignaturas*.

![Secciones y Años](capturas/11_admin_secciones_y_anos.png)
![Modal Nueva Sección](capturas/18_admin_modal_seccion.png)
![Modal Detalle Sección](capturas/21_admin_modal_detalle_seccion.png)
![Menciones Admin](capturas/15_admin_menciones.png)
![Asignaturas Admin](capturas/16_admin_asignaturas.png)

### 5.4. Padrón de Estudiantes, Mayúsculas e Inhabilitación
1. En *Estudiantes*, haz clic en **+ Nuevo Estudiante**.
2. Ingresa Cédula (con validación de duplicados), Nombres y Apellidos (se formatean automáticamente a MAYÚSCULAS) y asigna Sección.
3. Para suspender temporalmente a un estudiante, presiona el botón ámbar **Inhabilitar** (solicita confirmación). Para restaurarlo, presiona **Habilitar**.
4. Haz clic en el icono de expediente para ver el **Expediente Digital y Semáforo de Riesgo** (Verde: Sin riesgo; Amarillo: Riesgo medio; Rojo: Reprobando asignaturas).

![Padrón Estudiantes](capturas/12_admin_estudiantes.png)
![Modal Estudiante](capturas/20_admin_modal_estudiante.png)
![Modal Expediente Estudiante](capturas/22_admin_modal_perfil_estudiante.png)

### 5.5. Cronograma de Períodos y Cierre de Año Escolar
1. En *Períodos*, presiona **+ Nuevo Período** para abrir el ciclo lectivo y establecer fechas de lapsos.
2. Supervisa las calificaciones consolidadas en *Registrar Notas* y *Reporte de Notas*.
3. Al finalizar el año, presiona **Finalizar Año Escolar**. El sistema solicitará confirmación y congelará las actas de notas volviéndolas **inmutables** de solo lectura.

![Registrar Notas Admin](capturas/13_admin_registrar_notas.png)
![Reporte Notas Admin](capturas/14_admin_reporte_notas.png)
![Períodos Académicos](capturas/17_admin_periodos.png)

---

## 6. Guía para el Superadministrador (Seguridad y Base de Datos)

### 6.1. Cuentas Directivas
Monitorea la plataforma, aprueba solicitudes de restablecimiento y crea cuentas de administrador con **+ Nuevo Administrador**.

![Dashboard Superadmin](capturas/05_superadmin_dashboard.png)
![Modal Nuevo Admin](capturas/06_superadmin_modal_nuevo_admin.png)

### 6.2. Auditoría Docente y Filtros Dinámicos de Matrícula
- En la pestaña **Profesores**, inhabilita o habilita profesores al instante, y restablece sus contraseñas olvidadas con el botón azul de llave.
- En la pestaña **Estudiantes**, filtra por Mención y Sección en vivo y sincroniza la matrícula con un clic.

![Auditoría Docente SA](capturas/32_superadmin_docentes_acciones.png)
![Filtros Estudiantes SA](capturas/33_superadmin_estudiantes_filtros.png)

### 6.3. Consola de Mantenimiento de Base de Datos MySQL
1. En la pestaña **Base de Datos**, revisa las tarjetas métricas (peso en MB de datos e índices, total de tablas y filas).
2. Presiona **Crear Respaldo Ahora** para generar un volcado `.sql` institucional completo mediante `mysqldump`.
3. Haz clic en **Descargar** en cualquier respaldo para guardarlo localmente.
4. Presiona **Optimizar e Indexar Tablas** para verificar la integridad (`CHECK TABLE`), crear índices faltantes y desfragmentar tablas InnoDB (`OPTIMIZE TABLE`).
5. En caso de contingencia, haz clic en **Restaurar** en una copia previa y confirma en el modal de advertencia.

![Métricas y Respaldos SQL](capturas/34_superadmin_base_datos_metricas.png)
![Diagnóstico e Indexado InnoDB](capturas/35_superadmin_base_datos_optimizacion.png)
![Modal Restaurar BD](capturas/36_superadmin_modal_restaurar_bd.png)

---

## 7. Preguntas Frecuentes y Solución de Problemas (FAQ)
- **¿Por qué el Administrador no ve el botón 'Evaluaciones'?** Porque la planificación didáctica es exclusiva del profesor. Los administradores auditan las sábanas consolidadas.
- **¿Cómo funciona el cálculo de equivalencia en 20 puntos?** Mediante la fórmula `(Porcentaje * 20) / 100`. Ejemplo: $25\% = 5.0\text{ pts}$; $50\% = 10.0\text{ pts}$.
- **¿Por qué el botón 'Guardar Configuración' está deshabilitado?** Porque la suma debe ser exactamente 100% (20.0 pts). Usa el botón *Distribuir Equitativamente* para repartir porcentajes automáticamente.
- **¿Qué ocurre con las calificaciones al cerrar el año escolar?** Pasan a estado inmutable de solo lectura y quedan blindadas contra modificaciones.
- **¿Por qué los nombres se guardan en MAYÚSCULAS?** Por exigencia estricta del MPPE para la uniformidad de actas oficiales.

---

## 8. Buenas Prácticas y Seguridad Institucional
- Cerrar sesión siempre desde el menú lateral antes de retirarse.
- Generar respaldos `.sql` semanalmente y conservarlos en unidades externas.
- Asignar contraseñas robustas a docentes y administradores.
"""

with open(TARGET_MD, "w", encoding="utf-8") as f:
    f.write(md_content)
print(f"SUCCESS: {TARGET_MD} generado.")

with open(ROOT_MD, "w", encoding="utf-8") as f:
    f.write(md_content)
print(f"SUCCESS: {ROOT_MD} actualizado.")

