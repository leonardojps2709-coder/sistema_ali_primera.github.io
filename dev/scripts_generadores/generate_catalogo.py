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
OUTPUT_DIR = os.path.join(BASE_DIR, "catalogo_capturas")
CAPTURES_DIR = os.path.join(OUTPUT_DIR, "capturas")
DOCX_PATH = os.path.join(OUTPUT_DIR, "Catalogo_Capturas_Pantallas_Sistema_Escolar.docx")
MD_PATH = os.path.join(OUTPUT_DIR, "Catalogo_Capturas_Pantallas_Sistema_Escolar.md")
HTML_PATH = os.path.join(OUTPUT_DIR, "Catalogo_Capturas_Pantallas_Sistema_Escolar.html")

# Colores institucionales
COLOR_BURGUNDY = RGBColor(0x4A, 0x15, 0x1B) # Granate profundo institucional
COLOR_WINE = RGBColor(0x7B, 0x1A, 0x1A)     # Vinotinto / Borgoña
COLOR_TEXT = RGBColor(0x1E, 0x29, 0x3B)     # Gris carbón lectura
COLOR_MUTED = RGBColor(0x64, 0x74, 0x8B)    # Gris secundario

# Cargar datos de pantallas
with open(os.path.join(BASE_DIR, "scratch", "screens_dump.json"), "r", encoding="utf-8") as f:
    screens_data = json.load(f)

# Mapeo exacto de las 36 imágenes
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

# Modulos
MODULES = [
    {
        "id": 1,
        "title": "1. MÓDULO PÚBLICO Y CONTROL DE AUTENTICACIÓN",
        "desc": "Comprende los puntos de acceso institucional al sistema, la selección de entorno por tipo de usuario, la validación segura de credenciales y el canal de solicitud asistida para recuperación de contraseñas.",
        "range": (1, 4)
    },
    {
        "id": 2,
        "title": "2. PERFIL: SUPER ADMINISTRADOR",
        "desc": "Consola raíz con privilegios superiores para la gestión integral de cuentas de administradores, auditoría docente con bloqueo y reseteo de claves, supervisión sincronizada de estudiantes y panel de mantenimiento físico de la base de datos MySQL (copias de seguridad .SQL, diagnóstico e indexado InnoDB).",
        "range": (5, 11)
    },
    {
        "id": 3,
        "title": "3. PERFIL: ADMINISTRADOR (CONTROL DE ESTUDIOS)",
        "desc": "Núcleo funcional institucional. Permite la matrícula escolar con nombres en mayúsculas, gestión de profesores con credenciales asignadas, administración de secciones, asignaturas, menciones, registro y consolidación de calificaciones, y cierre de año escolar con actas protegidas.",
        "range": (12, 27)
    },
    {
        "id": 4,
        "title": "4. PERFIL: DOCENTE / PROFESOR",
        "desc": "Ámbito operativo del personal docente. Permite consultar las secciones y nóminas asignadas, planificar evaluaciones al 100% sobre la escala ministerial de 20 puntos, cargar notas con calculadora interactiva por momento y generar boletines de rendimiento.",
        "range": (28, 36)
    }
]

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_borders(cell, border_color="E2E8F0"):
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

