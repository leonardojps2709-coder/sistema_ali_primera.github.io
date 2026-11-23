// periodos-manager.js
// Gestión de períodos académicos

let editingPeriodId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const periodsTbody = document.getElementById('periods-table-body');
    const addPeriodBtn = document.getElementById('add-period-btn');
    const periodModal = document.getElementById('period-modal');
    const modalTitle = document.getElementById('period-modal-title');
    const closeModalBtn = document.getElementById('close-period-modal');
    const cancelBtn = document.getElementById('cancel-period-modal');
    const saveBtn = document.getElementById('save-period-btn');
    const periodForm = document.getElementById('period-form');

    // ========== FECHAS ==========

    /** Convierte "2026-06-14" (o un Date) en un número AAAAMMDD comparable. */
    function numeroFecha(valor) {
        if (!valor) return null;
        const partes = String(valor).substring(0, 10).split('-');
        if (partes.length !== 3) return null;
        const n = parseInt(partes[0] + partes[1] + partes[2], 10);
        return isNaN(n) ? null : n;
    }

    /** Número AAAAMMDD del día de hoy (sin hora, sin desfase de zona). */
    function hoyNumero() {
        const d = new Date();
        return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    }

    /**
     * Momento que se está cursando hoy: el primero cuya fecha de vaciado
     * todavía no llega. Devuelve null si el período está cerrado, no ha
     * comenzado o ya pasaron los tres momentos.
     */
    function momentoActual(period) {
        if ((period.estado || '').toLowerCase() === 'cerrado') return null;

        const hoy = hoyNumero();
        const inicio = numeroFecha(period.fecha_inicio || period.fechaInicio);

        if (inicio && hoy < inicio) return null;

        const fechas = [
            { n: 1, num: numeroFecha(period.fecha_mp1 || period.fechaMP1) },
            { n: 2, num: numeroFecha(period.fecha_mp2 || period.fechaMP2) },
            { n: 3, num: numeroFecha(period.fecha_mp3 || period.fechaMP3) }
        ].filter(m => m.num !== null);

        const siguiente = fechas.find(m => m.num >= hoy);
        return siguiente ? siguiente.n : null;
    }

    // ========== FUNCIONES DE RENDERIZADO ==========

    function renderPeriods() {
        if (!periodsTbody) return;

        if (periods.length === 0) {
            periodsTbody.innerHTML = `<div class="empty-msg" style="padding:2rem;text-align:center;color:#64748b;">No hay períodos académicos registrados</div>`;
            updatePeriodSelect();
            return;
        }

        const hoy = hoyNumero();

        periodsTbody.innerHTML = periods.map(period => {
            const cerrado = (period.estado || '').toLowerCase() === 'cerrado';
            const actual = momentoActual(period);

            const hitos = [
                { clave: 'inicio', etiqueta: 'Inicio', valor: period.fecha_inicio || period.fechaInicio, momento: null },
                { clave: 'mp1', etiqueta: 'MP1', valor: period.fecha_mp1 || period.fechaMP1, momento: 1 },
                { clave: 'mp2', etiqueta: 'MP2', valor: period.fecha_mp2 || period.fechaMP2, momento: 2 },
                { clave: 'mp3', etiqueta: 'MP3', valor: period.fecha_mp3 || period.fechaMP3, momento: 3 },
                { clave: 'fin', etiqueta: 'Fin', valor: period.fecha_fin || period.fechaFin, momento: null }
            ];

            const hitosHtml = hitos.map(h => {
                const num = numeroFecha(h.valor);
                let clase = '';

                if (h.momento !== null && h.momento === actual) {
                    clase = 'actual';
                } else if (num !== null && num < hoy) {
                    clase = 'hecho';
                } else if (num === null) {
                    clase = 'sin-fecha';
                }

                return `
                    <div class="tl-hito ${clase}">
                        <div class="tl-punto"></div>
                        <span>${h.etiqueta}</span>
                        <b>${h.valor ? formatDate(h.valor) : '—'}</b>
                    </div>`;
            }).join('');

            return `
                <div class="tl-item" data-period-id="${period.id}">
                    <div class="tl-cabecera">
                        <div class="tl-titulo">
                            <strong>${escHtml(period.nombre)}</strong>
                            <span class="tl-pill ${cerrado ? 'cerrado' : 'activo'}">
                                <i class='bx ${cerrado ? 'bx-lock-alt' : 'bx-check-circle'}'></i>
                                ${cerrado ? 'Cerrado' : 'Activo'}
                            </span>
                        </div>
                        <div class="tl-acciones">
                            <button class="btn-icon edit-period" data-id="${period.id}" title="Editar"><i class='bx bx-edit'></i></button>
                            <button class="btn-icon toggle-status" data-id="${period.id}" title="${cerrado ? 'Abrir' : 'Cerrar'}">
                                <i class='bx ${cerrado ? 'bx-lock-open-alt' : 'bx-lock-alt'}'></i>
                            </button>
                            <button class="btn-icon delete delete-period" data-id="${period.id}" title="Eliminar"><i class='bx bx-trash'></i></button>
                        </div>
                    </div>
                    <div class="tl-track">
                        <div class="tl-linea"></div>
                        ${hitosHtml}
                    </div>
                </div>
            `;
        }).join('');

        // Actualizar selector de períodos en notas
        updatePeriodSelect();
    }

    /**
     * Formatea una fecha AAAA-MM-DD como DD/MM/AAAA.
     * Se evita `new Date('AAAA-MM-DD')` porque interpreta UTC y resta un día
     * en zonas horarias negativas como la de Venezuela.
     */
    function formatDate(valor) {
        if (!valor) return '—';

        const partes = String(valor).substring(0, 10).split('-');
        if (partes.length === 3 && partes[0].length === 4) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }

        const date = new Date(valor);
        return isNaN(date.getTime())
            ? '—'
            : date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // ========== FUNCIONES DEL MODAL ==========
    function openModal(period = null) {
        if (period) {
            editingPeriodId = period.id;
            modalTitle.innerHTML = '<i class="bx bx-edit-alt"></i> Editar Período';
            saveBtn.innerHTML = '<i class="bx bx-save"></i> Actualizar Período';
            
            document.getElementById('period-nombre').value = period.nombre;
            document.getElementById('period-fecha-inicio').value = period.fecha_inicio || period.fechaInicio;
            document.getElementById('period-mp1').value = period.fecha_mp1 || period.fechaMP1 || '';
            document.getElementById('period-mp2').value = period.fecha_mp2 || period.fechaMP2 || '';
            document.getElementById('period-mp3').value = period.fecha_mp3 || period.fechaMP3 || '';
            document.getElementById('period-fecha-fin').value = period.fecha_fin || period.fechaFin;
        } else {
            editingPeriodId = null;
            modalTitle.innerHTML = '<i class="bx bx-plus-circle"></i> Nuevo Período';
            saveBtn.innerHTML = '<i class="bx bx-save"></i> Guardar Período';
            periodForm.reset();
            
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('period-fecha-inicio').value = today;
            
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            document.getElementById('period-fecha-fin').value = nextYear.toISOString().split('T')[0];
        }

        limpiarErrores();
        periodModal.classList.add('active');
    }

    function closeModal() {
        periodModal.classList.remove('active');
        periodForm.reset();
        editingPeriodId = null;
    }

    /** Marca un campo como inválido y escribe el mensaje debajo. */
    function marcarError(campo, mensaje) {
        if (!campo) return;
        campo.classList.add('error');
        const span = document.getElementById(campo.id + '-error');
        if (span) span.textContent = mensaje;
    }

    /** Lleva el foco al campo con error y lo deja visible en pantalla. */
    function enfocarCampo(campo) {
        if (!campo) return;
        try {
            campo.focus({ preventScroll: true });
        } catch (e) {
            campo.focus();
        }
        if (typeof campo.scrollIntoView === 'function') {
            campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /** Mensaje de error asociado a un campo. */
    function mensajeDe(campo) {
        const span = document.getElementById(campo.id + '-error');
        return span ? span.textContent : '';
    }

    /** Limpia las marcas de error de todo el formulario. */
    function limpiarErrores() {
        document.querySelectorAll('.period-form .error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.period-form .error').forEach(el => el.classList.remove('error'));
    }

    /**
     * Traduce un error devuelto por el servidor al campo que lo provoca,
     * para poder señalarlo en el formulario.
     */
    function ubicarErrorServidor(mensaje) {
        const texto = String(mensaje || '').toLowerCase();

        if (texto.includes('nombre')) return document.getElementById('period-nombre');
        if (texto.includes('fecha')) return document.getElementById('period-fecha-inicio');
        if (texto.includes('cerrado') || texto.includes('cierre')) return null;

        return null;
    }

    function validateForm() {
        let primerError = null;
        
        const nombre = document.getElementById('period-nombre');
        const fechaInicio = document.getElementById('period-fecha-inicio');
        const fechaFin = document.getElementById('period-fecha-fin');
        const mp1 = document.getElementById('period-mp1');
        const mp2 = document.getElementById('period-mp2');
        const mp3 = document.getElementById('period-mp3');

        limpiarErrores();

        const fallo = (campo, mensaje) => {
            marcarError(campo, mensaje);
            if (!primerError) primerError = campo;
        };

        // Se recorre el formulario en su orden visual
        if (!nombre.value.trim()) {
            fallo(nombre, 'El nombre del período es obligatorio');
        } else if (nombre.value.trim().length > 50) {
            fallo(nombre, 'El nombre no puede superar los 50 caracteres');
        }

        if (!fechaInicio.value) fallo(fechaInicio, 'Indica la fecha de inicio');
        if (!fechaFin.value) fallo(fechaFin, 'Indica la fecha de fin');
        if (!mp1.value) fallo(mp1, 'Indica la fecha de vaciado del MP1');
        if (!mp2.value) fallo(mp2, 'Indica la fecha de vaciado del MP2');
        if (!mp3.value) fallo(mp3, 'Indica la fecha de vaciado del MP3');

        if (fechaInicio.value && fechaFin.value && mp1.value && mp2.value && mp3.value) {
            const dInicio = new Date(fechaInicio.value);
            const dMp1 = new Date(mp1.value);
            const dMp2 = new Date(mp2.value);
            const dMp3 = new Date(mp3.value);
            const dFin = new Date(fechaFin.value);

            if (dInicio > dMp1) fallo(mp1, 'Debe ser posterior al inicio');
            if (dMp1 > dMp2) fallo(mp2, 'Debe ser posterior al MP1');
            if (dMp2 > dMp3) fallo(mp3, 'Debe ser posterior al MP2');
            if (dMp3 > dFin) fallo(fechaFin, 'Debe ser posterior al MP3');

            // Validar solapamiento con otros períodos
            const superpuesto = periods.find(p => {
                if (p.id === editingPeriodId) return false;
                const pStart = new Date(p.fecha_inicio || p.fechaInicio);
                const pEnd = new Date(p.fecha_fin || p.fechaFin);
                return (dInicio <= pEnd && dFin >= pStart);
            });

            if (superpuesto) {
                const desde = formatDate(superpuesto.fecha_inicio || superpuesto.fechaInicio);
                const hasta = formatDate(superpuesto.fecha_fin || superpuesto.fechaFin);
                fallo(fechaInicio, `Se solapa con "${superpuesto.nombre}" (${desde} a ${hasta})`);
            }
        }

        const nombreNormalizado = nombre.value.trim().toLowerCase();
        const existe = periods.some(p => (p.nombre || '').trim().toLowerCase() === nombreNormalizado && p.id !== editingPeriodId);
        if (existe) fallo(nombre, 'Ya existe un período con ese nombre');

        return primerError;
    }

    async function savePeriod() {
        const primerError = validateForm();

        // Si algo está mal, se señala el campo, se lleva el foco y se explica el motivo
        if (primerError) {
            enfocarCampo(primerError);

            const grupo = primerError.closest ? primerError.closest('.form-group') : null;
            const etiqueta = (grupo && grupo.querySelector('label'))
                ? grupo.querySelector('label').textContent.replace('*', '').trim()
                : '';
            const detalle = mensajeDe(primerError);

            showToast(
                etiqueta ? `Revise "${etiqueta}": ${detalle}` : 'Revise los campos marcados en rojo',
                'error'
            );
            return;
        }

        const periodData = {
            nombre: document.getElementById('period-nombre').value.trim(),
            fechaInicio: document.getElementById('period-fecha-inicio').value,
            fechaMP1: document.getElementById('period-mp1').value,
            fechaMP2: document.getElementById('period-mp2').value,
            fechaMP3: document.getElementById('period-mp3').value,
            fechaFin: document.getElementById('period-fecha-fin').value,
            estado: editingPeriodId ? periods.find(p => p.id === editingPeriodId).estado : 'activo'
        };

        const res = editingPeriodId
            ? await updatePeriod(editingPeriodId, periodData)
            : await addPeriod(periodData);

        if (res && res.success) {
            showToast(editingPeriodId ? 'Período actualizado exitosamente' : 'Período creado exitosamente', 'success');
            renderPeriods();
            closeModal();
            return;
        }

        // El servidor rechazó el guardado: se mantiene abierto el formulario para
        // corregir, y se marca el campo que provocó el error.
        const mensaje = (res && res.error) || 'No se pudo guardar el período';
        const campo = ubicarErrorServidor(mensaje);
        if (campo) {
            marcarError(campo, mensaje);
            enfocarCampo(campo);
        }
        showToast(mensaje, 'error');
    }

    async function deletePeriodHandler(id) {
        if (confirm('¿Está seguro de que desea eliminar este período? Esta acción no se puede deshacer.')) {
            const res = await deletePeriod(id);
            if (res && res.success) {
                showToast('Período eliminado exitosamente', 'success');
                renderPeriods();
            } else {
                showToast((res && res.error) || 'Error al eliminar el período', 'error');
            }
        }
    }

    async function togglePeriodStatus(id) {
        const period = periods.find(p => p.id === id);
        if (period) {
            const newEstado = period.estado === 'cerrado' ? 'activo' : 'cerrado';

            // Cerrar exige calcular y congelar las calificaciones finales: se usa
            // la acción de cierre, no una simple actualización del estado.
            if (newEstado === 'cerrado') {
                try {
                    const res = await fetch('../api/main.php?action=close_active_period', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: period.id })
                    });
                    const data = await res.json();

                    if (data.success) {
                        showToast(data.mensaje || `Período "${period.nombre}" cerrado`, 'success');
                        if (window.dataHelpers && typeof window.dataHelpers.initData === 'function') {
                            await window.dataHelpers.initData();
                        } else if (typeof initData === 'function') {
                            await initData();
                        }
                        renderPeriods();
                    } else {
                        showToast(data.error || 'Error al cerrar el período', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Error de conexión al cerrar el período', 'error');
                }
                return;
            }

            const periodData = {
                nombre: period.nombre,
                fechaInicio: period.fecha_inicio || period.fechaInicio,
                fechaFin: period.fecha_fin || period.fechaFin,
                fechaMP1: period.fecha_mp1 || period.fechaMP1,
                fechaMP2: period.fecha_mp2 || period.fechaMP2,
                fechaMP3: period.fecha_mp3 || period.fechaMP3,
                estado: newEstado
            };

            const res = await updatePeriod(period.id, periodData);
            if (res && res.success) {
                showToast(`Período marcado como ${newEstado}`, 'info');
                renderPeriods();
            } else {
                showToast((res && res.error) || 'Error al cambiar el estado del período', 'error');
            }
        }
    }

    // ========== ACTUALIZAR SELECTOR DE NOTAS ==========
    function updatePeriodSelect() {
        const periodSelect = document.getElementById('grade-periodo');
        if (periodSelect) {
            const sortedPeriods = [...periods].sort((a, b) => {
                const dateA = new Date(a.fecha_inicio || a.fechaInicio);
                const dateB = new Date(b.fecha_inicio || b.fechaInicio);
                return dateB - dateA;
            });
            if (sortedPeriods.length === 0) {
                periodSelect.innerHTML = '<option value="">Periodos no inscritos</option>';
            } else {
                periodSelect.innerHTML = sortedPeriods.map(p => 
                    `<option value="${escHtml(p.nombre)}">${escHtml(p.nombre)}</option>`
                ).join('');
                periodSelect.value = sortedPeriods[0].nombre;
            }
        }
    }


    // ========== EVENT LISTENERS ==========
    addPeriodBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    // periodModal.addEventListener('click', (e) => { if (e.target === periodModal) closeModal(); });
    saveBtn.addEventListener('click', savePeriod);
    periodForm.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); savePeriod(); } });

    // Delegación para editar/eliminar períodos
    periodsTbody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-period');
        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            const period = periods.find(p => p.id === id);
            if (period) openModal(period);
        }
        const deleteBtn = e.target.closest('.delete-period');
        if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            deletePeriodHandler(id);
        }
        const toggleBtn = e.target.closest('.toggle-status');
        if (toggleBtn) {
            const id = parseInt(toggleBtn.dataset.id);
            togglePeriodStatus(id);
        }
    });

    // Validar fechas en tiempo real
    document.getElementById('period-fecha-inicio').addEventListener('change', () => {
        const inicio = document.getElementById('period-fecha-inicio').value;
        const fin = document.getElementById('period-fecha-fin');
        if (inicio && fin.value && new Date(inicio) >= new Date(fin.value)) {
            document.getElementById('period-fecha-fin-error').textContent = 'La fecha de fin debe ser posterior a la fecha de inicio';
            fin.classList.add('error');
        } else {
            document.getElementById('period-fecha-fin-error').textContent = '';
            fin.classList.remove('error');
        }
    });

    document.getElementById('period-fecha-fin').addEventListener('change', () => {
        const inicio = document.getElementById('period-fecha-inicio').value;
        const fin = document.getElementById('period-fecha-fin');
        if (inicio && fin.value && new Date(inicio) >= new Date(fin.value)) {
            document.getElementById('period-fecha-fin-error').textContent = 'La fecha de fin debe ser posterior a la fecha de inicio';
            fin.classList.add('error');
        } else {
            document.getElementById('period-fecha-fin-error').textContent = '';
            fin.classList.remove('error');
        }
    });

    // ========== FIN DE AÑO ESCOLAR ==========
    const endYearBtn = document.getElementById('end-school-year-btn');
    const endYearModal = document.getElementById('end-year-modal');
    const closeEndYearBtn = document.getElementById('close-end-year-modal');
    const cancelEndYearBtn = document.getElementById('cancel-end-year-btn');
    const confirmEndYearBtn = document.getElementById('confirm-end-year-btn');
    const confirmEndYearInput = document.getElementById('confirm-end-year-input');
    const endYearSelect = document.getElementById('end-year-period-select');

    if (endYearBtn && endYearModal) {
        endYearBtn.addEventListener('click', () => {
            if (endYearSelect) {
                const activePeriods = periods.filter(p => p.estado !== 'cerrado');
                if (activePeriods.length === 0) {
                    endYearSelect.innerHTML = '<option value="">No hay períodos activos para cerrar</option>';
                    confirmEndYearBtn.disabled = true;
                    confirmEndYearInput.disabled = true;
                } else {
                    endYearSelect.innerHTML = activePeriods.map(p => `<option value="${p.id}">${escHtml(p.nombre)}</option>`).join('');
                    confirmEndYearInput.disabled = false;
                }
            }

            confirmEndYearInput.value = '';
            confirmEndYearBtn.disabled = true;
            endYearModal.classList.add('active');
        });

        const closeEndYearModal = () => {
            endYearModal.classList.remove('active');
        };

        closeEndYearBtn.addEventListener('click', closeEndYearModal);
        cancelEndYearBtn.addEventListener('click', closeEndYearModal);

        confirmEndYearInput.addEventListener('input', (e) => {
            if (endYearSelect && endYearSelect.value) {
                confirmEndYearBtn.disabled = e.target.value.trim() !== 'CERRAR';
            }
        });

        confirmEndYearBtn.addEventListener('click', async () => {
            if (!endYearSelect || !endYearSelect.value) return;
            const periodId = endYearSelect.value;
            
            try {
                const res = await fetch('../api/main.php?action=close_active_period', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: periodId })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(data.mensaje || 'Año escolar finalizado. El período seleccionado ha sido cerrado.', 'success');
                    closeEndYearModal();
                    // Refrescar los datos globales para actualizar el estado de los períodos
                    if (typeof fetchData === 'function') {
                        await fetchData();
                        if (typeof renderAll === 'function') renderAll();
                    } else {
                        location.reload();
                    }
                } else {
                    showToast('Error: ' + data.error, 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Error al cerrar el año escolar', 'error');
            }
        });
    }

    // Inicializar
    renderPeriods();

    // Exponer para renderAll
    window.renderPeriods = renderPeriods;
});