import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

BASE_DIR = r"c:\AppServ\www\Proyecto"
TARGET_DOCX = os.path.join(BASE_DIR, "Diccionario_de_Datos_Ali_Primera_Actualizado.docx")
TARGET_MD = os.path.join(BASE_DIR, "DICCIONARIO_DE_DATOS_ACTUALIZADO.md")

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

TABLES_DATA = [
    {
        "num": 1,
        "name": "usuarios",
        "desc": "Almacena las cuentas de acceso al sistema para los roles: Superadministrador (root), Administrador (Control de Estudios) y Docente / Profesor.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único secuencial del usuario"),
            ("cedula", "VARCHAR(20)", "NO", "UNIQUE", "Cédula de identidad con prefijo (ej. V-12345678, superadmin)"),
            ("nombre", "VARCHAR(100)", "NO", "—", "Primer nombre del usuario"),
            ("apellido", "VARCHAR(100)", "NO", "—", "Primer apellido del usuario"),
            ("email", "VARCHAR(100)", "SÍ", "INDEX", "Correo electrónico institucional o de contacto"),
            ("telefono", "VARCHAR(20)", "SÍ", "—", "Número telefónico del usuario"),
            ("rol", "ENUM('admin','teacher','superadmin')", "NO", "INDEX", "Rol jerárquico que define permisos en la plataforma"),
            ("password", "VARCHAR(255)", "NO", "—", "Contraseña del usuario para inicio de sesión seguro"),
            ("nivel_acceso", "VARCHAR(50)", "SÍ", "—", "Nivel de acceso complementario"),
            ("materias", "TEXT", "SÍ", "—", "Lista serializada de materias asignadas al docente"),
            ("secciones", "TEXT", "SÍ", "—", "Lista serializada de secciones asignadas al docente"),
            ("tipo_docente", "VARCHAR(30)", "SÍ", "—", "Subtipo: 'docente', 'docente_guia' o 'solo_guia'"),
            ("solicitud_reset", "TINYINT(1)", "SÍ", "—", "1 = Solicitó restablecimiento de clave al Superadmin; 0 = Normal"),
            ("reset_fecha", "DATETIME", "SÍ", "—", "Fecha y hora de la última solicitud de reseteo"),
            ("activo", "TINYINT(1)", "SÍ", "—", "NUEVO: 1 = Activo (acceso permitido); 0 = Inhabilitado (bloqueado)")
        ],
        "fk": "No posee claves foráneas directas. Es referenciada por secciones (profesor_guia_id), teacher_assignments (teacher_id) y evaluaciones_config (teacher_id)."
    },
    {
        "num": 2,
        "name": "estudiantes",
        "desc": "Padrón oficial de la matrícula escolar. Todos los nombres y apellidos se formatean en MAYÚSCULAS.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del estudiante"),
            ("cedula", "VARCHAR(20)", "NO", "UNIQUE", "Cédula de identidad con prefijo (ej. V-31072861)"),
            ("nombre", "VARCHAR(100)", "NO", "—", "Nombres del alumno — siempre en LETRAS MAYÚSCULAS"),
            ("apellido", "VARCHAR(100)", "NO", "INDEX", "Apellidos del alumno — siempre en LETRAS MAYÚSCULAS"),
            ("email", "VARCHAR(100)", "SÍ", "—", "Correo electrónico para notificaciones y boletines"),
            ("telefono", "VARCHAR(20)", "SÍ", "—", "Teléfono de contacto del alumno o representante"),
            ("seccion_id", "INT", "SÍ", "FK", "Sección a la que pertenece actualmente el estudiante"),
            ("activo", "TINYINT(1)", "SÍ", "INDEX", "NUEVO: 1 = Activo (matriculado regular); 0 = Inhabilitado (suspendido/retirado)")
        ],
        "fk": "seccion_id → secciones(id). Es referenciada por notas(estudiante_id), evaluaciones_notas(estudiante_id) y calificaciones_finales(estudiante_id)."
    },
    {
        "num": 3,
        "name": "secciones",
        "desc": "Estructura organizativa de aulas por año y especialidad técnica.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la sección"),
            ("nombre", "VARCHAR(50)", "NO", "—", "Nombre formal (ej. '1ro Año A', '4to Año B')"),
            ("mencion_id", "INT", "SÍ", "FK", "Mención técnica a la que pertenece la sección"),
            ("profesor_guia_id", "INT", "SÍ", "FK", "ID del docente asignado como tutor/guía de la sección"),
            ("profesor_guia_nombre", "VARCHAR(200)", "SÍ", "—", "NUEVO: Nombre desnormalizado del docente guía para renderizado rápido")
        ],
        "fk": "mencion_id → menciones(id); profesor_guia_id → usuarios(id)."
    },
    {
        "num": 4,
        "name": "periodos",
        "desc": "Control de los ciclos lectivos escolares y cronograma de momentos pedagógicos.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del ciclo escolar"),
            ("nombre", "VARCHAR(50)", "NO", "—", "Nombre formal del año escolar (ej. '2026-2027')"),
            ("fecha_inicio", "DATE", "SÍ", "—", "Fecha de inicio del año escolar"),
            ("fecha_fin", "DATE", "SÍ", "—", "Fecha de culminación del año escolar"),
            ("fecha_mp1", "DATE", "SÍ", "—", "Fecha límite para vaciado de notas del 1er Momento Pedagógico"),
            ("fecha_mp2", "DATE", "SÍ", "—", "Fecha límite para vaciado de notas del 2do Momento Pedagógico"),
            ("fecha_mp3", "DATE", "SÍ", "—", "Fecha límite para vaciado de notas del 3er Momento Pedagógico"),
            ("estado", "ENUM('activo','cerrado')", "SÍ", "—", "'activo' = Año en curso (único); 'cerrado' = Finalizado (notas congeladas)")
        ],
        "fk": "Referenciada por notas(periodo_id), evaluaciones_config(periodo_id), evaluaciones_notas(periodo_id) y calificaciones_finales(periodo_id)."
    },
    {
        "num": 5,
        "name": "menciones",
        "desc": "Catálogo de especialidades técnicas que imparte la Escuela Técnica Robinsoniana.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la mención"),
            ("nombre", "VARCHAR(100)", "NO", "—", "Nombre oficial (ej. 'Electricidad', 'Informática', 'Metalmecánica')"),
            ("color", "VARCHAR(30)", "SÍ", "—", "Código hexadecimal o clase CSS de color temático"),
            ("icono", "VARCHAR(50)", "SÍ", "—", "Icono temático de la especialidad (Boxicons)")
        ],
        "fk": "Referenciada por secciones(mencion_id) y asignaturas(mencion_id)."
    },
    {
        "num": 6,
        "name": "asignaturas",
        "desc": "Malla curricular institucional estructurada por mención y año formativo.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la asignatura"),
            ("mencion_id", "INT", "NO", "FK", "Mención técnica a la que corresponde la materia"),
            ("anio", "TINYINT(4)", "NO", "—", "Año formativo donde se cursa (1 a 6)"),
            ("nombre", "VARCHAR(150)", "NO", "—", "Nombre de la asignatura (ej. 'Matemática Técnica')"),
            ("area", "VARCHAR(50)", "SÍ", "—", "Área de formación: 'general' o 'tecnica'"),
            ("created_at", "TIMESTAMP", "SÍ", "—", "Fecha de registro en la malla curricular")
        ],
        "fk": "mencion_id → menciones(id)."
    },
    {
        "num": 7,
        "name": "notas",
        "desc": "Planilla oficial de calificaciones por momento (MP1, MP2, MP3) e inasistencias.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del registro de calificaciones"),
            ("estudiante_id", "INT", "SÍ", "FK", "Estudiante calificado"),
            ("seccion_id", "INT", "SÍ", "FK", "Sección donde cursa el estudiante"),
            ("materia", "VARCHAR(100)", "NO", "INDEX", "Nombre de la materia cursada"),
            ("periodo_id", "INT", "SÍ", "FK", "Ciclo escolar al que corresponde la nota"),
            ("mp1", "DECIMAL(4,2)", "SÍ", "—", "Calificación del 1er Momento Pedagógico (escala 0-20)"),
            ("inas1", "INT(11)", "SÍ", "—", "NUEVO: Total de inasistencias en el 1er Momento Pedagógico"),
            ("mp2", "DECIMAL(4,2)", "SÍ", "—", "Calificación del 2do Momento Pedagógico (escala 0-20)"),
            ("inas2", "INT(11)", "SÍ", "—", "NUEVO: Total de inasistencias en el 2do Momento Pedagógico"),
            ("mp3", "DECIMAL(4,2)", "SÍ", "—", "Calificación del 3er Momento Pedagógico (escala 0-20)"),
            ("inas3", "INT(11)", "SÍ", "—", "NUEVO: Total de inasistencias en el 3er Momento Pedagógico"),
            ("definitiva", "DECIMAL(4,2)", "SÍ", "—", "Promedio ponderado oficial de los tres momentos")
        ],
        "fk": "estudiante_id → estudiantes(id); seccion_id → secciones(id); periodo_id → periodos(id)."
    },
    {
        "num": 8,
        "name": "evaluaciones_config",
        "desc": "NUEVO: Planificación evaluativa diseñada por el docente al 100% (escala 20 pts).",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la configuración"),
            ("teacher_id", "INT", "NO", "FK", "Docente que diseñó y es titular del plan"),
            ("seccion_id", "INT", "NO", "FK", "Sección a la que aplica el plan"),
            ("materia", "VARCHAR(100)", "NO", "—", "Nombre de la asignatura"),
            ("periodo_id", "INT", "NO", "FK", "Período escolar en curso"),
            ("momento", "TINYINT(4)", "NO", "—", "Momento pedagógico configurado (1, 2 o 3)"),
            ("num_evaluaciones", "TINYINT(4)", "NO", "—", "Cantidad de evaluaciones planificadas (1 a 7)"),
            ("porcentajes", "JSON", "NO", "—", "Arreglo JSON con los porcentajes de cada actividad (ej. [25, 25, 50])"),
            ("nombres", "JSON", "SÍ", "—", "Arreglo JSON con los nombres descriptivos de las actividades"),
            ("updated_at", "TIMESTAMP", "SÍ", "—", "Última fecha y hora de actualización del plan")
        ],
        "fk": "teacher_id → usuarios(id); seccion_id → secciones(id); periodo_id → periodos(id)."
    },
    {
        "num": 9,
        "name": "evaluaciones_notas",
        "desc": "NUEVO: Calificaciones detalladas por actividad que alimentan la calculadora interactiva.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del vaciado evaluativo"),
            ("estudiante_id", "INT", "NO", "FK", "Estudiante evaluado"),
            ("seccion_id", "INT", "NO", "FK", "Sección a la que pertenece"),
            ("materia", "VARCHAR(100)", "NO", "—", "Nombre de la materia"),
            ("periodo_id", "INT", "NO", "FK", "Período escolar correspondiente"),
            ("momento", "TINYINT(4)", "NO", "—", "Momento pedagógico calificado (1, 2 o 3)"),
            ("notas_eval", "JSON", "NO", "—", "Arreglo JSON con las notas de cada actividad (0-20 pts)"),
            ("nota_momento", "DECIMAL(4,2)", "NO", "—", "Calificación ponderada resultante (0-20 pts)"),
            ("updated_at", "TIMESTAMP", "SÍ", "—", "Fecha y hora de cálculo y vaciado")
        ],
        "fk": "estudiante_id → estudiantes(id); seccion_id → secciones(id); periodo_id → periodos(id)."
    },
    {
        "num": 10,
        "name": "calificaciones_finales",
        "desc": "Actas inmutables congeladas tras la ejecución del protocolo 'Finalizar Año Escolar'.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único del acta final"),
            ("periodo_id", "INT", "NO", "FK", "Período escolar cerrado"),
            ("estudiante_id", "INT", "NO", "FK", "Estudiante promovido o evaluado"),
            ("seccion_id", "INT", "NO", "FK", "Sección donde cursó el período"),
            ("materia", "VARCHAR(100)", "NO", "—", "Nombre de la asignatura"),
            ("mp1", "DECIMAL(4,2)", "SÍ", "—", "Nota congelada del 1er Momento"),
            ("mp2", "DECIMAL(4,2)", "SÍ", "—", "Nota congelada del 2do Momento"),
            ("mp3", "DECIMAL(4,2)", "SÍ", "—", "Nota congelada del 3er Momento"),
            ("definitiva", "DECIMAL(4,2)", "SÍ", "—", "Calificación final congelada inalterable"),
            ("estado", "ENUM('aprobado','reprobado','sin_calificar')", "NO", "—", "Veredicto ministerial del estudiante en la materia"),
            ("cerrado_en", "DATETIME", "SÍ", "—", "Estampa de tiempo del cierre del período institucional")
        ],
        "fk": "periodo_id → periodos(id); estudiante_id → estudiantes(id); seccion_id → secciones(id)."
    },
    {
        "num": 11,
        "name": "teacher_assignments",
        "desc": "Tabla intermedia para la asignación N:M de profesores a materias y secciones.",
        "cols": [
            ("id", "INT AUTO_INCREMENT", "NO", "PK", "Identificador único de la asignación"),
            ("teacher_id", "INT", "SÍ", "FK", "Docente al que se le asigna la cátedra"),
            ("materia_nombre", "VARCHAR(100)", "SÍ", "—", "Nombre de la asignatura que imparte"),
            ("seccion_id", "INT", "SÍ", "FK", "Sección donde imparte clases")
        ],
        "fk": "teacher_id → usuarios(id); seccion_id → secciones(id)."
    }
]

