// admin/student-profile-modal.js
// Modal de Perfil del Estudiante — Muestra información calculada (redundante) a partir de los datos existentes

/**
 * Abre el modal de perfil de un estudiante específico.
 * Toda la info mostrada se CALCULA a partir de datos ya en memoria (grades, sections, mentions, periods).
 * @param {number|string} studentId
 */
window.openStudentProfileModal = function(studentId) {
    const student = (typeof students !== 'undefined' ? students : []).find(s => s.id == studentId);
    if (!student) return;

    // ── Datos de sección y mención ────────────────────────────────────────────
    const secId = student.seccion_id || student.seccion;
    const sectionObj = (typeof sections !== 'undefined' ? sections : []).find(s => s.id == secId);
    const mentionObj = sectionObj
        ? (typeof mentions !== 'undefined' ? mentions : []).find(m => m.id == (sectionObj.mencion_id || sectionObj.mencionId))
        : null;

    // ── Notas del estudiante ──────────────────────────────────────────────────
    const studentGrades = (typeof grades !== 'undefined' ? grades : []).filter(g => g.estudiante_id == studentId);

    // ── Cálculos redundantes ──────────────────────────────────────────────────
    // 1. Promedio general (definitivas con valor numérico)
    const definitivas = studentGrades
        .map(g => parseFloat(g.definitiva))
        .filter(v => !isNaN(v) && v > 0);

    const promedioGeneral = definitivas.length > 0
        ? (definitivas.reduce((a, b) => a + b, 0) / definitivas.length).toFixed(2)
        : null;

    // 2. Total de inasistencias acumuladas
    const totalInasistencias = studentGrades.reduce((acc, g) => {
        return acc + (parseInt(g.inas1) || 0) + (parseInt(g.inas2) || 0) + (parseInt(g.inas3) || 0);
    }, 0);

    // 3. Materias aprobadas vs reprobadas (nota definitiva >= 10 = aprobado)
    const materiasConNota = studentGrades.filter(g => parseFloat(g.definitiva) > 0 && !isNaN(parseFloat(g.definitiva)));
    const aprobadas = materiasConNota.filter(g => parseFloat(g.definitiva) >= 10).length;
    const reprobadas = materiasConNota.filter(g => parseFloat(g.definitiva) < 10).length;

    // 4. Nivel de riesgo académico
    let nivelRiesgo = 'Bajo';
    let riesgoClass = 'risk-low';
    if (promedioGeneral !== null) {
        const prom = parseFloat(promedioGeneral);
        if (prom < 10 || totalInasistencias > 15) {
            nivelRiesgo = 'Alto';
            riesgoClass = 'risk-high';
        } else if (prom < 13 || totalInasistencias > 8) {
            nivelRiesgo = 'Medio';
            riesgoClass = 'risk-medium';
        }
    }

    // 5. Historial de notas agrupado por materia
    const gradesBySubject = {};
    studentGrades.forEach(g => {
        const key = g.materia || 'Sin materia';
        if (!gradesBySubject[key]) gradesBySubject[key] = [];
        const periodoObj = (typeof periods !== 'undefined' ? periods : []).find(p => p.id == g.periodo_id);
        gradesBySubject[key].push({ ...g, periodoNombre: periodoObj ? periodoObj.nombre : ('Período ' + g.periodo_id) });
    });

    // ── Determinar color plano de la mención ────────────────────────────────
    const mId = mentionObj ? parseInt(mentionObj.id) : 0;
    const mName = (mentionObj && mentionObj.nombre ? mentionObj.nombre.toLowerCase() : '');

    let mentionBg = '#4a151b'; // Vinotinto institucional plano default
    if (mId === 1 || mName.includes('electricidad')) {
        // Electricidad -> Ámbar / Dorado cálido plano
        mentionBg = '#b45309';
    } else if (mId === 2 || mName.includes('metalmec') || mName.includes('metal')) {
        // Metalmecánica -> Índigo plano
        mentionBg = '#4338ca';
    } else if (mId === 3 || mName.includes('petroqu') || mName.includes('refina')) {
        // Refinación y Petroquímica -> Esmeralda plano
        mentionBg = '#047857';
    } else if (mId === 4 || mName.includes('riesgo')) {
        // Gestión Integral de Riesgo -> Carmesí / Rojo plano
        mentionBg = '#b91c1c';
    }

    // ── Renderizar contenido ──────────────────────────────────────────────────
    const fullName = ((student.nombre || '').trim() + ' ' + (student.apellido || '').trim()).trim();
    const initials = ((student.nombre || ' ').charAt(0) + (student.apellido || ' ').charAt(0)).toUpperCase();

    const promedioColor = promedioGeneral === null ? '#94a3b8'
        : parseFloat(promedioGeneral) >= 15 ? '#10b981'
        : parseFloat(promedioGeneral) >= 10 ? '#f59e0b'
        : '#ef4444';

    // ── Tarjetas de estadísticas (2x2 Grid) ──────────────────────────────────
    const statsHTML = `
        <div class="sp-stat-card">
            <div class="sp-stat-icon-wrap" style="background:#f1f5f9; color:#64748b;">
                <i class='bx bx-bar-chart-alt-2'></i>
            </div>
            <div class="sp-stat-content">
                <div class="sp-stat-value" style="color:${promedioGeneral !== null ? promedioColor : '#0f172a'};">
                    ${promedioGeneral !== null ? promedioGeneral : '—'}
                </div>
                <div class="sp-stat-label">Promedio general</div>
                <div class="sp-stat-sub">
                    ${promedioGeneral !== null
                        ? (parseFloat(promedioGeneral) >= 10 ? '✓ Aprobado' : '✗ Reprobado')
                        : 'Sin notas registradas'}
                </div>
            </div>
        </div>

        <div class="sp-stat-card">
            <div class="sp-stat-icon-wrap" style="background:#e0e7ff; color:#4338ca;">
                <i class='bx bx-book-open'></i>
            </div>
            <div class="sp-stat-content">
                <div class="sp-stat-value" style="color:#4338ca;">${Object.keys(gradesBySubject).length}</div>
                <div class="sp-stat-label">Materias con notas cargadas</div>
                <div class="sp-stat-sub">${Object.keys(gradesBySubject).length} materia(s)</div>
            </div>
        </div>

        <div class="sp-stat-card">
            <div class="sp-stat-icon-wrap" style="background:#dcfce7; color:#16a34a;">
                <i class='bx bx-check-circle'></i>
            </div>
            <div class="sp-stat-content">
                <div class="sp-stat-value" style="color:#16a34a;">${aprobadas}</div>
                <div class="sp-stat-label">Materias aprobadas</div>
                <div class="sp-stat-sub">de ${materiasConNota.length} evaluada(s)</div>
            </div>
        </div>

        <div class="sp-stat-card">
            <div class="sp-stat-icon-wrap" style="background:#fee2e2; color:#dc2626;">
                <i class='bx bx-calendar-x'></i>
            </div>
            <div class="sp-stat-content">
                <div class="sp-stat-value" style="color:#dc2626;">${totalInasistencias}</div>
                <div class="sp-stat-label">Inasistencias total</div>
                <div class="sp-stat-sub">${reprobadas} materia(s) reprobada(s)</div>
            </div>
        </div>`;

    // ── Historial por materia ─────────────────────────────────────────────────
    const historialHTML = Object.keys(gradesBySubject).length === 0
        ? `<div class="sp-empty"><i class='bx bx-notepad'></i><p>Aún no hay materias con notas cargadas para este estudiante.</p></div>`
        : Object.entries(gradesBySubject).map(function([materia, records]) {
            const lastRecord = records[records.length - 1];
            const defVal = parseFloat(lastRecord.definitiva);
            const statusBadge = isNaN(defVal) || defVal === 0
                ? '<span class="sp-badge pending">Pendiente</span>'
                : defVal >= 10
                    ? '<span class="sp-badge approved">Aprobado</span>'
                    : '<span class="sp-badge failed">Reprobado</span>';

            const rowsHTML = records.map(function(r) {
                const mp1 = parseFloat(r.mp1) || 0;
                const mp2 = parseFloat(r.mp2) || 0;
                const mp3 = parseFloat(r.mp3) || 0;
                const def = parseFloat(r.definitiva) || 0;
                const defColor = def === 0 ? '#64748b' : def >= 10 ? '#10b981' : '#ef4444';
                return '<tr>' +
                    '<td style="font-weight:500;color:#334155;">' + r.periodoNombre + '</td>' +
                    '<td class="sp-nota-cell">' + (mp1 > 0 ? mp1.toFixed(2) : '—') + '</td>' +
                    '<td class="sp-inas-cell">' + (parseInt(r.inas1) || 0) + '</td>' +
                    '<td class="sp-nota-cell">' + (mp2 > 0 ? mp2.toFixed(2) : '—') + '</td>' +
                    '<td class="sp-inas-cell">' + (parseInt(r.inas2) || 0) + '</td>' +
                    '<td class="sp-nota-cell">' + (mp3 > 0 ? mp3.toFixed(2) : '—') + '</td>' +
                    '<td class="sp-inas-cell">' + (parseInt(r.inas3) || 0) + '</td>' +
                    '<td style="font-weight:700;color:' + defColor + ';text-align:center;">' + (def > 0 ? def.toFixed(2) : '—') + '</td>' +
                    '</tr>';
            }).join('');

            return '<div class="sp-subject-block">' +
                '<div class="sp-subject-header">' +
                    '<span class="sp-subject-title">' + materia + '</span>' +
                    statusBadge +
                '</div>' +
                '<div class="sp-table-wrap">' +
                    '<table class="sp-notes-table">' +
                        '<thead><tr>' +
                            '<th>Período</th>' +
                            '<th>MP1</th><th>Inas.</th>' +
                            '<th>MP2</th><th>Inas.</th>' +
                            '<th>MP3</th><th>Inas.</th>' +
                            '<th>Definitiva</th>' +
                        '</tr></thead>' +
                        '<tbody>' + rowsHTML + '</tbody>' +
                    '</table>' +
                '</div>' +
            '</div>';
        }).join('');

    // ── Rellenar el DOM del modal ─────────────────────────────────────────────
    const sidebarEl = document.getElementById('sp-sidebar');
    if (sidebarEl) sidebarEl.style.background = mentionBg;

    // Año escolar activo
    const activePeriod = (typeof periods !== 'undefined' ? periods : []).find(p => p.estado === 'activo')
        || (typeof periods !== 'undefined' && periods.length > 0 ? periods[0] : null);
    const periodTitle = activePeriod
        ? (activePeriod.nombre.toUpperCase().includes('AÑO') ? activePeriod.nombre.toUpperCase() : ('AÑO ESCOLAR ' + activePeriod.nombre.toUpperCase()))
        : 'AÑO ESCOLAR 2026–2027';
    const yearEl = document.getElementById('sp-school-year');
    if (yearEl) yearEl.textContent = periodTitle;

    const initialsEl = document.getElementById('sp-avatar-initials');
    if (initialsEl) initialsEl.textContent = initials;

    const nameEl = document.getElementById('sp-student-name');
    if (nameEl) nameEl.textContent = fullName;

    const cedulaEl = document.getElementById('sp-student-cedula');
    if (cedulaEl) cedulaEl.textContent = student.cedula || '—';

    const emailEl = document.getElementById('sp-student-email');
    if (emailEl) emailEl.textContent = student.email || 'No registrado';

    const phoneEl = document.getElementById('sp-student-phone');
    if (phoneEl) phoneEl.textContent = student.telefono || 'No registrado';

    const secEl = document.getElementById('sp-student-section');
    if (secEl) secEl.textContent = sectionObj ? sectionObj.nombre : 'Sin sección';

    const mentionEl = document.getElementById('sp-student-mention');
    if (mentionEl) mentionEl.textContent = mentionObj ? mentionObj.nombre : 'Sin mención';

    const riskEl = document.getElementById('sp-risk-level');
    if (riskEl) {
        riskEl.textContent = 'Riesgo ' + nivelRiesgo;
        riskEl.className = 'sp-risk-badge ' + riesgoClass;
    }

    const statsEl = document.getElementById('sp-stats-container');
    if (statsEl) statsEl.innerHTML = statsHTML;

    const histEl = document.getElementById('sp-historial-container');
    if (histEl) histEl.innerHTML = historialHTML;

    // Mostrar el modal
    const overlay = document.getElementById('student-profile-modal-overlay');
    if (overlay) {
        _initStudentProfileModalEvents();
        overlay.style.display = 'flex';
        requestAnimationFrame(function() { overlay.classList.add('active'); });
    }
};

// Cerrar el modal de perfil
window.closeStudentProfileModal = function() {
    const overlay = document.getElementById('student-profile-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    setTimeout(function() { overlay.style.display = 'none'; }, 320);
};

// Registrar eventos al cargar - compatible con scripts tardíos
let _spEventsInitialized = false;
function _initStudentProfileModalEvents() {
    if (_spEventsInitialized) return;
    const overlay = document.getElementById('student-profile-modal-overlay');
    if (!overlay) return;

    // Cerrar al hacer clic fuera del contenido del modal
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) window.closeStudentProfileModal();
    });

    // Botón "X" de cerrar
    const closeBtn = document.getElementById('sp-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', window.closeStudentProfileModal);

    _spEventsInitialized = true;
}

// Ejecutar inmediatamente si el DOM ya está listo, sino esperar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initStudentProfileModalEvents);
} else {
    _initStudentProfileModalEvents();
}
