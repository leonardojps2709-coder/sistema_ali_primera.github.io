// lib/reportes-docs.js
// Generación de los documentos de reportes.
//
//   · boletinIndividual        → boletín de un estudiante (delega en lib/boletin.js)
//   · historicoIndividual      → todas las materias del alumno en todos los períodos
//   · historicoMomentosSeccion → los tres momentos de cada materia, para toda la sección
//   · historicoSeccion         → tabla consolidada alumnos × materias
//
// Cada función devuelve HTML; `imprimir()` lo envía a una ventana lista para imprimir.

(function (window, document) {
    'use strict';

    const NOMBRE_MINIMO = 2;

    // ---------- Rutas de estilos (se derivan del propio <script>) ----------
    const BASE_CSS = (function () {
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            const src = scripts[i].src || '';
            if (src.indexOf('reportes-docs.js') !== -1) {
                const base = src.split('?')[0].replace(/reportes-docs\.js$/, '');
                return base;
            }
        }
        return '../lib/';
    })();

    // ---------- Utilidades ----------

    function esc(valor) {
        return String(valor === null || valor === undefined ? '' : valor)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function num(valor) {
        if (valor === null || valor === undefined || valor === '') return null;
        const n = parseFloat(valor);
        return isNaN(n) ? null : n;
    }

    function fmt(valor) {
        const n = num(valor);
        return n === null ? '—' : n.toFixed(2);
    }

    function fecha(valor) {
        if (!valor) return '—';
        const p = String(valor).substring(0, 10).split('-');
        return p.length === 3 && p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : String(valor);
    }

    function hoy() {
        const d = new Date();
        const p = (n) => String(n).padStart(2, '0');
        return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
    }

    function normalizar(texto) {
        return String(texto || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().trim();
    }

    // ---------- Acceso a datos ----------

    function seccionDe(estudiante) {
        const lista = Array.isArray(window.sections) ? window.sections : [];
        return lista.find(s => String(s.id) === String(estudiante.seccion_id)) || null;
    }

    function mencionDe(seccion) {
        if (!seccion) return '';
        const lista = Array.isArray(window.mentions) ? window.mentions : [];
        const m = lista.find(x => String(x.id) === String(seccion.mencion_id));
        return m ? m.nombre : '';
    }

    function anioDe(seccion) {
        if (!seccion) return null;
        const m = String(seccion.nombre || '').match(/\d+/);
        return m ? parseInt(m[0], 10) : null;
    }

    /** Materias del plan de la sección, más las que tengan notas. */
    function materiasDe(seccion, notas) {
        let lista = [];
        if (seccion && typeof window.getMateriasByMencionAndAnio === 'function') {
            lista = window.getMateriasByMencionAndAnio(seccion.mencion_id, anioDe(seccion)) || [];
        }
        lista = lista.slice();

        (notas || []).forEach(n => {
            if (n.materia && lista.indexOf(n.materia) === -1) lista.push(n.materia);
        });

        return lista;
    }

    function notasDe(estudiante, periodo) {
        const lista = Array.isArray(window.grades) ? window.grades : [];
        return lista.filter(g => {
            if (String(g.estudiante_id) !== String(estudiante.id)) return false;
            if (!periodo) return true;
            if (periodo.id != null && g.periodo_id != null) return String(g.periodo_id) === String(periodo.id);
            return true;
        });
    }

    function filaDe(notas, materia) {
        return notas.find(n => n.materia === materia) || null;
    }

    /** Definitiva de una fila: promedio de los momentos realmente cargados. */
    function definitivaDeFila(fila) {
        if (!fila) return null;
        const valores = [1, 2, 3].map(m => num(fila['mp' + m])).filter(v => v !== null);
        if (!valores.length) return null;
        return valores.reduce((a, b) => a + b, 0) / valores.length;
    }

    function alumnosDe(seccion) {
        const lista = Array.isArray(window.students) ? window.students : [];
        return lista
            .filter(s => String(s.seccion_id) === String(seccion.id))
            .sort((a, b) => String(a.apellido || '').localeCompare(String(b.apellido || '')));
    }

    function buscarEstudiantes(texto, seccionesPermitidas) {
        const q = normalizar(texto);
        if (q.length < NOMBRE_MINIMO) return [];

        const soloDigitos = q.replace(/\D/g, '');
        const lista = Array.isArray(window.students) ? window.students : [];

        return lista.filter(e => {
            if (seccionesPermitidas && seccionesPermitidas.length) {
                if (seccionesPermitidas.indexOf(parseInt(e.seccion_id, 10)) === -1) return false;
            }
            const nombre = normalizar(`${e.apellido} ${e.nombre} ${e.nombre} ${e.apellido}`);
            const cedula = normalizar(e.cedula);
            const porNombre = nombre.indexOf(q) !== -1;
            const porCedula = soloDigitos.length >= 3 && cedula.replace(/\D/g, '').indexOf(soloDigitos) !== -1;
            return porNombre || porCedula;
        }).slice(0, 8);
    }

    // ---------- Piezas de documento ----------

    function cabeceraDocumento(titulo, subtitulo, meta) {
        return `
            <header class="doc-cabecera">
                <div class="cabecera-institucion">
                    <h1 class="inst-nombre" style="margin:0;font-size:1.02rem;font-weight:800;letter-spacing:0.03em;text-transform:uppercase;color:#000;">ESCUELA TÉCNICA ALÍ PRIMERA</h1>
                    <p class="inst-linea" style="margin:2px 0 0 0;font-size:0.74rem;color:#1e293b;font-weight:600;letter-spacing:0.02em;">URB. PALMA SOLA AV. PRINCIPAL EDIR " ALÍ PRIMERA"</p>
                    <p class="inst-linea" style="margin:2px 0 0 0;font-size:0.74rem;color:#1e293b;font-weight:600;letter-spacing:0.02em;">MORÓN - CARABOBO TLF 0242-3722154</p>
                </div>
                <div class="doc-periodo">
                    <span>${esc(subtitulo || 'Período')}</span>
                    <strong>${esc(meta || '')}</strong>
                </div>
            </header>
            <div style="text-align:center;margin:0.5rem 0 0.4rem 0;">
                <h3 class="doc-titulo" style="margin:0;font-size:1.15rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#000;">${esc(titulo)}</h3>
            </div>`;
    }

    function bloqueDatos(pares) {
        return `
            <div class="doc-datos">
                ${pares.map(p => `
                    <div class="doc-dato">
                        <span>${esc(p[0])}</span>
                        <strong>${esc(p[1])}</strong>
                    </div>`).join('')}
            </div>`;
    }

    function pieDocumento(texto) {
        return `<p class="doc-pie">${esc(texto)} · Emitido el ${hoy()}</p>`;
    }

    // ---------- Documento: boletín individual ----------

    function boletinIndividual(estudiante, periodo) {
        if (typeof window.Boletin === 'undefined') return null;

        const boletin = window.Boletin.render(estudiante, { periodo: periodo });
        return `<div class="doc-hoja" style="padding:0;border:none;background:transparent;box-shadow:none;">${boletin}</div>`;
    }

    // ---------- Documento: histórico individual ----------

    function historicoIndividual(estudiante, periodo) {
        const seccion = seccionDe(estudiante);
        const notasPeriodo = notasDe(estudiante, periodo);
        const materias = materiasDe(seccion, notasPeriodo);

        const periodos = (Array.isArray(window.periods) ? window.periods : [])
            .slice()
            .sort((a, b) => String(a.fecha_inicio || '').localeCompare(String(b.fecha_inicio || '')));

        const filas = materias.map(materia => {
            const celdas = periodos.map(p => {
                const d = definitivaDeFila(filaDe(notasDe(estudiante, p), materia));
                return d === null
                    ? '<td><span class="doc-vacio">—</span></td>'
                    : `<td class="doc-nota ${d >= 10 ? 'ok' : 'mal'}">${d.toFixed(2)}</td>`;
            }).join('');

            const finales = periodos
                .map(p => definitivaDeFila(filaDe(notasDe(estudiante, p), materia)))
                .filter(v => v !== null);
            const final = finales.length ? finales.reduce((a, b) => a + b, 0) / finales.length : null;

            const estado = final === null
                ? '<span class="doc-chip vacio">Sin calificar</span>'
                : (final >= 10 ? '<span class="doc-chip ok">Aprobado</span>' : '<span class="doc-chip mal">Reprobado</span>');

            return `
                <tr>
                    <td class="doc-materia">${esc(materia)}</td>
                    ${celdas}
                    <td class="doc-final">${final === null ? '<span class="doc-vacio">—</span>' : final.toFixed(2)}</td>
                    <td>${estado}</td>
                </tr>`;
        }).join('');

        const pie = periodos.map(p => {
            const defs = materias
                .map(m => definitivaDeFila(filaDe(notasDe(estudiante, p), m)))
                .filter(v => v !== null);
            return defs.length ? (defs.reduce((a, b) => a + b, 0) / defs.length).toFixed(2) : '—';
        });

        const finales = materias
            .map(m => {
                const defs = periodos
                    .map(p => definitivaDeFila(filaDe(notasDe(estudiante, p), m)))
                    .filter(v => v !== null);
                return defs.length ? defs.reduce((a, b) => a + b, 0) / defs.length : null;
            })
            .filter(v => v !== null);

        const promedio = finales.length ? (finales.reduce((a, b) => a + b, 0) / finales.length).toFixed(2) : '—';

        return `
            <div class="doc-hoja">
                ${cabeceraDocumento('Histórico de Notas', 'Período', periodo ? periodo.nombre : 'Todos')}
                ${bloqueDatos([
                    ['Estudiante', `${estudiante.apellido}, ${estudiante.nombre}`],
                    ['Cédula', estudiante.cedula],
                    ['Sección', seccion ? seccion.nombre : 'Sin sección'],
                    ['Materias', materias.length],
                    ['Promedio general', promedio]
                ])}
                <table class="doc-tabla">
                    <thead>
                        <tr>
                            <th>Materia</th>
                            ${periodos.map(p => `<th>${esc(p.nombre)}</th>`).join('')}
                            <th>Definitiva final</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>${filas}</tbody>
                    <tfoot>
                        <tr>
                            <td>Promedio</td>
                            ${pie.map(v => `<td>${v}</td>`).join('')}
                            <td>${promedio}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                ${pieDocumento('Documento informativo')}
            </div>`;
    }

    // ---------- Documento: histórico de momentos de la sección ----------

    function historicoMomentosSeccion(seccion, periodo) {
        const alumnos = alumnosDe(seccion);
        const notasPeriodo = (Array.isArray(window.grades) ? window.grades : [])
            .filter(g => String(g.periodo_id) === String(periodo ? periodo.id : ''));
        const materias = materiasDe(seccion, notasPeriodo);

        const bloques = alumnos.map(alumno => {
            const notas = notasDe(alumno, periodo);

            const filas = materias.map(materia => {
                const fila = filaDe(notas, materia);
                const celdas = [1, 2, 3].map(m => {
                    const v = fila ? num(fila['mp' + m]) : null;
                    return v === null
                        ? '<td><span class="doc-vacio">—</span></td>'
                        : `<td class="doc-nota ${v >= 10 ? 'ok' : 'mal'}">${v.toFixed(2)}</td>`;
                }).join('');

                const def = definitivaDeFila(fila);
                return `
                    <tr>
                        <td class="doc-materia">${esc(materia)}</td>
                        ${celdas}
                        <td class="doc-final">${def === null ? '<span class="doc-vacio">—</span>' : def.toFixed(2)}</td>
                    </tr>`;
            }).join('');

            const defs = materias.map(m => definitivaDeFila(filaDe(notas, m))).filter(v => v !== null);
            const promedio = defs.length ? (defs.reduce((a, b) => a + b, 0) / defs.length).toFixed(2) : '—';

            return `
                <section class="doc-alumno">
                    <div class="doc-alumno-cabecera">
                        <div>
                            <strong>${esc(alumno.apellido)}, ${esc(alumno.nombre)}</strong>
                            <small>${esc(alumno.cedula)}</small>
                        </div>
                        <div class="doc-alumno-promedio">
                            <span>Promedio</span>
                            <b>${promedio}</b>
                        </div>
                    </div>
                    <table class="doc-tabla doc-tabla-compacta">
                        <thead>
                            <tr>
                                <th>Materia</th>
                                <th>1er Momento</th>
                                <th>2do Momento</th>
                                <th>3er Momento</th>
                                <th>Definitiva</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </section>`;
        }).join('');

        return `
            <div class="doc-hoja doc-hoja-amplia">
                ${cabeceraDocumento('Histórico de Momentos', 'Período', periodo ? periodo.nombre : 'Todos')}
                ${bloqueDatos([
                    ['Sección', seccion.nombre],
                    ['Mención', mencionDe(seccion) || '—'],
                    ['Estudiantes', alumnos.length],
                    ['Materias', materias.length]
                ])}
                ${alumnos.length === 0
                    ? '<p class="doc-vacio-msg">La sección no tiene estudiantes inscritos.</p>'
                    : bloques}
                ${pieDocumento('Documento informativo')}
            </div>`;
    }

    // ---------- Documento: histórico de la sección (sábana) ----------

    function historicoSeccion(seccion, periodo) {
        const alumnos = alumnosDe(seccion);
        const notasPeriodo = (Array.isArray(window.grades) ? window.grades : [])
            .filter(g => String(g.periodo_id) === String(periodo ? periodo.id : ''));
        const materias = materiasDe(seccion, notasPeriodo);

        const filas = alumnos.map(alumno => {
            const notas = notasDe(alumno, periodo);

            const celdas = materias.map(materia => {
                const d = definitivaDeFila(filaDe(notas, materia));
                return d === null
                    ? '<td><span class="doc-vacio">—</span></td>'
                    : `<td><span class="doc-nota ${d >= 10 ? 'ok' : 'mal'}">${d.toFixed(1)}</span></td>`;
            }).join('');

            const defs = materias.map(m => definitivaDeFila(filaDe(notas, m))).filter(v => v !== null);
            const prom = defs.length ? defs.reduce((a, b) => a + b, 0) / defs.length : null;

            return `
                <tr>
                    <td class="doc-materia">${esc(alumno.apellido)}, ${esc(alumno.nombre)}</td>
                    ${celdas}
                    <td class="doc-final">${prom === null ? '<span class="doc-vacio">—</span>' : prom.toFixed(2)}</td>
                    <td>${prom === null
                        ? '<span class="doc-chip vacio">—</span>'
                        : (prom >= 10 ? '<span class="doc-chip ok">Aprobado</span>' : '<span class="doc-chip mal">Reprobado</span>')}</td>
                </tr>`;
        }).join('');

        const pie = materias.map(m => {
            const defs = alumnos.map(a => definitivaDeFila(filaDe(notasDe(a, periodo), m))).filter(v => v !== null);
            return defs.length ? (defs.reduce((a, b) => a + b, 0) / defs.length).toFixed(1) : '—';
        });

        const promedios = alumnos.map(a => {
            const defs = materias.map(m => definitivaDeFila(filaDe(notasDe(a, periodo), m))).filter(v => v !== null);
            return defs.length ? defs.reduce((a, b) => a + b, 0) / defs.length : null;
        }).filter(v => v !== null);

        const general = promedios.length ? (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(2) : '—';

        return `
            <div class="doc-hoja doc-hoja-horizontal">
                ${cabeceraDocumento('Histórico de la Sección', 'Período', periodo ? periodo.nombre : 'Todos')}
                ${bloqueDatos([
                    ['Sección', seccion.nombre],
                    ['Mención', mencionDe(seccion) || '—'],
                    ['Estudiantes', alumnos.length],
                    ['Promedio de la sección', general]
                ])}
                ${alumnos.length === 0
                    ? '<p class="doc-vacio-msg">La sección no tiene estudiantes inscritos.</p>'
                    : `<table class="doc-tabla doc-sabana">
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                ${materias.map(m => `<th title="${esc(m)}">${esc(m.length > 18 ? m.slice(0, 17) + '…' : m)}</th>`).join('')}
                                <th>Promedio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                        <tfoot>
                            <tr>
                                <td>Promedio por materia</td>
                                ${pie.map(v => `<td>${v}</td>`).join('')}
                                <td>${general}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>`}
                ${pieDocumento('Documento informativo')}
            </div>`;
    }

    // ---------- Documento: boletín de evaluaciones ----------

    /**
     * Boletín con el detalle de las evaluaciones que cargaron los profesores.
     * `datos` viene de `api/main.php?action=get_evaluaciones_detalle`:
     *   { config: [...evaluaciones_config], notas: [...evaluaciones_notas] }
     */
    function boletinEvaluaciones(estudiante, periodo, datos) {
        if (!datos) return null;

        const seccion = seccionDe(estudiante);
        const config = Array.isArray(datos.config) ? datos.config : [];
        const notas = (Array.isArray(datos.notas) ? datos.notas : [])
            .filter(n => String(n.estudiante_id) === String(estudiante.id));

        function leerJson(valor, respaldo) {
            if (valor === null || valor === undefined || valor === '') return respaldo;
            if (typeof valor === 'object') return valor;
            try {
                const parseado = JSON.parse(valor);
                return parseado === null ? respaldo : parseado;
            } catch (e) {
                return respaldo;
            }
        }

        // Índices por materia + momento
        const configPorClave = {};
        config.forEach(c => { configPorClave[`${c.materia}|${c.momento}`] = c; });

        const notaPorClave = {};
        notas.forEach(n => { notaPorClave[`${n.materia}|${n.momento}`] = n; });

        // Materias: las del plan más las que tengan evaluaciones
        const materias = materiasDe(seccion, notasDe(estudiante, periodo));
        const extras = Object.keys(configPorClave).map(k => k.split('|')[0])
            .concat(Object.keys(notaPorClave).map(k => k.split('|')[0]));
        extras.forEach(m => { if (m && materias.indexOf(m) === -1) materias.push(m); });

        const NOMBRES_MOMENTO = { 1: '1er Momento', 2: '2do Momento', 3: '3er Momento' };

        let filas = '';
        let materiasConDatos = 0;
        let totalEvaluaciones = 0;

        materias.forEach(materia => {
            const bloques = [];

            [1, 2, 3].forEach(momento => {
                const cfg = configPorClave[`${materia}|${momento}`] || null;
                const nota = notaPorClave[`${materia}|${momento}`] || null;

                if (!cfg && !nota) return;

                const nombres = leerJson(cfg ? cfg.nombres : null, []);
                const porcentajes = leerJson(cfg ? cfg.porcentajes : null, []);
                const valores = leerJson(nota ? nota.notas_eval : null, []);

                const cuantas = Math.max(nombres.length, porcentajes.length, valores.length);
                const items = [];

                for (let i = 0; i < cuantas; i++) {
                    const nombre = nombres[i] || `Evaluación ${i + 1}`;
                    const pct = porcentajes[i] !== undefined && porcentajes[i] !== null ? porcentajes[i] : null;
                    const valor = num(valores[i]);

                    const clase = valor === null ? 'vacia' : (valor >= 10 ? 'ok' : 'mal');

                    items.push(`<span class="eval-item">
                        <b>${esc(nombre)}</b>${pct !== null ? `<i>${esc(pct)}%</i>` : ''}
                        <em class="${clase}">${valor === null ? '—' : valor.toFixed(2)}</em>
                    </span>`);

                    if (valor !== null) totalEvaluaciones++;
                }

                const calificada = cuantas > 0 && leerJson(nota ? nota.notas_eval : null, []).some(v => num(v) !== null);
                const notaMomento = calificada && nota ? num(nota.nota_momento) : null;

                bloques.push({
                    momento: NOMBRES_MOMENTO[momento],
                    items: items,
                    nota: notaMomento
                });
            });

            if (bloques.length === 0) return;

            materiasConDatos++;

            const filaMateria = notasDe(estudiante, periodo).find(n => n.materia === materia);
            const definitivaMateria = definitivaDeFila(filaMateria);
            const docente = bloques.length && configPorClave[`${materia}|1`]
                ? configPorClave[`${materia}|1`].teacher_nombre
                : '';

            bloques.forEach((bloque, indice) => {
                filas += '<tr>';

                if (indice === 0) {
                    filas += `
                        <td class="doc-materia" rowspan="${bloques.length}">
                            <strong>${esc(materia)}</strong>
                            ${docente ? `<small>${esc(docente)}</small>` : ''}
                            <span class="doc-materia-def">Definitiva: ${definitivaMateria === null ? '—' : definitivaMateria.toFixed(2)}</span>
                        </td>`;
                }

                filas += `
                    <td>${esc(bloque.momento)}</td>
                    <td class="doc-eval">${bloque.items.join('') || '<span class="doc-eval-vacia">Sin evaluaciones configuradas</span>'}</td>
                    <td class="doc-final">${bloque.nota === null ? '<span class="doc-vacio">—</span>' : bloque.nota.toFixed(2)}</td>
                </tr>`;
            });
        });

        return `
            <div class="doc-hoja">
                ${cabeceraDocumento('Boletín de Evaluaciones', 'Período', periodo ? periodo.nombre : 'Todos')}
                ${bloqueDatos([
                    ['Estudiante', `${estudiante.apellido}, ${estudiante.nombre}`],
                    ['Cédula', estudiante.cedula],
                    ['Sección', seccion ? seccion.nombre : 'Sin sección'],
                    ['Materias con evaluaciones', materiasConDatos],
                    ['Evaluaciones calificadas', totalEvaluaciones]
                ])}
                ${filas === ''
                    ? '<p class="doc-vacio-msg">Los profesores todavía no han cargado evaluaciones para este estudiante en el período seleccionado.</p>'
                    : `<table class="doc-tabla doc-tabla-eval">
                        <thead>
                            <tr>
                                <th>Materia</th>
                                <th>Momento</th>
                                <th>Evaluaciones</th>
                                <th>Nota</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>`}
                ${pieDocumento('Documento informativo')}
            </div>`;
    }

    // ---------- Documento: evaluaciones de la sección ----------

    /**
     * Notas de evaluación de toda la sección, agrupadas por materia y momento.
     * Una tabla por bloque: alumnos en filas, evaluaciones en columnas.
     */
    function historicoEvaluacionesSeccion(seccion, periodo, datos, opciones) {
        if (!datos) return null;

        const opc = opciones || {};
        const permitidas = Array.isArray(opc.materiasPermitidas) ? opc.materiasPermitidas : [];

        const alumnos = alumnosDe(seccion);
        const config = Array.isArray(datos.config) ? datos.config : [];
        const notas = Array.isArray(datos.notas) ? datos.notas : [];

        function leerJson(valor, respaldo) {
            if (valor === null || valor === undefined || valor === '') return respaldo;
            if (typeof valor === 'object') return valor;
            try {
                const parseado = JSON.parse(valor);
                return parseado === null ? respaldo : parseado;
            } catch (e) {
                return respaldo;
            }
        }

        // Agrupar configuraciones y notas por materia + momento
        const bloques = new Map();

        function bloqueDe(materia, momento) {
            const clave = `${materia}|${momento}`;
            if (!bloques.has(clave)) {
                bloques.set(clave, { materia: materia, momento: momento, cfg: null, notas: {} });
            }
            return bloques.get(clave);
        }

        config.forEach(c => {
            if (permitidas.length && permitidas.indexOf(c.materia) === -1) return;
            const bloque = bloqueDe(c.materia, c.momento);
            bloque.cfg = c; // si hay varias, se queda la última
        });

        notas.forEach(n => {
            if (permitidas.length && permitidas.indexOf(n.materia) === -1) return;
            bloqueDe(n.materia, n.momento).notas[n.estudiante_id] = n;
        });

        const NOMBRES_MOMENTO = { 1: '1er Momento', 2: '2do Momento', 3: '3er Momento' };

        const lista = Array.from(bloques.values()).sort((a, b) => {
            const porMateria = String(a.materia).localeCompare(String(b.materia));
            return porMateria !== 0 ? porMateria : a.momento - b.momento;
        });

        let secciones = '';
        let totalBloques = 0;

        lista.forEach(bloque => {
            const nombres = leerJson(bloque.cfg ? bloque.cfg.nombres : null, []);
            const porcentajes = leerJson(bloque.cfg ? bloque.cfg.porcentajes : null, []);

            // Cuántas evaluaciones tiene el bloque (por configuración o por notas cargadas)
            let cuantas = Math.max(nombres.length, porcentajes.length);
            Object.values(bloque.notas).forEach(n => {
                cuantas = Math.max(cuantas, leerJson(n.notas_eval, []).length);
            });
            if (cuantas === 0) cuantas = 1;

            const encabezados = [];
            for (let i = 0; i < cuantas; i++) {
                const nombre = nombres[i] || `Evaluación ${i + 1}`;
                const pct = porcentajes[i];
                encabezados.push(`<th>${esc(nombre)}${pct !== undefined && pct !== null ? `<small>${esc(pct)}%</small>` : ''}</th>`);
            }

            const filas = alumnos.map(alumno => {
                const nota = bloque.notas[alumno.id] || null;
                const valores = leerJson(nota ? nota.notas_eval : null, []);

                const celdas = [];
                for (let i = 0; i < cuantas; i++) {
                    const v = num(valores[i]);
                    celdas.push(v === null
                        ? '<td><span class="doc-vacio">—</span></td>'
                        : `<td><span class="doc-nota ${v >= 10 ? 'ok' : 'mal'}">${v.toFixed(2)}</span></td>`);
                }

                const vals = valores.map(v => num(v)).filter(v => v !== null);
                const notaMomento = vals.length ? num(nota ? nota.nota_momento : null) : null;

                return `
                    <tr>
                        <td class="doc-materia">${esc(alumno.apellido)}, ${esc(alumno.nombre)}</td>
                        ${celdas.join('')}
                        <td class="doc-final">${notaMomento === null ? '<span class="doc-vacio">—</span>' : notaMomento.toFixed(2)}</td>
                    </tr>`;
            }).join('');

            totalBloques++;

            secciones += `
                <section class="doc-bloque-eval">
                    <h4 class="doc-bloque-titulo">
                        ${esc(bloque.materia)}
                        <span>${esc(NOMBRES_MOMENTO[bloque.momento] || ('Momento ' + bloque.momento))}</span>
                    </h4>
                    <table class="doc-tabla doc-tabla-cuadricula doc-tabla-eval-sec">
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                ${encabezados.join('')}
                                <th>Nota</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </section>`;
        });

        const materias = [...new Set(lista.map(b => b.materia))];

        return `
            <div class="doc-hoja doc-hoja-horizontal">
                ${cabeceraDocumento('Evaluaciones de la Sección', 'Período', periodo ? periodo.nombre : 'Todos')}
                ${bloqueDatos([
                    ['Sección', seccion.nombre],
                    ['Mención', mencionDe(seccion) || '—'],
                    ['Estudiantes', alumnos.length],
                    ['Materias', materias.length],
                    ['Bloques', totalBloques]
                ])}
                ${totalBloques === 0
                    ? '<p class="doc-vacio-msg">Los profesores todavía no han configurado evaluaciones para esta sección en el período seleccionado.</p>'
                    : secciones}
                ${pieDocumento('Documento informativo')}
            </div>`;
    }

    // ---------- Impresión ----------

    function imprimir(html, opciones) {
        const opc = opciones || {};
        const ventana = window.open('', '_blank');

        if (!ventana) {
            if (typeof window.showToast === 'function') {
                window.showToast('Permite las ventanas emergentes para imprimir', 'error');
            }
            return;
        }

        const cssBoletin = BASE_CSS + 'boletin.css';
        const cssReportes = BASE_CSS + 'reportes.css';

        ventana.document.write(`
            <!doctype html>
            <html lang="es">
            <head>
                <meta charset="utf-8">
                <title>${esc(opc.titulo || 'Reporte')}</title>
                <link rel="stylesheet" href="${esc(cssBoletin)}">
                <link rel="stylesheet" href="${esc(cssReportes)}">
                <style>
                    @page { size: ${opc.horizontal ? 'A4 landscape' : 'A4 portrait'}; margin: 12mm; }
                    body { padding: 0; background: #fff; margin: 0; }
                    .doc-hoja { box-shadow: none; border: none; padding: 0; }
                    .no-print { display: none !important; }
                    .boletin-selector { display: none !important; }
                </style>
            </head>
            <body>${html}</body>
            </html>
        `);
        ventana.document.close();

        setTimeout(() => { ventana.print(); }, 500);
    }

    window.RepDocs = {
        boletinIndividual: boletinIndividual,
        historicoIndividual: historicoIndividual,
        historicoMomentosSeccion: historicoMomentosSeccion,
        historicoSeccion: historicoSeccion,
        boletinEvaluaciones: boletinEvaluaciones,
        historicoEvaluacionesSeccion: historicoEvaluacionesSeccion,
        buscarEstudiantes: buscarEstudiantes,
        alumnosDe: alumnosDe,
        materiasDe: materiasDe,
        seccionDe: seccionDe,
        mencionDe: mencionDe,
        imprimir: imprimir,
        fecha: fecha,
        fmt: fmt
    };
})(window, document);
