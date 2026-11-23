// admin/promocion.js
// Promoción de una sección completa al año escolar siguiente.
//
// Reglas (todas se validan también en el servidor):
//   · Solo se permite con el período escolar cerrado.
//   · 6to año no se promueve: los estudiantes egresan.
//   · El destino es una sección del año siguiente, de la misma mención.
//   · Si el destino ya tiene estudiantes, se avisa de la fusión y hay que confirmarla.
//   · Si la sección destino no existe, se crea con el nombre indicado.

(function () {
    'use strict';

    const ORDINALES = { 1: '1ro', 2: '2do', 3: '3ro', 4: '4to', 5: '5to', 6: '6to' };
    let contexto = null;

    function el(id) {
        return document.getElementById(id);
    }

    function anioDe(nombre) {
        const coincidencia = String(nombre || '').match(/\d+/);
        return coincidencia ? parseInt(coincidencia[0], 10) : null;
    }

    /** "1ro Año A" -> "2do Año A" */
    function nombreSiguiente(nombre) {
        const partes = String(nombre || '').match(/^\s*(\d+)\s*(?:ro|do|to|er|º|°)?\s*(.*)$/i);
        if (!partes) return null;

        const siguiente = parseInt(partes[1], 10) + 1;
        if (siguiente > 6) return null;

        const resto = (partes[2] || '').trim();
        return resto ? `${ORDINALES[siguiente]} ${resto}` : ORDINALES[siguiente];
    }

    function estudiantesDe(seccionId) {
        const lista = Array.isArray(students) ? students : [];
        return lista
            .filter(s => parseInt(s.seccion_id || s.seccion, 10) === parseInt(seccionId, 10))
            .sort((a, b) => String(a.apellido || '').localeCompare(String(b.apellido || '')));
    }

    function periodosAbiertos() {
        const lista = Array.isArray(periods) ? periods : [];
        return lista.filter(p => p.estado !== 'cerrado');
    }

    /** Secciones del año siguiente, de la misma mención, con su matrícula. */
    function destinosPosibles(seccion, mencionId) {
        const anio = anioDe(seccion.nombre);
        const lista = Array.isArray(sections) ? sections : [];

        return lista
            .filter(s =>
                String(s.mencion_id || '') === String(mencionId || '') &&
                anioDe(s.nombre) === anio + 1
            )
            .map(s => ({ id: s.id, nombre: s.nombre, total: estudiantesDe(s.id).length }))
            .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
    }

    // ---------- Apertura y validaciones ----------

    function abrir(seccionId) {
        const listaSecciones = Array.isArray(sections) ? sections : [];
        const seccion = listaSecciones.find(s => parseInt(s.id, 10) === parseInt(seccionId, 10));

        if (!seccion) {
            showToast('No se encontró la sección', 'error');
            return;
        }

        const anio = anioDe(seccion.nombre);
        if (anio === null) {
            showToast('No se pudo determinar el año de la sección', 'error');
            return;
        }

        if (anio >= 6) {
            showToast('Los estudiantes de 6to año no se promueven: al terminar egresan del plantel.', 'warning');
            return;
        }

        const abiertos = periodosAbiertos();
        if (abiertos.length > 0) {
            showToast(`Cierra el período escolar antes de promover. Está abierto: ${abiertos.map(p => p.nombre).join(', ')}.`, 'error');
            return;
        }

        const estudiantes = estudiantesDe(seccion.id);
        if (estudiantes.length === 0) {
            showToast(`La sección "${seccion.nombre}" no tiene estudiantes inscritos.`, 'warning');
            return;
        }

        const nombreSugerido = nombreSiguiente(seccion.nombre);
        if (!nombreSugerido) {
            showToast('No se pudo calcular la sección del año siguiente', 'error');
            return;
        }

        const mencionId = seccion.mencion_id || seccion.mencionId || null;

        contexto = {
            seccion,
            mencionId,
            lista: estudiantes,
            nombreSugerido,
            candidatas: destinosPosibles(seccion, mencionId),
            seleccion: new Set(estudiantes.map(e => parseInt(e.id, 10))),
            destinoTipo: 'nueva',
            destinoId: null,
            confirmoFusion: false
        };

        pintar();
        abrirModal();
    }

    // ---------- Dibujo ----------

    function pintar() {
        const { seccion, lista, candidatas, nombreSugerido, mencionId } = contexto;
        const mencion = (Array.isArray(mentions) ? mentions : []).find(m => String(m.id) === String(mencionId));

        const opciones = candidatas.map(c =>
            `<option value="existente:${c.id}">${escHtml(c.nombre)} — ${c.total} estudiante(s)</option>`
        ).join('');

        const filas = lista.map(e => {
            const marcado = contexto.seleccion.has(parseInt(e.id, 10));
            return `
                <label class="promote-item">
                    <input type="checkbox" class="promote-check" data-id="${e.id}" ${marcado ? 'checked' : ''}>
                    <span class="promote-nombre">${escHtml(e.apellido)}, ${escHtml(e.nombre)}</span>
                    <span class="promote-cedula">${escHtml(e.cedula)}</span>
                </label>`;
        }).join('');

        el('promote-body').innerHTML = `
            <div class="promote-resumen">
                <div class="promote-dato"><span>Sección de origen</span><strong>${escHtml(seccion.nombre)}</strong></div>
                <div class="promote-dato"><span>Mención</span><strong>${escHtml(mencion ? mencion.nombre : 'Sin mención')}</strong></div>
                <div class="promote-dato"><span>A promover</span><strong>${lista.length} estudiante(s)</strong></div>
            </div>

            <div class="promote-destino-bloque">
                <label class="promote-etiqueta" for="promote-destino-select">Sección destino</label>
                <select id="promote-destino-select" class="filter-select">
                    ${opciones}
                    <option value="nueva">➕ Crear nueva sección…</option>
                </select>
                <input type="text" id="promote-destino-nombre" class="filter-select" maxlength="50"
                       placeholder="Ej: 2do Año B" value="${escHtml(nombreSugerido)}" style="display: none;">
                <p id="promote-destino-error" class="promote-error" style="display: none;"></p>
            </div>

            <div id="promote-aviso-fusion" class="promote-aviso" style="display: none;">
                <i class='bx bx-error' style="font-size: 1.15rem; margin-top: 1px;"></i>
                <div>
                    <p id="promote-aviso-texto" style="margin: 0;"></p>
                    <label class="promote-confirmo">
                        <input type="checkbox" id="promote-confirmo-fusion">
                        Entiendo que se fusionarán las secciones
                    </label>
                </div>
            </div>

            <div class="promote-lista-cabecera">
                <label class="promote-todos"><input type="checkbox" id="promote-todos" checked> Seleccionar todos</label>
                <span id="promote-contador" style="font-size: 0.82rem; color: #64748b;"></span>
            </div>
            <div class="promote-lista" id="promote-lista">${filas}</div>
        `;

        el('promote-footer').innerHTML = `
            <button class="btn-secondary" id="promote-cancelar">Cancelar</button>
            <button class="btn-primary" id="promote-confirmar"><i class='bx bx-up-arrow-alt'></i> Promover</button>
        `;

        // Eventos
        el('promote-cancelar').addEventListener('click', cerrarModal);
        el('promote-confirmar').addEventListener('click', confirmar);

        el('promote-destino-select').addEventListener('change', aplicarDestino);
        el('promote-destino-nombre').addEventListener('input', () => {
            actualizarBoton();
        });
        el('promote-confirmo-fusion').addEventListener('change', (e) => {
            contexto.confirmoFusion = e.target.checked;
            actualizarBoton();
        });

        el('promote-todos').addEventListener('change', (e) => {
            const marcar = e.target.checked;
            contexto.seleccion.clear();
            if (marcar) {
                contexto.lista.forEach(est => contexto.seleccion.add(parseInt(est.id, 10)));
            }
            el('promote-lista').querySelectorAll('.promote-check').forEach(chk => { chk.checked = marcar; });
            actualizarContador();
        });

        el('promote-lista').querySelectorAll('.promote-check').forEach(chk => {
            chk.addEventListener('change', () => {
                const id = parseInt(chk.dataset.id, 10);
                if (chk.checked) contexto.seleccion.add(id);
                else contexto.seleccion.delete(id);
                actualizarContador();
            });
        });

        // Destino preseleccionado: la sección del año siguiente si ya existe
        const existente = candidatas.find(c => String(c.nombre).trim().toLowerCase() === nombreSugerido.toLowerCase());
        el('promote-destino-select').value = existente ? `existente:${existente.id}` : 'nueva';

        aplicarDestino();
        actualizarContador();
    }

    /** Aplica el destino elegido en el selector. */
    function aplicarDestino() {
        const select = el('promote-destino-select');
        const input = el('promote-destino-nombre');
        const error = el('promote-destino-error');
        if (!select) return;

        contexto.confirmoFusion = false;
        const check = el('promote-confirmo-fusion');
        if (check) check.checked = false;

        if (select.value === 'nueva') {
            contexto.destinoTipo = 'nueva';
            contexto.destinoId = null;
            input.style.display = 'block';
            error.style.display = 'none';
        } else {
            contexto.destinoTipo = 'existente';
            contexto.destinoId = parseInt(String(select.value).split(':')[1], 10);
            input.style.display = 'none';
            error.style.display = 'none';
        }

        actualizarAvisoFusion();
        actualizarBoton();
    }

    function destinoSeleccionado() {
        if (contexto.destinoTipo !== 'existente') return null;
        return contexto.candidatas.find(c => parseInt(c.id, 10) === parseInt(contexto.destinoId, 10)) || null;
    }

    function actualizarAvisoFusion() {
        const aviso = el('promote-aviso-fusion');
        if (!aviso) return;

        const destino = destinoSeleccionado();
        if (!destino || destino.total === 0) {
            aviso.style.display = 'none';
            return;
        }

        const quedaria = destino.total + contexto.seleccion.size;
        el('promote-aviso-texto').innerHTML =
            `<strong>${escHtml(destino.nombre)}</strong> ya tiene ${destino.total} estudiante(s). ` +
            `Al promover, la sección quedará con <strong>${quedaria}</strong>.`;
        aviso.style.display = 'flex';
    }

    function actualizarContador() {
        if (!contexto) return;

        const total = contexto.lista.length;
        const marcados = contexto.seleccion.size;

        el('promote-contador').textContent = `${marcados} de ${total} seleccionados`;

        const todos = el('promote-todos');
        todos.checked = total > 0 && marcados === total;
        todos.indeterminate = marcados > 0 && marcados < total;

        actualizarAvisoFusion();
        actualizarBoton();
    }

    function actualizarBoton() {
        if (!contexto) return;

        const boton = el('promote-confirmar');
        if (!boton) return;

        const marcados = contexto.seleccion.size;
        let habilitado = marcados > 0;
        let motivo = '';

        if (contexto.destinoTipo === 'existente') {
            const destino = destinoSeleccionado();
            if (!destino) {
                habilitado = false;
            } else if (destino.total > 0 && !contexto.confirmoFusion) {
                habilitado = false;
                motivo = 'Confirma la fusión de secciones para continuar';
            }
        } else {
            const input = el('promote-destino-nombre');
            const nombre = input ? input.value.trim() : '';
            if (!nombre) {
                habilitado = false;
                motivo = 'Escribe el nombre de la sección nueva';
            }
        }

        boton.disabled = !habilitado;
        boton.innerHTML = `<i class='bx bx-up-arrow-alt'></i> Promover ${marcados}`;
        boton.title = motivo;
    }

    // ---------- Acción ----------

    async function confirmar() {
        if (!contexto) return;

        const ids = Array.from(contexto.seleccion);
        if (ids.length === 0) {
            showToast('Selecciona al menos un estudiante', 'error');
            return;
        }

        const payload = {
            origen_id: parseInt(contexto.seccion.id, 10),
            destino_id: contexto.destinoTipo === 'existente' ? contexto.destinoId : 0,
            estudiantes: ids
        };

        if (contexto.destinoTipo === 'nueva') {
            const input = el('promote-destino-nombre');
            const nombre = input ? input.value.trim() : '';

            if (!nombre) {
                const error = el('promote-destino-error');
                error.textContent = 'Escribe el nombre de la sección nueva';
                error.style.display = 'block';
                if (input) input.focus();
                return;
            }
            payload.destino_nombre = nombre;
        }

        const boton = el('promote-confirmar');
        const textoOriginal = boton.innerHTML;
        boton.disabled = true;
        boton.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Promoviendo...`;

        try {
            const respuesta = await fetch('../api/main.php?action=promover_seccion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await respuesta.json();

            if (!data || !data.success) {
                showToast((data && data.error) || 'No se pudo promover la sección', 'error');
                boton.disabled = false;
                boton.innerHTML = textoOriginal;
                return;
            }

            // Recargar antes de mostrar el resultado, para que la sección nueva exista en pantalla
            if (window.dataHelpers && typeof window.dataHelpers.initData === 'function') {
                await window.dataHelpers.initData();
            } else if (typeof initData === 'function') {
                await initData();
            }

            mostrarResultado(data);
            showToast(`${data.movidos} estudiante(s) promovido(s)`, 'success');
        } catch (error) {
            console.error('[Promoción] Error:', error);
            showToast('Error de conexión al promover la sección', 'error');
            boton.disabled = false;
            boton.innerHTML = textoOriginal;
        }
    }

    function mostrarResultado(data) {
        const origen = contexto.seccion;
        const destino = data.destino || {};

        el('promote-body').innerHTML = `
            <div class="promote-exito">
                <i class='bx bx-check-circle'></i>
                <h4>${data.movidos} estudiante(s) promovido(s)</h4>
                <p>De <strong>${escHtml(origen.nombre)}</strong> a <strong>${escHtml(destino.nombre || '')}</strong>.</p>
                ${destino.total ? `<p>La sección destino ahora tiene <strong>${destino.total}</strong> estudiante(s).</p>` : ''}
            </div>
            ${destino.creada ? `
            <p class="promote-aviso">
                <i class='bx bx-info-circle'></i> Se creó la sección <strong>${escHtml(destino.nombre)}</strong> con la misma mención y
                profesor guía. Puedes editarla si necesitas cambiar el guía u otros datos.
            </p>` : ''}
        `;

        el('promote-footer').innerHTML = `
            <button class="btn-secondary" id="promote-cerrar">Cerrar</button>
            ${destino.creada ? `<button class="btn-primary" id="promote-editar-destino"><i class='bx bx-edit-alt'></i> Editar sección creada</button>` : ''}
        `;

        el('promote-cerrar').addEventListener('click', cerrarModal);

        const botonEditar = el('promote-editar-destino');
        if (botonEditar) {
            botonEditar.addEventListener('click', () => {
                cerrarModal();
                setTimeout(() => {
                    const botonSeccion = document.querySelector(`.edit-section[data-id="${destino.id}"]`);
                    if (botonSeccion) {
                        botonSeccion.click();
                    } else {
                        showToast('La sección se creó. Ábrela desde "Secciones y Años" para editarla.', 'info');
                    }
                }, 350);
            });
        }
    }

    // ---------- Modal ----------

    function abrirModal() {
        const overlay = el('promote-modal');
        if (!overlay) return;
        overlay.style.display = 'flex';
        requestAnimationFrame(() => overlay.classList.add('active'));
    }

    function cerrarModal() {
        const overlay = el('promote-modal');
        if (!overlay) return;
        overlay.classList.remove('active');
        setTimeout(() => { overlay.style.display = 'none'; }, 250);
    }

    function inicializar() {
        const overlay = el('promote-modal');
        if (!overlay) return;

        el('promote-modal-close')?.addEventListener('click', cerrarModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrarModal();
        });
    }

    window.abrirPromocion = abrir;

    document.addEventListener('DOMContentLoaded', inicializar);
})();
