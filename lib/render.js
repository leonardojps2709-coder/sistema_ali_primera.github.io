// lib/render.js
// Motor unificado de renderizado para paneles de Administrador y Profesor
// Detecta automáticamente el rol del usuario mediante window.currentTeacher

// Estado global de filtros de profesores (Admin)
let teacherFilters = {
    mencion: '',
    search: ''
};

// Estado global de filtros de estudiantes (Admin)
let studentFilters = {
    mencion: '',
    seccion: '',
    status: '',
    search: ''
};

// Variable para búsqueda de profesor (Profesor)
window.profStudentSearchQuery = window.profStudentSearchQuery || '';

// ========== FUNCIONES AUXILIARES GLOBALES ==========
function extraerAnio(nombre) {
    if (!nombre) return 999;
    const match = String(nombre).match(/\d+/);
    return match ? parseInt(match[0]) : 999;
}

function getSectionName(sectionId) {
    if (!sectionId) return '';
    const sectionList = typeof sections !== 'undefined' ? sections : [];
    const section = sectionList.find(s => s.id == parseInt(sectionId));
    return section ? section.nombre : '';
}

function getMencionFromSection(sectionId) {
    if (!sectionId) return '';
    const sectionList = typeof sections !== 'undefined' ? sections : [];
    const mentionList = typeof mentions !== 'undefined' ? mentions : [];
    const section = sectionList.find(s => s.id == parseInt(sectionId));
    if (!section) return '';
    const mention = mentionList.find(m => m.id == (section.mencion_id || section.mencionId));
    return mention ? mention.nombre : '';
}

function getMencionIdFromSection(sectionId) {
    if (!sectionId) return '';
    const sectionList = typeof sections !== 'undefined' ? sections : [];
    const section = sectionList.find(s => s.id == parseInt(sectionId));
    return section ? (section.mencion_id || section.mencionId || '') : '';
}

function getUserInitials(nombre, apellido) {
    const n = (nombre || '').charAt(0).toUpperCase();
    const a = (apellido || '').charAt(0).toUpperCase();
    return n + a;
}

