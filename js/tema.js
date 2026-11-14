/* tema.js — Modo oscuro: preferencia del sistema + conmutación manual.
   Preferencias posibles: "sistema" (sigue prefers-color-scheme), "claro", "oscuro". */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});
  const CLAVE = 'cp-tema';
  const raiz = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  function preferencia() {
    try {
      return localStorage.getItem(CLAVE) || 'sistema';
    } catch (e) {
      return raiz.dataset.theme === 'dark' ? 'oscuro' : raiz.dataset.theme === 'light' ? 'claro' : 'sistema';
    }
  }

  function efectivo() {
    const p = preferencia();
    return p === 'sistema' ? (mq.matches ? 'oscuro' : 'claro') : p;
  }

  function anunciar() {
    document.dispatchEvent(new CustomEvent('cp:tema', {
      detail: { preferencia: preferencia(), efectivo: efectivo() }
    }));
  }

  function aplicar(pref) {
    if (pref === 'sistema') {
      raiz.removeAttribute('data-theme');
    } else {
      raiz.setAttribute('data-theme', pref === 'oscuro' ? 'dark' : 'light');
    }
    try {
      if (pref === 'sistema') localStorage.removeItem(CLAVE);
      else localStorage.setItem(CLAVE, pref);
    } catch (e) { /* almacenamiento no disponible */ }
    anunciar();
  }

  // Si el sistema cambia de tema mientras la app está abierta, se actualiza el toggle.
  mq.addEventListener('change', anunciar);

  CP.tema = {
    preferencia: preferencia,
    efectivo: efectivo,
    aplicar: aplicar,
    alternar: function () {
      aplicar(efectivo() === 'oscuro' ? 'claro' : 'oscuro');
    }
  };
})();
