/* wire.js — Pantallas de baja fidelidad compartidas por los wireframes (index.html)
   y el prototipo navegable (prototipo.html). Los elementos con data-ir="pantalla"
   son las zonas interactivas (hotspots) del prototipo. */
(function () {
  'use strict';

  function lateral(activa, clase) {
    const enlaces = [['Resumen', 'resumen'], ['Servidores', 'servidores'], ['Alertas', ''], ['Configuración', '']];
    return '<div class="w-side ' + (clase || '') + '"><div class="w-logo">☁ CloudPanel</div>' +
      enlaces.map(function (e) {
        return '<div class="w-nav' + (e[0] === activa ? ' on' : '') + '"' + (e[1] ? ' data-ir="' + e[1] + '"' : '') + '>▢ ' + e[0] + '</div>';
      }).join('') + '</div>';
  }

  function base(activa, contenido, capas) {
    return '<div class="w-app">' + lateral(activa) +
      '<div class="w-col">' +
        '<div class="w-head"><span class="w-ico" data-ir="nav-' + activa.toLowerCase() + '">☰</span>' +
          '<span>Inicio / <b>' + activa + '</b></span><span class="w-sp"></span>' +
          '<span class="w-ico">◐</span><span class="w-ico">♪</span><span class="w-ava"></span></div>' +
        '<div class="w-main">' + contenido + '</div>' +
      '</div>' + (capas || '') + '</div>';
  }

  function resumen() {
    return '<div class="w-h1">Resumen</div>' +
      '<div class="w-bento">' +
        '<div class="w-box a-cpu"><div class="w-title">USO DE CPU</div><div class="w-num">47 %</div><div class="w-graf"></div></div>' +
        '<div class="w-box a-est"><div class="w-title">INSTANCIAS <span class="w-link" data-ir="servidores" style="float:right">Ver servidores →</span></div>' +
          '<div class="w-stats"><div>17<br>Activas</div><div>4<br>Alerta</div><div>3<br>Detenidas</div></div></div>' +
        '<div class="w-box"><div class="w-title">MEMORIA</div><div class="w-num">62 %</div><div class="w-line"></div></div>' +
        '<div class="w-box"><div class="w-title">DISCO</div><div class="w-num">71 %</div><div class="w-line"></div></div>' +
        '<div class="w-box a-red"><div class="w-title">TRÁFICO DE RED</div><div class="w-graf" style="min-height:34px"></div></div>' +
        '<div class="w-box a-ale"><div class="w-title">ALERTAS RECIENTES</div><div class="w-line" style="width:90%"></div><div class="w-line" style="width:70%"></div><div class="w-line" style="width:80%"></div></div>' +
        '<div class="w-box a-reg"><div class="w-title">CARGA POR REGIÓN</div><div class="w-line"></div><div class="w-line" style="width:60%"></div></div>' +
      '</div>';
  }

  function servidores(o) {
    o = o || {};
    const filas = [['srv-web-01', o.estado || 'Activo'], ['srv-api-01', 'Activo'], ['srv-db-01', 'En alerta'], ['srv-cache-01', 'En alerta'], ['srv-worker-01', 'Detenido'], ['srv-web-02', 'Activo']];
    return '<div class="w-h1">Servidores</div>' +
      '<div class="w-box" style="flex:1;min-height:0">' +
        '<div class="w-filtros"><div class="w-input">⌕ Buscar…</div><div class="w-input">Estado ▾</div><div class="w-input">Región ▾</div></div>' +
        filas.map(function (f, i) {
          return '<div class="w-row"><span>' + f[0] + '</span><span class="w-badge">' + f[1] + '</span>' +
            '<span class="w-opt"><div class="w-line"></div></span><span class="w-opt"><div class="w-line" style="width:60%"></div></span>' +
            '<span class="w-ico"' + (i === 0 ? ' data-ir="menu"' : '') + '>⋯</span>' +
            (i === 0 && o.menu
              ? '<div class="w-menu"><div data-ir="drawer">⚙ Configurar</div><div data-ir="modal">↻ Reiniciar</div><div>🗑 Eliminar…</div></div>'
              : '') +
          '</div>';
        }).join('') +
        '<div class="w-btns" style="margin-top:auto"><span style="margin-right:auto">1–6 de 24</span><span class="w-ico">‹</span><span class="w-ico">1</span><span class="w-ico">2</span><span class="w-ico">›</span></div>' +
      '</div>';
  }

  function campo(etiqueta, valor) {
    return '<div class="w-campo"><span class="w-title">' + etiqueta + '</span><div class="w-input">' + valor + '</div></div>';
  }

  const drawer =
    '<div class="w-scrim" data-ir="servidores"></div>' +
    '<div class="w-drawer"><div class="w-row" style="border:0"><span class="w-h1">Configurar srv-web-01</span><span class="w-ico" data-ir="servidores">✕</span></div>' +
      campo('NOMBRE', 'srv-web-01') + campo('DESCRIPCIÓN', 'Servidor web…') + campo('TIPO ▾', 't3.medium') + campo('MANTENIMIENTO 📅', '05/12/2026') +
      '<div class="w-switch">Autoescalado</div><div class="w-switch">Respaldos diarios</div>' +
      '<div class="w-btns" style="margin-top:auto"><div class="w-btn" data-ir="servidores">Cancelar</div><div class="w-btn w-btn--pri" data-ir="guardado">Guardar cambios</div></div>' +
    '</div>';

  function modal(cargando) {
    return '<div class="w-scrim"' + (cargando ? '' : ' data-ir="servidores"') + '></div>' +
      '<div class="w-modal"><div class="w-h1">⚠ ¿Reiniciar srv-web-01?</div>' +
        '<div>La instancia dejará de responder 1 minuto y se interrumpirán las conexiones activas.</div>' +
        '<div class="w-btns w-btns--col">' + (cargando
          ? '<div class="w-btn w-btn--off">Cancelar</div><div class="w-btn w-btn--off">◌ Reiniciando…</div>'
          : '<div class="w-btn" data-ir="servidores">Cancelar</div><div class="w-btn w-btn--pri" data-ir="cargando">Sí, reiniciar</div>') +
        '</div></div>';
  }

  function menuMovil(activa) {
    const destino = activa === 'Resumen' ? 'resumen' : 'servidores';
    return '<div class="w-scrim w-scrim--nav" data-ir="' + destino + '"></div>' + lateral(activa, 'w-side--over');
  }

  window.Wire = {
    pantallas: {
      'resumen': {
        titulo: 'Resumen (Bento Grid)',
        nota: 'Métricas en mosaicos. En móvil se apilan en una columna; en escritorio forman una cuadrícula de 4 columnas con el sidebar visible.',
        html: function () { return base('Resumen', resumen()); }
      },
      'nav-resumen': {
        titulo: 'Menú de navegación',
        nota: 'En móvil el sidebar es un panel off-canvas que se abre con ☰. El elemento activo responde a “¿Dónde estoy?”.',
        html: function () { return base('Resumen', resumen(), menuMovil('Resumen')); }
      },
      'nav-servidores': {
        titulo: 'Menú de navegación',
        nota: 'El menú está disponible desde cualquier vista: “¿A dónde puedo ir?”.',
        html: function () { return base('Servidores', servidores(), menuMovil('Servidores')); }
      },
      'servidores': {
        titulo: 'Servidores (tabla con filtros)',
        nota: 'Filtros arriba, registros al centro y paginación abajo. Cada fila tiene un menú ⋯ de acciones.',
        html: function () { return base('Servidores', servidores()); }
      },
      'menu': {
        titulo: 'Menú de acciones (dropdown)',
        nota: 'Las acciones destructivas van al final y separadas de las habituales.',
        html: function () { return base('Servidores', servidores({ menu: true })); }
      },
      'drawer': {
        titulo: 'Drawer de configuración',
        nota: 'Panel deslizante desde la derecha. No se pierde el contexto de la tabla, que queda visible detrás.',
        html: function () { return base('Servidores', servidores(), drawer); }
      },
      'guardado': {
        titulo: 'Confirmación (toast)',
        nota: 'El drawer se cierra y un mensaje breve confirma el resultado.',
        html: function () { return base('Servidores', servidores(), '<div class="w-toast" data-ir="servidores">✓ Cambios guardados</div>'); }
      },
      'modal': {
        titulo: 'Modal de confirmación',
        nota: 'Acción crítica: explica la consecuencia y ofrece “Cancelar” como salida segura. Esc también cierra.',
        html: function () { return base('Servidores', servidores(), modal(false)); }
      },
      'cargando': {
        titulo: 'Estado Loading',
        nota: 'El botón muestra un spinner y se bloquea para evitar un doble envío.',
        siguiente: 'reiniciado',
        html: function () { return base('Servidores', servidores(), modal(true)); }
      },
      'reiniciado': {
        titulo: 'Resultado de la acción',
        nota: 'La fila refleja el nuevo estado “Reiniciando” y un toast confirma la acción.',
        html: function () { return base('Servidores', servidores({ estado: '◌ Reiniciando' }), '<div class="w-toast" data-ir="servidores">✓ Reinicio en curso</div>'); }
      }
    },

    pintar: function (contenedor, id) {
      contenedor.innerHTML = this.pantallas[id].html();
    }
  };
})();
