// student-modal.js
// Manejo del modal para registrar y editar estudiantes

let editingStudentId = null;

// Asegurar que extraerAnio esté disponible (definida en render.js)
if (typeof extraerAnio !== 'function') {
    window.extraerAnio = function(nombre) {
        const match = nombre.match(/\d+/);
        return match ? parseInt(match[0]) : 999;
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('student-modal');
    const modalTitle = document.getElementById('modal-title');
    const openBtn = document.getElementById('add-student-btn');
    const closeBtn = document.getElementById('close-student-modal');
    const cancelBtn = document.getElementById('cancel-student-modal');
    const saveBtn = document.getElementById('save-student-btn');
    const form = document.getElementById('student-form');
    const mentionSelect = document.getElementById('student-mention');
    const sectionSelect = document.getElementById('student-section');

    // Función para limpiar errores
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    // Función para verificar si una cédula ya existe
    function isCedulaDuplicate(newCedula, currentId = null) {
        // Buscar en usuarios
        if (typeof users !== 'undefined') {
            const userDuplicate = users.find(u => u.cedula === newCedula);
            if (userDuplicate) return true;
        }
        
        // Buscar en estudiantes
        if (typeof students !== 'undefined') {
            const studentDuplicate = students.find(s => s.cedula === newCedula && s.id != currentId);
            if (studentDuplicate) return true;
        }
        
        return false;
    }

    // Función para validar el formulario
    function validateForm() {
        let isValid = true;
        clearErrors();

        const cedula = document.getElementById('student-cedula');
        const cedulaPrefix = document.getElementById('student-cedula-prefix');
        const nombre = document.getElementById('student-nombre');
        const apellido = document.getElementById('student-apellido');
        const email = document.getElementById('student-email');
        const telefono = document.getElementById('student-telefono');
        const seccion = document.getElementById('student-section');

        if (!cedula.value.trim()) {
            document.getElementById('cedula-error').textContent = 'La cédula es obligatoria';
            cedula.classList.add('error');
            isValid = false;
        } else {
            const fullCedula = `${cedulaPrefix.value}-${cedula.value.trim()}`;
            if (isCedulaDuplicate(fullCedula, editingStudentId)) {
                document.getElementById('cedula-error').textContent = 'Esta cédula ya se encuentra registrada';
                cedula.classList.add('error');
                isValid = false;
            }
        }

        if (!nombre.value.trim()) {
            document.getElementById('nombre-error').textContent = 'El nombre es obligatorio';
            nombre.classList.add('error');
            isValid = false;
        }

        if (!apellido.value.trim()) {
            document.getElementById('apellido-error').textContent = 'El apellido es obligatorio';
            apellido.classList.add('error');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value.trim() && !emailRegex.test(email.value)) {
            document.getElementById('email-error').textContent = 'Email no válido';
            email.classList.add('error');
            isValid = false;
        }

        if (!seccion.value) {
            document.getElementById('seccion-error').textContent = 'Debe seleccionar una sección';
            seccion.classList.add('error');
            isValid = false;
        }

        return isValid;
    }

    // Función para actualizar secciones según la mención seleccionada
    function updateSectionsByMention(mentionId) {
        let filteredSections = sections;
        if (mentionId) {
            filteredSections = sections.filter(s => (s.mencion_id == mentionId || s.mencionId == mentionId));
        }

        const sortedSections = [...filteredSections].sort((a, b) => {
            const anioA = extraerAnio(a.nombre);
            const anioB = extraerAnio(b.nombre);
            if (anioA !== anioB) return anioA - anioB;
            return a.nombre.localeCompare(b.nombre);
        });

        sectionSelect.innerHTML = '<option value="">Seleccione una sección</option>' +
            sortedSections.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
    }

    // Llenar selects de mención y sección
    function populateSelects() {
        mentionSelect.innerHTML = '<option value="">Seleccione una mención</option>' +
            mentions.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');

        updateSectionsByMention();
    }

    // Resetear formulario
    function resetForm() {
        form.reset();
        clearErrors();
        editingStudentId = null;
        if (document.getElementById('student-cedula-prefix')) {
            document.getElementById('student-cedula-prefix').value = 'V';
        }
    }

    // Abrir modal para nuevo estudiante
    window.openAddStudentModal = (sectionId = null) => {
        modalTitle.innerHTML = '<i class="bx bx-user-plus"></i> Registrar Nuevo Estudiante';
        saveBtn.innerHTML = '<i class="bx bx-save"></i> Guardar Estudiante';
        resetForm();
        populateSelects();
        modal.classList.add('active');
        document.getElementById('student-cedula').focus();

        if (sectionId) {
            setTimeout(() => {
                const section = sections.find(s => s.id == parseInt(sectionId));
                if (section) {
                    const mId = section.mencion_id || section.mencionId;
                    document.getElementById('student-mention').value = mId;
                    updateSectionsByMention(mId);
                    setTimeout(() => {
                        document.getElementById('student-section').value = sectionId;
                    }, 50);
                }
            }, 100);
        }
    };

    openBtn.addEventListener('click', () => window.openAddStudentModal());

    function closeModal() {
        modal.classList.remove('active');
        resetForm();
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);


    mentionSelect.addEventListener('change', (e) => {
        updateSectionsByMention(e.target.value);
    });

    // Guardar estudiante
    saveBtn.addEventListener('click', async () => {
        if (!validateForm()) {
            showToast('Por favor, complete todos los campos requeridos', 'error');
            return;
        }

        saveBtn.classList.add('loading');
        saveBtn.disabled = true;

        try {
            // IMPORTANTE: Convertir sección a número
            const seccionId = parseInt(document.getElementById('student-section').value);
            const cedulaNum = document.getElementById('student-cedula').value.trim();
            const cedulaPrefix = document.getElementById('student-cedula-prefix').value;
            const fullCedula = `${cedulaPrefix}-${cedulaNum}`;

            const studentData = {
                cedula: fullCedula,
                nombre: document.getElementById('student-nombre').value.trim().toUpperCase(),
                apellido: document.getElementById('student-apellido').value.trim().toUpperCase(),
                email: document.getElementById('student-email').value.trim(),
                telefono: document.getElementById('student-telefono').value.trim(),
                seccion: seccionId,
                rol: 'student'
            };

            if (editingStudentId) {
                await updateStudent(editingStudentId, studentData);
                showToast('Estudiante actualizado exitosamente', 'success');
                // Refresh the students table in the current section detail view
                if (window.openSectionDetailModal && typeof window.openSectionDetailModal === 'function') {
                    // Use the stored section ID (seccionId) to reload the list
                    setTimeout(() => {
                        window.openSectionDetailModal(seccionId);
                    }, 500);
                }
            } else {
                await addStudent(studentData);
                showToast('Estudiante registrado exitosamente', 'success');
            }

            closeModal();
        } catch (error) {
            showToast('Error al guardar el estudiante', 'error');
            console.error('Error:', error);
        } finally {
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
        }
    });

    form.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveBtn.click();
        }
    });

    // Función para editar estudiante
    window.openEditStudentModal = (studentId) => {
        const student = students.find(u => u.id == studentId);
        if (!student) return;

        editingStudentId = studentId;
        modalTitle.innerHTML = '<i class="bx bx-edit-alt"></i> Editar Estudiante';
        saveBtn.innerHTML = '<i class="bx bx-save"></i> Actualizar Estudiante';

        if (student.cedula && student.cedula.includes('-')) {
            const [prefix, num] = student.cedula.split('-');
            document.getElementById('student-cedula-prefix').value = prefix;
            document.getElementById('student-cedula').value = num;
        } else {
            document.getElementById('student-cedula-prefix').value = 'V';
            document.getElementById('student-cedula').value = student.cedula || '';
        }
        document.getElementById('student-nombre').value = (student.nombre || '').toUpperCase();
        document.getElementById('student-apellido').value = (student.apellido || '').toUpperCase();
        document.getElementById('student-email').value = student.email || '';
        document.getElementById('student-telefono').value = student.telefono || '';

        populateSelects();

        setTimeout(() => {
            const currentSeccionId = student.seccion_id || student.seccion;
            if (currentSeccionId) {
                const section = sections.find(s => s.id == parseInt(currentSeccionId));
                if (section) {
                    const mId = section.mencion_id || section.mencionId;
                    document.getElementById('student-mention').value = mId;
                    updateSectionsByMention(mId);
                    setTimeout(() => {
                        document.getElementById('student-section').value = currentSeccionId;
                    }, 50);
                }
            }
        }, 100);

        modal.classList.add('active');
    };
});