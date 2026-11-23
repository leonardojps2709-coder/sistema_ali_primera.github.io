/**
 * render_v3.js
 * CONTROLADOR DE RENDERIZADO DEL PANEL DE ADMINISTRACIÓN
 *
 * Depende de lib/render.js (debe cargarse antes) para:
 *   - teacherFilters, studentFilters (estado de filtros)
 *   - extraerAnio, getSectionName, getMencionFromSection,
 *     getMencionIdFromSection, getUserInitials, highlightText
 */

// Función para obtener secciones que tienen estudiantes inscritos
// (única en este archivo; las demás helpers vienen de lib/render.js)
function getSectionsWithStudents() {
    const sectionsWithStudents = new Set();
    students.filter(s => s.seccion_id || s.seccion).forEach(student => {
        sectionsWithStudents.add(parseInt(student.seccion_id || student.seccion));
    });
    return Array.from(sectionsWithStudents);
}

/**
 * Filtra dinámicamente las secciones mostradas en un select `<select>` basándose en la mención.
 * Ordena las secciones extraídas primero por año numérico y luego alfabéticamente.
 * @param {string|number} selectedMencionId - ID de la mención seleccionada para filtrar
 */
function updateSectionFilterOptions(selectedMencionId = '') {
    const sectionFilter = document.getElementById('student-section-filter');
    if (!sectionFilter) return;

    // Filtrar secciones por la mención seleccionada
    let filteredSections = sections;
    
    if (selectedMencionId) {
        filteredSections = filteredSections.filter(s => (s.mencion_id == selectedMencionId || s.mencionId == selectedMencionId));
    }

    // Ordenar secciones
    const sortedSections = [...filteredSections].sort((a, b) => {
        const anioA = extraerAnio(a.nombre);
        const anioB = extraerAnio(b.nombre);
        if (anioA !== anioB) return anioA - anioB;
        return a.nombre.localeCompare(b.nombre);
    });

    // Guardar el valor actual para restaurarlo si es posible
    const currentValue = sectionFilter.value;

    // Generar opciones
    if (sortedSections.length === 0) {
        sectionFilter.innerHTML = '<option value="">No hay secciones</option>';
    } else {
        sectionFilter.innerHTML = '<option value="">Todas las secciones</option>' +
            sortedSections.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
    }

    // Restaurar el valor si todavía existe en las nuevas opciones
    if (currentValue && (currentValue === '' || sortedSections.some(s => s.id == currentValue))) {
        sectionFilter.value = currentValue;
    }
}

// getUserInitials y highlightText provienen de lib/render.js

/**
 * Filtra la lista global `students` según los filtros activos en `studentFilters`.
 * Aplica filtros por mención, sección y búsqueda de texto libre.
 * @returns {Array} Arreglo de objetos estudiante filtrados
 */
function filterStudents() {
    let filteredStudents = students;

    if (studentFilters.status !== undefined && studentFilters.status !== '') {
        const targetActivo = parseInt(studentFilters.status);
        filteredStudents = filteredStudents.filter(student => {
            const isAct = student.activo === undefined || student.activo === null || parseInt(student.activo) === 1 ? 1 : 0;
            return isAct === targetActivo;
        });
    }

    if (studentFilters.mencion) {
        filteredStudents = filteredStudents.filter(student => {
            const mencionId = getMencionIdFromSection(student.seccion_id || student.seccion);
            return mencionId == studentFilters.mencion;
        });
    }

    if (studentFilters.seccion) {
        filteredStudents = filteredStudents.filter(student => {
            const currentSeccion = student.seccion_id || student.seccion;
            return currentSeccion && currentSeccion == studentFilters.seccion;
        });
    }

    // Búsqueda por texto
    if (studentFilters.search) {
        const q = studentFilters.search.toLowerCase();
        filteredStudents = filteredStudents.filter(student => {
            const secNombre = getSectionName(student.seccion_id || student.seccion);
            const menNombre = getMencionFromSection(student.seccion_id || student.seccion);
            return [
                student.cedula, student.nombre, student.apellido,
                student.email, student.telefono, secNombre, menNombre
            ].some(v => v && String(v).toLowerCase().includes(q));
        });
    }

    return filteredStudents;
}

/**
 * Renderiza la tabla de estudiantes en el DOM, aplicando los filtros activos.
 * Si no hay resultados, muestra un mensaje de estado vacío (empty state).
 * Usa `highlightText()` para resaltar el texto buscado en los resultados.
 */