function highlightText(text, query) {
    if (!query || !text) return text || '';
    const escaped = String(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    return String(text).replace(re, '<mark class="search-mark">$1</mark>');
}

// Exponer helpers en window
window.extraerAnio = extraerAnio;
window.getSectionName = getSectionName;
window.getMencionFromSection = getMencionFromSection;
window.getMencionIdFromSection = getMencionIdFromSection;
window.getUserInitials = getUserInitials;
window.highlightText = highlightText;

// ========== ESTUDIANTES: FILTROS Y RENDERIZADO ==========
function updateSectionFilterOptions(selectedMencionId = '') {
    const sectionFilter = document.getElementById('student-section-filter');
    if (!sectionFilter) return;

    const sectionList = typeof sections !== 'undefined' ? sections : [];
    const isTeacher = !!window.currentTeacher;
    let filteredSections = sectionList;

    if (isTeacher && window.currentTeacher.secciones) {
        filteredSections = filteredSections.filter(s => window.currentTeacher.secciones.includes(s.id));
    }

    if (selectedMencionId) {
        filteredSections = filteredSections.filter(s => (s.mencion_id == selectedMencionId || s.mencionId == selectedMencionId));
    }

    const sortedSections = [...filteredSections].sort((a, b) => {
        const anioA = extraerAnio(a.nombre);
        const anioB = extraerAnio(b.nombre);
        return anioA - anioB || a.nombre.localeCompare(b.nombre);
    });

    const currentValue = sectionFilter.value;
    if (sortedSections.length === 0) {
        sectionFilter.innerHTML = '<option value="">No hay secciones</option>';
    } else {
        sectionFilter.innerHTML = '<option value="">Todas las secciones</option>' +
            sortedSections.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
    }

    if (currentValue && (currentValue === '' || sortedSections.some(s => s.id == currentValue))) {
        sectionFilter.value = currentValue;
    }
}

function initializeStudentFilters() {
    const mentionFilter = document.getElementById('student-mention-filter');
    const sectionFilter = document.getElementById('student-section-filter');
    if (!mentionFilter && !sectionFilter) return;

    const mentionList = typeof mentions !== 'undefined' ? mentions : [];
    const isTeacher = !!window.currentTeacher;
    let availableMentions = mentionList;

    if (isTeacher && window.currentTeacher.secciones) {
        const sectionList = typeof sections !== 'undefined' ? sections : [];
        const allowedMentionIds = new Set();
        sectionList.forEach(s => {
            if (window.currentTeacher.secciones.includes(s.id)) {
                allowedMentionIds.add(s.mencion_id || s.mencionId);
            }
        });
        availableMentions = mentionList.filter(m => allowedMentionIds.has(m.id));
    }

    if (mentionFilter) {
        const currentMencion = mentionFilter.value;
        mentionFilter.innerHTML = '<option value="">Todas las menciones</option>' +
            availableMentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        if (currentMencion && availableMentions.some(m => m.id == currentMencion)) {
            mentionFilter.value = currentMencion;
        }
        updateSectionFilterOptions(mentionFilter.value);
    }
}

function renderStudentsWithFilters() {
    // 1. Vista de Profesor (tabla simplificada con tbody id 'students-list-body')
    const profTbody = document.getElementById('students-list-body');
    if (profTbody) {
        renderProfStudents(profTbody);
        return;
    }

    // 2. Vista de Admin (tabla completa con tbody id 'students-table-body')
    const adminTbody = document.getElementById('students-table-body');
    if (adminTbody) {
        renderAdminStudents(adminTbody);
    }
}

function renderProfStudents(tbody) {
    const studentList = typeof students !== 'undefined' ? students : [];
    let teacherSections = (window.currentTeacher && window.currentTeacher.secciones) ? window.currentTeacher.secciones : [];
    let filtered = studentList.filter(s => teacherSections.includes(parseInt(s.seccion_id || s.seccion)));

    const mentionId = document.getElementById('student-mention-filter')?.value;
    const sectionId = document.getElementById('student-section-filter')?.value;
    const sectionList = typeof sections !== 'undefined' ? sections : [];

    if (mentionId) {
        const allowedSectionIds = sectionList.filter(s => (s.mencion_id == mentionId || s.mencionId == mentionId)).map(s => s.id);
        filtered = filtered.filter(s => allowedSectionIds.includes(parseInt(s.seccion_id || s.seccion)));
    }
    if (sectionId) {
        filtered = filtered.filter(s => parseInt(s.seccion_id || s.seccion) == sectionId);
    }

    const q = (window.profStudentSearchQuery || '').toLowerCase();
    if (q) {
        filtered = filtered.filter(s => {
            const secNombre = getSectionName(s.seccion_id || s.seccion);
            return [s.cedula, s.nombre, s.apellido, s.email, s.telefono, secNombre]
                .some(v => v && String(v).toLowerCase().includes(q));
        });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align:center;padding:3rem 1rem;color:#94a3b8;"><i class='bx bx-search-alt' style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>No se encontraron estudiantes</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(s => {
        const sectionName = getSectionName(s.seccion_id || s.seccion);
        const fullName = highlightText(`${s.apellido || ''}, ${s.nombre || ''}`, q);
        const ced = highlightText(s.cedula || '', q);
        const sec = highlightText(sectionName || 'Sin sección', q);

        return `
            <tr>
                <td>
                    <div class="user-cell">
                        <div>
                            <div class="user-name">${fullName}</div>
                            <div class="user-sub">CI: ${ced}</div>
                        </div>
                    </div>
                </td>
                <td>${sec}</td>
            </tr>
        `;
    }).join('');
}

