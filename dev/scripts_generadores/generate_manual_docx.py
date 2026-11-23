import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

DOC_DIR = r"c:\AppServ\www\Proyecto"
IMG_DIR = os.path.join(DOC_DIR, "capturas_sistema")
PRIMARY_TARGET = os.path.join(DOC_DIR, "MANUAL_DE_USUARIO.docx")
FALLBACK_TARGET = os.path.join(DOC_DIR, "MANUAL_DE_USUARIO_Actualizado.docx")

# Institutional Colors
COLOR_PRIMARY = RGBColor(74, 21, 27)     # #4A151B Burgundy
COLOR_SECONDARY = RGBColor(123, 17, 19)  # #7B1113 Wine
COLOR_TEXT_DARK = RGBColor(33, 37, 41)   # #212529 Dark Slate
COLOR_MUTED = RGBColor(108, 117, 125)    # #6C757D Gray
COLOR_SUCCESS = RGBColor(25, 135, 84)    # #198754 Green
COLOR_WARNING = RGBColor(217, 119, 6)    # Amber
COLOR_INFO = RGBColor(13, 110, 253)      # Blue

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_border(cell, **kwargs):
    """
    kwargs can be top, bottom, left, right.
    val="single", sz="12", color="4A151B"
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for edge in ('top', 'left', 'bottom', 'right'):
        edge_data = kwargs.get(edge)
        if edge_data:
            b_elm = parse_xml(f'<w:{edge} {nsdecls("w")} w:val="{edge_data.get("val", "single")}" w:sz="{edge_data.get("sz", "4")}" w:space="0" w:color="{edge_data.get("color", "CCCCCC")}"/>')
            tcBorders.append(b_elm)
        else:
            b_elm = parse_xml(f'<w:{edge} {nsdecls("w")} w:val="none"/>')
            tcBorders.append(b_elm)
    tcPr.append(tcBorders)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(18)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = COLOR_SECONDARY
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = COLOR_TEXT_DARK
    return p

def add_body_p(doc, text, bold_prefix=None, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_TEXT_DARK
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10.5)
    r.font.italic = italic
    r.font.color.rgb = COLOR_TEXT_DARK
    return p

def add_callout(doc, text, title="NOTA IMPORTANTE", box_type="info"):
    # Create 1x1 table
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    
    if box_type == "warning":
        bg_color = "FFFBEB"
        border_color = "D97706"
        icon = "⚠️"
        title_color = COLOR_WARNING
    elif box_type == "success":
        bg_color = "F0FDF4"
        border_color = "16A34A"
        icon = "✅"
        title_color = COLOR_SUCCESS
    elif box_type == "important":
        bg_color = "FDF2F2"
        border_color = "991B1B"
        icon = "🚨"
        title_color = COLOR_PRIMARY
    else: # info
        bg_color = "F8FAFC"
        border_color = "4A151B"
        icon = "📌"
        title_color = COLOR_PRIMARY

    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    set_cell_border(cell, left={"val": "single", "sz": "24", "color": border_color},
                          top={"val": "single", "sz": "4", "color": "E2E8F0"},
                          right={"val": "single", "sz": "4", "color": "E2E8F0"},
                          bottom={"val": "single", "sz": "4", "color": "E2E8F0"})
    
    cp = cell.paragraphs[0]
    cp.paragraph_format.space_before = Pt(0)
    cp.paragraph_format.space_after = Pt(2)
    r_tit = cp.add_run(f"{icon} {title}\n")
    r_tit.font.name = "Calibri"
    r_tit.font.size = Pt(10.5)
    r_tit.font.bold = True
    r_tit.font.color.rgb = title_color
    
    r_txt = cp.add_run(text)
    r_txt.font.name = "Calibri"
    r_txt.font.size = Pt(10)
    r_txt.font.color.rgb = COLOR_TEXT_DARK
    
    # spacing after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(2)
    sp.paragraph_format.space_after = Pt(4)

def add_screenshot(doc, img_name, caption):
    img_path = os.path.join(IMG_DIR, img_name)
    if not os.path.exists(img_path):
        print(f"Warning: Image {img_name} not found.")
        return
    
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    run = p.add_run()
    run.add_picture(img_path, width=Inches(5.9))
    
    # Caption
    cp = doc.add_paragraph()
    cp.paragraph_format.space_before = Pt(2)
    cp.paragraph_format.space_after = Pt(10)
    cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    c_run = cp.add_run(f"Figura: {caption}")
    c_run.font.name = "Calibri"
    c_run.font.size = Pt(9)
    c_run.font.italic = True
    c_run.font.color.rgb = COLOR_MUTED

def main():
    doc = Document()
    
    # Page setup - Margins 1 inch
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)
    
    # Header Cover Block
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(20)
    title_p.paragraph_format.space_after = Pt(4)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = title_p.add_run("REPÚBLICA BOLIVARIANA DE VENEZUELA\nMINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN\nESCUELA TÉCNICA ROBINSONIANA Y ZAMORANA \"ALÍ PRIMERA\"\n")
    r_inst.font.name = "Calibri"
    r_inst.font.size = Pt(10.5)
    r_inst.font.bold = True
    r_inst.font.color.rgb = COLOR_MUTED
    
    tp = doc.add_paragraph()
    tp.paragraph_format.space_before = Pt(16)
    tp.paragraph_format.space_after = Pt(4)
    tp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tit = tp.add_run("MANUAL DE USUARIO OFICIAL\nSISTEMA INTEGRAL DE CONTROL DE ESTUDIOS")
    r_tit.font.name = "Calibri"
    r_tit.font.size = Pt(22)
    r_tit.font.bold = True
    r_tit.font.color.rgb = COLOR_PRIMARY
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(4)
    sub_p.paragraph_format.space_after = Pt(20)
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = sub_p.add_run("Guía Práctica Integral Paso a Paso para Docentes, Personal Administrativo y Directivos\nVersión 2.5 Actualizada – Año Escolar 2025-2026")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_SECONDARY
    
    # Divider line
    div_p = doc.add_paragraph()
    div_p.paragraph_format.space_after = Pt(16)
    r_div = div_p.add_run("―" * 55)
    r_div.font.color.rgb = COLOR_MUTED
    div_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # SECTION 1
    add_heading_1(doc, "1. Bienvenido al Sistema")
    add_body_p(doc, "¡Te damos la bienvenida al Sistema Integral de Control de Estudios y Gestión Académica de la Escuela Técnica Robinsoniana y Zamorana \"Alí Primera\"!")
    add_body_p(doc, "Este sistema web institucional ha sido desarrollado para que la administración escolar, la planificación pedagógica y el registro de calificaciones se realicen de forma rápida, transparente, moderna y conforme a la normativa del Ministerio del Poder Popular para la Educación (MPPE).")
    add_body_p(doc, "Como usuario de la plataforma, dispondrás de potentes herramientas para:")
    add_body_p(doc, "• Planificar evaluaciones continuas: Definir entre 1 y 7 evaluaciones por momento pedagógico sumando exactamente el 100%, con cálculo visual de equivalencia en la escala vigesimal (hasta 20 puntos).")
    add_body_p(doc, "• Calificar evaluaciones con vaciado automático: Asentar notas parciales y transferir automáticamente el promedio ponderado a la planilla de calificaciones oficial.")
    add_body_p(doc, "• Acceso rápido mediante calculadora integrada: Abrir y calcular las evaluaciones de cada momento pedagógico directamente desde los encabezados de la sábana de notas.")
    add_body_p(doc, "• Seguimiento integral del estudiante: Consultar expedientes con historial de notas, asistencias, representantes y semáforo predictivo de riesgo académico.")
    add_body_p(doc, "• Cierre seguro de períodos y promoción: Bloquear actas definitivas en tablas históricas inmutables y promover secciones al siguiente año escolar de forma ágil.")
    add_body_p(doc, "• Emisión de reportes oficiales: Imprimir sábanas de evaluación y boletines de notas con formato oficial listo para archivar o firmar.")
    
    add_callout(doc, "Requisitos Técnicos: Navegador moderno (Google Chrome, Microsoft Edge, Firefox). Conexión a la red local del plantel (http://localhost/Proyecto/). Credenciales institucionales otorgadas por la coordinación.", title="REQUISITOS MÍNIMOS", box_type="info")
    
    add_screenshot(doc, "01_portal_bienvenida.png", "Portal de Bienvenida y Selección de Perfil Docente / Administrador")
    
    # SECTION 2
    add_heading_1(doc, "2. Conceptos Clave que Debes Conocer")
    add_body_p(doc, "Para desenvolverte con soltura en la plataforma, familiarízate con los siguientes términos institucionales:")
    
    # Table of concepts
    tbl_c = doc.add_table(rows=1, cols=2)
    tbl_c.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = tbl_c.rows[0].cells
    hdr[0].width = Inches(2.2)
    hdr[1].width = Inches(4.3)
    set_cell_background(hdr[0], "4A151B")
    set_cell_background(hdr[1], "4A151B")
    set_cell_margins(hdr[0], top=100, bottom=100, left=120, right=120)
    set_cell_margins(hdr[1], top=100, bottom=100, left=120, right=120)
    r1 = hdr[0].paragraphs[0].add_run("Término Institucional")
    r1.font.bold = True
    r1.font.color.rgb = RGBColor(255, 255, 255)
    r1.font.size = Pt(10)
    r2 = hdr[1].paragraphs[0].add_run("Significado y Operatividad en el Sistema")
    r2.font.bold = True
    r2.font.color.rgb = RGBColor(255, 255, 255)
    r2.font.size = Pt(10)
    
    conceptos = [
        ("Momento Pedagógico (MP)", "División evaluativa del año escolar (lapsos académicos). Existen tres: MP1, MP2 y MP3."),
        ("Escala Vigesimal (01 a 20)", "Escala oficial nacional. Las notas oscilan entre 01 y 20 puntos. Mínima aprobatoria: 10 puntos."),
        ("Porcentaje Ponderado (100%)", "Distribución de las evaluaciones del momento. Su suma debe ser exactamente 100%."),
        ("Puntaje Equivalente en 20 pts", "Valor en la escala vigesimal: Puntos = (% * 20) / 100. Ejemplo: 20% equivale a 4.0 puntos."),
        ("Vaciado Automático", "Traslado directo de la nota ponderada calculada a la casilla de MP1, MP2 o MP3 de la sábana oficial."),
        ("Inasistencias", "Conteo acumulado de faltas de un estudiante por momento (inas1, inas2, inas3)."),
        ("Nota Definitiva", "Promedio de los momentos pedagógicos cargados. Verde si >= 10 pts, rojo si < 10 pts."),
        ("Actas Congeladas (Inmutables)", "Registro blindado en calificaciones_finales generado al cerrar el año, protegiendo el histórico."),
        ("Semáforo de Riesgo", "Indicador automático (Bajo, Medio, Alto) que alerta sobre alumnos con promedio < 10 o faltas > 15.")
    ]
    
    for idx, (term, desc) in enumerate(conceptos):
        row = tbl_c.add_row()
        c0, c1 = row.cells
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_margins(c0, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c1, top=70, bottom=70, left=100, right=100)
        border_cfg = {"val": "single", "sz": "4", "color": "E2E8F0"}
        set_cell_border(c0, bottom=border_cfg, top=border_cfg)
        set_cell_border(c1, bottom=border_cfg, top=border_cfg)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        rp0 = p0.add_run(term)
        rp0.font.bold = True
        rp0.font.size = Pt(9.5)
        rp0.font.color.rgb = COLOR_TEXT_DARK
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        rp1 = p1.add_run(desc)
        rp1.font.size = Pt(9.5)
        rp1.font.color.rgb = COLOR_TEXT_DARK
        
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    # SECTION 3
    add_heading_1(doc, "3. Primer Ingreso y Autenticación")
    add_heading_2(doc, "3.1. Pantalla de Bienvenida y Selección de Rol")
    add_body_p(doc, "Al ingresar a la dirección principal del sistema en tu navegador web, serás recibido por la pantalla de selección de rol. En ella encontrarás dos accesos diferenciados:")
    add_body_p(doc, "1. PROFESOR: Acceso exclusivo para docentes de aula para planificación, carga de evaluaciones, vaciado de notas y generación de boletines.")
    add_body_p(doc, "2. ADMINISTRADOR: Acceso para el personal directivo, Control de Estudios y Superadministrador del sistema.")
    
    add_heading_2(doc, "3.2. Cómo Iniciar Sesión como Profesor (Credencial y Contraseña)")
    add_body_p(doc, "1. En la pantalla de inicio de sesión docente (login-maestros.html), ubica los campos de ingreso.")
    add_body_p(doc, "2. Cédula: Escribe tu cédula con o sin letra (ej. V-10000003 o simplemente 10000003). El sistema normaliza automáticamente tu número.")
    add_body_p(doc, "3. Contraseña: Escribe tu clave secreta. Puedes pulsar el icono del ojo para verificar los caracteres ingresados.")
    add_body_p(doc, "4. Presiona el botón rojo \"Iniciar Sesión\" para ingresar a tu Panel del Profesor.")
    
    add_screenshot(doc, "04_login_docente.png", "Formulario de Inicio de Sesión para Profesores con Cédula y Contraseña")
    
    add_heading_2(doc, "3.3. Cómo Iniciar Sesión como Administrador")
    add_body_p(doc, "1. En la pantalla de acceso administrativo (login.html), introduce tu usuario o número de cédula.")
    add_body_p(doc, "2. Ingresa tu contraseña en el campo correspondiente.")
    add_body_p(doc, "3. Haz clic en \"Iniciar Sesión\". El sistema identificará tus permisos y te dirigirá al panel correspondiente (Control de Estudios o Superadministración).")
    
    add_heading_2(doc, "3.4. ¿Olvidaste tu Contraseña? (Solicitud de Restablecimiento)")
    add_body_p(doc, "Tanto profesores como administradores cuentan con un mecanismo seguro de recuperación:")
    add_body_p(doc, "1. En la parte inferior del login, haz clic en el enlace azul \"¿Olvidaste tu contraseña?\".")
    add_body_p(doc, "2. Se abrirá una ventana emergente (modal).")
    add_body_p(doc, "3. Escribe tu cédula o tu correo electrónico institucional.")
    add_body_p(doc, "4. Presiona \"Enviar Solicitud\". El sistema notificará de inmediato al Superadministrador para que te asigne una nueva clave temporal segura.")
    
    add_screenshot(doc, "03_modal_recuperar_password.png", "Modal de Solicitud de Restablecimiento de Contraseña para Docentes y Administradores")
    
    # SECTION 4
    add_heading_1(doc, "4. Guía para el Nuevo Docente (Profesor)")
    add_body_p(doc, "El entorno de trabajo docente está especialmente concebido para maximizar la sencillez pedagógica y agilizar la evaluación continua de los estudiantes.")
    
    add_heading_2(doc, "4.1. Conociendo tu Panel de Inicio y Accesos Rápidos")
    add_body_p(doc, "Al ingresar a tu cuenta docente, el sistema te presenta:")
    add_body_p(doc, "• Menú Lateral (Sidebar): Opciones directas para Inicio, Secciones y Años, Mis Estudiantes, Evaluaciones, Registrar Notas, Reporte de Notas y Menciones.")
    add_body_p(doc, "• Acciones Rápidas de Un Clic: Botones para Planificar Evaluaciones, Vacear Notas, Generar Boletín y Mis Secciones.")
    add_body_p(doc, "• Tarjetas de Matrícula: Conteo de tus estudiantes totales y secciones asignadas.")
    
    add_screenshot(doc, "23_profesor_inicio.png", "Panel de Inicio del Profesor con Acciones Rápidas y Estadísticas")
    
    add_heading_2(doc, "4.2. Consultar tus Secciones y Cursos Asignados")
    add_body_p(doc, "1. Haz clic en \"Secciones y Años\" en el menú lateral.")
    add_body_p(doc, "2. Observarás las tarjetas de cada sección donde dictas clase (ej. 2do Año A, 3er Año B - Informática).")
    add_body_p(doc, "3. Cada tarjeta resume la mención técnica, la matrícula de inscritos y el profesor guía.")
    
    add_heading_2(doc, "4.3. Ver tu Nómina de Estudiantes (Formato en Mayúsculas)")
    add_body_p(doc, "1. Ingresa a \"Mis Estudiantes\" en las acciones rápidas o el menú lateral.")
    add_body_p(doc, "2. Utiliza el filtro desplegable superior para seleccionar la sección a auditar.")
    add_body_p(doc, "3. Todos los nombres y apellidos se muestran de forma homologada en LETRAS MAYÚSCULAS para cumplir con la norma oficial de Control de Estudios.")
    add_body_p(doc, "4. Puedes emplear la barra de búsqueda para localizar a cualquier estudiante por nombre o cédula.")
    
    add_heading_2(doc, "4.4. Módulo de Planificación de Evaluaciones (100% y Escala de 20 Puntos)")
    add_callout(doc, "Módulo Exclusivo Docente: Este módulo se encuentra habilitado únicamente en el perfil de Profesor, ya que la planificación de evaluaciones continuas es competencia estricta del docente titular.", title="EXCLUSIVIDAD PEDAGÓGICA", box_type="important")
    
    add_body_p(doc, "Para diseñar tu plan de evaluación por momento pedagógico:")
    add_body_p(doc, "1. Dirígete a \"Evaluaciones\" en el menú lateral.")
    add_body_p(doc, "2. Selecciona el Año de Estudio, la Sección y la Materia.")
    add_body_p(doc, "3. En el bloque del Momento Pedagógico (MP1, MP2 o MP3), pulsa \"Configurar Evaluaciones\".")
    add_body_p(doc, "4. En la ventana modal:")
    add_body_p(doc, "   • Elige la cantidad de evaluaciones a realizar (entre 1 y 7 evaluaciones).")
    add_body_p(doc, "   • Asigna la descripción a cada actividad (ej. Taller Práctico, Exposición, Examen Parcial, Proyecto).")
    add_body_p(doc, "   • Digita el porcentaje asignado a cada evaluación (%).")
    add_body_p(doc, "5. Barra de Validación y Equivalencia Vigesimal en Tiempo Real:")
    add_body_p(doc, "   • La suma de porcentajes debe totalizar exactamente el 100%.")
    add_body_p(doc, "   • El sistema calcula automáticamente la equivalencia en la escala de 20 puntos: Pts = (% * 20) / 100.")
    add_body_p(doc, "   • Ejemplo: 20% equivale a 4.0 pts; 25% equivale a 5.0 pts; 50% equivale a 10.0 pts.")
    add_body_p(doc, "6. Al completar el 100% (20.0 pts acumulados), la barra se marcará en verde y podrás presionar \"Guardar Plan de Evaluaciones\".")
    
    add_screenshot(doc, "29_profesor_evaluaciones_plan.png", "Módulo de Evaluaciones del Docente con Selección de Momento Pedagógico")
    add_screenshot(doc, "30_profesor_modal_config_evaluaciones.png", "Configuración de Evaluaciones con Validación al 100% y Equivalencia en 20 Puntos")
    
    add_heading_2(doc, "4.5. Calificación Detallada de Evaluaciones y Vaciado Automático")
    add_body_p(doc, "Una vez guardado el plan del momento:")
    add_body_p(doc, "1. Haz clic en \"Calificar Evaluaciones\" en el momento correspondiente.")
    add_body_p(doc, "2. Se abrirá la planilla de evaluación donde cada columna representa una de las actividades definidas.")
    add_body_p(doc, "3. Ingresa la calificación de cada alumno en cada evaluación sobre una escala de 0 a 20 puntos.")
    add_body_p(doc, "4. El sistema calculará en tiempo real la nota final ponderada del momento:")
    add_body_p(doc, "   Nota Momento = Suma(Nota_i * (Porcentaje_i / 100))", italic=True)
    add_body_p(doc, "5. Al hacer clic en \"Guardar Calificaciones\", el sistema guarda el desglose individual y transfiere automáticamente el promedio obtenido a la columna oficial del momento (MP1, MP2 o MP3) en la tabla de vaciado de notas.")
    
    add_screenshot(doc, "31_profesor_modal_calificar_evaluaciones.png", "Calificación Continua de Evaluaciones con Cálculo Ponderado en Vivo")
    
    add_heading_2(doc, "4.6. Carga de Notas en Sábana y Calculadora Directa (M.P.1, M.P.2, M.P.3)")
    add_body_p(doc, "Si prefieres trabajar directamente desde la sábana general de notas:")
    add_body_p(doc, "1. Ingresa a \"Registrar Notas\" (o \"Vaciado de Notas\").")
    add_body_p(doc, "2. Selecciona la Sección y la Asignatura.")
    add_body_p(doc, "3. NUEVA FUNCIÓN - Calculadora Directa de Evaluaciones:")
    add_body_p(doc, "   • Al lado de los títulos de columna M.P.1, M.P.2 y M.P.3, encontrarás un botón con un icono de calculadora.")
    add_body_p(doc, "   • Al hacer clic en la calculadora, se abre de inmediato la ventana para calificar las evaluaciones continuas de ese momento sin salir de la planilla.")
    add_body_p(doc, "   • Al guardar las evaluaciones, la nota calculada se refleja al instante en la casilla del momento.")
    add_body_p(doc, "4. Carga Manual Directa: También puedes escribir directamente la nota final del momento (de 01 a 20) y las inasistencias acumuladas.")
    add_body_p(doc, "5. La columna Definitiva calcula el promedio automáticamente en tiempo real.")
    add_body_p(doc, "6. Pulsa el botón verde \"Guardar Calificaciones\" al finalizar la sesión de carga.")
    
    add_screenshot(doc, "26_profesor_registrar_notas.png", "Vaciado de Calificaciones con Calculadora Integrada en Cabeceras M.P.1, M.P.2 y M.P.3")
    
    add_heading_2(doc, "4.7. Generar e Imprimir Sábanas Consolidadas y Boletines")
    add_body_p(doc, "1. Ve a \"Reporte de Notas\" en el menú lateral.")
    add_body_p(doc, "2. Selecciona la Sección y la Asignatura.")
    add_body_p(doc, "3. El sistema generará la Sábana Consolidada Oficial con notas de todos los momentos, inasistencias y nota definitiva.")
    add_body_p(doc, "4. Pulsa \"Imprimir Reporte\" (o Ctrl + P) para obtener el documento impreso o descargarlo como archivo PDF.")
    
    add_screenshot(doc, "27_profesor_reporte_notas.png", "Sábana Consolidada de Evaluación Lista para Impresión Oficial y Firma")
    
    # SECTION 5
    add_heading_1(doc, "5. Guía para el Administrador (Control de Estudios)")
    add_body_p(doc, "El perfil de Administrador centraliza el control de matrículas, la creación de secciones, la gestión de la planta profesoral y la preservación del archivo histórico escolar.")
    
    add_heading_2(doc, "5.1. Recorrido por el Dashboard Administrativo")
    add_body_p(doc, "Al ingresar como administrador, el panel principal te presenta el resumen ejecutivo del plantel:")
    add_body_p(doc, "• Total de Usuarios (docentes y administradores registrados).")
    add_body_p(doc, "• Estudiantes Matriculados activos en el año escolar.")
    add_body_p(doc, "• Menciones Técnicas operativas en la institución.")
    add_body_p(doc, "• Estatus del Período Escolar vigente (Activo o Cerrado).")
    
    add_screenshot(doc, "07_admin_inicio.png", "Dashboard General del Administrador de Control de Estudios")
    
    add_heading_2(doc, "5.2. Cómo Inscribir y Gestionar Estudiantes (Nombres en Mayúsculas)")
    add_body_p(doc, "1. En el menú, dirígete a \"Académico\" → \"Estudiantes\".")
    add_body_p(doc, "2. Presiona el botón azul \"+ Nuevo Estudiante\".")
    add_body_p(doc, "3. Completa los datos: Cédula (V o E), Nombres, Apellidos, Correo, Teléfono y Sección asignada.")
    add_body_p(doc, "4. Formato Homologado en Mayúsculas: Los nombres y apellidos son transformados automáticamente a LETRAS MAYÚSCULAS para mantener la pulcritud en todos los registros oficiales.")
    add_body_p(doc, "5. Presiona \"Guardar Estudiante\".")
    
    add_screenshot(doc, "20_admin_modal_estudiante.png", "Formulario de Inscripción de Estudiantes con Formateo Automático a Mayúsculas")
    
    add_heading_2(doc, "5.3. El Expediente Digital y Semáforo de Riesgo Académico")
    add_body_p(doc, "1. En la lista de estudiantes, haz clic en el botón con icono de ojo (\"Ver Perfil\").")
    add_body_p(doc, "2. Se abrirá la Ficha Integral del Estudiante:")
    add_body_p(doc, "   • Semáforo de Riesgo Académico: Verde (Bajo), Amarillo (Medio), Rojo (Alto si promedio < 10 o inasistencias > 15).")
    add_body_p(doc, "   • Cuadrícula de Métricas: Promedio general, inasistencias acumuladas, asignaturas aprobadas y materias pendientes.")
    add_body_p(doc, "   • Historial de Notas: Calificaciones detalladas de MP1, MP2, MP3 y Definitiva de todas las materias cursadas.")
    
    add_screenshot(doc, "22_admin_modal_perfil_estudiante.png", "Expediente Digital del Estudiante con Semáforo de Riesgo e Historial de Calificaciones")
    
    add_heading_2(doc, "5.4. Registro de Profesores (Contraseña y Distribución Materia/Sección)")
    add_body_p(doc, "1. Ingresa a \"Usuarios\" → \"Profesores\" y pulsa \"+ Nuevo Profesor\".")
    add_body_p(doc, "2. Datos Personales y Contraseña: Cédula, Nombres, Apellidos, Correo, Teléfono y campo Contraseña para fijar su clave de acceso.")
    add_body_p(doc, "3. Asignación de Carga Académica en Dos Columnas: La interfaz organiza la asignación en dos columnas ordenadas: Materia a la izquierda y Sección a la derecha.")
    add_body_p(doc, "4. Pulsa \"+ Agregar Asignación\" para cada materia-sección correspondiente.")
    add_body_p(doc, "5. Haz clic en \"Guardar Profesor\".")
    
    add_screenshot(doc, "19_admin_modal_profesor.png", "Registro de Profesor con Creación de Contraseña y Asignación en Dos Columnas")
    
    add_heading_2(doc, "5.5. Crear y Configurar Secciones Escolares")
    add_body_p(doc, "1. Ingresa a \"Académico\" → \"Secciones y Años\" y haz clic en \"+ Nueva Sección\".")
    add_body_p(doc, "2. Selecciona el Año de Estudio (1ro a 6to), la Letra, la Mención Técnica y el Profesor Guía.")
    add_body_p(doc, "3. Haz clic en \"Guardar Sección\". El sistema valida automáticamente que no existan aulas duplicadas.")
    add_body_p(doc, "4. Detalle de Aula: Al hacer clic en cualquier tarjeta de sección, puedes consultar en una sola pantalla la nómina de alumnos inscritos y la lista de profesores asignados.")
    
    add_screenshot(doc, "11_admin_secciones_y_anos.png", "Gestión de Secciones y Años Escolares de la Escuela Técnica")
    add_screenshot(doc, "21_admin_modal_detalle_seccion.png", "Detalle de Sección con Lista de Alumnos y Docentes Asignados")
    
    add_heading_2(doc, "5.6. Configuración de Menciones Técnicas y Asignaturas")
    add_body_p(doc, "• Menciones Técnicas: Permite definir las especialidades técnicas de la escuela (Informática, Electricidad, Mecánica, etc.) con sus colores e iconos representativos.")
    add_body_p(doc, "• Asignaturas: Administra el catálogo curricular institucional, organizando asignaturas por año escolar y código oficial.")
    
    add_heading_2(doc, "5.7. Control de Períodos, Cierre de Año (Actas Inmutables) y Promoción de Secciones")
    add_body_p(doc, "En el módulo \"Gestión\" → \"Períodos\":")
    add_body_p(doc, "1. Períodos Escolares: Configuración del año escolar lectivo y fechas límites de entrega por momento pedagógico.")
    add_body_p(doc, "2. Cierre Formal de Período y Actas Inmutables: Al presionar \"Finalizar Año Escolar\", el sistema congela todas las notas en la tabla protegida calificaciones_finales, impidiendo modificaciones extemporáneas y blindando los registros históricos.")
    add_body_p(doc, "3. Promoción de Estudiantes por Secciones: Facilita el avance de año escolar por secciones (de 1er año a 2do año, etc.), promoviendo a los estudiantes aprobados al nuevo ciclo escolar.")
    
    add_screenshot(doc, "17_admin_periodos.png", "Gestión de Períodos Escolares con Cierre de Año y Congelación de Notas")
    
    add_heading_2(doc, "5.8. Respaldo de la Base de Datos (Backup SQL)")
    add_body_p(doc, "Para salvaguardar la información académica:")
    add_body_p(doc, "1. Accede a la opción de respaldo del sistema (exportar_bd.php).")
    add_body_p(doc, "2. El sistema descargará un archivo .sql completo con todas las tablas académicas y de seguridad.")
    add_body_p(doc, "3. Se recomienda realizar y archivar este respaldo al concluir cada momento pedagógico.")
    
    # SECTION 6
    add_heading_1(doc, "6. Guía para el Superadministrador")
    add_body_p(doc, "El Superadministrador posee las atribuciones de más alto nivel para velar por la seguridad institucional, auditoría global y resguardo de la plataforma.")
    
    add_heading_2(doc, "6.1. Panel de Seguridad y Monitoreo de Accesos")
    add_body_p(doc, "• Visualiza en tiempo real a todos los administradores registrados en la institución.")
    add_body_p(doc, "• Permite crear nuevos administradores con privilegios definidos para el personal de Control de Estudios.")
    
    add_heading_2(doc, "6.2. Gestión de Solicitudes de Reseteo de Clave (Docentes y Administradores)")
    add_body_p(doc, "Cuando un profesor o un administrador utiliza la opción ¿Olvidaste tu contraseña?:")
    add_body_p(doc, "1. En la consola del Superadministrador se mostrará la solicitud con el rol (Docente o Administrador), nombre, cédula y correo del solicitante.")
    add_body_p(doc, "2. El Superadministrador hace clic en \"Restablecer Clave\", define una contraseña provisional segura y guarda los cambios.")
    add_body_p(doc, "3. Se notifica al docente o administrador su nueva clave para que continúe trabajando de inmediato.")
    
    add_screenshot(doc, "05_superadmin_dashboard.png", "Panel del Superadministrador con Gestión de Usuarios y Solicitudes de Contraseña")

    add_heading_2(doc, "6.3. Control del Personal Docente y Acciones de Seguridad")
    add_body_p(doc, "En la pestaña \"Profesores\", el Superadministrador supervisa la nómina docente institucional con botones de acción unificados (34x34px) para garantizar la integridad operativa:")
    add_body_p(doc, "• Inhabilitar Profesor (Botón Ámbar): Suspende temporalmente el acceso del docente a la plataforma sin eliminar su historial de notas ni evaluaciones. El usuario queda bloqueado para iniciar sesión hasta ser habilitado nuevamente.")
    add_body_p(doc, "• Habilitar Profesor (Botón Verde): Reactiva el acceso del docente de forma inmediata.")
    add_body_p(doc, "• Cambio Directo de Contraseña (Botón Azul): Permite asignar una nueva clave al profesor con confirmación inmediata en caso de contingencia.")
    add_body_p(doc, "• Eliminación Permanente (Botón Rojo): Suprime la cuenta docente de la base de datos previa confirmación del Superadministrador.")
    
    add_screenshot(doc, "32_superadmin_docentes_acciones.png", "Gestión de Profesores con Acciones Unificadas de Inhabilitación, Contraseña y Eliminación")

    add_heading_2(doc, "6.4. Control, Búsqueda y Filtros de Estudiantes (Sincronización en Tiempo Real)")
    add_body_p(doc, "La pestaña \"Estudiantes\" centraliza la matrícula estudiantil estructurada por áreas técnicas y cursos:")
    add_body_p(doc, "• Filtro por Mención: Aísla a los alumnos de especialidades técnicas específicas (Electricidad, Metalmecánica, Petroquímica, etc.).")
    add_body_p(doc, "• Filtro por Sección Dinámico: Al seleccionar una mención, el menú de secciones se filtra en tiempo real mostrando únicamente los cursos asociados.")
    add_body_p(doc, "• Buscador Predictivo: Filtra al instante por nombres, apellidos o número de cédula.")
    add_body_p(doc, "• Contador Reactivo: Muestra la proporción de alumnos que cumplen con los filtros (ej. «Mostrando 16 de 44 estudiantes»).")
    add_body_p(doc, "• Sincronización en Vivo: La información de sección y mención se resuelve dinámicamente. Cualquier cambio de sección o promoción de curso realizado por docentes o personal administrativo se refleja de inmediato sin requerir recargar la página.")
    add_body_p(doc, "• Botón de Sincronización Manual: Permite refrescar la caché del navegador con la base de datos MySQL con un solo clic.")
    
    add_screenshot(doc, "33_superadmin_estudiantes_filtros.png", "Nómina de Estudiantes con Filtros Avanzados por Mención y Sección Sincronizados")

    add_heading_2(doc, "6.5. Sistema de Mantenimiento y Base de Datos (Respaldos e Indexado)")
    add_body_p(doc, "La pestaña \"Base de Datos\" proporciona una consola de administración integral del motor de base de datos MySQL en AppServ:")
    add_body_p(doc, "1. Tarjetas Métricas en Vivo: Monitorea el nombre de la base de datos (sistema_ali), versión del motor MySQL, total de tablas, registros acumulados y tamaño físico en disco desglosado en datos brutos e índices.")
    add_body_p(doc, "2. Creación de Respaldos Inmediatos (.sql): Al pulsar \"Crear Respaldo Ahora\", el sistema ejecuta mysqldump con directiva --no-defaults, almacenando el volcado íntegro en la carpeta protegida /backups/.")
    add_body_p(doc, "3. Historial de Copias de Seguridad: Tabla reactiva que permite Descargar copias a la PC local, Restaurar la base de datos a un punto previo (con modal de advertencia de seguridad) o Eliminar archivos antiguos.")
    add_body_p(doc, "4. Reindexado y Optimización de Tablas InnoDB: Al presionar \"Optimizar e Indexar Tablas\", el sistema garantiza los índices de alta velocidad (idx_usuarios_email, idx_usuarios_rol, idx_estudiantes_ap_nom, idx_secciones_guia) y ejecuta CHECK TABLE, OPTIMIZE TABLE y ANALYZE TABLE en las 12 tablas, presentando un diagnóstico detallado en pantalla.")
    add_body_p(doc, "5. Automatización con Windows: Incluye el script backup_diario.bat programable en el Programador de Tareas de Windows (taskschd.msc) para copias desatendidas diarias con depuración automática a los 30 días.")
    
    add_screenshot(doc, "34_superadmin_base_datos_metricas.png", "Consola de Mantenimiento y Métricas de Base de Datos con Gestión de Respaldos SQL")
    add_screenshot(doc, "35_superadmin_base_datos_optimizacion.png", "Diagnóstico en Tiempo Real, Reindexado y Desfragmentación de Tablas InnoDB")
    add_screenshot(doc, "36_superadmin_modal_restaurar_bd.png", "Modal de Seguridad para Confirmación y Advertencia de Restauración de Base de Datos")
    
    # SECTION 7
    add_heading_1(doc, "7. Preguntas Frecuentes y Solución de Problemas (FAQ)")
    
    faqs = [
        ("¿Por qué el botón de \"Evaluaciones\" solo aparece en profesores?",
         "Porque la planificación y calificación de evaluaciones continuas es competencia pedagógica exclusiva del docente de aula. Los administradores auditan las sábanas consolidadas y las actas definitivas."),
        ("¿Cómo funciona el cálculo de equivalencia en 20 puntos?",
         "El sistema aplica la fórmula venezolana: Puntos = (% * 20) / 100. Una evaluación con 20% equivale a 4.0 pts; al calificar de 0 a 20 pts, el sistema pondera automáticamente el aporte a la nota final del momento."),
        ("¿Por qué no puedo guardar mi plan de evaluaciones?",
         "El sistema exige estrictamente que la suma de porcentajes de todas las evaluaciones del momento totalice exactamente el 100%. Revisa la barra de progreso inferior; al llegar al 100%, el botón verde se activará."),
        ("¿Puedo calificar las evaluaciones desde la misma sábana de notas?",
         "¡Sí! En la tabla de notas, haz clic en el botón de calculadora situado en las columnas M.P.1, M.P.2 o M.P.3. Se abrirá la ventana de evaluaciones de ese momento y, al guardar, la nota se reflejará al instante en la sábana."),
        ("¿Qué sucede con las calificaciones cuando el administrador cierra el período escolar?",
         "Se congelan de forma permanente en la tabla histórica calificaciones_finales como actas inmutables, garantizando que nadie pueda alterar las notas históricas de los estudiantes."),
        ("¿Por qué los nombres de los estudiantes se escriben automáticamente en mayúsculas?",
         "Para garantizar uniformidad institucional y cumplir con la normativa de Control de Estudios, todos los nombres y apellidos se homologan en LETRAS MAYÚSCULAS en todas las pantallas y reportes oficiales.")
    ]
    
    for q, a in faqs:
        add_body_p(doc, q, bold_prefix="❓ ")
        add_body_p(doc, a, bold_prefix="   Respuesta: ")
        doc.add_paragraph().paragraph_format.space_after = Pt(2)
        
    # SECTION 8
    add_heading_1(doc, "8. Buenas Prácticas y Cierre de Sesión Seguro")
    add_body_p(doc, "1. Cerrar Sesión al Terminar: No dejes sesiones activas en equipos compartidos o salas de profesores.")
    add_body_p(doc, "2. Confidencialidad: No facilites tu contraseña a terceros ni a alumnos.")
    add_body_p(doc, "3. Guardado Frecuente: Al cargar calificaciones de secciones numerosas, realiza guardados progresivos para evitar pérdidas por fluctuaciones eléctricas.")
    add_body_p(doc, "4. Registro Riguroso de Inasistencias: Lleva al día el conteo de faltas en cada momento pedagógico para el sustento legal de las evaluaciones.")
    
    add_callout(doc, "Manual Oficial elaborado para el personal docente, administrativo y directivo de la E.T.R. \"Alí Primera\". Ante cualquier duda o requerimiento técnico, contacta a la Coordinación de Informática y Control de Estudios.", title="SOPORTE INSTITUCIONAL", box_type="success")
    
    # Save handling
    saved_path = PRIMARY_TARGET
    try:
        doc.save(PRIMARY_TARGET)
        print(f"SUCCESS: Document saved to {PRIMARY_TARGET}")
    except PermissionError:
        doc.save(FALLBACK_TARGET)
        saved_path = FALLBACK_TARGET
        print(f"NOTICE: {PRIMARY_TARGET} was locked by another process (e.g. Word). Saved to fallback {FALLBACK_TARGET}")
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
        
    return saved_path

if __name__ == "__main__":
    main()

