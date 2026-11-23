// subjects.js
// Muestra y gestiona el pensum académico de cada mención (Asignaturas)

document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.getElementById('mentions-tabs-container');
    const subjectsContent = document.getElementById('subjects-content');
    const statsContainer = document.getElementById('subjects-stats');

    let currentActiveMentionId = null;

    // ========== RENDERIZADO DE PENSUM ==========

    // Crear pestañas de menciones
    function renderMentionsTabs() {
        if (!tabsContainer) return;
        const currentMentions = (typeof mentions !== 'undefined') ? mentions : (window.mentions || []);

        if (!currentMentions || currentMentions.length === 0) {
            tabsContainer.innerHTML = '<div style="padding:1rem;color:#94a3b8;font-size:0.9rem;">No hay menciones registradas</div>';
            if (subjectsContent) {
                subjectsContent.innerHTML = '<div class="empty-msg">No hay menciones disponibles para mostrar asignaturas</div>';
            }
            return;
        }

        // Mantener la mención seleccionada previamente si aún existe
        if (!currentActiveMentionId || !currentMentions.some(m => m.id == currentActiveMentionId)) {
            currentActiveMentionId = currentMentions[0].id;
        }

        let tabsHtml = '';
        currentMentions.forEach(mention => {
            const isActive = mention.id == currentActiveMentionId;
            const theme = (typeof getMentionColorAndIcon === 'function') 
                ? getMentionColorAndIcon(mention.id, mention.nombre, mention.color, mention.icono)
                : { color: mention.color || '#4a151b', icon: mention.icono || 'bx bx-category' };

            tabsHtml += `
                <button type="button" class="mention-tab ${isActive ? 'active' : ''}" data-mention-id="${mention.id}" style="${isActive ? `border-bottom-color: ${theme.color}; color: ${theme.color};` : ''}">
                    <i class='${theme.icon}' style="${isActive ? `color: ${theme.color};` : ''}"></i>
                    <span>${mention.nombre}</span>
                </button>
            `;
        });

        tabsContainer.innerHTML = tabsHtml;

        // Renderizar el pensum de la mención activa
        renderPensumByMencion(currentActiveMentionId);

        // Event listeners para las pestañas
        tabsContainer.querySelectorAll('.mention-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabsContainer.querySelectorAll('.mention-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentActiveMentionId = tab.dataset.mentionId;
                renderPensumByMencion(currentActiveMentionId);
            });
        });
    }

    // Renderizar el pensum completo de una mención
    function renderPensumByMencion(mentionId) {
        if (!subjectsContent) return;

        const currentMentions = (typeof mentions !== 'undefined') ? mentions : (window.mentions || []);
        const mention = currentMentions.find(m => m.id == mentionId);
        if (!mention) {
            subjectsContent.innerHTML = '<div class="empty-msg">Mención no encontrada</div>';
            return;
        }

        const años = [1, 2, 3, 4, 5, 6];
        let añosHtml = '';

        // Determinar el color e icono según la mención seleccionada
        const theme = (typeof getMentionColorAndIcon === 'function') 
            ? getMentionColorAndIcon(mention.id, mention.nombre, mention.color, mention.icono)
            : { color: mention.color || '#4a151b', icon: mention.icono || 'bx bx-category' };
        let colorHeader = theme.color;

        let totalAsignaturas = 0;

        años.forEach(anio => {
            const materias = (typeof getDetailedMateriasByMencionAndAnio === 'function')
                ? getDetailedMateriasByMencionAndAnio(parseInt(mentionId), anio)
                : (typeof getMateriasByMencionAndAnio === 'function' 
                    ? getMateriasByMencionAndAnio(parseInt(mentionId), anio).map(nom => ({ id: null, nombre: nom, area: 'general', isCustom: false }))
                    : []);
            
            totalAsignaturas += materias.length;
            const safeMentionNombre = (mention.nombre || '').replace(/"/g, '&quot;');

            añosHtml += `
                <div class="year-card" data-year="${anio}" style="border-top: 4px solid ${colorHeader}; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.06); display: flex; flex-direction: column;">
                    <div class="year-header" style="background: ${colorHeader}; color: #fff; padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display:flex;align-items:center;gap:0.4rem;">
                            <i class='bx bx-calendar' style="font-size:1.15rem;"></i>
                            <h3 style="margin:0;font-size:1rem;font-weight:700;color:#fff;">${anio}° Año</h3>
                        </div>
                        <div style="display:flex;align-items:center;gap:0.45rem;">
                            <span class="year-badge" style="background:rgba(255,255,255,0.22);color:#fff;padding:0.2rem 0.55rem;border-radius:12px;font-size:0.75rem;font-weight:600;">${materias.length} materias</span>
                            <button type="button" class="btn-quick-add-subject" data-mention-id="${mention.id}" data-year="${anio}" data-mention-name="${safeMentionNombre}" title="Añadir asignatura a ${anio}° Año" style="background:rgba(255,255,255,0.25);color:#fff;border:none;border-radius:6px;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.1rem;transition:all 0.15s ease;">
                                <i class='bx bx-plus'></i>
                            </button>
                        </div>
                    </div>
                    <div class="year-body" style="padding: 0.75rem 1rem; flex: 1;">
                        ${materias.length === 0 ? `
                            <div style="padding: 1.5rem 0.5rem; text-align: center; color: #94a3b8; font-size: 0.85rem;">
                                <i class='bx bx-book-open' style="font-size: 1.8rem; display: block; margin-bottom: 0.35rem; color: #cbd5e1;"></i>
                                Sin asignaturas registradas
                                <div style="margin-top: 0.75rem;">
                                    <button type="button" class="btn-quick-add-subject" data-mention-id="${mention.id}" data-year="${anio}" data-mention-name="${safeMentionNombre}" style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 0.45rem 0.85rem; font-size: 0.82rem; color: #334155; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; transition: background 0.15s;">
                                        <i class='bx bx-plus-circle' style="color: #2563eb; font-size: 1rem;"></i> Agregar Materia
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <ul class="subject-list" style="list-style: none; margin: 0; padding: 0;">
                                ${materias.map(m => {
                                    const isCustom = !!m.isCustom;
                                    const safeName = (m.nombre || '').replace(/"/g, '&quot;');
                                    let areaBadge = '';
                                    if (m.area === 'cientifica') {
                                        areaBadge = `<span style="font-size: 0.68rem; background: #fef3c7; color: #b45309; border: 1px solid #fde68a; border-radius: 4px; padding: 1px 5px; font-weight: 600;">Especialidad</span>`;
                                    } else if (m.area === 'practica') {
                                        areaBadge = `<span style="font-size: 0.68rem; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 4px; padding: 1px 5px; font-weight: 600;">Práctica</span>`;
                                    }
                                    return `
                                        <li style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9;">
                                            <div style="display: flex; align-items: flex-start; gap: 0.45rem; flex: 1; min-width: 0;">
                                                <i class='bx ${isCustom ? 'bx-bookmark-plus' : 'bx-check-circle'}' style="color: ${isCustom ? '#2563eb' : '#10b981'}; font-size: 1.05rem; margin-top: 2px; flex-shrink: 0;"></i>
                                                <span style="font-size: 0.86rem; color: #1e293b; font-weight: ${isCustom ? '600' : 'normal'}; line-height: 1.35; word-break: break-word;" title="${safeName}">
                                                    ${m.nombre}
                                                </span>
                                            </div>
                                            <div style="display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0;">
                                                ${areaBadge}
                                            </div>
                                        </li>
                                    `;
                                }).join('')}
                            </ul>
                        `}
                    </div>
                </div>
            `;
        });

        if (añosHtml) {
            subjectsContent.innerHTML = `
                <div class="subjects-year-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
                    ${añosHtml}
                </div>
            `;
        } else {
            subjectsContent.innerHTML = '<div class="empty-msg">No hay asignaturas para esta mención</div>';
        }
    }

    // Confirmación y eliminación de asignatura
    async function confirmarEliminarAsignatura(id, nombre, mentionId = null) {
        if (!id) return;

        const ejecutarBorrado = async () => {
            try {
                if (typeof window.deleteSubject === 'function') {
                    const res = await window.deleteSubject(id);
                    if (res && res.success) {
                        if (typeof showToast === 'function') {
                            showToast(`Asignatura "${nombre}" eliminada exitosamente`, 'success');
                        }
                        window.renderSubjects();
                        if (mentionId && typeof window.selectMentionDetail === 'function') {
                            window.selectMentionDetail(mentionId);
                        } else if (typeof window.renderMentionsMasterDetail === 'function') {
                            window.renderMentionsMasterDetail();
                        }
                    } else {
                        const errMsg = (res && res.error) ? res.error : 'No se pudo eliminar la asignatura';
                        if (typeof showToast === 'function') {
                            showToast(errMsg, 'error');
                        } else {
                            alert(errMsg);
                        }
                    }
                }
            } catch (err) {
                console.error("Error al eliminar asignatura:", err);
                if (typeof showToast === 'function') {
                    showToast('Error de conexión al eliminar la asignatura', 'error');
                }
            }
        };

        const msg = `¿Está seguro de eliminar la asignatura "${nombre}" del pensum?`;
        if (typeof showConfirm === 'function') {
            showConfirm({
                title: 'Eliminar Asignatura',
                message: msg + ' Si ya tiene notas registradas, el sistema impedirá su eliminación para proteger los datos.',
                confirmText: 'Sí, Eliminar',
                cancelText: 'Cancelar'
            }, ejecutarBorrado);
        } else if (confirm(msg)) {
            ejecutarBorrado();
        }
    }

    // Ocultar elementos no necesarios de versiones previas
    function ocultarElementosNoNecesarios() {
        const filterContainer = document.querySelector('#subjects-section .filter-container');
        if (filterContainer) filterContainer.style.display = 'none';

        const exportBtn = document.getElementById('export-subjects-btn');
        if (exportBtn) exportBtn.style.display = 'none';

        if (statsContainer) statsContainer.innerHTML = '';
    }

    // Exponer función de renderizado global
    window.renderSubjects = function() {
        renderMentionsTabs();
        ocultarElementosNoNecesarios();
    };

    // ========== MODAL DE ASIGNATURAS ==========

    // Poblar selector de menciones
    function poblarSelectorMenciones(selectedId = null) {
        const select = document.getElementById('subject-mencion-select');
        if (!select) return;
        const currentMentions = (typeof mentions !== 'undefined') ? mentions : (window.mentions || []);

        let opts = '<option value="">-- Seleccione una mención --</option>';
        currentMentions.forEach(m => {
            const isSel = (selectedId && String(m.id) === String(selectedId)) ? 'selected' : '';
            opts += `<option value="${m.id}" ${isSel}>${m.nombre}</option>`;
        });
        select.innerHTML = opts;
    }

    // Abrir modal con animación completa (modo creación)
    window.openSubjectModal = function(preselectedMentionId = null, preselectedYear = null) {
        const overlay = document.getElementById('subject-modal-overlay');
        if (!overlay) {
            console.error("No se encontró el elemento #subject-modal-overlay");
            return;
        }

        const form = document.getElementById('subject-form');
        const idInput = document.getElementById('subject-id');
        const title = document.getElementById('subject-modal-title');
        const mencionSelect = document.getElementById('subject-mencion-select');
        const anioSelect = document.getElementById('subject-anio-select');
        const nombreInput = document.getElementById('subject-nombre-input');
        const areaSelect = document.getElementById('subject-area-select');
        const saveSubjectBtn = document.getElementById('save-subject-btn');

        // Resetear formulario
        if (form) form.reset();
        if (idInput) idInput.value = '';
        if (title) title.textContent = 'Nueva Asignatura';
        if (saveSubjectBtn) {
            saveSubjectBtn.disabled = false;
            saveSubjectBtn.innerHTML = "<i class='bx bx-save'></i> Guardar Asignatura";
        }

        // Definir mención preseleccionada
        const currentMentions = (typeof mentions !== 'undefined') ? mentions : (window.mentions || []);
        const targetMentionId = preselectedMentionId || currentActiveMentionId || (currentMentions[0] ? currentMentions[0].id : null);
        
        poblarSelectorMenciones(targetMentionId);

        if (targetMentionId && mencionSelect) {
            mencionSelect.value = targetMentionId;
        }

        // Definir año preseleccionado
        if (preselectedYear && anioSelect) {
            anioSelect.value = String(preselectedYear);
        }

        if (areaSelect) {
            areaSelect.value = 'general';
        }

        // Mostrar overlay con animación garantizada
        overlay.style.display = 'flex';
        void overlay.offsetWidth; // Forzar reflow para transición
        overlay.classList.add('active');

        // Enfocar campo de nombre
        setTimeout(() => {
            if (nombreInput) nombreInput.focus();
        }, 150);
    };

    // Abrir modal en modo edición
    window.openEditSubjectModal = function(subjectId, subjectName, mentionId, year, area) {
        const overlay = document.getElementById('subject-modal-overlay');
        if (!overlay) {
            console.error("No se encontró el elemento #subject-modal-overlay");
            return;
        }

        const form = document.getElementById('subject-form');
        const idInput = document.getElementById('subject-id');
        const title = document.getElementById('subject-modal-title');
        const mencionSelect = document.getElementById('subject-mencion-select');
        const anioSelect = document.getElementById('subject-anio-select');
        const nombreInput = document.getElementById('subject-nombre-input');
        const areaSelect = document.getElementById('subject-area-select');
        const saveSubjectBtn = document.getElementById('save-subject-btn');

        if (form) form.reset();
        if (idInput) idInput.value = subjectId;
        if (title) title.textContent = 'Editar Asignatura';
        if (saveSubjectBtn) {
            saveSubjectBtn.disabled = false;
            saveSubjectBtn.innerHTML = "<i class='bx bx-save'></i> Guardar Cambios";
        }

        poblarSelectorMenciones(mentionId);

        if (mencionSelect && mentionId) {
            mencionSelect.value = String(mentionId);
        }
        if (anioSelect && year) {
            anioSelect.value = String(year);
        }
        if (nombreInput) {
            nombreInput.value = subjectName || '';
        }
        if (areaSelect && area) {
            areaSelect.value = area;
        }

        // Mostrar overlay con animación garantizada
        overlay.style.display = 'flex';
        void overlay.offsetWidth; // Forzar reflow para transición
        overlay.classList.add('active');

        // Enfocar y seleccionar el texto del nombre
        setTimeout(() => {
            if (nombreInput) {
                nombreInput.focus();
                nombreInput.select();
            }
        }, 150);
    };

    // Cerrar modal con animación
    window.closeSubjectModal = function() {
        const overlay = document.getElementById('subject-modal-overlay');
        if (!overlay) return;
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
            const form = document.getElementById('subject-form');
            if (form) form.reset();
        }, 250);
    };

    // ========== EVENT DELEGATION GLOBAL ==========
    document.addEventListener('click', (e) => {
        // Abrir modal general desde pensum
        if (e.target.closest('#open-subject-modal-btn')) {
            e.preventDefault();
            window.openSubjectModal(currentActiveMentionId);
            return;
        }

        // Abrir modal rápido por año o mención
        const quickAddBtn = e.target.closest('.btn-quick-add-subject');
        if (quickAddBtn) {
            e.preventDefault();
            const mId = quickAddBtn.dataset.mentionId;
            const anio = quickAddBtn.dataset.year;
            window.openSubjectModal(mId, anio);
            return;
        }

        // Botón "+ Asignatura" desde el master-detail de menciones
        const mentionAddBtn = e.target.closest('.add-subject-mention-btn');
        if (mentionAddBtn) {
            e.preventDefault();
            const mId = mentionAddBtn.dataset.id;
            window.openSubjectModal(mId);
            return;
        }

        // Botón editar asignatura
        const editBtn = e.target.closest('.btn-edit-subject');
        if (editBtn) {
            e.preventDefault();
            const id = parseInt(editBtn.dataset.subjectId);
            const nombre = editBtn.dataset.subjectName || '';
            const mId = parseInt(editBtn.dataset.mentionId);
            const anio = parseInt(editBtn.dataset.year);
            const area = editBtn.dataset.area || 'general';
            window.openEditSubjectModal(id, nombre, mId, anio, area);
            return;
        }

        // Botón eliminar asignatura (desde el panel de menciones)
        const delBtn = e.target.closest('.btn-delete-subject');
        if (delBtn) {
            e.preventDefault();
            const id = parseInt(delBtn.dataset.subjectId);
            const nombre = delBtn.dataset.subjectName || 'esta asignatura';
            const mId = delBtn.dataset.mentionId ? parseInt(delBtn.dataset.mentionId) : null;
            confirmarEliminarAsignatura(id, nombre, mId);
            return;
        }

        // Cerrar modal por botones de cerrar o cancelar
        if (e.target.closest('#close-subject-modal-btn') || e.target.closest('#cancel-subject-btn')) {
            e.preventDefault();
            window.closeSubjectModal();
            return;
        }

        // Click en el fondo del modal (overlay)
        const overlay = document.getElementById('subject-modal-overlay');
        if (overlay && e.target === overlay) {
            window.closeSubjectModal();
        }
    });

    // Tecla Escape para cerrar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('subject-modal-overlay');
            if (overlay && overlay.classList.contains('active')) {
                window.closeSubjectModal();
            }
        }
    });

    // Envío del formulario de asignatura
    const subjectForm = document.getElementById('subject-form');
    if (subjectForm) {
        subjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const subjectMencionSelect = document.getElementById('subject-mencion-select');
            const subjectAnioSelect = document.getElementById('subject-anio-select');
            const subjectNombreInput = document.getElementById('subject-nombre-input');
            const subjectAreaSelect = document.getElementById('subject-area-select');
            const subjectIdInput = document.getElementById('subject-id');
            const saveSubjectBtn = document.getElementById('save-subject-btn');

            const mencionId = parseInt(subjectMencionSelect ? subjectMencionSelect.value : 0);
            const anio = parseInt(subjectAnioSelect ? subjectAnioSelect.value : 0);
            const nombre = subjectNombreInput ? subjectNombreInput.value.trim() : '';
            const area = subjectAreaSelect ? subjectAreaSelect.value : 'general';
            const id = subjectIdInput && subjectIdInput.value ? parseInt(subjectIdInput.value) : null;

            if (!mencionId) {
                if (typeof showToast === 'function') showToast('Seleccione una mención válida', 'error');
                return;
            }

            if (!anio || anio < 1 || anio > 6) {
                if (typeof showToast === 'function') showToast('Seleccione el año escolar (1° a 6° año)', 'error');
                return;
            }

            if (!nombre) {
                if (typeof showToast === 'function') showToast('Ingrese el nombre de la asignatura', 'error');
                return;
            }

            // Deshabilitar botón mientras procesa
            if (saveSubjectBtn) {
                saveSubjectBtn.disabled = true;
                saveSubjectBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Guardando...";
            }

            try {
                let res;
                if (id) {
                    res = await window.updateSubject(id, { mencion_id: mencionId, anio, nombre, area });
                } else {
                    res = await window.addSubject({ mencion_id: mencionId, anio, nombre, area });
                }

                if (res && res.success) {
                    const successMsg = id 
                        ? `Asignatura "${nombre}" actualizada exitosamente` 
                        : `Asignatura "${nombre}" guardada con éxito en el pensum`;
                    if (typeof showToast === 'function') {
                        showToast(successMsg, 'success');
                    }
                    window.closeSubjectModal();
                    
                    // Mantener activa la mención a la que se le agregó o modificó la materia
                    currentActiveMentionId = mencionId;
                    window.renderSubjects();

                    // Si existe el panel de menciones, actualizarlo manteniendo la mención seleccionada
                    if (typeof window.selectMentionDetail === 'function') {
                        window.selectMentionDetail(mencionId);
                    } else if (typeof window.renderMentionsMasterDetail === 'function') {
                        window.renderMentionsMasterDetail();
                    }
                } else {
                    const errorMsg = (res && res.error) ? res.error : 'Error al guardar la asignatura';
                    if (typeof showToast === 'function') {
                        showToast(errorMsg, 'error');
                    } else {
                        alert(errorMsg);
                    }
                }
            } catch (err) {
                console.error("Error al guardar asignatura:", err);
                if (typeof showToast === 'function') {
                    showToast('Error de conexión con el servidor', 'error');
                }
            } finally {
                if (saveSubjectBtn) {
                    saveSubjectBtn.disabled = false;
                    saveSubjectBtn.innerHTML = id ? "<i class='bx bx-save'></i> Guardar Cambios" : "<i class='bx bx-save'></i> Guardar Asignatura";
                }
            }
        });
    }

    // Inicializar
    window.renderSubjects();
});
