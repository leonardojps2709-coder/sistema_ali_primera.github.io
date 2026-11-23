// src/utils/domHelper.js
/**
 * Reusable DOM helper utilities for the project.
 * Extracted from the original utils.js and render.js to avoid duplication.
 */

/**
 * Show a toast notification.
 * @param {string} message - Message to display.
 * @param {string} [type='success'] - Type: 'success', 'error', 'info', 'warning'.
 */
export function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.toast-notification').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  const iconClass =
    type === 'success' ? 'bx-check-circle' :
    type === 'error' ? 'bx-error-circle' :
    type === 'warning' ? 'bx-error' :
    'bx-info-circle';

  toast.innerHTML = `
    <i class='bx ${iconClass}'></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Show a customizable confirmation modal.
 * @param {Object} options - {title, message, confirmText, cancelText}
 * @param {Function} onConfirm - Callback when user confirms.
 */
export function showConfirm({title = 'Confirmar', message = '¿Está seguro?', confirmText = 'Aceptar', cancelText = 'Cancelar'}, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-modal">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-buttons">
        <button class="confirm-btn no" id="confirm-cancel">${cancelText}</button>
        <button class="confirm-btn yes" id="confirm-ok">${confirmText}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('active'), 10);

  const close = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };
  overlay.querySelector('#confirm-cancel').onclick = close;
  overlay.querySelector('#confirm-ok').onclick = () => {
    close();
    if (typeof onConfirm === 'function') onConfirm();
  };
  overlay.onclick = e => { if (e.target === overlay) close(); };
}

/**
 * Highlight a search term inside a text.
 * @param {string} text - Original text.
 * @param {string} query - Search term.
 * @returns {string} HTML with <mark> tags.
 */
export function highlightText(text, query) {
  if (!query || !text) return text || '';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  return String(text).replace(re, '<mark class="search-mark">$1</mark>');
}

/**
 * Get initials from a name.
 * @param {string} nombre
 * @param {string} apellido
 * @returns {string}
 */
export function getUserInitials(nombre, apellido) {
  const n = (nombre || '').charAt(0).toUpperCase();
  const a = (apellido || '').charAt(0).toUpperCase();
  return n + a;
}

// Export a namespace for backward compatibility (old global code expects functions on window)
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.showConfirm = showConfirm;
  window.highlightText = highlightText;
  window.getUserInitials = getUserInitials;
}
