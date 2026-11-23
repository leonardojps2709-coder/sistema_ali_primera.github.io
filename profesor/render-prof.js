// render-prof.js - Solo para la interfaz de profesor
// Dependencias: data.js, materias.js

// Función auxiliar para extraer el año de un nombre de sección (ej: "4to Año A" -> 4)
function extraerAnio(nombre) {
    const match = nombre.match(/\d+/);
    return match ? parseInt(match[0]) : 999;
}

// Función para obtener el nombre de la sección por ID
function getSectionName(sectionId) {
    if (!sectionId) return '';
    const section = sections.find(s => s.id === parseInt(sectionId));
    return section ? section.nombre : '';
}


// ========== RENDERIZADO DE MENCIONES (Diseño Maestro y Detalle) ==========
let selectedMentionId = null;

function getMentionColorAndIcon(mId, mName, customColor = null, customIcon = null) {
    let mObj = null;
    if (typeof mentions !== 'undefined' && Array.isArray(mentions)) {
        mObj = mentions.find(m => m.id == mId);
    }
    const color = customColor || (mObj && mObj.color);
    const icon = customIcon || (mObj && mObj.icono);

    const name = (mName || (mObj && mObj.nombre) || '').toLowerCase();
    
    let sub = 'Especialidad Técnica';
    if (name.includes('electricidad')) sub = 'Especialidad Industrial • Electricidad';
    else if (name.includes('metalmec') || name.includes('metal')) sub = 'Especialidad Industrial • Metalmecánica';
    else if (name.includes('petroqu') || name.includes('refina')) sub = 'Especialidad Química • Refinación y Petroquímica';
    else if (name.includes('riesgo')) sub = 'Especialidad de Protección y Seguridad';
    else if (name.includes('informát') || name.includes('computac') || name.includes('sistema')) sub = 'Especialidad en Informática y Tecnología';
    else if (name.includes('contabil') || name.includes('administra')) sub = 'Especialidad en Administración y Servicios';
    else if (mName) sub = `Especialidad Técnica • ${mName}`;

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

    // Secciones asignadas al profesor conectado
    const teacherSectionsIds = (window.currentTeacher && window.currentTeacher.secciones) 
        ? window.currentTeacher.secciones 
        : [];

    const allSections = (typeof sections !== 'undefined' ? sections : []);

    // Filtrar SOLO las menciones donde el profesor tiene secciones asignadas
    const assignedMentions = (typeof mentions !== 'undefined' ? mentions : []).filter(m => {
        return allSections.some(sec => (sec.mencion_id || sec.mencionId) == m.id && teacherSectionsIds.includes(sec.id));
    });

    if (assignedMentions.length === 0) {
        sidebar.innerHTML = `
            <div style="padding:1.5rem 1rem; text-align:center; color:#64748b; font-size:0.85rem; background:#ffffff; border-radius:10px; border:1px solid #e2e8f0;">
                <i class='bx bx-info-circle' style="font-size:1.8rem; color:#94a3b8; display:block; margin-bottom:0.5rem;"></i>
                No tienes menciones asignadas
            </div>`;
        panel.innerHTML = `
            <div style="padding:3.5rem 1.5rem; text-align:center; color:#64748b; background:#ffffff; border-radius:14px; border:1px solid #e2e8f0;">
                <i class='bx bx-book-bookmark' style="font-size:2.8rem; color:#94a3b8; display:block; margin-bottom:0.75rem;"></i>
                <h3 style="color:#1e293b; margin-bottom:0.4rem; font-size:1.15rem;">Sin Menciones Asignadas</h3>
                <p style="font-size:0.88rem; max-width:420px; margin:0 auto; color:#64748b; line-height:1.5;">Actualmente no posees secciones asignadas en ninguna especialidad técnica.</p>
            </div>`;
        return;
    }

    if (!selectedMentionId || !assignedMentions.some(m => m.id == selectedMentionId)) {
        selectedMentionId = assignedMentions[0].id;
    }

    // Renderizar lista lateral ÚNICAMENTE con las menciones asignadas
    sidebar.innerHTML = assignedMentions.map(m => {
        const theme = getMentionColorAndIcon(parseInt(m.id), m.nombre);
        const mySecsInMention = allSections.filter(sec => (sec.mencion_id || sec.mencionId) == m.id && teacherSectionsIds.includes(sec.id));
        const mySecIds = mySecsInMention.map(s => s.id);
        const stuCount = (typeof students !== 'undefined' ? students : []).filter(s => mySecIds.includes(parseInt(s.seccion_id || s.seccion))).length;
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
                    <span><i class='bx bx-grid'></i> ${mySecsInMention.length} sección${mySecsInMention.length === 1 ? '' : 'es'}</span>
                </div>
            </div>
        `;
    }).join('');

    // Datos de la mención seleccionada
    const curMention = assignedMentions.find(m => m.id == selectedMentionId) || assignedMentions[0];
    const curTheme = getMentionColorAndIcon(parseInt(curMention.id), curMention.nombre);

    // Filtrar ÚNICAMENTE las secciones asignadas al profesor en esta mención
    const mSections = allSections.filter(sec => (sec.mencion_id || sec.mencionId) == curMention.id && teacherSectionsIds.includes(sec.id));
    const mSecIds = mSections.map(sec => sec.id);
    const mStudents = (typeof students !== 'undefined' ? students : []).filter(s => mSecIds.includes(parseInt(s.seccion_id || s.seccion)));

    // Materias dictadas por el profesor en esta mención
    let teacherSubjects = new Set();
    if (window.currentTeacher && window.currentTeacher.asignaciones) {
        try {
            const asigs = typeof window.currentTeacher.asignaciones === 'string'
                ? JSON.parse(window.currentTeacher.asignaciones)
                : window.currentTeacher.asignaciones;
            asigs.forEach(a => {
                if (mSecIds.includes(parseInt(a.seccion_id))) {
                    if (a.materia) teacherSubjects.add(a.materia);
                }
            });
        } catch(e){}
    }
    const totalSubjects = teacherSubjects.size;

    // Promedio general de las secciones asignadas al profesor
    const mGrades = (typeof grades !== 'undefined' ? grades : []).filter(g => mSecIds.includes(parseInt(g.seccion_id)));
    const mDefs = mGrades.map(g => parseFloat(g.definitiva)).filter(v => !isNaN(v) && v > 0);
    const mProm = mDefs.length > 0 ? (mDefs.reduce((a, b) => a + b, 0) / mDefs.length).toFixed(1) : null;
    const promColor = mProm === null ? '#64748b' : (parseFloat(mProm) >= 14 ? '#16a34a' : (parseFloat(mProm) >= 10 ? '#d97706' : '#dc2626'));

    // Filas de las secciones asignadas
    const rowsHtml = mSections.length === 0
        ? `<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:#94a3b8;">No tienes secciones asignadas en esta mención</td></tr>`
        : mSections.map(s => {
            const sStudents = (typeof students !== 'undefined' ? students : []).filter(st => (st.seccion_id || st.seccion) == s.id);
            let profNombre = 'Sin asignar';
            if (s.profesor_guia_id && window.currentTeacher && s.profesor_guia_id == window.currentTeacher.id) {
                profNombre = `<span style="color:#15803d;font-weight:700;"><i class='bx bx-check-shield'></i> Tú (Prof. Guía)</span>`;
            } else if (s.profesor_guia_nombre) {
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

    panel.innerHTML = `
        <div class="md-header">
            <div class="md-header-left">
                <div class="md-icon" style="background: ${curTheme.color};">
                    <i class='${curTheme.icon}'></i>
                </div>
                <div>
                    <h2 class="md-title">Mención: ${curMention.nombre}</h2>
                    <div class="md-subtitle">${curTheme.sub} • Especialidad Asignada</div>
                </div>
            </div>
            <span class="md-badge" style="border-color:#86efac;background:#f0fdf4;color:#166534;">
                ✓ Tu Especialidad Activa
            </span>
        </div>

        <div class="md-kpi-grid">
            <div class="md-kpi-card">
                <div class="md-kpi-val" style="color: ${curTheme.color};">${mStudents.length}</div>
                <div class="md-kpi-label">Tus Estudiantes</div>
            </div>
            <div class="md-kpi-card">
                <div class="md-kpi-val">${mSections.length}</div>
                <div class="md-kpi-label">Secciones Asignadas</div>
            </div>
            <div class="md-kpi-card">
                <div class="md-kpi-val">${totalSubjects > 0 ? totalSubjects : mSections.length}</div>
                <div class="md-kpi-label">${totalSubjects > 0 ? 'Asignaturas' : 'Cursos'}</div>
            </div>
            <div class="md-kpi-card">
                <div class="md-kpi-val" style="color: ${promColor};">${mProm !== null ? mProm : '—'}</div>
                <div class="md-kpi-label">Rendimiento Promedio</div>
            </div>
        </div>

        <div class="md-table-title">
            <i class='bx bx-grid-alt'></i> Secciones asignadas a tu cargo en esta especialidad
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
    `;
}

function renderMentions() {
    renderMentionsMasterDetail();

    // Actualizar contador en la tarjeta de inicio
    const teacherSectionsIds = (window.currentTeacher && window.currentTeacher.secciones) ? window.currentTeacher.secciones : [];
    const allSections = (typeof sections !== 'undefined' ? sections : []);
    const assignedMentions = (typeof mentions !== 'undefined' ? mentions : []).filter(m => {
        return allSections.some(sec => (sec.mencion_id || sec.mencionId) == m.id && teacherSectionsIds.includes(sec.id));
    });

    const totalMentionsSpan = document.getElementById('total-mentions');
    if (totalMentionsSpan) {
        totalMentionsSpan.innerText = assignedMentions.length + ' Áreas Técnicas';
    }

    // Actualizar selects de mención (para filtros de notas)
    let allowedMentions = mentions;
    if (window.currentTeacher && window.currentTeacher.secciones && window.currentTeacher.secciones.length > 0) {
        const teacherSectionsIds = window.currentTeacher.secciones;
        const allowedMentionIds = new Set();
        (typeof sections !== 'undefined' ? sections : []).forEach(s => {
            if (teacherSectionsIds.includes(s.id)) {
                allowedMentionIds.add(s.mencion_id || s.mencionId);
            }
        });
        const filtered = mentions.filter(m => allowedMentionIds.has(m.id));
        if (filtered.length > 0) allowedMentions = filtered;
    }

    const mentionSelects = document.querySelectorAll('#mention-select');
    mentionSelects.forEach(select => {
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Seleccione una mención</option>' +
                allowedMentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
            if (currentValue && allowedMentions.some(m => m.id == currentValue)) {
                select.value = currentValue;
            }
        }
    });

    // Actualizar filtro de menciones en la sección de secciones
    const mentionFilter = document.getElementById('mention-filter');
    if (mentionFilter) {
        const currentValue = mentionFilter.value;
        mentionFilter.innerHTML = '<option value="">Todas las menciones</option>' +
            allowedMentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        if (currentValue && allowedMentions.some(m => m.id == currentValue)) {
            mentionFilter.value = currentValue;
        }
        
        // Asignar evento de filtrado
        mentionFilter.onchange = () => renderSections();
    }
}

// ========== RENDERIZADO DE SECCIONES CON PESTAÑAS ==========
function renderSections() {
    const container = document.getElementById('sections-cards-container');
    if (!container) return;

    let filteredSections = sections;
    if (window.currentTeacher && window.currentTeacher.secciones) {
        filteredSections = sections.filter(s => window.currentTeacher.secciones.includes(s.id));
    }

    // Aplicar filtro por mención si está seleccionado
    const mentionFilter = document.getElementById('mention-filter');
    if (mentionFilter && mentionFilter.value) {
        filteredSections = filteredSections.filter(s => (s.mencion_id == mentionFilter.value || s.mencionId == mentionFilter.value));
    }

    const sortedSections = [...filteredSections].sort((a, b) => {
        const anioA = extraerAnio(a.nombre);
        const anioB = extraerAnio(b.nombre);
        if (anioA !== anioB) return anioA - anioB;
        return a.nombre.localeCompare(b.nombre);
    });

    if (sortedSections.length === 0) {
        container.innerHTML = `<div class="empty-msg" style="padding: 2rem; text-align: center; color: #64748b; background: white; border-radius: 8px; border: 1px dashed #cbd5e1;">No hay secciones asignadas a este profesor</div>`;
        return;
    }

    // Agrupar por año
    const yearsGroup = {};
    sortedSections.forEach(s => {
        const anio = extraerAnio(s.nombre);
        if (!yearsGroup[anio]) yearsGroup[anio] = [];
        yearsGroup[anio].push(s);
    });

    const sortedYears = Object.keys(yearsGroup).map(Number).sort((a, b) => a - b);
    const activeTab = sortedYears[0];

    const yearLabel = (y) => {
        if (y === 1) return '1ro Año';
        if (y === 2) return '2do Año';
        if (y === 3) return '3ro Año';
        if (y >= 4 && y <= 6) return `${y}to Año`;
        return 'Otros';
    };

    let tabsHtml = '<div class="sec-tabs">';
    sortedYears.forEach(y => {
        tabsHtml += `<div class="sec-tab ${y === activeTab ? 'active' : ''}" data-year="${y}">${yearLabel(y)}</div>`;
    });
    tabsHtml += '</div>';

    let contentsHtml = '';
    sortedYears.forEach(y => {
        contentsHtml += `<div class="sec-tab-content ${y === activeTab ? 'active' : ''}" id="sec-tab-${y}">`;
        contentsHtml += '<div class="sections-grid">';
        contentsHtml += yearsGroup[y].map(s => {
            const mention = mentions.find(m => m.id == (s.mencion_id || s.mencionId));
            
            let profesorInfo = '';
            if (s.profesor_guia_nombre) {
                profesorInfo = `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9; font-size: 0.9rem; color: #475569;">
                        Profesor Guía: <strong style="color: #1e293b;">${s.profesor_guia_nombre}</strong>
                    </div>`;
            } else if (s.profesor_guia_id) {
                const profe = users.find(u => u.id == s.profesor_guia_id);
                if (profe) {
                    profesorInfo = `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9; font-size: 0.9rem; color: #475569;">
                            Profesor Guía: <strong style="color: #1e293b;">${profe.nombre} ${profe.apellido}</strong>
                        </div>`;
                }
            }
            if (!profesorInfo) {
                profesorInfo = `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9; font-size: 0.9rem; color: #94a3b8;">
                        Profesor Guía: <span style="font-style: italic;">Sin Asignar</span>
                    </div>`;
            }

            return `
            <div class="section-card hover-card section-card-clickable" data-id="${s.id}" data-mencion="${s.mencion_id || s.mencionId || ''}" style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; position: relative; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;">
                <h3 style="margin: 0 0 5px; font-size: 1.2rem; color: #1e293b;">${s.nombre}</h3>
                <div style="color: #64748b; font-size: 0.85rem; display: flex; align-items: center;">
                    <span class="mencion-dot" data-m="${s.mencion_id || s.mencionId || ''}"></span>Mención: ${mention ? mention.nombre : 'Ninguna'}
                </div>
                ${profesorInfo}
            </div>`;
        }).join('');
        contentsHtml += '</div></div>';
    });

    container.innerHTML = tabsHtml + contentsHtml;

    // Eventos de las pestañas
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



// ========== RENDERIZADO DE ESTUDIANTES (nuevo) ==========
function populateStudentFilters() {
    // Obtener las secciones del profesor
    let teacherSections = [];
    if (window.currentTeacher && window.currentTeacher.secciones) {
        teacherSections = sections.filter(s => window.currentTeacher.secciones.includes(s.id));
    }
    // Obtener menciones únicas de esas secciones
    const mentionIds = new Set(teacherSections.map(s => s.mencion_id || s.mencionId));
    const allowedMentions = mentions.filter(m => mentionIds.has(m.id));

    // Llenar select de menciones
    const mentionFilter = document.getElementById('student-mention-filter');
    if (mentionFilter) {
        mentionFilter.innerHTML = '<option value="">Todas las menciones</option>' +
            allowedMentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        mentionFilter.value = ''; // reset
    }

    // Llenar select de secciones (inicialmente todas las secciones del profesor)
    const sectionFilter = document.getElementById('student-section-filter');
    if (sectionFilter) {
        sectionFilter.innerHTML = '<option value="">Todas las secciones</option>' +
            teacherSections.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
        sectionFilter.value = ''; // reset
    }

    // Asignar eventos para filtros dinámicos
    if (mentionFilter && sectionFilter) {
        mentionFilter.onchange = () => {
            const selectedMention = parseInt(mentionFilter.value);
            if (selectedMention) {
                const filteredSections = teacherSections.filter(s => (s.mencion_id === selectedMention || s.mencionId === selectedMention));
                sectionFilter.innerHTML = '<option value="">Todas las secciones</option>' +
                    filteredSections.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
                sectionFilter.value = '';
            } else {
                sectionFilter.innerHTML = '<option value="">Todas las secciones</option>' +
                    teacherSections.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
                sectionFilter.value = '';
            }
            renderStudents();
        };
        sectionFilter.onchange = () => renderStudents();
    }
}

// Utilidad: iniciales del usuario
function getUserInitials(nombre, apellido) {
    const n = (nombre || '').charAt(0).toUpperCase();
    const a = (apellido || '').charAt(0).toUpperCase();
    return n + a;
}

// Utilidad: resaltado de texto buscado
function highlightText(text, query) {
    if (!query || !text) return text || '';
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return String(text).replace(re, '<mark class="search-mark">$1</mark>');
}

// El cálculo de promedio, momentos y lugar vive en lib/data.js
// (calcularRendimientoEstudiantes), para que todas las listas usen la misma regla.

/**
 * Clase CSS para resaltar los tres primeros lugares de la sección.
 */
function claseLugar(lugar) {
    if (lugar === 1) return 'rank-badge rank-1';
    if (lugar === 2) return 'rank-badge rank-2';
    if (lugar === 3) return 'rank-badge rank-3';
    return 'rank-badge';
}

function renderStudents() {
    const tbody = document.getElementById('students-list-body');
    if (!tbody) return;

    // Obtener secciones del profesor
    let teacherSections = [];
    if (window.currentTeacher && window.currentTeacher.secciones) {
        teacherSections = window.currentTeacher.secciones;
    }
    // Filtrar estudiantes que pertenezcan a esas secciones
    let filteredStudents = students.filter(s => teacherSections.includes(parseInt(s.seccion_id || s.seccion)));

    // Aplicar filtros
    const mentionId = document.getElementById('student-mention-filter')?.value;
    const sectionId = document.getElementById('student-section-filter')?.value;

    if (mentionId) {
        // Obtener IDs de secciones que coincidan con la mención seleccionada
        const allowedSectionIds = sections.filter(s => (s.mencion_id == mentionId || s.mencionId == mentionId)).map(s => s.id);
        filteredStudents = filteredStudents.filter(s => allowedSectionIds.includes(parseInt(s.seccion_id || s.seccion)));
    }
    if (sectionId) {
        filteredStudents = filteredStudents.filter(s => parseInt(s.seccion_id || s.seccion) == sectionId);
    }

    // Búsqueda por texto (viene del HTML)
    const q = (window.profStudentSearchQuery || '').toLowerCase();
    if (q) {
        filteredStudents = filteredStudents.filter(s => {
            const secNombre = getSectionName(s.seccion_id || s.seccion);
            return [
                s.cedula, s.nombre, s.apellido, s.email, s.telefono, secNombre
            ].some(v => v && String(v).toLowerCase().includes(q));
        });
    }

    // Calcular promedio y lugar en la sección de todos los estudiantes
    const rendimiento = calcularRendimientoEstudiantes();

    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:3.5rem 2rem;color:#94a3b8;">
                    <i class='bx bx-search-alt' style="font-size:2.5rem;display:block;margin-bottom:0.75rem;color:#cbd5e1;"></i>
                    <span style="font-weight:500;">No se encontraron estudiantes</span><br>
                    <small style="font-size:0.8rem;">Intenta con otro término o cambia los filtros</small>
                </td>
            </tr>`;
    } else {
        tbody.innerHTML = filteredStudents.map(s => {
            const sectionName = getSectionName(s.seccion_id || s.seccion);
            
            const fullName = highlightText(`${s.apellido || ''}, ${s.nombre || ''}`, q);
            const ced  = highlightText(s.cedula || '', q);
            const sec  = highlightText(sectionName || 'Sin sección', q);

            // Promedios por momento, definitiva final y lugar dentro de la sección
            const info = rendimiento.get(parseInt(s.id));
            const notaM1 = info ? formatearNota(info.momentos[1]) : '—';
            const notaM2 = info ? formatearNota(info.momentos[2]) : '—';
            const notaM3 = info ? formatearNota(info.momentos[3]) : '—';
            const notaFinal = info ? formatearNota(info.promedio) : '—';
            const lugar = (info && info.lugar) ? info.lugar : null;
            const lugarTexto = lugar ? `${lugar}°` : '—';
            const lugarClase = lugar ? claseLugar(lugar) : 'rank-badge rank-badge-empty';
            const lugarTitulo = lugar
                ? `Puesto ${lugar} de su sección · ${info.materias} materia(s) calificada(s)`
                : 'Sin calificaciones registradas';
            
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
                <td style="text-align:center;">${notaM1}</td>
                <td style="text-align:center;">${notaM2}</td>
                <td style="text-align:center;">${notaM3}</td>
                <td style="text-align:center;"><span class="grade-badge">${notaFinal}</span></td>
                <td style="text-align:center;"><span class="${lugarClase}" title="${lugarTitulo}">${lugarTexto}</span></td>
            </tr>`;
        }).join('');
    }
}

function updateDashboardStats() {
    // Contador de estudiantes asignados
    let totalStudents = 0;
    if (window.currentTeacher && window.currentTeacher.secciones) {
        const teacherSections = window.currentTeacher.secciones;
        totalStudents = students.filter(s => teacherSections.includes(parseInt(s.seccion_id || s.seccion))).length;
    }
    const studentDisplay = document.getElementById('total-students-home');
    if (studentDisplay) studentDisplay.innerText = `${totalStudents} Estudiantes`;

    // Contador de secciones asignadas
    const totalSections = (window.currentTeacher && window.currentTeacher.secciones) ? window.currentTeacher.secciones.length : 0;
    const sectionDisplay = document.getElementById('total-sections-home');
    if (sectionDisplay) sectionDisplay.innerText = `${totalSections} Asignadas`;

    // Fecha actual
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.innerText = new Date().toLocaleDateString('es-ES', options);
    }
}

// ========== RENDERIZADO PRINCIPAL ==========
function renderAll() {
    if (document.getElementById('mentions-sidebar-list') || document.getElementById('mentions-table-body')) renderMentions();
    if (document.getElementById('sections-cards-container')) renderSections();
    if (document.getElementById('students-list-body')) {
        populateStudentFilters();
        renderStudents();
    }
    updateDashboardStats();
    if (typeof window.renderVaciadoNotifications === 'function') window.renderVaciadoNotifications();
    // Refrescar los selectores de reportes cuando llegan los datos
    if (window.RepPanel && typeof window.RepPanel.refrescar === 'function') window.RepPanel.refrescar();
}


// Exponer funciones globales necesarias para otros scripts
window.extraerAnio = extraerAnio;
window.getSectionName = getSectionName;

document.addEventListener('DOMContentLoaded', () => {
    // Escuchar clicks en tarjetas de sección
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.section-card-clickable')) {
            const id = parseInt(e.target.closest('.section-card-clickable').dataset.id);
            if (typeof window.openSectionDetailModal === 'function') {
                window.openSectionDetailModal(id);
            }
        }
    });

    // Eventos del modal de detalle de sección
    document.getElementById('close-section-detail-btn')?.addEventListener('click', () => window.closeSectionDetailModal());
    document.getElementById('close-section-detail-btn-footer')?.addEventListener('click', () => window.closeSectionDetailModal());
    document.getElementById('section-detail-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) window.closeSectionDetailModal();
    });
    document.getElementById('tab-btn-students')?.addEventListener('click', () => window.showDetailTab('students'));
    document.getElementById('tab-btn-teachers')?.addEventListener('click', () => window.showDetailTab('teachers'));
});

