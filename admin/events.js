/**
 * events.js
 * CONTROLADOR DE EVENTOS DEL PANEL DE ADMINISTRACIÓN
 *
 * Centraliza todos los `addEventListener` de la interfaz del panel de Admin.
 * Se apoya en las funciones CRUD de otros módulos y en `render.js` para actualizar la UI.
 * Utiliza delegación de eventos en `document.body` para manejar los botones de
 * filas dinámicamente generadas por `render.js` (editar, eliminar).
 */

document.addEventListener('DOMContentLoaded', () => {
    // Botones de agregar usuario (solo para compatibilidad, ya no se usa prompt)
    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        showToast('Use los botones específicos para agregar profesores o administradores.', 'info');
    });

    document.getElementById('add-teacher-btn')?.addEventListener('click', () => {
        // El modal se abre automáticamente desde admin-profesores-modal.js
    });

    document.getElementById('add-student-btn')?.addEventListener('click', () => {
        // El modal se abre automáticamente desde estudiantes-modal.js
    });

    document.getElementById('add-admin-btn')?.addEventListener('click', () => {
        showToast('Solo el Superadministrador puede registrar administradores.', 'warning');
    });

    // Botón + Nuevo Profesor (Gestión de usuarios general)
    const btnNewUserGen = document.getElementById('btn-new-user-general');
    if (btnNewUserGen) {
        btnNewUserGen.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof TeacherModalManager !== 'undefined' && TeacherModalManager.open) {
                TeacherModalManager.open();
            } else {
                document.getElementById('add-teacher-btn')?.click();
            }
        });
    }

    // Formulario de secciones
    document.getElementById('section-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const anioSelect = document.getElementById('section-year');
        const letraSelect = document.getElementById('section-letter');
        const mentionId = document.getElementById('section-mention').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        let errors = [];
        const profSelect = document.getElementById('section-profesor-guia-id');
        const profGuiaId = profSelect && profSelect.value ? parseInt(profSelect.value) : null;
        const selectedOpt = profSelect?.selectedOptions[0];
        let profNombre = selectedOpt ? (selectedOpt.getAttribute('data-nombre') || selectedOpt.text.split(' (')[0].trim()) : '';

        if (!anioSelect.value) { anioSelect.classList.add('error'); errors.push('Año'); }
        if (!letraSelect.value) { letraSelect.classList.add('error'); errors.push('Letra'); }
        const mentionSelect = document.getElementById('section-mention');
        if (!mentionId) { mentionSelect.classList.add('error'); errors.push('Mención'); }
        if (!profGuiaId && !profNombre) {
            if (profSelect) profSelect.classList.add('error');
            errors.push('Profesor Guía');
        }

        if (errors.length > 0) {
            showToast(`Falta completar: ${errors.join(', ')}`, 'error');
            return;
        }

        // Remover clases de error previo
        [anioSelect, letraSelect, mentionSelect].forEach(el => el.classList.remove('error'));
        if (profSelect) profSelect.classList.remove('error');

        // Construir nombre de sección (ej: "2do Año A")
        const año = anioSelect.value;  // e.g. "2do"
        const letra = letraSelect.value;
        const nombreSeccion = `${año} Año ${letra}`;

        // Validación de duplicados (Frontend)
        if (typeof sections !== 'undefined') {
            const duplicado = sections.some(s => s.nombre === nombreSeccion && s.mencion_id == mentionId && s.id !== window.editingSectionId);
            if (duplicado) {
                showToast(`La sección "${nombreSeccion}" ya existe para esta mención`, 'warning');
                return;
            }
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'Guardando...';
            }

            let res;
            if (window.editingSectionId) {
                res = await updateSection(window.editingSectionId, nombreSeccion, mentionId, profNombre, profGuiaId);
            } else {
                res = await addSection(nombreSeccion, mentionId, profNombre, profGuiaId);
            }
            
            if (res.success) {
                showToast(window.editingSectionId ? `Sección ${nombreSeccion} actualizada exitosamente` : `Sección ${nombreSeccion} añadida exitosamente`);
                // Limpiar formulario
                anioSelect.value = '';
                letraSelect.value = '';
                document.getElementById('section-mention').value = '';
                if (profSelect) profSelect.value = '';
                window.editingSectionId = null;
                // Cerrar modal
                if (typeof window.closeSectionModal === 'function') window.closeSectionModal();
            } else {
                showToast(res.error || 'Error al guardar la sección', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error al procesar la solicitud', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Guardar Sección';
            }
        }
    });

    // Limpiar errores cuando el usuario cambie los valores
    ['section-year', 'section-letter', 'section-mention'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', (e) => {
            e.target.classList.remove('error');
        });
    });

    // Filtro de menciones en la sección de secciones
    document.getElementById('mention-filter')?.addEventListener('change', () => {
        renderSections();
    });

    // ========== MODAL MENCIONES ==========
    window.editingMentionId = null;

    // ========== MODAL DE MENCIÓN (CON SELECCIÓN DE COLOR E ÍCONO) ==========
    const MENTION_COLORS = [
        { color: '#b45309', name: 'Ámbar' },
        { color: '#4338ca', name: 'Índigo' },
        { color: '#047857', name: 'Esmeralda' },
        { color: '#b91c1c', name: 'Rojo Rubí' },
        { color: '#7c3aed', name: 'Púrpura' },
        { color: '#0284c7', name: 'Cian Azul' },
        { color: '#db2777', name: 'Rosa' },
        { color: '#ea580c', name: 'Naranja' },
        { color: '#0d9488', name: 'Turquesa' },
        { color: '#4a151b', name: 'Vino Tinto' },
        { color: '#334155', name: 'Pizarra' },
        { color: '#ca8a04', name: 'Dorado' }
    ];

    const MENTION_ICONS = [
        { icon: 'bx bx-category', name: 'General' },
        { icon: 'bx bx-bolt-circle', name: 'Electricidad' },
        { icon: 'bx bx-cog', name: 'Mecánica' },
        { icon: 'bx bx-test-tube', name: 'Química' },
        { icon: 'bx bx-shield-quarter', name: 'Seguridad' },
        { icon: 'bx bx-laptop', name: 'Informática' },
        { icon: 'bx bx-calculator', name: 'Contabilidad' },
        { icon: 'bx bx-hard-hat', name: 'Construcción' },
        { icon: 'bx bx-wrench', name: 'Mantenimiento' },
        { icon: 'bx bx-car', name: 'Automotriz' },
        { icon: 'bx bx-dna', name: 'Salud/Bio' },
        { icon: 'bx bx-palette', name: 'Diseño' },
        { icon: 'bx bx-briefcase', name: 'Gerencia' },
        { icon: 'bx bx-chip', name: 'Robótica' },
        { icon: 'bx bx-leaf', name: 'Agronomía' },
        { icon: 'bx bx-book-bookmark', name: 'Educación' },
        { icon: 'bx bx-broadcast', name: 'Telecom' },
        { icon: 'bx bx-restaurant', name: 'Gastronomía' }
    ];

    function actualizarPreviewMencion(color, iconClass, iconName = '') {
        const previewCard = document.getElementById('mention-preview-card');
        const previewBox = document.getElementById('mention-preview-icon-box');
        const previewIcon = document.getElementById('mention-preview-icon');
        const previewName = document.getElementById('mention-preview-name');
        const inputName = document.getElementById('mention-name');
        const colorVal = document.getElementById('mention-color-val');
        const iconVal = document.getElementById('mention-icon-val');
        const colorInput = document.getElementById('mention-color');
        const iconInput = document.getElementById('mention-icono');

        if (colorInput) colorInput.value = color;
        if (iconInput) iconInput.value = iconClass;

        if (previewCard) previewCard.style.borderLeftColor = color;
        if (previewBox) previewBox.style.background = color;
        if (previewIcon) previewIcon.className = iconClass;
        if (previewName) previewName.textContent = (inputName && inputName.value.trim()) ? inputName.value.trim() : 'Nombre de la Mención';
        if (colorVal) colorVal.textContent = color;
        if (iconVal && iconName) iconVal.textContent = iconName;
    }

    function renderizarPaletaColores(currentColor) {
        const container = document.getElementById('mention-color-palette');
        if (!container) return;

        let html = '';
        MENTION_COLORS.forEach(c => {
            const isSelected = c.color.toLowerCase() === currentColor.toLowerCase();
            html += `
                <button type="button" class="color-swatch-btn ${isSelected ? 'selected' : ''}" 
                    data-color="${c.color}" data-name="${c.name}" title="${c.name} (${c.color})"
                    style="width:30px; height:30px; border-radius:50%; background:${c.color}; border: ${isSelected ? '3px solid #1e293b' : '2px solid #fff'}; box-shadow: 0 1px 3px rgba(0,0,0,0.25); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:transform 0.15s, border 0.15s; outline:none; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};">
                    ${isSelected ? "<i class='bx bx-check' style='color:#fff;font-size:1rem;font-weight:bold;'></i>" : ''}
                </button>
            `;
        });

        // Picker nativo para color personalizado
        html += `
            <div style="display:inline-flex; align-items:center; gap:0.35rem; margin-left:0.4rem; padding:0.2rem 0.5rem; background:#fff; border:1px solid #cbd5e1; border-radius:20px;">
                <input type="color" id="mention-custom-color" value="${currentColor}" title="Elegir cualquier color personalizado" style="width:24px; height:24px; border:none; border-radius:50%; cursor:pointer; background:none; padding:0;">
                <label for="mention-custom-color" style="font-size:0.75rem; color:#475569; cursor:pointer; font-weight:500;">Más colores</label>
            </div>
        `;

        container.innerHTML = html;

        // Listeners para swatches
        container.querySelectorAll('.color-swatch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const col = btn.dataset.color;
                const iconInput = document.getElementById('mention-icono');
                renderizarPaletaColores(col);
                actualizarPreviewMencion(col, iconInput ? iconInput.value : 'bx bx-category');
            });
        });

        // Listener para input de color personalizado
        const customCol = document.getElementById('mention-custom-color');
        if (customCol) {
            customCol.addEventListener('input', (e) => {
                const col = e.target.value;
                const iconInput = document.getElementById('mention-icono');
                // Desmarcar swatches
                container.querySelectorAll('.color-swatch-btn').forEach(b => {
                    b.classList.remove('selected');
                    b.style.border = '2px solid #fff';
                    b.style.transform = 'scale(1)';
                    b.innerHTML = '';
                });
                actualizarPreviewMencion(col, iconInput ? iconInput.value : 'bx bx-category');
            });
        }
    }

    function renderizarPaletaIconos(currentIcon, currentColor) {
        const container = document.getElementById('mention-icon-palette');
        if (!container) return;

        let html = '';
        MENTION_ICONS.forEach(ic => {
            const isSelected = ic.icon === currentIcon;
            html += `
                <div class="icon-tile-btn ${isSelected ? 'selected' : ''}" data-icon="${ic.icon}" data-name="${ic.name}"
                    style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0.45rem 0.2rem; border-radius:8px; border: ${isSelected ? `2px solid ${currentColor}` : '1px solid #e2e8f0'}; background:${isSelected ? '#ffffff' : '#f8fafc'}; cursor:pointer; transition:all 0.15s; box-shadow:${isSelected ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'};">
                    <i class='${ic.icon}' style="font-size:1.35rem; color:${isSelected ? currentColor : '#475569'};"></i>
                    <span style="font-size:0.65rem; color:${isSelected ? '#0f172a' : '#64748b'}; margin-top:2px; font-weight:${isSelected ? '700' : '500'}; text-align:center; line-height:1.1; overflow:hidden; text-overflow:ellipsis; max-width:100%; white-space:nowrap;">${ic.name}</span>
                </div>
            `;
        });

        container.innerHTML = html;

        // Listeners para tiles
        container.querySelectorAll('.icon-tile-btn').forEach(tile => {
            tile.addEventListener('click', () => {
                const iconClass = tile.dataset.icon;
                const iconName = tile.dataset.name;
                const colorInput = document.getElementById('mention-color');
                const col = colorInput ? colorInput.value : '#4a151b';
                renderizarPaletaIconos(iconClass, col);
                actualizarPreviewMencion(col, iconClass, iconName);
            });
        });
    }

    window.openMentionModal = function(id = null) {
        window.editingMentionId = id ? parseInt(id) : null;
        const title = document.getElementById('mention-modal-title');
        const inputName = document.getElementById('mention-name');
        const inputId = document.getElementById('mention-id');

        let selectedColor = '#4a151b';
        let selectedIcon = 'bx bx-category';
        let selectedIconName = 'General';

        if (id) {
            const m = (typeof mentions !== 'undefined' ? mentions : []).find(item => item.id == id);
            if (title) title.textContent = 'Editar Mención';
            if (inputName) inputName.value = m ? m.nombre : '';
            if (inputId) inputId.value = id;

            if (m) {
                const theme = (typeof window.getMentionColorAndIcon === 'function')
                    ? window.getMentionColorAndIcon(m.id, m.nombre, m.color, m.icono)
                    : { color: m.color || '#4a151b', icon: m.icono || 'bx bx-category' };
                selectedColor = theme.color;
                selectedIcon = theme.icon;
                const matchedIc = MENTION_ICONS.find(ic => ic.icon === selectedIcon);
                if (matchedIc) selectedIconName = matchedIc.name;
            }
        } else {
            if (title) title.textContent = 'Nueva Mención';
            if (inputName) inputName.value = '';
            if (inputId) inputId.value = '';

            // Color por defecto dinámico según cantidad de menciones actuales
            const existingCount = (typeof mentions !== 'undefined') ? mentions.length : 0;
            const defaultSwatch = MENTION_COLORS[existingCount % MENTION_COLORS.length];
            selectedColor = defaultSwatch ? defaultSwatch.color : '#4a151b';
            selectedIcon = 'bx bx-category';
        }

        // Renderizar paletas interactivas
        renderizarPaletaColores(selectedColor);
        renderizarPaletaIconos(selectedIcon, selectedColor);
        actualizarPreviewMencion(selectedColor, selectedIcon, selectedIconName);

        // Listener en tiempo real al escribir el nombre
        if (inputName) {
            inputName.oninput = () => {
                const col = document.getElementById('mention-color')?.value || selectedColor;
                const ic = document.getElementById('mention-icono')?.value || selectedIcon;
                actualizarPreviewMencion(col, ic);
            };
        }

        const overlay = document.getElementById('mention-modal-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            void overlay.offsetWidth;
            overlay.classList.add('active');
        }
        setTimeout(() => inputName?.focus(), 150);
    };

    window.closeMentionModal = function() {
        const overlay = document.getElementById('mention-modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 250);
        }
        window.editingMentionId = null;
        const form = document.getElementById('mention-form');
        if (form) form.reset();
    };

    document.getElementById('open-mention-modal-btn')?.addEventListener('click', () => window.openMentionModal());
    document.getElementById('close-mention-modal-btn')?.addEventListener('click', () => window.closeMentionModal());
    document.getElementById('cancel-mention-btn')?.addEventListener('click', () => window.closeMentionModal());
    document.getElementById('mention-modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) window.closeMentionModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mentionOverlay = document.getElementById('mention-modal-overlay');
            if (mentionOverlay && mentionOverlay.classList.contains('active')) {
                window.closeMentionModal();
            }
        }
    });

    document.getElementById('mention-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('save-mention-btn');
        const nameInput = document.getElementById('mention-name');
        const colorInput = document.getElementById('mention-color');
        const iconInput = document.getElementById('mention-icono');

        const nombre = nameInput ? nameInput.value.trim() : '';
        const color = colorInput ? colorInput.value : '#4a151b';
        const icono = iconInput ? iconInput.value : 'bx bx-category';

        if (!nombre) {
            showToast('El nombre de la mención es obligatorio', 'error');
            nameInput?.focus();
            return;
        }

        // Validación frontend de duplicados
        if (typeof mentions !== 'undefined') {
            const dup = mentions.some(m => m.nombre.trim().toLowerCase() === nombre.toLowerCase() && m.id != window.editingMentionId);
            if (dup) {
                showToast(`Ya existe una mención registrada con el nombre "${nombre}"`, 'warning');
                return;
            }
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Guardando...";
            }

            let res;
            const wasEditing = Boolean(window.editingMentionId);
            const payload = { nombre, color, icono };

            if (wasEditing) {
                res = await updateMention(window.editingMentionId, payload);
            } else {
                res = await addMention(payload);
            }

            if (res && res.success) {
                showToast(wasEditing ? 'Mención actualizada exitosamente' : 'Mención creada exitosamente con su distintivo', 'success');
                window.closeMentionModal();
                if (!wasEditing && typeof mentions !== 'undefined') {
                    const newM = mentions.find(m => m.nombre.trim().toLowerCase() === nombre.toLowerCase());
                    if (newM && typeof selectedMentionId !== 'undefined') {
                        selectedMentionId = newM.id;
                    }
                }
                if (typeof renderMentions === 'function') {
                    renderMentions();
                }
                if (typeof renderSubjects === 'function') {
                    renderSubjects();
                }
            } else {
                showToast((res && res.error) || 'Error al guardar la mención', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error de conexión al procesar la mención', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "<i class='bx bx-save'></i> Guardar Mención";
            }
        }
    });

    /**
     * Delegación de eventos en `document.body`.
     * En lugar de asignar listeners a cada botón generado dinámicamente,
     * capturamos todos los clics en el body y verificamos a qué elemento
     * pertenece usando `.closest()`. Esto es más eficiente con tablas que se
     * re-renderizan frecuentemente (los listeners no se pierden).
     */
    document.body.addEventListener('click', (e) => {
        // Editar usuario general - abre modal según rol
        if (e.target.closest('.edit-user')) {
            const id = parseInt(e.target.closest('.edit-user').dataset.id);
            const user = users.find(u => u.id === id);
            if (!user) return;
            
            if (user.rol === 'teacher') {
                if (window.openEditTeacherModal) window.openEditTeacherModal(id);
            } else if (user.rol === 'admin') {
                showToast('Solo el Superadministrador puede modificar administradores.', 'warning');
            } else {
                // Fallback (no debería ocurrir)
                const newData = {};
                const cedula = prompt('Cédula:', user.cedula);
                if (cedula !== null) newData.cedula = cedula;
                const nombre = prompt('Nombre:', user.nombre);
                if (nombre !== null) newData.nombre = nombre;
                const apellido = prompt('Apellido:', user.apellido);
                if (apellido !== null) newData.apellido = apellido;
                const email = prompt('Email:', user.email);
                if (email !== null) newData.email = email;
                const telefono = prompt('Teléfono:', user.telefono);
                if (telefono !== null) newData.telefono = telefono;
                updateUser(id, newData);
            }
        }
        // Bloqueo de eliminación de usuarios/profesores (solo permitido en Superadmin)
        if (e.target.closest('.delete-user') || e.target.closest('.delete-teacher')) {
            showToast('Acción restringida: Solo el Superadministrador puede eliminar profesores. Puede inhabilitarlo en su lugar.', 'warning');
        }

        // Inhabilitar / Habilitar profesor
        if (e.target.closest('.toggle-teacher-status')) {
            const btn = e.target.closest('.toggle-teacher-status');
            const id = parseInt(btn.dataset.id);
            const nuevoEstado = parseInt(btn.dataset.activo);
            const t = users.find(u => u.id == id);
            const nombre = t ? `${t.nombre} ${t.apellido}`.trim() : 'profesor';
            const accionTexto = nuevoEstado === 0 ? 'inhabilitar' : 'habilitar';
            const advertencia = nuevoEstado === 0 
                ? '\n\nNota: El profesor no podrá iniciar sesión ni cargar calificaciones mientras permanezca inhabilitado.'
                : '';
            
            if (confirm(`¿Confirma que desea ${accionTexto} al profesor "${nombre}"?${advertencia}`)) {
                if (typeof toggleUserStatus === 'function') {
                    toggleUserStatus(id, nuevoEstado).then(res => {
                        if (res && res.success) {
                            showToast(`Profesor ${nuevoEstado === 0 ? 'inhabilitado' : 'habilitado'} exitosamente`, 'success');
                            if (typeof renderAll === 'function') renderAll();
                        } else {
                            showToast('Error al actualizar: ' + (res?.error || 'Error desconocido'), 'error');
                        }
                    });
                } else {
                    showToast('Función toggleUserStatus no disponible', 'error');
                }
            }
        }

        // Editar profesor - usa modal
        if (e.target.closest('.edit-teacher')) {
            const id = parseInt(e.target.closest('.edit-teacher').dataset.id);
            if (window.openEditTeacherModal) {
                window.openEditTeacherModal(id);
            }
        }

        // Editar estudiante - usa modal
        if (e.target.closest('.edit-student')) {
            const id = parseInt(e.target.closest('.edit-student').dataset.id);
            if (window.openEditStudentModal) {
                window.openEditStudentModal(id);
            }
        }

        // Ver perfil completo del estudiante
        if (e.target.closest('.view-student-profile')) {
            const id = parseInt(e.target.closest('.view-student-profile').dataset.id);
            if (typeof window.openStudentProfileModal === 'function') {
                window.openStudentProfileModal(id);
            } else {
                showToast('El módulo de perfil no está cargado', 'error');
            }
        }

        // Inhabilitar / Habilitar estudiante
        if (e.target.closest('.toggle-student-status')) {
            const btn = e.target.closest('.toggle-student-status');
            const id = parseInt(btn.dataset.id);
            const nuevoEstado = parseInt(btn.dataset.activo);
            const st = (typeof students !== 'undefined' && Array.isArray(students)) ? students.find(s => s.id == id) : null;
            const nombre = st ? `${st.apellido || ''} ${st.nombre || ''}`.trim() : 'estudiante';
            const accionTexto = nuevoEstado === 0 ? 'inhabilitar' : 'habilitar';
            const advertencia = nuevoEstado === 0 
                ? '\n\nNota: El estudiante figurará como inhabilitado en la institución y no se contemplará en la carga activa de calificaciones.'
                : '';
            
            if (confirm(`¿Confirma que desea ${accionTexto} al estudiante "${nombre}"?${advertencia}`)) {
                if (typeof toggleStudentStatus === 'function') {
                    toggleStudentStatus(id, nuevoEstado).then(res => {
                        if (res && res.success) {
                            showToast(`Estudiante ${nuevoEstado === 0 ? 'inhabilitado' : 'habilitado'} exitosamente`, 'success');
                            if (typeof renderStudentsWithFilters === 'function') renderStudentsWithFilters();
                            else if (typeof renderAll === 'function') renderAll();
                        } else {
                            showToast('Error al actualizar: ' + (res?.error || 'Error desconocido'), 'error');
                        }
                    });
                } else {
                    showToast('Función toggleStudentStatus no disponible', 'error');
                }
            }
        }

        // Bloqueo de eliminación de estudiantes (solo permitido en Superadmin)
        if (e.target.closest('.delete-student')) {
            showToast('Acción restringida: Solo el Superadministrador tiene permisos para eliminar estudiantes del sistema. Puede inhabilitarlo en su lugar.', 'warning');
        }

        // Intentos de editar o eliminar admin desde el panel de administración
        if (e.target.closest('.edit-admin')) {
            showToast('Solo el Superadministrador puede modificar administradores.', 'warning');
        }
        if (e.target.closest('.delete-admin')) {
            showToast('Solo el Superadministrador puede eliminar administradores.', 'warning');
        }

        // Promover la sección al año siguiente
        if (e.target.closest('.promote-section')) {
            const id = parseInt(e.target.closest('.promote-section').dataset.id);
            if (typeof window.abrirPromocion === 'function') {
                window.abrirPromocion(id);
            }
            return;
        }

        // Editar sección
        if (e.target.closest('.edit-section')) {
            const id = parseInt(e.target.closest('.edit-section').dataset.id);
            const section = sections.find(s => s.id == id);
            if (!section) return;

            window.editingSectionId = id;
            const title = document.getElementById('section-modal-title');
            if (title) title.textContent = 'Editar Sección';

            // Separar año y letra (ej: "2do Año A")
            const parts = section.nombre.split(" Año ");
            if (parts.length === 2) {
                document.getElementById('section-year').value = parts[0];
                document.getElementById('section-letter').value = parts[1];
            } else {
                document.getElementById('section-year').value = '';
                document.getElementById('section-letter').value = '';
            }

            document.getElementById('section-mention').value = section.mencion_id || '';
            const hiddenProfName = document.getElementById('section-profesor-guia-nombre');
            if (hiddenProfName) hiddenProfName.value = section.profesor_guia_nombre || '';

            if (typeof window.populateGuideTeachersSelect === 'function') {
                window.populateGuideTeachersSelect(section.profesor_guia_id, section.profesor_guia_nombre);
            }

            // Abrir modal
            const overlay = document.getElementById('section-modal-overlay');
            if (overlay) { 
                overlay.style.display = 'flex'; 
                requestAnimationFrame(() => overlay.classList.add('active')); 
            }
        }
        // Eliminar sección con validaciones completas
        if (e.target.closest('.delete-section')) {
            const id = parseInt(e.target.closest('.delete-section').dataset.id);
            const section = (typeof sections !== 'undefined') ? sections.find(s => s.id == id) : null;
            const nombreSec = section ? section.nombre : `Sección #${id}`;

            // Validación 1: Verificar si tiene estudiantes inscritos
            const countStudents = (typeof students !== 'undefined') 
                ? students.filter(st => (st.seccion_id == id || st.seccion == id)).length 
                : 0;

            if (countStudents > 0) {
                showToast(`No se puede eliminar "${nombreSec}". Tiene ${countStudents} estudiante(s) inscrito(s). Reasigna o retira a los alumnos primero.`, 'warning');
                return;
            }

            // Validación 2: Verificar si tiene notas registradas
            const countGrades = (typeof grades !== 'undefined') 
                ? grades.filter(g => g.seccion_id == id).length 
                : 0;

            if (countGrades > 0) {
                showToast(`No se puede eliminar "${nombreSec}". Contiene ${countGrades} registro(s) de notas académicas asociadas.`, 'warning');
                return;
            }

            const doDeleteSection = async () => {
                try {
                    const res = await deleteSection(id);
                    if (res && res.success) {
                        showToast(`Sección "${nombreSec}" eliminada exitosamente`, 'success');
                    } else {
                        showToast((res && res.error) || 'No se pudo eliminar la sección', 'error');
                    }
                } catch (err) {
                    console.error('[Sección] Error al eliminar:', err);
                    showToast('Error al procesar la eliminación de la sección', 'error');
                }
            };

            const confirmMsg = `¿Está seguro de eliminar la sección "${nombreSec}"? Esta acción es irreversible.`;
            if (typeof showConfirm === 'function') {
                showConfirm({
                    title: 'Eliminar Sección',
                    message: confirmMsg,
                    confirmText: 'Sí, Eliminar',
                    cancelText: 'Cancelar'
                }, doDeleteSection);
            } else if (confirm(confirmMsg)) {
                doDeleteSection();
            }
        }

        // Editar mención
        if (e.target.closest('.edit-mention-btn')) {
            const btn = e.target.closest('.edit-mention-btn');
            const id = parseInt(btn.dataset.id);
            if (id && window.openMentionModal) {
                window.openMentionModal(id);
            }
        }

        // Eliminar mención
        if (e.target.closest('.delete-mention-btn')) {
            const btn = e.target.closest('.delete-mention-btn');
            const id = parseInt(btn.dataset.id);
            const nombre = btn.dataset.nombre || 'esta mención';

            const doDelete = async () => {
                try {
                    const res = await deleteMention(id);
                    if (res && res.success) {
                        showToast(`Mención "${nombre}" eliminada exitosamente`, 'success');
                        if (typeof selectedMentionId !== 'undefined' && selectedMentionId == id) {
                            selectedMentionId = null;
                        }
                    } else {
                        showToast((res && res.error) || 'No se pudo eliminar la mención', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Error al intentar eliminar la mención', 'error');
                }
            };

            if (typeof showConfirm === 'function') {
                showConfirm({
                    title: 'Eliminar Mención',
                    message: `¿Está seguro de eliminar la mención "${nombre}"? Esta acción solo se completará si la mención no tiene secciones asignadas.`,
                    confirmText: 'Sí, Eliminar',
                    cancelText: 'Cancelar'
                }, doDelete);
            } else if (confirm(`¿Está seguro de eliminar la mención "${nombre}"?`)) {
                doDelete();
            }
        }

        // Detalle de sección al hacer click en la tarjeta (excluyendo acciones de editar/eliminar)
        if (e.target.closest('.section-card-clickable') && !e.target.closest('.edit-section') && !e.target.closest('.delete-section') && !e.target.closest('.promote-section')) {
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

    document.getElementById('grid-add-student-btn')?.addEventListener('click', () => {
        if (window.currentDetailSectionId) {
            window.closeSectionDetailModal();
            if (typeof window.openAddStudentModal === 'function') {
                window.openAddStudentModal(window.currentDetailSectionId);
            } else {
                document.getElementById('add-student-btn')?.click();
            }
        }
    });
});

/**
 * Abre el modal de detalle de una sección específica.
 * Muestra estudiantes y profesores asignados a esa sección en pestañas.
 * @param {number} sectionId - ID de la sección a mostrar
 */
window.openSectionDetailModal = function(sectionId) {
    const section = sections.find(s => s.id == sectionId);
    if (!section) return;

    window.currentDetailSectionId = sectionId;

    // 1. Establecer datos de texto
    const nameEl = document.getElementById('detail-section-name');
    const mentionEl = document.getElementById('detail-section-mention');
    const guideEl = document.getElementById('detail-section-guide');

    if (nameEl) nameEl.textContent = section.nombre;
    
    const mentionObj = mentions.find(m => m.id == section.mencion_id);
    if (mentionEl) mentionEl.textContent = `Mención: ${mentionObj ? mentionObj.nombre : 'Ninguna'}`;

    let guideText = 'Sin Asignar';
    let guideUser = null;
    if (section.profesor_guia_id && typeof users !== 'undefined') {
        guideUser = users.find(usr => usr.id == section.profesor_guia_id);
    }
    if (!guideUser && section.profesor_guia_nombre && typeof users !== 'undefined') {
        guideUser = users.find(usr => `${usr.nombre} ${usr.apellido}`.trim().toLowerCase() === section.profesor_guia_nombre.trim().toLowerCase());
    }

    if (guideUser) {
        const rolTxt = guideUser.tipo_docente === 'solo_guia' ? 'Solo Guía' : 'Docente y Guía';
        guideText = `${guideUser.nombre} ${guideUser.apellido} (${rolTxt})`;
    } else if (section.profesor_guia_nombre) {
        guideText = section.profesor_guia_nombre;
    }
    if (guideEl) guideEl.textContent = `Profesor Guía: ${guideText}`;

    const sdGuideTeacherName = document.getElementById('sd-guide-teacher-name');
    if (sdGuideTeacherName) sdGuideTeacherName.textContent = guideText;

    // 2. Poblar Estudiantes
    const studentTbody = document.getElementById('detail-students-tbody');
    const filteredStudents = students.filter(s => (s.seccion_id == sectionId || s.seccion == sectionId));
    
    const countStudentsSpan = document.getElementById('detail-students-count');
    if (countStudentsSpan) countStudentsSpan.textContent = filteredStudents.length;

    if (studentTbody) {
        if (filteredStudents.length === 0) {
            studentTbody.innerHTML = `<tr><td colspan="4" class="empty-msg" style="text-align:center;">No hay estudiantes inscritos en esta sección.</td></tr>`;
        } else {
            studentTbody.innerHTML = filteredStudents.map(s => `
                <tr>
                    <td style="font-weight:600;">${s.cedula}</td>
                    <td>${s.apellido || ''}, ${s.nombre || ''}</td>
                    <td>${s.email || '-'}</td>
                    <td>${s.telefono || '-'}</td>
                    <td style="text-align:center;">
                        <button class="btn-icon edit-student" data-id="${s.id}" title="Editar"><i class='bx bx-edit-alt'></i></button>
                    </td>
                </tr>
            `).join('');
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