def generate_docx():
    doc = docx.Document()
    
    # Configurar márgenes de página (2.0 cm)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # 1. ENCABEZADO INSTITUCIONAL
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(0)
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

    # 2. TÍTULO PRINCIPAL
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(14)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("CATÁLOGO VISUAL DE PANTALLAS DEL SISTEMA")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(16)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_WINE

    # Subtítulo
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("Documentación Gráfica y Funcional Estructurada por Perfiles de Usuario")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_MUTED

    # 3. TABLA DE METADATOS DEL DOCUMENTO
    t_meta = doc.add_table(rows=5, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_info = [
        ("Institución:", "Escuela Técnica Robinsoniana y Zamorana \"Alí Primera\""),
        ("Entorno Técnico:", "Apache 2.4 / PHP 7-8 / MySQL 8.0 (Motor InnoDB) / JavaScript Vanilla"),
        ("Perfiles Documentados:", "Superadministrador, Administrador (Control de Estudios) y Profesor / Docente"),
        ("Total de Pantallas:", "36 Pantallas y Modales de Interfaz Interactiva Documentados"),
        ("Estructura de Ficha:", "Título + Tabla de 4 Parámetros + Captura de Pantalla + Acciones Permitidas")
    ]
    for row_idx, (lbl, val) in enumerate(meta_info):
        row = t_meta.rows[row_idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.0)
        c1.width = Inches(4.8)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, 80, 80, 120, 120)
        set_cell_margins(c1, 80, 80, 120, 120)
        set_cell_borders(c0, "CBD5E1")
        set_cell_borders(c1, "CBD5E1")

        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(2)
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(lbl)
        r0.font.name = "Calibri"
        r0.font.size = Pt(8.5)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_BURGUNDY

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(val)
        r1.font.name = "Calibri"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_TEXT

    # Salto de página antes de los módulos
    doc.add_page_break()

    # 4. ITERAR POR CADA MÓDULO Y GENERAR CADA FICHA
    for mod in MODULES:
        # Encabezado del Módulo
        p_mod = doc.add_paragraph()
        p_mod.paragraph_format.space_before = Pt(16)
        p_mod.paragraph_format.space_after = Pt(4)
        p_mod.paragraph_format.keep_with_next = True
        r_mod = p_mod.add_run(mod["title"])
        r_mod.font.name = "Calibri"
        r_mod.font.size = Pt(13)
        r_mod.font.bold = True
        r_mod.font.color.rgb = COLOR_BURGUNDY

        p_mdesc = doc.add_paragraph()
        p_mdesc.paragraph_format.space_before = Pt(0)
        p_mdesc.paragraph_format.space_after = Pt(12)
        p_mdesc.paragraph_format.keep_with_next = True
        r_mdesc = p_mdesc.add_run(mod["desc"])
        r_mdesc.font.name = "Calibri"
        r_mdesc.font.size = Pt(9.5)
        r_mdesc.font.color.rgb = COLOR_MUTED

        start_idx, end_idx = mod["range"]
        for s_idx in range(start_idx, end_idx + 1):
            s = screens_data[s_idx - 1]
            img_filename = IMAGE_MAP[s_idx]
            img_path = os.path.join(CAPTURES_DIR, img_filename)

            # 4.1 Título de la Pantalla
            p_head = doc.add_paragraph()
            p_head.paragraph_format.space_before = Pt(14)
            p_head.paragraph_format.space_after = Pt(4)
            p_head.paragraph_format.keep_with_next = True
            r_head = p_head.add_run(s["title"])
            r_head.font.name = "Calibri"
            r_head.font.size = Pt(11.5)
            r_head.font.bold = True
            r_head.font.color.rgb = COLOR_WINE

            # 4.2 Tabla de Metadatos (4 Filas exactas como en la imagen)
            tbl = doc.add_table(rows=4, cols=2)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            labels = ["Perfil Autorizado:", "Ruta / Navegación:", "Propósito Funcional:", "Componentes Clave:"]
            values = [
                s.get("perfil", ""),
                s.get("ruta", ""),
                s.get("proposito", ""),
                s.get("componentes", "")
            ]

            for row_idx in range(4):
                row = tbl.rows[row_idx]
                c0, c1 = row.cells[0], row.cells[1]
                c0.width = Inches(1.8)
                c1.width = Inches(5.0)
                set_cell_background(c0, "F8FAFC")
                set_cell_background(c1, "FFFFFF")
                set_cell_margins(c0, 80, 80, 120, 120)
                set_cell_margins(c1, 80, 80, 120, 120)
                set_cell_borders(c0, "CBD5E1")
                set_cell_borders(c1, "CBD5E1")

                p0 = c0.paragraphs[0]
                p0.paragraph_format.space_before = Pt(2)
                p0.paragraph_format.space_after = Pt(2)
                r0 = p0.add_run(labels[row_idx])
                r0.font.name = "Calibri"
                r0.font.size = Pt(8.5)
                r0.font.bold = True
                r0.font.color.rgb = COLOR_BURGUNDY

                p1 = c1.paragraphs[0]
                p1.paragraph_format.space_before = Pt(2)
                p1.paragraph_format.space_after = Pt(2)
                r1 = p1.add_run(values[row_idx])
                r1.font.name = "Calibri"
                r1.font.size = Pt(8.5)
                r1.font.color.rgb = COLOR_TEXT

            # 4.3 Captura de Pantalla Centrada
            p_img = doc.add_paragraph()
            p_img.paragraph_format.space_before = Pt(6)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.keep_with_next = True
            r_img = p_img.add_run()
            if os.path.exists(img_path):
                r_img.add_picture(img_path, width=Inches(5.9))
            else:
                r_img.add_text(f"[Imagen no encontrada: {img_filename}]")

            # 4.4 Acciones Permitidas
            p_act = doc.add_paragraph()
            p_act.paragraph_format.space_before = Pt(2)
            p_act.paragraph_format.space_after = Pt(14)
            r_act_lbl = p_act.add_run("Acciones Permitidas: ")
            r_act_lbl.font.name = "Calibri"
            r_act_lbl.font.size = Pt(9)
            r_act_lbl.font.bold = True
            r_act_lbl.font.color.rgb = COLOR_BURGUNDY

            r_act_val = p_act.add_run(s.get("actions", ""))
            r_act_val.font.name = "Calibri"
            r_act_val.font.size = Pt(9)
            r_act_val.font.color.rgb = COLOR_TEXT

    doc.save(DOCX_PATH)
    print(f"SUCCESS: DOCX generado en {DOCX_PATH}")

