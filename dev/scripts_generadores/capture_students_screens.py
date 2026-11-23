import os
from playwright.sync_api import sync_playwright

OUT_DIR = r"c:\AppServ\www\Proyecto\capturas_sistema"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1366, 'height': 820}, device_scale_factor=1.25)

    # Superadmin Page - Estudiantes con filtros y botones de inhabilitar/eliminar
    page_sa = context.new_page()
    page_sa.add_init_script('''
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: 1,
            nombre: 'Super',
            apellido: 'Admin',
            cedula: 'V-10000000',
            rol: 'superadmin',
            email: 'admin@aliprimera.edu.ve'
        }));
    ''')
    page_sa.goto('http://localhost/Proyecto/superadmin/index.html')
    page_sa.wait_for_timeout(3000)
    page_sa.evaluate("document.getElementById('sa-nav-students').click()")
    page_sa.wait_for_timeout(2000)
    p33 = os.path.join(OUT_DIR, '33_superadmin_estudiantes_filtros.png')
    page_sa.screenshot(path=p33)
    print(f'Captured superadmin: {p33}')

    browser.close()
print('Finished capturing superadmin student screen!')
