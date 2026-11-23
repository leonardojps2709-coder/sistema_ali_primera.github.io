// materias.js
// Datos de materias según los planes de estudio

const materiasPorMencion = {
    // Electricidad
    1: {
        nombre: 'Electricidad',
        materias: {
            general: {
                1: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                2: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                3: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                4: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                5: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional']
            },
            cientifica: {
                1: ['Proyecto de Economía Socioproductiva y Tecnología', 'Máquina, Distribución y Control'],
                2: ['Proyecto de Economía Socioproductiva y Tecnología', 'Máquina, Distribución y Control'],
                3: ['Proyecto de Economía Socioproductiva y Tecnología', 'Máquina, Distribución y Control'],
                4: ['Proyecto de Economía Socioproductiva y Tecnología', 'Máquina, Distribución y Control'],
                5: ['Proyecto de Economía Socioproductiva y Tecnología', 'Máquina, Distribución y Control']
            },
            practica: {
                1: ['Orientación y Vinculación Sociolaboral'],
                2: ['Orientación y Vinculación Sociolaboral'],
                3: ['Orientación y Vinculación Sociolaboral'],
                4: ['Orientación y Vinculación Sociolaboral'],
                5: ['Orientación y Vinculación Sociolaboral'],
                6: ['Práctica Profesional']
            }
        }
    },
    
    // Metalmecánica
    2: {
        nombre: 'Metalmecánica',
        materias: {
            general: {
                1: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                2: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                3: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                4: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                5: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional']
            },
            cientifica: {
                1: ['Proyecto de Economía Socioproductiva y Tecnología', 'Mantenimiento, Máquinas y Herramientas'],
                2: ['Proyecto de Economía Socioproductiva y Tecnología', 'Mantenimiento, Máquinas y Herramientas'],
                3: ['Proyecto de Economía Socioproductiva y Tecnología', 'Mantenimiento, Máquinas y Herramientas'],
                4: ['Proyecto de Economía Socioproductiva y Tecnología', 'Mantenimiento, Máquinas y Herramientas'],
                5: ['Proyecto de Economía Socioproductiva y Tecnología', 'Mantenimiento, Máquinas y Herramientas']
            },
            practica: {
                1: ['Orientación y Vinculación Sociolaboral'],
                2: ['Orientación y Vinculación Sociolaboral'],
                3: ['Orientación y Vinculación Sociolaboral'],
                4: ['Orientación y Vinculación Sociolaboral'],
                5: ['Orientación y Vinculación Sociolaboral'],
                6: ['Práctica Profesional']
            }
        }
    },
    
    // Refinación y Petroquímica
    3: {
        nombre: 'Refinación y Petroquímica',
        materias: {
            general: {
                1: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                2: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                3: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                4: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                5: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional']
            },
            cientifica: {
                1: ['Proyecto de Economía Socioproductiva y Tecnología', 'Producción Petroquímica'],
                2: ['Proyecto de Economía Socioproductiva y Tecnología', 'Producción Petroquímica'],
                3: ['Proyecto de Economía Socioproductiva y Tecnología', 'Producción Petroquímica'],
                4: ['Proyecto de Economía Socioproductiva y Tecnología', 'Producción Petroquímica'],
                5: ['Proyecto de Economía Socioproductiva y Tecnología', 'Producción Petroquímica']
            },
            practica: {
                1: ['Orientación y Vinculación Sociolaboral'],
                2: ['Orientación y Vinculación Sociolaboral'],
                3: ['Orientación y Vinculación Sociolaboral'],
                4: ['Orientación y Vinculación Sociolaboral'],
                5: ['Orientación y Vinculación Sociolaboral'],
                6: ['Práctica Profesional']
            }
        }
    },
    
    // Gestión Integral de Riesgo
    4: {
        nombre: 'Gestión Integral de Riesgo',
        materias: {
            general: {
                1: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                2: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                3: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Educación Física', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                4: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional'],
                5: ['Lengua y Literatura', 'Matemática', 'Idiomas', 'Biología, Ambiente y Tecnología', 'Geografía, Historia y Soberanía Nacional']
            },
            cientifica: {
                1: ['Proyecto de Economía Socioproductiva y Tecnología', 'Riesgos, Emergencias y Desastres'],
                2: ['Proyecto de Economía Socioproductiva y Tecnología', 'Riesgos, Emergencias y Desastres'],
                3: ['Proyecto de Economía Socioproductiva y Tecnología', 'Riesgos, Emergencias y Desastres'],
                4: ['Proyecto de Economía Socioproductiva y Tecnología', 'Riesgos, Emergencias y Desastres'],
                5: ['Proyecto de Economía Socioproductiva y Tecnología', 'Riesgos, Emergencias y Desastres']
            },
            practica: {
                1: ['Orientación y Vinculación Sociolaboral'],
                2: ['Orientación y Vinculación Sociolaboral'],
                3: ['Orientación y Vinculación Sociolaboral'],
                4: ['Orientación y Vinculación Sociolaboral'],
                5: ['Orientación y Vinculación Sociolaboral'],
                6: ['Práctica Profesional']
            }
        }
    }
};