def generate_markdown():
    lines = [
        "# 📷 Catálogo Visual de Pantallas del Sistema Escolar",
        "## E.T.R.Z. \"Alí Primera\" – Departamento de Control de Estudios y Sistemas",
        "",
        "> **Documentación Gráfica y Funcional Integral por Perfiles de Usuario**  ",
        "> Versión: 2.5 Actualizada con Mantenimiento MySQL, Evaluaciones 100% y Filtros Sincronizados.",
        "",
        "---",
        "",
        "### 📋 Ficha Técnica General",
        "| Parámetro | Detalle Institucional |",
        "| :--- | :--- |",
        "| **Institución:** | Escuela Técnica Robinsoniana y Zamorana \"Alí Primera\" |",
        "| **Entorno Técnico:** | Apache 2.4 / PHP 7-8 / MySQL 8.0 (Motor InnoDB) / JS Vanilla |",
        "| **Perfiles Documentados:** | Superadministrador, Administrador (Control de Estudios) y Docente / Profesor |",
        "| **Total de Pantallas:** | 36 Pantallas y Modales de Interfaz Interactiva |",
        "| **Estructura por Ficha:** | Título + Tabla de 4 Parámetros + Captura + Acciones Permitidas |",
        "",
        "---",
        ""
    ]

    for mod in MODULES:
        lines.append(f"## {mod['title']}")
        lines.append(f"*{mod['desc']}*")
        lines.append("")

        start_idx, end_idx = mod["range"]
        for s_idx in range(start_idx, end_idx + 1):
            s = screens_data[s_idx - 1]
            img_filename = IMAGE_MAP[s_idx]

            lines.append(f"### {s['title']}")
            lines.append("")
            lines.append("| Parámetro | Detalle |")
            lines.append("| :--- | :--- |")
            lines.append(f"| **Perfil Autorizado:** | {s.get('perfil', '')} |")
            lines.append(f"| **Ruta / Navegación:** | `{s.get('ruta', '')}` |")
            lines.append(f"| **Propósito Funcional:** | {s.get('proposito', '')} |")
            lines.append(f"| **Componentes Clave:** | {s.get('componentes', '')} |")
            lines.append("")
            lines.append(f"![{s['title']}](capturas/{img_filename})")
            lines.append("")
            lines.append(f"**Acciones Permitidas:** {s.get('actions', '')}")
            lines.append("")
            lines.append("---")
            lines.append("")

    with open(MD_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"SUCCESS: Markdown generado en {MD_PATH}")

