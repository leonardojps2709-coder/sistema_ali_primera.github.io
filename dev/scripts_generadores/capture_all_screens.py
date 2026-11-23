import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIRS = [
    r"c:\AppServ\www\Proyecto\capturas_sistema",
    r"c:\AppServ\www\Proyecto\catalogo_capturas\capturas"
]

for d in OUTPUT_DIRS:
    os.makedirs(d, exist_ok=True)

def save_screen(page, filename):
    for d in OUTPUT_DIRS:
        dest = os.path.join(d, filename)
        page.screenshot(path=dest, full_page=False)
    print(f"Captured: {filename}")

def safe_eval(page, js_code, arg=None):
    try:
        if arg is not None:
            return page.evaluate(js_code, arg)
        return page.evaluate(js_code)
    except Exception as e:
        print(f"Notice during evaluate: {e}")
        return None

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()

        # ==========================================
        # 1. MÓDULO PÚBLICO Y AUTENTICACIÓN
        # ==========================================
        print("--- 1. Módulo Público ---")
        page.goto("http://localhost/Proyecto/login/bienvenida.html")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        save_screen(page, "01_portal_bienvenida.png")

        page.goto("http://localhost/Proyecto/login/login.html")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        save_screen(page, "02_login_admin.png")

        safe_eval(page, """() => {
            const fpl = document.getElementById('forgotPasswordLink');
            if (fpl) fpl.click();
            else {
                const m = document.getElementById('forgotPasswordModal');
                if (m) m.classList.add('active');
            }
        }""")
        time.sleep(1)
        save_screen(page, "03_modal_recuperar_password.png")

        page.goto("http://localhost/Proyecto/login/login-maestros.html")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        save_screen(page, "04_login_docente.png")

        # ==========================================
        # 2. PERFIL SUPERADMINISTRADOR
        # ==========================================
        print("--- 2. Perfil Superadministrador ---")
        page.goto("http://localhost/Proyecto/login/login.html")
        safe_eval(page, """() => {
            const session = {
                id: 29,
                cedula: 'superadmin',
                nombre: 'Super',
                apellido: 'Administrador',
                email: 'superadmin@aliprimera.edu.ve',
                rol: 'superadmin'
            };
            sessionStorage.setItem('currentUser', JSON.stringify(session));
        }""")
        page.goto("http://localhost/Proyecto/superadmin/index.html")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        safe_eval(page, "() => switchSATab('admins')")
        time.sleep(1)
        save_screen(page, "05_superadmin_dashboard.png")

        safe_eval(page, """() => {
            const btn = document.getElementById('sa-add-admin-btn');
            if (btn) btn.click();
            else {
                const m = document.getElementById('sa-modal-overlay');
                if (m) m.classList.add('active');
            }
        }""")
        time.sleep(1)
        save_screen(page, "06_superadmin_modal_nuevo_admin.png")
        safe_eval(page, """() => {
            const m = document.getElementById('sa-modal-overlay');
            if (m) m.classList.remove('active');
        }""")
        time.sleep(0.5)

        safe_eval(page, "() => switchSATab('teachers')")
        time.sleep(1.5)
        save_screen(page, "32_superadmin_docentes_acciones.png")

        safe_eval(page, "() => switchSATab('students')")
        time.sleep(1.5)
        save_screen(page, "33_superadmin_estudiantes_filtros.png")

        safe_eval(page, "() => switchSATab('database')")
        time.sleep(2)
        save_screen(page, "34_superadmin_base_datos_metricas.png")

        safe_eval(page, "() => { const el = document.getElementById('sa-db-diagnostico-table'); if(el) el.scrollIntoView(); }")
        time.sleep(1)
        save_screen(page, "35_superadmin_base_datos_optimizacion.png")

        safe_eval(page, """() => {
            const m = document.getElementById('sa-modal-restore-overlay');
            if (m) m.classList.add('active');
            const f = document.getElementById('sa-restore-filename');
            if (f) f.innerText = 'respaldo_ali_primera_2026-11-14.sql';
        }""")
        time.sleep(1)
        save_screen(page, "36_superadmin_modal_restaurar_bd.png")

        # ==========================================
        # 3. PERFIL ADMINISTRADOR (CONTROL DE ESTUDIOS)
        # ==========================================
        print("--- 3. Perfil Administrador ---")
        page.goto("http://localhost/Proyecto/login/login.html")
        safe_eval(page, """() => {
            const session = {
                id: 3,
                cedula: 'V-31072861',
                nombre: 'Leonardo',
                apellido: 'Perez',
                email: 'leonardojose2706@gmail.com',
                rol: 'admin'
            };
            sessionStorage.setItem('currentUser', JSON.stringify(session));
        }""")
        page.goto("http://localhost/Proyecto/admin/index.html")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        def click_admin_nav(sec_id):
            safe_eval(page, """(sec) => {
                const link = document.querySelector(`[data-section="${sec}"]`);
                if (link) link.click();
                else {
                    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                    const target = document.getElementById(`${sec}-section`);
                    if (target) target.classList.add('active');
                }
            }""", sec_id)
            time.sleep(1.2)

        click_admin_nav("home")
        save_screen(page, "07_admin_inicio.png")

        click_admin_nav("users")
        save_screen(page, "08_admin_usuarios_todos.png")

        click_admin_nav("teachers")
        save_screen(page, "09_admin_profesores.png")

        click_admin_nav("admins")
        save_screen(page, "10_admin_administradores.png")

        click_admin_nav("sections")
        save_screen(page, "11_admin_secciones_y_anos.png")

        click_admin_nav("students")
        save_screen(page, "12_admin_estudiantes.png")

        click_admin_nav("grades")
        save_screen(page, "13_admin_registrar_notas.png")

        click_admin_nav("student-report")
        save_screen(page, "14_admin_reporte_notas.png")

        click_admin_nav("mentions")
        save_screen(page, "15_admin_menciones.png")

        click_admin_nav("subjects")
        save_screen(page, "16_admin_asignaturas.png")

        click_admin_nav("periods")
        save_screen(page, "17_admin_periodos.png")

        # 18 Modal Sección
        safe_eval(page, """() => {
            const btn = document.getElementById('open-section-modal-btn');
            if (btn) btn.click();
            else {
                const m = document.getElementById('section-modal-overlay');
                if (m) m.classList.add('active');
            }
        }""")
        time.sleep(1)
        save_screen(page, "18_admin_modal_seccion.png")
        safe_eval(page, """() => {
            const m = document.getElementById('section-modal-overlay');
            if (m) m.classList.remove('active');
        }""")

        # 19 Modal Profesor
        safe_eval(page, """() => {
            const btn = document.getElementById('btn-new-user-general') || document.getElementById('add-teacher-btn');
            if (btn) btn.click();
            else {
                const m = document.getElementById('teacher-modal');
                if (m) m.classList.add('active');
            }
        }""")
        time.sleep(1)
        save_screen(page, "19_admin_modal_profesor.png")
        safe_eval(page, """() => {
            const m = document.getElementById('teacher-modal');
            if (m) m.classList.remove('active');
        }""")

        # 20 Modal Estudiante
        safe_eval(page, """() => {
            const btn = document.getElementById('add-student-btn');
            if (btn) btn.click();
            else {
                const m = document.getElementById('student-modal');
                if (m) m.classList.add('active');
            }
        }""")
        time.sleep(1)
        save_screen(page, "20_admin_modal_estudiante.png")
        safe_eval(page, """() => {
            const m = document.getElementById('student-modal');
            if (m) m.classList.remove('active');
        }""")

        # 21 Modal Detalle Sección
        safe_eval(page, """() => {
            if (typeof window.openSectionDetailModal === 'function') {
                window.openSectionDetailModal(1);
            } else {
                const m = document.getElementById('section-detail-overlay');
                if (m) { m.style.display = 'flex'; m.classList.add('active'); }
            }
        }""")
        time.sleep(1.2)
        save_screen(page, "21_admin_modal_detalle_seccion.png")
        safe_eval(page, """() => {
            const m = document.getElementById('section-detail-overlay');
            if (m) { m.style.display = 'none'; m.classList.remove('active'); }
        }""")

        # 22 Modal Perfil / Expediente Estudiante
        safe_eval(page, """() => {
            if (typeof window.openStudentProfileModal === 'function') {
                window.openStudentProfileModal(1);
            } else {
                const m = document.getElementById('student-profile-modal-overlay');
                if (m) m.style.display = 'flex';
            }
        }""")
        time.sleep(1.5)
        save_screen(page, "22_admin_modal_perfil_estudiante.png")
        safe_eval(page, """() => {
            const m = document.getElementById('student-profile-modal-overlay');
            if (m) m.style.display = 'none';
        }""")

        # ==========================================
        # 4. PERFIL PROFESOR / DOCENTE
        # ==========================================
        print("--- 4. Perfil Profesor ---")
        page.goto("http://localhost/Proyecto/login/login-maestros.html")
        safe_eval(page, """() => {
            const session = {
                id: 14,
                cedula: 'V-10000003',
                nombre: 'Nairin',
                apellido: 'Profesor',
                email: 'nairin@gmail.com',
                rol: 'teacher',
                asignaciones: '[]'
            };
            sessionStorage.setItem('currentUser', JSON.stringify(session));
        }""")
        page.goto("http://localhost/Proyecto/profesor/index.html")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        def click_prof_nav(sec_id):
            safe_eval(page, """(sec) => {
                const link = document.querySelector(`[data-section="${sec}"]`);
                if (link) link.click();
                else {
                    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                    const target = document.getElementById(`${sec}-section`);
                    if (target) target.classList.add('active');
                }
            }""", sec_id)
            time.sleep(1.2)

        click_prof_nav("home")
        save_screen(page, "23_profesor_inicio.png")

        click_prof_nav("sections")
        save_screen(page, "24_profesor_secciones.png")

        click_prof_nav("students")
        save_screen(page, "25_profesor_estudiantes.png")

        click_prof_nav("grades")
        save_screen(page, "26_profesor_registrar_notas.png")

        click_prof_nav("student-report")
        save_screen(page, "27_profesor_reporte_notas.png")

        click_prof_nav("mentions")
        save_screen(page, "28_profesor_menciones.png")

        click_prof_nav("evaluaciones")
        save_screen(page, "29_profesor_evaluaciones_plan.png")

        # 30 Profesor Modal Config Evaluaciones
        safe_eval(page, """() => {
            if (typeof openNewEvalModal === 'function') {
                openNewEvalModal();
            } else {
                const m = document.getElementById('eval-config-modal');
                if (m) m.classList.add('active');
            }
        }""")
        time.sleep(1)
        save_screen(page, "30_profesor_modal_config_evaluaciones.png")
        safe_eval(page, """() => {
            const m = document.getElementById('eval-config-modal');
            if (m) m.classList.remove('active');
        }""")

        # 31 Profesor Modal Calificar Evaluaciones
        safe_eval(page, """() => {
            const m = document.getElementById('eval-grading-modal');
            if (m) m.classList.add('active');
        }""")
        time.sleep(1)
        save_screen(page, "31_profesor_modal_calificar_evaluaciones.png")
        safe_eval(page, """() => {
            const m = document.getElementById('eval-grading-modal');
            if (m) m.classList.remove('active');
        }""")

        browser.close()
        print("ALL 36 SCREENS CAPTURED SUCCESSFULLY!")

if __name__ == "__main__":
    run()
