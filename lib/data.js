// data.js - Datos con persistencia en MySQL a través de PHP API

// Variables globales para mantener el estado (se llenan desde la DB)
let users = [];
let students = [];
let mentions = [];
let sections = [];
let periods = [];
let grades = [];
let subjects = [];

/**
 * Escapa texto para insertarlo dentro de HTML.
 * Se usa con valores que el usuario escribe libremente, como el nombre de un período.
 */
function escHtml(valor) {
    return String(valor === null || valor === undefined ? '' : valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
window.escHtml = escHtml;

/**
 * Rendimiento académico por estudiante, calculado a partir de la tabla `notas`.
 *
 * Devuelve un Map (id del estudiante -> datos):
 *   promedio  media de las definitivas de cada materia calificada
 *   momentos  { 1, 2, 3 } promedio del estudiante en cada momento (null si no hay notas)
 *   lugar     posición dentro de su sección; los empates comparten lugar
 *   materias  cantidad de materias con al menos una nota
 *
 * Las filas de `notas` sin ningún momento cargado se ignoran: en la base existen
 * filas de relleno con los tres momentos en NULL y `definitiva` en 0.
 */
function calcularRendimientoEstudiantes() {
    const listaNotas = (typeof grades !== 'undefined' && Array.isArray(grades)) ? grades : [];
    const listaEstudiantes = (typeof students !== 'undefined' && Array.isArray(students)) ? students : [];

    const acumulado = new Map();

    listaNotas.forEach(nota => {
        const id = parseInt(nota.estudiante_id || nota.studentId, 10);
        if (isNaN(id)) return;

        const valores = [1, 2, 3].map(m => {
            const v = nota['mp' + m];
            if (v === null || v === undefined || v === '') return null;
            const n = parseFloat(v);
            return isNaN(n) ? null : n;
        });

        const cargados = valores.filter(v => v !== null);
        if (cargados.length === 0) return; // materia sin calificar

        const acc = acumulado.get(id) || {
            suma: 0,
            cantidad: 0,
            momentos: { 1: { s: 0, c: 0 }, 2: { s: 0, c: 0 }, 3: { s: 0, c: 0 } }
        };

        acc.suma += cargados.reduce((a, b) => a + b, 0) / cargados.length;
        acc.cantidad += 1;

        valores.forEach((valor, indice) => {
            if (valor === null) return;
            acc.momentos[indice + 1].s += valor;
            acc.momentos[indice + 1].c += 1;
        });

        acumulado.set(id, acc);
    });

    const rendimiento = new Map();
    acumulado.forEach((acc, id) => {
        const promedioMomento = (m) => acc.momentos[m].c > 0 ? acc.momentos[m].s / acc.momentos[m].c : null;

        rendimiento.set(id, {
            promedio: acc.suma / acc.cantidad,
            materias: acc.cantidad,
            momentos: { 1: promedioMomento(1), 2: promedioMomento(2), 3: promedioMomento(3) },
            lugar: null
        });
    });

    // Lugares dentro de cada sección
    const porSeccion = new Map();
    listaEstudiantes.forEach(estudiante => {
        const id = parseInt(estudiante.id, 10);
        const info = rendimiento.get(id);
        if (!info) return;

        const seccionId = parseInt(estudiante.seccion_id || estudiante.seccion, 10);
        if (isNaN(seccionId)) return;

        if (!porSeccion.has(seccionId)) porSeccion.set(seccionId, []);
        porSeccion.get(seccionId).push({ id, promedio: info.promedio });
    });

    porSeccion.forEach(lista => {
        lista.sort((a, b) => b.promedio - a.promedio);

        let lugar = 0;
        let promedioAnterior = null;

        lista.forEach((item, indice) => {
            const empata = promedioAnterior !== null && Math.abs(item.promedio - promedioAnterior) < 0.005;
            if (!empata) {
                lugar = indice + 1;
                promedioAnterior = item.promedio;
            }
            rendimiento.get(item.id).lugar = lugar;
        });
    });

    return rendimiento;
}
window.calcularRendimientoEstudiantes = calcularRendimientoEstudiantes;

/** Formatea una nota a dos decimales, o un guion si no hay valor. */
function formatearNota(valor) {
    if (valor === null || valor === undefined || valor === '') return '—';
    const n = parseFloat(valor);
    return isNaN(n) ? '—' : n.toFixed(2);
}
window.formatearNota = formatearNota;

// Función interna para determinar la URL de la API de forma absoluta y robusta
function getApiBaseUrl() {
    // 1. Prioridad: Variable global definida en el HTML
    if (window.API_PATH) {
        console.log("Ruta de API obtenida de window.API_PATH:", window.API_PATH);
        return window.API_PATH;
    }
    
    // 2. Detección por ubicación del script data.js (más robusta contra query strings)
    const scripts = document.getElementsByTagName('script');
    for (let s of scripts) {
        // Buscamos lib/data.js ignorando el query string (?v=...)
        if (s.src && s.src.includes('lib/data.js')) {
            const baseUrl = s.src.split('lib/data.js')[0] + 'api/main.php';
            console.log("Ruta de API detectada mediante script tag:", baseUrl);
            return baseUrl;
        }
    }
    
    // 3. Fallback: Detección por carpeta actual en la URL
    const path = window.location.pathname.toLowerCase();
    const isInSubfolder = path.includes('/login') || path.includes('/admin') || path.includes('/profesor');
    const fallback = isInSubfolder ? '../api/main.php' : 'api/main.php';
    console.log("Ruta de API usando fallback (subfolder: " + isInSubfolder + "):", fallback);
    return fallback;
}


/**
 * Inicializa todos los datos desde la base de datos MySQL
 * Esta función es ASÍNCRONA. Debe ser esperada al inicio de la app.
 */
async function initData() {
    try {
        console.log("Iniciando carga de datos desde MySQL...");
        const baseUrl = getApiBaseUrl();
        const finalUrl = `${baseUrl}?action=get_all_data&v=${new Date().getTime()}`;
        console.log("Fetch URL:", finalUrl);
        
        const response = await fetch(finalUrl);
        if (!response.ok) {
            throw new Error(`Error de conexión (HTTP ${response.status}): ${response.statusText || 'No se pudo encontrar el archivo api/main.php'}`);
        }
        
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Respuesta del servidor no es JSON válido:", responseText);
            throw new Error("El servidor devolvió un formato incorrecto (no es JSON). Verifique si Apache está procesando PHP.");
        }
        
        // Sincronizar variables globales
        users = data.users || [];
        students = data.students || [];
        mentions = data.mentions || [];
        sections = data.sections || [];
        periods = data.periods || [];
        grades = data.grades || [];
        subjects = data.subjects || [];

        // Post-procesar usuarios (convertir strings a arrays si es necesario)
        users = users.map(u => {
            if (u.rol === 'teacher') {
                let asig = [];
                try {
                    asig = typeof u.asignaciones === 'string' ? JSON.parse(u.asignaciones) : (u.asignaciones || []);
                } catch (e) {}
                u.secciones = asig.map(a => parseInt(a.seccion_id)).filter(id => !isNaN(id));
            }
            return u;
        });
        
        window.users = users;
        window.students = students;
        window.mentions = mentions;
        window.sections = sections;
        window.periods = periods;
        window.grades = grades;
        window.subjects = subjects;

        console.log("Datos cargados exitosamente:", data);
        
        // Notificar al sistema que los datos están listos
        if (typeof renderAll === 'function') {
            renderAll();
        }

        if (window.EvaluacionesManager && typeof window.EvaluacionesManager.init === 'function') {
            window.EvaluacionesManager.init();
        }
        
        return true;
    } catch (error) {
        console.error("Error crítico cargando datos:", error);
        return false;
    }
}

// Helper para llamadas a la API
async function apiCall(action, data = null) {
    try {
        const baseUrl = getApiBaseUrl();
        const url = `${baseUrl}?action=${action}`;
        
        let payload = data;
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
            try {
                const cu = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
                if (cu) {
                    if (!payload.actor_user_id && cu.id) payload.actor_user_id = cu.id;
                    if (!payload.actor_nombre) payload.actor_nombre = `${cu.nombre || ''} ${cu.apellido || ''}`.trim() || cu.cedula || 'Usuario';
                    if (!payload.actor_rol) payload.actor_rol = cu.rol || 'admin';
                }
            } catch(e) {}
        }

        const options = {
            method: payload ? 'POST' : 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (payload) options.body = JSON.stringify(payload);
        
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error(`Error en API (${action}):`, error);
        return { success: false, error: error.message };
    }
}

// ========== CRUD USUARIOS ==========
async function addUser(userData) {
    const res = await apiCall('save_user', userData);
    if (res.success) await initData();
    return res;
}

async function updateUser(id, newData) {
    const res = await apiCall('save_user', { id, ...newData });
    if (res.success) await initData();
    return res;
}

async function deleteUser(id) {
    const res = await apiCall('delete_user', { id });
    if (res.success) await initData();
    return res;
}

async function toggleUserStatus(id, activo) {
    const res = await apiCall('toggle_user_status', { id, activo });
    if (res.success) await initData();
    return res;
}
window.toggleUserStatus = toggleUserStatus;

// ========== CRUD ESTUDIANTES ==========
async function addStudent(studentData) {
    const res = await apiCall('save_student', studentData);
    if (res.success) await initData();
    return res;
}

async function updateStudent(id, newData) {
    const res = await apiCall('save_student', { id, ...newData });
    if (res.success) await initData();
    return res;
}

async function deleteStudent(id) {
    const res = await apiCall('delete_student', { id });
    if (res.success) await initData();
    return res;
}

async function toggleStudentStatus(id, activo) {
    const res = await apiCall('toggle_student_status', { id, activo });
    if (res.success) await initData();
    return res;
}
window.toggleStudentStatus = toggleStudentStatus;

// ========== CRUD MENCIONES ==========
async function addMention(nombreOrData, color = null, icono = null) {
    let payload = {};
    if (typeof nombreOrData === 'object' && nombreOrData !== null) {
        payload = nombreOrData;
    } else {
        payload = { nombre: nombreOrData, color, icono };
    }
    const res = await apiCall('save_mention', payload);
    if (res.success) await initData();
    return res;
}

async function updateMention(id, nombreOrData, color = null, icono = null) {
    let payload = { id };
    if (typeof nombreOrData === 'object' && nombreOrData !== null) {
        payload = { ...payload, ...nombreOrData };
    } else {
        payload = { ...payload, nombre: nombreOrData, color, icono };
    }
    const res = await apiCall('save_mention', payload);
    if (res.success) await initData();
    return res;
}

async function deleteMention(id) {
    const res = await apiCall('delete_mention', { id });
    if (res.success) await initData();
    return res;
}

// ========== CRUD SECCIONES ==========
async function addSection(nombre, mencionId, profesorGuiaNombre, profesorGuiaId = null) {
    const res = await apiCall('save_section', { nombre, mencionId, profesorGuiaNombre, profesorGuiaId });
    if (res.success) await initData();
    return res;
}

async function updateSection(id, nombre, mencionId, profesorGuiaNombre, profesorGuiaId = null) {
    const res = await apiCall('save_section', { id, nombre, mencionId, profesorGuiaNombre, profesorGuiaId });
    if (res.success) await initData();
    return res;
}

async function deleteSection(id) {
    const res = await apiCall('delete_section', { id });
    if (res.success) await initData();
    return res;
}

// ========== CRUD PERÍODOS ==========
async function addPeriod(periodData) {
    const res = await apiCall('save_period', periodData);
    if (res.success) await initData();
    return res;
}

async function updatePeriod(id, periodData) {
    const res = await apiCall('save_period', { id, ...periodData });
    if (res.success) await initData();
    return res;
}

async function deletePeriod(id) {
    const res = await apiCall('delete_period', { id });
    if (res.success) await initData();
    return res;
}

// ========== CRUD NOTAS ==========
async function addGrade(gradeData) {
    const res = await apiCall('save_grade', gradeData);
    if (res.success) await initData();
    return res;
}

async function updateGrade(id, newData) {
    const res = await apiCall('save_grade', { id, ...newData });
    if (res.success) await initData();
    return res;
}

function getGradesBySectionAndSubject(sectionId, subject, periodoStr) {
    // Buscar el ID del período basado en el string "2023-2024"
    const periodObj = periods.find(p => p.nombre === periodoStr);
    const periodoId = periodObj ? periodObj.id : null;
    
    // Esta sigue siendo sincrónica porque usa el estado global 'grades' ya cargado
    return grades.filter(g => parseInt(g.seccion_id) === parseInt(sectionId) && g.materia === subject && parseInt(g.periodo_id) === parseInt(periodoId));
}

// ========== CRUD ASIGNATURAS ==========
async function addSubject(subjectData) {
    const res = await apiCall('save_subject', subjectData);
    if (res.success) await initData();
    return res;
}

async function updateSubject(id, subjectData) {
    const res = await apiCall('save_subject', { id, ...subjectData });
    if (res.success) await initData();
    return res;
}

async function deleteSubject(id) {
    const res = await apiCall('delete_subject', { id });
    if (res.success) await initData();
    return res;
}

// Exportar helpers globales
window.dataHelpers = {
    initData,
    getGradesBySectionAndSubject,
    addGrade, updateGrade,
    addSubject, updateSubject, deleteSubject
};

// Exponer funciones CRUD al ámbito global (para los botones de los modales)
window.addStudent = addStudent;
window.updateStudent = updateStudent;
window.deleteStudent = deleteStudent;
window.addUser = addUser;
window.updateUser = updateUser;
window.deleteUser = deleteUser;
window.addSection = addSection;
window.updateSection = updateSection;
window.deleteSection = deleteSection;
window.addPeriod = addPeriod;
window.updatePeriod = updatePeriod;
window.deletePeriod = deletePeriod;
window.addMention = addMention;
window.updateMention = updateMention;
window.deleteMention = deleteMention;
window.addSubject = addSubject;
window.updateSubject = updateSubject;
window.deleteSubject = deleteSubject;

// Renderiza notificaciones de fechas de vaciado en el perfil
window.renderVaciadoNotifications = function() {
    // Buscar el período activo
    const activePeriod = periods.find(p => p.estado !== 'cerrado');
    if (!activePeriod) return;

    // Buscar el contenedor de información de usuario en la barra lateral
    const userInfoLink = document.getElementById('user-info-link');
    if (!userInfoLink) return;

    // Eliminar contenedor anterior de la pantalla de inicio si existe
    const oldContainer = document.getElementById('vaciados-notification-container');
    if (oldContainer) {
        oldContainer.style.display = 'none';
    }

    // Formatear fechas
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Sin fecha';
        const d = new Date(dateStr);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const d1 = formatDate(activePeriod.fecha_mp1 || activePeriod.fechaMP1);
    const d2 = formatDate(activePeriod.fecha_mp2 || activePeriod.fechaMP2);
    const d3 = formatDate(activePeriod.fecha_mp3 || activePeriod.fechaMP3);

    // Preparar el badge si no existe
    let badge = document.getElementById('profile-notification-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.id = 'profile-notification-badge';
        badge.style.cssText = 'position: absolute; top: 10px; left: 30px; background: #ef4444; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--sidebar-bg, #4a151b); box-shadow: 0 0 0 2px rgba(255,255,255,0.2);';
        
        // Agregar position relative al link para anclar el badge
        userInfoLink.style.position = 'relative';
        
        // Insertar el badge justo después del ícono de usuario
        const userIcon = userInfoLink.querySelector('i.bx-user-circle');
        if (userIcon) {
            userIcon.after(badge);
        } else {
            userInfoLink.appendChild(badge);
        }
    }

    // Preparar el popup (tooltip)
    let popup = document.getElementById('profile-notification-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'profile-notification-popup';
        popup.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            width: 250px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            z-index: 1000;
            display: none;
            color: #1e293b;
            cursor: default;
        `;
        userInfoLink.appendChild(popup);

        // Lógica para mostrar/ocultar al hacer hover
        userInfoLink.addEventListener('mouseenter', () => { popup.style.display = 'block'; });
        userInfoLink.addEventListener('mouseleave', () => { popup.style.display = 'none'; });
    }

    // Actualizar contenido del popup
    popup.innerHTML = `
        <div style="font-size: 0.8rem; font-weight: 600; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px; display: flex; align-items: center; gap: 5px;">
            <i class='bx bx-bell'></i> Fechas de Vaciado
        </div>
        <div style="font-size: 0.75rem; color: #475569; margin-bottom: 6px;">
            Período: <strong style="color: #1e293b;">${escHtml(activePeriod.nombre)}</strong>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.75rem;">
            <div style="display: flex; justify-content: space-between;"><span>1er Momento:</span> <strong>${d1}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>2do Momento:</span> <strong>${d2}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>3er Momento:</span> <strong>${d3}</strong></div>
        </div>
        <!-- flechita abajo -->
        <div style="position: absolute; bottom: -6px; left: 20px; width: 10px; height: 10px; background: white; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; transform: rotate(45deg);"></div>
    `;
};