function renderAdminStudents(tbody) {
    const studentList = typeof students !== 'undefined' ? students : [];
    let filtered = studentList;

    if (studentFilters.status !== undefined && studentFilters.status !== '') {
        const targetActivo = parseInt(studentFilters.status);
        filtered = filtered.filter(s => {
            const isAct = s.activo === undefined || s.activo === null || parseInt(s.activo) === 1 ? 1 : 0;
            return isAct === targetActivo;
        });
    }

    if (studentFilters.mencion) {
        const sectionList = typeof sections !== 'undefined' ? sections : [];
        const allowedSectionIds = sectionList.filter(s => (s.mencion_id == studentFilters.mencion || s.mencionId == studentFilters.mencion)).map(s => s.id);
        filtered = filtered.filter(s => allowedSectionIds.includes(parseInt(s.seccion_id || s.seccion)));
    }
    if (studentFilters.seccion) {
        filtered = filtered.filter(s => parseInt(s.seccion_id || s.seccion) == studentFilters.seccion);
    }

    const q = (studentFilters.search || '').toLowerCase();
    if (q) {
        filtered = filtered.filter(s => {
            const secNombre = getSectionName(s.seccion_id || s.seccion);
            const mencNombre = getMencionFromSection(s.seccion_id || s.seccion);
            return [s.cedula, s.nombre, s.apellido, s.email, s.telefono, secNombre, mencNombre]
                .some(v => v && String(v).toLowerCase().includes(q));
        });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3.5rem 2rem;color:#94a3b8;"><i class='bx bx-search-alt' style="font-size:2.5rem;display:block;margin-bottom:0.75rem;color:#cbd5e1;"></i>No se encontraron estudiantes</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(s => {
        const secId = s.seccion_id || s.seccion;
        const mencionNombre = getMencionFromSection(secId);
        const seccionNombre = getSectionName(secId);
        const fullName = highlightText(`${s.apellido || ''}, ${s.nombre || ''}`, q);
        const ced = highlightText(s.cedula || '', q);
        const mail = highlightText(s.email || '', q);
        const tel = highlightText(s.telefono || '', q);
        const sec = highlightText(seccionNombre || 'Sin sección', q);
        const men = highlightText(mencionNombre || 'Sin mención', q);

        return `
            <tr>
                <td>
                    <div class="user-cell">
                        <div>
                            <div class="user-name">${fullName}</div>
                            <div class="user-sub">CI: ${ced} | Tel: ${tel}</div>
                        </div>
                    </div>
                </td>
                <td style="font-size:0.83rem;color:#64748b;">${mail}</td>
                <td>${sec}</td>
                <td>${men}</td>
                <td>
                    <div style="display:flex;gap:4px;">
                        <button class="btn-icon view-profile view-student-profile" data-id="${s.id}" title="Ver Perfil"><i class='bx bx-user-detail'></i></button>
                        <button class="btn-icon edit-student" data-id="${s.id}" title="Editar"><i class='bx bx-edit-alt'></i></button>
                        <button class="btn-icon delete delete-student" data-id="${s.id}" title="Eliminar"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderStudents() {
    renderStudentsWithFilters();
}

// ========== USUARIOS Y PROFESORES (ADMIN) ==========
function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    const userList = typeof users !== 'undefined' ? users : [];

    if (userList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-msg">No hay usuarios registrados</td></tr>`;
        return;
    }

    tbody.innerHTML = userList.map(u => {
        const isAdmin = u.rol === 'admin';
        const roleName = isAdmin ? 'Administrador' : 'Profesor';
        const rowBg = isAdmin ? '#e0f2fe' : '#f3e8ff';

        return `
            <tr style="background-color: ${rowBg};">
                <td>${u.cedula}</td>
                <td>${u.nombre}</td>
                <td>${u.apellido}</td>
                <td>${u.email}</td>
                <td>${u.telefono}</td>
                <td style="font-weight: 500;">${roleName}</td>
                <td>
                    <button class="btn-icon edit-user" data-id="${u.id}"><i class='bx bx-edit'></i></button>
                    <button class="btn-icon delete delete-user" data-id="${u.id}"><i class='bx bx-trash'></i></button>
                </td>
            </tr>
        `;
    }).join('');

    const totalEl = document.getElementById('total-users');
    if (totalEl) totalEl.innerText = `${userList.length} Registrados`;
}

