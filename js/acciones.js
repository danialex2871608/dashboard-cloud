/* acciones.js — Acciones sobre una instancia, compartidas por la tabla y el detalle.
   - configurar: abre el Drawer con el formulario de parámetros.
   - reiniciar / eliminar: acciones críticas que exigen confirmación en un Modal. */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});

  function opcionesTipo(actual) {
    return CP.TIPOS.map(function (t) {
      return '<option value="' + t + '"' + (t === actual ? ' selected' : '') + '>' + t + '</option>';
    }).join('');
  }

  function formularioConfig(s) {
    return '' +
      '<form class="form" id="form-config" novalidate>' +
        '<fieldset class="form__section">' +
          '<div class="field">' +
            '<label for="cfg-nombre">Nombre de la instancia</label>' +
            '<input class="input mono" id="cfg-nombre" name="nombre" type="text" required maxlength="40" ' +
              'autocomplete="off" spellcheck="false" aria-describedby="cfg-nombre-ayuda cfg-nombre-error" ' +
              'value="' + CP.esc(s.nombre) + '" data-foco-inicial>' +
            '<span class="field__hint" id="cfg-nombre-ayuda">Minúsculas, números y guiones. Ej.: srv-web-01</span>' +
            '<span class="field__error" id="cfg-nombre-error" role="alert" hidden></span>' +
          '</div>' +
          '<div class="field">' +
            '<label for="cfg-desc">Descripción</label>' +
            '<textarea class="input" id="cfg-desc" name="descripcion" maxlength="160" rows="3">' + CP.esc(s.descripcion) + '</textarea>' +
          '</div>' +
          '<div class="field">' +
            '<label for="cfg-tipo">Tipo de instancia</label>' +
            '<div class="select"><select class="input" id="cfg-tipo" name="tipo">' + opcionesTipo(s.tipo) + '</select></div>' +
            '<span class="field__hint">Cambiar el tipo requiere un reinicio.</span>' +
          '</div>' +
          '<div class="field">' +
            '<label for="cfg-fecha">Próximo mantenimiento</label>' +
            '<input class="input" id="cfg-fecha" name="mantenimiento" type="date" min="2026-11-13" value="' + CP.esc(s.mantenimiento) + '">' +
          '</div>' +
          '<label class="switch">' +
            '<input type="checkbox" role="switch" name="autoescalado"' + (s.autoescalado ? ' checked' : '') + '>' +
            '<span class="switch__track"></span>' +
            '<span class="switch__text">Autoescalado<small>Agrega capacidad cuando sube la carga.</small></span>' +
          '</label>' +
          '<label class="switch">' +
            '<input type="checkbox" role="switch" name="respaldos"' + (s.respaldos ? ' checked' : '') + '>' +
            '<span class="switch__track"></span>' +
            '<span class="switch__text">Respaldos diarios<small>Copia automática a las 02:00.</small></span>' +
          '</label>' +
        '</fieldset>' +
      '</form>';
  }

  CP.acciones = {
    configurar: function (id) {
      const s = CP.store.obtener(id);
      if (!s) return;

      CP.overlay.drawer({
        titulo: 'Configurar ' + s.nombre,
        cuerpo: formularioConfig(s),
        pie:
          '<button class="btn btn--secondary" type="button" data-cerrar>Cancelar</button>' +
          '<button class="btn btn--primary" type="submit" form="form-config">Guardar cambios</button>',
        alMontar: function (panel, api) {
          const form = panel.querySelector('#form-config');
          const nombre = form.elements.nombre;
          const error = panel.querySelector('#cfg-nombre-error');
          const guardar = panel.querySelector('[type="submit"]');

          function validar() {
            const v = nombre.value.trim();
            let msg = '';
            if (!v) msg = 'Escribe un nombre para la instancia.';
            else if (!/^[a-z0-9-]{3,}$/.test(v)) msg = 'Usa al menos 3 caracteres: minúsculas, números y guiones.';
            else if (CP.store.servidores.some(function (o) { return o.id !== id && o.nombre === v; })) {
              msg = 'Ya existe una instancia con ese nombre.';
            }
            nombre.setAttribute('aria-invalid', msg ? 'true' : 'false');
            error.hidden = !msg;
            error.textContent = msg;
            return !msg;
          }

          nombre.addEventListener('input', function () {
            if (nombre.getAttribute('aria-invalid') === 'true') validar();
          });

          form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (guardar.disabled) return; // bloqueo de reenvío
            if (!validar()) { nombre.focus(); return; }

            const cambios = {
              nombre: nombre.value.trim(),
              descripcion: form.elements.descripcion.value.trim(),
              tipo: form.elements.tipo.value,
              mantenimiento: form.elements.mantenimiento.value,
              autoescalado: form.elements.autoescalado.checked,
              respaldos: form.elements.respaldos.checked
            };

            CP.cargando(guardar, true, 'Guardando…');
            api.bloquear(true);
            form.querySelector('fieldset').disabled = true;

            CP.espera(1300).then(function () {
              api.bloquear(false);
              api.cerrar();
              CP.store.actualizar(id, cambios);
              CP.toast('Cambios guardados en ' + cambios.nombre + '.');
            });
          });
        }
      });
    },

    reiniciar: function (id) {
      const s = CP.store.obtener(id);
      if (!s) return;
      CP.overlay.confirmar({
        titulo: '¿Reiniciar ' + s.nombre + '?',
        icono: 'restart',
        mensaje: 'La instancia dejará de responder durante <strong>1 minuto aproximadamente</strong> ' +
          'y se interrumpirán las conexiones activas.',
        confirmar: 'Sí, reiniciar',
        enCurso: 'Reiniciando…',
        accion: function () {
          return CP.espera(1500).then(function () {
            CP.store.reiniciar(id);
            CP.toast('Reinicio de ' + s.nombre + ' en curso.');
          });
        }
      });
    },

    eliminar: function (id, alTerminar) {
      const s = CP.store.obtener(id);
      if (!s) return;
      CP.overlay.confirmar({
        titulo: '¿Eliminar ' + s.nombre + '?',
        icono: 'trash',
        peligro: true,
        mensaje: '<strong>Esta acción no se puede deshacer.</strong> Se borrarán la instancia, sus discos y sus respaldos.',
        palabraClave: s.nombre,
        confirmar: 'Eliminar instancia',
        enCurso: 'Eliminando…',
        accion: function () {
          return CP.espera(1500).then(function () {
            CP.store.eliminar(id);
            CP.toast('Se eliminó ' + s.nombre + '.');
            if (alTerminar) alTerminar();
          });
        }
      });
    }
  };
})();
