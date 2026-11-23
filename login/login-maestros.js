// login-maestros.js v1.1.0
// Maneja el inicio de sesión de profesores mediante cédula + contraseña

document.addEventListener('DOMContentLoaded', async () => {
    // Cargar datos desde MySQL primero
    if (typeof initData === 'function') {
        await initData();
    }

    // ===== TOGGLE CONTRASEÑA =====
    const pwToggle = document.getElementById('teacher-pw-toggle');
    const pwInput  = document.getElementById('teacher-password');
    const pwIcon   = document.getElementById('teacher-pw-icon');
    if (pwToggle && pwInput && pwIcon) {
        pwToggle.addEventListener('click', () => {
            const hidden = pwInput.type === 'password';
            pwInput.type = hidden ? 'text' : 'password';
            pwIcon.className = hidden ? 'bx bx-show' : 'bx bx-hide';
        });
    }

    // ===== FORMULARIO DE LOGIN =====
    const cedulaForm  = document.getElementById('cedulaForm');
    const cedulaError = document.getElementById('cedulaError');
    const passError   = document.getElementById('passwordError');

    if (!cedulaForm) return;

    cedulaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const cedula    = document.getElementById('cedula').value.trim();
        const password  = pwInput ? pwInput.value : '';

        // Ocultar errores previos
        if (cedulaError) { cedulaError.style.display = 'none'; cedulaError.textContent = ''; }
        if (passError)   { passError.style.display   = 'none'; passError.textContent   = ''; }

        // Función para normalizar cédulas (quita V-, V, etc.)
        const normalizeCedula = (val) => {
            if (!val) return '';
            return val.replace(/^[vVeE][-\s]?/, '').trim();
        };

        const normalizedInput = normalizeCedula(cedula);

        if (typeof users === 'undefined' || users === null) {
            if (cedulaError) { cedulaError.textContent = 'Error: No se pudo conectar con la base de datos.'; cedulaError.style.display = 'block'; }
            return;
        }

        if (users.length === 0) {
            if (cedulaError) { cedulaError.textContent = 'Cargando datos del servidor, por favor espere...'; cedulaError.style.display = 'block'; }
            if (typeof initData === 'function') initData();
            return;
        }

        // Buscar profesor por cédula
        const teacher = users.find(u => {
            if (u.rol !== 'teacher') return false;
            return normalizeCedula(u.cedula) === normalizedInput;
        });

        if (!teacher) {
            if (cedulaError) { cedulaError.textContent = 'Cédula no registrada como profesor.'; cedulaError.style.display = 'block'; }
            return;
        }

        // Verificar si el profesor se encuentra inhabilitado
        if (teacher.activo !== undefined && (teacher.activo === 0 || teacher.activo === '0' || teacher.activo === false)) {
            if (cedulaError) {
                cedulaError.textContent = 'Su cuenta docente se encuentra inhabilitada. Comuníquese con la Dirección o Control de Estudios.';
                cedulaError.style.display = 'block';
            }
            return;
        }

        // Verificar contraseña
        const storedPass = teacher.password || '123456';
        if (password !== storedPass) {
            if (passError) { passError.textContent = 'Contraseña incorrecta.'; passError.style.display = 'block'; }
            return;
        }

        // Crear sesión
        const session = {
            id:           teacher.id,
            cedula:       teacher.cedula,
            nombre:       teacher.nombre,
            apellido:     teacher.apellido,
            email:        teacher.email,
            rol:          'teacher',
            asignaciones: teacher.asignaciones || '[]'
        };

        sessionStorage.setItem('currentUser', JSON.stringify(session));

        if (typeof showToast === 'function') {
            showToast('¡Bienvenido, ' + teacher.nombre + '! Ingresando al sistema...', 'success');
        }

        setTimeout(() => {
            window.location.href = '../profesor/index.html';
        }, 800);
    });

    // ===== MODAL RECUPERAR CONTRASEÑA =====
    const forgotLink    = document.getElementById('teacher-forgot-link');
    const fpOverlay     = document.getElementById('teacher-forgot-overlay');
    const fpCancelBtn   = document.getElementById('fp-cancel-btn');
    const fpSendBtn     = document.getElementById('fp-send-btn');
    const fpInput       = document.getElementById('fp-input');
    const fpError       = document.getElementById('fp-error');
    const fpFormView    = document.getElementById('fp-form-view');
    const fpSuccessView = document.getElementById('fp-success-view');
    const fpCloseSuccess= document.getElementById('fp-close-success');

    function openFpModal() {
        if (!fpOverlay) return;
        if (fpFormView)    { fpFormView.style.display    = 'block'; }
        if (fpSuccessView) { fpSuccessView.style.display = 'none'; }
        if (fpInput)       { fpInput.value = ''; }
        if (fpError)       { fpError.style.display = 'none'; fpError.textContent = ''; }
        fpOverlay.classList.add('active');
        setTimeout(() => { if (fpInput) fpInput.focus(); }, 150);
    }

    function closeFpModal() {
        if (fpOverlay) fpOverlay.classList.remove('active');
    }

    if (forgotLink)   forgotLink.addEventListener('click', openFpModal);
    if (fpCancelBtn)  fpCancelBtn.addEventListener('click', closeFpModal);
    if (fpCloseSuccess) fpCloseSuccess.addEventListener('click', closeFpModal);

    // Cerrar al hacer click en el fondo
    if (fpOverlay) {
        fpOverlay.addEventListener('click', (e) => {
            if (e.target === fpOverlay) closeFpModal();
        });
    }

    // Tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeFpModal();
    });

    if (fpSendBtn) {
        fpSendBtn.addEventListener('click', async () => {
            if (fpError) { fpError.style.display = 'none'; fpError.textContent = ''; }

            const val = fpInput ? fpInput.value.trim() : '';
            if (!val) {
                if (fpError) { fpError.textContent = 'Por favor ingresa tu cédula o email.'; fpError.style.display = 'block'; }
                return;
            }

            fpSendBtn.disabled = true;
            fpSendBtn.textContent = 'Enviando...';

            let cedula = '';
            let email  = '';
            if (val.includes('@')) {
                email = val;
            } else {
                cedula = val;
                if (!cedula.match(/^[VEve]-/)) cedula = 'V-' + cedula;
                cedula = cedula.toUpperCase();
            }

            try {
                const response = await fetch('../api/main.php?action=request_reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cedula, email, rol: 'teacher' })
                });
                const res = await response.json();

                if (res.success) {
                    if (fpFormView)    { fpFormView.style.display    = 'none'; }
                    if (fpSuccessView) { fpSuccessView.style.display = 'block'; }
                } else {
                    if (fpError) { fpError.textContent = res.error || 'No se encontró un profesor con esos datos.'; fpError.style.display = 'block'; }
                }
            } catch (err) {
                console.error('Error reset request:', err);
                if (fpError) { fpError.textContent = 'Error de conexión con el servidor.'; fpError.style.display = 'block'; }
            } finally {
                fpSendBtn.disabled = false;
                fpSendBtn.textContent = 'Enviar Solicitud';
            }
        });
    }
});
