// grados-maestros-prof.js - Versión para profesores (con tabla mejorada, edición por fila y período)
// Dependencias: data.js, materias.js

window.initGradesManager = async function() {
    // Verificar que hay un profesor definido
    if (!window.currentTeacher) {
        console.warn("initGradesManager: No hay profesor definido aún.");
        const tbody = document.getElementById('grades-tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="11" class="empty-msg">No hay profesor seleccionado.</td></tr>`;
        }
        return;
    }

    const teacher = window.currentTeacher;
    const periodSelect = document.getElementById('grade-periodo');
    const mentionSelect = document.getElementById('mention-select');
    const sectionSelect = document.getElementById('section-select');
    const subjectSelect = document.getElementById('subject-select');
    const loadBtn = document.getElementById('load-students-btn');
    const saveBtn = document.getElementById('save-grades-btn');
    const tbody = document.getElementById('grades-tbody');

    // Datos del profesor
    let asignaciones = [];
    try {
        asignaciones = typeof teacher.asignaciones === 'string' ? JSON.parse(teacher.asignaciones) : (teacher.asignaciones || []);
    } catch(e) {}
    
    const materiasProfesor = [...new Set(asignaciones.map(a => a.materia_nombre || a.materia))];
    const seccionesProfesor = [...new Set(asignaciones.map(a => parseInt(a.seccion_id)))];

    console.log('=== GRADOS MAESTROS ===');
    console.log('Profesor:', teacher);
    console.log('Materias del profesor:', materiasProfesor);
    console.log('Secciones del profesor (IDs):', seccionesProfesor);

    // Filtrar secciones que el profesor puede ver
    const seccionesPermitidas = sections.filter(s => seccionesProfesor.includes(s.id));
    console.log('Secciones permitidas:', seccionesPermitidas);

    // Obtener IDs de menciones únicas de esas secciones
    const mencionesPermitidasIds = [...new Set(seccionesPermitidas.map(s => s.mencion_id || s.mencionId))];
    const mencionesPermitidas = mentions.filter(m => mencionesPermitidasIds.includes(m.id));
    console.log('Menciones permitidas:', mencionesPermitidas);

    // Estado actual
    let currentGradesData = {
        mention: '',
        section: '',
        subject: '',
        periodo: '',
        students: []
    };

    // ========== FUNCIONES ==========

    function loadPeriods() {
        if (!periodSelect) return;
        const currentVal = periodSelect.value;
        const sortedPeriods = [...periods].sort((a, b) => {
            const dateA = new Date(a.fecha_inicio || a.fechaInicio);
            const dateB = new Date(b.fecha_inicio || b.fechaInicio);
            return dateB - dateA;
        });
        if (sortedPeriods.length === 0) {
            periodSelect.innerHTML = '<option value="">Periodos no inscritos</option>';
        } else {
            periodSelect.innerHTML = '<option value="">Seleccione un período</option>';
            sortedPeriods.forEach(p => {
                periodSelect.innerHTML += `<option value="${escHtml(p.nombre)}">${escHtml(p.nombre)}</option>`;
            });
            if (currentVal && sortedPeriods.some(p => p.nombre === currentVal)) {
                periodSelect.value = currentVal;
            } else {
                periodSelect.value = sortedPeriods[0].nombre;
            }
        }
    }

    function loadMentions() {
        if (!mentionSelect) return;
        const currentVal = mentionSelect.value;
        mentionSelect.innerHTML = '<option value="">Seleccione una mención</option>';
        mencionesPermitidas.forEach(m => {
            mentionSelect.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
        });
        if (mencionesPermitidas.length) {
            if (currentVal && mencionesPermitidas.some(m => String(m.id) === String(currentVal))) {
                mentionSelect.value = currentVal;
                updateSections(currentVal);
            } else {
                mentionSelect.value = mencionesPermitidas[0].id;
                updateSections(mencionesPermitidas[0].id);
            }
        }
    }

    function updateSections(mentionId) {
        if (!sectionSelect) return;
        const currentVal = sectionSelect.value;
        const filtered = seccionesPermitidas.filter(s => (s.mencion_id == mentionId || s.mencionId == mentionId));
        sectionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
        filtered.forEach(s => {
            sectionSelect.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
        });
        if (filtered.length) {
            if (currentVal && filtered.some(s => String(s.id) === String(currentVal))) {
                sectionSelect.value = currentVal;
                updateSubjects();
            } else {
                sectionSelect.value = filtered[0].id;
                updateSubjects();
            }
        } else {
            subjectSelect.innerHTML = '<option value="">No hay secciones</option>';
        }
    }

    // Normalización de strings para comparación
    function normalizeString(str) {
        return str.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // eliminar acentos
            .replace(/\s+/g, ''); // eliminar espacios
    }

    // Actualiza las asignaturas según la sección seleccionada
    function updateSubjects() {
        if (!subjectSelect) return;
        const currentVal = subjectSelect.value;
        const sectionId = sectionSelect.value ? parseInt(sectionSelect.value) : null;
        if (!sectionId) {
            subjectSelect.innerHTML = '<option value="">Seleccione una sección</option>';
            return;
        }

        const selectedSection = sections.find(s => s.id === sectionId);
        if (!selectedSection) {
            console.error('No se encontró la sección con ID', sectionId);
            subjectSelect.innerHTML = '<option value="">Error: sección no encontrada</option>';
            return;
        }

        const anio = extraerAnio(selectedSection.nombre);
        console.log('Sección seleccionada:', selectedSection.nombre, 'año:', anio);

        const todasMaterias = getMateriasByMencionAndAnio(selectedSection.mencion_id || selectedSection.mencionId, anio);
        console.log('Todas las materias para mención', selectedSection.mencionId, 'año', anio, ':', todasMaterias);

        // Filtrar las materias que el profesor tiene asignadas PARA ESTA SECCIÓN
        const materiasAsignadasParaSeccion = asignaciones
            .filter(a => parseInt(a.seccion_id) === sectionId)
            .map(a => a.materia_nombre || a.materia);

        const materiasAsignadas = todasMaterias.filter(materiaCompleta => {
            return materiasAsignadasParaSeccion.some(materiaProf => {
                return normalizeString(materiaProf) === normalizeString(materiaCompleta);
            });
        });
        console.log('Materias asignadas (filtradas):', materiasAsignadas);

        subjectSelect.innerHTML = '<option value="">Seleccione una asignatura</option>';
        materiasAsignadas.forEach(m => {
            subjectSelect.innerHTML += `<option value="${m}">${m}</option>`;
        });

        if (currentVal && materiasAsignadas.includes(currentVal)) {
            subjectSelect.value = currentVal;
        } else if (materiasAsignadas.length === 0) {
            subjectSelect.innerHTML = '<option value="">No tiene materias asignadas para esta sección</option>';
        } else if (materiasAsignadas.length === 1) {
            subjectSelect.value = materiasAsignadas[0];
        }
    }

    // Cargar estudiantes de la sección seleccionada
    function loadStudents() {
        const sectionId = parseInt(sectionSelect.value);
        const subject = subjectSelect.value;
        const periodo = periodSelect.value;

        if (!sectionId || !subject || !periodo) {
            showToast('Debe seleccionar período, sección y asignatura', 'error');
            return;
        }

        const studentsList = students.filter(s => parseInt(s.seccion_id || s.seccion) === sectionId);
        if (studentsList.length === 0) {
            showToast('No hay estudiantes en esta sección', 'error');
            tbody.innerHTML = `<tr><td colspan="10" class="empty-msg">No hay estudiantes en esta sección</td></tr>`;
            return;
        }

        const savedGrades = window.dataHelpers ? window.dataHelpers.getGradesBySectionAndSubject(sectionId, subject, periodo) : [];

        currentGradesData = {
            mention: mentionSelect.value,
            section: sectionId,
            subject: subject,
            periodo: periodo,
            students: studentsList.map(student => {
                const saved = savedGrades.find(g => (g.estudiante_id == student.id || g.studentId == student.id));
                return {
                    id: student.id,
                    cedula: student.cedula || '',
                    nombre: `${student.nombre} ${student.apellido}`,
                    notas: saved ? { ...saved } : {
                        mp1: null,
                        inas1: 0,
                        mp2: null,
                        inas2: 0,
                        mp3: null,
                        inas3: 0
                    }
                };
            })
        };

        renderTable();
    }

    // Renderizar tabla con todos los campos deshabilitados y botón editar
    function renderTable() {
        if (!tbody) return;

        const table = document.querySelector('.grades-table');
        if (!table) return;

        // Eliminar la cabecera existente (la estática del HTML)
        const oldThead = table.querySelector('thead');
        if (oldThead) oldThead.remove();

        // Crear nueva cabecera con las columnas correctas
        const newThead = document.createElement('thead');
        newThead.innerHTML = `
            <tr>
                <th>Estudiante</th>
                <th>
                    <div class="th-momento">
                        <span>1er Momento</span>
                        <button type="button" class="btn-open-eval-grading" data-mp="1" title="Calcular el 1er momento a partir de las evaluaciones planificadas">
                            <i class='bx bx-calculator'></i>
                        </button>
                    </div>
                </th>
                <th>
                    <div class="th-momento">
                        <span>2do Momento</span>
                        <button type="button" class="btn-open-eval-grading" data-mp="2" title="Calcular el 2do momento a partir de las evaluaciones planificadas">
                            <i class='bx bx-calculator'></i>
                        </button>
                    </div>
                </th>
                <th>
                    <div class="th-momento">
                        <span>3er Momento</span>
                        <button type="button" class="btn-open-eval-grading" data-mp="3" title="Calcular el 3er momento a partir de las evaluaciones planificadas">
                            <i class='bx bx-calculator'></i>
                        </button>
                    </div>
                </th>
                <th>Definitiva</th>
                <th>Acciones</th>
            </tr>
        `;
        table.insertBefore(newThead, tbody);

        // Listener para botones de calculadora de evaluaciones
        newThead.querySelectorAll('.btn-open-eval-grading').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const mp = parseInt(btn.dataset.mp) || 1;
                const sectionId = sectionSelect ? parseInt(sectionSelect.value) : null;
                const subject = subjectSelect ? subjectSelect.value : null;
                const periodoVal = periodSelect ? periodSelect.value : null;
                if (!sectionId || !subject) {
                    showToast('Seleccione sección y asignatura primero', 'warning');
                    return;
                }
                const perObj = (window.periods || []).find(p => p.nombre === periodoVal || p.id == periodoVal);
                const periodoId = perObj ? perObj.id : 1;
                const teacherId = window.currentTeacher ? window.currentTeacher.id : null;

                if (typeof window.openEvalGradingModal === 'function') {
                    window.openEvalGradingModal(teacherId, sectionId, subject, periodoId, mp);
                } else {
                    showToast('El módulo de evaluaciones no está listo todavía', 'info');
                }
            });
        });

        if (currentGradesData.students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">No hay estudiantes</td></tr>`;
            actualizarResumen();
            return;
        }

        let rows = '';
        currentGradesData.students.forEach(student => {
            const definitiva = calcularDefinitiva(student.notas);
            const hasGrades = [student.notas.mp1, student.notas.mp2, student.notas.mp3].some(n => n !== null && n !== '');
            const defText = !hasGrades ? '—' : definitiva.toFixed(2);
            const defClase = !hasGrades ? 'vacia' : (definitiva >= 10 ? 'ok' : 'mal');

            // Una celda por momento: la nota arriba y las inasistencias debajo
            const celdaMomento = (m) => {
                const nota = student.notas['mp' + m];
                const inas = student.notas['inas' + m];
                const valor = (nota !== null && nota !== undefined && nota !== '') ? nota : '';
                const clase = valor === '' ? 'vacia' : (parseFloat(valor) >= 10 ? 'ok' : 'mal');

                return `
                    <td class="momento-celda">
                        <input type="number" class="grade-input ${clase}" data-mp="${m}" data-student="${student.id}"
                               value="${valor}" min="0" max="20" step="0.1" placeholder="—" disabled>
                        <input type="number" class="inas-input" data-inas="${m}" data-student="${student.id}"
                               value="${inas || 0}" min="0" max="30" title="Inasistencias" disabled>
                    </td>`;
            };

            rows += `
                <tr data-student-id="${student.id}">
                    <td>
                        <div class="est-celda">
                            <b>${student.nombre || ''}</b>
                            <small>${student.cedula || ''}</small>
                        </div>
                    </td>
                    ${celdaMomento(1)}
                    ${celdaMomento(2)}
                    ${celdaMomento(3)}
                    <td class="def-celda"><span class="def-valor ${defClase}">${defText}</span></td>
                    <td class="acciones-celda">
                        <button class="btn-icon edit-student-btn" data-student-id="${student.id}" title="Editar calificaciones">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = rows;
        attachInputListeners();
        attachEditButtons();
        actualizarResumen();
    }

    // Calcular definitiva
    function calcularDefinitiva(notas) {
        const valores = [notas.mp1, notas.mp2, notas.mp3].filter(n => n !== null && n !== '');
        if (valores.length === 0) return 0;
        return valores.reduce((a, b) => a + parseFloat(b), 0) / valores.length;
    }

    // Escuchar cambios en inputs (para cálculo en tiempo real)
    function attachInputListeners() {
        document.querySelectorAll('.grade-input, .inas-input').forEach(input => {
            input.addEventListener('input', handleInput);
        });
    }

    function handleInput(e) {
        const input = e.target;
        const studentId = parseInt(input.dataset.student);
        const student = currentGradesData.students.find(s => s.id === studentId);
        if (!student) return;

        if (input.classList.contains('grade-input')) {
            const mp = input.dataset.mp;
            let value = input.value !== '' ? parseFloat(input.value) : null;
            if (value !== null) {
                if (value > 20) {
                    value = 20;
                    input.value = 20;
                    showToast('La nota máxima permitida es 20', 'error');
                } else if (value < 0) {
                    value = 0;
                    input.value = 0;
                    showToast('La nota mínima es 0', 'error');
                }
            }
            student.notas[`mp${mp}`] = value;
        } else {
            const inas = input.dataset.inas;
            let value = input.value ? parseInt(input.value) : 0;
            if (value < 0) {
                value = 0;
                input.value = 0;
            }
            student.notas[`inas${inas}`] = value;
        }

        // Color de la nota según apruebe o no
        if (input.classList.contains('grade-input')) {
            input.classList.remove('ok', 'mal', 'vacia');
            input.classList.add(input.value === '' ? 'vacia' : (parseFloat(input.value) >= 10 ? 'ok' : 'mal'));
        }

        const row = input.closest('tr');
        const definitiva = calcularDefinitiva(student.notas);
        const hasGrades = [student.notas.mp1, student.notas.mp2, student.notas.mp3].some(n => n !== null && n !== '');
        const defCell = row ? row.querySelector('.def-valor') : null;

        if (defCell) {
            defCell.textContent = !hasGrades ? '—' : definitiva.toFixed(2);
            defCell.classList.remove('ok', 'mal', 'vacia');
            defCell.classList.add(!hasGrades ? 'vacia' : (definitiva >= 10 ? 'ok' : 'mal'));
        }

        actualizarResumen();
    }

    /**
     * Barra de resumen del vaciado: total, promedio, aprobados, reprobados
     * y estudiantes sin ninguna nota.
     */
    function actualizarResumen() {
        const cont = document.getElementById('grades-summary');
        if (!cont) return;

        const lista = currentGradesData.students || [];
        const definitivas = [];

        lista.forEach(s => {
            const tiene = [s.notas.mp1, s.notas.mp2, s.notas.mp3].some(n => n !== null && n !== '');
            if (tiene) definitivas.push(calcularDefinitiva(s.notas));
        });

        const promedio = definitivas.length
            ? definitivas.reduce((a, b) => a + b, 0) / definitivas.length
            : null;

        const total = cont.querySelector('#gs-total');
        const prom = cont.querySelector('#gs-promedio');
        const aprob = cont.querySelector('#gs-aprobados');
        const reprob = cont.querySelector('#gs-reprobados');
        const sin = cont.querySelector('#gs-sin');

        if (total) total.textContent = lista.length;
        if (prom) prom.textContent = promedio === null ? '—' : promedio.toFixed(2);
        if (aprob) aprob.textContent = definitivas.filter(d => d >= 10).length;
        if (reprob) reprob.textContent = definitivas.filter(d => d < 10).length;
        if (sin) sin.textContent = lista.length - definitivas.length;
    }

    // Habilitar inputs de una fila específica
    function enableRowInputs(studentId) {
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
        if (!row) return;

        const periodObj = periods.find(p => p.nombre === currentGradesData.periodo);
        if (!periodObj) {
            showToast('No se encontró el período.', 'error');
            return;
        }

        if (periodObj.estado === 'cerrado') {
            showToast('Este período ha sido cerrado. No puede modificar notas.', 'error');
            return;
        }

        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => input.disabled = false);
        
        showToast('Edición habilitada para este estudiante.', 'info');
    }

    // Deshabilitar todos los inputs de la tabla
    function disableAllInputs() {
        const allInputs = document.querySelectorAll('.grade-input, .inas-input');
        allInputs.forEach(input => input.disabled = true);
    }

    // Asignar evento a los botones "Editar"
    function attachEditButtons() {
        document.querySelectorAll('.edit-student-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = parseInt(btn.dataset.studentId);
                enableRowInputs(studentId);
            });
        });
    }

    // Validar notas antes de guardar
    function validateGrades() {
        let isValid = true;
        for (const student of currentGradesData.students) {
            const notas = [student.notas.mp1, student.notas.mp2, student.notas.mp3];
            for (let nota of notas) {
                if (nota !== null && nota > 20) {
                    isValid = false;
                    break;
                }
            }
            if (!isValid) break;
        }
        if (!isValid) {
            showToast('Las notas no pueden superar 20. Revise los campos.', 'error');
        }
        return isValid;
    }

    // Guardar calificaciones
    async function saveGrades() {
        if (!currentGradesData.students.length) {
            showToast('No hay datos para guardar', 'error');
            return;
        }

        if (!validateGrades()) return;

        const originalBtnText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Guardando...';
        saveBtn.disabled = true;

        const periodObj = periods.find(p => p.nombre === currentGradesData.periodo);
        const periodoId = periodObj ? periodObj.id : null;

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
                g.periodo_id == periodoId
            );
            if (existing) {
                return window.dataHelpers.updateGrade(existing.id, gradeData);
            } else {
                return window.dataHelpers.addGrade(gradeData);
            }
        });

        const savedPeriod = currentGradesData.periodo || (periodSelect ? periodSelect.value : '');
        const savedMention = currentGradesData.mention || (mentionSelect ? mentionSelect.value : '');
        const savedSection = currentGradesData.section || (sectionSelect ? sectionSelect.value : '');
        const savedSubject = currentGradesData.subject || (subjectSelect ? subjectSelect.value : '');

        const resultados = await Promise.all(promises);

        // El backend rechaza los cambios si el período está cerrado
        const conError = resultados.find(r => r && r.success === false);
        if (conError) {
            saveBtn.innerHTML = originalBtnText;
            saveBtn.disabled = false;
            showToast(conError.error || 'No se pudieron guardar las calificaciones.', 'error');
            return;
        }

        if (window.dataHelpers && window.dataHelpers.initData) {
            await window.dataHelpers.initData();
        }

        // Asegurar que los selectores conserven exactamente lo que el profesor tenía seleccionado
        if (savedPeriod && periodSelect) periodSelect.value = savedPeriod;
        if (savedMention && mentionSelect) {
            mentionSelect.value = savedMention;
            updateSections(savedMention);
        }
        if (savedSection && sectionSelect) {
            sectionSelect.value = savedSection;
            updateSubjects();
        }
        if (savedSubject && subjectSelect) {
            subjectSelect.value = savedSubject;
        }

        disableAllInputs();
        saveBtn.innerHTML = originalBtnText;
        saveBtn.disabled = false;
        showToast('Calificaciones guardadas exitosamente', 'success');
        
        loadStudents(); // Recargar la vista con los datos más recientes
    }


    // ========== EVENTOS ==========
    periodSelect.addEventListener('change', () => {
        // Si cambia el período, recargar estudiantes si ya hay sección y asignatura seleccionadas
        if (sectionSelect.value && subjectSelect.value) {
            loadStudents();
        }
    });
    mentionSelect.addEventListener('change', (e) => {
        updateSections(e.target.value);
    });
    sectionSelect.addEventListener('change', () => {
        updateSubjects();
    });
    loadBtn.addEventListener('click', loadStudents);
    saveBtn.addEventListener('click', saveGrades);

    // Inicializar
    loadPeriods();
    loadMentions();
    window.loadStudents = loadStudents;
};