function renderTeachers() {
    const tbody = document.getElementById('teachers-table-body');
    if (!tbody) return;
    const userList = typeof users !== 'undefined' ? users : [];
    let teachers = userList.filter(u => u.rol === 'teacher');

    if (teacherFilters.mencion) {
        teachers = teachers.filter(t => {
            let asig = [];
            try { asig = typeof t.asignaciones === 'string' ? JSON.parse(t.asignaciones) : (t.asignaciones || []); } catch(e){}
            return asig.some(a => getMencionIdFromSection(a.seccion_id) == teacherFilters.mencion);
        });
    }

    const q = (teacherFilters.search || '').toLowerCase();
    if (q) {
        teachers = teachers.filter(t => [t.cedula, t.nombre, t.apellido, t.email, t.telefono].some(v => v && String(v).toLowerCase().includes(q)));
    }

    if (teachers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-msg" style="text-align:center;padding:2rem;color:#94a3b8;">No se encontraron profesores</td></tr>`;
        return;
    }

    tbody.innerHTML = teachers.flatMap(t => {
        let asig = [];
        try { asig = typeof t.asignaciones === 'string' ? JSON.parse(t.asignaciones) : (t.asignaciones || []); } catch(e){}

        const asignacionesPorMencion = {};
        if (asig.length === 0) {
            asignacionesPorMencion[''] = [];
        } else {
            asig.forEach(a => {
                const mId = getMencionIdFromSection(a.seccion_id) || '';
                if (!asignacionesPorMencion[mId]) asignacionesPorMencion[mId] = [];
                asignacionesPorMencion[mId].push(a);
            });
        }

        return Object.entries(asignacionesPorMencion).map(([mencionId, asignacionesGrupo]) => {
            const mencionProfesor = mencionId ? getMencionFromSection(asignacionesGrupo[0]?.seccion_id) : 'General';
            const secIds = [...new Set(asignacionesGrupo.map(a => a.seccion_id))];
            const seccionBadges = secIds.length > 0 ? secIds.map(id => highlightText(getSectionName(id), q)).join(', ') : '<span style="color:#94a3b8;font-size:0.8rem;">Sin asignar</span>';
            const matNames = [...new Set(asignacionesGrupo.map(a => a.materia_nombre || a.materia))];
            const materiaBadges = matNames.length > 0 ? matNames.map(m => highlightText(m, q)).join(', ') : '<span style="color:#94a3b8;font-size:0.8rem;">Sin asignar</span>';
            const fullName = highlightText(`${t.apellido || ''}, ${t.nombre || ''}`, q);
            const mail = highlightText(t.email || '', q);

            return `
                <tr>
                    <td>
                        <div class="user-cell">
                            <div>
                                <div class="user-name">${fullName}</div>
                                <div class="user-sub">${mail}</div>
                            </div>
                        </div>
                    </td>
                    <td><div>${materiaBadges}</div></td>
                    <td><div>${seccionBadges}</div></td>
                    <td style="font-weight: 500;">${highlightText(mencionProfesor, q)}</td>
                    <td>
                        <div style="display:flex;gap:4px;">
                            <button class="btn-icon edit-teacher" data-id="${t.id}" title="Editar"><i class='bx bx-edit-alt'></i></button>
                            <button class="btn-icon delete delete-teacher" data-id="${t.id}" title="Eliminar"><i class='bx bx-trash'></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }).join('');
}

function renderAdmins() {
    const tbody = document.getElementById('admins-table-body');
    if (!tbody) return;
    const userList = typeof users !== 'undefined' ? users : [];
    const admins = userList.filter(u => u.rol === 'admin');

    if (admins.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">No hay administradores registrados</td></tr>`;
        return;
    }

    tbody.innerHTML = admins.map(a => `
        <tr style="background-color: #e0f2fe;">
            <td>${a.cedula}</td>
            <td>${a.nombre}</td>
            <td>${a.apellido}</td>
            <td>${a.email}</td>
            <td>${a.telefono}</td>
            <td>
                <button class="btn-icon edit-admin" data-id="${a.id}"><i class='bx bx-edit'></i></button>
                <button class="btn-icon delete delete-admin" data-id="${a.id}"><i class='bx bx-trash'></i></button>
            </td>
        </tr>
    `).join('');
}

// ========== MENCIONES ==========
function renderMentions() {
    const tbody = document.getElementById('mentions-table-body');
    const mentionList = typeof mentions !== 'undefined' ? mentions : [];
    const isTeacher = !!window.currentTeacher;

    let availableMentions = mentionList;
    if (isTeacher && window.currentTeacher.secciones) {
        const sectionList = typeof sections !== 'undefined' ? sections : [];
        const allowedMentionIds = new Set();
        sectionList.forEach(s => {
            if (window.currentTeacher.secciones.includes(s.id)) {
                allowedMentionIds.add(s.mencion_id || s.mencionId);
            }
        });
        availableMentions = mentionList.filter(m => allowedMentionIds.has(m.id));
    }

    if (tbody) {
        if (availableMentions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" class="empty-msg">No hay menciones disponibles</td></tr>`;
        } else {
            tbody.innerHTML = availableMentions.map(m => `
                <tr>
                    <td>${m.id}</td>
                    <td>${m.nombre}</td>
                </tr>
            `).join('');
        }
    }

    const totalEl = document.getElementById('total-mentions');
    if (totalEl) totalEl.innerText = `${availableMentions.length} Áreas Técnicas`;

    // Actualizar filtros de mención en la página
    const mentionFilter = document.getElementById('mention-filter');
    if (mentionFilter) {
        const cur = mentionFilter.value;
        mentionFilter.innerHTML = '<option value="">Todas las menciones</option>' +
            availableMentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        if (cur && availableMentions.some(m => m.id == cur)) mentionFilter.value = cur;
        mentionFilter.onchange = () => renderSections();
    }
}

// ========== SECCIONES ==========
function renderSections() {
    const container = document.getElementById('sections-cards-container');
    if (!container) return;

    const sectionList = typeof sections !== 'undefined' ? sections : [];
    const isTeacher = !!window.currentTeacher;
    let filtered = sectionList;

    if (isTeacher && window.currentTeacher.secciones) {
        filtered = filtered.filter(s => window.currentTeacher.secciones.includes(s.id));
    }

    const mentionFilter = document.getElementById('mention-filter');
    const selectedMention = mentionFilter ? mentionFilter.value : '';
    if (selectedMention) {
        filtered = filtered.filter(s => (s.mencion_id == selectedMention || s.mencionId == selectedMention));
    }

    filtered.sort((a, b) => {
        const anioA = extraerAnio(a.nombre);
        const anioB = extraerAnio(b.nombre);
        return anioA - anioB || a.nombre.localeCompare(b.nombre);
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-msg" style="padding:2rem;text-align:center;color:#64748b;background:white;border-radius:8px;border:1px dashed #cbd5e1;">No hay secciones asignadas o disponibles</div>`;
        return;
    }

    // Agrupar por año
    const yearsGroup = {};
    filtered.forEach(s => {
        const anio = extraerAnio(s.nombre);
        if (!yearsGroup[anio]) yearsGroup[anio] = [];
        yearsGroup[anio].push(s);
    });

    const sortedYears = Object.keys(yearsGroup).map(Number).sort((a, b) => a - b);
    let activeTab = sortedYears[0];

    let tabsHtml = '<div class="sec-tabs">';
    sortedYears.forEach(y => {
        let label = `${y}ro Año`;
        if (y === 2) label = '2do Año';
        else if (y === 3) label = '3ro Año';
        else if (y >= 4 && y <= 6) label = `${y}to Año`;
        else if (y === 999) label = 'Otros';

        tabsHtml += `<div class="sec-tab ${y === activeTab ? 'active' : ''}" data-year="${y}">${label}</div>`;
    });
    tabsHtml += '</div>';

    let contentsHtml = '';
    sortedYears.forEach(y => {
        contentsHtml += `<div class="sec-tab-content ${y === activeTab ? 'active' : ''}" id="sec-tab-${y}">`;
        contentsHtml += '<div class="sections-grid">';

        contentsHtml += yearsGroup[y].map(s => {
            const mentionName = getMencionFromSection(s.id);
            let profGuia = s.profesor_guia_nombre || 'Sin Asignar';
            if (!s.profesor_guia_nombre && s.profesor_guia_id && typeof users !== 'undefined') {
                const u = users.find(user => user.id == s.profesor_guia_id);
                if (u) profGuia = `${u.nombre} ${u.apellido}`;
            }

            // Acciones solo para administradores
            const actionsHtml = !isTeacher ? `
                <div class="card-actions" style="position: absolute; top: 15px; right: 15px; display: flex; gap: 6px;">
                    <button class="btn-icon edit-section" data-id="${s.id}" title="Editar" style="border:1px solid #e2e8f0;background:#f8fafc;color:#2563eb;width:32px;height:32px;border-radius:5px;cursor:pointer;"><i class='bx bx-edit-alt'></i></button>
                    <button class="btn-icon delete-section" data-id="${s.id}" title="Eliminar" style="border:1px solid #e2e8f0;background:#f8fafc;color:#dc2626;width:32px;height:32px;border-radius:5px;cursor:pointer;"><i class='bx bx-trash'></i></button>
                </div>
            ` : '';

            return `
                <div class="section-card hover-card section-card-clickable" data-id="${s.id}" style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:20px;position:relative;cursor:pointer;">
                    ${actionsHtml}
                    <h3 style="margin:0 0 5px;font-size:1.25rem;color:#1e293b;padding-right:${!isTeacher ? '90px' : '0'};">${s.nombre}</h3>
                    <div class="mencion" style="color:#64748b;font-size:0.85rem;margin-bottom:10px;">
                        Mención: <strong>${mentionName || 'Ninguna'}</strong>
                    </div>
                    <div style="font-size:0.85rem;color:#475569;border-top:1px solid #f1f5f9;padding-top:10px;">
                        Profesor Guía: <strong style="color:#1e293b;">${profGuia}</strong>
                    </div>
                </div>
            `;
        }).join('');

        contentsHtml += '</div></div>';
    });

    container.innerHTML = tabsHtml + contentsHtml;

    // Listeners de tabs
    container.querySelectorAll('.sec-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            container.querySelectorAll('.sec-tab').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.sec-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById('sec-tab-' + tab.getAttribute('data-year'));
            if (target) target.classList.add('active');
        });
    });

    // Clic en tarjeta para abrir modal de detalle de sección
    container.querySelectorAll('.section-card-clickable').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-actions')) return;
            const secId = card.dataset.id;
            if (typeof window.openSectionDetailModal === 'function') {
                window.openSectionDetailModal(secId);
            }
        });
    });
}