// Funciones globales para el modal de detalle de sección en perfil profesor
window.openSectionDetailModal = function(sectionId) {
    const section = sections.find(s => s.id == sectionId);
    if (!section) return;

    // 1. Establecer datos de texto
    const nameEl = document.getElementById('detail-section-name');
    const mentionEl = document.getElementById('detail-section-mention');
    const guideEl = document.getElementById('detail-section-guide');

    if (nameEl) nameEl.textContent = section.nombre;
    
    const mentionObj = mentions.find(m => m.id == (section.mencion_id || section.mencionId));
    if (mentionEl) mentionEl.textContent = `Mención: ${mentionObj ? mentionObj.nombre : 'Ninguna'}`;

    let guideText = 'Sin Asignar';
    if (section.profesor_guia_nombre) {
        guideText = section.profesor_guia_nombre;
    } else if (section.profesor_guia_id) {
        const u = users.find(usr => usr.id == section.profesor_guia_id);
        if (u) guideText = `${u.nombre} ${u.apellido}`;
    }
    if (guideEl) guideEl.textContent = `Profesor Guía: ${guideText}`;

    // 2. Poblar Estudiantes
    const studentTbody = document.getElementById('detail-students-tbody');
    const filteredStudents = students.filter(s => (s.seccion_id == sectionId || s.seccion == sectionId));
    
    const countStudentsSpan = document.getElementById('detail-students-count');
    if (countStudentsSpan) countStudentsSpan.textContent = filteredStudents.length;

    if (studentTbody) {
        if (filteredStudents.length === 0) {
            studentTbody.innerHTML = `<tr><td colspan="4" class="empty-msg" style="text-align:center;">No hay estudiantes inscritos en esta sección.</td></tr>`;
        } else {
            studentTbody.innerHTML = filteredStudents.map(s => {
                const isActivo = s.activo === undefined || s.activo === null || parseInt(s.activo) === 1;
                const statusBadge = isActivo ? '' : ' <span class="badge" style="background:#fee2e2;color:#991b1b;font-size:0.7rem;padding:2px 6px;border-radius:6px;font-weight:600;">Inhabilitado</span>';
                return `
                <tr style="${!isActivo ? 'opacity:0.75;background-color:#fff5f5;' : ''}">
                    <td style="font-weight:600;">${s.cedula}</td>
                    <td>${s.apellido || ''}, ${s.nombre || ''}${statusBadge}</td>
                    <td>${s.email || '-'}</td>
                    <td>${s.telefono || '-'}</td>
                </tr>`;
            }).join('');
        }
    }

    // 3. Poblar Profesores y Materias
    const teachersTbody = document.getElementById('detail-teachers-tbody');
    const teachersList = [];
    
    users.filter(u => u.rol === 'teacher').forEach(t => {
        let asig = [];
        try {
            asig = typeof t.asignaciones === 'string' ? JSON.parse(t.asignaciones) : (t.asignaciones || []);
        } catch(e) {}
        asig.forEach(a => {
            if (a.seccion_id == sectionId) {
                teachersList.push({
                    name: `${t.apellido || ''}, ${t.nombre || ''}`,
                    materia: a.materia_nombre || a.materia || 'Asignatura',
                    contacto: `${t.email || '-'} / ${t.telefono || '-'}`
                });
            }
        });
    });

    const countTeachersSpan = document.getElementById('detail-teachers-count');
    if (countTeachersSpan) countTeachersSpan.textContent = teachersList.length;

    if (teachersTbody) {
        if (teachersList.length === 0) {
            teachersTbody.innerHTML = `<tr><td colspan="3" class="empty-msg" style="text-align:center;">No hay profesores asignados a esta sección.</td></tr>`;
        } else {
            teachersTbody.innerHTML = teachersList.map(t => `
                <tr>
                    <td style="font-weight:600;">${t.name}</td>
                    <td><span class="status-active" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;">${t.materia}</span></td>
                    <td>${t.contacto}</td>
                </tr>
            `).join('');
        }
    }

    // Resetear pestañas
    window.showDetailTab('students');

    // Mostrar modal
    const overlay = document.getElementById('section-detail-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        requestAnimationFrame(() => overlay.classList.add('active'));
    }
};

