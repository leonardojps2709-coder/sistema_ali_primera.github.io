/**
 * login.js
 * CONTROLADOR DE INICIO DE SESIÓN
 * Maneja el inicio de sesión de administradores y superadministradores.
 * Además, contiene la lógica de los modales de recuperación de contraseña y superadmin.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar datos desde MySQL primero
    if (typeof initData === 'function') {
        await initData();
    }
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    
    /**
     * Normaliza el formato de la cédula para comparaciones uniformes.
     * @param {string} val - El valor introducido por el usuario (puede ser email o cédula).
     * @returns {string} El string sin espacios extras y sin prefijos como "V-".
     */
    const normalizeCedula = (val) => {
        if (!val) return '';
        // Si parece un email, no lo normalizamos como cédula
        if (val.includes('@')) return val.toLowerCase().trim();
        // Quitar prefijos V-, V , v-, v y espacios sobrantes
        return val.replace(/^[vVeE][-\s]?/, '').trim();
    };

    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('bx-show');
            this.classList.toggle('bx-hide');
        });
    }

    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('username').value.trim();
        const pswValue = passwordInput.value;
        const usernameError = document.getElementById('usernameError');
        const passwordError = document.getElementById('passwordError');

        usernameError.style.display = 'none';
        passwordError.style.display = 'none';

        if (!usernameInput) {
            usernameError.textContent = 'Por favor ingresa un usuario válido';
            usernameError.style.display = 'block';
            return;
        }

        if (!pswValue) {
            passwordError.textContent = 'Por favor ingresa una contraseña válida';
            passwordError.style.display = 'block';
            return;
        }

        if (typeof users === 'undefined' || users === null) {
            usernameError.textContent = 'Error: No se pudo conectar con la base de datos.';
            usernameError.style.display = 'block';
            console.error('La variable global "users" no existe. Revise la consola para errores en data.js.');
            return;
        }

        if (users.length === 0) {
            usernameError.textContent = 'Cargando datos del servidor, por favor espere...';
            usernameError.style.display = 'block';
            if (typeof initData === 'function') initData();
            return;
        }

        const normalizedInput = normalizeCedula(usernameInput);

        const admin = users.find(u => {
            if (u.rol !== 'admin') return false;
            const normDbCedula = normalizeCedula(u.cedula);
            const normDbEmail = (u.email || '').toLowerCase().trim();
            return normDbCedula === normalizedInput || normDbEmail === normalizedInput;
        });

        if (!admin) {
            usernameError.textContent = 'Usuario administrador no encontrado en la base de datos';
            usernameError.style.display = 'block';
            return;
        }

        if (admin.password !== pswValue) {
            passwordError.textContent = 'Contraseña incorrecta';
            passwordError.style.display = 'block';
            return;
        }

        const session = {
            id: admin.id,
            cedula: admin.cedula,
            nombre: admin.nombre,
            apellido: admin.apellido,
            email: admin.email,
            rol: 'admin'
        };

        sessionStorage.setItem('currentUser', JSON.stringify(session));

        if (typeof showToast === 'function') {
            showToast('¡Bienvenido, ' + admin.nombre + '! Accediendo al panel de administración...', 'success');
        }

        setTimeout(() => {
            window.location.href = '../admin/index.html';
        }, 800);
    });

    // ========== SUPERADMIN MODAL LOGIC ==========
    const brandLogo = document.getElementById('login-brand-logo');
    const saOverlay = document.getElementById('superadmin-overlay');
    const saCloseBtn = document.getElementById('sa-close-btn');
    const saLoginBtn = document.getElementById('sa-login-btn');
    const saUsernameInput = document.getElementById('sa-username');
    const saPasswordInput = document.getElementById('sa-password');
    const saTogglePw = document.getElementById('sa-toggle-pw');
    const saUsernameError = document.getElementById('sa-username-error');
    const saPasswordError = document.getElementById('sa-password-error');

    // Triple click detection
    let clickCount = 0;
    let clickTimer = null;

    if (brandLogo) {
        brandLogo.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
            }
            if (clickCount >= 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                openSuperAdminModal();
            }
        });
    }

    /**
     * Abre el modal de inicio de sesión secreto para el Super Administrador
     * y resetea los campos de entrada.
     */
    function openSuperAdminModal() {
        if (!saOverlay) return;
        saOverlay.classList.add('active');
        if (saUsernameInput) {
            saUsernameInput.value = '';
            setTimeout(() => saUsernameInput.focus(), 350);
        }
        if (saPasswordInput) saPasswordInput.value = '';
        hideSAErrors();
    }

    function closeSuperAdminModal() {
        if (!saOverlay) return;
        saOverlay.classList.remove('active');
    }

    function hideSAErrors() {
        if (saUsernameError) saUsernameError.style.display = 'none';
        if (saPasswordError) saPasswordError.style.display = 'none';
        if (saUsernameInput) saUsernameInput.style.borderColor = '';
        if (saPasswordInput) saPasswordInput.style.borderColor = '';
    }

    if (saCloseBtn) saCloseBtn.addEventListener('click', closeSuperAdminModal);

    // Close on overlay background click
    if (saOverlay) {
        saOverlay.addEventListener('click', (e) => {
            if (e.target === saOverlay) closeSuperAdminModal();
        });
    }

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && saOverlay && saOverlay.classList.contains('active')) {
            closeSuperAdminModal();
        }
    });

    // Toggle superadmin password visibility
    if (saTogglePw) {
        saTogglePw.addEventListener('click', () => {
            const type = saPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            saPasswordInput.setAttribute('type', type);
            saTogglePw.classList.toggle('bx-show');
            saTogglePw.classList.toggle('bx-hide');
        });
    }

    // Enter key on SA inputs
    [saUsernameInput, saPasswordInput].forEach(input => {
        if (input) input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSuperAdminLogin();
        });
    });

    // SA Login button
    if (saLoginBtn) saLoginBtn.addEventListener('click', handleSuperAdminLogin);

    /**
     * Procesa las credenciales del Super Administrador, verificándolas contra la BD.
     * Si es exitoso, crea la sesión en sessionStorage y redirige al panel SA.
     */
    async function handleSuperAdminLogin() {
        hideSAErrors();
        const usernameVal = saUsernameInput ? saUsernameInput.value.trim() : '';
        const passwordVal = saPasswordInput ? saPasswordInput.value : '';

        if (!usernameVal) {
            if (saUsernameError) { saUsernameError.textContent = 'Por favor ingresa un usuario'; saUsernameError.style.display = 'block'; }
            if (saUsernameInput) saUsernameInput.style.borderColor = '#ff6b6b';
            return;
        }
        if (!passwordVal) {
            if (saPasswordError) { saPasswordError.textContent = 'Por favor ingresa una contraseña'; saPasswordError.style.display = 'block'; }
            if (saPasswordInput) saPasswordInput.style.borderColor = '#ff6b6b';
            return;
        }

        // Reload data if empty
        if (typeof users === 'undefined' || users.length === 0) {
            if (typeof initData === 'function') await initData();
        }

        const cleanInput = (usernameVal || '').toLowerCase().trim();
        const normalizedInput = normalizeCedula(usernameVal).toLowerCase().trim();

        const superAdmin = users.find(u => {
            if (u.rol !== 'superadmin') return false;
            const dbCedula = (u.cedula || '').toLowerCase().trim();
            const normDbCedula = normalizeCedula(u.cedula).toLowerCase().trim();
            const normDbEmail = (u.email || '').toLowerCase().trim();
            return cleanInput === dbCedula || cleanInput === normDbEmail || normalizedInput === normDbCedula;
        });

        if (!superAdmin) {
            if (saUsernameError) { saUsernameError.textContent = 'Usuario superadministrador no encontrado'; saUsernameError.style.display = 'block'; }
            if (saUsernameInput) saUsernameInput.style.borderColor = '#ff6b6b';
            return;
        }

        if (superAdmin.password !== passwordVal) {
            if (saPasswordError) { saPasswordError.textContent = 'Contraseña incorrecta'; saPasswordError.style.display = 'block'; }
            if (saPasswordInput) saPasswordInput.style.borderColor = '#ff6b6b';
            return;
        }

        // Session for superadmin
        const session = {
            id: superAdmin.id,
            cedula: superAdmin.cedula,
            nombre: superAdmin.nombre,
            apellido: superAdmin.apellido,
            email: superAdmin.email,
            rol: 'superadmin'
        };

        sessionStorage.setItem('currentUser', JSON.stringify(session));

        if (typeof showToast === 'function') {
            showToast('¡Bienvenido, ' + superAdmin.nombre + '! Accediendo al panel de superadministración...', 'success');
        }

        setTimeout(() => {
            window.location.href = '../superadmin/index.html';
        }, 800);
    }

    // ========== RECUPERAR CONTRASEÑA LOGIC ==========
    const fpLink = document.getElementById('forgotPasswordLink');
    const fpOverlay = document.getElementById('forgot-password-overlay');
    const fpCloseBtn = document.getElementById('fp-close-btn');
    const fpSubmitBtn = document.getElementById('fp-submit-btn');
    const fpInput = document.getElementById('fp-input');
    const fpError = document.getElementById('fp-error');

    function openFpModal() {
        if (!fpOverlay) return;
        fpOverlay.classList.add('active');
        if (fpInput) {
            fpInput.value = '';
            fpInput.style.borderColor = '';
            setTimeout(() => fpInput.focus(), 350);
        }
        if (fpError) fpError.style.display = 'none';
    }

    function closeFpModal() {
        if (!fpOverlay) return;
        fpOverlay.classList.remove('active');
    }

    if (fpLink) {
        fpLink.addEventListener('click', (e) => {
            e.preventDefault();
            openFpModal();
        });
    }

    if (fpCloseBtn) fpCloseBtn.addEventListener('click', closeFpModal);

    if (fpOverlay) {
        fpOverlay.addEventListener('click', (e) => {
            if (e.target === fpOverlay) closeFpModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fpOverlay && fpOverlay.classList.contains('active')) {
            closeFpModal();
        }
    });

    if (fpInput) {
        fpInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleFpSubmit();
        });
    }

    if (fpSubmitBtn) {
        fpSubmitBtn.addEventListener('click', handleFpSubmit);
    }

    /**
     * Envía la solicitud de restablecimiento de contraseña a la API.
     * Detecta automáticamente si el usuario ingresó un email o una cédula.
     */
    async function handleFpSubmit() {
        if (!fpInput || !fpError) return;
        fpError.style.display = 'none';
        fpInput.style.borderColor = '';

        const val = fpInput.value.trim();
        if (!val) {
            fpError.textContent = 'Por favor ingresa tu cédula o email';
            fpError.style.display = 'block';
            fpInput.style.borderColor = '#ff6b6b';
            return;
        }

        fpSubmitBtn.disabled = true;
        fpSubmitBtn.innerHTML = 'Enviando...';

        let cedula = '';
        let email = '';
        if (val.includes('@')) {
            email = val;
        } else {
            // Assume cedula
            cedula = val;
            if (!cedula.match(/^[VEve]-/)) {
                cedula = 'V-' + cedula;
            }
            cedula = cedula.toUpperCase();
        }

        try {
            const response = await fetch('../api/main.php?action=request_reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedula, email })
            });
            const res = await response.json();
            
            if (res.success) {
                if (typeof showToast === 'function') {
                    showToast('Solicitud enviada exitosamente', 'success');
                } else {
                    alert(res.message);
                }
                closeFpModal();
            } else {
                fpError.textContent = res.error || 'Error al procesar la solicitud';
                fpError.style.display = 'block';
                fpInput.style.borderColor = '#ff6b6b';
            }
        } catch (error) {
            console.error('Error reset request:', error);
            fpError.textContent = 'Error de conexión con el servidor';
            fpError.style.display = 'block';
            fpInput.style.borderColor = '#ff6b6b';
        } finally {
            fpSubmitBtn.disabled = false;
            fpSubmitBtn.innerHTML = 'Enviar Solicitud';
        }
    }
});
