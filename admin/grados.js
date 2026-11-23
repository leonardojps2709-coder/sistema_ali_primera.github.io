// grades.js
// Funciones para la sección de registro de notas

document.addEventListener('DOMContentLoaded', () => {
    // Agregar fila de estudiante en la tabla de notas
    document.getElementById('add-row-btn')?.addEventListener('click', () => {
        const tbody = document.getElementById('grades-tbody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" placeholder="Nombre del alumno..." class="table-input"></td>
            <td><input type="number" class="grade-input" min="0" max="20"></td>
            <td><input type="number" class="grade-input" min="0" max="20"></td>
            <td><input type="number" class="grade-input" min="0" max="20"></td>
            <td class="final-grade">0.00</td>
        `;
        tbody.appendChild(newRow);
    });

    // Guardar calificaciones (simulado)
    document.getElementById('save-grades-btn')?.addEventListener('click', () => {
        showToast('Calificaciones guardadas exitosamente', 'success');
    });

    // Cálculo automático del promedio al ingresar notas
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('grade-input')) {
            const row = e.target.closest('tr');
            const inputs = row.querySelectorAll('.grade-input');
            let total = 0;
            let count = 0;
            inputs.forEach(input => {
                if (input.value !== '') {
                    total += parseFloat(input.value) || 0;
                    count++;
                }
            });
            const finalTd = row.querySelector('.final-grade');
            if (count > 0) {
                finalTd.textContent = (total / 3).toFixed(2);
            } else {
                finalTd.textContent = '0.00';
            }
        }
    });
});