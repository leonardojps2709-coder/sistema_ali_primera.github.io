/**
 * superadmin.js
 * PANEL DE GESTIÓN DEL SUPERADMINISTRADOR
 *
 * Contiene toda la lógica de la interfaz del SuperAdmin: listar administradores,
 * profesores y estudiantes; crear/editar cuentas de admin; inhabilitar/habilitar
 * profesores; cambiar contraseñas; eliminar permanentemente registros; y gestionar
 * solicitudes de restablecimiento de contraseña.
 * Se comunica con `api/main.php` para todas las operaciones de datos.
 */

// ===== ESTADO GLOBAL =====
let editingAdminId = null;
let editingTeacherId = null;
let pendingDeleteId = null;
let pendingDeleteType = 'admin'; // 'admin' | 'teacher' | 'student'
let currentSATab = 'admins';
let saSearchTerm = '';
let saSearchTeacherTerm = '';
let saSearchStudentTerm = '';

/**
 * Hook que llama data.js tras cargar todos los datos del servidor.
 * Definido ANTES de `DOMContentLoaded` para asegurar que esté disponible
 * cuando data.js lo invoque.
 */
window.renderAll = async function () {
    renderSAAll();
    await fetchSAResets();
    await fetchSATeacherResets();
};

/**
 * Punto de entrada principal del render del panel SA.
 * Orquesta el renderizado de estadísticas y de todas las tablas.
 */
function renderSAAll() {
    renderSAStats();
    renderAdminsTable(saSearchTerm);
    renderTeachersTable(saSearchTeacherTerm);
    populateSAStudentFilters();
    renderStudentsTable();
}

// ===== GESTIÓN DE PESTAÑAS =====
async function switchSATab(tab) {
    currentSATab = tab;
    ['admins', 'teachers', 'students', 'database', 'reports'].forEach(t => {
        const nav = document.getElementById(`sa-nav-${t}`);
        if (nav) nav.classList.toggle('active', t === tab);
        const pane = document.getElementById(`sa-tab-${t}`);
        if (pane) pane.style.display = (t === tab) ? 'block' : 'none';
    });

    // Ocultar tarjetas de usuarios al entrar en Base de Datos o Reportes para evitar acumulación visual
    const statsGrid = document.getElementById('sa-stats-grid');
    if (statsGrid) {
        statsGrid.style.display = (tab === 'database' || tab === 'reports') ? 'none' : 'grid';
    }

    const titleText = document.getElementById('sa-page-title-text');
    const titleIcon = document.getElementById('sa-page-title-icon');
    if (tab === 'admins') {
        if (titleText) titleText.textContent = 'Gestión de Administradores';
        if (titleIcon) titleIcon.className = 'bx bx-shield';
    } else if (tab === 'teachers') {
        if (titleText) titleText.textContent = 'Gestión de Profesores';
        if (titleIcon) titleIcon.className = 'bx bx-briefcase';
    } else if (tab === 'students') {
        if (titleText) titleText.textContent = 'Gestión de Estudiantes';
        if (titleIcon) titleIcon.className = 'bx bxs-graduation';
        // Sincronizar siempre datos frescos con los demás perfiles
        if (typeof initData === 'function') {
            await initData();
        }
        populateSAStudentFilters();
        renderStudentsTable();
    } else if (tab === 'database') {
        if (titleText) titleText.textContent = 'Mantenimiento y Base de Datos';
        if (titleIcon) titleIcon.className = 'bx bx-data';
        loadSADatabaseStats();
        loadSABackups();
    } else if (tab === 'reports') {
        if (titleText) titleText.textContent = 'Reportes y Control de Usuarios';
        if (titleIcon) titleIcon.className = 'bx bx-file-blank';
        loadActivityLogs();
    }
}
window.switchSATab = switchSATab;

/**
 * Helper para obtener el nombre de la sección de un estudiante.
 */
function getSASectionName(secId) {
    if (!secId || typeof sections === 'undefined') return 'Sin sección';
    const sec = sections.find(s => s.id == secId);
    return sec ? sec.nombre : 'Sin sección';
}

/**
 * Obtiene desde la API la lista de solicitudes de reset de contraseña
 * pendientes y llama a `renderSAResets()` para mostrarlas en la tabla.
 */
async function fetchSAResets() {
    try {
        const res = await fetch('../api/main.php?action=get_reset_requests');
        const data = await res.json();
        renderSAResets(data);
    } catch (e) {
        console.error('Error fetching resets:', e);
    }
}