def generate_html():
    html_cards = []
    nav_links = []

    for mod in MODULES:
        nav_links.append(f"<div class='nav-module-title'>{mod['title']}</div>")
        start_idx, end_idx = mod["range"]
        
        module_cards = []
        for s_idx in range(start_idx, end_idx + 1):
            s = screens_data[s_idx - 1]
            img_filename = IMAGE_MAP[s_idx]
            sid = f"pantalla-{s_idx}"
            
            nav_links.append(f"<a class='nav-link' href='#{sid}'>{s['title']}</a>")

            module_cards.append(f"""
            <article class="screen-card" id="{sid}">
                <div class="screen-header">
                    <span class="screen-badge">Pantalla {s_idx} de 36</span>
                    <h3>{s['title']}</h3>
                </div>
                
                <table class="meta-table">
                    <tbody>
                        <tr>
                            <td class="col-label">Perfil Autorizado:</td>
                            <td class="col-val"><strong>{s.get('perfil', '')}</strong></td>
                        </tr>
                        <tr>
                            <td class="col-label">Ruta / Navegación:</td>
                            <td class="col-val"><code>{s.get('ruta', '')}</code></td>
                        </tr>
                        <tr>
                            <td class="col-label">Propósito Funcional:</td>
                            <td class="col-val">{s.get('proposito', '')}</td>
                        </tr>
                        <tr>
                            <td class="col-label">Componentes Clave:</td>
                            <td class="col-val">{s.get('componentes', '')}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="img-container">
                    <img src="capturas/{img_filename}" alt="{s['title']}" loading="lazy" />
                </div>
                
                <div class="actions-box">
                    <span class="actions-label">Acciones Permitidas:</span>
                    <span class="actions-text">{s.get('actions', '')}</span>
                </div>
            </article>
            """)

        html_cards.append(f"""
        <section class="module-section">
            <div class="module-header">
                <h2>{mod['title']}</h2>
                <p>{mod['desc']}</p>
            </div>
            {"".join(module_cards)}
        </section>
        """)

    full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo Visual de Pantallas – Sistema Escolar Alí Primera</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --burgundy: #4A151B;
            --wine: #7B1A1A;
            --wine-light: #991b1b;
            --slate-bg: #f8fafc;
            --border: #e2e8f0;
            --text-main: #1e293b;
            --text-muted: #64748b;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f1f5f9;
            color: var(--text-main);
            display: flex;
            min-height: 100vh;
        }}
        aside.sidebar {{
            width: 320px;
            background: #ffffff;
            border-right: 1px solid var(--border);
            height: 100vh;
            position: sticky;
            top: 0;
            overflow-y: auto;
            padding: 24px 16px;
            flex-shrink: 0;
        }}
        .brand {{
            font-size: 13px;
            font-weight: 700;
            color: var(--burgundy);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }}
        .brand-sub {{
            font-size: 11px;
            color: var(--text-muted);
            margin-bottom: 16px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 12px;
        }}
        .search-box {{
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border);
            border-radius: 6px;
            font-size: 13px;
            margin-bottom: 16px;
            outline: none;
        }}
        .search-box:focus {{ border-color: var(--wine); }}
        .nav-module-title {{
            font-size: 11px;
            font-weight: 700;
            color: var(--wine);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 16px 0 6px 0;
            padding-left: 6px;
        }}
        .nav-link {{
            display: block;
            font-size: 12px;
            color: #475569;
            text-decoration: none;
            padding: 6px 8px;
            border-radius: 4px;
            line-height: 1.4;
            transition: all 0.15s;
        }}
        .nav-link:hover {{
            background: #fef2f2;
            color: var(--wine);
        }}
        main.content {{
            flex: 1;
            padding: 40px;
            max-width: 1050px;
            margin: 0 auto;
        }}
        .doc-header {{
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 32px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            text-align: center;
        }}
        .doc-header h1 {{
            color: var(--burgundy);
            font-size: 24px;
            margin-bottom: 8px;
        }}
        .doc-header p {{
            color: var(--text-muted);
            font-size: 14px;
        }}
        .module-section {{
            margin-bottom: 40px;
        }}
        .module-header {{
            background: #ffffff;
            border-left: 5px solid var(--burgundy);
            padding: 16px 20px;
            border-radius: 6px;
            margin-bottom: 24px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }}
        .module-header h2 {{
            color: var(--burgundy);
            font-size: 17px;
            margin-bottom: 4px;
        }}
        .module-header p {{
            color: var(--text-muted);
            font-size: 13px;
        }}
        .screen-card {{
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 24px;
            margin-bottom: 28px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03);
            scroll-margin-top: 24px;
        }}
        .screen-header {{
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }}
        .screen-badge {{
            background: #fef2f2;
            color: var(--wine);
            border: 1px solid #fecaca;
            font-size: 11px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 12px;
        }}
        .screen-header h3 {{
            color: var(--wine);
            font-size: 16px;
            font-weight: 700;
        }}
        .meta-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 16px;
            border: 1px solid var(--border);
            border-radius: 6px;
            overflow: hidden;
        }}
        .meta-table td {{
            padding: 8px 12px;
            border: 1px solid var(--border);
            line-height: 1.5;
        }}
        .meta-table td.col-label {{
            width: 25%;
            background: var(--slate-bg);
            font-weight: 700;
            color: var(--burgundy);
            font-size: 12px;
        }}
        .meta-table td.col-val code {{
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            color: #0f172a;
        }}
        .img-container {{
            text-align: center;
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
        }}
        .img-container img {{
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            display: inline-block;
        }}
        .actions-box {{
            background: #fafaf9;
            border: 1px solid #e7e5e4;
            border-left: 4px solid var(--burgundy);
            padding: 10px 14px;
            border-radius: 4px;
            font-size: 13px;
            line-height: 1.5;
        }}
        .actions-label {{
            font-weight: 700;
            color: var(--burgundy);
            margin-right: 6px;
        }}
        .actions-text {{
            color: var(--text-main);
        }}
        @media print {{
            aside.sidebar {{ display: none; }}
            body {{ background: #fff; }}
            main.content {{ max-width: 100%; padding: 0; margin: 0; }}
            .screen-card {{ break-inside: avoid; border: 1px solid #ccc; box-shadow: none; }}
        }}
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="brand">E.T.R.Z. "Alí Primera"</div>
        <div class="brand-sub">Catálogo de Pantallas v2.5</div>
        <input type="text" class="search-box" id="searchBox" placeholder="Filtrar pantallas..." oninput="filterScreens()" />
        <nav>
            {"".join(nav_links)}
        </nav>
    </aside>

    <main class="content">
        <div class="doc-header">
            <h1>Catálogo Visual de Pantallas del Sistema Escolar</h1>
            <p>Escuela Técnica Robinsoniana y Zamorana "Alí Primera" – Departamento de Control de Estudios y Sistemas</p>
            <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">Documentación Gráfica Oficial: 36 Pantallas y Formularios con Tabla de Metadatos y Acciones Permitidas</p>
        </div>

        {"".join(html_cards)}
    </main>

    <script>
        function filterScreens() {{
            const val = document.getElementById('searchBox').value.toLowerCase();
            const cards = document.querySelectorAll('.screen-card');
            cards.forEach(card => {{
                const txt = card.innerText.toLowerCase();
                card.style.display = txt.includes(val) ? 'block' : 'none';
            }});
        }}
    </script>
</body>
</html>
"""
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"SUCCESS: HTML generado en {HTML_PATH}")

if __name__ == "__main__":
    generate_docx()
    generate_markdown()
    generate_html()