// ========== PERIODOS ==========
function renderPeriods() {
    const tbody = document.getElementById('periods-table-body');
    const periodList = typeof periods !== 'undefined' ? periods : [];

    if (tbody) {
        if (periodList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-msg">No hay períodos registrados</td></tr>`;
        } else {
            tbody.innerHTML = periodList.map(p => `
                <tr>
                    <td style="font-weight:600;">${escHtml(p.nombre)}</td>
                    <td>${p.fecha_inicio || p.fechaInicio || '-'}</td>
                    <td>${p.fecha_fin || p.fechaFin || '-'}</td>
                    <td><span class="status-badge ${p.estado === 'cerrado' ? 'status-closed' : 'status-active'}">${p.estado || 'activo'}</span></td>
                    <td>
                        <button class="btn-icon edit-period" data-id="${p.id}"><i class='bx bx-edit'></i></button>
                        <button class="btn-icon delete delete-period" data-id="${p.id}"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>
            `).join('');
        }
    }

    const cardsContainer = document.getElementById('periods-cards-container');
    if (cardsContainer) {
        if (periodList.length === 0) {
            cardsContainer.innerHTML = `<div class="empty-msg" style="padding:2rem;text-align:center;">No hay períodos registrados</div>`;
        } else {
            cardsContainer.innerHTML = periodList.map(p => `
                <div class="period-card" style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:15px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <h3 style="margin:0;color:#1e293b;">${escHtml(p.nombre)}</h3>
                        <span class="status-badge ${p.estado === 'cerrado' ? 'status-closed' : 'status-active'}">${p.estado || 'activo'}</span>
                    </div>
                    <p style="margin:10px 0 0;color:#64748b;font-size:0.9rem;">
                        Vigencia: ${p.fecha_inicio || p.fechaInicio || '-'} hasta ${p.fecha_fin || p.fechaFin || '-'}
                    </p>
                </div>
            `).join('');
        }
    }
}

