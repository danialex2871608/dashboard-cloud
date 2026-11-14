/* toast.js — Mensajes breves de confirmación o error (feedback inmediato). */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});

  /**
   * @param {string} mensaje Texto corto y claro (1D: palabras).
   * @param {'exito'|'error'} [tipo]
   */
  CP.toast = function (mensaje, tipo) {
    const region = document.getElementById('toasts');
    const t = document.createElement('div');
    const clase = tipo === 'error' ? 'error' : 'exito';
    t.className = 'toast toast--' + clase;
    t.innerHTML = CP.icon(clase === 'error' ? 'alert' : 'check') + '<span>' + CP.esc(mensaje) + '</span>';
    region.appendChild(t);

    setTimeout(function () {
      t.classList.add('is-leaving');
      setTimeout(function () { t.remove(); }, 300);
    }, 4000);
  };
})();
