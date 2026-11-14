/* vistas/configuracion.js — Formulario con todos los controles de entrada:
   texto, área de texto, selector de fecha (datepicker), hora, switches y dropdowns. */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});
  CP.vistas = CP.vistas || {};

  // Ajustes en memoria (se pierden al recargar: los datos son simulados).
  CP.ajustes = Object.assign({
    proyecto: 'Plataforma Cloud',
    correo: 'devops@empresa.com',
    notas: '',
    region: 'us-east-1',
    intervalo: 2000,
    fecha: '2026-12-05',
    hora: '02:00',
    alertasCorreo: true,
    mantenimiento: false
  }, CP.ajustes);

  let alCambiarTema = null;

  function opcion(valor, texto, actual) {
    return '<option value="' + valor + '"' + (String(valor) === String(actual) ? ' selected' : '') + '>' + texto + '</option>';
  }

  function radioTema(valor, texto, icono) {
    return '<label><input type="radio" name="tema" value="' + valor + '"' +
      (CP.tema.preferencia() === valor ? ' checked' : '') + '>' + (icono ? CP.icon(icono, 16) : '') + texto + '</label>';
  }

  CP.vistas.configuracion = {
    render: function () {
      const a = CP.ajustes;
      return '' +
      '<div class="page-head"><div>' +
        '<h1 tabindex="-1">Configuración</h1>' +
        '<p>Preferencias generales del panel y de las notificaciones.</p>' +
      '</div></div>' +

      '<div class="two-col">' +
      '<section class="card" aria-labelledby="c-general">' +
        '<div class="card__head"><h2 id="c-general">Proyecto y notificaciones</h2></div>' +
        '<form class="card__body" id="form-ajustes" novalidate>' +
          '<div class="form__row">' +
            '<div class="field">' +
              '<label for="a-proyecto">Nombre del proyecto</label>' +
              '<input class="input" id="a-proyecto" name="proyecto" type="text" required maxlength="50" value="' + CP.esc(a.proyecto) + '" aria-describedby="a-proyecto-error">' +
              '<span class="field__error" id="a-proyecto-error" role="alert" hidden></span>' +
            '</div>' +
            '<div class="field">' +
              '<label for="a-correo">Correo para alertas</label>' +
              '<input class="input" id="a-correo" name="correo" type="email" required autocomplete="email" value="' + CP.esc(a.correo) + '" aria-describedby="a-correo-error">' +
              '<span class="field__error" id="a-correo-error" role="alert" hidden></span>' +
            '</div>' +
          '</div>' +

          '<div class="field">' +
            '<label for="a-notas">Notas para el equipo <span class="muted">(opcional)</span></label>' +
            '<textarea class="input" id="a-notas" name="notas" maxlength="200" rows="3" placeholder="Ej.: avisar a soporte antes de reiniciar bases de datos" aria-describedby="a-notas-ayuda">' + CP.esc(a.notas) + '</textarea>' +
            '<span class="field__hint" id="a-notas-ayuda">Máximo 200 caracteres.</span>' +
          '</div>' +

          '<div class="form__row">' +
            '<div class="field">' +
              '<label for="a-region">Región por defecto</label>' +
              '<div class="select"><select class="input" id="a-region" name="region">' +
                Object.keys(CP.REGIONES).map(function (k) { return opcion(k, CP.REGIONES[k] + ' (' + k + ')', a.region); }).join('') +
              '</select></div>' +
            '</div>' +
            '<div class="field">' +
              '<label for="a-intervalo">Actualizar métricas cada</label>' +
              '<div class="select"><select class="input" id="a-intervalo" name="intervalo">' +
                opcion(2000, '2 segundos', a.intervalo) + opcion(5000, '5 segundos', a.intervalo) + opcion(30000, '30 segundos', a.intervalo) +
              '</select></div>' +
            '</div>' +
          '</div>' +

          '<div class="form__row">' +
            '<div class="field">' +
              '<label for="a-fecha">Ventana de mantenimiento</label>' +
              '<input class="input" id="a-fecha" name="fecha" type="date" min="2026-11-13" value="' + a.fecha + '">' +
            '</div>' +
            '<div class="field">' +
              '<label for="a-hora">Hora de inicio</label>' +
              '<input class="input" id="a-hora" name="hora" type="time" value="' + a.hora + '">' +
            '</div>' +
          '</div>' +

          '<label class="switch">' +
            '<input type="checkbox" role="switch" name="alertasCorreo"' + (a.alertasCorreo ? ' checked' : '') + '>' +
            '<span class="switch__track"></span>' +
            '<span class="switch__text">Enviar alertas por correo<small>Sólo alertas críticas y advertencias.</small></span>' +
          '</label>' +

          '<label class="switch" data-switch-mantenimiento>' +
            '<input type="checkbox" role="switch" name="mantenimiento"' + (a.mantenimiento ? ' checked' : '') + '>' +
            '<span class="switch__track"></span>' +
            '<span class="switch__text">Modo mantenimiento<small>Se aplica al instante y pausa las alertas.</small></span>' +
          '</label>' +

          '<div class="btn-group">' +
            '<button class="btn btn--primary" type="submit">Guardar cambios</button>' +
            '<button class="btn btn--secondary" type="reset" disabled>Descartar</button>' +
          '</div>' +
        '</form>' +
      '</section>' +

      '<div class="form">' +
        '<section class="card" aria-labelledby="c-tema">' +
          '<div class="card__head"><h2 id="c-tema">Apariencia</h2></div>' +
          '<div class="card__body">' +
            '<div class="field"><span class="field__label" id="tema-etiqueta">Tema de color</span>' +
              '<div class="segmented" role="radiogroup" aria-labelledby="tema-etiqueta" data-tema>' +
                radioTema('sistema', 'Sistema') + radioTema('claro', 'Claro', 'sun') + radioTema('oscuro', 'Oscuro', 'moon') +
              '</div>' +
              '<span class="field__hint">“Sistema” sigue la preferencia de tu dispositivo.</span>' +
            '</div>' +
          '</div>' +
        '</section>' +
        '<section class="card" aria-labelledby="c-atajos">' +
          '<div class="card__head"><h2 id="c-atajos">Atajos de teclado</h2></div>' +
          '<div class="card__body"><dl class="dl">' +
            '<div><dt>Cerrar modal, panel o menú</dt><dd><kbd class="kbd">Esc</kbd></dd></div>' +
            '<div><dt>Buscar un servidor</dt><dd><kbd class="kbd">/</kbd></dd></div>' +
            '<div><dt>Moverse entre controles</dt><dd><kbd class="kbd">Tab</kbd></dd></div>' +
            '<div><dt>Recorrer un menú</dt><dd><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd></dd></div>' +
          '</dl></div>' +
        '</section>' +
      '</div>' +
      '</div>';
    },

    mount: function (el) {
      const form = el.querySelector('#form-ajustes');
      const guardar = form.querySelector('[type="submit"]');
      const descartar = form.querySelector('[type="reset"]');

      function error(campo, mensaje) {
        const caja = el.querySelector('#' + campo.id + '-error');
        campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
        caja.hidden = !mensaje;
        caja.innerHTML = mensaje ? CP.icon('alert', 16) + CP.esc(mensaje) : '';
        return !mensaje;
      }

      function validar() {
        const p = form.elements.proyecto, c = form.elements.correo;
        const okP = error(p, p.value.trim() ? '' : 'Escribe un nombre para el proyecto.');
        const okC = error(c, !c.value.trim() ? 'Escribe un correo para recibir las alertas.'
          : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value.trim()) ? '' : 'Revisa el correo. Debe verse así: equipo@empresa.com');
        if (!okP) p.focus(); else if (!okC) c.focus();
        return okP && okC;
      }

      form.addEventListener('input', function (e) {
        descartar.disabled = false;
        if (e.target.getAttribute('aria-invalid') === 'true') validar();
      });

      form.addEventListener('reset', function () {
        setTimeout(function () {
          descartar.disabled = true;
          error(form.elements.proyecto, '');
          error(form.elements.correo, '');
        }, 0);
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (guardar.disabled || !validar()) return;
        CP.cargando(guardar, true, 'Guardando…');
        descartar.disabled = true;
        CP.espera(1300).then(function () {
          const f = form.elements;
          Object.assign(CP.ajustes, {
            proyecto: f.proyecto.value.trim(), correo: f.correo.value.trim(), notas: f.notas.value.trim(),
            region: f.region.value, intervalo: Number(f.intervalo.value), fecha: f.fecha.value, hora: f.hora.value,
            alertasCorreo: f.alertasCorreo.checked
          });
          // Los valores guardados pasan a ser los valores "por defecto" del formulario.
          Array.prototype.forEach.call(f, function (c) {
            if (c.type === 'checkbox') c.defaultChecked = c.checked;
            else if (c.tagName === 'SELECT') Array.prototype.forEach.call(c.options, function (o) { o.defaultSelected = o.selected; });
            else if ('defaultValue' in c) c.defaultValue = c.value;
          });
          CP.cargando(guardar, false);
          CP.toast('Configuración guardada.');
        });
      });

      // Switch con efecto inmediato: muestra Loading y se bloquea hasta terminar.
      const sw = el.querySelector('[data-switch-mantenimiento]');
      const swInput = sw.querySelector('input');
      swInput.addEventListener('change', function (e) {
        e.stopPropagation();
        sw.classList.add('is-loading');
        swInput.disabled = true;
        swInput.setAttribute('aria-busy', 'true');
        CP.espera(1200).then(function () {
          sw.classList.remove('is-loading');
          swInput.disabled = false;
          swInput.removeAttribute('aria-busy');
          swInput.defaultChecked = swInput.checked;
          CP.ajustes.mantenimiento = swInput.checked;
          CP.toast(swInput.checked ? 'Modo mantenimiento activado.' : 'Modo mantenimiento desactivado.');
        });
      });
      swInput.addEventListener('input', function (e) { e.stopPropagation(); });

      // Selector de tema (conmutación manual del modo oscuro).
      const grupo = el.querySelector('[data-tema]');
      grupo.addEventListener('change', function (e) { CP.tema.aplicar(e.target.value); });
      alCambiarTema = function (e) {
        const radio = grupo.querySelector('[value="' + e.detail.preferencia + '"]');
        if (radio) radio.checked = true;
      };
      document.addEventListener('cp:tema', alCambiarTema);
    },

    unmount: function () {
      document.removeEventListener('cp:tema', alCambiarTema);
    }
  };
})();
