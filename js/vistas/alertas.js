/* vistas/alertas.js — Historial de alertas con filtro por severidad. */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});
  CP.vistas = CP.vistas || {};

  let severidad = '';

  function lista() {
    const visibles = CP.store.alertas.filter(function (a) { return !severidad || a.severidad === severidad; });
    return visibles.map(CP.alertaHTML).join('');
  }

  function chip(valor, texto) {
    const n = CP.store.alertas.filter(function (a) { return !valor || a.severidad === valor; }).length;
    return '<button class="chip" type="button" data-severidad="' + valor + '" aria-pressed="' + (valor === severidad) + '">' +
      texto + ' (' + n + ')</button>';
  }

  CP.vistas.alertas = {
    render: function () {
      return '' +
      '<div class="page-head"><div>' +
        '<h1 tabindex="-1">Alertas</h1>' +
        '<p>Eventos recientes de tus instancias, del más nuevo al más antiguo.</p>' +
      '</div></div>' +
      '<section class="card" aria-label="Listado de alertas">' +
        '<div class="toolbar"><div class="chips" role="group" aria-label="Filtrar por severidad">' +
          chip('', 'Todas') + chip('critica', 'Críticas') + chip('advertencia', 'Advertencias') + chip('info', 'Informativas') +
        '</div></div>' +
        '<div class="card__body"><ul class="alert-list" data-lista aria-live="polite">' + lista() + '</ul></div>' +
      '</section>';
    },

    mount: function (el) {
      el.querySelector('.chips').addEventListener('click', function (e) {
        const boton = e.target.closest('[data-severidad]');
        if (!boton) return;
        severidad = boton.dataset.severidad;
        el.querySelectorAll('[data-severidad]').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === boton));
        });
        el.querySelector('[data-lista]').innerHTML = lista();
      });
    }
  };
})();