def build_dict_docx():
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
    r_tit = p_tit.add_run("DICCIONARIO DE DATOS OFICIAL")
    r_tit.font.name = "Calibri"
    r_tit.font.size = Pt(18)
    r_tit.font.bold = True
    r_tit.font.color.rgb = COLOR_WINE

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("Arquitectura y Estructura Física de Base de Datos MySQL 8.0 (Motor InnoDB)\nActualizado con Módulo de Evaluaciones 100%, Inhabilitación de Estudiantes, Índices y Actas Inmutables")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(10)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_MUTED

    # Meta tabla
    t_meta = doc.add_table(rows=5, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_info = [
        ("Base de Datos:", "sistema_ali (Motor MySQL / MariaDB InnoDB)"),
        ("Charset / Collation:", "utf8mb4 / utf8mb4_unicode_ci"),
        ("Total de Tablas:", "11 Tablas Relacionales Documentadas"),
        ("Fecha de Emisión:", "Noviembre 2026 (Versión 2.5 Consolidada con Cambios Recientes)"),
        ("Novedades Incluidas:", "Columnas activo en usuarios y estudiantes, inasistencias inas1-3, evaluaciones y actas")
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

    # Título seccion
    p_sec = doc.add_paragraph()
    p_sec.paragraph_format.space_before = Pt(10)
    p_sec.paragraph_format.space_after = Pt(8)
    r_sec = p_sec.add_run("Catálogo Detallado de Tablas y Atributos")
    r_sec.font.name = "Calibri"
    r_sec.font.size = Pt(14)
    r_sec.font.bold = True
    r_sec.font.color.rgb = COLOR_BURGUNDY

    for t in TABLES_DATA:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(14)
        p_t.paragraph_format.space_after = Pt(2)
        p_t.paragraph_format.keep_with_next = True
        r_t = p_t.add_run(f"{t['num']}. Tabla: {t['name']}")
        r_t.font.name = "Calibri"
        r_t.font.size = Pt(12)
        r_t.font.bold = True
        r_t.font.color.rgb = COLOR_WINE

        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_before = Pt(0)
        p_desc.paragraph_format.space_after = Pt(6)
        p_desc.paragraph_format.keep_with_next = True
        r_desc = p_desc.add_run(t['desc'])
        r_desc.font.name = "Calibri"
        r_desc.font.size = Pt(9)
        r_desc.font.italic = True
        r_desc.font.color.rgb = COLOR_MUTED

        # Tabla de atributos
        tbl = doc.add_table(rows=len(t['cols']) + 1, cols=5)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        headers = ["Columna", "Tipo de Dato", "Nulos", "Clave", "Descripción"]
        
        # Header row
        h_row = tbl.rows[0]
        for c_idx, h_text in enumerate(headers):
            cell = h_row.cells[c_idx]
            set_cell_background(cell, "4A151B")
            set_cell_margins(cell, 60, 60, 80, 80)
            set_cell_borders(cell, "4A151B")
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(h_text)
            r.font.name = "Calibri"
            r.font.size = Pt(8.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        # Widths
        widths = [Inches(1.4), Inches(1.3), Inches(0.6), Inches(0.8), Inches(2.7)]

        for r_idx, col in enumerate(t['cols']):
            row = tbl.rows[r_idx + 1]
            bg = "F8FAFC" if r_idx % 2 == 0 else "FFFFFF"
            for c_idx in range(5):
                cell = row.cells[c_idx]
                cell.width = widths[c_idx]
                set_cell_background(cell, bg)
                set_cell_margins(cell, 50, 50, 70, 70)
                set_cell_borders(cell, "CBD5E1")
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(1)
                p.paragraph_format.space_after = Pt(1)
                r = p.add_run(col[c_idx])
                r.font.name = "Calibri"
                r.font.size = Pt(8)
                if c_idx == 0:
                    r.font.bold = True
                    r.font.color.rgb = COLOR_BURGUNDY
                elif c_idx == 3 and col[c_idx] in ["PK", "FK", "UNIQUE"]:
                    r.font.bold = True
                    r.font.color.rgb = COLOR_WINE
                else:
                    r.font.color.rgb = COLOR_TEXT

        # Relaciones
        p_rel = doc.add_paragraph()
        p_rel.paragraph_format.space_before = Pt(4)
        p_rel.paragraph_format.space_after = Pt(10)
        r_rel_lbl = p_rel.add_run("Relaciones / Llaves Foráneas: ")
        r_rel_lbl.font.name = "Calibri"
        r_rel_lbl.font.size = Pt(8.5)
        r_rel_lbl.font.bold = True
        r_rel_lbl.font.color.rgb = COLOR_BURGUNDY
        r_rel_val = p_rel.add_run(t['fk'])
        r_rel_val.font.name = "Calibri"
        r_rel_val.font.size = Pt(8.5)
        r_rel_val.font.color.rgb = COLOR_TEXT

    doc.save(TARGET_DOCX)
    print(f"SUCCESS: {TARGET_DOCX} generado exitosamente.")

def build_dict_md():
    lines = [
        "# 📑 Diccionario de Datos Oficial – Sistema Escolar E.T.R. \"Alí Primera\"",
        "**Departamento de Control de Estudios y Sistemas**  ",
        "*Base de Datos: sistema_ali | Motor: MySQL 8.0 InnoDB | Charset: utf8mb4*",
        "",
        "> **Versión 2.5 Consolidada (Noviembre 2026):** Actualizado con las columnas `activo` (inhabilitación de alumnos y docentes), inasistencias `inas1`, `inas2`, `inas3`, nuevas tablas de `evaluaciones_config`, `evaluaciones_notas`, actas inmutables `calificaciones_finales` e índices de optimización.",
        "",
        "---",
        "",
        "## 📋 Ficha Técnica de la Base de Datos",
        "| Parámetro | Detalle Físico |",
        "| :--- | :--- |",
        "| **Nombre de Base de Datos:** | `sistema_ali` |",
        "| **Motor de Almacenamiento:** | InnoDB (Transaccional, soporte de Foreign Keys e integridad referencial) |",
        "| **Codificación de Caracteres:** | `utf8mb4` / Collation: `utf8mb4_unicode_ci` |",
        "| **Total de Tablas:** | 11 Tablas Relacionales |",
        "| **Sistema de Respaldo:** | Volcados `.sql` automáticos mediante mysqldump desde la consola Superadmin |",
        "",
        "---",
        "",
        "## 🗂️ Índice de Tablas",
        "1. [`usuarios`](#1-tabla-usuarios) – Cuentas de acceso y credenciales del sistema.",
        "2. [`estudiantes`](#2-tabla-estudiantes) – Matrícula estudiantil con nombres forzados en mayúsculas.",
        "3. [`secciones`](#3-tabla-secciones) – Aulas organizadas por año formativo y mención.",
        "4. [`periodos`](#4-tabla-periodos) – Ciclos escolares y cronograma de momentos pedagógicos.",
        "5. [`menciones`](#5-tabla-menciones) – Especialidades técnicas institucionales.",
        "6. [`asignaturas`](#6-tabla-asignaturas) – Malla curricular por año y mención técnica.",
        "7. [`notas`](#7-tabla-notas) – Calificaciones por momento e inasistencias acumuladas.",
        "8. [`evaluaciones_config`](#8-tabla-evaluaciones_config) – Planes de evaluación al 100% (20 pts).",
        "9. [`evaluaciones_notas`](#9-tabla-evaluaciones_notas) – Calificaciones detalladas por actividad (calculadora).",
        "10. [`calificaciones_finales`](#10-tabla-calificaciones_finales) – Actas inmutables congeladas al cerrar el año escolar.",
        "11. [`teacher_assignments`](#11-tabla-teacher_assignments) – Asignaciones N:M de profesores a materias y secciones.",
        "",
        "---",
        ""
    ]

    for t in TABLES_DATA:
        lines.append(f"### {t['num']}. Tabla: `{t['name']}`")
        lines.append(f"*{t['desc']}*")
        lines.append("")
        lines.append("| Columna | Tipo de Dato | Nulos | Clave | Descripción |")
        lines.append("| :--- | :--- | :---: | :---: | :--- |")
        for col in t['cols']:
            lines.append(f"| `{col[0]}` | `{col[1]}` | {col[2]} | **{col[3]}** | {col[4]} |")
        lines.append("")
        lines.append(f"**Relaciones:** {t['fk']}")
        lines.append("")
        lines.append("---")
        lines.append("")

    with open(TARGET_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"SUCCESS: {TARGET_MD} generado exitosamente.")

if __name__ == "__main__":
    build_dict_docx()
    build_dict_md()