function getDetailedMateriasByMencionAndAnio(mencionId, anio) {
    if (!mencionId || !anio) return [];
    
    let targetMencionId = parseInt(mencionId);
    if (isNaN(targetMencionId) && typeof mentions !== 'undefined') {
        const mObj = mentions.find(m => m.nombre.toLowerCase() === String(mencionId).toLowerCase());
        if (mObj) targetMencionId = parseInt(mObj.id);
    }

    // Fuente de verdad: Asignaturas registradas en base de datos (window.subjects o subjects)
    const allSubjects = (typeof window !== 'undefined' && window.subjects) ? window.subjects : ((typeof subjects !== 'undefined') ? subjects : []);
    const dbSubjectsForAnio = Array.isArray(allSubjects)
        ? allSubjects.filter(s => parseInt(s.mencion_id) === targetMencionId && parseInt(s.anio) === parseInt(anio))
        : [];

    if (dbSubjectsForAnio.length > 0) {
        return dbSubjectsForAnio.map(s => ({
            id: s.id,
            mencion_id: parseInt(s.mencion_id),
            anio: parseInt(s.anio),
            nombre: s.nombre,
            area: s.area || 'general',
            isCustom: true // Editable y gestionable
        }));
    }

    // Fallback: Si no hay registros en base de datos para esta mención y año, usar el diccionario base
    const list = [];
    let mencion = materiasPorMencion[targetMencionId];
    if (!mencion) {
        mencion = Object.values(materiasPorMencion).find(m => 
            m.nombre.toLowerCase() === String(mencionId).toLowerCase()
        );
        if (!mencion && typeof mentions !== 'undefined') {
            const dbMention = mentions.find(m => m.id == targetMencionId);
            if (dbMention) {
                mencion = Object.values(materiasPorMencion).find(m => 
                    m.nombre.toLowerCase() === dbMention.nombre.toLowerCase()
                );
            }
        }
    }
    
    if (mencion && mencion.materias) {
        ['general', 'cientifica', 'practica'].forEach(area => {
            if (mencion.materias[area] && mencion.materias[area][anio]) {
                mencion.materias[area][anio].forEach(nom => {
                    list.push({
                        id: null,
                        mencion_id: targetMencionId,
                        anio: parseInt(anio),
                        nombre: nom,
                        area: area,
                        isCustom: false
                    });
                });
            }
        });
    }

    return list;
}

function getMateriasByMencionAndAnio(mencionId, anio) {
    const detailed = getDetailedMateriasByMencionAndAnio(mencionId, anio);
    return detailed.map(item => item.nombre);
}

function getAllMateriasByMencion(mencionId) {
    if (!mencionId) return [];
    
    const todasLasMaterias = new Set();
    
    for (let anio = 1; anio <= 6; anio++) {
        const materiasAnio = getMateriasByMencionAndAnio(mencionId, anio);
        materiasAnio.forEach(m => todasLasMaterias.add(m));
    }
    
    return Array.from(todasLasMaterias).sort();
}

window.getDetailedMateriasByMencionAndAnio = getDetailedMateriasByMencionAndAnio;
window.getMateriasByMencionAndAnio = getMateriasByMencionAndAnio;
window.getAllMateriasByMencion = getAllMateriasByMencion;