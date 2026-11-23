// navigation.js (versión corregida para profesores)
// Manejo de la interfaz: sidebar, menús desplegables, navegación entre secciones

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');
    const dropdowns = document.querySelectorAll('.menu-dropdown');
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('[data-section]');

    // Toggle sidebar (minimizar/expandir)
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('minimize');
            dropdowns.forEach(d => d.classList.remove('sub-menu-toggle'));
        });
    }

    // Manejo de dropdowns (submenús)
    dropdowns.forEach(drop => {
        const trigger = drop.querySelector('.menu-link');
        if (!trigger) return;
        trigger.addEventListener('click', (e) => {
            if (sidebar.classList.contains('minimize')) return;
            // Solo evitar navegación si el enlace no tiene data-section
            const hasSection = trigger.hasAttribute('data-section');
            if (!hasSection) e.preventDefault();

            const isOpen = drop.classList.contains('sub-menu-toggle');
            dropdowns.forEach(d => d.classList.remove('sub-menu-toggle'));
            if (!isOpen) drop.classList.add('sub-menu-toggle');
        });
    });

    // Navegación entre secciones
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            if (!sectionId) return;

            // Mostrar la sección correspondiente
            sections.forEach(sec => sec.classList.remove('active'));
            const targetSection = document.getElementById(`${sectionId}-section`);
            if (targetSection) targetSection.classList.add('active');

            // Limpiar clases activas de todos los elementos del menú
            document.querySelectorAll('.menu-item, .sub-menu-link').forEach(el => el.classList.remove('active'));

            // Activar el enlace del submenú (si es un submenú)
            if (link.classList.contains('sub-menu-link')) {
                link.classList.add('active');
            }

            // Activar el elemento padre (el <li> contenedor del menú)
            const parentItem = link.closest('.menu-item');
            if (parentItem) {
                parentItem.classList.add('active');
                // Si el padre es un dropdown, abrirlo automáticamente
                if (parentItem.classList.contains('menu-dropdown')) {
                    parentItem.classList.add('sub-menu-toggle');
                }
                // También marcar el menú principal si está dentro de un dropdown
                const grandParent = parentItem.closest('.menu-dropdown');
                if (grandParent) {
                    grandParent.classList.add('active', 'sub-menu-toggle');
                }
            }

            // Si el enlace es el del menú principal (Inicio, etc.), también se activa
            if (link.classList.contains('menu-link')) {
                link.closest('.menu-item')?.classList.add('active');
            }
        });
    });
});

// Manejo del cierre de sesión
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showConfirm({title: 'Cerrar sesión', message: '¿Estás seguro que deseas cerrar sesión?'}, () => {
            window.location.href = '../login/bienvenida.html';
        });
    });
}