/* overlay.js — ZONA 3: base común del Drawer y la Ventana Modal.
   Reglas de comportamiento (5D):
     - Escape o clic en el fondo cierran el panel.
     - El foco queda atrapado dentro del panel y vuelve al origen al cerrar.
     - Mientras hay una operación en curso (Loading) no se puede cerrar. */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});

  const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let actual = null;
  let serie = 0;

  /** Pone o quita el estado Loading de un botón y bloquea el reenvío. */
  CP.cargando = function (boton, activo, texto) {
    if (activo) {
      boton.dataset.original = boton.innerHTML;
      boton.classList.add('is-loading');
      boton.disabled = true;
      boton.setAttribute('aria-busy', 'true');
      boton.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>' + CP.esc(texto || 'Procesando…') + '</span>';
    } else {
      boton.classList.remove('is-loading');
      boton.disabled = false;
      boton.removeAttribute('aria-busy');
      if (boton.dataset.original) boton.innerHTML = boton.dataset.original;
    }
  };

  /**
   * Abre un panel superpuesto.
   * @param {{tipo:'modal'|'drawer', titulo:string, icono?:string, cuerpo:string,
   *          pie?:string, rol?:string, alMontar?:Function}} o
   */
  function abrir(o) {
    if (actual) actual.cerrar(true);

    // Si se abrió desde un menú desplegable, el foco vuelve al botón del menú.
    let origen = document.activeElement;
    const menu = origen && origen.closest ? origen.closest('.dropdown') : null;
    if (menu) origen = menu.querySelector('[data-dropdown]');

    const app = document.getElementById('app');
    const idTitulo = 'ov-titulo-' + (++serie);
    const raiz = document.createElement('div');
    raiz.className = 'overlay overlay--' + o.tipo;
    raiz.innerHTML =
      '<div class="overlay__backdrop" data-cerrar></div>' +
      '<section class="' + o.tipo + '" role="' + (o.rol || 'dialog') + '" aria-modal="true" ' +
        'aria-labelledby="' + idTitulo + '" tabindex="-1">' +
        '<header class="' + o.tipo + '__header">' +
          '<h2 id="' + idTitulo + '">' + (o.icono || '') + '<span>' + CP.esc(o.titulo) + '</span></h2>' +
          '<button class="btn btn--icon btn--ghost" type="button" data-cerrar aria-label="Cerrar">' + CP.icon('close') + '</button>' +
        '</header>' +
        '<div class="' + o.tipo + '__body">' + o.cuerpo + '</div>' +
        (o.pie ? '<footer class="' + o.tipo + '__footer">' + o.pie + '</footer>' : '') +
      '</section>';
    document.body.appendChild(raiz);

    const panel = raiz.querySelector('section');
    let bloqueado = false;

    function alTeclear(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        api.cerrar();
        return;
      }
      if (e.key !== 'Tab') return;
      // Trampa de foco: Tab circula sólo por los controles del panel.
      const lista = Array.prototype.filter.call(panel.querySelectorAll(ENFOCABLES), function (el) {
        return el.offsetParent !== null;
      });
      if (!lista.length) { e.preventDefault(); return; }
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      const activo = document.activeElement;
      if (e.shiftKey && (activo === primero || activo === panel)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    const api = {
      raiz: raiz,
      panel: panel,
      bloquear: function (valor) {
        bloqueado = valor;
        raiz.classList.toggle('is-busy', valor);
        raiz.querySelectorAll('[data-cerrar]').forEach(function (b) {
          if (b.tagName === 'BUTTON') b.disabled = valor;
        });
      },
      cerrar: function (forzar) {
        if (bloqueado && !forzar) return;
        if (actual !== api) return;
        actual = null;
        document.removeEventListener('keydown', alTeclear);
        raiz.classList.remove('is-open');
        app.inert = false;
        setTimeout(function () { raiz.remove(); }, 350); // espera la animación de cierre
        if (origen && document.contains(origen) && origen.offsetParent !== null) origen.focus();
        else document.getElementById('contenido').focus();
      }
    };

    document.addEventListener('keydown', alTeclear);
    raiz.addEventListener('click', function (e) {
      if (e.target.closest('[data-cerrar]')) api.cerrar();
    });

    app.inert = true; // el resto de la página deja de ser interactivo
    actual = api;
    if (o.alMontar) o.alMontar(panel, api);

    void raiz.offsetWidth; // fuerza un reflow para que la transición de entrada se anime
    raiz.classList.add('is-open');
    (panel.querySelector('[data-foco-inicial]') || panel).focus();
    return api;
  }

  CP.overlay = {
    abierto: function () { return Boolean(actual); },

    /** Drawer: panel deslizante lateral para configurar parámetros. */
    drawer: function (o) {
      return abrir(Object.assign({ tipo: 'drawer' }, o));
    },

    /**
     * Modal de confirmación para acciones críticas.
     * Si se indica `palabraClave`, el botón de confirmar permanece deshabilitado
     * hasta que la persona la escribe (protección ante acciones destructivas).
     */
    confirmar: function (o) {
      const peligro = Boolean(o.peligro);
      const cuerpo = '<p>' + o.mensaje + '</p>' + (o.palabraClave
        ? '<div class="field"><label for="ov-clave">Escribe <strong class="mono">' + CP.esc(o.palabraClave) +
          '</strong> para confirmar</label><input class="input mono" id="ov-clave" type="text" autocomplete="off" ' +
          'autocapitalize="off" spellcheck="false"></div>'
        : '');
      const pie =
        '<button class="btn btn--secondary" type="button" data-cerrar data-foco-inicial>Cancelar</button>' +
        '<button class="btn ' + (peligro ? 'btn--danger' : 'btn--primary') + '" type="button" data-confirmar' +
          (o.palabraClave ? ' disabled' : '') + '>' + CP.esc(o.confirmar) + '</button>';

      return abrir({
        tipo: 'modal',
        rol: 'alertdialog',
        titulo: o.titulo,
        icono: '<span class="modal__icon' + (peligro ? ' modal__icon--danger' : '') + '">' +
          CP.icon(o.icono || 'alert', 22) + '</span>',
        cuerpo: cuerpo,
        pie: pie,
        alMontar: function (panel, api) {
          const btn = panel.querySelector('[data-confirmar]');
          const clave = panel.querySelector('#ov-clave');
          if (clave) {
            clave.addEventListener('input', function () {
              btn.disabled = clave.value.trim() !== o.palabraClave;
            });
          }
          btn.addEventListener('click', function () {
            CP.cargando(btn, true, o.enCurso || 'Procesando…');
            api.bloquear(true);
            if (clave) clave.disabled = true;
            Promise.resolve(o.accion()).then(function () {
              api.bloquear(false);
              api.cerrar();
            });
          });
        }
      });
    }
  };
})();
