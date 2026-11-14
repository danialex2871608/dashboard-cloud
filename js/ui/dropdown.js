/* dropdown.js — Menú desplegable accesible (patrón "menu button").
   Teclado: Enter/Espacio abre, flechas mueven el foco, Escape cierra. */
(function () {
  'use strict';

  function menuDe(boton) {
    return boton.parentElement.querySelector('.dropdown__menu');
  }

  function cerrarTodos(devolverFoco) {
    document.querySelectorAll('[data-dropdown][aria-expanded="true"]').forEach(function (boton) {
      boton.setAttribute('aria-expanded', 'false');
      menuDe(boton).hidden = true;
      if (devolverFoco) boton.focus();
    });
  }

  function opciones(menu) {
    return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]:not(:disabled)'));
  }

  document.addEventListener('click', function (e) {
    const boton = e.target.closest('[data-dropdown]');
    if (boton) {
      const estabaAbierto = boton.getAttribute('aria-expanded') === 'true';
      cerrarTodos(false);
      if (!estabaAbierto) {
        boton.setAttribute('aria-expanded', 'true');
        const menu = menuDe(boton);
        menu.hidden = false;
        const lista = opciones(menu);
        if (lista.length) lista[0].focus();
      }
      return;
    }
    // Clic fuera del menú o sobre una opción: se cierra.
    if (!e.target.closest('.dropdown__menu') || e.target.closest('[role="menuitem"]')) {
      cerrarTodos(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    const abierto = document.querySelector('[data-dropdown][aria-expanded="true"]');
    if (!abierto) return;
    const lista = opciones(menuDe(abierto));
    const i = lista.indexOf(document.activeElement);

    if (e.key === 'Escape') {
      e.preventDefault();
      cerrarTodos(true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      lista[(i + 1) % lista.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      lista[(i - 1 + lista.length) % lista.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      lista[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      lista[lista.length - 1].focus();
    } else if (e.key === 'Tab') {
      cerrarTodos(false);
    }
  });
})();