function renderStudentsWithFilters() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    const filteredStudents = filterStudents();
    const q = studentFilters.search || '';
    const rendimiento = (typeof window.calcularRendimientoEstudiantes === 'function')
        ? window.calcularRendimientoEstudiantes()
        : new Map();

    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:3.5rem 2rem;color:#94a3b8;">
                    <i class='bx bx-search-alt' style="font-size:2.5rem;display:block;margin-bottom:0.75rem;color:#cbd5e1;"></i>
                    <span style="font-weight:500;">No se encontraron estudiantes</span><br>
                    <small style="font-size:0.8rem;">Intenta con otro término o cambia los filtros</small>
                </td>
            </tr>`;
    } else {
        tbody.innerHTML = filteredStudents.map(s => {
            const secId = s.seccion_id || s.seccion;
            const mencionNombre = getMencionFromSection(secId);
            const seccionNombre = getSectionName(secId);
            const initials = getUserInitials(s.nombre, s.apellido);
            const fullName = highlightText(`${(s.apellido || '').toUpperCase()}, ${(s.nombre || '').toUpperCase()}`, q);
            const ced  = highlightText(s.cedula || '', q);
            const mail = highlightText(s.email || '', q);
            const tel  = highlightText(s.telefono || '', q);
            const sec  = highlightText(seccionNombre || 'Sin sección', q);
            const men  = highlightText(mencionNombre || 'Sin mención', q);

            // Promedios por momento y definitiva final
            const info = rendimiento.get(parseInt(s.id));
            const notaM1 = info ? formatearNota(info.momentos[1]) : '—';
            const notaM2 = info ? formatearNota(info.momentos[2]) : '—';
            const notaM3 = info ? formatearNota(info.momentos[3]) : '—';
            const notaFinal = info ? formatearNota(info.promedio) : '—';

            const isActivo = s.activo === undefined || s.activo === null || parseInt(s.activo) === 1;
            const statusBadge = isActivo 
                ? '' 
                : `<span class="status-badge" style="background:#fee2e2;color:#991b1b;font-size:0.7rem;padding:2px 7px;border-radius:10px;font-weight:600;display:inline-flex;align-items:center;gap:3px;margin-left:6px;"><i class="bx bx-block"></i> Inhabilitado</span>`;

            const toggleBtn = isActivo
                ? `<button class="btn-icon toggle-student-status" data-id="${s.id}" data-activo="0" title="Inhabilitar estudiante" style="color:#d97706;"><i class='bx bx-user-x'></i></button>`
                : `<button class="btn-icon toggle-student-status" data-id="${s.id}" data-activo="1" title="Habilitar estudiante" style="color:#16a34a;"><i class='bx bx-user-check'></i></button>`;

            return `
            <tr style="${!isActivo ? 'background-color:#fff5f5;opacity:0.88;' : ''}">
                <td>
                    <div class="user-cell">
                        <div>
                            <div class="user-name" style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;">${fullName} ${statusBadge}</div>
                            <div class="user-sub">${tel}</div>
                        </div>
                    </div>
                </td>
                <td style="font-size:0.83rem;color:#64748b;">${mail}</td>
                <td>${sec}</td>
                <td>${men}</td>
                <td style="text-align:center;font-variant-numeric:tabular-nums;">${notaM1}</td>
                <td style="text-align:center;font-variant-numeric:tabular-nums;">${notaM2}</td>
                <td style="text-align:center;font-variant-numeric:tabular-nums;">${notaM3}</td>
                <td style="text-align:center;"><span class="grade-badge">${notaFinal}</span></td>
                <td>
                    <div style="display:flex;gap:4px;justify-content:center;">
                        <button class="btn-icon view-student-profile" data-id="${s.id}" title="Ver perfil completo" style="color:#6366f1;"><i class='bx bx-user-circle'></i></button>
                        <button class="btn-icon edit-student" data-id="${s.id}" title="Editar"><i class='bx bx-edit-alt'></i></button>
                        ${toggleBtn}
                    </div>
                </td>
            </tr>`;
        }).join('');
    }
}

// Función para inicializar los filtros de estudiantes
function initializeStudentFilters() {
    const mentionFilter = document.getElementById('student-mention-filter');
    const sectionFilter = document.getElementById('student-section-filter');

    if (!mentionFilter || !sectionFilter) return;

    // Llenar filtro de menciones con todas las menciones
    const currentMencion = mentionFilter.value;
    mentionFilter.innerHTML = '<option value="">Todas las menciones</option>' +
        mentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
    if (currentMencion) mentionFilter.value = currentMencion;

    // Inicializar filtro de secciones
    updateSectionFilterOptions(mentionFilter.value);

    // Aplicar filtros iniciales si hay valores seleccionados
    if (sectionFilter.value) studentFilters.seccion = sectionFilter.value;
    if (mentionFilter.value)  studentFilters.mencion = mentionFilter.value;

    renderStudentsWithFilters();
}

/**
 * Renderiza la gestión de usuarios agrupada (Administradores y Profesores)
 * conforme al nuevo diseño de tarjetas con colores sólidos y badges de conteo.
 */
function renderUsers() {
    const adminTbody = document.getElementById('admins-users-table-body');
    const teacherTbody = document.getElementById('teachers-users-table-body');
    const adminBadge = document.getElementById('admin-users-count-badge');
    const teacherBadge = document.getElementById('teacher-users-count-badge');

    const formatCedula = (c) => {
        if (!c) return 'No registrado';
        const s = String(c).trim();
        if (/^[a-zA-Z]-/.test(s)) return s.toUpperCase();
        return `V-${s}`;
    };

    const formatFullName = (u) => {
        const name = [u.nombre, u.apellido].filter(Boolean).join(' ').trim();
        return name || 'No registrado';
    };

    const formatField = (val) => {
        return (val && String(val).trim()) ? String(val).trim() : 'No registrado';
    };

    const userList = Array.isArray(users) ? users : [];
    const admins = userList.filter(u => u.rol === 'admin');
    const teachers = userList.filter(u => u.rol === 'teacher');

    // 1. Renderizar Administradores
    if (adminBadge) {
        adminBadge.innerText = `${admins.length} ${admins.length === 1 ? 'usuario' : 'usuarios'}`;
    }

    if (adminTbody) {
        if (admins.length === 0) {
            adminTbody.innerHTML = `<tr><td colspan="5" class="user-table-empty">No hay administradores registrados</td></tr>`;
        } else {
            adminTbody.innerHTML = admins.map(u => `
                <tr>
                    <td class="user-col-cedula">${formatCedula(u.cedula)}</td>
                    <td class="user-col-name">${formatFullName(u)}</td>
                    <td class="user-col-email">${formatField(u.email)}</td>
                    <td class="user-col-phone">${formatField(u.telefono)}</td>
                    <td class="user-col-actions">
                        <i class='bx bx-lock-alt admin-user-lock' title="Solo editable por Superadmin"></i>
                    </td>
                </tr>
            `).join('');
        }
    }

    // 2. Renderizar Profesores
    if (teacherBadge) {
        teacherBadge.innerText = `${teachers.length} ${teachers.length === 1 ? 'usuario' : 'usuarios'}`;
    }

    if (teacherTbody) {
        if (teachers.length === 0) {
            teacherTbody.innerHTML = `<tr><td colspan="5" class="user-table-empty">No hay profesores registrados</td></tr>`;
        } else {
            teacherTbody.innerHTML = teachers.map(u => {
                const isActivo = u.activo === undefined || u.activo === null || u.activo == 1;
                const statusBadge = isActivo 
                    ? '<span class="status-badge" style="background:#dcfce7;color:#166534;font-size:0.75rem;padding:2px 8px;border-radius:12px;font-weight:600;display:inline-flex;align-items:center;gap:3px;margin-left:6px;"><i class="bx bx-check-circle"></i> Activo</span>'
                    : '<span class="status-badge" style="background:#fee2e2;color:#991b1b;font-size:0.75rem;padding:2px 8px;border-radius:12px;font-weight:600;display:inline-flex;align-items:center;gap:3px;margin-left:6px;"><i class="bx bx-block"></i> Inhabilitado</span>';

                const toggleBtn = isActivo
                    ? `<button type="button" class="user-action-btn toggle-teacher-status" data-id="${u.id}" data-activo="0" title="Inhabilitar profesor" style="color:#d97706;">
                        <i class='bx bx-user-x'></i>
                       </button>`
                    : `<button type="button" class="user-action-btn toggle-teacher-status" data-id="${u.id}" data-activo="1" title="Habilitar profesor" style="color:#16a34a;">
                        <i class='bx bx-user-check'></i>
                       </button>`;

                return `
                <tr style="${!isActivo ? 'background-color:#fef2f2;opacity:0.85;' : ''}">
                    <td class="user-col-cedula">${formatCedula(u.cedula)}</td>
                    <td class="user-col-name">${formatFullName(u)} ${statusBadge}</td>
                    <td class="user-col-email">${formatField(u.email)}</td>
                    <td class="user-col-phone">${formatField(u.telefono)}</td>
                    <td class="user-col-actions">
                        <button type="button" class="user-action-btn edit-user" data-id="${u.id}" title="Editar profesor">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                        ${toggleBtn}
                    </td>
                </tr>
            `;}).join('');
        }
    }

    // Compatibilidad: mantener elemento users-table-body si existe en el DOM
    const legacyTbody = document.getElementById('users-table-body');
    if (legacyTbody) {
        legacyTbody.innerHTML = userList.map(u => `
            <tr>
                <td>${formatCedula(u.cedula)}</td>
                <td>${u.nombre || ''}</td>
                <td>${u.apellido || ''}</td>
                <td>${formatField(u.email)}</td>
                <td>${formatField(u.telefono)}</td>
                <td>${u.rol === 'admin' ? 'Administrador' : 'Profesor'}</td>
                <td>
                    <button class="btn-icon edit-user" data-id="${u.id}"><i class='bx bx-edit'></i></button>
                    <button class="btn-icon delete delete-user" data-id="${u.id}"><i class='bx bx-trash'></i></button>
                </td>
            </tr>
        `).join('');
    }

    const totalUsersEl = document.getElementById('total-users');
    if (totalUsersEl) {
        totalUsersEl.innerText = `${userList.length} Registrados`;
    }
}

/**
 * Renderiza la tabla de profesores con sus asignaciones de materias y secciones.
 * Agrupa las asignaciones de cada profesor por mención para mostrar una fila por mención.
 * Aplica colores de fondo distintos según la mención del profesor.
 */
function renderTeachers() {
    const tbody = document.getElementById('teachers-table-body');
    if (!tbody) return;

    let teachers = users.filter(u => u.rol === 'teacher');


    // Filtro por mención
    if (teacherFilters.mencion) {
        teachers = teachers.filter(t => {
            let mencionId = '';
            let asig = [];
            try { asig = typeof t.asignaciones === 'string' ? JSON.parse(t.asignaciones) : (t.asignaciones || []); } catch(e){}
            
            if (asig.length > 0) {
                for (const a of asig) {
                    if (a.seccion_id) {
                        const mId = getMencionIdFromSection(a.seccion_id);
                        if (mId) {
                            mencionId = mId;
                            break;
                        }
                    }
                }
            }
            return mencionId == teacherFilters.mencion;
        });
    }

    // Búsqueda por texto
    if (teacherFilters.search) {
        const q = teacherFilters.search.toLowerCase();
        teachers = teachers.filter(t => {
            let asig = [];
            try { asig = typeof t.asignaciones === 'string' ? JSON.parse(t.asignaciones) : (t.asignaciones || []); } catch(e){}
            const materias = asig.map(a => a.materia_nombre || a.materia).join(' ');
            const secciones = asig.map(a => getSectionName(a.seccion_id)).join(' ');
            return [t.cedula, t.nombre, t.apellido, t.email, t.telefono, materias, secciones]
                .some(v => v && String(v).toLowerCase().includes(q));
        });
    }

    const q = teacherFilters.search || '';

    if (teachers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:3.5rem 2rem;color:#94a3b8;">
                    <i class='bx bx-search-alt' style="font-size:2.5rem;display:block;margin-bottom:0.75rem;color:#cbd5e1;"></i>
                    <span style="font-weight:500;">No se encontraron profesores</span><br>
                    <small style="font-size:0.8rem;">Intenta con otro término o cambia los filtros</small>
                </td>
            </tr>`;
    } else {
        tbody.innerHTML = teachers.flatMap(t => {
            let asig = [];
            try { asig = typeof t.asignaciones === 'string' ? JSON.parse(t.asignaciones) : (t.asignaciones || []); } catch(e){}

            // Agrupar asignaciones por mención
            const asignacionesPorMencion = {};
            if (asig.length === 0) {
                asignacionesPorMencion[''] = []; // Sin mención asignada
            } else {
                asig.forEach(a => {
                    const mId = getMencionIdFromSection(a.seccion_id) || '';
                    if (!asignacionesPorMencion[mId]) asignacionesPorMencion[mId] = [];
                    asignacionesPorMencion[mId].push(a);
                });
            }

            // Generar una fila por cada mención en la que da clases
            return Object.entries(asignacionesPorMencion).map(([mencionId, asignacionesGrupo]) => {
                let mencionProfesor = 'General';
                if (mencionId) {
                    mencionProfesor = getMencionFromSection(asignacionesGrupo[0]?.seccion_id);
                }

                // Secciones (solo de esta mención)
                let seccionBadges = '<span style="color:#94a3b8;font-size:0.8rem;">Sin asignar</span>';
                const secIds = [...new Set(asignacionesGrupo.map(a => a.seccion_id))];
                if (secIds.length > 0) {
                    seccionBadges = secIds
                        .map(id => getSectionName(id))
                        .filter(n => n)
                        .map(n => highlightText(n, q))
                        .join(', ');
                }

                // Materias (solo de esta mención)
                let materiaBadges = '<span style="color:#94a3b8;font-size:0.8rem;">Sin asignar</span>';
                const matNames = [...new Set(asignacionesGrupo.map(a => a.materia_nombre || a.materia))];
                if (matNames.length > 0) {
                    materiaBadges = matNames.filter(Boolean)
                        .map(m => highlightText(m, q))
                        .join(', ');
                }

                const fullName = highlightText(`${t.apellido || ''}, ${t.nombre || ''}`, q);
                const mail = highlightText(t.email || '', q);

                let rowBg = 'transparent';
                if (mencionId == '1') { rowBg = '#fffbeb'; } // Electricidad
                if (mencionId == '2') { rowBg = '#e0e7ff'; } // Metalmecánica
                if (mencionId == '3') { rowBg = '#d1fae5'; } // Refinación y Petroquímica
                if (mencionId == '4') { rowBg = '#fee2e2'; } // Gestión Integral de Riesgo

                let mencionCellHtml = highlightText(mencionProfesor, q);

                const tipoDoc = t.tipo_docente || 'docente';
                let rolBadge = '';
                const secGuiadas = typeof sections !== 'undefined' ? sections.filter(s => s.profesor_guia_id == t.id) : [];
                const secGuiaTexto = secGuiadas.length > 0 
                    ? `<div style="margin-top:4px;font-size:0.75rem;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:2px 7px;border-radius:6px;font-weight:600;display:inline-flex;align-items:center;gap:3px;"><i class='bx bx-check-shield'></i> Guía: ${secGuiadas.map(s => s.nombre).join(', ')}</div>` 
                    : '';

                if (tipoDoc === 'solo_guia') {
                    rolBadge = `<span class="badge" style="background:#f3e8ff;color:#6b21a8;border:1px solid #d8b4fe;padding:4px 9px;border-radius:12px;font-size:0.78rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;"><i class='bx bxs-star' style='color:#a855f7;'></i> Solo Guía</span>${secGuiaTexto}`;
                } else if (tipoDoc === 'docente_guia') {
                    rolBadge = `<span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;padding:4px 9px;border-radius:12px;font-size:0.78rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;"><i class='bx bxs-check-shield' style='color:#3b82f6;'></i> Docente y Guía</span>${secGuiaTexto}`;
                } else {
                    rolBadge = `<span class="badge" style="background:#f8fafc;color:#475569;border:1px solid #e2e8f0;padding:4px 9px;border-radius:12px;font-size:0.78rem;font-weight:500;display:inline-flex;align-items:center;gap:4px;"><i class='bx bx-book-reader' style='color:#94a3b8;'></i> Docente</span>`;
                }

                const isActivo = t.activo === undefined || t.activo === null || t.activo == 1;
                const statusBadge = isActivo 
                    ? `<span class="badge" style="background:#dcfce7;color:#166534;border:1px solid #bbf7d0;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:600;display:inline-flex;align-items:center;gap:3px;margin-left:6px;"><i class='bx bx-check-circle'></i> Activo</span>`
                    : `<span class="badge" style="background:#fee2e2;color:#991b1b;border:1px solid #fecaca;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:600;display:inline-flex;align-items:center;gap:3px;margin-left:6px;"><i class='bx bx-block'></i> Inhabilitado</span>`;

                const toggleBtn = isActivo
                    ? `<button class="btn-icon toggle-teacher-status" data-id="${t.id}" data-activo="0" title="Inhabilitar profesor" style="color:#d97706;"><i class='bx bx-user-x'></i></button>`
                    : `<button class="btn-icon toggle-teacher-status" data-id="${t.id}" data-activo="1" title="Habilitar profesor" style="color:#16a34a;"><i class='bx bx-user-check'></i></button>`;

                if (!isActivo) {
                    rowBg = '#fef2f2';
                }

                return `
                <tr style="background-color: ${rowBg}; ${!isActivo ? 'opacity:0.85;' : ''}">
                    <td>
                        <div class="user-cell">
                            <div>
                                <div class="user-name">${fullName} ${statusBadge}</div>
                                <div class="user-sub">${mail}</div>
                            </div>
                        </div>
                    </td>
                    <td>${rolBadge}</td>
                    <td><div style="max-width:280px;">${materiaBadges}</div></td>
                    <td><div>${seccionBadges}</div></td>
                    <td style="font-weight: 500;">${mencionCellHtml}</td>
                    <td>
                        <div style="display:flex;gap:4px;">
                            <button class="btn-icon edit-teacher" data-id="${t.id}" title="Editar"><i class='bx bx-edit-alt'></i></button>
                            ${toggleBtn}
                        </div>
                    </td>
                </tr>`;
            });
        }).join('');
    }
}