function renderSAResets(list) {
    const tbody = document.getElementById('sa-reset-tbody');
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `
            <tr class="sa-empty-row">
                <td colspan="5" class="empty-msg" style="padding: 2rem !important;">
                    <i class='bx bx-check-shield' style="font-size:2rem;color:#16a34a;display:block;margin-bottom:0.5rem;"></i>
                    No hay solicitudes pendientes.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = list.map(r => `
        <tr style="background:#fffcf5;">
            <td style="color:#64748b;font-size:0.8rem;">
                ${new Date(r.reset_fecha).toLocaleString('es-ES', { dateStyle:'short', timeStyle:'short' })}
            </td>
            <td style="font-weight:600;color:#1e293b;">${r.nombre} ${r.apellido}</td>
            <td style="color:#64748b;">${r.cedula}</td>
            <td style="color:#64748b;">${r.email || '—'}</td>
            <td>
                <div class="sa-actions-cell" style="justify-content:center;">
                    <button class="sa-btn-primary" style="padding:0.4rem 0.8rem;font-size:0.75rem;" onclick="openEditAdminSA(${r.id})" title="Editar Contraseña">
                        <i class='bx bx-edit-alt'></i> Editar
                    </button>
                    <button class="sa-btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.75rem;background:#e2e8f0;" onclick="clearSAReset(${r.id})" title="Marcar como resuelto">
                        <i class='bx bx-check'></i> Resuelto
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.clearSAReset = async (id) => {
    try {
        const res = await fetch('../api/main.php?action=clear_reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (data.success) {
            showSAToast('Solicitud marcada como resuelta', 'success');
            fetchSAResets();
        }
    } catch (e) {
        console.error(e);
        showSAToast('Error al resolver solicitud', 'error');
    }
};

// ===== CONTADORES DE ESTADÍSTICAS =====
function renderSAStats() {
    const admins = (typeof users !== 'undefined') ? users.filter(u => u.rol === 'admin') : [];
    const teachers = (typeof users !== 'undefined') ? users.filter(u => u.rol === 'teacher') : [];
    const allStudents = (typeof students !== 'undefined') ? students : [];

    const elAdmins = document.getElementById('sa-stat-admins');
    if (elAdmins) elAdmins.textContent = admins.length;

    const elTeachers = document.getElementById('sa-stat-teachers');
    if (elTeachers) elTeachers.textContent = teachers.length;

    const elStudents = document.getElementById('sa-stat-students');
    if (elStudents) elStudents.textContent = allStudents.length;
}

// ===== TABLA DE ADMINISTRADORES =====
function renderAdminsTable(filter) {
    filter = (filter || '').toLowerCase();
    saSearchTerm = filter;
    const tbody = document.getElementById('sa-admins-tbody');
    if (!tbody) return;

    const allAdmins = (typeof users !== 'undefined') ? users.filter(u => u.rol === 'admin') : [];
    const list = filter
        ? allAdmins.filter(a =>
            (a.nombre   || '').toLowerCase().includes(filter) ||
            (a.apellido || '').toLowerCase().includes(filter) ||
            (a.cedula   || '').toLowerCase().includes(filter) ||
            (a.email    || '').toLowerCase().includes(filter))
        : allAdmins;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr class="sa-empty-row">
                <td colspan="6">
                    <i class="bx bx-shield sa-empty-icon"></i>
                    ${filter ? 'No se encontraron administradores.' : 'No hay administradores registrados.'}
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = list.map((a, idx) => `
        <tr>
            <td style="color:#94a3b8;font-size:0.78rem;font-weight:600;">${idx + 1}</td>
            <td>
                <div style="display:flex;align-items:center;gap:0.6rem;">
                    <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7e232e,#4a151b);display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:700;color:#fff;flex-shrink:0;box-shadow:0 2px 6px rgba(74,21,27,0.3);">
                        ${(a.nombre || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight:600;color:#1e293b;">${a.nombre} ${a.apellido}</div>
                        <div style="font-size:0.73rem;color:#94a3b8;">${a.cedula}</div>
                    </div>
                </div>
            </td>
            <td style="color:#64748b;">${a.email || '—'}</td>
            <td style="color:#64748b;">${a.telefono || '—'}</td>
            <td><span class="sa-role-badge admin"><i class='bx bx-shield'></i> Admin</span></td>
            <td>
                <div class="sa-actions-cell">
                    <button class="sa-btn-icon sa-btn-edit" onclick="openEditAdminSA(${a.id})" title="Editar">
                        <i class='bx bx-edit'></i>
                    </button>
                    <button class="sa-btn-icon sa-btn-delete" onclick="confirmDeleteAdmin(${a.id}, '${(a.nombre + ' ' + a.apellido).replace(/'/g,"\\'")}')" title="Eliminar">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== TABLA DE PROFESORES =====
function renderTeachersTable(filter) {
    filter = (filter || '').toLowerCase();
    saSearchTeacherTerm = filter;
    const tbody = document.getElementById('sa-teachers-tbody');
    if (!tbody) return;

    const allTeachers = (typeof users !== 'undefined') ? users.filter(u => u.rol === 'teacher') : [];
    const list = filter
        ? allTeachers.filter(t =>
            (t.nombre || '').toLowerCase().includes(filter) ||
            (t.apellido || '').toLowerCase().includes(filter) ||
            (t.cedula || '').toLowerCase().includes(filter) ||
            (t.email || '').toLowerCase().includes(filter) ||
            (t.telefono || '').toLowerCase().includes(filter) ||
            (t.tipo_docente || '').toLowerCase().includes(filter))
        : allTeachers;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr class="sa-empty-row">
                <td colspan="7">
                    <i class="bx bx-briefcase sa-empty-icon"></i>
                    ${filter ? 'No se encontraron profesores.' : 'No hay profesores registrados.'}
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = list.map((t, idx) => {
        const isActivo = t.activo === undefined || t.activo === null || t.activo == 1;
        const initial = (t.nombre || 'P')[0].toUpperCase();
        
        let tipoBadge = '<span class="sa-role-badge" style="background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;"><i class="bx bx-book-reader"></i> Docente</span>';
        if (t.tipo_docente === 'solo_guia') {
            tipoBadge = '<span class="sa-role-badge" style="background:#f3e8ff;color:#7e22ce;border:1px solid #d8b4fe;"><i class="bx bxs-star"></i> Solo Guía</span>';
        } else if (t.tipo_docente === 'docente_guia') {
            tipoBadge = '<span class="sa-role-badge" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;"><i class="bx bxs-check-shield"></i> Docente y Guía</span>';
        }

        const estadoBadge = isActivo
            ? '<span class="sa-role-badge" style="background:#dcfce7;color:#166534;border:1px solid #bbf7d0;"><i class="bx bx-check-circle"></i> Activo</span>'
            : '<span class="sa-role-badge" style="background:#fee2e2;color:#991b1b;border:1px solid #fecaca;"><i class="bx bx-block"></i> Inhabilitado</span>';

        const rowBg = isActivo ? '' : 'style="background:#fef2f2;"';
        const safeName = (t.nombre + ' ' + t.apellido).replace(/'/g, "\\'");

        const toggleBtn = isActivo
            ? `<button class="sa-btn-icon sa-btn-status-off" onclick="toggleTeacherStatusSA(${t.id}, 0)" title="Inhabilitar profesor (bloquear acceso)">
                 <i class='bx bx-block'></i>
               </button>`
            : `<button class="sa-btn-icon sa-btn-status-on" onclick="toggleTeacherStatusSA(${t.id}, 1)" title="Habilitar profesor (permitir acceso)">
                 <i class='bx bx-check-circle'></i>
               </button>`;

        return `
            <tr ${rowBg}>
                <td style="color:#94a3b8;font-size:0.78rem;font-weight:600;">${idx + 1}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:0.6rem;">
                        <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg, ${isActivo ? '#1d4ed8,#1e40af' : '#64748b,#475569'});display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:700;color:#fff;flex-shrink:0;">
                            ${initial}
                        </div>
                        <div>
                            <div style="font-weight:600;color:#1e293b;">${t.nombre} ${t.apellido}</div>
                            <div style="font-size:0.73rem;color:#94a3b8;">${t.cedula}</div>
                        </div>
                    </div>
                </td>
                <td style="color:#64748b;">${t.email || '—'}</td>
                <td style="color:#64748b;">${t.telefono || '—'}</td>
                <td>${tipoBadge}</td>
                <td>${estadoBadge}</td>
                <td>
                    <div class="sa-actions-cell" style="justify-content:center;">
                        ${toggleBtn}
                        <button class="sa-btn-icon sa-btn-password" onclick="openTeacherPasswordModal(${t.id})" title="Cambiar Contraseña">
                            <i class='bx bx-lock-alt'></i>
                        </button>
                        <button class="sa-btn-icon sa-btn-delete" onclick="confirmDeleteTeacher(${t.id}, '${safeName}')" title="Eliminar Profesor Permanentemente">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== FILTROS Y GESTIÓN DE ESTUDIANTES =====
let saStudentMentionFilter = '';
let saStudentSectionFilter = '';

if (typeof window.extraerAnio !== 'function') {
    window.extraerAnio = function(nombre) {
        if (!nombre) return 999;
        const match = String(nombre).match(/\d+/);
        return match ? parseInt(match[0], 10) : 999;
    };
}

function populateSAStudentFilters() {
    const mentionSel = document.getElementById('sa-student-mention-filter');
    if (!mentionSel) return;

    const currentMen = mentionSel.value || saStudentMentionFilter;
    const allMentions = (typeof mentions !== 'undefined') ? mentions : [];
    mentionSel.innerHTML = '<option value="">Todas las menciones</option>' +
        allMentions.map(m => `<option value="${m.id}" ${String(m.id) === String(currentMen) ? 'selected' : ''}>${m.nombre}</option>`).join('');

    updateSASectionFilterOptions();
}
window.populateSAStudentFilters = populateSAStudentFilters;

function updateSASectionFilterOptions() {
    const mentionSel = document.getElementById('sa-student-mention-filter');
    const sectionSel = document.getElementById('sa-student-section-filter');
    if (!sectionSel) return;

    const menVal = mentionSel ? mentionSel.value : '';
    const currentSec = sectionSel.value || saStudentSectionFilter;

    let allSecs = (typeof sections !== 'undefined') ? [...sections] : [];

    if (menVal) {
        allSecs = allSecs.filter(s => String(s.mencion_id) === String(menVal));
    }

    allSecs.sort((a, b) => {
        const yA = extraerAnio(a.nombre);
        const yB = extraerAnio(b.nombre);
        if (yA !== yB) return yA - yB;
        return a.nombre.localeCompare(b.nombre);
    });

    sectionSel.innerHTML = '<option value="">Todas las secciones</option>' +
        allSecs.map(s => `<option value="${s.id}" ${String(s.id) === String(currentSec) ? 'selected' : ''}>${s.nombre}</option>`).join('');
}
window.updateSASectionFilterOptions = updateSASectionFilterOptions;

// ===== TABLA DE ESTUDIANTES =====
function renderStudentsTable(filter) {
    if (filter !== undefined) {
        saSearchStudentTerm = (filter || '').toLowerCase();
    }
    const tbody = document.getElementById('sa-students-tbody');
    const countBadge = document.getElementById('sa-student-count-badge');
    if (!tbody) return;

    const allStudents = (typeof students !== 'undefined') ? students : [];
    const allSecs = (typeof sections !== 'undefined') ? sections : [];
    const allMens = (typeof mentions !== 'undefined') ? mentions : [];

    const menFilter = saStudentMentionFilter;
    const secFilter = saStudentSectionFilter;
    const textFilter = saSearchStudentTerm;

    const list = allStudents.filter(s => {
        const sec = allSecs.find(sc => String(sc.id) === String(s.seccion_id || s.seccion));
        const mencId = sec ? String(sec.mencion_id || '') : '';

        // Filtro Mención
        if (menFilter && mencId !== String(menFilter)) return false;

        // Filtro Sección
        if (secFilter && String(s.seccion_id || s.seccion) !== String(secFilter)) return false;

        // Filtro Texto
        if (textFilter) {
            const fullName = `${s.nombre || ''} ${s.apellido || ''}`.toLowerCase();
            const invName = `${s.apellido || ''} ${s.nombre || ''}`.toLowerCase();
            const ced = (s.cedula || '').toLowerCase();
            const email = (s.email || '').toLowerCase();
            const tel = (s.telefono || '').toLowerCase();
            const secName = (sec ? sec.nombre : '').toLowerCase();

            if (!fullName.includes(textFilter) &&
                !invName.includes(textFilter) &&
                !ced.includes(textFilter) &&
                !email.includes(textFilter) &&
                !tel.includes(textFilter) &&
                !secName.includes(textFilter)) {
                return false;
            }
        }

        return true;
    });

    if (countBadge) {
        countBadge.textContent = `${list.length} de ${allStudents.length} estudiantes`;
    }

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr class="sa-empty-row">
                <td colspan="7">
                    <i class="bx bxs-graduation sa-empty-icon" style="font-size:2rem;color:#94a3b8;display:block;margin-bottom:0.4rem;"></i>
                    No se encontraron estudiantes con los filtros aplicados.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = list.map((s, idx) => {
        const sec = allSecs.find(sc => String(sc.id) === String(s.seccion_id || s.seccion));
        const men = (sec && sec.mencion_id) ? allMens.find(m => String(m.id) === String(sec.mencion_id)) : null;

        const secBadge = sec
            ? `<span class="sa-role-badge" style="background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;">
                 <i class='bx bx-chalkboard'></i> ${sec.nombre}
               </span>`
            : `<span class="sa-role-badge" style="background:#f1f5f9;color:#64748b;border:1px solid #cbd5e1;">Sin asignar</span>`;

        const menBadge = men
            ? `<span class="sa-role-badge" style="background:${men.color ? men.color + '18' : '#eff6ff'};color:${men.color || '#1d4ed8'};border:1px solid ${men.color ? men.color + '45' : '#bfdbfe'};">
                 <i class='bx bx-category'></i> ${men.nombre}
               </span>`
            : `<span class="sa-role-badge" style="background:#f8fafc;color:#94a3b8;border:1px solid #e2e8f0;">Básica / General</span>`;

        const fullName = `${(s.apellido || '').toUpperCase()}, ${(s.nombre || '').toUpperCase()}`;
        const initial = (s.apellido || s.nombre || 'E')[0].toUpperCase();
        const safeName = fullName.replace(/'/g, "\\'");

        const isActivo = s.activo === undefined || s.activo === null || parseInt(s.activo) === 1;
        const statusBadge = isActivo
            ? `<span class="sa-role-badge" style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;"><i class='bx bx-check-circle'></i> Activo</span>`
            : `<span class="sa-role-badge" style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca;"><i class='bx bx-block'></i> Inhabilitado</span>`;

        const toggleBtn = isActivo
            ? `<button class="sa-btn-icon" onclick="toggleStudentStatusSA(${s.id}, 0, '${safeName}')" title="Inhabilitar Estudiante" style="color:#d97706;">
                 <i class='bx bx-user-x'></i>
               </button>`
            : `<button class="sa-btn-icon" onclick="toggleStudentStatusSA(${s.id}, 1, '${safeName}')" title="Habilitar Estudiante" style="color:#16a34a;">
                 <i class='bx bx-user-check'></i>
               </button>`;

        return `
            <tr style="${!isActivo ? 'background-color:#fff5f5;opacity:0.88;' : ''}">
                <td style="color:#94a3b8;font-size:0.78rem;font-weight:600;">${idx + 1}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:0.6rem;">
                        <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#16a34a,#15803d);display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:700;color:#fff;flex-shrink:0;">
                            ${initial}
                        </div>
                        <div>
                            <div style="font-weight:600;color:#1e293b;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                                ${fullName}
                                ${statusBadge}
                            </div>
                        </div>
                    </div>
                </td>
                <td style="font-weight:500;color:#334155;font-size:0.85rem;">${s.cedula}</td>
                <td>${secBadge}</td>
                <td>${menBadge}</td>
                <td>
                    <div style="font-size:0.82rem;color:#475569;">${s.email || '—'}</div>
                    <div style="font-size:0.74rem;color:#94a3b8;">${s.telefono || '—'}</div>
                </td>
                <td>
                    <div class="sa-actions-cell" style="justify-content:center;">
                        ${toggleBtn}
                        <button class="sa-btn-icon sa-btn-delete" onclick="confirmDeleteStudent(${s.id}, '${safeName}')" title="Eliminar Estudiante Permanentemente">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Exponer para onclick inline
window.openEditAdminSA  = (id) => openAdminModal(id);
window.confirmDeleteAdmin = (id, name) => confirmDelete(id, name, 'admin');
window.confirmDeleteTeacher = (id, name) => confirmDelete(id, name, 'teacher');
window.confirmDeleteStudent = (id, name) => confirmDelete(id, name, 'student');

// ===== INHABILITAR / HABILITAR PROFESOR (SUPERADMIN) =====
async function toggleTeacherStatusSA(id, nuevoEstado) {
    const accion = nuevoEstado === 0 ? 'inhabilitar' : 'habilitar';
    const teacher = (typeof users !== 'undefined') && users.find(u => u.id == id);
    const nombre = teacher ? `${teacher.nombre} ${teacher.apellido}` : 'este profesor';

    if (!confirm(`¿Está seguro de que desea ${accion} al profesor ${nombre}?${nuevoEstado === 0 ? '\nEl docente no podrá ingresar al sistema hasta ser habilitado nuevamente.' : ''}`)) {
        return;
    }

    try {
        if (typeof toggleUserStatus === 'function') {
            const res = await toggleUserStatus(id, nuevoEstado);
            if (res && res.success) {
                showSAToast(`Profesor ${nuevoEstado === 0 ? 'inhabilitado' : 'habilitado'} exitosamente`, 'success');
                renderSAAll();
            } else {
                showSAToast('Error al cambiar el estado: ' + (res?.error || ''), 'error');
            }
        } else {
            showSAToast('Función no disponible', 'error');
        }
    } catch (e) {
        console.error('Error toggling status:', e);
        showSAToast('Error al procesar la solicitud', 'error');
    }
}
window.toggleTeacherStatusSA = toggleTeacherStatusSA;

// ===== INHABILITAR / HABILITAR ESTUDIANTE (SUPERADMIN) =====
async function toggleStudentStatusSA(id, nuevoEstado, nombre) {
    const accion = nuevoEstado === 0 ? 'inhabilitar' : 'habilitar';
    const advertencia = nuevoEstado === 0
        ? '\nEl estudiante figurará como inhabilitado en la institución y no se contemplará en la carga regular de evaluaciones.'
        : '';

    if (!confirm(`¿Está seguro de que desea ${accion} al estudiante "${nombre}"?${advertencia}`)) {
        return;
    }

    try {
        if (typeof toggleStudentStatus === 'function') {
            const res = await toggleStudentStatus(id, nuevoEstado);
            if (res && res.success) {
                showSAToast(`Estudiante ${nuevoEstado === 0 ? 'inhabilitado' : 'habilitado'} exitosamente`, 'success');
                renderStudentsTable();
            } else {
                showSAToast('Error al cambiar el estado: ' + (res?.error || ''), 'error');
            }
        } else {
            showSAToast('Función no disponible', 'error');
        }
    } catch (e) {
        console.error('Error toggling student status:', e);
        showSAToast('Error al procesar la solicitud', 'error');
    }
}
window.toggleStudentStatusSA = toggleStudentStatusSA;

/**
 * Abre el modal para crear o editar un administrador.
 * Si se pasa un `id`, precarga los datos del admin para edición.
 * Si no se pasa `id`, prepara el formulario en modo creación.
 * @param {number|null} id - ID del administrador a editar, o null para crear uno nuevo
 */
function openAdminModal(id) {
    editingAdminId = id || null;
    const overlay  = document.getElementById('sa-modal-overlay');
    const titleEl  = document.getElementById('sa-modal-title');
    const pwHint   = document.getElementById('sa-pw-hint');

    clearModalErrors();
    document.getElementById('sa-admin-form')?.reset();
    document.getElementById('sa-admin-cedula-prefix').value = 'V';

    // Resetear ojo contraseña
    ['sa-admin-password','sa-admin-confirm-password'].forEach(id => {
        const inp = document.getElementById(id);
        if (inp) inp.type = 'password';
    });
    document.getElementById('sa-pw-toggle-1')?.classList.replace('bx-show','bx-hide');
    document.getElementById('sa-pw-toggle-2')?.classList.replace('bx-show','bx-hide');

    if (id) {
        const admin = (typeof users !== 'undefined') && users.find(u => u.id == id);
        if (!admin) return;
        titleEl.innerHTML = "<i class='bx bx-edit-alt'></i> Editar Administrador";
        if (admin.cedula && admin.cedula.includes('-')) {
            const [pre, num] = admin.cedula.split('-');
            document.getElementById('sa-admin-cedula-prefix').value = pre;
            document.getElementById('sa-admin-cedula').value = num;
        } else {
            document.getElementById('sa-admin-cedula').value = admin.cedula || '';
        }
        document.getElementById('sa-admin-nombre').value   = admin.nombre   || '';
        document.getElementById('sa-admin-apellido').value = admin.apellido || '';
        document.getElementById('sa-admin-email').value    = admin.email    || '';
        document.getElementById('sa-admin-telefono').value = admin.telefono || '';
        document.getElementById('sa-admin-password').value         = '';
        document.getElementById('sa-admin-confirm-password').value = '';
        if (pwHint) pwHint.style.display = 'flex';
    } else {
        titleEl.innerHTML = "<i class='bx bx-shield-plus'></i> Nuevo Administrador";
        if (pwHint) pwHint.style.display = 'none';
    }

    overlay.classList.add('active');
    setTimeout(() => document.getElementById('sa-admin-nombre')?.focus(), 280);
}

function closeAdminModal() {
    document.getElementById('sa-modal-overlay')?.classList.remove('active');
    editingAdminId = null;
    clearModalErrors();
}

function clearModalErrors() {
    document.querySelectorAll('.sa-form-error').forEach(el => { el.textContent = ''; el.classList.remove('show'); });
    document.querySelectorAll('.sa-form-input.error').forEach(el => el.classList.remove('error'));
}

function showFieldErr(fieldId, errId, msg) {
    document.getElementById(fieldId)?.classList.add('error');
    const err = document.getElementById(errId);
    if (err) { err.textContent = msg; err.classList.add('show'); }
}

// ===== TOGGLE CONTRASEÑA =====
function togglePw(inputId, toggleId) {
    const inp  = document.getElementById(inputId);
    const icon = document.getElementById(toggleId);
    if (!inp || !icon) return;
    const hidden = inp.type === 'password';
    inp.type = hidden ? 'text' : 'password';
    icon.classList.toggle('bx-hide', !hidden);
    icon.classList.toggle('bx-show',  hidden);
}

/**
 * Valida y guarda los datos del formulario del modal de administrador.
 * Realiza validaciones de campo en el frontend (cédula única, contraseñas coinciden)
 * antes de enviar la petición POST a la API.
 */
async function handleSaveAdmin() {
    clearModalErrors();
    let valid = true;

    const prefix   = document.getElementById('sa-admin-cedula-prefix').value;
    const cNum     = document.getElementById('sa-admin-cedula').value.trim();
    const nombre   = document.getElementById('sa-admin-nombre').value.trim();
    const apellido = document.getElementById('sa-admin-apellido').value.trim();
    const email    = document.getElementById('sa-admin-email').value.trim();
    const telefono = document.getElementById('sa-admin-telefono').value.trim();
    const pw       = document.getElementById('sa-admin-password').value;
    const cpw      = document.getElementById('sa-admin-confirm-password').value;

    if (!cNum) { showFieldErr('sa-admin-cedula','sa-cedula-error','La cédula es obligatoria'); valid = false; }
    else {
        const full = `${prefix}-${cNum}`;
        const dup  = (typeof users !== 'undefined') && users.find(u => u.cedula === full && u.id != editingAdminId);
        if (dup) { showFieldErr('sa-admin-cedula','sa-cedula-error','Esta cédula ya está registrada'); valid = false; }
    }

    if (!nombre)   { showFieldErr('sa-admin-nombre','sa-nombre-error','El nombre es obligatorio');    valid = false; }
    if (!apellido) { showFieldErr('sa-admin-apellido','sa-apellido-error','El apellido es obligatorio'); valid = false; }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRe.test(email)) { showFieldErr('sa-admin-email','sa-email-error','Email no válido'); valid = false; }

    if (!editingAdminId) {
        if (!pw)        { showFieldErr('sa-admin-password','sa-password-error','La contraseña es obligatoria'); valid = false; }
        else if (pw.length < 6) { showFieldErr('sa-admin-password','sa-password-error','Mínimo 6 caracteres'); valid = false; }
        if (pw !== cpw) { showFieldErr('sa-admin-confirm-password','sa-confirm-error','Las contraseñas no coinciden'); valid = false; }
    } else {
        if (pw || cpw) {
            if (pw.length < 6) { showFieldErr('sa-admin-password','sa-password-error','Mínimo 6 caracteres'); valid = false; }
            if (pw !== cpw)    { showFieldErr('sa-admin-confirm-password','sa-confirm-error','Las contraseñas no coinciden'); valid = false; }
        }
    }

    if (!valid) return;

    const saveBtn = document.getElementById('sa-modal-save');
    saveBtn.disabled = true;
    saveBtn.innerHTML = "<i class='bx bx-loader-alt sa-spin'></i> Guardando...";

    try {
        const data = { cedula: `${prefix}-${cNum}`, nombre, apellido, email, telefono, rol: 'admin' };
        if (pw) data.password = pw;

        const res = editingAdminId
            ? await updateUser(editingAdminId, data)
            : await addUser(data);

        if (res && res.success) {
            showSAToast(editingAdminId ? 'Administrador actualizado' : 'Administrador registrado', 'success');
            // Al actualizar contraseña, limpiamos solicitudes de reset de ese usuario por seguridad
            if (editingAdminId && pw) {
                await fetch('../api/main.php?action=clear_reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingAdminId })
                });
                fetchSAResets();
            }
            closeAdminModal();
            renderSAAll();
        } else {
            showSAToast('Error al guardar: ' + (res?.error || 'Error desconocido'), 'error');
        }
    } catch (e) {
        showSAToast('Error inesperado al guardar', 'error');
        console.error(e);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "<i class='bx bx-save'></i> Guardar";
    }
}

// ===== ELIMINAR (ADMINISTRADORES, PROFESORES Y ESTUDIANTES) =====
function confirmDelete(id, name, type = 'admin') {
    pendingDeleteId = id;
    pendingDeleteType = type;
    const msg = document.getElementById('sa-confirm-msg');
    if (msg) {
        if (type === 'admin') {
            msg.textContent = `¿Eliminar al administrador "${name}"? Esta acción no se puede deshacer.`;
        } else if (type === 'teacher') {
            msg.textContent = `¿Eliminar al profesor "${name}" permanentemente del sistema escolar? Esta acción no se puede deshacer.`;
        } else if (type === 'student') {
            msg.textContent = `¿Eliminar al estudiante "${name}" permanentemente? Se eliminarán también todas sus calificaciones registradas. Esta acción no se puede deshacer.`;
        }
    }
    document.getElementById('sa-confirm-overlay')?.classList.add('active');
}

function closeConfirm() {
    document.getElementById('sa-confirm-overlay')?.classList.remove('active');
    pendingDeleteId = null;
    pendingDeleteType = 'admin';
}

async function executeDelete() {
    if (!pendingDeleteId) return;
    const btn = document.getElementById('sa-confirm-ok');
    btn.disabled = true;
    btn.innerHTML = "<i class='bx bx-loader-alt sa-spin'></i> Eliminando...";
    try {
        let res;
        if (pendingDeleteType === 'student') {
            res = await deleteStudent(pendingDeleteId);
        } else {
            res = await deleteUser(pendingDeleteId);
        }

        if (res && res.success) {
            const label = pendingDeleteType === 'student'
                ? 'Estudiante eliminado exitosamente'
                : (pendingDeleteType === 'teacher' ? 'Profesor eliminado exitosamente' : 'Administrador eliminado exitosamente');
            showSAToast(label, 'success');
            closeConfirm();
            renderSAAll();
        } else {
            showSAToast('Error al eliminar: ' + (res?.error || ''), 'error');
            closeConfirm();
        }
    } catch (e) {
        showSAToast('Error inesperado', 'error');
        closeConfirm();
    } finally {
        btn.disabled = false;
        btn.innerHTML = "<i class='bx bx-trash'></i> Eliminar";
    }
}

// ===== RESET DE PROFESORES =====
async function fetchSATeacherResets() {
    try {
        const res  = await fetch('../api/main.php?action=get_teacher_reset_requests');
        const data = await res.json();
        renderSATeacherResets(data);
    } catch (e) {
        console.error('Error fetching teacher resets:', e);
    }
}

function renderSATeacherResets(list) {
    const tbody = document.getElementById('sa-teacher-reset-tbody');
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `
            <tr class="sa-empty-row">
                <td colspan="5" class="empty-msg" style="padding: 2rem !important;">
                    <i class='bx bx-check-shield' style="font-size:2rem;color:#16a34a;display:block;margin-bottom:0.5rem;"></i>
                    No hay solicitudes pendientes.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = list.map(r => `
        <tr style="background:#eff6ff;">
            <td style="color:#64748b;font-size:0.8rem;">
                ${new Date(r.reset_fecha).toLocaleString('es-ES', { dateStyle:'short', timeStyle:'short' })}
            </td>
            <td style="font-weight:600;color:#1e293b;">${r.nombre} ${r.apellido}</td>
            <td style="color:#64748b;">${r.cedula}</td>
            <td style="color:#64748b;">${r.email || '—'}</td>
            <td>
                <div class="sa-actions-cell" style="justify-content:center;">
                    <button class="sa-btn-primary" style="padding:0.4rem 0.8rem;font-size:0.75rem;background:#1d4ed8;" onclick="openTeacherPasswordModal(${r.id})" title="Cambiar contraseña">
                        <i class='bx bx-lock-open-alt'></i> Cambiar Clave
                    </button>
                    <button class="sa-btn-secondary" style="padding:0.4rem 0.8rem;font-size:0.75rem;background:#e2e8f0;" onclick="clearSATeacherReset(${r.id})" title="Marcar como resuelto">
                        <i class='bx bx-check'></i> Resuelto
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.clearSATeacherReset = async (id) => {
    try {
        const res  = await fetch('../api/main.php?action=clear_teacher_reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (data.success) {
            showSAToast('Solicitud marcada como resuelta', 'success');
            fetchSATeacherResets();
        }
    } catch (e) {
        console.error(e);
        showSAToast('Error al resolver solicitud', 'error');
    }
};

window.openTeacherPasswordModal = function(id) {
    editingTeacherId = id;
    const teacher = (typeof users !== 'undefined') && users.find(u => u.id == id);
    const descEl  = document.getElementById('sa-teacher-pw-desc');
    if (descEl && teacher) {
        descEl.textContent = `Cambiando contraseña de: ${teacher.nombre} ${teacher.apellido} (${teacher.cedula})`;
    }
    const newPw  = document.getElementById('sa-teacher-new-pw');
    const confPw = document.getElementById('sa-teacher-confirm-pw');
    const errPw  = document.getElementById('sa-teacher-pw-error');
    const errConf= document.getElementById('sa-teacher-confirm-error');
    if (newPw)  { newPw.value  = ''; newPw.type  = 'password'; }
    if (confPw) { confPw.value = ''; confPw.type = 'password'; }
    if (errPw)  { errPw.textContent  = ''; errPw.classList.remove('show'); }
    if (errConf){ errConf.textContent= ''; errConf.classList.remove('show'); }
    // Reset toggle icons
    ['sa-teacher-pw-toggle','sa-teacher-confirm-toggle'].forEach(id => {
        const ic = document.getElementById(id);
        if (ic) { ic.classList.remove('bx-show'); ic.classList.add('bx-hide'); }
    });
    document.getElementById('sa-teacher-pw-modal')?.classList.add('active');
};

function closeTeacherPasswordModal() {
    document.getElementById('sa-teacher-pw-modal')?.classList.remove('active');
    editingTeacherId = null;
}

async function saveTeacherPassword() {
    const pw   = document.getElementById('sa-teacher-new-pw')?.value || '';
    const cpw  = document.getElementById('sa-teacher-confirm-pw')?.value || '';
    const errPw  = document.getElementById('sa-teacher-pw-error');
    const errConf= document.getElementById('sa-teacher-confirm-error');

    if (errPw)  { errPw.textContent  = ''; errPw.classList.remove('show'); }
    if (errConf){ errConf.textContent= ''; errConf.classList.remove('show'); }

    let valid = true;
    if (!pw || pw.length < 6) {
        if (errPw) { errPw.textContent = 'Mínimo 6 caracteres'; errPw.classList.add('show'); }
        valid = false;
    }
    if (pw !== cpw) {
        if (errConf) { errConf.textContent = 'Las contraseñas no coinciden'; errConf.classList.add('show'); }
        valid = false;
    }
    if (!valid) return;

    const saveBtn = document.getElementById('sa-teacher-pw-save');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = "<i class='bx bx-loader-alt sa-spin'></i> Guardando..."; }

    try {
        const teacher = (typeof users !== 'undefined') && users.find(u => u.id == editingTeacherId);
        if (!teacher) throw new Error('Profesor no encontrado');

        const res = await updateUser(editingTeacherId, {
            cedula:       teacher.cedula,
            nombre:       teacher.nombre,
            apellido:     teacher.apellido,
            email:        teacher.email     || '',
            telefono:     teacher.telefono  || '',
            rol:          'teacher',
            tipo_docente: teacher.tipo_docente || 'docente',
            activo:       (teacher.activo !== undefined && teacher.activo !== null) ? teacher.activo : 1,
            password:     pw
        });

        if (res && res.success) {
            // Limpiar la solicitud de reset del profesor
            await fetch('../api/main.php?action=clear_teacher_reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingTeacherId })
            });
            showSAToast('Contraseña del profesor actualizada exitosamente', 'success');
            closeTeacherPasswordModal();
            fetchSATeacherResets();
        } else {
            showSAToast('Error: ' + (res?.error || 'Error desconocido'), 'error');
        }
    } catch(e) {
        showSAToast('Error inesperado al guardar', 'error');
        console.error(e);
    } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = "<i class='bx bx-save'></i> Guardar Contraseña"; }
    }
}

// ===== TOAST =====
function showSAToast(message, type = 'success') {
    document.querySelector('.sa-toast')?.remove();
    const t = document.createElement('div');
    t.className = `sa-toast ${type}`;
    t.innerHTML = `<i class='bx ${type === 'success' ? 'bx-check-circle' : 'bx-x-circle'}'></i><span>${message}</span>`;
    document.body.appendChild(t);
    setTimeout(() => { t.classList.add('fadeout'); setTimeout(() => t.remove(), 320); }, 3200);
}

// ===== MANTENIMIENTO, RESPALDOS E INDEXADO DE BASE DE DATOS =====
let saRestoreFileTarget = null;

async function loadSADatabaseStats() {
    try {
        const res = await fetch('../api/main.php?action=db_stats');
        const data = await res.json();
        if (data && data.success) {
            const nameEl = document.getElementById('sa-db-name');
            const verEl = document.getElementById('sa-db-version');
            const tablesEl = document.getElementById('sa-db-tables');
            const rowsEl = document.getElementById('sa-db-rows');
            const sizeEl = document.getElementById('sa-db-size');
            const backupsEl = document.getElementById('sa-db-backups-count');

            if (nameEl) nameEl.textContent = data.base_datos || 'sistema_ali';
            if (verEl) verEl.textContent = `MySQL ${data.motor_version || ''}`;
            if (tablesEl) tablesEl.textContent = `${data.total_tablas || 0} Tablas`;
            if (rowsEl) rowsEl.textContent = `${data.total_filas || 0}`;
            if (sizeEl) sizeEl.textContent = `${data.tamano_total || '0 MB'}`;
            if (backupsEl) backupsEl.textContent = `${data.total_backups || 0}`;
        }
    } catch (e) {
        console.error('Error al cargar estadísticas de la BD:', e);
    }
}
window.loadSADatabaseStats = loadSADatabaseStats;

async function loadSABackups() {
    const tbody = document.getElementById('sa-backups-tbody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="empty-msg">
                <i class='bx bx-loader-alt sa-spin' style="font-size:1.5rem;display:block;margin-bottom:0.5rem;color:#4a151b;"></i>
                Cargando lista de respaldos...
            </td>
        </tr>
    `;

    try {
        const res = await fetch('../api/main.php?action=list_backups');
        const json = await res.json();
        const backups = (json && json.success && Array.isArray(json.data)) ? json.data : [];

        if (backups.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-msg">
                        <i class='bx bx-archive-out' style="font-size:2rem;color:#64748b;display:block;margin-bottom:0.5rem;"></i>
                        No hay archivos de respaldo generados todavía.<br>
                        Haga clic en <strong>"Crear Respaldo Ahora"</strong> para generar su primera copia.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = backups.map((b, idx) => `
            <tr>
                <td style="font-weight:600;color:#64748b;">${idx + 1}</td>
                <td style="font-weight:500;color:#1e293b;">
                    <i class='bx bxs-file-doc' style="color:#0284c7;font-size:1.2rem;vertical-align:middle;margin-right:0.35rem;"></i>
                    <span>${b.filename}</span>
                </td>
                <td><span style="background:#f1f5f9;color:#334155;padding:0.2rem 0.5rem;border-radius:6px;font-size:0.85rem;font-weight:500;">${b.size}</span></td>
                <td style="color:#64748b;font-size:0.9rem;">${b.date}</td>
                <td style="text-align:center;">
                    <div class="sa-actions-cell" style="justify-content:center;">
                        <button class="sa-btn-icon sa-btn-download" onclick="downloadSABackup('${b.filename}')" title="Descargar archivo SQL">
                            <i class='bx bx-download'></i>
                        </button>
                        <button class="sa-btn-icon sa-btn-restore" onclick="openRestoreModal('${b.filename}')" title="Restaurar base de datos a este punto">
                            <i class='bx bx-history'></i>
                        </button>
                        <button class="sa-btn-icon sa-btn-delete" onclick="confirmDeleteBackup('${b.filename}')" title="Eliminar respaldo">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-msg" style="color:#dc2626;">
                    <i class='bx bx-error-circle' style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>
                    Error al consultar los respaldos disponibles.
                </td>
            </tr>
        `;
        console.error(e);
    }
}
window.loadSABackups = loadSABackups;

async function createSABackup() {
    const btn = document.getElementById('sa-btn-create-backup');
    if (!btn) return;

    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class='bx bx-loader-alt sa-spin'></i> Generando respaldo...`;

    try {
        const res = await fetch('../api/main.php?action=backup_db');
        const json = await res.json();
        if (json && json.success) {
            showSAToast(`Respaldo creado con éxito (${json.size})`, 'success');
            await loadSADatabaseStats();
            await loadSABackups();
        } else {
            showSAToast('Error al generar respaldo: ' + (json?.error || 'Desconocido'), 'error');
        }
    } catch (e) {
        console.error(e);
        showSAToast('Error inesperado al conectar con el servidor', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}
window.createSABackup = createSABackup;

function downloadSABackup(filename) {
    if (!filename) return;
    window.location.href = `../api/main.php?action=download_backup&file=${encodeURIComponent(filename)}`;
}
window.downloadSABackup = downloadSABackup;

function openRestoreModal(filename) {
    saRestoreFileTarget = filename;
    const nameEl = document.getElementById('sa-restore-filename-display');
    if (nameEl) nameEl.textContent = filename;
    const modal = document.getElementById('sa-modal-restore-overlay');
    if (modal) modal.classList.add('active');
}
window.openRestoreModal = openRestoreModal;

function closeRestoreModal() {
    saRestoreFileTarget = null;
    const modal = document.getElementById('sa-modal-restore-overlay');
    if (modal) modal.classList.remove('active');
}
window.closeRestoreModal = closeRestoreModal;

async function executeRestoreBackup() {
    if (!saRestoreFileTarget) return;

    const btn = document.getElementById('sa-restore-confirm-btn');
    if (!btn) return;

    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class='bx bx-loader-alt sa-spin'></i> Restaurando...`;

    try {
        const res = await fetch('../api/main.php?action=restore_backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: saRestoreFileTarget })
        });
        const json = await res.json();

        if (json && json.success) {
            showSAToast('¡Base de datos restaurada correctamente!', 'success');
            closeRestoreModal();
            await loadSADatabaseStats();
            await loadSABackups();
            if (typeof renderSAAll === 'function') renderSAAll();
        } else {
            showSAToast('Error al restaurar: ' + (json?.error || 'Desconocido'), 'error');
        }
    } catch (e) {
        console.error(e);
        showSAToast('Error de comunicación al restaurar la base de datos', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}
window.executeRestoreBackup = executeRestoreBackup;

async function confirmDeleteBackup(filename) {
    if (!confirm(`¿Está seguro de que desea eliminar permanentemente el archivo de respaldo "${filename}"?`)) {
        return;
    }

    try {
        const res = await fetch('../api/main.php?action=delete_backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: filename })
        });
        const json = await res.json();
        if (json && json.success) {
            showSAToast('Respaldo eliminado con éxito', 'success');
            await loadSADatabaseStats();
            await loadSABackups();
        } else {
            showSAToast('Error al eliminar respaldo: ' + (json?.error || ''), 'error');
        }
    } catch (e) {
        console.error(e);
        showSAToast('Error inesperado al eliminar', 'error');
    }
}
window.confirmDeleteBackup = confirmDeleteBackup;

async function optimizeSADatabase() {
    const btn = document.getElementById('sa-btn-optimize-db');
    const tbody = document.getElementById('sa-tables-tbody');
    const badge = document.getElementById('sa-last-optimization-badge');

    if (!btn) return;
    const origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class='bx bx-loader-alt sa-spin'></i> Optimizando e Indexando...`;

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-msg">
                    <i class='bx bx-loader-alt sa-spin' style="font-size:1.8rem;display:block;margin-bottom:0.5rem;color:#0284c7;"></i>
                    Reindexando tablas, analizando estadísticas y desfragmentando almacenamiento...
                </td>
            </tr>
        `;
    }

    try {
        const res = await fetch('../api/main.php?action=optimize_and_index_db');
        const json = await res.json();

        if (json && json.success) {
            const indicesTxt = (json.indices_creados && json.indices_creados.length > 0)
                ? ` Se crearon ${json.indices_creados.length} nuevos índices.`
                : '';
            showSAToast('¡Mantenimiento y reindexado completados con éxito!' + indicesTxt, 'success');

            if (badge) {
                badge.textContent = `Última optimización: ${json.fecha || new Date().toLocaleString()}`;
                badge.style.background = '#dcfce7';
                badge.style.color = '#15803d';
            }

            if (tbody && Array.isArray(json.tablas)) {
                tbody.innerHTML = json.tablas.map(t => `
                    <tr>
                        <td style="font-weight:600;color:#1e293b;">
                            <i class='bx bx-table' style="color:#64748b;vertical-align:middle;margin-right:0.3rem;"></i>
                            ${t.tabla}
                        </td>
                        <td><span style="font-size:0.8rem;background:#f8fafc;padding:0.2rem 0.4rem;border-radius:4px;border:1px solid #e2e8f0;">${t.motor}</span></td>
                        <td>${t.filas}</td>
                        <td style="color:#64748b;">${t.data_kb}</td>
                        <td style="color:#0284c7;font-weight:500;">${t.index_kb}</td>
                        <td style="font-weight:600;color:#334155;">${t.total_kb}</td>
                        <td>
                            <span style="background:${t.check.includes('OK') ? '#dcfce7' : '#fef9c3'};color:${t.check.includes('OK') ? '#15803d' : '#854d0e'};padding:0.2rem 0.55rem;border-radius:12px;font-size:0.75rem;font-weight:600;">
                                ${t.check}
                            </span>
                        </td>
                        <td>
                            <span style="background:#eff6ff;color:#1d4ed8;padding:0.2rem 0.55rem;border-radius:12px;font-size:0.75rem;font-weight:600;">
                                ${t.optimize.includes('OK') || t.optimize.includes('Table does not support') ? 'Optimizado / OK' : t.optimize}
                            </span>
                        </td>
                    </tr>
                `).join('');
            }

            await loadSADatabaseStats();
        } else {
            showSAToast('Error durante la optimización: ' + (json?.error || 'Desconocido'), 'error');
        }
    } catch (e) {
        console.error(e);
        showSAToast('Error inesperado al optimizar la base de datos', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = origHtml;
    }
}
window.optimizeSADatabase = optimizeSADatabase;

// ===== REPORTE DE CONTROL DE USUARIOS Y AUDITORÍA =====
let activityLogs = [];
let filteredActivityLogs = [];

async function loadActivityLogs() {
    const tbody = document.getElementById('sa-reports-tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-msg">
                    <i class='bx bx-loader-alt sa-spin' style="font-size:1.5rem;display:block;margin-bottom:0.5rem;color:#4a151b;"></i>
                    Cargando registros de auditoría...
                </td>
            </tr>
        `;
    }

    try {
        const res = await fetch('../api/main.php?action=get_activity_logs&limit=500');
        const json = await res.json();
        activityLogs = (json && json.success && Array.isArray(json.data)) ? json.data : [];
        filterActivityLogs();
    } catch (e) {
        console.error('Error al cargar logs:', e);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-msg" style="color:#dc2626;">
                        <i class='bx bx-error-circle' style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>
                        Error al cargar el historial de auditoría.
                    </td>
                </tr>
            `;
        }
    }
}
window.loadActivityLogs = loadActivityLogs;

function filterActivityLogs() {
    const entVal = (document.getElementById('sa-report-entity-filter')?.value || '').toLowerCase();
    const actVal = (document.getElementById('sa-report-action-filter')?.value || '').toLowerCase();
    const dFrom  = document.getElementById('sa-report-date-from')?.value || '';
    const dTo    = document.getElementById('sa-report-date-to')?.value || '';
    const search = (document.getElementById('sa-report-search-input')?.value || '').toLowerCase().trim();

    filteredActivityLogs = activityLogs.filter(log => {
        if (entVal && (log.entidad || '').toLowerCase() !== entVal) return false;
        if (actVal && (log.accion || '').toLowerCase() !== actVal) return false;

        if (dFrom) {
            const logDate = (log.fecha || '').split(' ')[0];
            if (logDate < dFrom) return false;
        }
        if (dTo) {
            const logDate = (log.fecha || '').split(' ')[0];
            if (logDate > dTo) return false;
        }

        if (search) {
            const str = `${log.usuario_nombre || ''} ${log.usuario_rol || ''} ${log.accion || ''} ${log.entidad || ''} ${log.entidad_nombre || ''} ${log.detalles || ''}`.toLowerCase();
            if (!str.includes(search)) return false;
        }

        return true;
    });

    renderActivityLogsTable();
}
window.filterActivityLogs = filterActivityLogs;

function getActivityBadge(accion) {
    const act = (accion || '').toLowerCase();
    switch (act) {
        case 'crear':
            return '<span class="sa-role-badge" style="background:#dcfce7;color:#166534;border:1px solid #bbf7d0;"><i class="bx bx-plus-circle"></i> Creación</span>';
        case 'modificar':
            return '<span class="sa-role-badge" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;"><i class="bx bx-edit-alt"></i> Modificación</span>';
        case 'cambio_clave':
            return '<span class="sa-role-badge" style="background:#fef3c7;color:#b45309;border:1px solid #fde68a;"><i class="bx bx-key"></i> Contraseña</span>';
        case 'inhabilitar':
            return '<span class="sa-role-badge" style="background:#fee2e2;color:#b91c1c;border:1px solid #fecaca;"><i class="bx bx-block"></i> Inhabilitación</span>';
        case 'habilitar':
            return '<span class="sa-role-badge" style="background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;"><i class="bx bx-check-circle"></i> Habilitación</span>';
        case 'eliminar':
            return '<span class="sa-role-badge" style="background:#fef2f2;color:#991b1b;border:1px solid #f87171;"><i class="bx bx-trash"></i> Eliminación</span>';
        case 'resolver_reset':
            return '<span class="sa-role-badge" style="background:#f3e8ff;color:#7e22ce;border:1px solid #d8b4fe;"><i class="bx bx-check-double"></i> Reseteo OK</span>';
        case 'backup':
            return '<span class="sa-role-badge" style="background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;"><i class="bx bx-save"></i> Respaldo SQL</span>';
        case 'restaurar':
            return '<span class="sa-role-badge" style="background:#ffedd5;color:#c2410c;border:1px solid #fed7aa;"><i class="bx bx-history"></i> Restauración</span>';
        case 'optimizar':
            return '<span class="sa-role-badge" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;"><i class="bx bx-tachometer"></i> Optimización</span>';
        default:
            return `<span class="sa-role-badge" style="background:#f8fafc;color:#64748b;border:1px solid #e2e8f0;">${accion}</span>`;
    }
}

function getEntityIcon(entidad) {
    const ent = (entidad || '').toLowerCase();
    switch (ent) {
        case 'administrador':
            return "<i class='bx bx-shield' style='color:#4a151b;'></i>";
        case 'profesor':
            return "<i class='bx bx-briefcase' style='color:#2563eb;'></i>";
        case 'estudiante':
            return "<i class='bx bxs-graduation' style='color:#16a34a;'></i>";
        case 'base_datos':
            return "<i class='bx bx-data' style='color:#0284c7;'></i>";
        default:
            return "<i class='bx bx-circle' style='color:#64748b;'></i>";
    }
}

function renderActivityLogsTable() {
    const tbody = document.getElementById('sa-reports-tbody');
    const badge = document.getElementById('sa-report-count-badge');
    if (!tbody) return;

    if (badge) {
        badge.textContent = `${filteredActivityLogs.length} de ${activityLogs.length} eventos`;
    }

    if (filteredActivityLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-msg">
                    <i class='bx bx-search-alt sa-empty-icon' style="font-size:2rem;color:#94a3b8;display:block;margin-bottom:0.4rem;"></i>
                    No se encontraron registros de auditoría con los filtros seleccionados.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredActivityLogs.map((log, idx) => {
        const d = new Date(log.fecha);
        const fDate = isNaN(d.getTime()) ? log.fecha : d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const fTime = isNaN(d.getTime()) ? '' : d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const rolBadge = (log.usuario_rol === 'superadmin')
            ? '<span style="font-size:0.68rem;background:#4a151b;color:#fff;padding:0.15rem 0.45rem;border-radius:10px;font-weight:600;margin-left:4px;">Superadmin</span>'
            : '<span style="font-size:0.68rem;background:#e2e8f0;color:#334155;padding:0.15rem 0.45rem;border-radius:10px;font-weight:600;margin-left:4px;">Admin</span>';

        return `
            <tr>
                <td style="color:#94a3b8;font-size:0.78rem;font-weight:600;">${idx + 1}</td>
                <td>
                    <div style="font-weight:600;color:#1e293b;font-size:0.83rem;">${fDate}</div>
                    <div style="font-size:0.72rem;color:#64748b;"><i class='bx bx-time-five' style="font-size:0.8rem;vertical-align:middle;"></i> ${fTime}</div>
                </td>
                <td>
                    <div style="font-weight:600;color:#1e293b;display:flex;align-items:center;flex-wrap:wrap;gap:2px;">
                        ${log.usuario_nombre}
                        ${rolBadge}
                    </div>
                </td>
                <td>${getActivityBadge(log.accion)}</td>
                <td>
                    <div style="font-weight:600;color:#1e293b;display:flex;align-items:center;gap:0.35rem;">
                        ${getEntityIcon(log.entidad)}
                        <span>${log.entidad_nombre || log.entidad}</span>
                    </div>
                    <div style="font-size:0.72rem;color:#94a3b8;text-transform:capitalize;margin-left:1.3rem;">
                        ${log.entidad}
                    </div>
                </td>
                <td style="color:#475569;font-size:0.82rem;line-height:1.45;">
                    ${log.detalles || '—'}
                </td>
            </tr>
        `;
    }).join('');
}

function imprimirReporteActividad() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const emisor = currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Superadministrador';
    const ahora = new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' });

    const entSel = document.getElementById('sa-report-entity-filter');
    const actSel = document.getElementById('sa-report-action-filter');
    const entTxt = entSel && entSel.value ? entSel.options[entSel.selectedIndex].text : 'Todas las entidades';
    const actTxt = actSel && actSel.value ? actSel.options[actSel.selectedIndex].text : 'Todas las acciones';
    const dFrom  = document.getElementById('sa-report-date-from')?.value || '';
    const dTo    = document.getElementById('sa-report-date-to')?.value || '';
    const search = document.getElementById('sa-report-search-input')?.value || '';

    let filtrosTxt = `Entidad: ${entTxt} | Acción: ${actTxt}`;
    if (dFrom || dTo) filtrosTxt += ` | Período: ${dFrom || 'Inicio'} al ${dTo || 'Hoy'}`;
    if (search) filtrosTxt += ` | Búsqueda: "${search}"`;

    const filasHtml = (filteredActivityLogs || []).map((log, idx) => {
        const d = new Date(log.fecha);
        const fStr = isNaN(d.getTime()) ? log.fecha : `${d.toLocaleDateString('es-ES')} ${d.toLocaleTimeString('es-ES', {hour:'2-digit',minute:'2-digit'})}`;
        return `
            <tr style="border-bottom:1px solid #e2e8f0;font-size:11px;">
                <td style="padding:6px 8px;text-align:center;color:#64748b;">${idx + 1}</td>
                <td style="padding:6px 8px;white-space:nowrap;font-weight:600;color:#1e293b;">${fStr}</td>
                <td style="padding:6px 8px;color:#1e293b;">${log.usuario_nombre} <span style="font-size:9px;color:#64748b;">(${log.usuario_rol})</span></td>
                <td style="padding:6px 8px;text-transform:uppercase;font-weight:700;font-size:10px;color:#4a151b;">${log.accion.replace('_', ' ')}</td>
                <td style="padding:6px 8px;font-weight:600;color:#1e293b;">${log.entidad_nombre || log.entidad} <span style="font-size:9px;color:#64748b;font-weight:normal;">(${log.entidad})</span></td>
                <td style="padding:6px 8px;color:#475569;">${log.detalles || '—'}</td>
            </tr>
        `;
    }).join('');

    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Control de Usuarios - E.T.R. Alí Primera</title>
            <style>
                @page { size: landscape; margin: 1.2cm; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
                .report-header { text-align: center; border-bottom: 2px solid #4a151b; padding-bottom: 12px; margin-bottom: 16px; }
                .report-header h4 { margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                .report-header h2 { margin: 6px 0 2px; color: #4a151b; font-size: 18px; }
                .report-header h3 { margin: 0; color: #1e293b; font-size: 13px; font-weight: 600; }
                .meta-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; font-size: 11px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
                table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                th { background: #4a151b; color: #ffffff; padding: 8px; font-size: 11px; text-transform: uppercase; text-align: left; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .footer-signatures { margin-top: 40px; display: flex; justify-content: space-around; text-align: center; font-size: 11px; }
                .signature-line { width: 220px; border-top: 1px solid #1e293b; padding-top: 6px; margin: 40px auto 0; font-weight: 600; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom:15px;display:flex;justify-content:flex-end;gap:10px;">
                <button onclick="window.print()" style="background:#4a151b;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:600;cursor:pointer;">
                    🖨️ Imprimir / Guardar como PDF
                </button>
                <button onclick="window.close()" style="background:#e2e8f0;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">
                    Cerrar
                </button>
            </div>

            <div class="report-header">
                <h4>República Bolivariana de Venezuela · Ministerio del Poder Popular para la Educación</h4>
                <h2>ESCUELA TÉCNICA ROBINSONIANA Y ZAMORANA "ALÍ PRIMERA"</h2>
                <h3>REPORTE INSTITUCIONAL DE CONTROL DE USUARIOS Y AUDITORÍA DE CAMBIOS</h3>
            </div>

            <div class="meta-box">
                <div><strong>Fecha de emisión:</strong> ${ahora}</div>
                <div><strong>Emitido por:</strong> ${emisor} (Superadministrador)</div>
                <div><strong>Criterios y filtros:</strong> ${filtrosTxt}</div>
                <div><strong>Total de operaciones auditadas:</strong> ${(filteredActivityLogs || []).length} registros</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width:30px;text-align:center;">#</th>
                        <th style="width:110px;">Fecha y Hora</th>
                        <th style="width:160px;">Responsable</th>
                        <th style="width:110px;">Acción</th>
                        <th style="width:180px;">Entidad / Afectado</th>
                        <th>Detalle de la Operación</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHtml || '<tr><td colspan="6" style="text-align:center;padding:20px;">No hay registros con los criterios seleccionados.</td></tr>'}
                </tbody>
            </table>

            <div class="footer-signatures">
                <div>
                    <div class="signature-line">${emisor}<br><span style="font-size:10px;font-weight:normal;color:#64748b;">Superadministrador del Sistema</span></div>
                </div>
                <div>
                    <div class="signature-line">Dirección del Plantel<br><span style="font-size:10px;font-weight:normal;color:#64748b;">Sello y Visto Bueno Institucional</span></div>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 400);
                };
            </script>
        </body>
        </html>
    `);
    ventana.document.close();
}
window.imprimirReporteActividad = imprimirReporteActividad;

// ===== INIT EN DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', async () => {

    // Guard
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser || currentUser.rol !== 'superadmin') {
        window.location.href = '../login/login.html';
        return;
    }

    // Mostrar nombre
    const nameEl   = document.getElementById('sa-user-name');
    const avatarEl = document.getElementById('sa-user-avatar');
    if (nameEl)   nameEl.textContent   = `${currentUser.nombre} ${currentUser.apellido}`;
    if (avatarEl) avatarEl.textContent = (currentUser.nombre || 'S')[0].toUpperCase();

    // Cerrar sesión
    document.getElementById('sa-logout-btn')?.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = '../login/login.html';
    });

    // Cargar datos (data.js llama window.renderAll al terminar)
    if (typeof initData === 'function') {
        await initData();
    }

    // Búsquedas y filtros
    document.getElementById('sa-search-input')?.addEventListener('input', e => {
        renderAdminsTable(e.target.value.trim());
    });
    document.getElementById('sa-search-teachers-input')?.addEventListener('input', e => {
        renderTeachersTable(e.target.value.trim());
    });

    // Filtros de estudiantes
    document.getElementById('sa-student-mention-filter')?.addEventListener('change', e => {
        saStudentMentionFilter = e.target.value;
        updateSASectionFilterOptions();
        renderStudentsTable();
    });
    document.getElementById('sa-student-section-filter')?.addEventListener('change', e => {
        saStudentSectionFilter = e.target.value;
        renderStudentsTable();
    });
    document.getElementById('sa-search-students-input')?.addEventListener('input', e => {
        renderStudentsTable(e.target.value.trim());
    });

    // Botón refrescar / sincronizar estudiantes
    document.getElementById('sa-refresh-students-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('sa-refresh-students-btn');
        if (btn) {
            btn.innerHTML = `<i class='bx bx-loader-alt sa-spin' style="font-size:1.3rem;"></i>`;
            btn.disabled = true;
        }
        if (typeof initData === 'function') {
            await initData();
        }
        populateSAStudentFilters();
        renderStudentsTable();
        showSAToast('Estudiantes sincronizados con la base de datos', 'success');
        if (btn) {
            btn.innerHTML = `<i class='bx bx-refresh' style="font-size:1.3rem;"></i>`;
            btn.disabled = false;
        }
    });

    // Sincronización automática al volver a la ventana
    window.addEventListener('focus', async () => {
        if (currentSATab === 'students' && typeof initData === 'function') {
            await initData();
            populateSAStudentFilters();
            renderStudentsTable();
        }
    });

    // Nuevo admin
    document.getElementById('sa-add-admin-btn')?.addEventListener('click', () => openAdminModal(null));

    // Modal eventos
    document.getElementById('sa-modal-close')?.addEventListener('click',  closeAdminModal);
    document.getElementById('sa-modal-cancel')?.addEventListener('click', closeAdminModal);
    document.getElementById('sa-modal-save')?.addEventListener('click',   handleSaveAdmin);
    document.getElementById('sa-modal-overlay')?.addEventListener('click', e => {
        if (e.target === document.getElementById('sa-modal-overlay')) closeAdminModal();
    });

    // Toggle passwords
    document.getElementById('sa-pw-toggle-1')?.addEventListener('click', () => togglePw('sa-admin-password', 'sa-pw-toggle-1'));
    document.getElementById('sa-pw-toggle-2')?.addEventListener('click', () => togglePw('sa-admin-confirm-password', 'sa-pw-toggle-2'));

    // Confirm dialog
    document.getElementById('sa-confirm-cancel')?.addEventListener('click', closeConfirm);
    document.getElementById('sa-confirm-ok')?.addEventListener('click',     executeDelete);

    // Modal contraseña profesor
    document.getElementById('sa-teacher-pw-close')?.addEventListener('click',  closeTeacherPasswordModal);
    document.getElementById('sa-teacher-pw-cancel')?.addEventListener('click', closeTeacherPasswordModal);
    document.getElementById('sa-teacher-pw-save')?.addEventListener('click',   saveTeacherPassword);
    document.getElementById('sa-teacher-pw-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('sa-teacher-pw-modal')) closeTeacherPasswordModal();
    });
    document.getElementById('sa-teacher-pw-toggle')?.addEventListener('click', () => togglePw('sa-teacher-new-pw', 'sa-teacher-pw-toggle'));
    document.getElementById('sa-teacher-confirm-toggle')?.addEventListener('click', () => togglePw('sa-teacher-confirm-pw', 'sa-teacher-confirm-toggle'));

    // Base de datos y respaldos
    document.getElementById('sa-btn-create-backup')?.addEventListener('click', createSABackup);
    document.getElementById('sa-btn-optimize-db')?.addEventListener('click',   optimizeSADatabase);
    document.getElementById('sa-restore-cancel-btn')?.addEventListener('click', closeRestoreModal);
    document.getElementById('sa-restore-confirm-btn')?.addEventListener('click', executeRestoreBackup);
    document.getElementById('sa-modal-restore-overlay')?.addEventListener('click', e => {
        if (e.target === document.getElementById('sa-modal-restore-overlay')) closeRestoreModal();
    });

    // Reportes y Auditoría
    document.getElementById('sa-btn-print-report')?.addEventListener('click', imprimirReporteActividad);
    document.getElementById('sa-refresh-reports-btn')?.addEventListener('click', () => {
        loadActivityLogs();
        showSAToast('Historial de auditoría actualizado', 'success');
    });
    document.getElementById('sa-report-entity-filter')?.addEventListener('change', filterActivityLogs);
    document.getElementById('sa-report-action-filter')?.addEventListener('change', filterActivityLogs);
    document.getElementById('sa-report-date-from')?.addEventListener('change', filterActivityLogs);
    document.getElementById('sa-report-date-to')?.addEventListener('change', filterActivityLogs);
    document.getElementById('sa-report-search-input')?.addEventListener('input', filterActivityLogs);

    // Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeAdminModal(); closeConfirm(); closeTeacherPasswordModal(); closeRestoreModal(); }
    });
});
