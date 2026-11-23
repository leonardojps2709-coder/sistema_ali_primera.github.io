// lib/boletin.js
// Boletín Oficial de Calificaciones — Escuela Técnica Alí Primera
// Basado en el formato oficial del plantel (Plantillas/boletin/Recibo_2026-11-13_223946.pdf).
//
// Muestra el encabezado institucional oficial, datos de control de estudios (Año Escolar,
// N° de lista, Posición en la sección), membrete del estudiante y la tabla oficial de 11 columnas:
// Áreas de Formación, Lap 1, Inas, Lap 2, Inas, Lap 3, Inas, Definitiva, Proceso de Revisión,
// Materia Pendiente, Firma y Fecha Docente; más sección de observaciones y firmas.
//
// Permite alternar interactivamente el momento pedagógico (1er, 2do, 3er momento o Año Completo)
// mediante botones en pantalla e imprimir el documento oficial ajustado a hoja horizontal.

(function (window, document) {
    'use strict';

    const NOTA_APROBATORIA = 10;
    const MOMENTOS = [
        { n: 1, nombre: '1er Momento', corto: 'Lap 1', oficial: 'PRIMER (1ER) MOMENTO PEDAGÓGICO' },
        { n: 2, nombre: '2do Momento', corto: 'Lap 2', oficial: 'SEGUNDO (2DO) MOMENTO PEDAGÓGICO' },
        { n: 3, nombre: '3er Momento', corto: 'Lap 3', oficial: 'TERCER (3ER) MOMENTO PEDAGÓGICO' },
        { n: 0, nombre: 'Año Completo', corto: 'Final', oficial: 'CALIFICACIÓN FINAL (TODOS LOS MOMENTOS)' }
    ];

    // Ruta de CSS relativa al script
    const CSS_URL = (function () {
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            const src = scripts[i].src || '';
            if (src.indexOf('boletin.js') !== -1) {
                return src.split('?')[0].replace(/boletin\.js$/, 'boletin.css');
            }
        }
        return '../lib/boletin.css';
    })();

    // ---------- Acceso robusto a colecciones globales ----------
    function getLista(nombre) {
        if (typeof window !== 'undefined' && Array.isArray(window[nombre])) {
            return window[nombre];
        }
        try {
            /* jshint ignore:start */
            const v = (new Function('return typeof ' + nombre + ' !== "undefined" ? ' + nombre + ' : [];'))();
            if (Array.isArray(v)) return v;
            /* jshint ignore:end */
        } catch (e) {}
        return [];
    }

    // ---------- Utilidades de formato y cálculo ----------

    function esc(valor) {
        return String(valor === null || valor === undefined ? '' : valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function numero(valor) {
        if (valor === null || valor === undefined || valor === '') return null;
        const n = parseFloat(valor);
        return isNaN(n) ? null : n;
    }

    function fmtNota(val) {
        const n = numero(val);
        if (n === null) return '';
        if (Number.isInteger(n)) {
            return String(n);
        }
        return n.toFixed(1);
    }

    function fmtInas(val, nota) {
        if (nota === null || nota === undefined || nota === '') return '';
        if (val === null || val === undefined || val === '') return '0';
        return String(parseInt(val, 10) || 0);
    }

    function promedio(valores) {
        const validos = valores.filter(v => v !== null && v !== undefined && !isNaN(v));
        if (validos.length === 0) return null;
        return validos.reduce((a, b) => a + b, 0) / validos.length;
    }

    function suma(valores) {
        const validos = valores.filter(v => v !== null && v !== undefined && !isNaN(v));
        if (validos.length === 0) return 0;
        return validos.reduce((a, b) => a + b, 0);
    }

    function anioDeSeccion(nombre) {
        const coincidencia = String(nombre || '').match(/\d+/);
        return coincidencia ? parseInt(coincidencia[0], 10) : null;
    }

    function seccionDe(estudiante) {
        const id = parseInt(estudiante.seccion_id || estudiante.seccion, 10);
        if (isNaN(id)) return null;
        const lista = getLista('sections');
        return lista.find(s => parseInt(s.id, 10) === id) || null;
    }

    function mencionDe(seccion) {
        if (!seccion) return '';
        const id = seccion.mencion_id || seccion.mencionId;
        const lista = getLista('mentions');
        const mencion = lista.find(m => parseInt(m.id, 10) === parseInt(id, 10));
        return mencion ? mencion.nombre : '';
    }

    function parsearSeccion(seccion) {
        if (!seccion || !seccion.nombre) return { anio: '—', letra: '—' };
        const nombre = seccion.nombre.trim();
        let anio = '—';
        let letra = '—';

        const anioMatch = nombre.match(/(\d+(?:ro|do|er|to|mo|vo|no)?)/i);
        if (anioMatch) {
            anio = anioMatch[1];
        }

        const letraMatch = nombre.match(/\b([A-F])\b/i) || nombre.match(/\s+([A-Za-z])$/i);
        if (letraMatch) {
            letra = letraMatch[1].toUpperCase();
        } else {
            letra = nombre;
        }

        return { anio, letra };
    }

    function calcularNumeroDeLista(estudiante, seccionId) {
        if (!estudiante || !seccionId) return '—';
        const listaEstudiantes = getLista('students');
        const lista = listaEstudiantes
            .filter(s => String(s.seccion_id || s.seccion) === String(seccionId))
            .sort((a, b) => {
                const apA = String(a.apellido || '').trim().localeCompare(String(b.apellido || '').trim(), 'es');
                if (apA !== 0) return apA;
                return String(a.nombre || '').trim().localeCompare(String(b.nombre || '').trim(), 'es');
            });

        const idx = lista.findIndex(s => String(s.id) === String(estudiante.id));
        return idx >= 0 ? String(idx + 1).padStart(2, '0') : '—';
    }

    function calcularPosicionSeccion(estudiante) {
        if (!estudiante || typeof window.calcularRendimientoEstudiantes !== 'function') return '—';
        try {
            const rend = window.calcularRendimientoEstudiantes();
            const info = rend.get(parseInt(estudiante.id, 10));
            if (info && info.lugar) {
                return `${info.lugar}°`;
            }
        } catch (e) {}
        return '—';
    }

    function profesorGuiaDe(seccion) {
        if (!seccion) return '—';
        if (seccion.profesor_guia_nombre) return seccion.profesor_guia_nombre;
        if (seccion.profesor_guia_id) {
            const listaUsuarios = getLista('users');
            const p = listaUsuarios.find(u => String(u.id) === String(seccion.profesor_guia_id));
            if (p) return `${p.nombre} ${p.apellido}`;
        }
        return '—';
    }

    // ---------- Datos de notas y asignaturas ----------

    function notasDelEstudiante(estudiante, periodo) {
        const todas = getLista('grades');

        return todas.filter(nota => {
            const mismoEstudiante = String(nota.estudiante_id != null ? nota.estudiante_id : nota.studentId) === String(estudiante.id);
            if (!mismoEstudiante) return false;
            if (!periodo) return true;

            if (periodo.id != null && nota.periodo_id != null) {
                return String(nota.periodo_id) === String(periodo.id);
            }
            if (periodo.nombre && nota.nombre_periodo) {
                return nota.nombre_periodo === periodo.nombre;
            }
            return true;
        });
    }

    function asignaturasDe(estudiante, notas) {
        const seccion = seccionDe(estudiante);
        let lista = [];

        if (seccion && typeof window.getMateriasByMencionAndAnio === 'function') {
            const mencionId = seccion.mencion_id || seccion.mencionId;
            const anio = anioDeSeccion(seccion.nombre);
            if (mencionId && anio) {
                lista = window.getMateriasByMencionAndAnio(mencionId, anio) || [];
            }
        }

        lista = lista.slice();
        notas.forEach(nota => {
            const materia = nota.materia || nota.subject;
            if (materia && lista.indexOf(materia) === -1) lista.push(materia);
        });

        return lista;
    }

    function filaDeMateria(notas, materia) {
        return notas.find(n => (n.materia || n.subject) === materia) || null;
    }

    function notaDeMomento(fila, momento) {
        return fila ? numero(fila['mp' + momento]) : null;
    }

    function inasistenciasDeMomento(fila, momento) {
        if (!fila) return null;
        const valor = fila['inas' + momento];
        return (valor === null || valor === undefined || valor === '') ? 0 : parseInt(valor, 10) || 0;
    }

    function definitivaDe(fila) {
        if (!fila) return null;
        const m1 = notaDeMomento(fila, 1);
        const m2 = notaDeMomento(fila, 2);
        const m3 = notaDeMomento(fila, 3);
        const validos = [m1, m2, m3].filter(v => v !== null);
        if (validos.length === 0) return null;
        return promedio(validos);
    }

    // ---------- Momento por defecto ----------

    function momentoPorFecha(periodo) {
        if (!periodo) return 1;

        const claves = ['fecha_mp1', 'fecha_mp2', 'fecha_mp3'];
        const hoy = new Date();
        let elegido = 1;

        claves.forEach((clave, indice) => {
            const fecha = periodo[clave];
            if (!fecha) return;
            const partes = String(fecha).split('-');
            if (partes.length !== 3) return;
            const d = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
            if (d <= hoy) elegido = indice + 1;
        });

        return elegido;
    }

    function inferirMomento(notas, periodo) {
        const porFecha = momentoPorFecha(periodo);

        if (notas.some(n => notaDeMomento(n, porFecha) !== null)) return porFecha;

        for (let m = 3; m >= 1; m--) {
            if (notas.some(n => notaDeMomento(n, m) !== null)) return m;
        }

        return porFecha;
    }

    // ---------- Render del Documento Oficial ----------

    function renderSelectorToolbar(momentoActivo) {
        const botones = MOMENTOS.map(m => `
            <button type="button" class="boletin-momento-btn${m.n === momentoActivo ? ' activo' : ''}"
                    data-boletin-momento="${m.n}">${m.nombre}</button>
        `).join('');

        return `
            <div class="boletin-toolbar no-print">
                <div class="boletin-toolbar-momentos">
                    <span class="toolbar-label"><i class='bx bx-calendar'></i> Momento:</span>
                    <div class="boletin-selector" role="group" aria-label="Momento a mostrar">${botones}</div>
                </div>
                <button type="button" class="btn-primary boletin-print-btn" id="boletin-print-btn">
                    <i class='bx bx-printer'></i> Imprimir Boletín
                </button>
            </div>
        `;
    }

    function render(estudiante, opciones) {
        const opc = opciones || {};
        const periodo = opc.periodo || null;
        const notas = notasDelEstudiante(estudiante, periodo);
        const momento = opc.momento !== undefined ? parseInt(opc.momento, 10) : inferirMomento(notas, periodo);
        const seccion = seccionDe(estudiante);

        const seccionId = seccion ? seccion.id : (estudiante.seccion_id || estudiante.seccion);
        const parseo = parsearSeccion(seccion);
        const mencion = mencionDe(seccion).toUpperCase();
        const numLista = calcularNumeroDeLista(estudiante, seccionId);
        const posSeccion = calcularPosicionSeccion(estudiante);
        const profGuia = profesorGuiaDe(seccion);
        const nombrePeriodo = periodo ? (periodo.nombre || '') : '2026-2027';
        const hoy = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const infoMomento = MOMENTOS.find(m => m.n === momento) || MOMENTOS[0];
        const textoMomento = infoMomento.oficial;

        const asignaturas = asignaturasDe(estudiante, notas);

        // Acumuladores para el promedio general
        const arrM1 = [];
        const arrInas1 = [];
        const arrM2 = [];
        const arrInas2 = [];
        const arrM3 = [];
        const arrInas3 = [];
        const arrDef = [];

        let filasHtml = '';

        if (asignaturas.length === 0) {
            filasHtml = `
                <tr>
                    <td colspan="11" style="text-align:center;padding:2rem;color:#64748b;">
                        No hay asignaturas registradas para esta sección en el plan de estudios.
                    </td>
                </tr>`;
        } else {
            filasHtml = asignaturas.map(materia => {
                const fila = filaDeMateria(notas, materia);

                const m1 = notaDeMomento(fila, 1);
                const inas1 = inasistenciasDeMomento(fila, 1);
                const m2 = notaDeMomento(fila, 2);
                const inas2 = inasistenciasDeMomento(fila, 2);
                const m3 = notaDeMomento(fila, 3);
                const inas3 = inasistenciasDeMomento(fila, 3);
                const def = definitivaDe(fila);

                // Determinar qué columnas mostrar según el momento pedagógico seleccionado:
                // Si momento === 1: se muestra Lap 1 y sus inasistencias. Lap 2, 3 y Definitiva quedan vacías.
                // Si momento === 2: se muestra Lap 1 y Lap 2 con sus inasistencias. Lap 3 y Definitiva vacías.
                // Si momento === 3 o 0: se muestran los 3 lapsos y la definitiva.
                const mostrarM1 = (momento >= 1 || momento === 0);
                const mostrarM2 = (momento >= 2 || momento === 0);
                const mostrarM3 = (momento >= 3 || momento === 0);
                const mostrarDef = (momento >= 3 || momento === 0);

                if (mostrarM1 && m1 !== null) { arrM1.push(m1); arrInas1.push(inas1); }
                if (mostrarM2 && m2 !== null) { arrM2.push(m2); arrInas2.push(inas2); }
                if (mostrarM3 && m3 !== null) { arrM3.push(m3); arrInas3.push(inas3); }
                if (mostrarDef && def !== null) { arrDef.push(def); }

                const valM1 = mostrarM1 ? fmtNota(m1) : '';
                const valInas1 = mostrarM1 && m1 !== null ? fmtInas(inas1, m1) : '';

                const valM2 = mostrarM2 ? fmtNota(m2) : '';
                const valInas2 = mostrarM2 && m2 !== null ? fmtInas(inas2, m2) : '';

                const valM3 = mostrarM3 ? fmtNota(m3) : '';
                const valInas3 = mostrarM3 && m3 !== null ? fmtInas(inas3, m3) : '';

                const valDef = mostrarDef ? fmtNota(def) : '';

                const act1 = momento === 1 ? ' col-activa' : '';
                const act2 = momento === 2 ? ' col-activa' : '';
                const act3 = momento === 3 ? ' col-activa' : '';

                return `
                    <tr>
                        <td class="materia-nombre">${esc(materia.toUpperCase())}</td>
                        <td class="col-nota${act1}">${valM1}</td>
                        <td class="col-inas${act1}">${valInas1}</td>
                        <td class="col-nota${act2}">${valM2}</td>
                        <td class="col-inas${act2}">${valInas2}</td>
                        <td class="col-nota${act3}">${valM3}</td>
                        <td class="col-inas${act3}">${valInas3}</td>
                        <td class="col-definitiva">${valDef}</td>
                        <td class="col-revision"></td>
                        <td class="col-pendiente"></td>
                        <td class="col-firma"></td>
                    </tr>
                `;
            }).join('');
        }

        // Totales de la fila final
        const prom1 = arrM1.length ? fmtNota(promedio(arrM1)) : '';
        const totInas1 = arrInas1.length ? String(suma(arrInas1)) : '';
        const prom2 = arrM2.length ? fmtNota(promedio(arrM2)) : '';
        const totInas2 = arrInas2.length ? String(suma(arrInas2)) : '';
        const prom3 = arrM3.length ? fmtNota(promedio(arrM3)) : '';
        const totInas3 = arrInas3.length ? String(suma(arrInas3)) : '';
        const promDef = arrDef.length ? fmtNota(promedio(arrDef)) : '';

        const act1 = momento === 1 ? ' col-activa' : '';
        const act2 = momento === 2 ? ' col-activa' : '';
        const act3 = momento === 3 ? ' col-activa' : '';

        const filaPromedios = `
            <tr class="fila-promedios">
                <td class="materia-nombre" style="font-weight:700;">PROMEDIO GENERAL</td>
                <td class="col-nota${act1}" style="font-weight:700;">${prom1}</td>
                <td class="col-inas${act1}" style="font-weight:600;">${totInas1}</td>
                <td class="col-nota${act2}" style="font-weight:700;">${prom2}</td>
                <td class="col-inas${act2}" style="font-weight:600;">${totInas2}</td>
                <td class="col-nota${act3}" style="font-weight:700;">${prom3}</td>
                <td class="col-inas${act3}" style="font-weight:600;">${totInas3}</td>
                <td class="col-definitiva" style="font-weight:800;">${promDef}</td>
                <td class="col-revision"></td>
                <td class="col-pendiente"></td>
                <td class="col-firma"></td>
            </tr>
        `;

        const nombreCompleto = `${(estudiante.apellido || '').toUpperCase()} ${(estudiante.nombre || '').toUpperCase()}`.trim();

        return `
            <div class="boletin-oficial-wrapper">
                ${renderSelectorToolbar(momento)}

                <!-- HOJA OFICIAL IMPRESA Y EN PANTALLA -->
                <div class="boletin-oficial-documento">
                    
                    <!-- ENCABEZADO INSTITUCIONAL -->
                    <div class="boletin-oficial-cabecera">
                        <div class="cabecera-institucion">
                            <h1 class="inst-nombre">ESCUELA TÉCNICA ALÍ PRIMERA</h1>
                            <p class="inst-linea">URB. PALMA SOLA AV. PRINCIPAL EDIR " ALÍ PRIMERA"</p>
                            <p class="inst-linea">MORÓN - CARABOBO TLF 0242-3722154</p>
                        </div>
                        <div class="cabecera-meta">
                            <div class="meta-item">
                                <span class="meta-label">Año Escolar:</span>
                                <span class="meta-valor">${esc(nombrePeriodo)}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">N° de Lista:</span>
                                <span class="meta-valor">${numLista}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Posición en la Sección:</span>
                                <span class="meta-valor">${posSeccion}</span>
                            </div>
                        </div>
                    </div>

                    <!-- TÍTULO CENTRAL -->
                    <div class="boletin-oficial-titulo-container">
                        <h2 class="boletin-oficial-titulo">BOLETÍN DE CALIFICACIONES</h2>
                    </div>

                    <!-- SUBENCABEZADO 1: AÑO, SECCIÓN, MENCIÓN, MOMENTO -->
                    <div class="boletin-oficial-submeta">
                        <div class="submeta-campo">
                            <span class="submeta-label">AÑO O GRADO:</span>
                            <span class="submeta-valor">${esc(parseo.anio)}</span>
                        </div>
                        <div class="submeta-campo">
                            <span class="submeta-label">SECCIÓN:</span>
                            <span class="submeta-valor">${esc(parseo.letra)}</span>
                        </div>
                        <div class="submeta-campo">
                            <span class="submeta-label">MENCIÓN:</span>
                            <span class="submeta-valor">${esc(mencion || 'EDUCACIÓN TÉCNICA')}</span>
                        </div>
                        <div class="submeta-campo submeta-momento">
                            <span class="submeta-valor momento-badge">${esc(textoMomento)}</span>
                        </div>
                    </div>

                    <!-- SUBENCABEZADO 2: ESTUDIANTE Y CÉDULA -->
                    <div class="boletin-oficial-estudiante">
                        <span class="estudiante-label">ESTUDIANTES C.I:</span>
                        <span class="estudiante-cedula">${esc(estudiante.cedula)}</span>
                        <span class="estudiante-nombre">${esc(nombreCompleto)}</span>
                    </div>

                    <!-- TABLA OFICIAL DE CALIFICACIONES (11 COLUMNAS) -->
                    <div class="boletin-oficial-tabla-wrap">
                        <table class="boletin-oficial-tabla">
                            <thead>
                                <tr>
                                    <th class="th-materia" rowspan="2">ÁREAS DE FORMACIÓN</th>
                                    <th class="th-lap${act1}" colspan="2">Lap 1</th>
                                    <th class="th-lap${act2}" colspan="2">Lap 2</th>
                                    <th class="th-lap${act3}" colspan="2">Lap 3</th>
                                    <th class="th-def" rowspan="2">Definitiva</th>
                                    <th class="th-rev" rowspan="2">Proceso de<br>Revisión</th>
                                    <th class="th-pen" rowspan="2">MATERIA<br>PENDIENTE</th>
                                    <th class="th-fir" rowspan="2">Firma y Fecha<br>DOCENTE</th>
                                </tr>
                                <tr>
                                    <th class="th-sub${act1}">Nota</th>
                                    <th class="th-sub${act1}">Inas</th>
                                    <th class="th-sub${act2}">Nota</th>
                                    <th class="th-sub${act2}">Inas</th>
                                    <th class="th-sub${act3}">Nota</th>
                                    <th class="th-sub${act3}">Inas</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filasHtml}
                                ${asignaturas.length > 0 ? filaPromedios : ''}
                            </tbody>
                        </table>
                    </div>

                    <!-- OBSERVACIONES -->
                    <div class="boletin-oficial-observaciones">
                        <span class="obs-label">OBSERVACIONES:</span>
                        <div class="obs-lineas">
                            <div class="obs-linea"></div>
                            <div class="obs-linea"></div>
                        </div>
                    </div>

                    <!-- PIE: FECHA, SELLO Y DOCENTE GUÍA -->
                    <div class="boletin-oficial-pie">
                        <div class="pie-col pie-fecha">
                            <span class="pie-label">Fecha:</span>
                            <span class="pie-valor">${hoy}</span>
                        </div>
                        <div class="pie-col pie-sello">
                            <div class="sello-plantel">
                                <i class='bx bx-check-shield' style="font-size:1.4rem;display:block;opacity:0.3;margin-bottom:2px;"></i>
                                <span>SELLO DEL PLANTEL</span>
                            </div>
                        </div>
                        <div class="pie-col pie-docente">
                            <div class="docente-linea"></div>
                            <div class="docente-cargo">Docente Guía</div>
                            <div class="docente-nombre">${esc(profGuia)}</div>
                        </div>
                    </div>

                </div><!-- /boletin-oficial-documento -->
            </div><!-- /boletin-oficial-wrapper -->
        `;
    }

    // ---------- Impresión ----------

    function imprimir(contenedor, estudiante, periodo, momento) {
        const ventana = window.open('', '_blank');
        if (!ventana) {
            if (typeof showToast === 'function') showToast('Permita las ventanas emergentes para imprimir', 'error');
            return;
        }

        const docEl = contenedor.querySelector('.boletin-oficial-documento');
        if (!docEl) return;

        const copia = docEl.cloneNode(true);
        copia.querySelectorAll('.no-print').forEach(el => el.remove());

        const nombrePeriodo = periodo ? (periodo.nombre || '') : '';
        const titulo = `Boletín de Calificaciones - ${estudiante.nombre} ${estudiante.apellido} (${estudiante.cedula})`;

        ventana.document.write(`
            <!doctype html>
            <html lang="es">
            <head>
                <meta charset="utf-8">
                <title>${esc(titulo)}</title>
                <link rel="stylesheet" href="${esc(CSS_URL)}">
                <style>
                    @page {
                        size: letter landscape;
                        margin: 6mm 10mm;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
                        padding: 0;
                        margin: 0;
                        background: #fff;
                        color: #000;
                    }
                    .boletin-oficial-documento {
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 auto !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                </style>
            </head>
            <body>
                ${copia.outerHTML}
            </body>
            </html>
        `);
        ventana.document.close();
        setTimeout(() => {
            ventana.focus();
            ventana.print();
        }, 400);
    }

    // ---------- Integración con el DOM ----------

    function datosDeContexto(estudiante, opciones) {
        const opc = opciones || {};
        const periodo = opc.periodo || null;
        const notas = notasDelEstudiante(estudiante, periodo);
        return {
            estudiante,
            periodo,
            momento: opc.momento !== undefined ? parseInt(opc.momento, 10) : inferirMomento(notas, periodo)
        };
    }

    function attach(contenedor, estudiante, opciones) {
        if (!contenedor) return;

        const ctx = datosDeContexto(estudiante, opciones);

        function dibujar() {
            contenedor.innerHTML = render(ctx.estudiante, { periodo: ctx.periodo, momento: ctx.momento });

            contenedor.querySelectorAll('[data-boletin-momento]').forEach(boton => {
                boton.addEventListener('click', () => {
                    ctx.momento = parseInt(boton.getAttribute('data-boletin-momento'), 10);
                    dibujar();
                });
            });

            const botonImprimir = contenedor.querySelector('#boletin-print-btn');
            if (botonImprimir) {
                botonImprimir.addEventListener('click', () => imprimir(contenedor, ctx.estudiante, ctx.periodo, ctx.momento));
            }
        }

        dibujar();
    }

    window.Boletin = {
        render: render,
        attach: attach,
        inferirMomento: inferirMomento,
        MOMENTOS: MOMENTOS,
        NOTA_APROBATORIA: NOTA_APROBATORIA
    };
})(window, document);