// Inicializar filtro de profesores y carga de datos
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar datos desde MySQL primero
    if (typeof initData === 'function') {
        await initData();
    }

    const applyTeacherFilter = document.getElementById('apply-teacher-filter');
    const mentionFilter = document.getElementById('teacher-mention-filter-table');
    
    if (applyTeacherFilter && mentionFilter) {
        applyTeacherFilter.addEventListener('click', () => {
            teacherFilters.mencion = mentionFilter.value;
            renderTeachers();
        });
        
        // Llenar filtro con todas las menciones desde la base de datos
        mentionFilter.innerHTML = '<option value="">Todas las menciones</option>' +
            mentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
    }
});

function renderStudents() {
    renderStudentsWithFilters();
}

function renderAdmins() {
    const tbody = document.getElementById('admins-table-body');
    if (!tbody) return;
    const admins = users.filter(u => u.rol === 'admin');
    if (admins.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">No hay administradores registrados</td></tr>`;
    } else {
        tbody.innerHTML = admins.map(a => `
            <tr style="background-color: #e0f2fe;">
                <td>${a.cedula}</td>
                <td>${a.nombre}</td>
                <td>${a.apellido}</td>
                <td>${a.email}</td>
                <td>${a.telefono || '-'}</td>
                <td style="text-align:center;">
                    <i class='bx bx-lock-alt' style="font-size:1.1rem;color:#94a3b8;" title="Solo editable por Superadmin"></i>
                </td>
            </tr>
        `).join('');
    }
}


