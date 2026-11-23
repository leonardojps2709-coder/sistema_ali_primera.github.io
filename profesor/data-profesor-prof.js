// data.js - Datos con persistencia en localStorage

// Claves para localStorage
const STORAGE_KEYS = {
    USERS: 'sistema_escolar_users',
    STUDENTS: 'sistema_escolar_students',
    MENTIONS: 'sistema_escolar_mentions',
    SECTIONS: 'sistema_escolar_sections',
    PERIODS: 'sistema_escolar_periods',
    GRADES: 'sistema_escolar_grades'
};

// Datos iniciales por defecto
const DEFAULT_DATA = {
    users: [], // Administradores, profesores y estudiantes
    students: [], // (Opcional, si se separan estudiantes de users)
    mentions: [
        { id: 1, nombre: 'Electricidad' },
        { id: 2, nombre: 'Metalmecánica' },
        { id: 3, nombre: 'Refinación y Petroquímica' },
        { id: 4, nombre: 'Gestión Integral de Riesgo' }
    ],
    sections: [
    
    ],
    periods: [
        { id: 1, nombre: '2023-2024', fechaInicio: '2023-09-15', fechaFin: '2024-07-15' },
        { id: 2, nombre: '2024-2025', fechaInicio: '2024-09-15', fechaFin: '2025-07-15' },
        { id: 3, nombre: '2025-2026', fechaInicio: '2025-09-15', fechaFin: '2026-07-15' }
    ],
    grades: [] // Para almacenar calificaciones
};

// Función para cargar datos desde localStorage
function loadFromStorage(key, defaultValue) {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error(`Error parsing ${key} from localStorage:`, e);
            return defaultValue;
        }
    }
    return defaultValue;
}

// Función para guardar datos en localStorage
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Variables globales (se cargan desde localStorage)
let users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_DATA.users);
let students = loadFromStorage(STORAGE_KEYS.STUDENTS, DEFAULT_DATA.students);
let mentions = loadFromStorage(STORAGE_KEYS.MENTIONS, DEFAULT_DATA.mentions);
let sections = loadFromStorage(STORAGE_KEYS.SECTIONS, DEFAULT_DATA.sections);
let periods = loadFromStorage(STORAGE_KEYS.PERIODS, DEFAULT_DATA.periods);
let grades = loadFromStorage(STORAGE_KEYS.GRADES, DEFAULT_DATA.grades);

// ========== FUNCIONES CRUD PARA USUARIOS ==========
function addUser(userData) {
    const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = { id: newId, ...userData };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    if (typeof renderAll === 'function') renderAll();
    return newUser;
}

function updateUser(id, newData) {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...newData };
        saveToStorage(STORAGE_KEYS.USERS, users);
        if (typeof renderAll === 'function') renderAll();
        return true;
    }
    return false;
}

function deleteUser(id) {
    users = users.filter(u => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS, users);
    if (typeof renderAll === 'function') renderAll();
    return true;
}

// ========== FUNCIONES CRUD PARA MENCIONES ==========
function addMention(nombre) {
    const newId = mentions.length ? Math.max(...mentions.map(m => m.id)) + 1 : 1;
    const newMention = { id: newId, nombre };
    mentions.push(newMention);
    saveToStorage(STORAGE_KEYS.MENTIONS, mentions);
    if (typeof renderAll === 'function') renderAll();
    return newMention;
}

function updateMention(id, nombre) {
    const index = mentions.findIndex(m => m.id === id);
    if (index !== -1) {
        mentions[index].nombre = nombre;
        saveToStorage(STORAGE_KEYS.MENTIONS, mentions);
        if (typeof renderAll === 'function') renderAll();
        return true;
    }
    return false;
}

function deleteMention(id) {
    mentions = mentions.filter(m => m.id !== id);
    saveToStorage(STORAGE_KEYS.MENTIONS, mentions);
    if (typeof renderAll === 'function') renderAll();
    return true;
}