window.closeSectionDetailModal = function() {
    const overlay = document.getElementById('section-detail-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.style.display = 'none', 300);
    }
};

window.showDetailTab = function(tabName) {
    const tabStudents = document.getElementById('tab-btn-students');
    const tabTeachers = document.getElementById('tab-btn-teachers');
    const contentStudents = document.getElementById('detail-tab-students-content');
    const contentTeachers = document.getElementById('detail-tab-teachers-content');

    if (!tabStudents || !tabTeachers || !contentStudents || !contentTeachers) return;

    if (tabName === 'students') {
        tabStudents.classList.add('active');
        tabStudents.style.color = '#4a151b';
        tabStudents.style.borderBottom = '3px solid #4a151b';
        tabTeachers.classList.remove('active');
        tabTeachers.style.color = '#64748b';
        tabTeachers.style.borderBottom = 'none';

        contentStudents.style.display = 'block';
        contentTeachers.style.display = 'none';
    } else {
        tabTeachers.classList.add('active');
        tabTeachers.style.color = '#4a151b';
        tabTeachers.style.borderBottom = '3px solid #4a151b';
        tabStudents.classList.remove('active');
        tabStudents.style.color = '#64748b';
        tabStudents.style.borderBottom = 'none';

        contentStudents.style.display = 'none';
        contentTeachers.style.display = 'block';
    }
};