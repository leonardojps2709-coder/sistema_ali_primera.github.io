// lib/reportes-panel.js
// Panel de reportes basado en tarjetas de acción, con vista previa antes de imprimir.
//
// Requiere en la página:
//   #rep-cards  (botones .rep-card con data-doc)
//   #rep-form   #rep-periodo   #rep-buscar   #rep-lista
//   #rep-mencion #rep-seccion  #rep-generar   #rep-aviso
//
// Documentos (data-doc): boletin-est · historico-est · momentos-sec · historico-sec

(function (window, document) {
    'use strict';

    let tipoActual = null;
    let estudianteElegido = null;
    let documentoActual = null;   // { html, opciones }
    let indiceActivo = -1;

    function el(id) {
        return document.getElementById(id);
    }

    function escapar(t) {
        return String(t === null || t === undefined ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ---------- Datos de apoyo ----------

    function periodosOrdenados() {
        const lista = Array.isArray(window.periods) ? window.periods.slice() : [];
        return lista.sort((a, b) => String(b.fecha_inicio || '').localeCompare(String(a.fecha_inicio || '')));
    }

    function seccionesVisibles() {
        const todas = Array.isArray(window.sections) ? window.sections : [];
        const profesor = window.currentTeacher;

        if (profesor && Array.isArray(profesor.secciones) && profesor.secciones.length) {
            const ids = profesor.secciones.map(Number);
            return todas.filter(s => ids.indexOf(Number(s.id)) !== -1);
        }
        return todas;
    }

    function mencionesVisibles() {
        const secciones = seccionesVisibles();
        const ids = secciones.map(s => String(s.mencion_id));
        const todas = Array.isArray(window.mentions) ? window.mentions : [];
        return todas.filter(m => ids.indexOf(String(m.id)) !== -1);
    }

    function seccionElegida() {
        const select = el('rep-seccion');
        if (!select || !select.value) return null;
        return seccionesVisibles().find(s => String(s.id) === String(select.value)) || null;
    }

    function periodoElegido() {
        const select = el('rep-periodo');
        if (!select || !select.value) return null;
        const lista = Array.isArray(window.periods) ? window.periods : [];
        return lista.find(p => String(p.id) === String(select.value)) || null;
    }

    function nombreSeccion(id) {
        const lista = Array.isArray(window.sections) ? window.sections : [];
        const s = lista.find(x => String(x.id) === String(id));
        return s ? s.nombre : 'Sin sección';
    }

    // ---------- Relleno de selectores ----------

    function cargarPeriodos() {
        const select = el('rep-periodo');
        if (!select) return;

        const lista = periodosOrdenados();
        if (!lista.length) {
            select.innerHTML = '<option value="">Sin períodos</option>';
            return;
        }

        const anterior = select.value;

        select.innerHTML = lista.map(p =>
            `<option value="${p.id}">${escapar(p.nombre)}${p.estado === 'cerrado' ? ' · cerrado' : ''}</option>`
        ).join('');

        const sigueExistiendo = Array.from(select.options).some(o => o.value === anterior);
        if (anterior && sigueExistiendo) {
            select.value = anterior;
        } else {
            const activo = lista.find(p => p.estado !== 'cerrado');
            select.value = activo ? activo.id : lista[0].id;
        }
    }

    function cargarMenciones() {
        const select = el('rep-mencion');
        if (!select) return;

        const lista = mencionesVisibles();
        const anterior = select.value;

        if (!lista.length) {
            select.innerHTML = '<option value="">Sin menciones</option>';
            cargarSecciones();
            return;
        }

        const todas = esAlcanceEstudiante() ? '<option value="">Todas las menciones</option>' : '';
        select.innerHTML = todas + lista.map(m => `<option value="${m.id}">${escapar(m.nombre)}</option>`).join('');

        if (anterior && Array.from(select.options).some(o => o.value === anterior)) {
            select.value = anterior;
        }

        cargarSecciones();
    }

    function cargarSecciones() {
        const select = el('rep-seccion');
        const mencion = el('rep-mencion');
        if (!select) return;

        const mencionId = mencion ? mencion.value : '';
        const lista = seccionesVisibles().filter(s => !mencionId || String(s.mencion_id) === String(mencionId));
        const anterior = select.value;

        const opciones = lista.map(s => {
            const total = (Array.isArray(window.students) ? window.students : [])
                .filter(e => String(e.seccion_id) === String(s.id)).length;
            return `<option value="${s.id}">${escapar(s.nombre)} · ${total} alumno(s)</option>`;
        }).join('');

        const todas = esAlcanceEstudiante() ? '<option value="">Todas las secciones</option>' : '';
        select.innerHTML = todas + (opciones || (esAlcanceEstudiante() ? '' : '<option value="">Sin secciones</option>'));

        if (anterior && Array.from(select.options).some(o => o.value === anterior)) {
            select.value = anterior;
        }
    }

    function esAlcanceEstudiante() {
        return !!(tipoActual && CONFIG[tipoActual] && CONFIG[tipoActual].alcance === 'estudiante');
    }

    /**
     * Secciones sobre las que se busca: si hay una sección elegida, solo esa;
     * si solo hay mención, las de esa mención; si no, todas las visibles.
     */
    function seccionesParaBusqueda() {
        const seccion = el('rep-seccion');
        if (seccion && seccion.value) return [Number(seccion.value)];

        const mencion = el('rep-mencion');
        const base = seccionesVisibles();

        if (mencion && mencion.value) {
            return base.filter(s => String(s.mencion_id) === String(mencion.value)).map(s => Number(s.id));
        }
        return base.map(s => Number(s.id));
    }

    /** Materias que el profesor imparte en la sección (vacío = todas). */
    function materiasDelProfesor(seccion) {
        const profesor = window.currentTeacher;
        if (!profesor || !Array.isArray(profesor.secciones)) return [];

        let asignaciones = [];
        try {
            asignaciones = typeof profesor.asignaciones === 'string'
                ? JSON.parse(profesor.asignaciones)
                : (profesor.asignaciones || []);
        } catch (e) {
            return [];
        }

        return asignaciones
            .filter(a => String(a.seccion_id) === String(seccion.id))
            .map(a => a.materia_nombre || a.materia)
            .filter(Boolean);
    }

    // ---------- Búsqueda de estudiantes ----------

    function ocultarLista() {
        const lista = el('rep-lista');
        if (lista) {
            lista.classList.remove('visible');
            lista.innerHTML = '';
        }
        indiceActivo = -1;
    }

    function pintarLista(resultados, texto) {
        const lista = el('rep-lista');
        if (!lista) return;

        indiceActivo = -1;

        if (!resultados.length) {
            if (String(texto || '').trim().length >= 2) {
                lista.innerHTML = `<div class="rep-lista-vacia">Sin coincidencias para «${escapar(texto)}»</div>`;
                lista.classList.add('visible');
            } else {
                lista.classList.remove('visible');
                lista.innerHTML = '';
            }
            return;
        }

        lista.innerHTML = resultados.map(e => `
            <div class="rep-lista-item" data-id="${e.id}">
                <span class="rep-lista-nombre">${escapar(e.apellido)}, ${escapar(e.nombre)}</span>
                <span class="rep-lista-meta">${escapar(e.cedula)} · ${escapar(nombreSeccion(e.seccion_id))}</span>
            </div>`).join('');

        lista.classList.add('visible');

        lista.querySelectorAll('.rep-lista-item').forEach(item => {
            item.addEventListener('click', () => {
                const estudiante = resultados.find(x => String(x.id) === String(item.dataset.id));
                if (estudiante) seleccionarEstudiante(estudiante);
            });
        });
    }

    function moverActivo(delta) {
        const lista = el('rep-lista');
        if (!lista) return;

        const items = lista.querySelectorAll('.rep-lista-item');
        if (!items.length) return;

        indiceActivo = (indiceActivo + delta + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle('activo', i === indiceActivo));

        if (typeof items[indiceActivo].scrollIntoView === 'function') {
            items[indiceActivo].scrollIntoView({ block: 'nearest' });
        }
    }

    // ---------- Estudiante seleccionado ----------

    function contenedorSeleccion() {
        let cont = el('rep-seleccion');
        if (cont) return cont;

        const buscador = document.querySelector('#rep-campo-estudiante .rep-buscador');
        if (!buscador) return null;

        cont = document.createElement('div');
        cont.id = 'rep-seleccion';
        cont.className = 'rep-seleccion';
        cont.style.display = 'none';
        buscador.parentNode.appendChild(cont);
        return cont;
    }

    function pintarSeleccion() {
        const cont = contenedorSeleccion();
        if (!cont) return;

        if (!estudianteElegido) {
            cont.style.display = 'none';
            cont.innerHTML = '';
            return;
        }

        cont.style.display = 'flex';
        cont.innerHTML = `
            <span><i class='bx bx-check-circle'></i>
                <strong>${escapar(estudianteElegido.apellido)}, ${escapar(estudianteElegido.nombre)}</strong>
                · ${escapar(estudianteElegido.cedula)}
            </span>
            <button type="button" id="rep-cambiar">Cambiar</button>`;

        cont.querySelector('#rep-cambiar').addEventListener('click', () => {
            estudianteElegido = null;
            const input = el('rep-buscar');
            if (input) {
                input.value = '';
                input.focus();
            }
            pintarSeleccion();
            limpiarPreview();
            aviso('info', '');
        });
    }

    function seleccionarEstudiante(estudiante) {
        estudianteElegido = estudiante;

        const input = el('rep-buscar');
        if (input) input.value = '';

        ocultarLista();
        pintarSeleccion();
        limpiarPreview();
        aviso('info', `Estudiante seleccionado. Pulsa «Ver vista previa».`);
    }

    // ---------- Avisos ----------

    function aviso(tipo, html) {
        const cont = el('rep-aviso');
        if (!cont) return;

        if (!html) {
            cont.innerHTML = '';
            return;
        }

        const icono = tipo === 'error' ? 'bx-error-circle' : 'bx-info-circle';
        cont.innerHTML = `<div class="rep-aviso ${tipo}"><i class='bx ${icono}' style="font-size:1.1rem;"></i><span>${html}</span></div>`;
    }

    // ---------- Vista previa ----------

    function crearVistaPrevia() {
        if (el('rep-preview')) return;

        const cont = el('rep-aviso');
        if (!cont) return;

        cont.insertAdjacentHTML('afterend', `
            <div class="rep-preview" id="rep-preview">
                <div class="rep-preview-barra">
                    <div class="rep-preview-titulo">
                        <i class='bx bx-show'></i> Vista previa
                        <span id="rep-preview-nombre"></span>
                    </div>
                    <div class="rep-preview-acciones">
                        <button type="button" class="btn-secondary" id="rep-preview-cerrar">
                            <i class='bx bx-x'></i> Cerrar
                        </button>
                        <button type="button" class="btn-primary" id="rep-preview-imprimir">
                            <i class='bx bx-printer'></i> Imprimir
                        </button>
                    </div>
                </div>
                <div class="rep-preview-hoja" id="rep-preview-hoja"></div>
            </div>`);

        el('rep-preview-imprimir').addEventListener('click', () => {
            if (!documentoActual) return;
            // Si es un boletín con attach(), leer el HTML actual del DOM
            // para que refleje el momento seleccionado
            var hoja = el('rep-preview-hoja');
            var htmlActual = hoja ? hoja.innerHTML : documentoActual.html;
            window.RepDocs.imprimir(htmlActual, documentoActual.opciones);
        });

        el('rep-preview-cerrar').addEventListener('click', limpiarPreview);
    }

    function mostrarVistaPrevia(html, opciones, titulo) {
        documentoActual = { html: html, opciones: opciones };

        const nombre = el('rep-preview-nombre');
        if (nombre) nombre.textContent = '· ' + titulo;

        const hoja = el('rep-preview-hoja');
        if (hoja) hoja.innerHTML = html;

        const cont = el('rep-preview');
        if (cont) {
            cont.classList.add('visible');
            if (typeof cont.scrollIntoView === 'function') {
                cont.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    function limpiarPreview() {
        documentoActual = null;
        const cont = el('rep-preview');
        if (cont) cont.classList.remove('visible');
        const hoja = el('rep-preview-hoja');
        if (hoja) hoja.innerHTML = '';
    }

    // ---------- Tarjetas ----------

    const CONFIG = {
        'boletin-est':      { alcance: 'estudiante', horizontal: false, titulo: 'Boletín' },
        'historico-est':    { alcance: 'estudiante', horizontal: false, titulo: 'Histórico de notas' },
        'evaluaciones':     { alcance: 'estudiante', horizontal: false, titulo: 'Boletín de evaluaciones' },
        'momentos-sec':     { alcance: 'seccion',    horizontal: false, titulo: 'Histórico de momentos' },
        'historico-sec':    { alcance: 'seccion',    horizontal: true,  titulo: 'Histórico de la sección' },
        'evaluaciones-sec': { alcance: 'seccion',    horizontal: true,  titulo: 'Evaluaciones de la sección' }
    };

    function abrir(tipo) {
        const config = CONFIG[tipo];
        if (!config) return;

        tipoActual = tipo;
        estudianteElegido = null;
        aviso('info', '');
        limpiarPreview();
        pintarSeleccion();

        document.querySelectorAll('.rep-card').forEach(c => {
            c.classList.toggle('activa', c.dataset.doc === tipo);
        });

        const form = el('rep-form');
        if (form) {
            form.classList.add('activo');
            form.classList.toggle('sin-buscador', config.alcance !== 'estudiante');
        }

        const campoEstudiante = el('rep-campo-estudiante');
        if (campoEstudiante) {
            campoEstudiante.style.display = config.alcance === 'estudiante' ? 'block' : 'none';
        }

        const input = el('rep-buscar');
        if (input) input.value = '';
        ocultarLista();

        cargarPeriodos();
        // Mención y sección sirven de filtro en los reportes por estudiante
        // y de destino en los reportes por sección.
        cargarMenciones();
    }

    // ---------- Generación ----------

    function generar() {
        if (!tipoActual) {
            aviso('error', 'Elige primero un tipo de documento.');
            return;
        }

        if (typeof window.RepDocs === 'undefined') {
            aviso('error', 'El módulo de reportes no está disponible.');
            return;
        }

        const periodo = periodoElegido();
        if (!periodo) {
            aviso('error', 'Selecciona un período.');
            return;
        }

        // Los reportes de evaluaciones necesitan consultar datos adicionales
        if (tipoActual === 'evaluaciones' || tipoActual === 'evaluaciones-sec') {
            generarEvaluaciones(periodo);
            return;
        }

        const config = CONFIG[tipoActual];
        let html = null;
        let titulo = config.titulo;

        if (config.alcance === 'estudiante') {
            if (!estudianteElegido) {
                aviso('error', 'Busca y selecciona un estudiante (por cédula o por nombre).');
                return;
            }

            if (tipoActual === 'boletin-est') {
                // Usar Boletin.attach() para que los botones de momento funcionen
                titulo = `${config.titulo} · ${estudianteElegido.apellido}, ${estudianteElegido.nombre}`;
                html = window.RepDocs.boletinIndividual(estudianteElegido, periodo);
                if (!html) {
                    aviso('error', 'No se pudo generar el documento. Revisa los datos e inténtalo de nuevo.');
                    return;
                }
                mostrarVistaPrevia(html, { titulo: titulo, horizontal: config.horizontal }, titulo);

                // Conectar los botones del selector de momento en la vista previa
                var hoja = el('rep-preview-hoja');
                if (hoja && typeof window.Boletin !== 'undefined') {
                    window.Boletin.attach(hoja, estudianteElegido, { periodo: periodo });
                }

                aviso('info', 'Vista previa lista. Revísala y pulsa «Imprimir» cuando esté correcta.');
                return;
            } else {
                html = window.RepDocs.historicoIndividual(estudianteElegido, periodo);
            }

            titulo = `${config.titulo} · ${estudianteElegido.apellido}, ${estudianteElegido.nombre}`;
        } else {
            const seccion = seccionElegida();
            if (!seccion) {
                aviso('error', 'Selecciona una sección.');
                return;
            }

            const total = window.RepDocs.alumnosDe(seccion).length;
            if (total === 0) {
                aviso('error', `La sección «${escapar(seccion.nombre)}» no tiene estudiantes inscritos.`);
                return;
            }

            if (tipoActual === 'momentos-sec') {
                html = window.RepDocs.historicoMomentosSeccion(seccion, periodo);
            } else {
                html = window.RepDocs.historicoSeccion(seccion, periodo);
            }

            titulo = `${config.titulo} · ${seccion.nombre}`;
        }

        if (!html) {
            aviso('error', 'No se pudo generar el documento. Revisa los datos e inténtalo de nuevo.');
            return;
        }

        mostrarVistaPrevia(html, { titulo: titulo, horizontal: config.horizontal }, titulo);
        aviso('info', 'Vista previa lista. Revísala y pulsa «Imprimir» cuando esté correcta.');
    }

    /** Boletín de evaluaciones: consulta las notas de evaluación y dibuja el documento. */
    function generarEvaluaciones(periodo) {
        const config = CONFIG[tipoActual];
        const esSeccion = config.alcance === 'seccion';

        let seccion = null;

        if (esSeccion) {
            seccion = seccionElegida();
            if (!seccion) {
                aviso('error', 'Selecciona una sección.');
                return;
            }
            if (window.RepDocs.alumnosDe(seccion).length === 0) {
                aviso('error', `La sección «${escapar(seccion.nombre)}» no tiene estudiantes inscritos.`);
                return;
            }
        } else {
            if (!estudianteElegido) {
                aviso('error', 'Busca y selecciona un estudiante (por cédula o por nombre).');
                return;
            }
            seccion = window.RepDocs.seccionDe(estudianteElegido);
            if (!seccion) {
                aviso('error', 'El estudiante no tiene una sección asignada.');
                return;
            }
        }

        const boton = el('rep-generar');
        const original = boton ? boton.innerHTML : '';
        if (boton) {
            boton.disabled = true;
            boton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Generando…';
        }
        aviso('info', 'Cargando las evaluaciones del período…');

        const base = (typeof window.getApiBaseUrl === 'function') ? window.getApiBaseUrl() : '../api/main.php';
        let url = `${base}?action=get_evaluaciones_detalle` +
            `&seccion_id=${encodeURIComponent(seccion.id)}` +
            `&periodo_id=${encodeURIComponent(periodo.id)}`;

        if (!esSeccion) {
            url += `&estudiante_id=${encodeURIComponent(estudianteElegido.id)}`;
        }

        fetch(url)
            .then(r => r.json())
            .then(datos => {
                let html;
                let titulo;

                if (esSeccion) {
                    html = window.RepDocs.historicoEvaluacionesSeccion(seccion, periodo, datos, {
                        materiasPermitidas: materiasDelProfesor(seccion)
                    });
                    titulo = `Evaluaciones de la sección · ${seccion.nombre}`;
                } else {
                    html = window.RepDocs.boletinEvaluaciones(estudianteElegido, periodo, datos);
                    titulo = `Boletín de evaluaciones · ${estudianteElegido.apellido}, ${estudianteElegido.nombre}`;
                }

                if (!html) {
                    aviso('error', 'No se pudo generar el documento.');
                    return;
                }

                mostrarVistaPrevia(html, { titulo: titulo, horizontal: config.horizontal }, titulo);
                aviso('info', 'Vista previa lista. Revísala y pulsa «Imprimir» cuando esté correcta.');
            })
            .catch(e => {
                aviso('error', 'No se pudieron cargar las evaluaciones: ' + escapar(e.message));
            })
            .finally(() => {
                if (boton) {
                    boton.disabled = false;
                    boton.innerHTML = original;
                }
            });
    }

    // ---------- Inicialización ----------

    function iniciar() {
        const tarjetas = document.querySelectorAll('.rep-card');
        if (!tarjetas.length) return;

        crearVistaPrevia();

        tarjetas.forEach(tarjeta => {
            tarjeta.addEventListener('click', () => abrir(tarjeta.dataset.doc));
        });

        const input = el('rep-buscar');
        if (input) {
            input.addEventListener('input', () => {
                const permitidas = seccionesParaBusqueda();
                const resultados = (typeof window.RepDocs !== 'undefined')
                    ? window.RepDocs.buscarEstudiantes(input.value, permitidas)
                    : [];
                pintarLista(resultados, input.value);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moverActivo(1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moverActivo(-1);
                } else if (e.key === 'Enter') {
                    const lista = el('rep-lista');
                    const activo = lista ? lista.querySelector('.rep-lista-item.activo') : null;
                    if (activo) {
                        e.preventDefault();
                        activo.click();
                    }
                } else if (e.key === 'Escape') {
                    ocultarLista();
                }
            });

            input.addEventListener('focus', () => {
                if (input.value.trim().length >= 2) {
                    pintarLista(window.RepDocs.buscarEstudiantes(input.value, seccionesParaBusqueda()), input.value);
                }
            });
        }

        document.addEventListener('click', (e) => {
            const contenedor = e.target.closest ? e.target.closest('.rep-buscador') : null;
            if (!contenedor) ocultarLista();
        });

        const mencion = el('rep-mencion');
        if (mencion) mencion.addEventListener('change', cargarSecciones);

        const boton = el('rep-generar');
        if (boton) boton.addEventListener('click', generar);

        cargarPeriodos();
    }

    /** Permite refrescar los selectores cuando llegan los datos. */
    function refrescar() {
        cargarPeriodos();
        if (tipoActual && CONFIG[tipoActual] && CONFIG[tipoActual].alcance === 'seccion') {
            cargarMenciones();
        }
    }

    window.RepPanel = { refrescar: refrescar };

    document.addEventListener('DOMContentLoaded', iniciar);
})(window, document);
