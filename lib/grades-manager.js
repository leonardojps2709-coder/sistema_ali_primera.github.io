// lib/grades-manager.js
// Gestor unificado de calificaciones para Administradores y Profesores
// Soporta filtrado por permisos de docente (window.currentTeacher) o acceso total (Admin)

let currentGradesData = {
    mention: '',
    section: '',
    subject: '',
    periodo: '',
    periodoId: null,
    students: []
};

function initGradesManager() {
    const periodSelect = document.getElementById('grade-periodo');
    const mentionSelect = document.getElementById('grade-mention') || document.getElementById('mention-select');
    const sectionSelect = document.getElementById('grade-section') || document.getElementById('section-select');
    const subjectSelect = document.getElementById('grade-subject') || document.getElementById('subject-select');
    const loadBtn = document.getElementById('load-students-btn');
    const saveBtn = document.getElementById('save-grades-btn');
    const tbody = document.getElementById('grades-tbody');

    if (!periodSelect || !mentionSelect || !sectionSelect || !subjectSelect) return;

    const isTeacher = !!window.currentTeacher;
    const teacher = window.currentTeacher;

    // Asignaciones si es profesor
    let teacherAssignments = [];
    let teacherSections = [];
    let teacherSubjects = [];

    if (isTeacher && teacher) {
        try {
            teacherAssignments = typeof teacher.asignaciones === 'string' 
                ? JSON.parse(teacher.asignaciones) 
                : (teacher.asignaciones || []);
        } catch(e) {
            teacherAssignments = [];
        }
        teacherSections = [...new Set(teacherAssignments.map(a => parseInt(a.seccion_id)))].filter(id => !isNaN(id));
        teacherSubjects = [...new Set(teacherAssignments.map(a => a.materia_nombre || a.materia))];
    }

    // ========== CARGAR PERÍODOS ==========
    function loadPeriods() {
        if (!periodSelect) return;
        const periodList = typeof periods !== 'undefined' ? periods : [];
        const sorted = [...periodList].sort((a, b) => {
            const dateA = new Date(a.fecha_inicio || a.fechaInicio || 0);
            const dateB = new Date(b.fecha_inicio || b.fechaInicio || 0);
            return dateB - dateA;
        });

        if (sorted.length === 0) {
            periodSelect.innerHTML = '<option value="">Sin períodos registrados</option>';
        } else {
            periodSelect.innerHTML = '<option value="">Seleccione un período</option>' +
                sorted.map(p => `<option value="${p.id}" data-nombre="${p.nombre}">${p.nombre}</option>`).join('');
            
            // Seleccionar período activo por defecto si existe
            const activePeriod = sorted.find(p => p.estado === 'activo') || sorted[0];
            if (activePeriod) {
                periodSelect.value = activePeriod.id;
                currentGradesData.periodoId = activePeriod.id;
                currentGradesData.periodo = activePeriod.nombre;
            }
        }
    }

    // ========== CARGAR MENCIONES ==========
    function loadMentions() {
        if (!mentionSelect) return;
        const mentionList = typeof mentions !== 'undefined' ? mentions : [];
        const sectionList = typeof sections !== 'undefined' ? sections : [];

        let availableMentions = mentionList;
        if (isTeacher) {
            const allowedMentionIds = new Set();
            sectionList.forEach(s => {
                if (teacherSections.includes(s.id)) {
                    allowedMentionIds.add(s.mencion_id || s.mencionId);
                }
            });
            availableMentions = mentionList.filter(m => allowedMentionIds.has(m.id));
        }

        if (availableMentions.length === 0) {
            mentionSelect.innerHTML = '<option value="">No hay menciones disponibles</option>';
            sectionSelect.innerHTML = '<option value="">No hay secciones</option>';
            subjectSelect.innerHTML = '<option value="">No hay asignaturas</option>';
            return;
        }

        mentionSelect.innerHTML = '<option value="">Seleccione una mención</option>' +
            availableMentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');

        mentionSelect.value = availableMentions[0].id;
        updateSections(availableMentions[0].id);
    }

    // ========== ACTUALIZAR SECCIONES SEGÚN MENCIÓN ==========
    function updateSections(mentionId) {
        if (!sectionSelect) return;
        const sectionList = typeof sections !== 'undefined' ? sections : [];
        let filtered = sectionList.filter(s => (s.mencion_id == mentionId || s.mencionId == mentionId));

        if (isTeacher) {
            filtered = filtered.filter(s => teacherSections.includes(s.id));
        }

        // Ordenar secciones por año
        filtered.sort((a, b) => {
            const anioA = typeof extraerAnio === 'function' ? extraerAnio(a.nombre) : 0;
            const anioB = typeof extraerAnio === 'function' ? extraerAnio(b.nombre) : 0;
            return anioA - anioB || a.nombre.localeCompare(b.nombre);
        });

        if (filtered.length === 0) {
            sectionSelect.innerHTML = '<option value="">No hay secciones en esta mención</option>';
            subjectSelect.innerHTML = '<option value="">Seleccione una sección</option>';
            return;
        }

        sectionSelect.innerHTML = '<option value="">Seleccione una sección</option>' +
            filtered.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');

        sectionSelect.value = filtered[0].id;
        updateSubjects();
    }

    // ========== ACTUALIZAR ASIGNATURAS SEGÚN SECCIÓN ==========
    function updateSubjects() {
        if (!subjectSelect) return;
        const sectionId = sectionSelect.value ? parseInt(sectionSelect.value) : null;
        if (!sectionId) {
            subjectSelect.innerHTML = '<option value="">Seleccione una sección</option>';
            return;
        }

        const sectionList = typeof sections !== 'undefined' ? sections : [];
        const section = sectionList.find(s => s.id === sectionId);
        if (!section) return;

        let availableSubjects = [];

        if (isTeacher) {
            // Materias asignadas al docente en esta sección específica
            availableSubjects = teacherAssignments
                .filter(a => parseInt(a.seccion_id) === sectionId)
                .map(a => a.materia_nombre || a.materia);
        } else {
            // Admin: materias del pensum de la mención y año de la sección
            const anio = typeof extraerAnio === 'function' ? extraerAnio(section.nombre) : 1;
            const mentionId = section.mencion_id || section.mencionId;
            if (typeof getMateriasByMencionAndAnio === 'function') {
                availableSubjects = getMateriasByMencionAndAnio(mentionId, anio);
            }
        }

        if (availableSubjects.length === 0) {
            subjectSelect.innerHTML = '<option value="">No hay asignaturas disponibles</option>';
            return;
        }

        subjectSelect.innerHTML = '<option value="">Seleccione una asignatura</option>' +
            availableSubjects.map(sub => `<option value="${sub}">${sub}</option>`).join('');

        subjectSelect.value = availableSubjects[0];
    }

    // ========== CARGAR ESTUDIANTES Y CALIFICACIONES ==========
    function loadStudents() {
        if (!tbody) return;

        const periodVal = periodSelect.value;
        const periodOption = periodSelect.options[periodSelect.selectedIndex];
        const periodoNombre = periodOption ? (periodOption.dataset.nombre || periodOption.text) : '';
        const periodoId = periodVal ? parseInt(periodVal) : null;
        const sectionId = sectionSelect.value ? parseInt(sectionSelect.value) : null;
        const subject = subjectSelect.value;

        if (!periodVal || !sectionId || !subject) {
            if (typeof showToast === 'function') {
                showToast('Seleccione período, sección y asignatura para cargar las notas', 'error');
            }
            return;
        }

        currentGradesData.periodo = periodoNombre;
        currentGradesData.periodoId = periodoId;
        currentGradesData.section = sectionId;
        currentGradesData.subject = subject;

        const studentList = typeof students !== 'undefined' ? students : [];
        const gradeList = typeof grades !== 'undefined' ? grades : [];

        // Filtrar estudiantes de la sección seleccionada
        const sectionStudents = studentList.filter(s => (s.seccion_id == sectionId || s.seccion == sectionId));

        if (sectionStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="empty-msg" style="text-align:center; padding:2rem; color:#64748b;">No hay estudiantes inscritos en esta sección.</td></tr>`;
            currentGradesData.students = [];
            return;
        }

        // Ordenar alfabéticamente
        sectionStudents.sort((a, b) => (a.apellido || '').localeCompare(b.apellido || ''));

        // Mapear cada estudiante con sus notas para la materia y período seleccionados
        currentGradesData.students = sectionStudents.map(student => {
            const existingGrade = gradeList.find(g => 
                (g.estudiante_id == student.id || g.studentId == student.id) &&
                (g.seccion_id == sectionId || g.sectionId == sectionId) &&
                (g.materia === subject || g.subject === subject) &&
                (g.periodo_id == periodoId || g.periodo === periodoNombre)
            );

            return {
                id: student.id,
                cedula: student.cedula,
                nombre: student.nombre,
                apellido: student.apellido,
                gradeId: existingGrade ? existingGrade.id : null,
                notas: {
                    mp1: existingGrade && existingGrade.mp1 !== null ? parseFloat(existingGrade.mp1) : null,
                    inas1: existingGrade && existingGrade.inas1 !== null ? parseInt(existingGrade.inas1) : 0,
                    mp2: existingGrade && existingGrade.mp2 !== null ? parseFloat(existingGrade.mp2) : null,
                    inas2: existingGrade && existingGrade.inas2 !== null ? parseInt(existingGrade.inas2) : 0,
                    mp3: existingGrade && existingGrade.mp3 !== null ? parseFloat(existingGrade.mp3) : null,
                    inas3: existingGrade && existingGrade.inas3 !== null ? parseInt(existingGrade.inas3) : 0
                }
            };
        });

        renderGradesTable();
    }

    // ========== CÁLCULO DE DEFINITIVA ==========
    function calcularDefinitiva(notas) {
        const valores = [notas.mp1, notas.mp2, notas.mp3].filter(n => n !== null && n !== '' && !isNaN(n));
        if (valores.length === 0) return 0;
        return valores.reduce((a, b) => a + parseFloat(b), 0) / valores.length;
    }

    // ========== RENDERIZAR TABLA DE NOTAS ==========
    function renderGradesTable() {
        if (!tbody) return;

        tbody.innerHTML = currentGradesData.students.map((student, idx) => {
            const def = calcularDefinitiva(student.notas);
            const hasGrades = [student.notas.mp1, student.notas.mp2, student.notas.mp3].some(n => n !== null && n !== '');
            const defText = hasGrades ? def.toFixed(2) : '--';
            const badgeClass = hasGrades ? (def >= 9.5 ? 'badge-aprobado' : 'badge-reprobado') : '';

            return `
                <tr data-student-id="${student.id}">
                    <td style="text-align: center; font-weight: 500; color: #64748b;">${idx + 1}</td>
                    <td>
                        <div style="font-weight: 600; color: #1e293b;">${student.apellido}, ${student.nombre}</div>
                        <small style="color: #64748b; font-size: 0.8rem;">${student.cedula}</small>
                    </td>
                    <td style="text-align: center;">
                        <input type="number" class="grade-input" data-student="${student.id}" data-mp="1" min="0" max="20" step="0.1" value="${student.notas.mp1 !== null ? student.notas.mp1 : ''}" disabled>
                    </td>
                    <td style="text-align: center;">
                        <input type="number" class="inas-input" data-student="${student.id}" data-inas="1" min="0" max="99" value="${student.notas.inas1 || 0}" disabled>
                    </td>
                    <td style="text-align: center;">
                        <input type="number" class="grade-input" data-student="${student.id}" data-mp="2" min="0" max="20" step="0.1" value="${student.notas.mp2 !== null ? student.notas.mp2 : ''}" disabled>
                    </td>
                    <td style="text-align: center;">
                        <input type="number" class="inas-input" data-student="${student.id}" data-inas="2" min="0" max="99" value="${student.notas.inas2 || 0}" disabled>
                    </td>
                    <td style="text-align: center;">
                        <input type="number" class="grade-input" data-student="${student.id}" data-mp="3" min="0" max="20" step="0.1" value="${student.notas.mp3 !== null ? student.notas.mp3 : ''}" disabled>
                    </td>
                    <td style="text-align: center;">
                        <input type="number" class="inas-input" data-student="${student.id}" data-inas="3" min="0" max="99" value="${student.notas.inas3 || 0}" disabled>
                    </td>
                    <td style="text-align: center;">
                        <span class="grade-badge ${badgeClass}">${defText}</span>
                    </td>
                    <td style="text-align: center;">
                        <button type="button" class="btn-icon edit-student-btn" data-student-id="${student.id}" title="Editar calificaciones">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        attachInputListeners();
        attachEditButtons();
    }

    // ========== LISTENERS DE INPUTS ==========
    function attachInputListeners() {
        document.querySelectorAll('.grade-input, .inas-input').forEach(inp => {
            inp.addEventListener('input', handleInput);
        });
    }

    function handleInput(e) {
        const input = e.target;
        const studentId = parseInt(input.dataset.student);
        const student = currentGradesData.students.find(s => s.id === studentId);
        if (!student) return;

        if (input.classList.contains('grade-input')) {
            const mp = input.dataset.mp;
            let val = input.value !== '' ? parseFloat(input.value) : null;
            if (val !== null) {
                if (val > 20) {
                    val = 20;
                    input.value = 20;
                    if (typeof showToast === 'function') showToast('La nota máxima permitida es 20', 'error');
                } else if (val < 0) {
                    val = 0;
                    input.value = 0;
                    if (typeof showToast === 'function') showToast('La nota mínima es 0', 'error');
                }
            }
            student.notas[`mp${mp}`] = val;
        } else if (input.classList.contains('inas-input')) {
            const inas = input.dataset.inas;
            let val = input.value ? parseInt(input.value) : 0;
            if (val < 0) {
                val = 0;
                input.value = 0;
            }
            student.notas[`inas${inas}`] = val;
        }

        // Actualizar definitiva en la fila en vivo
        const row = input.closest('tr');
        if (row) {
            const def = calcularDefinitiva(student.notas);
            const defCell = row.querySelector('.grade-badge');
            if (defCell) {
                const hasGrades = [student.notas.mp1, student.notas.mp2, student.notas.mp3].some(n => n !== null && n !== '');
                defCell.textContent = hasGrades ? def.toFixed(2) : '--';
                defCell.className = `grade-badge ${hasGrades ? (def >= 9.5 ? 'badge-aprobado' : 'badge-reprobado') : ''}`;
            }
        }
    }

    // ========== HABILITAR EDICIÓN POR FILA ==========
    function attachEditButtons() {
        document.querySelectorAll('.edit-student-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const studentId = parseInt(btn.dataset.studentId);
                const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
                if (row) {
                    const inputs = row.querySelectorAll('input');
                    const wasDisabled = inputs[0]?.disabled ?? true;
                    inputs.forEach(i => i.disabled = !wasDisabled);
                    btn.classList.toggle('active', wasDisabled);
                    if (wasDisabled) {
                        inputs[0]?.focus();
                        if (typeof showToast === 'function') {
                            showToast('Edición habilitada para este estudiante. Modifique y presione "Guardar".', 'info');
                        }
                    }
                }
            });
        });
    }

    // ========== GUARDAR CALIFICACIONES ==========
    async function saveGrades() {
        if (!currentGradesData.students.length) {
            if (typeof showToast === 'function') showToast('No hay datos para guardar', 'error');
            return;
        }

        if (!saveBtn) return;
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Guardando...";
        saveBtn.disabled = true;

        try {
            const promises = currentGradesData.students.map(student => {
                const gradeData = {
                    studentId: student.id,
                    sectionId: currentGradesData.section,
                    subject: currentGradesData.subject,
                    periodo: currentGradesData.periodo,
                    mp1: student.notas.mp1,
                    inas1: student.notas.inas1,
                    mp2: student.notas.mp2,
                    inas2: student.notas.inas2,
                    mp3: student.notas.mp3,
                    inas3: student.notas.inas3,
                    definitiva: calcularDefinitiva(student.notas)
                };

                const existing = grades.find(g => 
                    (g.estudiante_id == student.id || g.studentId == student.id) &&
                    (g.seccion_id == currentGradesData.section || g.sectionId == currentGradesData.section) &&
                    (g.materia === currentGradesData.subject || g.subject === currentGradesData.subject) &&
                    (g.periodo_id == currentGradesData.periodoId || g.periodo === currentGradesData.periodo)
                );

                if (existing) {
                    return typeof updateGrade === 'function' ? updateGrade(existing.id, gradeData) : Promise.resolve();
                } else {
                    return typeof addGrade === 'function' ? addGrade(gradeData) : Promise.resolve();
                }
            });

            await Promise.all(promises);

            // Deshabilitar todos los inputs
            document.querySelectorAll('.grade-input, .inas-input').forEach(i => i.disabled = true);
            document.querySelectorAll('.edit-student-btn').forEach(b => b.classList.remove('active'));

            if (typeof showToast === 'function') {
                showToast('Calificaciones guardadas exitosamente', 'success');
            }
        } catch (error) {
            console.error('Error guardando calificaciones:', error);
            if (typeof showToast === 'function') {
                showToast('Error al guardar calificaciones: ' + error.message, 'error');
            }
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }

    // ========== VINCULAR EVENTOS PRINCIPALES ==========
    mentionSelect.addEventListener('change', (e) => updateSections(e.target.value));
    sectionSelect.addEventListener('change', updateSubjects);
    if (loadBtn) loadBtn.addEventListener('click', loadStudents);
    if (saveBtn) saveBtn.addEventListener('click', saveGrades);

    // Inicialización automática
    loadPeriods();
    loadMentions();

    // Exportar para que otros módulos puedan refrescar selectores si se agregan períodos/secciones
    window.loadPeriodsForGrades = loadPeriods;
    window.loadMentionsForGrades = loadMentions;
    window.updateSectionsForGrades = updateSections;
}

// Exponer globalmente
window.initGradesManager = initGradesManager;

// Auto-arranque en DOMContentLoaded (útil para el panel de Admin)
document.addEventListener('DOMContentLoaded', () => {
    // Si ya existe el contenedor de notas y no es panel de profesor (o el profesor ya está resuelto), inicializar
    if (document.getElementById('grades-section')) {
        // En profesor/index.html se llama tras resolver bootstrap(); si es admin, arranca directo
        if (!window.location.pathname.includes('/profesor')) {
            initGradesManager();
        }
    }
});
