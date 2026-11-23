import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

TARGET_DOCX = r"c:\AppServ\www\Proyecto\Capturas_Pantallas_Sistema_Escolar_Actualizado.docx"
BACKUP_DOCX = r"c:\AppServ\www\Proyecto\Capturas_Pantallas_Sistema_Escolar_Actualizado.bak.docx"
FALLBACK_DOCX = r"c:\AppServ\www\Proyecto\Capturas_Pantallas_Sistema_Escolar.docx"
IMG_DIR = r"c:\AppServ\www\Proyecto\capturas_sistema"

COLOR_BURGUNDY = RGBColor(0x4A, 0x15, 0x1B)
COLOR_WINE = RGBColor(0x7B, 0x1A, 0x1A)
COLOR_TEXT = RGBColor(0x1E, 0x29, 0x3B)
COLOR_MUTED = RGBColor(0x6C, 0x75, 0x7D)

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

def create_metadata_table(doc, metadata):
    tbl = doc.add_table(rows=4, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

    labels = ["Perfil Autorizado:", "Ruta / Navegación:", "Propósito Funcional:", "Componentes Clave:"]
    values = [
        metadata.get("perfil", ""),
        metadata.get("ruta", ""),
        metadata.get("proposito", ""),
        metadata.get("componentes", "")
    ]

    for row_idx in range(4):
        row = tbl.rows[row_idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(1.8)
        c1.width = Inches(4.7)

        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0)
        set_cell_margins(c1)
        set_cell_borders(c0)
        set_cell_borders(c1)

        # c0 text
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(2)
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(labels[row_idx])
        r0.font.name = "Calibri"
        r0.font.size = Pt(8.5)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_BURGUNDY

        # c1 text
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(values[row_idx])
        r1.font.name = "Calibri"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_TEXT

    return tbl

def build_screen_elements(doc, target_p, num_title, metadata, img_filename, caption, actions_desc):
    # 1. Heading
    p_head = doc.add_paragraph()
    p_head.paragraph_format.space_before = Pt(14)
    p_head.paragraph_format.space_after = Pt(4)
    p_head.paragraph_format.keep_with_next = True
    r_head = p_head.add_run(num_title)
    r_head.font.name = "Calibri"
    r_head.font.size = Pt(12)
    r_head.font.bold = True
    r_head.font.color.rgb = COLOR_WINE

    # 2. Metadata Table
    tbl = create_metadata_table(doc, metadata)

    # 3. Image
    p_img = doc.add_paragraph()
    p_img.paragraph_format.space_before = Pt(6)
    p_img.paragraph_format.space_after = Pt(2)
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.keep_with_next = True
    run_img = p_img.add_run()
    img_path = os.path.join(IMG_DIR, img_filename)
    if os.path.exists(img_path):
        run_img.add_picture(img_path, width=Inches(5.9))
    else:
        run_img.add_text(f"[Imagen no encontrada: {img_filename}]")

    # 4. Caption
    p_cap = doc.add_paragraph()
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(4)
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.keep_with_next = True
    r_cap = p_cap.add_run(f"Figura: {caption}")
    r_cap.font.name = "Calibri"
    r_cap.font.size = Pt(8.5)
    r_cap.font.italic = True
    r_cap.font.color.rgb = COLOR_MUTED

    # 5. Actions
    p_act = doc.add_paragraph()
    p_act.paragraph_format.space_before = Pt(2)
    p_act.paragraph_format.space_after = Pt(10)
    r_act_lbl = p_act.add_run("Acciones Permitidas: ")
    r_act_lbl.font.name = "Calibri"
    r_act_lbl.font.size = Pt(9)
    r_act_lbl.font.bold = True
    r_act_lbl.font.color.rgb = COLOR_BURGUNDY

    r_act_val = p_act.add_run(actions_desc)
    r_act_val.font.name = "Calibri"
    r_act_val.font.size = Pt(9)
    r_act_val.font.color.rgb = COLOR_TEXT

    # Spacer
    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(0)
    p_space.paragraph_format.space_after = Pt(4)

    # Move elements before target_p
    target_p._p.addprevious(p_head._p)
    target_p._p.addprevious(tbl._tbl)
    target_p._p.addprevious(p_img._p)
    target_p._p.addprevious(p_cap._p)
    target_p._p.addprevious(p_act._p)
    target_p._p.addprevious(p_space._p)

def update_capturas_document():
    # Make backup copy
    if not os.path.exists(BACKUP_DOCX):
        shutil.copy2(TARGET_DOCX, BACKUP_DOCX)
        print(f"Backup creado: {BACKUP_DOCX}")

    doc = docx.Document(TARGET_DOCX)

    # 1. Actualizar portada
    for p in doc.paragraphs[:10]:
        if "Actualizado con los nuevos módulos" in p.text:
            p.text = (
                "Actualizado con los nuevos módulos de Evaluaciones 100% (Escala 20 pts), "
                "Vaciado de Calificaciones con Calculadora, Gestión de Contraseñas Docentes, "
                "Cierre de Período Escolar y Consola de Superadministrador (Mantenimiento, "
                "Respaldos SQL, Indexado y Filtros Sincronizados de Estudiantes)"
            )
            for r in p.runs:
                r.font.name = "Calibri"
                r.font.size = Pt(10)
                r.font.italic = True
                r.font.color.rgb = COLOR_WINE

        if "El presente documento recopila de manera gráfica" in p.text:
            p.text = (
                "El presente documento recopila de manera gráfica y estructurada la totalidad "
                "de las 36 pantallas, formularios y modales interactivos que componen el "
                "Sistema Escolar de la E.T.R. \"Alí Primera\". Las capturas han sido tomadas "
                "en alta resolución y clasificadas conforme a los perfiles de usuario y roles "
                "de acceso del sistema: Acceso Público / Autenticación, Superadministrador, "
                "Administrador (Control de Estudios) y Profesor (Docente).\n\n"
                "Para cada pantalla se detalla el perfil de acceso requerido, la ruta o selector "
                "de navegación, el propósito funcional y los elementos interactivos disponibles para el usuario."
            )

    # 2. Actualizar Tabla 0 (Ficha técnica)
    if len(doc.tables) > 0:
        t0 = doc.tables[0]
        for row in t0.rows:
            if "Total de Pantallas Documentadas:" in row.cells[0].text:
                row.cells[1].text = "36 Pantallas y Modales de Interfaz Interactiva"
            if "Fecha de Actualización:" in row.cells[0].text:
                row.cells[1].text = "Noviembre 2026 (Versión 2.5 Consolidada con Mantenimiento y Filtros)"

    # 3. Actualizar Tabla 1 (Perfiles)
    if len(doc.tables) > 1:
        t1 = doc.tables[1]
        for row in t1.rows:
            if "Superadministrador" in row.cells[0].text:
                row.cells[2].text = (
                    "Gestión de cuentas de administradores, auditoría docente con "
                    "inhabilitación/reseteo, filtros estructurados de estudiantes y consola "
                    "de mantenimiento de base de datos (respaldos .SQL e indexado InnoDB)."
                )

    # 4. Actualizar imagen en pantalla 2.1 (media/image5.png - rId13)
    p05_path = os.path.join(IMG_DIR, "05_superadmin_dashboard.png")
    if os.path.exists(p05_path) and 'rId13' in doc.part.rels:
        try:
            with open(p05_path, "rb") as f:
                doc.part.rels['rId13'].target_part._blob = f.read()
            print("Imagen 2.1 (05_superadmin_dashboard.png) actualizada con éxito en el docx.")
        except Exception as e:
            print(f"Aviso actualizando imagen rId13: {e}")

    # 5. Encontrar párrafo de inicio de Sección 3
    target_p = None
    for p in doc.paragraphs:
        if "3. PERFIL: ADMINISTRADOR (CONTROL DE ESTUDIOS)" in p.text:
            target_p = p
            break

    if not target_p:
        raise Exception("No se encontró el encabezado de Sección 3 para insertar las nuevas pantallas.")

    # 6. Insertar las 5 nuevas pantallas en Sección 2
    new_screens = [
        {
            "num_title": "2.3. Control y Acciones Unificadas del Personal Docente",
            "metadata": {
                "perfil": "Super Administrador",
                "ruta": "Menú lateral → Pestaña 'Profesores'",
                "proposito": "Auditoría global del cuerpo docente, control de acceso mediante inhabilitación o reactivación inmediata de cuentas, y reseteo directo de credenciales de seguridad.",
                "componentes": "Buscador en vivo, insignias de estado (Activo/Inhabilitado) y tipo de docente (Docente, Solo Guía, Docente y Guía), botones unificados de acción: Bloqueo de Acceso (ámbar), Habilitación (verde), Cambio Directo de Clave (azul) y Eliminación Permanente (rojo)."
            },
            "img": "32_superadmin_docentes_acciones.png",
            "caption": "Nómina de Profesores con Acciones Unificadas de Estado, Contraseña y Eliminación",
            "actions": "Inhabilitar docentes temporalmente para impedir su ingreso a la plataforma, restablecer contraseñas de emergencia y eliminar docentes permanentemente del sistema con confirmación."
        },
        {
            "num_title": "2.4. Control, Búsqueda y Filtros de Estudiantes",
            "metadata": {
                "perfil": "Super Administrador",
                "ruta": "Menú lateral → Pestaña 'Estudiantes'",
                "proposito": "Supervisión de la matrícula escolar clasificada por especialidades técnicas y secciones, sincronizada en tiempo real con las promociones académicas y cambios de curso.",
                "componentes": "Barra de filtros avanzados con selector de Mención y Sección dinámico, buscador por nombre o cédula, contador de matrícula ('Mostrando X de Y estudiantes'), botón de sincronización forzada en vivo y tabla de estudiantes con badges de mención y sección."
            },
            "img": "33_superadmin_estudiantes_filtros.png",
            "caption": "Padrón de Estudiantes con Filtros de Mención, Sección y Sincronización en Vivo",
            "actions": "Filtrar la nómina institucional por especialidad técnica, seleccionar secciones específicas, buscar estudiantes en tiempo real, sincronizar datos con un clic y eliminar expedientes con diálogo modal protegido."
        },
        {
            "num_title": "2.5. Panel de Mantenimiento y Base de Datos (Métricas y Respaldos SQL)",
            "metadata": {
                "perfil": "Super Administrador (Acceso Root / Exclusivo)",
                "ruta": "Menú lateral → Pestaña 'Base de Datos'",
                "proposito": "Monitoreo del estado físico del almacenamiento en MySQL/MariaDB, creación de copias de seguridad completas (.sql) y gestión del histórico de respaldos del plantel.",
                "componentes": "Tarjetas métricas superiores con bordes temáticos (Nombre y versión de motor MySQL, conteo de tablas y registros, tamaño físico en MB de datos e índices, total de copias almacenadas), botones 'Crear Respaldo Ahora' y 'Optimizar e Indexar Tablas', y tabla de respaldos con tamaño, fecha y botones de acción rápida."
            },
            "img": "34_superadmin_base_datos_metricas.png",
            "caption": "Consola de Mantenimiento de Base de Datos, Métricas de Almacenamiento y Respaldos SQL",
            "actions": "Generar respaldos .sql al instante mediante mysqldump institucional, descargar archivos de volcado a la computadora local, restaurar copias previas y eliminar respaldos obsoletos."
        },
        {
            "num_title": "2.6. Diagnóstico en Vivo, Reindexado y Desfragmentación InnoDB",
            "metadata": {
                "perfil": "Super Administrador",
                "ruta": "Pestaña 'Base de Datos' → Botón 'Optimizar e Indexar Tablas'",
                "proposito": "Mantenimiento preventivo y correctivo del motor de base de datos, desfragmentación de espacio en disco, actualización de estadísticas para el optimizador de consultas y verificación de integridad estructural.",
                "componentes": "Botón de ejecución con indicador giratorio, distintivo de última optimización completada con fecha y hora, y tabla de diagnóstico detallada con las 12 tablas del sistema (Motor, Número de filas, Tamaño de datos, Tamaño de índices, Chequeo de integridad CHECK TABLE y estado de desfragmentación OPTIMIZE/ANALYZE)."
            },
            "img": "35_superadmin_base_datos_optimizacion.png",
            "caption": "Diagnóstico de Integridad, Desfragmentación Física y Reindexado de Tablas InnoDB",
            "actions": "Crear automáticamente índices de alto rendimiento faltantes (idx_usuarios_email, idx_usuarios_rol, idx_estudiantes_ap_nom, idx_secciones_guia), desfragmentar tablas InnoDB y asegurar la máxima velocidad en generación de reportes y boletines."
        },
        {
            "num_title": "2.7. Modal de Confirmación y Advertencia de Restauración de Base de Datos",
            "metadata": {
                "perfil": "Super Administrador",
                "ruta": "Pestaña 'Base de Datos' → Botón 'Restaurar' en cualquier archivo del listado",
                "proposito": "Mecanismo de seguridad de doble confirmación con advertencia de impacto antes de sobrescribir la base de datos institucional con una copia previa.",
                "componentes": "Icono de advertencia en rojo, visualización del nombre exacto del archivo SQL seleccionado, texto de advertencia sobre reemplazo de datos y botones 'Cancelar' y 'Sí, Restaurar Ahora'."
            },
            "img": "36_superadmin_modal_restaurar_bd.png",
            "caption": "Modal de Confirmación con Advertencia de Seguridad para la Restauración de Base de Datos",
            "actions": "Confirmar la restauración completa de la base de datos mediante el cliente mysql con parámetros institucionales seguros o abortar la operación sin afectar los datos activos."
        }
    ]

    for item in new_screens:
        build_screen_elements(
            doc=doc,
            target_p=target_p,
            num_title=item["num_title"],
            metadata=item["metadata"],
            img_filename=item["img"],
            caption=item["caption"],
            actions_desc=item["actions"]
        )

    # 7. Guardar documento
    try:
        doc.save(TARGET_DOCX)
        print(f"SUCCESS: {TARGET_DOCX} actualizado exitosamente.")
    except Exception as e:
        print(f"Aviso guardando {TARGET_DOCX}: {e}")

    try:
        doc.save(FALLBACK_DOCX)
        print(f"SUCCESS: {FALLBACK_DOCX} actualizado exitosamente.")
    except Exception as e:
        print(f"Aviso guardando {FALLBACK_DOCX}: {e}")

if __name__ == "__main__":
    update_capturas_document()

