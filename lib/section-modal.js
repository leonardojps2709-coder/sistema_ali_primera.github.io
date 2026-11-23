// lib/section-modal.js
// Lógica compartida para el modal de detalles de sección (Admin y Profesor)

/**
 * Indica si el usuario actual puede editar o eliminar estudiantes.
 *
 * El perfil del profesor es de SOLO VISUALIZACIÓN: allí únicamente se consulta la
 * nómina de la sección, sin botones de editar ni eliminar. La gestión de estudiantes
 * queda reservada al panel de administración.
 */
function puedeGestionarEstudiantes() {
    // En el panel del profesor nunca se gestionan estudiantes, aunque falte la sesión.
    if (window.location.pathname.toLowerCase().indexOf('/profesor/') !== -1) {
        return false;
    }

    try {
        const sesion = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
        if (sesion && sesion.rol === 'teacher') {
            return false;
        }
    } catch (e) {
        // Sesión ilegible: se mantiene el comportamiento del panel de administración.
    }

    return true;
}

window.openSectionDetailModal = function(sectionId) {
    if (!sectionId) return;

    window.currentDetailSectionId = sectionId;

    // Buscar la sección
    const section = typeof sections !== 'undefined' ? sections.find(s => s.id == sectionId) : null;
    if (!section) {
        showToast('No se encontró la sección seleccionada', 'error');
        return;
    }

    // Configurar título
    const titleEl = document.getElementById('section-detail-modal-title');
    if (titleEl) {
        titleEl.textContent = `Detalles: ${section.nombre}`;
    }

    // --- PANEL DE ESTUDIANTES ---
    const studentsListEl = document.getElementById('sd-students-list');
    const studentsCountEl = document.getElementById('sd-students-count');
    
    let sectionStudents = [];
    if (typeof students !== 'undefined') {
        sectionStudents = students.filter(s => s.seccion_id == sectionId || s.seccion == sectionId);
    }

    if (studentsCountEl) {
        studentsCountEl.textContent = sectionStudents.length;
    }

    if (studentsListEl) {
        if (sectionStudents.length === 0) {
            studentsListEl.innerHTML = `<div style="text-align: center; padding: 2rem; color: #94a3b8; font-style: italic; background: #f8fafc; border-radius: 8px;">No hay estudiantes inscritos en esta sección.</div>`;
        } else {
            // Ordenar estudiantes alfabéticamente
            sectionStudents.sort((a, b) => (a.apellido || '').localeCompare(b.apellido || ''));
            
            const puedeGestionar = puedeGestionarEstudiantes();

            studentsListEl.innerHTML = sectionStudents.map(student => {
                // El panel del profesor solo visualiza: sin botones de editar ni eliminar.
                const acciones = puedeGestionar ? `
                            <div style="display: flex; gap: 0.25rem;">
                                <button class="btn-icon edit-student" data-id="${student.id}" title="Editar" style="border: 1px solid #e2e8f0; background: #f8fafc; color: #2563eb; width: 32px; height: 32px; border-radius: 5px; cursor: pointer; font-size: 1.05rem; display: inline-flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#eff6ff'; this.style.borderColor='#bfdbfe';" onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0';"><i class='bx bx-edit-alt'></i></button>
                                <button class="btn-icon delete delete-student" data-id="${student.id}" title="Eliminar" style="border: 1px solid #e2e8f0; background: #f8fafc; color: #dc2626; width: 32px; height: 32px; border-radius: 5px; cursor: pointer; font-size: 1.05rem; display: inline-flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#fef2f2'; this.style.borderColor='#fecaca';" onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0';"><i class='bx bx-trash'></i></button>
                            </div>` : '';

                return `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; transition: background 0.2s;">
                        <div style="flex-grow: 1;">
                            <div style="font-weight: 600; color: #1e293b; font-size: 0.95rem;">${student.apellido}, ${student.nombre}</div>
                            <div style="font-size: 0.8rem; color: #64748b; display: flex; gap: 0.5rem; margin-top: 0.2rem;">
                                <span><i class='bx bx-id-card'></i> ${student.cedula}</span>
                                ${student.telefono ? `<span><i class='bx bx-phone'></i> ${student.telefono}</span>` : ''}
                            </div>
                        </div>${acciones}
                    </div>
                `;
            }).join('');
        }
    }

    // --- PANEL DE PROFESORES Y MATERIAS ---
    const guideTeacherNameEl = document.getElementById('sd-guide-teacher-name');
    const teachersListEl = document.getElementById('sd-teachers-list');

    // Profesor Guía
    if (guideTeacherNameEl) {
        if (section.profesor_guia_nombre) {
            guideTeacherNameEl.textContent = section.profesor_guia_nombre;
        } else if (section.profesor_guia_id && typeof users !== 'undefined') {
            const profe = users.find(u => u.id == section.profesor_guia_id);
            guideTeacherNameEl.textContent = profe ? `${profe.nombre} ${profe.apellido}` : 'No asignado';
        } else {
            guideTeacherNameEl.textContent = 'No asignado';
        }
    }

    if (teachersListEl) {
        let sectionTeachersHtml = '';
        
        // Encontrar profesores asignados a esta sección usando teacher_assignments (asignaciones)
        if (typeof users !== 'undefined') {
            const assignedTeachers = [];
            
            // Recorrer los usuarios que son profesores
            users.filter(u => u.rol === 'teacher').forEach(profe => {
                // Parsear las asignaciones del profesor
                let asignaciones = [];
                try {
                    asignaciones = typeof profe.asignaciones === 'string' 
                        ? JSON.parse(profe.asignaciones) 
                        : (profe.asignaciones || []);
                } catch (e) {
                    asignaciones = [];
                }
                
                // Filtrar asignaciones que correspondan a esta sección
                const asignacionesSeccion = asignaciones.filter(a => 
                    parseInt(a.seccion_id) === parseInt(sectionId)
                );
                
                if (asignacionesSeccion.length > 0) {
                    assignedTeachers.push({
                        profesor: profe,
                        materias: asignacionesSeccion.map(a => a.materia_nombre || a.materia || '')
                    });
                }
            });

            if (assignedTeachers.length === 0) {
                sectionTeachersHtml = `<div style="text-align: center; padding: 2rem; color: #94a3b8; font-style: italic; background: #f8fafc; border-radius: 8px;">No hay profesores asignados.</div>`;
            } else {
                sectionTeachersHtml = assignedTeachers.map(item => {
                    const profe = item.profesor;
                    const materiasNombres = item.materias.map(m => `<span style="background: #f1f5f9; color: #475569; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; border: 1px solid #e2e8f0; display: inline-block; margin-right: 4px; margin-bottom: 4px;">${m}</span>`).join('');
                    
                    return `
                        <div style="display: flex; gap: 1rem; padding: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <div style="flex-grow: 1;">
                                <div style="font-weight: 600; color: #1e293b; font-size: 0.95rem;">${profe.nombre} ${profe.apellido}</div>
                                <div style="margin-top: 0.4rem;">
                                    ${materiasNombres}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } else {
            sectionTeachersHtml = `<div style="text-align: center; padding: 1rem; color: #94a3b8;">No se pudo cargar la lista de profesores.</div>`;
        }
        teachersListEl.innerHTML = sectionTeachersHtml;
    }

    // Mostrar Modal
    const overlay = document.getElementById('section-detail-modal-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        // Force reflow
        void overlay.offsetWidth;
        overlay.classList.add('active');
    }
};

window.closeSectionDetailModal = function() {
    const overlay = document.getElementById('section-detail-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300); // Wait for transition
    }
};

// Configurar delegación de eventos para las tarjetas de sección
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('#sections-cards-container');
    
    containers.forEach(container => {
        container.addEventListener('click', (e) => {
            // Ignorar clics en botones de editar o eliminar
            if (e.target.closest('.edit-section') || e.target.closest('.delete-section')) {
                return;
            }

            const card = e.target.closest('.section-card-clickable');
            if (card) {
                const sectionId = card.getAttribute('data-id');
                if (sectionId) {
                    window.openSectionDetailModal(sectionId);
                }
            }
        });
    });

    // Cerrar modal al hacer clic en el overlay (fuera del contenido)
    const overlay = document.getElementById('section-detail-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                window.closeSectionDetailModal();
            }
        });
    }
});