/**
 * Renderiza la tabla de menciones y actualiza todos los `<select>` del sistema
 * que dependen de las menciones (formulario de secciones, filtros de estudiantes,
 * filtros de profesores).
 */
let selectedMentionId = null;

function getMentionColorAndIcon(mId, mName, customColor = null, customIcon = null) {
    let mObj = null;
    if (typeof mentions !== 'undefined' && Array.isArray(mentions)) {
        mObj = mentions.find(m => m.id == mId);
    }
    const color = customColor || (mObj && mObj.color);
    const icon = customIcon || (mObj && mObj.icono);

    const name = (mName || (mObj && mObj.nombre) || '').toLowerCase();
    
    // Subtítulo descriptivo según la mención
    let sub = 'Especialidad Técnica';
    if (name.includes('electricidad')) sub = 'Especialidad Industrial • Electricidad';
    else if (name.includes('metalmec') || name.includes('metal')) sub = 'Especialidad Industrial • Metalmecánica';
    else if (name.includes('petroqu') || name.includes('refina')) sub = 'Especialidad Química • Refinación y Petroquímica';
    else if (name.includes('riesgo')) sub = 'Especialidad de Protección y Seguridad';
    else if (name.includes('informát') || name.includes('computac') || name.includes('sistema')) sub = 'Especialidad en Informática y Tecnología';
    else if (name.includes('contabil') || name.includes('administra')) sub = 'Especialidad en Administración y Servicios';
    else if (mName) sub = `Especialidad Técnica • ${mName}`;

    // Colores e iconos por defecto para las 4 primeras menciones históricas
    let defaultColor = '#4a151b';
    let defaultIcon = 'bx bx-category';

    if (mId === 1 || name.includes('electricidad')) {
        defaultColor = '#b45309';
        defaultIcon = 'bx bx-bolt-circle';
    } else if (mId === 2 || name.includes('metalmec') || name.includes('metal')) {
        defaultColor = '#4338ca';
        defaultIcon = 'bx bx-cog';
    } else if (mId === 3 || name.includes('petroqu') || name.includes('refina')) {
        defaultColor = '#047857';
        defaultIcon = 'bx bx-test-tube';
    } else if (mId === 4 || name.includes('riesgo')) {
        defaultColor = '#b91c1c';
        defaultIcon = 'bx bx-shield-quarter';
    }

    return {
        color: color || defaultColor,
        icon: icon || defaultIcon,
        sub: sub
    };
}
window.getMentionColorAndIcon = getMentionColorAndIcon;

function selectMentionDetail(mentionId) {
    selectedMentionId = mentionId;
    renderMentionsMasterDetail();
}
window.selectMentionDetail = selectMentionDetail;

