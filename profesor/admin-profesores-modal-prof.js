// admin-profesores-modal-prof.js
// Modern, premium modular architecture for managing Teacher and Admin modals in the Teacher dashboard

/**
 * Manager for the Teacher (Profesor) Modal and form operations
 */
const TeacherModalManager = {
    editingTeacherId: null,
    selectedMaterias: new Set(),
    selectedSecciones: new Set(),
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
            search: document.getElementById('search-materias'),
            materiasContainer: document.getElementById('materias-container'),
            materiasSelectedBadge: document.getElementById('materias-seleccionadas'),
            selectedCountSpan: document.getElementById('selected-count'),
            mentionFilter: document.getElementById('teacher-mention-filter'),
            yearFilter: document.getElementById('teacher-year-filter'),
            seccionesContainer: document.getElementById('secciones-container'),
            seccionesSelectedBadge: document.getElementById('secciones-seleccionadas'),
            selectedSeccionesSpan: document.getElementById('selected-secciones-count')
        };
    },

    bindEvents() {
        const { openBtn, closeBtn, cancelBtn, saveBtn, tabs, mentionFilter, yearFilter, search } = this.elements;

        if (openBtn) openBtn.addEventListener('click', () => this.open());
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
        if (saveBtn) saveBtn.addEventListener('click', (e) => this.handleSave(e));

        tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        if (mentionFilter) {
            mentionFilter.addEventListener('change', () => {
                this.renderMaterias(search ? search.value : '');
                this.renderSecciones();
            });
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', () => {
                this.renderMaterias(search ? search.value : '');
                this.renderSecciones();
            });
        }

        if (search) {
            search.addEventListener('input', (e) => {
                this.renderMaterias(e.target.value);
            });
        }

        const fields = ['teacher-cedula', 'teacher-nombre', 'teacher-apellido', 'teacher-email', 'teacher-telefono', 'teacher-password', 'teacher-confirm-password'];
        fields.forEach(id => {
            document.getElementById(id)?.addEventListener('input', (e) => {
                e.target.classList.remove('error');
                const errSpan = document.getElementById(`${id}-error`);
                if (errSpan) errSpan.textContent = '';
            });
        });

        // Event delegation for dynamic checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('materia-checkbox')) {
                if (e.target.checked) {
                    this.selectedMaterias.add(e.target.value);
                } else {
                    this.selectedMaterias.delete(e.target.value);
                }
                this.updateMateriasCount();
            } else if (e.target.classList.contains('seccion-checkbox')) {
                const id = parseInt(e.target.value);
                if (e.target.checked) {
                    this.selectedSecciones.add(id);
                } else {
                    this.selectedSecciones.delete(id);
                }
                this.updateSeccionesCount();
            }
        });
    },

    open() {
        this.editingTeacherId = null;
        this.elements.title.innerHTML = '<i class="bx bx-briefcase"></i> Registrar Nuevo Profesor';
        this.elements.saveBtn.innerHTML = '<i class="bx bx-save"></i> Guardar Profesor';
        this.populateFilters();
        this.resetForm();
        this.renderSecciones();

        if (this.elements.tabs.length > 0) {
            this.switchTab(this.elements.tabs[0]);
        }

        this.elements.modal.classList.add('active');
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
        this.selectedMaterias.clear();
        this.selectedSecciones.clear();

        const pass = document.getElementById('teacher-password');
        const confPass = document.getElementById('teacher-confirm-password');
        if (pass) pass.required = true;
        if (confPass) confPass.required = true;

        const hint = document.querySelector('.teacher-password-hint');
        if (hint) hint.style.display = 'none';

        if (this.elements.mentionFilter) this.elements.mentionFilter.value = '';
        if (this.elements.yearFilter) this.elements.yearFilter.value = '';

        this.renderMaterias();
        this.renderSecciones();
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

    populateFilters() {
        const { mentionFilter, yearFilter } = this.elements;
        if (mentionFilter) {
            mentionFilter.innerHTML = '<option value="">Todas las menciones</option>' +
                mentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        }
        if (yearFilter) {
            yearFilter.innerHTML = '<option value="">Todos los años</option>' +
                ['1°', '2°', '3°', '4°', '5°', '6°'].map((anio, idx) => 
                    `<option value="${idx + 1}">${anio} Año</option>`
                ).join('');
        }
    },

    renderMaterias(searchTerm = '') {
        const container = this.elements.materiasContainer;
        if (!container) return;

        const mencionId = this.elements.mentionFilter ? this.elements.mentionFilter.value : '';
        const anio = this.elements.yearFilter ? this.elements.yearFilter.value : '';

        let list = [];
        if (mencionId && anio) {
            list = getMateriasByMencionAndAnio(parseInt(mencionId), parseInt(anio));
        } else if (mencionId) {
            list = getAllMateriasByMencion(parseInt(mencionId));
        } else {
            const all = new Set();
            mentions.forEach(m => {
                getAllMateriasByMencion(m.id).forEach(mat => all.add(mat));
            });
            list = Array.from(all).sort();
        }

        if (searchTerm) {
            list = list.filter(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (list.length === 0) {
            container.innerHTML = '<div class="empty-msg" style="grid-column: 1/-1; padding: 2rem;">No hay materias disponibles</div>';
        } else {
            container.innerHTML = list.map(materia => {
                const matId = materia.replace(/\s+/g, '-').replace(/[°,]/g, '');
                return `
                    <div class="materia-item">
                        <input type="checkbox" class="materia-checkbox" value="${materia}" 
                               id="mat-${matId}" ${this.selectedMaterias.has(materia) ? 'checked' : ''}>
                        <i class='bx bx-book'></i>
                        <label for="mat-${matId}">${materia}</label>
                    </div>
                `;
            }).join('');
        }
        this.updateMateriasCount();
    },

    updateMateriasCount() {
        const count = this.selectedMaterias.size;
        const badge = this.elements.materiasSelectedBadge;
        const span = this.elements.selectedCountSpan;
        if (badge) {
            badge.style.display = count > 0 ? 'flex' : 'none';
            if (span) span.textContent = count;
        }
    },

    renderSecciones() {
        const container = this.elements.seccionesContainer;
        if (!container) return;

        const mencionId = this.elements.mentionFilter ? this.elements.mentionFilter.value : '';
        const anio = this.elements.yearFilter ? this.elements.yearFilter.value : '';

        let filtered = [...sections];
        if (mencionId) {
            filtered = filtered.filter(s => s.mencion_id == mencionId);
        }
        if (anio) {
            filtered = filtered.filter(s => extraerAnio(s.nombre) == anio);
        }

        const sorted = filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));

        if (sorted.length === 0) {
            container.innerHTML = '<div class="empty-msg" style="grid-column: 1/-1; padding: 1rem;">No hay secciones asignadas</div>';
        } else {
            container.innerHTML = sorted.map(s => `
                <div class="materia-item">
                    <input type="checkbox" class="seccion-checkbox" value="${s.id}" 
                           id="sec-${s.id}" ${this.selectedSecciones.has(s.id) ? 'checked' : ''}>
                    <i class='bx bx-grid'></i>
                    <label for="sec-${s.id}">${s.nombre}</label>
                </div>
            `).join('');
        }
        this.updateSeccionesCount();
    },

    updateSeccionesCount() {
        const count = this.selectedSecciones.size;
        const badge = this.elements.seccionesSelectedBadge;
        const span = this.elements.selectedSeccionesSpan;
        if (badge) {
            badge.style.display = count > 0 ? 'flex' : 'none';
            if (span) span.textContent = count;
        }
    },

    validate() {
        let isValid = true;
        this.clearErrors();

        const cedula = document.getElementById('teacher-cedula');
        const nombre = document.getElementById('teacher-nombre');
        const apellido = document.getElementById('teacher-apellido');
        const email = document.getElementById('teacher-email');
        const telefono = document.getElementById('teacher-telefono');
        const password = document.getElementById('teacher-password');
        const confirmPassword = document.getElementById('teacher-confirm-password');

        if (!cedula.value.trim()) {
            document.getElementById('teacher-cedula-error').textContent = 'La cédula es obligatoria';
            cedula.classList.add('error');
            isValid = false;
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

        if (!this.editingTeacherId) {
            if (!password.value.trim()) {
                document.getElementById('teacher-password-error').textContent = 'La contraseña es obligatoria';
                password.classList.add('error');
                isValid = false;
            } else if (password.value.length < 6) {
                document.getElementById('teacher-password-error').textContent = 'La contraseña debe tener al menos 6 caracteres';
                password.classList.add('error');
                isValid = false;
            }

            if (password.value !== confirmPassword.value) {
                document.getElementById('teacher-confirm-password-error').textContent = 'Las contraseñas no coinciden';
                confirmPassword.classList.add('error');
                isValid = false;
            }
        } else {
            if (password.value || confirmPassword.value) {
                if (password.value.length < 6 && password.value.length > 0) {
                    document.getElementById('teacher-password-error').textContent = 'La contraseña debe tener al menos 6 caracteres';
                    password.classList.add('error');
                    isValid = false;
                }
                if (password.value !== confirmPassword.value) {
                    document.getElementById('teacher-confirm-password-error').textContent = 'Las contraseñas no coinciden';
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
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;

        try {
            const materiasString = Array.from(this.selectedMaterias).join(', ');
            const seccionesString = Array.from(this.selectedSecciones).join(',');

            const teacherData = {
                cedula: document.getElementById('teacher-cedula').value.trim(),
                nombre: document.getElementById('teacher-nombre').value.trim(),
                apellido: document.getElementById('teacher-apellido').value.trim(),
                email: document.getElementById('teacher-email').value.trim(),
                telefono: document.getElementById('teacher-telefono').value.trim(),
                materias: materiasString,
                secciones: seccionesString,
                rol: 'teacher'
            };

            const password = document.getElementById('teacher-password').value;
            if (password) {
                teacherData.password = password;
            }

            let res;
            if (this.editingTeacherId) {
                res = await updateUser(this.editingTeacherId, teacherData);
                if (res && res.success) {
                    showToast('Profesor actualizado exitosamente', 'success');
                    this.close();
                } else {
                    showToast('Error al actualizar: ' + (res?.error || 'Error desconocido'), 'error');
                }
            } else {
                res = await addUser(teacherData);
                if (res && res.success) {
                    showToast('Profesor registrado exitosamente', 'success');
                    this.close();
                } else {
                    showToast('Error al guardar: ' + (res?.error || 'Error desconocido'), 'error');
                }
            }
        } catch (error) {
            showToast('Error al guardar el profesor: ' + error.message, 'error');
            console.error('[Profesor] Excepción:', error);
        } finally {
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
        }
    },

    openEdit(teacherId) {
        const teacher = users.find(u => u.id === teacherId);
        if (!teacher) return;

        this.editingTeacherId = teacherId;
        this.elements.title.innerHTML = '<i class="bx bx-edit-alt"></i> Editar Profesor';
        this.elements.saveBtn.innerHTML = '<i class="bx bx-save"></i> Actualizar Profesor';

        document.getElementById('teacher-cedula').value = teacher.cedula || '';
        document.getElementById('teacher-nombre').value = teacher.nombre || '';
        document.getElementById('teacher-apellido').value = teacher.apellido || '';
        document.getElementById('teacher-email').value = teacher.email || '';
        document.getElementById('teacher-telefono').value = teacher.telefono || '';

        this.selectedMaterias.clear();
        if (teacher.materias) {
            teacher.materias.split(',').map(m => m.trim()).forEach(m => this.selectedMaterias.add(m));
        }

        this.selectedSecciones.clear();
        if (teacher.secciones) {
            if (Array.isArray(teacher.secciones)) {
                teacher.secciones.forEach(id => this.selectedSecciones.add(id));
            } else if (typeof teacher.secciones === 'string') {
                teacher.secciones.split(',').filter(id => id.trim()).forEach(id => this.selectedSecciones.add(parseInt(id.trim())));
            }
        }

        document.getElementById('teacher-password').value = '';
        document.getElementById('teacher-confirm-password').value = '';
        document.getElementById('teacher-password').required = false;
        document.getElementById('teacher-confirm-password').required = false;

        const hint = document.querySelector('.teacher-password-hint');
        if (hint) hint.style.display = 'block';

        this.populateFilters();
        this.renderMaterias();
        this.renderSecciones();

        this.elements.modal.classList.add('active');
        if (this.elements.tabs.length > 0) {
            this.switchTab(this.elements.tabs[0]);
        }
    }
};

/**
 * Manager for the Admin Modal and form operations
 */
const AdminModalManager = {
    editingAdminId: null,
    elements: {},

    init() {
        this.cacheElements();
        this.bindEvents();
    },

    cacheElements() {
        this.elements = {
            modal: document.getElementById('admin-modal'),
            title: document.getElementById('admin-modal-title'),
            openBtn: document.getElementById('add-admin-btn'),
            closeBtn: document.getElementById('close-admin-modal'),
            cancelBtn: document.getElementById('cancel-admin-modal'),
            saveBtn: document.getElementById('save-admin-btn'),
            form: document.getElementById('admin-form')
        };
    },

    bindEvents() {
        const { openBtn, closeBtn, cancelBtn, saveBtn } = this.elements;

        if (openBtn) openBtn.addEventListener('click', () => this.open());
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
        if (saveBtn) saveBtn.addEventListener('click', () => this.handleSave());

        const fields = ['admin-cedula', 'admin-nombre', 'admin-apellido', 'admin-email', 'admin-telefono', 'admin-password', 'admin-confirm-password'];
        fields.forEach(id => {
            document.getElementById(id)?.addEventListener('input', (e) => {
                e.target.classList.remove('error');
                const errSpan = document.getElementById(`${id}-error`);
                if (errSpan) errSpan.textContent = '';
            });
        });
    },

    open() {
        this.editingAdminId = null;
        this.elements.title.innerHTML = '<i class="bx bx-shield"></i> Registrar Nuevo Administrador';
        this.elements.saveBtn.innerHTML = '<i class="bx bx-save"></i> Guardar Administrador';
        this.resetForm();
        this.elements.modal.classList.add('active');
        document.getElementById('admin-cedula')?.focus();
    },

    close() {
        this.elements.modal.classList.remove('active');
        this.resetForm();
    },

    resetForm() {
        this.elements.form.reset();
        this.clearErrors();
        this.editingAdminId = null;

        const pass = document.getElementById('admin-password');
        const confPass = document.getElementById('admin-confirm-password');
        if (pass) pass.required = true;
        if (confPass) confPass.required = true;

        const hint = document.querySelector('.admin-password-hint');
        if (hint) hint.style.display = 'none';
    },

    clearErrors() {
        this.elements.modal.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        this.elements.modal.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    },

    validate() {
        let isValid = true;
        this.clearErrors();

        const cedula = document.getElementById('admin-cedula');
        const nombre = document.getElementById('admin-nombre');
        const apellido = document.getElementById('admin-apellido');
        const email = document.getElementById('admin-email');
        const telefono = document.getElementById('admin-telefono');
        const password = document.getElementById('admin-password');
        const confirmPassword = document.getElementById('admin-confirm-password');


        if (!cedula.value.trim()) {
            document.getElementById('admin-cedula-error').textContent = 'La cédula es obligatoria';
            cedula.classList.add('error');
            isValid = false;
        }

        if (!nombre.value.trim()) {
            document.getElementById('admin-nombre-error').textContent = 'El nombre es obligatorio';
            nombre.classList.add('error');
            isValid = false;
        }
        if (!apellido.value.trim()) {
            document.getElementById('admin-apellido-error').textContent = 'El apellido es obligatorio';
            apellido.classList.add('error');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value.trim() && !emailRegex.test(email.value)) {
            document.getElementById('admin-email-error').textContent = 'Email no válido';
            email.classList.add('error');
            isValid = false;
        }

        if (!this.editingAdminId) {
            if (!password.value.trim()) {
                document.getElementById('admin-password-error').textContent = 'La contraseña es obligatoria';
                password.classList.add('error');
                isValid = false;
            } else if (password.value.length < 6) {
                document.getElementById('admin-password-error').textContent = 'La contraseña debe tener al menos 6 caracteres';
                password.classList.add('error');
                isValid = false;
            }

            if (password.value !== confirmPassword.value) {
                document.getElementById('admin-confirm-password-error').textContent = 'Las contraseñas no coinciden';
                confirmPassword.classList.add('error');
                isValid = false;
            }
        } else {
            if (password.value || confirmPassword.value) {
                if (password.value.length < 6 && password.value.length > 0) {
                    document.getElementById('admin-password-error').textContent = 'La contraseña debe tener al menos 6 caracteres';
                    password.classList.add('error');
                    isValid = false;
                }
                if (password.value !== confirmPassword.value) {
                    document.getElementById('admin-confirm-password-error').textContent = 'Las contraseñas no coinciden';
                    confirmPassword.classList.add('error');
                    isValid = false;
                }
            }
        }

        return isValid;
    },

    async handleSave() {
        if (!this.validate()) {
            return;
        }

        const { saveBtn } = this.elements;
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;

        try {
            const adminData = {
                cedula: document.getElementById('admin-cedula').value.trim(),
                nombre: document.getElementById('admin-nombre').value.trim(),
                apellido: document.getElementById('admin-apellido').value.trim(),
                email: document.getElementById('admin-email').value.trim(),
                telefono: document.getElementById('admin-telefono').value.trim(),
                rol: 'admin'
            };

            const password = document.getElementById('admin-password').value;
            if (password) {
                adminData.password = password;
            }

            let res;
            if (this.editingAdminId) {
                res = await updateUser(this.editingAdminId, adminData);
                if (res && res.success) {
                    showToast('Administrador actualizado exitosamente', 'success');
                    this.close();
                } else {
                    showToast('Error al actualizar: ' + (res?.error || 'Error desconocido'), 'error');
                }
            } else {
                res = await addUser(adminData);
                if (res && res.success) {
                    showToast('Administrador registrado exitosamente', 'success');
                    this.close();
                } else {
                    showToast('Error al guardar: ' + (res?.error || 'Error desconocido'), 'error');
                }
            }
        } catch (error) {
            showToast('Error al guardar el administrador', 'error');
            console.error('Error:', error);
        } finally {
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
        }
    },

    openEdit(adminId) {
        const admin = users.find(u => u.id === adminId);
        if (!admin) return;

        this.editingAdminId = adminId;
        this.elements.title.innerHTML = '<i class="bx bx-edit-alt"></i> Editar Administrador';
        this.elements.saveBtn.innerHTML = '<i class="bx bx-save"></i> Actualizar Administrador';

        document.getElementById('admin-cedula').value = admin.cedula || '';
        document.getElementById('admin-nombre').value = admin.nombre || '';
        document.getElementById('admin-apellido').value = admin.apellido || '';
        document.getElementById('admin-email').value = admin.email || '';
        document.getElementById('admin-telefono').value = admin.telefono || '';

        document.getElementById('admin-password').value = '';
        document.getElementById('admin-confirm-password').value = '';
        document.getElementById('admin-password').required = false;
        document.getElementById('admin-confirm-password').required = false;

        const hint = document.querySelector('.admin-password-hint');
        if (hint) hint.style.display = 'block';

        this.elements.modal.classList.add('active');
    }
};

// Initialize modules on document ready
document.addEventListener('DOMContentLoaded', () => {
    TeacherModalManager.init();
    AdminModalManager.init();

    // Expose edit handlers globally for grid action buttons integration
    window.openEditTeacherModal = (id) => TeacherModalManager.openEdit(id);
    window.openEditAdminModal = (id) => AdminModalManager.openEdit(id);

    // Initial render on page load if elements are ready
    if (TeacherModalManager.elements.materiasContainer) {
        TeacherModalManager.populateFilters();
        TeacherModalManager.renderMaterias();
    }
    if (TeacherModalManager.elements.seccionesContainer) {
        TeacherModalManager.renderSecciones();
    }
});