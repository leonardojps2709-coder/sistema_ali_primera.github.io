// reportes-admin_v3.js
// Reporte de notas por cédula — panel de administración (sin restricción de sección).
// Usa el módulo compartido lib/boletin.js, que dibuja:
//   · el reporte del momento (todas las asignaturas con su nota)
//   · el historial de los tres momentos

(function () {
    'use strict';

    function periodosOrdenados() {
        const lista = (typeof periods !== 'undefined' && Array.isArray(periods)) ? periods.slice() : [];
        return lista.sort((a, b) => {
            const fechaA = new Date(a.fecha_inicio || a.fechaInicio || 0);
            const fechaB = new Date(b.fecha_inicio || b.fechaInicio || 0);
            return fechaB - fechaA;
        });
    }

    /**
     * Llena el selector de períodos conservando la selección del usuario.
     * Se puede llamar en cualquier momento (también antes de cargar los datos).
     */
    function loadPeriodsForReport() {
        const select = document.getElementById('search-student-periodo');
        if (!select) return;

        const lista = periodosOrdenados();
        if (lista.length === 0) return;

        const seleccionado = select.value;

        select.innerHTML = lista.map(p => {
            const estado = p.estado === 'cerrado' ? ' [Cerrado]' : ' [Activo]';
            return `<option value="${p.id}">${escHtml(p.nombre)}${estado}</option>`;
        }).join('');

        const sigueExistiendo = Array.from(select.options).some(o => o.value === seleccionado);
        if (seleccionado && sigueExistiendo) {
            select.value = seleccionado;
        } else {
            const activo = lista.find(p => p.estado === 'activo');
            select.value = activo ? activo.id : lista[0].id;
        }
    }

    function periodoSeleccionado() {
        const select = document.getElementById('search-student-periodo');
        if (!select || !select.value) return null;
        const lista = (typeof periods !== 'undefined' && Array.isArray(periods)) ? periods : [];
        return lista.find(p => String(p.id) === String(select.value)) || null;
    }

    function showReport(estudiante, periodo) {
        const reportContainer = document.getElementById('student-report-container');
        if (!reportContainer) return;

        if (typeof window.Boletin === 'undefined') {
            showToast('No se pudo cargar el módulo del boletín', 'error');
            return;
        }

        window.Boletin.attach(reportContainer, estudiante, { periodo });
        reportContainer.style.display = 'block';
    }

    function buscar() {
        const cedulaInput = document.getElementById('search-student-cedula');
        const reportContainer = document.getElementById('student-report-container');
        if (!cedulaInput || !reportContainer) return;

        const cedulaNum = cedulaInput.value.trim();
        const prefijo = document.getElementById('search-student-cedula-prefix');
        const fullCedula = `${prefijo ? prefijo.value : 'V'}-${cedulaNum}`;

        if (!cedulaNum) {
            showToast('Ingrese una cédula', 'error');
            return;
        }

        const periodo = periodoSeleccionado();
        if (!periodo) {
            showToast('Seleccione un período', 'error');
            return;
        }

        const listaEstudiantes = (typeof students !== 'undefined' && Array.isArray(students)) ? students : [];
        const estudiante = listaEstudiantes.find(s => s.cedula === fullCedula);

        if (!estudiante) {
            showToast('No se encontró un estudiante con esa cédula', 'error');
            reportContainer.style.display = 'none';
            return;
        }

        // El administrador no tiene restricción de sección
        showReport(estudiante, periodo);
    }

    // Disponibles de inmediato para que renderAll() pueda refrescar los períodos
    window.loadPeriodsForReport = loadPeriodsForReport;
    window.showReport = showReport;

    document.addEventListener('DOMContentLoaded', () => {
        const searchBtn = document.getElementById('search-student-btn');
        const cedulaInput = document.getElementById('search-student-cedula');

        if (!searchBtn || !cedulaInput) return;

        loadPeriodsForReport();
        searchBtn.addEventListener('click', buscar);

        cedulaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscar();
            }
        });
    });
})();