// ========== FUNCIONES CRUD PARA SECCIONES ==========
function addSection(nombre, mencionId) {
    const newId = sections.length ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    const newSection = { id: newId, nombre, mencionId: parseInt(mencionId) };
    sections.push(newSection);
    saveToStorage(STORAGE_KEYS.SECTIONS, sections);
    if (typeof renderAll === 'function') renderAll();
    return newSection;
}

function updateSection(id, nombre, mencionId) {
    const index = sections.findIndex(s => s.id === id);
    if (index !== -1) {
        sections[index] = { id, nombre, mencionId: parseInt(mencionId) };
        saveToStorage(STORAGE_KEYS.SECTIONS, sections);
        if (typeof renderAll === 'function') renderAll();
        return true;
    }
    return false;
}

function deleteSection(id) {
    sections = sections.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.SECTIONS, sections);
    if (typeof renderAll === 'function') renderAll();
    return true;
}

// ========== FUNCIONES CRUD PARA PERÍODOS ==========
function addPeriod(periodData) {
    const newId = periods.length ? Math.max(...periods.map(p => p.id)) + 1 : 1;
    const newPeriod = { id: newId, ...periodData };
    periods.push(newPeriod);
    saveToStorage(STORAGE_KEYS.PERIODS, periods);
    return newPeriod;
}

function updatePeriod(id, periodData) {
    const index = periods.findIndex(p => p.id === id);
    if (index !== -1) {
        periods[index] = { ...periods[index], ...periodData };
        saveToStorage(STORAGE_KEYS.PERIODS, periods);
        return true;
    }
    return false;
}

function deletePeriod(id) {
    periods = periods.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PERIODS, periods);
    return true;
}

// ========== FUNCIONES CRUD PARA CALIFICACIONES ==========
function addGrade(gradeData) {
    const newId = grades.length ? Math.max(...grades.map(g => g.id)) + 1 : 1;
    const newGrade = { id: newId, ...gradeData };
    grades.push(newGrade);
    saveToStorage(STORAGE_KEYS.GRADES, grades);
    return newGrade;
}

function updateGrade(id, newData) {
    const index = grades.findIndex(g => g.id === id);
    if (index !== -1) {
        grades[index] = { ...grades[index], ...newData };
        saveToStorage(STORAGE_KEYS.GRADES, grades);
        return true;
    }
    return false;
}

function deleteGrade(id) {
    grades = grades.filter(g => g.id !== id);
    saveToStorage(STORAGE_KEYS.GRADES, grades);
    return true;
}

function getGradesBySectionAndSubject(sectionId, subject) {
    return grades.filter(g => g.sectionId == sectionId && g.subject === subject);
}

// ========== FUNCIÓN PARA EXPORTAR/IMPORTAR ==========
function exportAllData() {
    const allData = {
        users, students, mentions, sections, periods, grades,
        exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `sistema_escolar_backup_${new Date().toISOString().slice(0,10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importAllData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        if (data.users) { users = data.users; saveToStorage(STORAGE_KEYS.USERS, users); }
        if (data.students) { students = data.students; saveToStorage(STORAGE_KEYS.STUDENTS, students); }
        if (data.mentions) { mentions = data.mentions; saveToStorage(STORAGE_KEYS.MENTIONS, mentions); }
        if (data.sections) { sections = data.sections; saveToStorage(STORAGE_KEYS.SECTIONS, sections); }
        if (data.periods) { periods = data.periods; saveToStorage(STORAGE_KEYS.PERIODS, periods); }
        if (data.grades) { grades = data.grades; saveToStorage(STORAGE_KEYS.GRADES, grades); }
        if (typeof renderAll === 'function') renderAll();
        return true;
    } catch (e) {
        console.error('Error importing data:', e);
        return false;
    }
}

// Hacer funciones disponibles globalmente
window.dataHelpers = {
    exportAllData, importAllData,
    getGradesBySectionAndSubject, addGrade, updateGrade, deleteGrade
};