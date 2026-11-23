// lib/reportes.js
// Generador unificado de reportes y boletines de calificaciones
// Compatible con panel de Administrador y de Profesor (con validación de permisos por sección)

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-student-btn');
    const cedulaInput = document.getElementById('search-student-cedula');
    const prefixInput = document.getElementById('search-student-cedula-prefix');
    const reportContainer = document.getElementById('student-report-container');

    if (!searchBtn || !cedulaInput || !reportContainer) return;

    function formatNumber(num) {
        return num !== null && num !== '' && !isNaN(num) ? parseFloat(num).toFixed(2) : '-';
    }

    function showReport(student) {
        const studentList = typeof students !== 'undefined' ? students : [];
        const gradeList = typeof grades !== 'undefined' ? grades : [];
        const sectionList = typeof sections !== 'undefined' ? sections : [];

        // Filtro robusto compatible con MySQL (estudiante_id) y legacy (studentId)
        const studentGrades = gradeList.filter(g => (g.estudiante_id == student.id || g.studentId == student.id));
        const studentSectionId = parseInt(student.seccion_id || student.seccion);
        const section = sectionList.find(s => s.id === studentSectionId);

        let allSubjects = [];
        if (section) {
            const anio = typeof extraerAnio === 'function' ? extraerAnio(section.nombre) : 1;
            const mencionId = section.mencion_id || section.mencionId;
            if (typeof getMateriasByMencionAndAnio === 'function') {
                allSubjects = getMateriasByMencionAndAnio(mencionId, anio);
            }
        }

        const sectionName = typeof getSectionName === 'function' 
            ? getSectionName(studentSectionId) 
            : (section ? section.nombre : 'Sin sección');

        let tableRows = '';
        if (allSubjects.length === 0) {
            tableRows = `<tr><td colspan="8" style="padding: 20px; text-align: center; color: #64748b;">No hay asignaturas registradas para esta sección</td></tr>`;
        } else {
            tableRows = allSubjects.map(subject => {
                const grade = studentGrades.find(g => (g.materia === subject || g.subject === subject));
                const mp1 = grade && grade.mp1 !== null ? grade.mp1 : null;
                const inas1 = grade ? (grade.inas1 || 0) : 0;
                const mp2 = grade && grade.mp2 !== null ? grade.mp2 : null;
                const inas2 = grade ? (grade.inas2 || 0) : 0;
                const mp3 = grade && grade.mp3 !== null ? grade.mp3 : null;
                const inas3 = grade ? (grade.inas3 || 0) : 0;
                const definitiva = grade && grade.definitiva !== null ? grade.definitiva : null;

                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${subject}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${formatNumber(mp1)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${inas1}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${formatNumber(mp2)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${inas2}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${formatNumber(mp3)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${inas3}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 700;">${formatNumber(definitiva)}</td>
                    </tr>
                `;
            }).join('');
        }

        const tableHtml = `
            <div style="background: white; border-radius: 10px; border: 1px solid #e2e8f0; padding: 1.5rem; margin-top: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4a151b; padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
                    <h3 style="margin: 0; color: #4a151b; font-size: 1.3rem;"><i class='bx bx-file'></i> Boletín de Calificaciones</h3>
                    <span style="color: #64748b; font-size: 0.85rem;">Emitido: ${new Date().toLocaleDateString('es-ES')}</span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
                    <div><strong style="color:#64748b; font-size:0.8rem; display:block;">ESTUDIANTE</strong><span style="font-weight:600; color:#1e293b;">${student.apellido}, ${student.nombre}</span></div>
                    <div><strong style="color:#64748b; font-size:0.8rem; display:block;">CÉDULA</strong><span style="font-weight:600; color:#1e293b;">${student.cedula}</span></div>
                    <div><strong style="color:#64748b; font-size:0.8rem; display:block;">SECCIÓN</strong><span style="font-weight:600; color:#1e293b;">${sectionName}</span></div>
                </div>

                <div class="table-responsive">
                    <table class="grades-table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #4a151b; color: white;">
                                <th style="padding: 10px; text-align: left;">Asignatura</th>
                                <th style="padding: 10px; text-align: center;">M.P.1</th>
                                <th style="padding: 10px; text-align: center;">Inas</th>
                                <th style="padding: 10px; text-align: center;">M.P.2</th>
                                <th style="padding: 10px; text-align: center;">Inas</th>
                                <th style="padding: 10px; text-align: center;">M.P.3</th>
                                <th style="padding: 10px; text-align: center;">Inas</th>
                                <th style="padding: 10px; text-align: center;">Definitiva</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 1.5rem; text-align: center;">
                    <button class="btn-primary" id="print-report-btn">
                        <i class='bx bx-printer'></i> Imprimir Reporte
                    </button>
                </div>
            </div>
        `;

        reportContainer.innerHTML = tableHtml;
        reportContainer.style.display = 'block';

        // Evento de impresión
        const printBtn = document.getElementById('print-report-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <title>Boletín de Notas - ${student.nombre} ${student.apellido}</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
                            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #4a151b; padding-bottom: 15px; }
                            .header h2 { margin: 0; color: #4a151b; font-size: 22px; }
                            .header p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
                            .info-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 25px; }
                            .info-box div strong { font-size: 11px; color: #64748b; display: block; }
                            .info-box div span { font-size: 15px; font-weight: 600; }
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 13px; }
                            th { background-color: #4a151b; color: white; }
                            td:first-child { text-align: left; font-weight: 500; }
                            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h2>E.T. "Alí Primera"</h2>
                            <p>Sistema de Control de Estudios - Boletín Informativo</p>
                        </div>
                        <div class="info-box">
                            <div><strong>ESTUDIANTE</strong><span>${student.apellido}, ${student.nombre}</span></div>
                            <div><strong>CÉDULA</strong><span>${student.cedula}</span></div>
                            <div><strong>SECCIÓN</strong><span>${sectionName}</span></div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Asignatura</th>
                                    <th>M.P. 1</th>
                                    <th>Inas</th>
                                    <th>M.P. 2</th>
                                    <th>Inas</th>
                                    <th>M.P. 3</th>
                                    <th>Inas</th>
                                    <th>Definitiva</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                        <div class="footer">
                            Documento informativo emitido el ${new Date().toLocaleDateString('es-ES')} por el Sistema Escolar E.T. "Alí Primera".
                        </div>
                    </body>
                    </html>
                `);
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            });
        }
    }

    searchBtn.addEventListener('click', () => {
        const cedulaNum = cedulaInput.value.trim();
        const cedulaPrefix = prefixInput ? prefixInput.value : '';
        const fullCedula = cedulaPrefix ? `${cedulaPrefix}-${cedulaNum}` : cedulaNum;

        if (!cedulaNum) {
            if (typeof showToast === 'function') showToast('Por favor ingrese un número de cédula', 'error');
            return;
        }

        const studentList = typeof students !== 'undefined' ? students : [];
        const student = studentList.find(s => s.cedula === fullCedula || s.cedula.replace(/^[vVeE][-\s]?/, '') === cedulaNum);

        if (!student) {
            if (typeof showToast === 'function') showToast('No se encontró un estudiante con esa cédula', 'error');
            reportContainer.style.display = 'none';
            return;
        }

        // Si es profesor, verificar que el estudiante pertenezca a una de sus secciones asignadas
        if (window.currentTeacher && window.currentTeacher.secciones) {
            const studentSectionId = parseInt(student.seccion_id || student.seccion);
            if (!window.currentTeacher.secciones.includes(studentSectionId)) {
                if (typeof showToast === 'function') {
                    showToast('No tiene permisos para ver las notas de este estudiante (no pertenece a sus secciones)', 'error');
                }
                reportContainer.style.display = 'none';
                return;
            }
        }

        showReport(student);
    });

    // Permitir buscar al presionar Enter
    cedulaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
});