// ========== DASHBOARD STATS ==========
function updateDashboardStats() {
    const isTeacher = !!window.currentTeacher;
    const studentList = typeof students !== 'undefined' ? students : [];
    const sectionList = typeof sections !== 'undefined' ? sections : [];
    const userList = typeof users !== 'undefined' ? users : [];
    const mentionList = typeof mentions !== 'undefined' ? mentions : [];

    if (isTeacher) {
        const teacherSections = window.currentTeacher.secciones || [];
        const myStudents = studentList.filter(s => teacherSections.includes(parseInt(s.seccion_id || s.seccion)));

        const stDisplay = document.getElementById('total-students-home') || document.getElementById('total-students');
        if (stDisplay) stDisplay.innerText = `${myStudents.length} Estudiantes`;

        const secDisplay = document.getElementById('total-sections-home') || document.getElementById('total-sections');
        if (secDisplay) secDisplay.innerText = `${teacherSections.length} Asignadas`;
    } else {
        const userDisplay = document.getElementById('total-users');
        if (userDisplay) userDisplay.innerText = `${userList.length} Registrados`;

        const studentDisplay = document.getElementById('total-students-home') || document.getElementById('total-students');
        if (studentDisplay) studentDisplay.innerText = `${studentList.length} Inscritos`;

        const secDisplay = document.getElementById('total-sections');
        if (secDisplay) secDisplay.innerText = `${sectionList.length} Secciones`;
    }

    const mentionDisplay = document.getElementById('total-mentions');
    if (mentionDisplay) mentionDisplay.innerText = `${mentionList.length} Áreas Técnicas`;

    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        dateDisplay.innerText = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

// ========== RENDER ALL ==========
function renderAll() {
    renderUsers();
    renderTeachers();
    renderStudents();
    renderAdmins();
    renderMentions();
    renderSections();
    renderPeriods();
    if (typeof window.renderSubjects === 'function') window.renderSubjects();
    if (typeof window.renderVaciadoNotifications === 'function') window.renderVaciadoNotifications();

    if (typeof window.loadPeriodsForGrades === 'function') window.loadPeriodsForGrades();
    if (typeof window.loadMentionsForGrades === 'function') window.loadMentionsForGrades();

    initializeStudentFilters();
    updateDashboardStats();
}

// Exponer renderAll en window
window.renderAll = renderAll;
window.renderStudents = renderStudents;
window.renderStudentsWithFilters = renderStudentsWithFilters;
window.renderTeachers = renderTeachers;
window.renderMentions = renderMentions;
window.renderSections = renderSections;
window.renderPeriods = renderPeriods;
