/**
 * evaluaciones-manager.js
 * Gestión de la configuración de evaluaciones por momento pedagógico (MP1, MP2, MP3).
 * Cada momento puede tener entre 1 y 7 evaluaciones cuyo % debe sumar exactamente 100.
 *
 * Compatible con: panel/profesor y panel/admin
 */

(function () {
    'use strict';

    // ───────────────────────────────────────────────
    //  Helpers para acceso seguro a datos globales
    // ───────────────────────────────────────────────
    function getGlobalUsers() {
        if (typeof window !== 'undefined' && window.users && Array.isArray(window.users) && window.users.length) return window.users;
        if (typeof users !== 'undefined' && Array.isArray(users)) return users;
        return [];
    }

    function getGlobalSections() {
        if (typeof window !== 'undefined' && window.sections && Array.isArray(window.sections) && window.sections.length) return window.sections;
        if (typeof sections !== 'undefined' && Array.isArray(sections)) return sections;
        return [];
    }

    function getGlobalPeriods() {
        if (typeof window !== 'undefined' && window.periods && Array.isArray(window.periods) && window.periods.length) return window.periods;
        if (typeof periods !== 'undefined' && Array.isArray(periods)) return periods;
        return [];
    }

    // ───────────────────────────────────────────────
    //  Estado local del módulo
    // ───────────────────────────────────────────────
    let evalConfig = {
        teacherId: null,
        seccionId: null,
        materia: null,
        periodoId: null,
        // Momentos: clave = 1|2|3, valor = { numEval, porcentajes[], nombres[] }
        momentos: {
            1: null,
            2: null,
            3: null
        }
    };

    // Configuraciones guardadas en BD
    let savedConfigs = [];

    // Momento activo en el modal de edición
    let activeMomento = 1;

    // ───────────────────────────────────────────────
    //  Helpers de API
    // ───────────────────────────────────────────────
    function getApiUrl() {
        if (window.API_PATH) return window.API_PATH;
        const path = window.location.pathname.toLowerCase();
        const inSub = path.includes('/profesor') || path.includes('/admin');
        return inSub ? '../api/main.php' : 'api/main.php';
    }

    async function apiCall(action, data) {
        const url = `${getApiUrl()}?action=${action}`;
        const opts = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const res = await fetch(url, opts);
        return res.json();
    }

    async function fetchEvaluaciones(teacherId) {
        const query = teacherId ? `&teacher_id=${teacherId}` : '';
        const url = `${getApiUrl()}?action=get_evaluaciones${query}`;
        const res = await fetch(url);
        return res.json();
    }

    // ───────────────────────────────────────────────
    //  Obtener el teacher_id efectivo
    //  (profesor logueado o, en admin, el seleccionado)
    // ───────────────────────────────────────────────
    function getEffectiveTeacherId() {
        if (window.currentTeacher && window.currentTeacher.id) {
            return window.currentTeacher.id;
        }
        const sel = document.getElementById('eval-teacher-select');
        return sel ? parseInt(sel.value) || null : null;
    }

    // ───────────────────────────────────────────────
    //  Render de la tabla resumen de configuraciones
    // ───────────────────────────────────────────────
    function renderEvaluacionesTable() {
        const tbody = document.getElementById('eval-config-tbody');
        if (!tbody) return;

        const teacherId = getEffectiveTeacherId();
        const isAdmin = !!document.getElementById('eval-teacher-select');
        const colspan = isAdmin ? 6 : 5;

        if (!teacherId && !isAdmin) {
            tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-msg"><i class='bx bx-info-circle'></i> Cargando datos del profesor...</td></tr>`;
            return;
        }

        fetchEvaluaciones(teacherId).then(configs => {
            savedConfigs = Array.isArray(configs) ? configs : [];
            if (savedConfigs.length === 0) {
                const msg = teacherId
                    ? 'No hay evaluaciones configuradas para este profesor aún. Usa los selectores superiores para configurar una.'
                    : 'No hay evaluaciones configuradas aún en el sistema. Selecciona un profesor arriba para crear una.';
                tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-msg"><i class='bx bx-info-circle'></i> ${msg}</td></tr>`;
                return;
            }

            // Agrupar por teacher_id + seccion + materia + periodo
            const groups = {};
            savedConfigs.forEach(c => {
                const tId = c.teacher_id || teacherId;
                const key = `${tId}||${c.seccion_id}||${c.materia}||${c.periodo_id}`;
                if (!groups[key]) {
                    groups[key] = {
                        teacherId: tId,
                        teacherNombre: c.teacher_nombre || '',
                        seccionNombre: c.seccion_nombre || `Sección ${c.seccion_id}`,
                        materia: c.materia,
                        periodoNombre: c.periodo_nombre || `Período ${c.periodo_id}`,
                        seccionId: c.seccion_id,
                        periodoId: c.periodo_id,
                        momentos: {}
                    };
                }
                let porcs = [];
                try { porcs = JSON.parse(c.porcentajes); } catch (e) {}
                let noms = [];
                try { noms = JSON.parse(c.nombres); } catch (e) {}
                groups[key].momentos[c.momento] = {
                    numEval: c.num_evaluaciones,
                    porcentajes: porcs,
                    nombres: noms
                };
            });

            const rows = Object.entries(groups).map(([key, g]) => {
                const mpBadges = [1, 2, 3].map(m => {
                    if (!g.momentos[m]) {
                        return `<span class="eval-badge eval-badge--pending">MP${m}: Sin configurar</span>`;
                    }
                    const cfg = g.momentos[m];
                    const porcStr = cfg.porcentajes.join('%, ') + '%';
                    return `<span class="eval-badge eval-badge--ok" title="${porcStr}">MP${m}: ${cfg.numEval} eval.</span>`;
                }).join(' ');

                const profCol = isAdmin ? `<td><span class="eval-badge" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;"><i class='bx bx-user'></i> ${escHtml(g.teacherNombre || 'Profesor')}</span></td>` : '';

                return `<tr>
                    ${profCol}
                    <td><strong>${escHtml(g.seccionNombre)}</strong></td>
                    <td>${escHtml(g.materia)}</td>
                    <td>${escHtml(g.periodoNombre)}</td>
                    <td>${mpBadges}</td>
                    <td style="white-space:nowrap;">
                        <button class="btn-icon open-eval-grading-btn"
                            data-teacher="${g.teacherId}"
                            data-seccion="${g.seccionId}"
                            data-materia="${encodeURIComponent(g.materia)}"
                            data-periodo="${g.periodoId}"
                            title="Llenar Notas de Evaluaciones (0 a 20 pts)">
                            <i class='bx bx-calculator'></i>
                        </button>
                        <button class="btn-icon edit-eval-btn"
                            data-teacher="${g.teacherId}"
                            data-seccion="${g.seccionId}"
                            data-materia="${encodeURIComponent(g.materia)}"
                            data-periodo="${g.periodoId}"
                            title="Editar configuración">
                            <i class='bx bx-edit'></i>
                        </button>
                    </td>
                </tr>`;
            }).join('');

            tbody.innerHTML = rows;

            // Listeners para calificar evaluaciones
            tbody.querySelectorAll('.open-eval-grading-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const rowTeacherId = parseInt(btn.dataset.teacher) || teacherId;
                    const seccionId    = parseInt(btn.dataset.seccion);
                    const materia      = decodeURIComponent(btn.dataset.materia);
                    const periodoId    = parseInt(btn.dataset.periodo);
                    openEvalGradingModal(rowTeacherId, seccionId, materia, periodoId, 1);
                });
            });

            // Listeners para editar
            tbody.querySelectorAll('.edit-eval-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const rowTeacherId = parseInt(btn.dataset.teacher) || teacherId;
                    const seccionId    = parseInt(btn.dataset.seccion);
                    const materia      = decodeURIComponent(btn.dataset.materia);
                    const periodoId    = parseInt(btn.dataset.periodo);
                    openEvalModal(rowTeacherId, seccionId, materia, periodoId);
                });
            });
        }).catch(err => {
            console.error('Error cargando evaluaciones:', err);
            tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-msg" style="color:#c62828">Error al cargar las evaluaciones.</td></tr>`;
        });
    }

    // ───────────────────────────────────────────────
    //  Modal de configuración
    // ───────────────────────────────────────────────
    function openEvalModal(teacherId, seccionId, materia, periodoId) {
        evalConfig.teacherId = teacherId;
        evalConfig.seccionId = seccionId;
        evalConfig.materia   = materia;
        evalConfig.periodoId = periodoId;

        // Pre-cargar datos existentes de savedConfigs
        evalConfig.momentos = { 1: null, 2: null, 3: null };
        savedConfigs.forEach(c => {
            if (c.teacher_id == teacherId && c.seccion_id == seccionId && c.materia === materia && c.periodo_id == periodoId) {
                let porcs = [];
                try { porcs = JSON.parse(c.porcentajes); } catch (e) {}
                let noms = [];
                try { noms = JSON.parse(c.nombres); } catch (e) {}
                evalConfig.momentos[c.momento] = {
                    numEval: c.num_evaluaciones,
                    porcentajes: porcs,
                    nombres: noms
                };
            }
        });

        // Título del modal
        const sec = getGlobalSections().find(s => s.id == seccionId);
        const per = getGlobalPeriods().find(p => p.id == periodoId);
        const secNombre = sec ? sec.nombre : `Sección ${seccionId}`;
        const perNombre = per ? per.nombre : `Período ${periodoId}`;

        const modalTitle = document.getElementById('eval-modal-title-detail');
        if (modalTitle) {
            modalTitle.innerHTML = `<i class='bx bx-bar-chart-alt-2'></i> ${escHtml(materia)} &mdash; ${escHtml(secNombre)} &mdash; ${escHtml(perNombre)}`;
        }

        // Mostrar modal
        const modal = document.getElementById('eval-config-modal');
        if (modal) modal.classList.add('active');

        // Activar primer momento
        switchMomento(1);
        updateTabBadges();
    }

    function openNewEvalModal() {
        const teacherId = getEffectiveTeacherId();
        if (!teacherId) {
            if (window.showToast) window.showToast('Seleccione un profesor primero', 'warning');
            return;
        }

        const seccionSel = document.getElementById('eval-new-seccion');
        const materiaSel = document.getElementById('eval-new-materia');
        const periodoSel = document.getElementById('eval-new-periodo');

        if (!seccionSel || !materiaSel || !periodoSel) return;

        const seccionId = parseInt(seccionSel.value);
        const materia   = materiaSel.value;
        const periodoId = parseInt(periodoSel.value);

        if (!seccionId || !materia || !periodoId) {
            if (window.showToast) window.showToast('Complete sección, materia y período antes de configurar', 'warning');
            return;
        }

        openEvalModal(teacherId, seccionId, materia, periodoId);
    }

    function closeEvalModal() {
        const modal = document.getElementById('eval-config-modal');
        if (modal) modal.classList.remove('active');
    }

    // ───────────────────────────────────────────────
    //  Cambiar de momento dentro del modal
    // ───────────────────────────────────────────────
    function switchMomento(momento) {
        if (activeMomento) saveCurrentMomentoState();

        activeMomento = momento;

        document.querySelectorAll('.eval-momento-tab').forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.momento) === momento);
        });

        renderMomentoEditor(momento);
        updateTabBadges();
    }

    function saveCurrentMomentoState() {
        const numInput = document.getElementById('eval-num-evaluaciones');
        if (!numInput) return;

        const num = parseInt(numInput.value) || 1;
        const porcentajes = [];
        const nombres = [];

        for (let i = 0; i < num; i++) {
            const pInput = document.getElementById(`eval-porc-${i}`);
            const nInput = document.getElementById(`eval-nombre-${i}`);
            porcentajes.push(pInput ? parseFloat(pInput.value) || 0 : 0);
            nombres.push(nInput ? nInput.value.trim() : `Eval ${i + 1}`);
        }

        evalConfig.momentos[activeMomento] = { numEval: num, porcentajes, nombres };
    }

    // ───────────────────────────────────────────────
    //  Renderizar el editor de un momento
    // ───────────────────────────────────────────────
    function renderMomentoEditor(momento) {
        const container = document.getElementById('eval-momento-editor');
        if (!container) return;

        const existing = evalConfig.momentos[momento];
        const numEval  = existing ? existing.numEval : 3;
        const porcs    = existing ? existing.porcentajes : [];
        const noms     = existing ? existing.nombres : [];

        container.innerHTML = `
            <div class="eval-num-row">
                <label class="eval-label">
                    <i class='bx bx-list-ol'></i>
                    Número de evaluaciones para MP${momento}
                    <span class="eval-limit-hint">(máx. 7)</span>
                </label>
                <div class="eval-num-controls">
                    <button type="button" class="eval-num-btn" id="eval-num-dec">
                        <i class='bx bx-minus'></i>
                    </button>
                    <input type="number" id="eval-num-evaluaciones"
                           min="1" max="7" value="${numEval}"
                           class="eval-num-input" readonly>
                    <button type="button" class="eval-num-btn" id="eval-num-inc">
                        <i class='bx bx-plus'></i>
                    </button>
                </div>
            </div>

            <div id="eval-rows-container"></div>

            <div class="eval-total-bar">
                <div class="eval-total-label">Total asignado:</div>
                <div class="eval-total-display-wrap">
                    <div class="eval-total-value" id="eval-total-display">0%</div>
                </div>
                <div class="eval-total-bar-track">
                    <div class="eval-total-bar-fill" id="eval-total-bar-fill"></div>
                </div>
                <div class="eval-distribute-hint" id="eval-distribute-hint"></div>
            </div>

            <button type="button" class="eval-distribute-btn" id="eval-distribute-btn">
                <i class='bx bx-calculator'></i> Distribuir equitativamente
            </button>
        `;

        renderEvalRows(numEval, porcs, noms);
        attachNumListeners();
    }

    function renderEvalRows(num, porcs, noms) {
        const container = document.getElementById('eval-rows-container');
        if (!container) return;

        let html = `<div class="eval-rows-header">
            <span class="eval-col-num">#</span>
            <span class="eval-col-nombre">Nombre de la evaluación</span>
            <span class="eval-col-porc">Ponderación (% / 20 pts)</span>
        </div>`;

        for (let i = 0; i < num; i++) {
            const nombre = noms[i] !== undefined ? noms[i] : `Evaluación ${i + 1}`;
            const porc   = porcs[i] !== undefined ? porcs[i] : '';
            const pts    = porc !== '' ? (parseFloat(porc) * 20 / 100).toFixed(1) : '0.0';
            html += `
                <div class="eval-row" id="eval-row-${i}">
                    <span class="eval-col-num eval-row-num">${i + 1}</span>
                    <div class="eval-col-nombre">
                        <input type="text" id="eval-nombre-${i}"
                               class="eval-nombre-input"
                               value="${escHtml(nombre)}"
                               placeholder="Ej: Parcial, Taller, Proyecto...">
                    </div>
                    <div class="eval-col-porc" style="display:flex;align-items:center;gap:6px;">
                        <div class="eval-porc-wrapper" style="flex:1;">
                            <input type="number" id="eval-porc-${i}"
                                   class="eval-porc-input"
                                   min="0" max="100" step="0.5"
                                   value="${porc}"
                                   placeholder="0">
                            <span class="eval-porc-symbol">%</span>
                        </div>
                        <span class="eval-pts-badge" id="eval-row-pts-${i}" title="Equivalente sobre escala de 20 puntos">${pts} pts</span>
                    </div>
                </div>`;
        }

        container.innerHTML = html;

        for (let i = 0; i < num; i++) {
            const inp = document.getElementById(`eval-porc-${i}`);
            if (inp) inp.addEventListener('input', updateTotalBar);
        }
        updateTotalBar();
    }

    function attachNumListeners() {
        const numInput = document.getElementById('eval-num-evaluaciones');
        const decBtn   = document.getElementById('eval-num-dec');
        const incBtn   = document.getElementById('eval-num-inc');
        const distBtn  = document.getElementById('eval-distribute-btn');

        if (decBtn) {
            decBtn.addEventListener('click', () => {
                let v = parseInt(numInput.value) || 1;
                if (v > 1) { numInput.value = v - 1; refreshRows(); }
            });
        }
        if (incBtn) {
            incBtn.addEventListener('click', () => {
                let v = parseInt(numInput.value) || 1;
                if (v < 7) { numInput.value = v + 1; refreshRows(); }
            });
        }
        if (distBtn) {
            distBtn.addEventListener('click', distributeEqually);
        }
    }

    function refreshRows() {
        const numInput = document.getElementById('eval-num-evaluaciones');
        const num = parseInt(numInput.value) || 1;

        const oldPorcs = [];
        const oldNoms  = [];
        const oldNum   = document.querySelectorAll('.eval-row').length;

        for (let i = 0; i < oldNum; i++) {
            const p = document.getElementById(`eval-porc-${i}`);
            const n = document.getElementById(`eval-nombre-${i}`);
            oldPorcs.push(p ? parseFloat(p.value) || 0 : 0);
            oldNoms.push(n ? n.value : `Evaluación ${i + 1}`);
        }

        renderEvalRows(num, oldPorcs, oldNoms);
    }

    function distributeEqually() {
        const numInput = document.getElementById('eval-num-evaluaciones');
        const num = parseInt(numInput.value) || 1;
        const base = Math.floor(100 / num * 10) / 10;
        const rest = +(100 - base * (num - 1)).toFixed(1);

        for (let i = 0; i < num; i++) {
            const inp = document.getElementById(`eval-porc-${i}`);
            if (inp) inp.value = i === num - 1 ? rest : base;
        }
        updateTotalBar();
    }

    function updateTotalBar() {
        const numInput = document.getElementById('eval-num-evaluaciones');
        if (!numInput) return;

        const num = parseInt(numInput.value) || 1;
        let total = 0;
        for (let i = 0; i < num; i++) {
            const inp = document.getElementById(`eval-porc-${i}`);
            const val = inp ? parseFloat(inp.value) || 0 : 0;
            total += val;
            const ptsEl = document.getElementById(`eval-row-pts-${i}`);
            if (ptsEl) {
                ptsEl.textContent = `${(val * 20 / 100).toFixed(1)} pts`;
            }
        }
        total = Math.round(total * 10) / 10;
        const totalPts = (total * 20 / 100).toFixed(1);

        const display = document.getElementById('eval-total-display');
        const fill    = document.getElementById('eval-total-bar-fill');
        const hint    = document.getElementById('eval-distribute-hint');

        if (display) {
            display.textContent = `${total}% (${totalPts} / 20 pts)`;
            display.className = 'eval-total-value';
            if (Math.abs(total - 100) < 0.05) display.classList.add('eval-total--ok');
            else if (total > 100) display.classList.add('eval-total--over');
            else display.classList.add('eval-total--under');
        }

        if (fill) {
            const pct = Math.min(total, 100);
            fill.style.width = `${pct}%`;
            fill.className = 'eval-total-bar-fill';
            if (Math.abs(total - 100) < 0.05) fill.classList.add('fill--ok');
            else if (total > 100) fill.classList.add('fill--over');
        }

        if (hint) {
            if (total < 100) {
                const diff = +(100 - total).toFixed(1);
                const diffPts = (diff * 20 / 100).toFixed(1);
                hint.textContent = `Faltan ${diff}% (${diffPts} pts) por asignar`;
                hint.style.color = '#f59e0b';
            } else if (total > 100) {
                const diff = +(total - 100).toFixed(1);
                hint.textContent = `Excede ${diff}% — ajuste los valores`;
                hint.style.color = '#ef4444';
            } else {
                hint.textContent = '✓ Los porcentajes suman 100% (20 / 20 pts)';
                hint.style.color = '#22c55e';
            }
        }

        updateTabBadges();
    }

    function updateTabBadges() {
        [1, 2, 3].forEach(m => {
            const badge = document.getElementById(`eval-tab-check-${m}`);
            if (!badge) return;

            let isDone = false;
            if (m === activeMomento) {
                const numInput = document.getElementById('eval-num-evaluaciones');
                const num = numInput ? parseInt(numInput.value) || 1 : 1;
                let total = 0;
                for (let i = 0; i < num; i++) {
                    const inp = document.getElementById(`eval-porc-${i}`);
                    total += inp ? parseFloat(inp.value) || 0 : 0;
                }
                isDone = Math.abs(total - 100) < 0.05;
            } else {
                const cfg = evalConfig.momentos[m];
                if (cfg && Array.isArray(cfg.porcentajes)) {
                    const total = cfg.porcentajes.reduce((a, b) => a + b, 0);
                    isDone = Math.abs(total - 100) < 0.05;
                }
            }

            if (isDone) {
                badge.classList.add('done');
                badge.innerHTML = `<i class='bx bx-check'></i>`;
            } else {
                badge.classList.remove('done');
                badge.textContent = m;
            }
        });
    }

    // ───────────────────────────────────────────────
    //  Guardar la configuración completa (3 momentos)
    // ───────────────────────────────────────────────
    async function saveAllMomentos() {
        saveCurrentMomentoState();

        const { teacherId, seccionId, materia, periodoId, momentos } = evalConfig;
        if (!teacherId || !seccionId || !materia || !periodoId) {
            if (window.showToast) window.showToast('Datos incompletos para guardar', 'error');
            return;
        }

        const saveBtn = document.getElementById('eval-save-all-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Guardando...`;
        }

        let allOk = true;
        for (const [m, cfg] of Object.entries(momentos)) {
            if (!cfg) continue;

            const total = cfg.porcentajes.reduce((a, b) => a + b, 0);
            if (Math.abs(total - 100) > 0.05) {
                if (window.showToast) window.showToast(`MP${m}: los porcentajes deben sumar 100% (actual: ${total.toFixed(1)}%)`, 'error');
                allOk = false;
                continue;
            }

            const res = await apiCall('save_evaluaciones', {
                teacher_id:       teacherId,
                seccion_id:       seccionId,
                materia:          materia,
                periodo_id:       periodoId,
                momento:          parseInt(m),
                num_evaluaciones: cfg.numEval,
                porcentajes:      cfg.porcentajes,
                nombres:          cfg.nombres
            });

            if (!res.success) {
                if (window.showToast) window.showToast(`Error al guardar MP${m}: ${res.error}`, 'error');
                allOk = false;
            }
        }

        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `<i class='bx bx-save'></i> Guardar Configuración`;
        }

        if (allOk) {
            if (window.showToast) window.showToast('Configuración de evaluaciones guardada exitosamente', 'success');
            closeEvalModal();
            renderEvaluacionesTable();
        }
    }

    // ───────────────────────────────────────────────
    //  Modal de Calificar Evaluaciones de Estudiantes
    // ───────────────────────────────────────────────
    let currentGrading = {
        teacherId: null,
        seccionId: null,
        materia: null,
        periodoId: null,
        momento: 1,
        students: [],
        evaluaciones: null,
        notasExistentes: {}
    };

    async function openEvalGradingModal(teacherId, seccionId, materia, periodoId, initialMomento = 1) {
        currentGrading.teacherId = teacherId || getEffectiveTeacherId();
        currentGrading.seccionId = parseInt(seccionId);
        currentGrading.materia = materia;
        currentGrading.periodoId = parseInt(periodoId);
        currentGrading.momento = parseInt(initialMomento) || 1;

        const modal = document.getElementById('eval-grading-modal');
        if (!modal) return;

        const sec = getGlobalSections().find(s => s.id == currentGrading.seccionId);
        const per = getGlobalPeriods().find(p => p.id == currentGrading.periodoId);
        const secNombre = sec ? sec.nombre : `Sección ${currentGrading.seccionId}`;
        const perNombre = per ? per.nombre : `Período ${currentGrading.periodoId}`;

        const subtitle = document.getElementById('eval-grading-subtitle');
        if (subtitle) {
            subtitle.textContent = `Sección: ${secNombre}  |  Materia: ${materia}  |  Período: ${perNombre}`;
        }

        modal.classList.add('active');
        await switchGradingMomento(currentGrading.momento);
    }

    function closeEvalGradingModal() {
        const modal = document.getElementById('eval-grading-modal');
        if (modal) modal.classList.remove('active');
    }

    async function switchGradingMomento(momento) {
        currentGrading.momento = momento;

        document.querySelectorAll('.eval-grading-momento-tab').forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.momento) === momento);
        });

        await loadAndRenderGradingData();
    }

    async function loadAndRenderGradingData() {
        const { teacherId, seccionId, materia, periodoId, momento } = currentGrading;
        const thead = document.getElementById('eval-grading-thead');
        const tbody = document.getElementById('eval-grading-tbody');
        const infoBar = document.getElementById('eval-grading-info-bar');

        if (!tbody || !thead) return;

        thead.innerHTML = '';
        tbody.innerHTML = `<tr><td colspan="10" class="empty-msg"><i class='bx bx-loader-alt bx-spin'></i> Cargando datos...</td></tr>`;

        // 1. Obtener la configuración de evaluaciones para este momento
        let configs = savedConfigs;
        if (!configs || configs.length === 0) {
            try {
                configs = await fetchEvaluaciones(teacherId);
                savedConfigs = Array.isArray(configs) ? configs : [];
            } catch (e) {
                configs = [];
            }
        }

        const momentoCfg = (configs || []).find(c =>
            (parseInt(c.seccion_id) === seccionId || !c.seccion_id) &&
            c.materia === materia &&
            (parseInt(c.periodo_id) === periodoId || !c.periodo_id) &&
            parseInt(c.momento) === momento
        );

        if (!momentoCfg) {
            if (infoBar) infoBar.innerHTML = `<span style="color:#b91c1c;"><i class='bx bx-error-circle'></i> No hay evaluaciones configuradas para el Momento ${momento}.</span>`;
            thead.innerHTML = '';
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="padding:2.5rem 1rem;text-align:center;">
                        <i class='bx bx-cog' style="font-size:2.8rem;color:#94a3b8;display:block;margin-bottom:0.5rem;"></i>
                        <p style="font-size:0.95rem;color:#475569;margin-bottom:1rem;">
                            Aún no se han configurado las evaluaciones para <strong>MP${momento}</strong> en esta materia y sección.
                        </p>
                        <button type="button" class="btn-primary" id="btn-config-now-from-grading" style="margin:0 auto;">
                            <i class='bx bx-plus-circle'></i> Configurar Evaluaciones de MP${momento}
                        </button>
                    </td>
                </tr>
            `;
            const configNowBtn = document.getElementById('btn-config-now-from-grading');
            if (configNowBtn) {
                configNowBtn.addEventListener('click', () => {
                    closeEvalGradingModal();
                    openEvalModal(teacherId, seccionId, materia, periodoId);
                    switchMomento(momento);
                });
            }
            return;
        }

        let porcs = [];
        let noms = [];
        try { porcs = JSON.parse(momentoCfg.porcentajes); } catch (e) {}
        try { noms = JSON.parse(momentoCfg.nombres); } catch (e) {}
        const numEval = momentoCfg.num_evaluaciones || porcs.length || 1;

        currentGrading.evaluaciones = { numEval, porcentajes: porcs, nombres: noms };

        // Mostrar bar informativo
        if (infoBar) {
            let pills = porcs.map((p, idx) => {
                const nom = noms[idx] || `Eval ${idx + 1}`;
                const pts = (parseFloat(p) * 20 / 100).toFixed(1);
                return `<span class="eval-pts-badge">${escHtml(nom)}: <strong>${p}%</strong> (${pts} pts)</span>`;
            }).join(' ');

            infoBar.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                    <span><strong><i class='bx bx-check-circle'></i> MP${momento} (${numEval} eval.):</strong></span>
                    ${pills}
                </div>
            `;
        }

        // 2. Obtener lista de estudiantes de la sección
        let studentsList = [];
        if (typeof window.students !== 'undefined' && Array.isArray(window.students)) {
            studentsList = window.students.filter(s => {
                const sSec = parseInt(s.seccion_id || s.seccionId);
                const active = s.status !== 'dropped' && s.status !== 'retirado' && (s.activo === undefined || s.activo === null || parseInt(s.activo) === 1);
                return sSec === seccionId && active;
            });
        }
        if (studentsList.length === 0) {
            try {
                const res = await fetch(`${getApiUrl()}?action=get_students_by_section&section_id=${seccionId}`);
                const data = await res.json();
                studentsList = Array.isArray(data) ? data : [];
            } catch (e) {}
        }
        currentGrading.students = studentsList;

        if (studentsList.length === 0) {
            thead.innerHTML = '';
            tbody.innerHTML = `<tr><td colspan="10" class="empty-msg"><i class='bx bx-user-x'></i> No se encontraron estudiantes en esta sección.</td></tr>`;
            return;
        }

        // 3. Obtener notas de evaluaciones guardadas
        let existingNotas = {};
        try {
            const url = `${getApiUrl()}?action=get_evaluaciones_notas&seccion_id=${seccionId}&materia=${encodeURIComponent(materia)}&periodo_id=${periodoId}&momento=${momento}`;
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                data.forEach(item => {
                    let ne = [];
                    try { ne = JSON.parse(item.notas_eval); } catch (e) {}
                    existingNotas[item.estudiante_id] = {
                        notas_eval: ne,
                        nota_momento: item.nota_momento
                    };
                });
            }
        } catch (e) {
            console.error('Error fetching evaluaciones_notas:', e);
        }
        currentGrading.notasExistentes = existingNotas;

        // 4. Renderizar Thead
        let theadCols = `
            <tr>
                <th style="width:115px;text-align:left;">Cédula</th>
                <th style="text-align:left;">Estudiante</th>
        `;
        for (let i = 0; i < numEval; i++) {
            const nom = noms[i] || `Eval ${i + 1}`;
            const porc = porcs[i] !== undefined ? porcs[i] : 0;
            const pts = (parseFloat(porc) * 20 / 100).toFixed(1);
            theadCols += `
                <th style="text-align:center;min-width:90px;">
                    <div style="font-size:0.85rem;font-weight:700;">${escHtml(nom)}</div>
                    <div style="font-size:0.75rem;font-weight:normal;opacity:0.85;">${porc}% (${pts} pts)</div>
                </th>
            `;
        }
        theadCols += `
                <th style="text-align:center;width:110px;">
                    <div style="font-size:0.85rem;font-weight:700;">Nota MP${momento}</div>
                    <div style="font-size:0.75rem;font-weight:normal;opacity:0.85;">(sobre 20)</div>
                </th>
            </tr>
        `;
        thead.innerHTML = theadCols;

        // 5. Renderizar Tbody
        let rowsHtml = '';
        studentsList.forEach(st => {
            const stId = st.id;
            const savedData = existingNotas[stId];
            const savedEvals = (savedData && Array.isArray(savedData.notas_eval)) ? savedData.notas_eval : [];
            const stNombre = `${st.apellido || ''} ${st.nombre || ''}`.trim() || st.nombre_completo || 'Estudiante';
            const cedula = st.cedula || '--';

            let evalInputs = '';
            for (let i = 0; i < numEval; i++) {
                const val = (savedEvals[i] !== undefined && savedEvals[i] !== null) ? savedEvals[i] : '';
                evalInputs += `
                    <td style="text-align:center;">
                        <input type="number"
                               class="eval-grade-cell"
                               data-student-id="${stId}"
                               data-eval-index="${i}"
                               min="0" max="20" step="0.1"
                               value="${val}"
                               placeholder="0-20"
                               style="width:75px;padding:5px 8px;text-align:center;border:1px solid #cbd5e1;border-radius:6px;font-size:0.9rem;font-weight:600;">
                    </td>
                `;
            }

            rowsHtml += `
                <tr data-student-id="${stId}">
                    <td style="font-weight:600;color:#334155;">${escHtml(cedula)}</td>
                    <td style="font-weight:500;">${escHtml(stNombre)}</td>
                    ${evalInputs}
                    <td style="text-align:center;">
                        <span class="eval-student-momento-badge" id="eval-student-mp-${stId}">--</span>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = rowsHtml;

        attachGradingCalculationListeners();
    }

    function attachGradingCalculationListeners() {
        const inputs = document.querySelectorAll('.eval-grade-cell');
        inputs.forEach(inp => {
            inp.addEventListener('input', (e) => {
                let v = parseFloat(e.target.value);
                if (v > 20) {
                    e.target.value = 20;
                    if (window.showToast) window.showToast('La nota máxima es 20 puntos', 'warning');
                } else if (v < 0) {
                    e.target.value = 0;
                    if (window.showToast) window.showToast('La nota mínima es 0', 'warning');
                }
                const stId = parseInt(e.target.dataset.studentId);
                calcStudentMomentoScore(stId);
            });
        });

        if (currentGrading.students) {
            currentGrading.students.forEach(st => calcStudentMomentoScore(st.id));
        }
    }

    function calcStudentMomentoScore(stId) {
        if (!currentGrading.evaluaciones) return;
        const porcs = currentGrading.evaluaciones.porcentajes || [];
        const inputs = document.querySelectorAll(`.eval-grade-cell[data-student-id="${stId}"]`);
        const badge = document.getElementById(`eval-student-mp-${stId}`);
        if (!badge) return;

        let totalPoints = 0;
        let hasAnyGrade = false;

        inputs.forEach(inp => {
            const idx = parseInt(inp.dataset.evalIndex);
            const val = inp.value !== '' ? parseFloat(inp.value) : null;
            const porc = porcs[idx] !== undefined ? parseFloat(porcs[idx]) : 0;
            if (val !== null && !isNaN(val)) {
                hasAnyGrade = true;
                totalPoints += val * (porc / 100);
            }
        });

        if (!hasAnyGrade) {
            badge.textContent = '--';
            badge.className = 'eval-student-momento-badge';
        } else {
            const finalScore = Math.min(20, Math.max(0, Math.round(totalPoints * 100) / 100));
            badge.textContent = finalScore.toFixed(2);
            badge.className = 'eval-student-momento-badge ' + (finalScore >= 9.5 ? 'aprobado' : 'reprobado');
        }
    }

    async function saveEvalGrading() {
        const { seccionId, materia, periodoId, momento, evaluaciones } = currentGrading;
        const students = currentGrading.students || [];
        const porcs = (evaluaciones && evaluaciones.porcentajes) ? evaluaciones.porcentajes : [];

        if (!seccionId || !materia || !periodoId || !momento) {
            if (window.showToast) window.showToast('Información incompleta para guardar calificaciones', 'error');
            return;
        }

        const saveBtn = document.getElementById('eval-grading-save-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Guardando y aplicando...`;
        }

        const calificaciones = [];
        students.forEach(st => {
            const inputs = document.querySelectorAll(`.eval-grade-cell[data-student-id="${st.id}"]`);
            const notas_eval = [];
            let totalPoints = 0;
            let hasAnyGrade = false;

            inputs.forEach(inp => {
                const idx = parseInt(inp.dataset.evalIndex);
                const val = inp.value !== '' ? parseFloat(inp.value) : null;
                const porc = porcs[idx] !== undefined ? parseFloat(porcs[idx]) : 0;
                notas_eval.push(val);
                if (val !== null && !isNaN(val)) {
                    hasAnyGrade = true;
                    totalPoints += val * (porc / 100);
                }
            });

            const finalScore = hasAnyGrade ? Math.min(20, Math.max(0, Math.round(totalPoints * 100) / 100)) : null;

            calificaciones.push({
                estudiante_id: st.id,
                notas_eval: notas_eval,
                nota_momento: finalScore
            });
        });

        try {
            const res = await apiCall('save_evaluaciones_notas', {
                seccion_id: seccionId,
                materia: materia,
                periodo_id: periodoId,
                momento: momento,
                calificaciones: calificaciones
            });

            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = `<i class='bx bx-save'></i> Guardar y Aplicar a Vaciado de Notas`;
            }

            if (res && res.success) {
                if (window.showToast) window.showToast(`Calificaciones de MP${momento} guardadas y aplicadas a Vaciado de Notas exitosamente`, 'success');
                closeEvalGradingModal();

                // Actualizar inmediatamente Vaciado de Notas
                if (typeof window.loadStudents === 'function') {
                    window.loadStudents();
                }
            } else {
                if (window.showToast) window.showToast(`Error al guardar: ${res.error || 'Error desconocido'}`, 'error');
            }
        } catch (e) {
            console.error('Error guardando calificaciones de evaluaciones:', e);
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = `<i class='bx bx-save'></i> Guardar y Aplicar a Vaciado de Notas`;
            }
            if (window.showToast) window.showToast('Error de conexión al guardar calificaciones', 'error');
        }
    }

    // ───────────────────────────────────────────────
    //  Inicialización de la sección "Evaluaciones"
    // ───────────────────────────────────────────────
    function initEvaluacionesSection() {
        const teacherSel = document.getElementById('eval-teacher-select');
        if (teacherSel) {
            populateTeacherSelect(teacherSel);
            if (!teacherSel.dataset.listenerAttached) {
                teacherSel.dataset.listenerAttached = 'true';
                teacherSel.addEventListener('change', () => {
                    populateEvalSelects();
                    renderEvaluacionesTable();
                });
            }
        }

        // Siempre cargar períodos y secciones
        populatePeriodoSelect();
        populateSeccionSelect();
        renderEvaluacionesTable();

        // Botón "Configurar" del header / barra
        const headerBtn = document.getElementById('eval-header-open-btn');
        if (headerBtn && !headerBtn.dataset.listenerAttached) {
            headerBtn.dataset.listenerAttached = 'true';
            headerBtn.addEventListener('click', openNewEvalModal);
        }

        const newBtn = document.getElementById('eval-new-config-btn');
        if (newBtn && !newBtn.dataset.listenerAttached) {
            newBtn.dataset.listenerAttached = 'true';
            newBtn.addEventListener('click', openNewEvalModal);
        }

        // Cerrar modal
        const closeBtn = document.getElementById('eval-modal-close');
        if (closeBtn && !closeBtn.dataset.listenerAttached) {
            closeBtn.dataset.listenerAttached = 'true';
            closeBtn.addEventListener('click', closeEvalModal);
        }

        const cancelBtn = document.getElementById('eval-modal-cancel');
        if (cancelBtn && !cancelBtn.dataset.listenerAttached) {
            cancelBtn.dataset.listenerAttached = 'true';
            cancelBtn.addEventListener('click', closeEvalModal);
        }

        // Guardar todo
        const saveAllBtn = document.getElementById('eval-save-all-btn');
        if (saveAllBtn && !saveAllBtn.dataset.listenerAttached) {
            saveAllBtn.dataset.listenerAttached = 'true';
            saveAllBtn.addEventListener('click', saveAllMomentos);
        }

        // Tabs de momentos
        document.querySelectorAll('.eval-momento-tab').forEach(tab => {
            if (!tab.dataset.listenerAttached) {
                tab.dataset.listenerAttached = 'true';
                tab.addEventListener('click', () => switchMomento(parseInt(tab.dataset.momento)));
            }
        });

        // Cambio de sección actualiza materias
        const secSel = document.getElementById('eval-new-seccion');
        if (secSel && !secSel.dataset.listenerAttached) {
            secSel.dataset.listenerAttached = 'true';
            secSel.addEventListener('change', () => updateMateriaSelect());
        }

        // Modal Calificar Evaluaciones
        const gradingClose = document.getElementById('eval-grading-close');
        if (gradingClose && !gradingClose.dataset.listenerAttached) {
            gradingClose.dataset.listenerAttached = 'true';
            gradingClose.addEventListener('click', closeEvalGradingModal);
        }

        const gradingCancel = document.getElementById('eval-grading-cancel');
        if (gradingCancel && !gradingCancel.dataset.listenerAttached) {
            gradingCancel.dataset.listenerAttached = 'true';
            gradingCancel.addEventListener('click', closeEvalGradingModal);
        }

        const gradingSaveBtn = document.getElementById('eval-grading-save-btn');
        if (gradingSaveBtn && !gradingSaveBtn.dataset.listenerAttached) {
            gradingSaveBtn.dataset.listenerAttached = 'true';
            gradingSaveBtn.addEventListener('click', saveEvalGrading);
        }

        document.querySelectorAll('.eval-grading-momento-tab').forEach(tab => {
            if (!tab.dataset.listenerAttached) {
                tab.dataset.listenerAttached = 'true';
                tab.addEventListener('click', () => switchGradingMomento(parseInt(tab.dataset.momento)));
            }
        });

        // Al hacer clic en el menú "Evaluaciones", refrescar datos
        document.querySelectorAll('[data-section="evaluaciones"]').forEach(link => {
            if (!link.dataset.evalListenerAttached) {
                link.dataset.evalListenerAttached = 'true';
                link.addEventListener('click', () => {
                    populateTeacherSelect();
                    populatePeriodoSelect();
                    populateSeccionSelect();
                    renderEvaluacionesTable();
                });
            }
        });
    }

    function populateTeacherSelect(sel) {
        if (!sel) sel = document.getElementById('eval-teacher-select');
        if (!sel) return;
        const currentVal = sel.value;
        const teachers = getGlobalUsers().filter(u => u.rol === 'teacher');
        sel.innerHTML = `<option value="">-- Seleccione un profesor --</option>` +
            teachers.map(t => `<option value="${t.id}">${escHtml(t.nombre)} ${escHtml(t.apellido)}</option>`).join('');
        if (currentVal) sel.value = currentVal;
    }

    function populateEvalSelects() {
        populateSeccionSelect();
        populatePeriodoSelect();
    }

    function populateSeccionSelect() {
        const sel = document.getElementById('eval-new-seccion');
        if (!sel) return;

        let secciones = [];
        if (window.currentTeacher) {
            const asigs = [];
            try {
                const raw = typeof window.currentTeacher.asignaciones === 'string'
                    ? JSON.parse(window.currentTeacher.asignaciones)
                    : (window.currentTeacher.asignaciones || []);
                raw.forEach(a => { if (a.seccion_id) asigs.push(parseInt(a.seccion_id)); });
            } catch (e) {}
            const seccionIds = [...new Set(asigs)];
            secciones = getGlobalSections().filter(s => seccionIds.includes(s.id));
        } else {
            const teacherSel = document.getElementById('eval-teacher-select');
            const teacherId  = teacherSel ? parseInt(teacherSel.value) : 0;
            if (teacherId) {
                const teacher = getGlobalUsers().find(u => u.id === teacherId);
                if (teacher && teacher.asignaciones) {
                    let asigs = [];
                    try {
                        asigs = typeof teacher.asignaciones === 'string'
                            ? JSON.parse(teacher.asignaciones)
                            : teacher.asignaciones;
                    } catch (e) {}
                    const seccionIds = [...new Set(asigs.map(a => parseInt(a.seccion_id)))];
                    secciones = getGlobalSections().filter(s => seccionIds.includes(s.id));
                }
            }
        }

        sel.innerHTML = `<option value="">-- Sección --</option>` +
            secciones.map(s => `<option value="${s.id}">${escHtml(s.nombre)}</option>`).join('');

        updateMateriaSelect();
    }

    function updateMateriaSelect() {
        const secSel = document.getElementById('eval-new-seccion');
        const matSel = document.getElementById('eval-new-materia');
        if (!matSel) return;

        const seccionId = secSel ? parseInt(secSel.value) : 0;
        if (!seccionId) {
            matSel.innerHTML = `<option value="">-- Materia --</option>`;
            return;
        }

        let materias = [];
        if (window.currentTeacher) {
            let asigs = [];
            try {
                asigs = typeof window.currentTeacher.asignaciones === 'string'
                    ? JSON.parse(window.currentTeacher.asignaciones)
                    : (window.currentTeacher.asignaciones || []);
            } catch (e) {}
            materias = asigs
                .filter(a => parseInt(a.seccion_id) === seccionId)
                .map(a => a.materia_nombre || a.materia)
                .filter(Boolean);
        } else {
            const teacherSel = document.getElementById('eval-teacher-select');
            const teacherId  = teacherSel ? parseInt(teacherSel.value) : 0;
            const teacher    = getGlobalUsers().find(u => u.id === teacherId);
            if (teacher && teacher.asignaciones) {
                let asigs = [];
                try {
                    asigs = typeof teacher.asignaciones === 'string'
                        ? JSON.parse(teacher.asignaciones)
                        : teacher.asignaciones;
                } catch (e) {}
                materias = asigs
                    .filter(a => parseInt(a.seccion_id) === seccionId)
                    .map(a => a.materia_nombre || a.materia)
                    .filter(Boolean);
            }
        }

        matSel.innerHTML = `<option value="">-- Materia --</option>` +
            [...new Set(materias)].map(m => `<option value="${escHtml(m)}">${escHtml(m)}</option>`).join('');
    }

    function populatePeriodoSelect() {
        const sel = document.getElementById('eval-new-periodo');
        if (!sel) return;
        const currentVal = sel.value;
        const perds = getGlobalPeriods();
        sel.innerHTML = `<option value="">-- Período --</option>` +
            perds.map(p => `<option value="${p.id}">${escHtml(p.nombre)}</option>`).join('');
        if (currentVal) sel.value = currentVal;
    }

    // ───────────────────────────────────────────────
    //  Utilidades
    // ───────────────────────────────────────────────
    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ───────────────────────────────────────────────
    //  Exposición pública
    // ───────────────────────────────────────────────
    window.EvaluacionesManager = {
        init: initEvaluacionesSection,
        refresh: renderEvaluacionesTable,
        openGradingModal: openEvalGradingModal,
        closeGradingModal: closeEvalGradingModal
    };
    window.openEvalGradingModal = openEvalGradingModal;
    window.closeEvalGradingModal = closeEvalGradingModal;

    // Auto-init cuando el DOM esté listo y los datos cargados
    document.addEventListener('DOMContentLoaded', () => {
        const waitAndInit = () => {
            if (document.getElementById('eval-config-tbody')) {
                initEvaluacionesSection();
            }
        };

        const origRenderAll = window.renderAll;
        if (typeof origRenderAll === 'function') {
            window.renderAll = function () {
                origRenderAll.apply(this, arguments);
                waitAndInit();
            };
        }

        setTimeout(waitAndInit, 300);
        setTimeout(waitAndInit, 1000);
    });

})();