function renderMentionsMasterDetail() {
    const sidebar = document.getElementById('mentions-sidebar-list');
    const panel = document.getElementById('mention-detail-panel');
    if (!sidebar || !panel) return;

    if (!mentions || mentions.length === 0) {
        sidebar.innerHTML = `
            <div style="padding:1.5rem 1rem;color:#94a3b8;font-size:0.88rem;text-align:center;background:#fff;border-radius:10px;border:1px dashed #cbd5e1;">
                <i class='bx bx-info-circle' style="font-size:1.8rem;display:block;margin-bottom:0.5rem;color:#cbd5e1;"></i>
                No hay menciones registradas
            </div>`;
        panel.innerHTML = `
            <div style="padding:3rem 1.5rem;text-align:center;color:#64748b;background:#fff;border-radius:14px;border:1px solid #e2e8f0;">
                <i class='bx bx-category' style="font-size:3rem;color:#cbd5e1;display:block;margin-bottom:1rem;"></i>
                <h3 style="font-size:1.25rem;color:#1e293b;margin-bottom:0.5rem;font-weight:700;">No hay menciones técnicas</h3>
                <p style="font-size:0.88rem;color:#64748b;margin-bottom:1.5rem;max-width:400px;margin-left:auto;margin-right:auto;">Comienza creando la primera mención o especialidad para organizar las secciones académicas.</p>
                <button class="btn-primary" onclick="if(window.openMentionModal) window.openMentionModal();" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.7rem 1.4rem;margin:0 auto;cursor:pointer;">
                    <i class='bx bx-plus-circle'></i> Crear Primera Mención
                </button>
            </div>`;
        return;
    }

    if (!selectedMentionId || !mentions.some(m => m.id == selectedMentionId)) {
        selectedMentionId = mentions[0].id;
    }

    const totalStudentsAll = (typeof students !== 'undefined' ? students : []).length;

    // Renderizar lista lateral
    sidebar.innerHTML = mentions.map(m => {
        const theme = getMentionColorAndIcon(parseInt(m.id), m.nombre);
        const secList = (typeof sections !== 'undefined' ? sections : []).filter(sec => sec.mencion_id == m.id);
        const secIds = secList.map(s => s.id);
        const stuCount = (typeof students !== 'undefined' ? students : []).filter(s => secIds.includes(parseInt(s.seccion_id || s.seccion))).length;
        const isActive = (m.id == selectedMentionId);

        return `
            <div class="mencion-nav-card ${isActive ? 'active' : ''}" 
                 style="border-left-color: ${theme.color};" 
                 onclick="window.selectMentionDetail(${m.id})">
                <div class="mn-title" style="display:flex;align-items:center;gap:0.45rem;">
                    <i class='${theme.icon}' style="color:${theme.color};font-size:1.15rem;flex-shrink:0;"></i>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.nombre}</span>
                </div>
                <div class="mn-meta">
                    <span><i class='bx bx-user'></i> ${stuCount} alumno${stuCount === 1 ? '' : 's'}</span> • 
                    <span><i class='bx bx-grid'></i> ${secList.length} sección${secList.length === 1 ? '' : 'es'}</span>
                </div>
            </div>
        `;
    }).join('');

    // Obtener datos de la mención activa
    const curMention = mentions.find(m => m.id == selectedMentionId) || mentions[0];
    const curTheme = getMentionColorAndIcon(parseInt(curMention.id), curMention.nombre);

    const mSections = (typeof sections !== 'undefined' ? sections : []).filter(sec => sec.mencion_id == curMention.id);
    const mSecIds = mSections.map(sec => sec.id);
    const mStudents = (typeof students !== 'undefined' ? students : []).filter(s => mSecIds.includes(parseInt(s.seccion_id || s.seccion)));
    const pct = totalStudentsAll > 0 ? Math.round((mStudents.length / totalStudentsAll) * 100) : 0;

    // Docentes en la mención
    const teacherIds = new Set();
    mSections.forEach(s => {
        if (s.profesor_guia_id) teacherIds.add(parseInt(s.profesor_guia_id));
    });
    (typeof users !== 'undefined' ? users : []).filter(u => u.rol === 'teacher').forEach(u => {
        let asigs = [];
        try {
            asigs = typeof u.asignaciones === 'string' ? JSON.parse(u.asignaciones) : (u.asignaciones || []);
        } catch(e){}
        if (asigs.some(a => mSecIds.includes(parseInt(a.seccion_id)))) {
            teacherIds.add(u.id);
        }
    });
    const totalTeachers = Math.max(teacherIds.size, mSections.filter(s => s.profesor_guia_nombre).length);

    // Promedio general de la mención
    const mGrades = (typeof grades !== 'undefined' ? grades : []).filter(g => mSecIds.includes(parseInt(g.seccion_id)));
    const mDefs = mGrades.map(g => parseFloat(g.definitiva)).filter(v => !isNaN(v) && v > 0);
    const mProm = mDefs.length > 0 ? (mDefs.reduce((a, b) => a + b, 0) / mDefs.length).toFixed(1) : null;
    const promColor = mProm === null ? '#64748b' : (parseFloat(mProm) >= 14 ? '#16a34a' : (parseFloat(mProm) >= 10 ? '#d97706' : '#dc2626'));

    // Filas de secciones
    const rowsHtml = mSections.length === 0
        ? `<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:#94a3b8;">No hay secciones registradas para esta mención</td></tr>`
        : mSections.map(s => {
            const sStudents = (typeof students !== 'undefined' ? students : []).filter(st => (st.seccion_id || st.seccion) == s.id);
            let profNombre = 'Sin asignar';
            if (s.profesor_guia_nombre) {
                profNombre = s.profesor_guia_nombre;
            } else if (s.profesor_guia_id) {
                const p = (typeof users !== 'undefined' ? users : []).find(u => u.id == s.profesor_guia_id);
                if (p) profNombre = `${p.nombre} ${p.apellido}`;
            }

            const sGrades = (typeof grades !== 'undefined' ? grades : []).filter(g => g.seccion_id == s.id);
            const sDefs = sGrades.map(g => parseFloat(g.definitiva)).filter(v => !isNaN(v) && v > 0);
            const sProm = sDefs.length > 0 ? (sDefs.reduce((a,b)=>a+b,0)/sDefs.length).toFixed(1) : null;
            const sColor = sProm === null ? '#64748b' : (parseFloat(sProm) >= 14 ? '#16a34a' : (parseFloat(sProm) >= 10 ? '#d97706' : '#dc2626'));

            return `
                <tr>
                    <td><strong>${s.nombre}</strong></td>
                    <td>${s.nombre.split(' ')[0] || '—'}</td>
                    <td>${sStudents.length} alumno${sStudents.length === 1 ? '' : 's'}</td>
                    <td>${profNombre}</td>
                    <td><span style="color:${sColor};font-weight:700;">${sProm !== null ? sProm + ' pts' : 'Sin notas'}</span></td>
                </tr>
            `;
        }).join('');

    const safeNombre = (curMention.nombre || '').replace(/"/g, '&quot;');
    panel.innerHTML = `
        <div class="md-header">
            <div class="md-header-left">
                <div class="md-icon" style="background: ${curTheme.color};">
                    <i class='${curTheme.icon}'></i>
                </div>
                <div>
                    <h2 class="md-title">Mención: ${curMention.nombre}</h2>
                    <div class="md-subtitle">${curTheme.sub} • ${pct}% de la matrícula escolar</div>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
                <span class="md-badge">Especialidad Técnica Activa</span>
                <button type="button" class="btn-primary add-subject-mention-btn" data-id="${curMention.id}" data-nombre="${safeNombre}" style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.45rem 0.85rem;font-size:0.82rem;cursor:pointer;border-radius:6px;font-weight:600;" title="Añadir asignatura al pensum de esta mención">
                    <i class='bx bx-book-add'></i> + Asignatura
                </button>
                <button type="button" class="btn-secondary edit-mention-btn" data-id="${curMention.id}" data-nombre="${safeNombre}" style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.45rem 0.85rem;font-size:0.82rem;cursor:pointer;border-radius:6px;border:1px solid #cbd5e1;background:#fff;color:#1e293b;font-weight:600;transition:background 0.15s;" title="Editar nombre de la mención">
                    <i class='bx bx-edit-alt'></i> Editar
                </button>
                <button type="button" class="btn-secondary delete-mention-btn" data-id="${curMention.id}" data-nombre="${safeNombre}" style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.45rem 0.85rem;font-size:0.82rem;cursor:pointer;border-radius:6px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;font-weight:600;transition:background 0.15s;" title="Eliminar mención">
                    <i class='bx bx-trash'></i> Eliminar
                </button>
            </div>
        </div>

        <div class="md-kpi-grid">
            <div class="md-kpi-card">
                <div class="md-kpi-val" style="color: ${curTheme.color};">${mStudents.length}</div>
                <div class="md-kpi-label">Estudiantes</div>
            </div>
            <div class="md-kpi-card">
                <div class="md-kpi-val">${mSections.length}</div>
                <div class="md-kpi-label">Secciones Habilitadas</div>
            </div>
            <div class="md-kpi-card">
                <div class="md-kpi-val">${totalTeachers}</div>
                <div class="md-kpi-label">Docentes Asignados</div>
            </div>
            <div class="md-kpi-card">
                <div class="md-kpi-val" style="color: ${promColor};">${mProm !== null ? mProm : '—'}</div>
                <div class="md-kpi-label">Promedio General</div>
            </div>
        </div>

        <div class="md-table-title">
            <i class='bx bx-grid-alt'></i> Secciones asignadas a esta especialidad
        </div>
        <div class="md-table-wrap">
            <table class="md-table">
                <thead>
                    <tr>
                        <th>Sección</th>
                        <th>Año</th>
                        <th>Estudiantes</th>
                        <th>Profesor Guía</th>
                        <th>Rendimiento</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>

        <!-- ASIGNATURAS DE LA MENCIÓN -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2rem;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem;">
            <div class="md-table-title" style="margin:0;">
                <i class='bx bx-book-bookmark'></i> Plan de Asignaturas de la Especialidad
            </div>
            <button type="button" class="btn-primary add-subject-mention-btn" data-id="${curMention.id}" data-nombre="${safeNombre}" style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.4rem 0.85rem;font-size:0.8rem;cursor:pointer;border-radius:6px;font-weight:600;">
                <i class='bx bx-plus-circle'></i> Agregar Asignatura
            </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
            ${(() => {
                let mSubsHtml = '';
                for (let a = 1; a <= 6; a++) {
                    const mats = (typeof getDetailedMateriasByMencionAndAnio === 'function') 
                        ? getDetailedMateriasByMencionAndAnio(curMention.id, a)
                        : [];
                    if (mats.length === 0) continue;

                    mSubsHtml += `
                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.85rem 1rem;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;border-bottom:1px solid #e2e8f0;padding-bottom:0.4rem;">
                                <strong style="color:#1e293b;font-size:0.88rem;display:flex;align-items:center;gap:0.35rem;">
                                    <i class='bx bx-calendar' style="color:${curTheme.color};"></i> ${a}° Año
                                </strong>
                                <div style="display:flex;align-items:center;gap:0.4rem;">
                                    <span style="font-size:0.72rem;background:#e2e8f0;color:#475569;padding:1px 6px;border-radius:10px;font-weight:600;">${mats.length} materias</span>
                                    <button type="button" class="btn-quick-add-subject" data-mention-id="${curMention.id}" data-year="${a}" title="Añadir materia a ${a}° Año" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;cursor:pointer;padding:1px 6px;font-size:0.8rem;color:#1e293b;display:inline-flex;align-items:center;gap:2px;">
                                        <i class='bx bx-plus'></i> Añadir
                                    </button>
                                </div>
                            </div>
                            <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                                ${mats.map(m => {
                                    const isC = !!m.isCustom;
                                    const safeN = (m.nombre || '').replace(/"/g, '&quot;');
                                    return `
                                        <span style="display:inline-flex;align-items:center;gap:0.35rem;font-size:0.78rem;padding:0.25rem 0.55rem;border-radius:6px;background:${isC ? '#eff6ff' : '#ffffff'};border:1px solid ${isC ? '#bfdbfe' : '#e2e8f0'};color:${isC ? '#1e40af' : '#334155'};">
                                            <i class='bx ${isC ? 'bx-bookmark-plus' : 'bx-check'}' style="font-size:0.85rem;color:${isC ? '#2563eb' : '#10b981'};"></i>
                                            <span style="font-weight:${isC ? '600' : 'normal'};">${m.nombre}</span>
                                            ${m.id ? `
                                                <button type="button" class="btn-edit-subject" data-subject-id="${m.id}" data-subject-name="${safeN}" data-mention-id="${m.mencion_id || curMention.id}" data-year="${m.anio || a}" data-area="${m.area || 'general'}" title="Editar asignatura" style="background:none;border:none;color:#2563eb;cursor:pointer;padding:0;margin-left:4px;display:inline-flex;align-items:center;">
                                                    <i class='bx bx-edit-alt' style="font-size:0.95rem;"></i>
                                                </button>
                                                <button type="button" class="btn-delete-subject" data-subject-id="${m.id}" data-subject-name="${safeN}" data-mention-id="${m.mencion_id || curMention.id}" title="Eliminar asignatura" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:0;margin-left:2px;display:inline-flex;align-items:center;">
                                                    <i class='bx bx-x' style="font-size:1rem;"></i>
                                                </button>
                                            ` : ''}
                                        </span>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }

                if (!mSubsHtml) {
                    return `
                        <div style="text-align:center;padding:1.5rem;color:#94a3b8;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;font-size:0.88rem;">
                            No hay asignaturas registradas para esta mención.
                            <div style="margin-top:0.6rem;">
                                <button type="button" class="btn-primary add-subject-mention-btn" data-id="${curMention.id}" data-nombre="${safeNombre}" style="font-size:0.8rem;padding:0.4rem 0.8rem;display:inline-flex;align-items:center;gap:0.3rem;cursor:pointer;">
                                    <i class='bx bx-plus-circle'></i> Agregar Primera Asignatura
                                </button>
                            </div>
                        </div>
                    `;
                }
                return mSubsHtml;
            })()}
        </div>
    `;
}

function renderMentions() {
    renderMentionsMasterDetail();

    const totalEl = document.getElementById('total-mentions');
    if (totalEl) totalEl.innerText = mentions.length + ' Áreas Técnicas';

    // Actualizar selects de mención (formulario de secciones y filtro de notas)
    const mentionSelects = document.querySelectorAll('#section-mention, #mention-select, #grade-mention');
    mentionSelects.forEach(select => {
        if (select.id === 'mention-select') {
            select.innerHTML = mentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        } else {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Seleccione una mención</option>' + 
                mentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
            if (currentValue && mentions.some(m => m.id == currentValue)) {
                select.value = currentValue;
            }
        }
    });

    // Actualizar filtro de menciones en la sección de secciones
    const mentionFilter = document.getElementById('mention-filter');
    if (mentionFilter) {
        const currentValue = mentionFilter.value;
        mentionFilter.innerHTML = '<option value="">Todas las menciones</option>' + 
            mentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        if (currentValue && mentions.some(m => m.id == currentValue)) {
            mentionFilter.value = currentValue;
        }
    }

    // Actualizar filtros de estudiantes
    const studentMentionFilter = document.getElementById('student-mention-filter');
    if (studentMentionFilter) {
        const currentValue = studentMentionFilter.value;
        studentMentionFilter.innerHTML = '<option value="">Todas las menciones</option>' +
            mentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        
        if (currentValue && mentions.some(m => m.id == currentValue)) {
            studentMentionFilter.value = currentValue;
        }
        
        updateSectionFilterOptions(studentMentionFilter.value);
    }

    // Actualizar filtro de menciones de profesores
    const teacherMentionFilter = document.getElementById('teacher-mention-filter-table');
    if (teacherMentionFilter) {
        const currentValue = teacherMentionFilter.value;
        teacherMentionFilter.innerHTML = '<option value="">Todas las menciones</option>' +
            mentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        if (currentValue && mentions.some(m => m.id == currentValue)) {
            teacherMentionFilter.value = currentValue;
        }
    }
}

/**
 * Renderiza las secciones del sistema agrupadas por año en pestañas.
 * Filtra por la mención seleccionada y ordena por número de año.
 * Cada sección se muestra como una tarjeta clickable con botones de acción.
 */
function renderSections() {
    const container = document.getElementById('sections-cards-container');
    if (!container) return;

    const mentionFilter = document.getElementById('mention-filter');
    const selectedMentionId = mentionFilter ? mentionFilter.value : '';

    // Filtrar secciones por mención si hay alguna seleccionada
    let filteredSections = sections;
    if (selectedMentionId) {
        filteredSections = sections.filter(s => (s.mencion_id == selectedMentionId || s.mencionId == selectedMentionId));
    }

    // Ordenar secciones filtradas por año extraído del nombre
    const sortedSections = [...filteredSections].sort((a, b) => {
        const anioA = extraerAnio(a.nombre);
        const anioB = extraerAnio(b.nombre);
        if (anioA !== anioB) return anioA - anioB;
        return a.nombre.localeCompare(b.nombre);
    });

    if (sortedSections.length === 0) {
        container.innerHTML = `<div class="empty-msg" style="padding: 2rem; text-align: center; color: #64748b; background: white; border-radius: 8px; border: 1px dashed #cbd5e1;">No hay secciones registradas</div>`;
    } else {
        const yearsGroup = {};
        sortedSections.forEach(s => {
            const anio = extraerAnio(s.nombre);
            if (!yearsGroup[anio]) yearsGroup[anio] = [];
            yearsGroup[anio].push(s);
        });

        const sortedYears = Object.keys(yearsGroup).map(Number).sort((a, b) => a - b);
        let activeTab = sortedYears[0];

        let tabsHtml = '<div class="sec-tabs">';
        sortedYears.forEach(y => {
            let labelFormatted = `${y}ro Año`;
            if(y===2) labelFormatted = '2do Año';
            else if(y===3) labelFormatted = '3ro Año';
            else if(y>=4 && y<=6) labelFormatted = `${y}to Año`;
            else if(y===999) labelFormatted = 'Otros';
            
            tabsHtml += `<div class="sec-tab ${y === activeTab ? 'active' : ''}" data-year="${y}">${labelFormatted}</div>`;
        });
        tabsHtml += '</div>';

        let contentsHtml = '';
        sortedYears.forEach(y => {
            contentsHtml += `<div class="sec-tab-content ${y === activeTab ? 'active' : ''}" id="sec-tab-${y}">`;
            contentsHtml += '<div class="sections-grid">';
            
            contentsHtml += yearsGroup[y].map(s => {
                const mention = mentions.find(m => m.id == s.mencion_id);
                // 6to año no se promueve: sus estudiantes egresan
                const esSexto = (extraerAnio(s.nombre) >= 6);
                let profesorInfo = '';
                let profeGuia = null;
                if (s.profesor_guia_id && typeof users !== 'undefined') {
                    profeGuia = users.find(u => u.id == s.profesor_guia_id);
                }
                if (!profeGuia && s.profesor_guia_nombre && typeof users !== 'undefined') {
                    profeGuia = users.find(u => `${u.nombre} ${u.apellido}`.trim().toLowerCase() === s.profesor_guia_nombre.trim().toLowerCase());
                }

                if (profeGuia) {
                    const isSolo = profeGuia.tipo_docente === 'solo_guia';
                    const tipoBadge = isSolo
                        ? '<span style="font-size:0.75rem;background:#f3e8ff;color:#6b21a8;border:1px solid #d8b4fe;padding:2px 8px;border-radius:10px;font-weight:600;"><i class=\'bx bxs-star\'></i> Solo Guía</span>'
                        : '<span style="font-size:0.75rem;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;padding:2px 8px;border-radius:10px;font-weight:600;"><i class=\'bx bxs-check-shield\'></i> Docente y Guía</span>';
                    profesorInfo = `
                        <div class="profesor-guia-info" style="margin-top: 14px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 6px; font-size: 0.88rem; color: #334155; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                            <div>
                                <span style="display:block; font-size:0.72rem; text-transform:uppercase; font-weight:700; color:#64748b; letter-spacing:0.5px;">Profesor Guía Asignado</span>
                                <strong style="color: #0f172a; font-size:0.95rem;">${profeGuia.nombre} ${profeGuia.apellido}</strong>
                            </div>
                            <div>${tipoBadge}</div>
                        </div>
                    `;
                } else if (s.profesor_guia_nombre) {
                    profesorInfo = `
                        <div class="profesor-guia-info" style="margin-top: 14px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #64748b; border-radius: 6px; font-size: 0.88rem; color: #334155;">
                            <span style="display:block; font-size:0.72rem; text-transform:uppercase; font-weight:700; color:#64748b; letter-spacing:0.5px;">Profesor Guía</span>
                            <strong style="color: #0f172a; font-size:0.95rem;">${s.profesor_guia_nombre}</strong>
                        </div>
                    `;
                } else {
                    profesorInfo = `
                        <div class="profesor-guia-info" style="margin-top: 14px; padding: 8px 12px; background: #fdf2f2; border: 1px dashed #fca5a5; border-radius: 6px; font-size: 0.84rem; color: #991b1b; display:flex; align-items:center; gap:6px;">
                            <i class='bx bx-error-circle' style="font-size:1.05rem;"></i>
                            <span>Profesor Guía: <strong>Sin Asignar</strong></span>
                        </div>
                    `;
                }

                return `
                <div class="section-card hover-card section-card-clickable" data-id="${s.id}" data-mencion="${s.mencion_id || ''}" style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; transition: transform 0.2s, box-shadow 0.2s; position: relative; cursor: pointer;">
                    <div class="card-actions" style="position: absolute; top: 15px; right: 15px; display: flex; gap: 6px;">
                        <button class="btn-icon promote-section" data-id="${s.id}" title="${esSexto ? '6to año: los estudiantes egresan, no se promueven' : 'Promover al año siguiente'}" style="border: 1px solid #e2e8f0; background: #f8fafc; color: #047857; width: 32px; height: 32px; border-radius: 5px; cursor: pointer; font-size: 1.05rem; transition: background 0.15s, border-color 0.15s; display: inline-flex; align-items: center; justify-content: center;${esSexto ? ' opacity: 0.5;' : ''}" onmouseover="this.style.background='#ecfdf5'; this.style.borderColor='#a7f3d0';" onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0';"><i class='bx bx-up-arrow-alt'></i></button>
                        <button class="btn-icon edit-section" data-id="${s.id}" title="Editar" style="border: 1px solid #e2e8f0; background: #f8fafc; color: #2563eb; width: 32px; height: 32px; border-radius: 5px; cursor: pointer; font-size: 1.05rem; transition: background 0.15s, border-color 0.15s; display: inline-flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#eff6ff'; this.style.borderColor='#bfdbfe';" onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0';"><i class='bx bx-edit-alt'></i></button>
                        <button class="btn-icon delete-section" data-id="${s.id}" title="Eliminar" style="border: 1px solid #e2e8f0; background: #f8fafc; color: #dc2626; width: 32px; height: 32px; border-radius: 5px; cursor: pointer; font-size: 1.05rem; transition: background 0.15s, border-color 0.15s; display: inline-flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#fef2f2'; this.style.borderColor='#fecaca';" onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0';"><i class='bx bx-trash'></i></button>
                    </div>
                    <h3 style="margin: 0 0 5px; font-size: 1.25rem; color: #1e293b; padding-right: 170px;">${s.nombre}</h3>
                    <div class="mencion" style="color: #64748b; font-size: 0.85rem; display: flex; align-items: center;">
                        <span class="mencion-dot" data-m="${s.mencion_id || ''}"></span>Mención: ${mention ? mention.nombre : 'Ninguna'}
                    </div>
                    ${profesorInfo}
                </div>
                `;
            }).join('');

            
            contentsHtml += '</div></div>';
        });

        container.innerHTML = tabsHtml + contentsHtml;

        // Añadir eventos a las pestañas
        const tabs = container.querySelectorAll('.sec-tab');
        const contents = container.querySelectorAll('.sec-tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const targetId = 'sec-tab-' + tab.getAttribute('data-year');
                document.getElementById(targetId).classList.add('active');
            });
        });
    }

    // Actualizar select de secciones en notas
    const sectionSelects = document.querySelectorAll('#section-select, #grade-section');
    sectionSelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Seleccione una sección</option>' + 
            sortedSections.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
        if (currentValue && sortedSections.some(s => s.id == currentValue)) {
            select.value = currentValue;
        }
    });

    // Actualizar filtro de secciones de estudiantes — se usa una variable local diferente para evitar colisión
    const studentMentionFilterLocal = document.getElementById('student-mention-filter');
    if (studentMentionFilterLocal) {
        updateSectionFilterOptions(studentMentionFilterLocal.value);
    }
}



