import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

BASE_DIR = r"c:\AppServ\www\Proyecto"
TARGET_DOCX = os.path.join(BASE_DIR, "Modelo_Entidad_Relacion_Ali_Primera_Actualizado.docx")
TARGET_MD = os.path.join(BASE_DIR, "MODELO_ENTIDAD_RELACION_ACTUALIZADO.md")

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

ENTITIES = [
    {
        "name": "USUARIOS",
        "tipo": "Fuerte",
        "desc": "Gestiona las cuentas de acceso del sistema: Superadministrador (root), Administrador (Control de Estudios) y Profesor/Docente.",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único incremental."),
            ("cedula", "VARCHAR(20)", "NO", "UNIQUE", "Cédula de identidad con prefijo (ej. 'V-12345678')."),
            ("nombre", "VARCHAR(100)", "NO", "—", "Nombre del usuario."),
            ("apellido", "VARCHAR(100)", "NO", "—", "Apellido del usuario."),
            ("email", "VARCHAR(100)", "SÍ", "INDEX", "Correo electrónico institucional o personal."),
            ("telefono", "VARCHAR(20)", "SÍ", "—", "Teléfono de contacto."),
            ("rol", "ENUM('admin','teacher','superadmin')", "NO", "INDEX", "Rol jerárquico de acceso."),
            ("password", "VARCHAR(255)", "NO", "—", "Contraseña encriptada/almacenada para acceso seguro."),
            ("nivel_acceso", "VARCHAR(50)", "SÍ", "—", "Permiso específico de gestión."),
            ("materias", "TEXT", "SÍ", "—", "Lista de asignaturas que imparte."),
            ("secciones", "TEXT", "SÍ", "—", "Lista de secciones asignadas."),
            ("tipo_docente", "VARCHAR(30)", "SÍ", "—", "'docente', 'docente_guia' o 'solo_guia'."),
            ("solicitud_reset", "TINYINT(1)", "SÍ", "—", "1 = Solicitó restablecimiento de clave; 0 = Normal."),
            ("reset_fecha", "DATETIME", "SÍ", "—", "Marca de tiempo de la solicitud de reseteo."),
            ("activo", "TINYINT(1)", "SÍ", "—", "NUEVO: 1 = Activo; 0 = Inhabilitado (bloqueo docente).")
        ]
    },
    {
        "name": "ESTUDIANTES",
        "tipo": "Fuerte",
        "desc": "Matrícula escolar oficial del plantel. Almacena la identidad y ubicación académica de los alumnos con nombres forzados a MAYÚSCULAS.",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del estudiante."),
            ("cedula", "VARCHAR(20)", "NO", "UNIQUE", "Cédula estudiantil única (ej. 'V-31072861')."),
            ("nombre", "VARCHAR(100)", "NO", "—", "Nombres forzados automáticamente a MAYÚSCULAS."),
            ("apellido", "VARCHAR(100)", "NO", "INDEX", "Apellidos forzados automáticamente a MAYÚSCULAS."),
            ("email", "VARCHAR(100)", "SÍ", "—", "Correo de contacto del alumno o representante."),
            ("telefono", "VARCHAR(20)", "SÍ", "—", "Teléfono de contacto institucional."),
            ("seccion_id", "INT", "SÍ", "FK", "Sección a la que pertenece el alumno."),
            ("activo", "TINYINT(1)", "SÍ", "INDEX", "NUEVO: 1 = Activo (regular); 0 = Inhabilitado (suspendido).")
        ]
    },
    {
        "name": "MENCIONES",
        "tipo": "Fuerte",
        "desc": "Especialidades técnicas impartidas por la Escuela Técnica (Electricidad, Metalmecánica, Informática, etc.).",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la mención técnica."),
            ("nombre", "VARCHAR(100)", "NO", "—", "Nombre formal de la especialidad técnica."),
            ("color", "VARCHAR(30)", "SÍ", "—", "Color distintivo institucional en formato hex o CSS."),
            ("icono", "VARCHAR(50)", "SÍ", "—", "Identificador de icono temático (Boxicons).")
        ]
    },
    {
        "name": "SECCIONES",
        "tipo": "Fuerte",
        "desc": "Aulas y cursos organizados por año formativo (1ro a 6to), letra y especialidad técnica.",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la sección."),
            ("nombre", "VARCHAR(50)", "NO", "—", "Nombre formal (ej. '1ro Año A', '4to Año B')."),
            ("mencion_id", "INT", "SÍ", "FK", "Mención técnica a la que pertenece la sección."),
            ("profesor_guia_id", "INT", "SÍ", "FK", "Docente asignado como tutor de la sección."),
            ("profesor_guia_nombre", "VARCHAR(200)", "SÍ", "—", "Nombre desnormalizado del docente guía.")
        ]
    },
    {
        "name": "PERIODOS",
        "tipo": "Fuerte",
        "desc": "Ciclos lectivos escolares con calendario y fechas límites para los tres momentos pedagógicos.",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del período escolar."),
            ("nombre", "VARCHAR(50)", "NO", "—", "Nombre oficial del ciclo lectivo (ej. '2026-2027')."),
            ("fecha_inicio", "DATE", "SÍ", "—", "Fecha de inicio del ciclo escolar."),
            ("fecha_fin", "DATE", "SÍ", "—", "Fecha de culminación del ciclo escolar."),
            ("fecha_mp1", "DATE", "SÍ", "—", "Fecha límite del 1er Momento Pedagógico."),
            ("fecha_mp2", "DATE", "SÍ", "—", "Fecha límite del 2do Momento Pedagógico."),
            ("fecha_mp3", "DATE", "SÍ", "—", "Fecha límite del 3er Momento Pedagógico."),
            ("estado", "ENUM('activo','cerrado')", "SÍ", "—", "'activo' = en curso (único); 'cerrado' = congelado.")
        ]
    },
    {
        "name": "ASIGNATURAS",
        "tipo": "Fuerte",
        "desc": "Malla curricular que define las materias impartidas por mención y año formativo.",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la asignatura."),
            ("mencion_id", "INT", "NO", "FK", "Mención técnica asociada a la asignatura."),
            ("anio", "TINYINT(4)", "NO", "—", "Año formativo donde se cursa (1 a 6)."),
            ("nombre", "VARCHAR(150)", "NO", "—", "Nombre formal de la materia."),
            ("area", "VARCHAR(50)", "SÍ", "—", "'general' o 'tecnica'."),
            ("created_at", "TIMESTAMP", "SÍ", "—", "Fecha de registro curricular.")
        ]
    },
    {
        "name": "TEACHER_ASSIGNMENTS",
        "tipo": "Asociativa",
        "desc": "Resuelve la relación muchos a muchos entre docentes, materias y secciones.",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la asignación."),
            ("teacher_id", "INT", "SÍ", "FK", "Docente responsable de la cátedra."),
            ("materia_nombre", "VARCHAR(100)", "SÍ", "—", "Nombre de la asignatura asignada."),
            ("seccion_id", "INT", "SÍ", "FK", "Sección donde se imparte la clase.")
        ]
    },
    {
        "name": "EVALUACIONES_CONFIG",
        "tipo": "Débil",
        "desc": "NUEVO: Almacena los planes de evaluación diseñados al 100% sobre la escala de 20 puntos.",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del plan evaluativo."),
            ("teacher_id", "INT", "NO", "FK", "Docente titular del plan de evaluación."),
            ("seccion_id", "INT", "NO", "FK", "Sección evaluada."),
            ("materia", "VARCHAR(100)", "NO", "—", "Nombre de la asignatura."),
            ("periodo_id", "INT", "NO", "FK", "Período escolar asociado."),
            ("momento", "TINYINT(4)", "NO", "—", "Momento pedagógico planificado (1, 2 o 3)."),
            ("num_evaluaciones", "TINYINT(4)", "NO", "—", "Cantidad de evaluaciones (1 a 7)."),
            ("porcentajes", "JSON", "NO", "—", "Arreglo JSON de porcentajes (suman 100%)."),
            ("nombres", "JSON", "SÍ", "—", "Arreglo JSON de nombres de actividades."),
            ("updated_at", "TIMESTAMP", "SÍ", "—", "Última fecha de actualización del plan.")
        ]
    },
    {
        "name": "EVALUACIONES_NOTAS",
        "tipo": "Débil",
        "desc": "NUEVO: Calificaciones detalladas por actividad que calculan en vivo la nota de momento.",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del registro detallado."),
            ("estudiante_id", "INT", "NO", "FK", "Estudiante evaluado."),
            ("seccion_id", "INT", "NO", "FK", "Sección a la que pertenece."),
            ("materia", "VARCHAR(100)", "NO", "—", "Asignatura evaluada."),
            ("periodo_id", "INT", "NO", "FK", "Período escolar en curso."),
            ("momento", "TINYINT(4)", "NO", "—", "Momento pedagógico calificado (1, 2 o 3)."),
            ("notas_eval", "JSON", "NO", "—", "Arreglo JSON de notas por actividad (0-20 pts)."),
            ("nota_momento", "DECIMAL(4,2)", "NO", "—", "Nota resultante del momento (0-20 pts)."),
            ("updated_at", "TIMESTAMP", "SÍ", "—", "Fecha y hora del cálculo y vaciado.")
        ]
    },
    {
        "name": "NOTAS",
        "tipo": "Débil",
        "desc": "Planilla oficial de calificaciones asentadas por momento (MP1, MP2, MP3) e inasistencias.",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la fila de sábana."),
            ("estudiante_id", "INT", "SÍ", "FK", "Estudiante calificado."),
            ("seccion_id", "INT", "SÍ", "FK", "Sección donde cursa."),
            ("materia", "VARCHAR(100)", "NO", "INDEX", "Nombre de la materia oficial."),
            ("periodo_id", "INT", "SÍ", "FK", "Período escolar correspondiente."),
            ("mp1", "DECIMAL(4,2)", "SÍ", "—", "Nota final del 1er Momento Pedagógico (0-20)."),
            ("inas1", "INT(11)", "SÍ", "—", "NUEVO: Total de inasistencias en el 1er Momento."),
            ("mp2", "DECIMAL(4,2)", "SÍ", "—", "Nota final del 2do Momento Pedagógico (0-20)."),
            ("inas2", "INT(11)", "SÍ", "—", "NUEVO: Total de inasistencias en el 2do Momento."),
            ("mp3", "DECIMAL(4,2)", "SÍ", "—", "Nota final del 3er Momento Pedagógico (0-20)."),
            ("inas3", "INT(11)", "SÍ", "—", "NUEVO: Total de inasistencias en el 3er Momento."),
            ("definitiva", "DECIMAL(4,2)", "SÍ", "—", "Promedio ponderado oficial final.")
        ]
    },
    {
        "name": "CALIFICACIONES_FINALES",
        "tipo": "Histórica",
        "desc": "Actas oficiales inmutables generadas tras el cierre del año escolar ('Finalizar Año Escolar').",
        "attrs": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del acta final congelada."),
            ("periodo_id", "INT", "NO", "FK", "Período escolar cerrado."),
            ("estudiante_id", "INT", "NO", "FK", "Estudiante evaluado."),
            ("seccion_id", "INT", "NO", "FK", "Sección cursada."),
            ("materia", "VARCHAR(100)", "NO", "—", "Nombre de la materia."),
            ("mp1", "DECIMAL(4,2)", "SÍ", "—", "Nota congelada del 1er Momento."),
            ("mp2", "DECIMAL(4,2)", "SÍ", "—", "Nota congelada del 2do Momento."),
            ("mp3", "DECIMAL(4,2)", "SÍ", "—", "Nota congelada del 3er Momento."),
            ("definitiva", "DECIMAL(4,2)", "SÍ", "—", "Nota definitiva final inmutable."),
            ("estado", "ENUM('aprobado','reprobado','sin_calificar')", "NO", "—", "Veredicto ministerial del alumno."),
            ("cerrado_en", "DATETIME", "SÍ", "—", "Estampa temporal exacta del cierre del ciclo.")
        ]
    }
]

