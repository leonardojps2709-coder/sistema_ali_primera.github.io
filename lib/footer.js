/**
 * footer.js - Manejo de los modales "Acerca de" y "Términos y Privacidad"
 */
(function() {
    function initAboutModals() {
        const aboutModal = document.getElementById('about-modal');
        const termsModal = document.getElementById('terms-modal');

        function openModal(modal) {
            if (!modal) return;
            modal.style.display = 'flex';
            // Forzar reflow para animación fluida si existe clase active
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modal) {
            if (!modal) return;
            modal.classList.remove('active');
            modal.style.display = 'none';
            // Solo reactivar overflow si no hay otro modal activo
            const openModals = document.querySelectorAll('.modal-overlay.active, .modal-overlay[style*="display: flex"]');
            if (openModals.length === 0) {
                document.body.style.overflow = '';
            }
        }

        // Delegación global de eventos click
        document.addEventListener('click', function(e) {
            // Abrir Acerca de (sidebar o enlaces)
            const openAboutTrigger = e.target.closest('.open-about-btn, .open-about-modal');
            if (openAboutTrigger) {
                e.preventDefault();
                openModal(aboutModal);
                return;
            }

            // Cerrar Acerca de
            const closeAboutTrigger = e.target.closest('.close-about-modal-btn, #about-modal .modal-close');
            if (closeAboutTrigger) {
                e.preventDefault();
                closeModal(aboutModal);
                return;
            }

            // Abrir Términos
            const openTermsTrigger = e.target.closest('.open-terms-modal');
            if (openTermsTrigger) {
                e.preventDefault();
                openModal(termsModal);
                return;
            }

            // Cerrar Términos
            const closeTermsTrigger = e.target.closest('.close-terms-modal-btn, #terms-modal .modal-close');
            if (closeTermsTrigger) {
                e.preventDefault();
                closeModal(termsModal);
                return;
            }

            // Click fuera del contenedor del modal (en el overlay)
            if (e.target === aboutModal) {
                closeModal(aboutModal);
            }
            if (e.target === termsModal) {
                closeModal(termsModal);
            }
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (termsModal && termsModal.classList.contains('active')) {
                    closeModal(termsModal);
                } else if (aboutModal && aboutModal.classList.contains('active')) {
                    closeModal(aboutModal);
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAboutModals);
    } else {
        initAboutModals();
    }
})();
