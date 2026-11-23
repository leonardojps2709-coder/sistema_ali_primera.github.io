// admin-profesores-modal.js
// Modern, premium modular architecture for managing Teacher and Admin registration modals

/**
 * Global helper to check for duplicate Cédulas across all registered users and students
 */
function isCedulaDuplicateGlobal(newCedula, currentId = null) {
    if (typeof users !== 'undefined') {
        const userDuplicate = users.find(u => u.cedula === newCedula && u.id != currentId);
        if (userDuplicate) return true;
    }
    if (typeof students !== 'undefined') {
        const studentDuplicate = students.find(s => s.cedula === newCedula);
        if (studentDuplicate) return true;
    }
    return false;
}

/**
 * Manager for the Teacher (Profesor) Modal and form operations
 */
const TeacherModalManager = {
    editingTeacherId: null,
    asignaciones: [], // Array of { materia: string, seccion_id: number, seccion_nombre: string }
    elements: {},

    init() {
        this.cacheElements();
        this.bindEvents();
    },

    cacheElements() {
        this.elements = {
            modal: document.getElementById('teacher-modal'),
            title: document.getElementById('teacher-modal-title'),
            openBtn: document.getElementById('add-teacher-btn'),
            closeBtn: document.getElementById('close-teacher-modal'),
            cancelBtn: document.getElementById('cancel-teacher-modal'),
            saveBtn: document.getElementById('save-teacher-btn'),
            form: document.getElementById('teacher-form'),
            tabs: document.querySelectorAll('.modal-tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // New elements for assignments
            materiaSelect: document.getElementById('asignacion-materia'),
            seccionSelect: document.getElementById('asignacion-seccion'),
            addAsignacionBtn: document.getElementById('btn-add-asignacion'),
            asignacionesTableBody: document.getElementById('tabla-asignaciones-body'),
            tipoDocenteSelect: document.getElementById('teacher-tipo-docente'),
            tipoDocenteHint: document.getElementById('teacher-tipo-hint')
        };
    },

    bindEvents() {
        const { openBtn, closeBtn, cancelBtn, saveBtn, tabs, addAsignacionBtn, tipoDocenteSelect } = this.elements;

        if (openBtn) openBtn.addEventListener('click', () => this.open());
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
        if (saveBtn) saveBtn.addEventListener('click', (e) => this.handleSave(e));

        if (tipoDocenteSelect) {
            tipoDocenteSelect.addEventListener('change', (e) => {
                this.onTipoDocenteChange(e.target.value);
            });
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        if (addAsignacionBtn) {
            addAsignacionBtn.addEventListener('click', () => this.addAsignacion());
        }

        if (this.elements.seccionSelect) {
            this.elements.seccionSelect.addEventListener('change', (e) => {
                this.updateMateriasDropdown(e.target.value);
            });
        }

        const fields = ['teacher-cedula', 'teacher-nombre', 'teacher-apellido', 'teacher-email', 'teacher-telefono'];
        fields.forEach(id => {
            document.getElementById(id)?.addEventListener('input', (e) => {
                e.target.classList.remove('error');
                const errSpan = document.getElementById(`${id}-error`);
                if (errSpan) errSpan.textContent = '';
            });
        });
    },

    onTipoDocenteChange(tipo) {
        const hint = this.elements.tipoDocenteHint;
        const materiasTab = document.querySelector('.modal-tab[data-tab="teacher-materias"]');
        if (tipo === 'solo_guia') {
            if (hint) hint.textContent = 'Este profesor es Solo Profesor Guía. No requiere impartir asignaturas.';
            if (materiasTab) materiasTab.title = 'Opcional para Solo Profesor Guía';
        } else if (tipo === 'docente_guia') {
            if (hint) hint.textContent = 'Este profesor impartirá asignaturas y también podrá ser vinculado como Guía de sección.';
            if (materiasTab) materiasTab.title = '';
        } else {
            if (hint) hint.textContent = 'Profesor docente de asignaturas regulares.';
            if (materiasTab) materiasTab.title = '';
        }
    },

    open() {
        this.editingTeacherId = null;
        this.elements.title.innerHTML = '<i class="bx bx-briefcase"></i> Registrar Nuevo Profesor';
        this.elements.saveBtn.innerHTML = '<i class="bx bx-save"></i> Guardar Profesor';
        this.resetForm();

        const tipoSelect = this.elements.tipoDocenteSelect;
        if (tipoSelect) {
            tipoSelect.value = 'docente';
            this.onTipoDocenteChange('docente');
        }

        this.populateDropdowns();

        if (this.elements.tabs.length > 0) {
            this.switchTab(this.elements.tabs[0]);
        }

        this.elements.modal.classList.add('active');
        document.querySelectorAll('.teacher-required-star').forEach(s => s.style.display = 'inline');
        const hintEl = document.getElementById('teacher-password-hint');
        if (hintEl) hintEl.style.display = 'none';
        document.getElementById('teacher-cedula')?.focus();
    },

    close() {
        this.elements.modal.classList.remove('active');
        this.resetForm();
    },

    resetForm() {
        this.elements.form.reset();
        this.clearErrors();
        this.editingTeacherId = null;
        this.asignaciones = [];

        const pwField = document.getElementById('teacher-password');
        const cpwField = document.getElementById('teacher-confirm-password');
        if (pwField) pwField.value = '';
        if (cpwField) cpwField.value = '';
        document.querySelectorAll('.teacher-required-star').forEach(s => s.style.display = 'inline');
        const hintEl = document.getElementById('teacher-password-hint');
        if (hintEl) hintEl.style.display = 'none';

        const prefix = document.getElementById('teacher-cedula-prefix');
        if (prefix) prefix.value = 'V';

        const tipoSelect = this.elements.tipoDocenteSelect;
        if (tipoSelect) {
            tipoSelect.value = 'docente';
            this.onTipoDocenteChange('docente');
        }

        this.renderAsignacionesTable();
    },

    switchTab(tab) {
        this.elements.tabs.forEach(t => t.classList.remove('active'));
        this.elements.tabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const targetContent = document.getElementById(tab.dataset.tab);
        if (targetContent) targetContent.classList.add('active');
    },

    clearErrors() {
        this.elements.modal.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        this.elements.modal.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    },

    populateDropdowns() {
        const { materiaSelect, seccionSelect } = this.elements;
        
        if (materiaSelect) {
            materiaSelect.innerHTML = '<option value="">Primero seleccione una sección...</option>';
            materiaSelect.disabled = true;
        }

        if (seccionSelect && typeof sections !== 'undefined') {
            const sortedSections = [...sections].sort((a, b) => {
                const anioA = extraerAnio(a.nombre);
                const anioB = extraerAnio(b.nombre);
                if (anioA !== anioB) return anioA - anioB;
                return a.nombre.localeCompare(b.nombre);
            });
            
            seccionSelect.innerHTML = '<option value="">Seleccione sección...</option>' + 
                sortedSections.map(s => {
                    // Show mention name if possible
                    let mentionName = '';
                    if (typeof mentions !== 'undefined') {
                        const m = mentions.find(men => men.id == s.mencion_id);
                        if (m) mentionName = ` (${m.nombre})`;
                    }
                    return `<option value="${s.id}">${s.nombre}${mentionName}</option>`;
                }).join('');
        }
    },

    updateMateriasDropdown(seccionId) {
        const { materiaSelect } = this.elements;
        if (!materiaSelect) return;
        
        if (!seccionId) {
            materiaSelect.innerHTML = '<option value="">Primero seleccione una sección...</option>';
            materiaSelect.disabled = true;
            return;
        }

        materiaSelect.disabled = false;
        materiaSelect.innerHTML = '<option value="">Seleccione materia...</option>';

        if (typeof sections === 'undefined') return;
        const seccion = sections.find(s => s.id == seccionId);
        if (!seccion) return;

        const mencionId = seccion.mencion_id;
        const anio = extraerAnio(seccion.nombre);

        let materiasParaSeccion = [];
        if (typeof getMateriasByMencionAndAnio === 'function') {
            materiasParaSeccion = getMateriasByMencionAndAnio(mencionId, anio);
        }

        materiasParaSeccion = [...new Set(materiasParaSeccion)].sort();
        materiaSelect.innerHTML += materiasParaSeccion.map(m => `<option value="${m}">${m}</option>`).join('');
    },

    addAsignacion() {
        const { materiaSelect, seccionSelect } = this.elements;
        const materia = materiaSelect.value;
        const seccionId = parseInt(seccionSelect.value);
        
        if (!materia || !seccionId) {
            showToast('Debe seleccionar una materia y una sección', 'error');
            return;
        }

        const seccionNombre = seccionSelect.options[seccionSelect.selectedIndex].text;

        // Check if already exists
        const exists = this.asignaciones.find(a => a.materia === materia && a.seccion_id === seccionId);
        if (exists) {
            showToast('Esta asignación ya existe', 'error');
            return;
        }

        this.asignaciones.push({ materia, seccion_id: seccionId, seccion_nombre: seccionNombre });
        this.renderAsignacionesTable();
        
        materiaSelect.value = '';
        seccionSelect.value = '';
        this.updateMateriasDropdown('');
    },

    removeAsignacion(index) {
        this.asignaciones.splice(index, 1);
        this.renderAsignacionesTable();
    },

    renderAsignacionesTable() {
        const tbody = this.elements.asignacionesTableBody;
        if (!tbody) return;

        if (this.asignaciones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="empty-msg" style="text-align: center; padding: 1rem;">No hay asignaciones registradas</td></tr>';
            return;
        }

        tbody.innerHTML = this.asignaciones.map((asig, index) => `
            <tr>
                <td>${asig.seccion_nombre}</td>
                <td>${asig.materia}</td>
                <td style="text-align: center;">
                    <button type="button" class="btn-icon delete-btn" onclick="TeacherModalManager.removeAsignacion(${index})" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 1.2rem;">
                        <i class='bx bx-trash'></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    validate() {
        let isValid = true;
        this.clearErrors();

        const cedula = document.getElementById('teacher-cedula');
        const prefix = document.getElementById('teacher-cedula-prefix');
        const nombre = document.getElementById('teacher-nombre');
        const apellido = document.getElementById('teacher-apellido');
        const email = document.getElementById('teacher-email');
        const telefono = document.getElementById('teacher-telefono');

        if (!cedula.value.trim()) {
            document.getElementById('teacher-cedula-error').textContent = 'La cédula es obligatoria';
            cedula.classList.add('error');
            isValid = false;
        } else {
            const fullCedula = `${prefix.value}-${cedula.value.trim()}`;
            if (isCedulaDuplicateGlobal(fullCedula, this.editingTeacherId)) {
                document.getElementById('teacher-cedula-error').textContent = 'Esta cédula ya se encuentra registrada';
                cedula.classList.add('error');
                isValid = false;
            }
        }

        if (!nombre.value.trim()) {
            document.getElementById('teacher-nombre-error').textContent = 'El nombre es obligatorio';
            nombre.classList.add('error');
            isValid = false;
        }
        if (!apellido.value.trim()) {
            document.getElementById('teacher-apellido-error').textContent = 'El apellido es obligatorio';
            apellido.classList.add('error');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value.trim() && !emailRegex.test(email.value)) {
            document.getElementById('teacher-email-error').textContent = 'Email no válido';
            email.classList.add('error');
            isValid = false;
        }

        const password = document.getElementById('teacher-password');
        const confirmPassword = document.getElementById('teacher-confirm-password');

        if (!this.editingTeacherId) {
            // En creación: contraseña requerida
            if (!password || !password.value) {
                const err = document.getElementById('teacher-password-error');
                if (err) err.textContent = 'La contraseña es obligatoria';
                if (password) password.classList.add('error');
                isValid = false;
            } else if (password.value.length < 6) {
                const err = document.getElementById('teacher-password-error');
                if (err) err.textContent = 'La contraseña debe tener al menos 6 caracteres';
                if (password) password.classList.add('error');
                isValid = false;
            }

            if (!confirmPassword || !confirmPassword.value) {
                const err = document.getElementById('teacher-confirm-password-error');
                if (err) err.textContent = 'Debe confirmar la contraseña';
                if (confirmPassword) confirmPassword.classList.add('error');
                isValid = false;
            } else if (password && password.value !== confirmPassword.value) {
                const err = document.getElementById('teacher-confirm-password-error');
                if (err) err.textContent = 'Las contraseñas no coinciden';
                if (confirmPassword) confirmPassword.classList.add('error');
                isValid = false;
            }
        } else {
            // En edición: contraseña opcional, pero si se escribe debe validar
            if (password && (password.value || (confirmPassword && confirmPassword.value))) {
                if (password.value.length < 6) {
                    const err = document.getElementById('teacher-password-error');
                    if (err) err.textContent = 'La contraseña debe tener al menos 6 caracteres';
                    password.classList.add('error');
                    isValid = false;
                }
                if (confirmPassword && password.value !== confirmPassword.value) {
                    const err = document.getElementById('teacher-confirm-password-error');
                    if (err) err.textContent = 'Las contraseñas no coinciden';
                    confirmPassword.classList.add('error');
                    isValid = false;
                }
            }
        }

        if (!isValid) {
            const basicErrors = this.elements.modal.querySelector('#teacher-basicos .error');
            if (basicErrors && this.elements.tabs.length > 0) {
                this.switchTab(this.elements.tabs[0]);
            }
        }

        return isValid;
    },

    async handleSave(e) {
        e.preventDefault();

        if (!this.validate()) {
            showToast('Por favor, complete todos los campos requeridos', 'error');
            return;
        }

        const { saveBtn } = this.elements;
        if (saveBtn) {
            saveBtn.classList.add('loading');
            saveBtn.disabled = true;
        }

        try {
            const num = document.getElementById('teacher-cedula').value.trim();
            const prefix = document.getElementById('teacher-cedula-prefix').value;

            const tipoDocente = document.getElementById('teacher-tipo-docente')?.value || 'docente';

            // En la Opción 1, enviamos 'asignaciones' como JSON
            const teacherData = {
                cedula: `${prefix}-${num}`,
                nombre: document.getElementById('teacher-nombre').value.trim(),
                apellido: document.getElementById('teacher-apellido').value.trim(),
                email: document.getElementById('teacher-email').value.trim(),
                telefono: document.getElementById('teacher-telefono').value.trim(),
                tipo_docente: tipoDocente,
                asignaciones: JSON.stringify(this.asignaciones),
                rol: 'teacher'
            };

            const pwVal = document.getElementById('teacher-password')?.value;
            if (pwVal) {
                teacherData.password = pwVal;
            }

            let res;
            if (this.editingTeacherId) {
                res = await updateUser(this.editingTeacherId, teacherData);
                if (res && res.success) {
                    const isGuia = tipoDocente === 'docente_guia' || tipoDocente === 'solo_guia';
                    showToast(isGuia ? 'Profesor Guía actualizado exitosamente' : 'Profesor actualizado exitosamente', 'success');
                    this.close();
                } else {
                    showToast('Error al actualizar: ' + (res?.error || 'Error desconocido'), 'error');
                }
            } else {
                res = await addUser(teacherData);
                if (res && res.success) {
                    const isGuia = tipoDocente === 'docente_guia' || tipoDocente === 'solo_guia';
                    showToast(isGuia ? 'Profesor Guía registrado exitosamente' : 'Profesor registrado exitosamente', 'success');
                    this.close();
                } else {
                    showToast('Error al guardar: ' + (res?.error || 'Error desconocido'), 'error');
                }
            }
        } catch (error) {
            showToast('Error al guardar el profesor: ' + error.message, 'error');
            console.error('[Profesor] Excepción:', error);
        } finally {
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
        }
    },

    openEdit(teacherId) {
        const teacher = users.find(u => u.id == teacherId);
        if (!teacher) return;

        this.editingTeacherId = teacherId;
        const tipoDocente = teacher.tipo_docente || 'docente';
        this.elements.title.innerHTML = '<i class="bx bx-edit-alt"></i> Editar Profesor';
        this.elements.saveBtn.innerHTML = '<i class="bx bx-save"></i> Actualizar Profesor';

        if (teacher.cedula && teacher.cedula.includes('-')) {
            const [prefix, num] = teacher.cedula.split('-');
            document.getElementById('teacher-cedula-prefix').value = prefix;
            document.getElementById('teacher-cedula').value = num;
        } else {
            document.getElementById('teacher-cedula-prefix').value = 'V';
            document.getElementById('teacher-cedula').value = teacher.cedula || '';
        }

        document.getElementById('teacher-nombre').value = teacher.nombre || '';
        document.getElementById('teacher-apellido').value = teacher.apellido || '';
        document.getElementById('teacher-email').value = teacher.email || '';
        document.getElementById('teacher-telefono').value = teacher.telefono || '';

        const pwField = document.getElementById('teacher-password');
        const cpwField = document.getElementById('teacher-confirm-password');
        if (pwField) pwField.value = '';
        if (cpwField) cpwField.value = '';
        document.querySelectorAll('.teacher-required-star').forEach(s => s.style.display = 'none');
        const hintEl = document.getElementById('teacher-password-hint');
        if (hintEl) hintEl.style.display = 'block';

        const tipoSelect = this.elements.tipoDocenteSelect;
        if (tipoSelect) {
            tipoSelect.value = tipoDocente;
            this.onTipoDocenteChange(tipoDocente);
        }

        this.populateDropdowns();

        this.asignaciones = [];
        if (teacher.asignaciones) {
            let asigArr = [];
            try {
                asigArr = typeof teacher.asignaciones === 'string' ? JSON.parse(teacher.asignaciones) : teacher.asignaciones;
            } catch (e) {
                console.warn("Could not parse asignaciones", e);
            }
            
            this.asignaciones = asigArr.map(a => {
                let sName = "Sección " + a.seccion_id;
                if (typeof sections !== 'undefined') {
                    const sec = sections.find(s => s.id == a.seccion_id);
                    if (sec) {
                        sName = sec.nombre;
                        if (typeof mentions !== 'undefined') {
                            const m = mentions.find(men => men.id == sec.mencion_id);
                            if (m) sName += ` (${m.nombre})`;
                        }
                    }
                }
                return { materia: a.materia_nombre || a.materia, seccion_id: parseInt(a.seccion_id), seccion_nombre: sName };
            });
        }
        
        this.renderAsignacionesTable();

        this.elements.modal.classList.add('active');
        if (this.elements.tabs.length > 0) {
            this.switchTab(this.elements.tabs[0]);
        }
    }
};

/**
 * Manager for Admin Modal (Restringido exclusivamente al Superadministrador)
 */
const AdminModalManager = {
    init() {
        // La gestión y registro de administradores está restringida exclusivamente al Superadministrador.
    },

    open() {
        if (typeof showToast === 'function') {
            showToast('Acción no permitida: Solo el Superadministrador puede registrar administradores.', 'warning');
        }
    },

    openEdit(adminId) {
        if (typeof showToast === 'function') {
            showToast('Acción no permitida: Solo el Superadministrador puede modificar administradores.', 'warning');
        }
    },

    handleSave() {
        if (typeof showToast === 'function') {
            showToast('Acción no permitida: Solo el Superadministrador puede registrar administradores.', 'warning');
        }
    },

    close() {}
};

// Initialize modules on document ready
document.addEventListener('DOMContentLoaded', () => {
    TeacherModalManager.init();
    AdminModalManager.init();

    // Expose edit handlers globally for grid action buttons integration
    window.openEditTeacherModal = (id) => TeacherModalManager.openEdit(id);
    window.openEditAdminModal = (id) => AdminModalManager.openEdit(id);

    // Initial render on page load if elements are ready
    if (TeacherModalManager.elements.materiaSelect) {
        TeacherModalManager.populateDropdowns();
    }
});