CARDINALITIES = [
    ("MENCIONES → SECCIONES", "1 : N", "Una mención agrupa múltiples secciones técnicas. Cada sección pertenece a una sola mención."),
    ("MENCIONES → ASIGNATURAS", "1 : N", "Una mención posee una malla curricular de múltiples materias de 1ro a 6to año."),
    ("USUARIOS (Docentes) → SECCIONES (Guía)", "1 : N", "Un docente puede ser profesor guía de una sección; una sección tiene un único docente guía."),
    ("USUARIOS ↔ SECCIONES (Cátedras)", "M : N", "Resuelto mediante la entidad intermedia TEACHER_ASSIGNMENTS."),
    ("SECCIONES → ESTUDIANTES", "1 : N", "Una sección agrupa a una nómina de múltiples alumnos matriculados."),
    ("ESTUDIANTES → NOTAS", "1 : N", "Un estudiante posee registros de notas por cada asignatura cursada en el ciclo."),
    ("PERIODOS → NOTAS", "1 : N", "Un período escolar almacena todas las notas asentadas en sus tres momentos."),
    ("USUARIOS (Docentes) → EVALUACIONES_CONFIG", "1 : N", "Un docente diseña múltiples planes de evaluación (100% sobre 20 pts) para sus secciones."),
    ("EVALUACIONES_CONFIG → EVALUACIONES_NOTAS", "1 : N", "Un plan de evaluación se aplica a todos los estudiantes de la sección."),
    ("ESTUDIANTES → EVALUACIONES_NOTAS", "1 : N", "Un estudiante posee registros de notas por cada evaluación individual planificada."),
    ("PERIODOS → CALIFICACIONES_FINALES", "1 : N", "Al cerrar el año escolar, el período congela las notas definitivas en actas inmutables."),
    ("ESTUDIANTES → CALIFICACIONES_FINALES", "1 : N", "Un estudiante acumula su historial inmutable de materias aprobadas o reprobadas.")
]

