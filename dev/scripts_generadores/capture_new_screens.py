import os
import time
from playwright.sync_api import sync_playwright

OUT_DIR = r"c:\AppServ\www\Proyecto\capturas_sistema"
os.makedirs(OUT_DIR, exist_ok=True)

def capture_screens():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1366, 'height': 820}, device_scale_factor=1.25)
        page = context.new_page()

        # Inyectar sesión de superadmin
        page.add_init_script('''
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: 1,
                nombre: 'Super',
                apellido: 'Admin',
                cedula: 'V-10000000',
                rol: 'superadmin',
                email: 'admin@aliprimera.edu.ve'
            }));
        ''')

        # 1. Cargar Superadmin
        page.goto('http://localhost/Proyecto/superadmin/index.html')
        page.wait_for_timeout(2500)

        # 05_superadmin_dashboard.png - Actualizado con nueva barra lateral
        p05 = os.path.join(OUT_DIR, '05_superadmin_dashboard.png')
        page.screenshot(path=p05)
        print(f"Captured: {p05}")

        # 32_superadmin_docentes_acciones.png - Pestaña Profesores
        page.evaluate("switchSATab('teachers')")
        page.wait_for_timeout(1500)
        p32 = os.path.join(OUT_DIR, '32_superadmin_docentes_acciones.png')
        page.screenshot(path=p32)
        print(f"Captured: {p32}")

        # 33_superadmin_estudiantes_filtros.png - Pestaña Estudiantes con filtros
        page.evaluate("switchSATab('students')")
        page.wait_for_timeout(2000)
        p33 = os.path.join(OUT_DIR, '33_superadmin_estudiantes_filtros.png')
        page.screenshot(path=p33)
        print(f"Captured: {p33}")

        # 34_superadmin_base_datos_metricas.png - Pestaña Base de Datos
        page.evaluate("switchSATab('database')")
        page.wait_for_timeout(2500)
        p34 = os.path.join(OUT_DIR, '34_superadmin_base_datos_metricas.png')
        page.screenshot(path=p34)
        print(f"Captured: {p34}")

        # 35_superadmin_base_datos_optimizacion.png - Ejecutar Optimizar e Indexar
        page.evaluate("optimizeSADatabase()")
        page.wait_for_timeout(3500)
        p35 = os.path.join(OUT_DIR, '35_superadmin_base_datos_optimizacion.png')
        page.screenshot(path=p35)
        print(f"Captured: {p35}")

        # 36_superadmin_modal_restaurar_bd.png - Abrir modal de confirmación de restauración
        page.evaluate("openRestoreModal('backup_sistema_ali_2026-11-14_04-40-00.sql')")
        page.wait_for_timeout(1000)
        p36 = os.path.join(OUT_DIR, '36_superadmin_modal_restaurar_bd.png')
        page.screenshot(path=p36)
        print(f"Captured: {p36}")

        browser.close()
        print("Todas las capturas se generaron exitosamente.")

if __name__ == '__main__':
    capture_screens()

