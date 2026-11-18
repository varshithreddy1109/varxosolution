/* =================================================================
   js/projects.js
   Project modal data and helpers.
   All project content is defined here — edit this file to update
   project details, technologies, descriptions, etc.
   ================================================================= */

(function () {
  'use strict';

  /* ── Project modal open/close ── */
  window.openModal = function (id) {
    var overlay = document.getElementById('modal-' + id);
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var closeBtn = overlay.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    }, 100);
  };

  window.closeModal = function (id) {
    var overlay = document.getElementById('modal-' + id);
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.addEventListener('DOMContentLoaded', function () {
    /* Close on overlay background click */
    document.querySelectorAll('.project-modal-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          overlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.project-modal-overlay.open').forEach(function (overlay) {
          overlay.classList.remove('open');
          document.body.style.overflow = '';
        });
      }
    });
  });

})();