def build_mer_docx():
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    # Portada
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
    r_tit = p_tit.add_run("MODELO ENTIDAD - RELACIÓN (M-E/R)")
    r_tit.font.name = "Calibri"
    r_tit.font.size = Pt(18)
    r_tit.font.bold = True
    r_tit.font.color.rgb = COLOR_WINE

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("Diseño Conceptual, Lógico y Físico de Base de Datos MySQL 8.0 (11 Entidades)\nActualizado con Módulo de Evaluaciones 100%, Inhabilitación de Estudiantes, Inasistencias y Actas Inmutables")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(9.5)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_MUTED

    # Meta tabla
    t_meta = doc.add_table(rows=5, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_info = [
        ("Base de Datos:", "sistema_ali (Motor MySQL / MariaDB InnoDB Transaccional)"),
        ("Arquitectura del Modelo:", "Modelo Relacional Normalizado con 11 Entidades y Claves Foráneas"),
        ("Total de Entidades:", "11 Entidades (6 Fuertes, 1 Asociativa, 3 Débiles, 1 Histórica Inmutable)"),
        ("Fecha de Actualización:", "Noviembre 2026 (Versión 2.5 Consolidada con Novedades Operativas)"),
        ("Novedades Reflejadas:", "Campos activo en usuarios y estudiantes, inasistencias inas1-3, evaluaciones y actas")
    ]
    for row_idx, (k, v) in enumerate(meta_info):
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

    # Salto
    doc.add_page_break()

    # Sección 1: Introducción
    p_h1 = doc.add_paragraph()
    p_h1.paragraph_format.space_before = Pt(16)
    p_h1.paragraph_format.space_after = Pt(6)
    r_h1 = p_h1.add_run("1. Arquitectura y Fundamentos del Modelo")
    r_h1.font.name = "Calibri"
    r_h1.font.size = Pt(14)
    r_h1.font.bold = True
    r_h1.font.color.rgb = COLOR_BURGUNDY

    p_intro = doc.add_paragraph()
    p_intro.paragraph_format.space_after = Pt(8)
    p_intro.paragraph_format.line_spacing = 1.15
    r_intro = p_intro.add_run(
        "El presente documento técnico formaliza el Modelo Entidad-Relación (M-E/R) que gobierna la base de datos "
        "'sistema_ali' de la Escuela Técnica Robinsoniana \"Alí Primera\". Su diseño en tercera forma normal (3FN) "
        "asegura la no redundancia de datos, la integridad referencial en cascada y la consistencia transaccional "
        "bajo el motor de almacenamiento InnoDB de MySQL 8.0."
    )
    r_intro.font.name = "Calibri"
    r_intro.font.size = Pt(9.5)
    r_intro.font.color.rgb = COLOR_TEXT

    # Sección 2: Cardinalidades y Reglas de Negocio
    p_h2 = doc.add_paragraph()
    p_h2.paragraph_format.space_before = Pt(14)
    p_h2.paragraph_format.space_after = Pt(6)
    r_h2 = p_h2.add_run("2. Matriz de Relaciones y Cardinalidades")
    r_h2.font.name = "Calibri"
    r_h2.font.size = Pt(13)
    r_h2.font.bold = True
    r_h2.font.color.rgb = COLOR_WINE

    t_card = doc.add_table(rows=len(CARDINALITIES) + 1, cols=3)
    t_card.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_heads = ["Interconexión de Entidades", "Cardinalidad", "Regla de Negocio / Integridad"]
    c_widths = [Inches(2.2), Inches(0.9), Inches(3.7)]

    # Header
    for c_idx, h_txt in enumerate(c_heads):
        cell = t_card.rows[0].cells[c_idx]
        set_cell_background(cell, "4A151B")
        set_cell_margins(cell, 60, 60, 80, 80)
        set_cell_borders(cell, "4A151B")
        p = cell.paragraphs[0]
        r = p.add_run(h_txt)
        r.font.name = "Calibri"
        r.font.size = Pt(8.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for r_idx, (rel_name, card, rule) in enumerate(CARDINALITIES):
        row = t_card.rows[r_idx + 1]
        bg = "F8FAFC" if r_idx % 2 == 0 else "FFFFFF"
        for c_idx, val in enumerate([rel_name, card, rule]):
            cell = row.cells[c_idx]
            cell.width = c_widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 50, 50, 70, 70)
            set_cell_borders(cell, "CBD5E1")
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(8)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_BURGUNDY
            elif c_idx == 1:
                r.font.bold = True
                r.font.color.rgb = COLOR_WINE
            else:
                r.font.color.rgb = COLOR_TEXT

    # Salto
    doc.add_page_break()

    # Sección 3: Especificación Formal de Entidades y Atributos
    p_h3 = doc.add_paragraph()
    p_h3.paragraph_format.space_before = Pt(14)
    p_h3.paragraph_format.space_after = Pt(6)
    r_h3 = p_h3.add_run("3. Especificación Formal de las 11 Entidades")
    r_h3.font.name = "Calibri"
    r_h3.font.size = Pt(14)
    r_h3.font.bold = True
    r_h3.font.color.rgb = COLOR_BURGUNDY

    for e in ENTITIES:
        p_en = doc.add_paragraph()
        p_en.paragraph_format.space_before = Pt(12)
        p_en.paragraph_format.space_after = Pt(2)
        p_en.paragraph_format.keep_with_next = True
        r_en = p_en.add_run(f"Entidad: {e['name']} ")
        r_en.font.name = "Calibri"
        r_en.font.size = Pt(11.5)
        r_en.font.bold = True
        r_en.font.color.rgb = COLOR_WINE

        r_tipo = p_en.add_run(f"({e['tipo']})")
        r_tipo.font.name = "Calibri"
        r_tipo.font.size = Pt(9.5)
        r_tipo.font.italic = True
        r_tipo.font.color.rgb = COLOR_MUTED

        p_ed = doc.add_paragraph()
        p_ed.paragraph_format.space_before = Pt(0)
        p_ed.paragraph_format.space_after = Pt(4)
        p_ed.paragraph_format.keep_with_next = True
        r_ed = p_ed.add_run(e['desc'])
        r_ed.font.name = "Calibri"
        r_ed.font.size = Pt(9)
        r_ed.font.color.rgb = COLOR_TEXT

        # Tabla de atributos
        tbl = doc.add_table(rows=len(e['attrs']) + 1, cols=5)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        headers = ["Atributo", "Tipo de Dato", "Nulo", "Clave", "Dominio / Regla de Validación"]
        widths = [Inches(1.5), Inches(1.3), Inches(0.6), Inches(0.8), Inches(2.6)]

        for c_idx, h_text in enumerate(headers):
            cell = tbl.rows[0].cells[c_idx]
            cell.width = widths[c_idx]
            set_cell_background(cell, "4A151B")
            set_cell_margins(cell, 50, 50, 70, 70)
            set_cell_borders(cell, "4A151B")
            p = cell.paragraphs[0]
            r = p.add_run(h_text)
            r.font.name = "Calibri"
            r.font.size = Pt(8.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        for r_idx, attr in enumerate(e['attrs']):
            row = tbl.rows[r_idx + 1]
            bg = "F8FAFC" if r_idx % 2 == 0 else "FFFFFF"
            for c_idx in range(5):
                cell = row.cells[c_idx]
                cell.width = widths[c_idx]
                set_cell_background(cell, bg)
                set_cell_margins(cell, 40, 40, 60, 60)
                set_cell_borders(cell, "CBD5E1")
                p = cell.paragraphs[0]
                r = p.add_run(attr[c_idx])
                r.font.name = "Calibri"
                r.font.size = Pt(8)
                if c_idx == 0:
                    r.font.bold = True
                    r.font.color.rgb = COLOR_BURGUNDY
                elif c_idx == 3 and attr[c_idx] in ["PK", "FK", "UNIQUE"]:
                    r.font.bold = True
                    r.font.color.rgb = COLOR_WINE
                else:
                    r.font.color.rgb = COLOR_TEXT

        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(6)

    doc.save(TARGET_DOCX)
    print(f"SUCCESS: {TARGET_DOCX} generado exitosamente.")

def build_mer_md():
    mermaid_code = """```mermaid
erDiagram
    MENCIONES ||--o{ SECCIONES : "agrupa (1:N)"
    MENCIONES ||--o{ ASIGNATURAS : "posee malla (1:N)"
    USUARIOS ||--o{ SECCIONES : "orienta como guia (1:N)"
    USUARIOS ||--o{ TEACHER_ASSIGNMENTS : "imparte (1:N)"
    SECCIONES ||--o{ TEACHER_ASSIGNMENTS : "contiene catedra (1:N)"
    SECCIONES ||--o{ ESTUDIANTES : "matricula (1:N)"
    ESTUDIANTES ||--o{ NOTAS : "obtiene notas (1:N)"
    SECCIONES ||--o{ NOTAS : "asienta en sabana (1:N)"
    PERIODOS ||--o{ NOTAS : "evalua en periodo (1:N)"
    USUARIOS ||--o{ EVALUACIONES_CONFIG : "disena plan 100% (1:N)"
    SECCIONES ||--o{ EVALUACIONES_CONFIG : "aplica a seccion (1:N)"
    PERIODOS ||--o{ EVALUACIONES_CONFIG : "rige en periodo (1:N)"
    ESTUDIANTES ||--o{ EVALUACIONES_NOTAS : "califica por actividad (1:N)"
    SECCIONES ||--o{ EVALUACIONES_NOTAS : "registra en aula (1:N)"
    PERIODOS ||--o{ EVALUACIONES_NOTAS : "vigente en periodo (1:N)"
    PERIODOS ||--o{ CALIFICACIONES_FINALES : "congela al cerrar ciclo (1:N)"
    ESTUDIANTES ||--o{ CALIFICACIONES_FINALES : "historial inmutable (1:N)"
    SECCIONES ||--o{ CALIFICACIONES_FINALES : "archivo formal (1:N)"

    USUARIOS {
        int id PK
        varchar cedula UK
        varchar nombre
        varchar apellido
        varchar email
        varchar telefono
        enum rol
        varchar password
        varchar tipo_docente
        tinyint solicitud_reset
        datetime reset_fecha
        tinyint activo "NUEVO: 1=Activo, 0=Inhabilitado"
    }

    ESTUDIANTES {
        int id PK
        varchar cedula UK
        varchar nombre "MAYUSCULAS"
        varchar apellido "MAYUSCULAS"
        varchar email
        varchar telefono
        int seccion_id FK
        tinyint activo "NUEVO: 1=Activo, 0=Inhabilitado"
    }

    MENCIONES {
        int id PK
        varchar nombre
        varchar color
        varchar icono
    }

    SECCIONES {
        int id PK
        varchar nombre
        int mencion_id FK
        int profesor_guia_id FK
        varchar profesor_guia_nombre
    }

    PERIODOS {
        int id PK
        varchar nombre
        date fecha_inicio
        date fecha_fin
        date fecha_mp1
        date fecha_mp2
        date fecha_mp3
        enum estado "activo | cerrado"
    }

    ASIGNATURAS {
        int id PK
        int mencion_id FK
        tinyint anio
        varchar nombre
        varchar area
    }

    TEACHER_ASSIGNMENTS {
        int id PK
        int teacher_id FK
        varchar materia_nombre
        int seccion_id FK
    }

    NOTAS {
        int id PK
        int estudiante_id FK
        int seccion_id FK
        varchar materia
        int periodo_id FK
        decimal mp1
        int inas1 "NUEVO: Inasistencias MP1"
        decimal mp2
        int inas2 "NUEVO: Inasistencias MP2"
        decimal mp3
        int inas3 "NUEVO: Inasistencias MP3"
        decimal definitiva
    }

    EVALUACIONES_CONFIG {
        int id PK
        int teacher_id FK
        int seccion_id FK
        varchar materia
        int periodo_id FK
        tinyint momento
        tinyint num_evaluaciones
        json porcentajes "Suma 100%"
        json nombres
    }

    EVALUACIONES_NOTAS {
        int id PK
        int estudiante_id FK
        int seccion_id FK
        varchar materia
        int periodo_id FK
        tinyint momento
        json notas_eval "Notas 0-20"
        decimal nota_momento
    }

    CALIFICACIONES_FINALES {
        int id PK
        int periodo_id FK
        int estudiante_id FK
        int seccion_id FK
        varchar materia
        decimal mp1
        decimal mp2
        decimal mp3
        decimal definitiva
        enum estado "Inmutable"
        datetime cerrado_en
    }
```"""

    md_lines = [
        "# 🗄️ Modelo Entidad-Relación (M-E/R) Actualizado – Sistema Escolar E.T.R. \"Alí Primera\"",
        "**Departamento de Control de Estudios y Sistemas**  ",
        "*Base de Datos: sistema_ali | Motor: MySQL 8.0 InnoDB | Charset: utf8mb4*",
        "",
        "> **Versión 2.5 Consolidada (Noviembre 2026):** Actualizado con las 11 entidades completas, diagrama Mermaid de interconexión, atributos `activo` (inhabilitación de alumnos y docentes), inasistencias `inas1-3`, evaluaciones al 100%, calculadora interactiva y actas inmutables.",
        "",
        "---",
        "",
        "## 1. Diagrama Entidad-Relación Global (11 Entidades)",
        "",
        mermaid_code,
        "",
        "---",
        "",
        "## 2. Matriz de Relaciones y Cardinalidades",
        "",
        "| Relación | Cardinalidad | Regla de Negocio / Integridad Referencial |",
        "| :--- | :---: | :--- |"
    ]

    for rel_name, card, rule in CARDINALITIES:
        md_lines.append(f"| **{rel_name}** | `{card}` | {rule} |")

    md_lines.extend([
        "",
        "---",
        "",
        "## 3. Especificación Formal de Entidades y Atributos",
        ""
    ])

    for e in ENTITIES:
        md_lines.append(f"### Entidad: `{e['name']}` *({e['tipo']})*")
        md_lines.append(f"{e['desc']}")
        md_lines.append("")
        md_lines.append("| Atributo | Tipo de Dato | Nulo | Clave | Dominio / Regla |")
        md_lines.append("| :--- | :--- | :---: | :---: | :--- |")
        for a in e['attrs']:
            md_lines.append(f"| `{a[0]}` | `{a[1]}` | {a[2]} | **{a[3]}** | {a[4]} |")
        md_lines.append("")
        md_lines.append("---")
        md_lines.append("")

    with open(TARGET_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"SUCCESS: {TARGET_MD} generado exitosamente.")

if __name__ == "__main__":
    build_mer_docx()
    build_mer_md()