function updateDashboardStats() {
    // Contador de usuarios
    const totalUsers = users.length;
    const userDisplay = document.getElementById('total-users');
    if (userDisplay) userDisplay.innerText = `${totalUsers} Registrados`;

    // Contador de estudiantes
    const totalStudents = students.length;
    const studentDisplay = document.getElementById('total-students-home');
    if (studentDisplay) studentDisplay.innerText = `${totalStudents} Inscritos`;

    // Contador de menciones
    const totalMentions = mentions.length;
    const mentionDisplay = document.getElementById('total-mentions');
    if (mentionDisplay) mentionDisplay.innerText = `${totalMentions} Áreas Técnicas`;

    // Fecha actual
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.innerText = new Date().toLocaleDateString('es-ES', options);
    }
}

// Configurar botones de acción rápida
function setupQuickActions() {
    const addStudentBtn = document.getElementById('quick-add-student');
    const addTeacherBtn = document.getElementById('quick-add-teacher');

    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            const modalBtn = document.getElementById('add-student-btn');
            if (modalBtn) modalBtn.click();
        });
    }

    if (addTeacherBtn) {
        addTeacherBtn.addEventListener('click', () => {
            const modalBtn = document.getElementById('add-teacher-btn');
            if (modalBtn) modalBtn.click();
        });
    }
}

function renderAll() {
    renderUsers();
    renderTeachers();
    renderStudents();
    renderAdmins();
    renderMentions();
    renderSections();
    if (typeof renderPeriods === 'function') renderPeriods();
    if (typeof window.renderSubjects === 'function') window.renderSubjects();
    if (typeof window.renderVaciadoNotifications === 'function') window.renderVaciadoNotifications();
    
    // Sincronizar Gestor de Notas
    if (typeof window.loadPeriodsForGrades === 'function') window.loadPeriodsForGrades();
    if (typeof window.loadMentionsForGrades === 'function') window.loadMentionsForGrades();
    if (window.RepPanel && typeof window.RepPanel.refrescar === 'function') window.RepPanel.refrescar();
    
    initializeStudentFilters();
    updateDashboardStats();
    setupQuickActions();
}


// NOTA: Las funciones addStudent, updateStudent, deleteStudent ya están definidas globalmente en data.js