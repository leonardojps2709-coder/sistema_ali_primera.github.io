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

# Cargar metadatos de las pantallas
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

COLOR_BURGUNDY = RGBColor(0x4A, 0x15, 0x1B) # #4A151B
COLOR_WINE = RGBColor(0x7B, 0x1A, 0x1A)     # #7B1A1A
COLOR_TEXT = RGBColor(0x1E, 0x29, 0x3B)     # #1E293B
COLOR_MUTED = RGBColor(0x64, 0x74, 0x8B)    # #64748B
COLOR_STEP = RGBColor(0x0F, 0x17, 0x2A)     # #0F172A

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
    
    label = "💡 Consejo Práctico: " if tip_type == "TIP" else ("⚠️ Nota de Seguridad / Regla del Sistema: " if tip_type == "ALERT" else "📌 Información Importante: ")
    r_pre = p.add_run(label)
    r_pre.font.name = "Calibri"
    r_pre.font.size = Pt(9)
    r_pre.font.bold = True
    r_pre.font.color.rgb = prefix_col

    r_txt = p.add_run(text)
    r_txt.font.name = "Calibri"
    r_txt.font.size = Pt(9)
    r_txt.font.color.rgb = COLOR_TEXT

    # Spacer
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
    r_head = p_head.add_run(f"Pantalla de Referencia: {s['title']}")
    r_head.font.name = "Calibri"
    r_head.font.size = Pt(10.5)
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

print("Generador de manual paso a paso listo.")

