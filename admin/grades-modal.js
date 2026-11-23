// grades-modal.js
// Modal para edición rápida de notas

let currentEditingGrade = null;

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('grade-modal');
    const closeBtn = document.getElementById('close-grade-modal');
    const cancelBtn = document.getElementById('cancel-grade-modal');
    const saveBtn = document.getElementById('save-grade-modal');
    const form = document.getElementById('grade-form');
    const presetBtns = document.querySelectorAll('.grade-preset-btn');



    // Abrir modal para editar nota
    window.openGradeModal = (studentId, periodo, currentGrade) => {
        currentEditingGrade = { studentId, periodo };
        
        // Obtener el nombre del estudiante de la primera celda de la fila
        const studentRow = document.querySelector(`tr[data-student-id="${studentId}"]`);
        if (studentRow) {
            const studentName = studentRow.querySelector('td:first-child').textContent;
            document.getElementById('grade-student-name').textContent = studentName;
        }
        
        document.getElementById('grade-periodo-display').textContent = 
            periodo === 1 ? '1er Período' : periodo === 2 ? '2do Período' : '3er Período';
        document.getElementById('grade-input').value = currentGrade || '';
        
        modal.classList.add('active');
        document.getElementById('grade-input').focus();
    };

    // Cerrar modal
    function closeModal() {
        modal.classList.remove('active');
        form.reset();
        currentEditingGrade = null;
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);


    // Botones de valores predefinidos
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('grade-input').value = btn.dataset.value;
        });
    });

    // Guardar nota
    saveBtn.addEventListener('click', () => {
        const grade = document.getElementById('grade-input').value;
        if (!grade || grade < 0 || grade > 20) {
            showToast('La nota debe estar entre 0 y 20', 'error');
            return;
        }

        // Actualizar la celda correspondiente
        const row = document.querySelector(`tr[data-student-id="${currentEditingGrade.studentId}"]`);
        if (row) {
            // Calcular la columna según el período (MP1: col2, MP2: col4, MP3: col6)
            const colIndex = currentEditingGrade.periodo === 1 ? 2 : 
                           currentEditingGrade.periodo === 2 ? 4 : 6;
            const input = row.querySelector(`td:nth-child(${colIndex}) .grade-input`);
            
            if (input) {
                input.value = grade;
                input.dispatchEvent(new Event('input'));
                showToast('Nota actualizada', 'success');
            }
        }

        closeModal();
    });

    // Permitir enviar con Enter
    form.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveBtn.click();
        }
    });
});