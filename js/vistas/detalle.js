/* vistas/detalle.js — Detalle de una instancia (tercer nivel de navegación). */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});
  CP.vistas = CP.vistas || {};

  let cancelarStore = null;

  /* Historial simulado y estable: depende sólo del nombre de la instancia. */
  function historial(s) {
    if (s.estado === 'detenido' || s.estado === 'reiniciando') return new Array(24).fill(0);
    let semilla = 0;
    for (let i = 0; i < s.id.length; i++) semilla = (semilla * 31 + s.id.charCodeAt(i)) | 0;
    const azar = CP.crearAzar(semilla);
    const lista = [];
    for (let i = 0; i < 24; i++) lista.push(Math.max(3, Math.min(100, s.cpu + (azar() - 0.5) * 30)));
    lista[23] = s.cpu;
    return lista;
  }

  function fecha(iso) {
    if (!iso) return 'Sin programar';
    const p = iso.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]))
      .toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  CP.vistas.detalle = {
    render: function (id) {
      const s = CP.store.obtener(id);
      // ¿De dónde vengo?: el enlace de regreso nombra la vista anterior.
      const previa = CP.router.anterior;
      const origen = previa && previa.hash.indexOf('#/servidores/') !== 0
        ? previa : { hash: '#/servidores', titulo: 'Servidores' };
      const volver = '<a class="back-link" href="' + origen.hash + '">' + CP.icon('arrowLeft', 18) +
        'Volver a ' + CP.esc(origen.titulo) + '</a>';

      if (!s) {
        return volver + '<div class="card empty">' + CP.icon('server', 32) +
          '<h1 tabindex="-1">No encontramos esa instancia</h1>' +
          '<p>Puede que haya sido eliminada o que el enlace sea incorrecto.</p>' +
          '<a class="btn btn--primary" href="#/servidores">Ver todos los servidores</a></div>';
      }

      const ocupado = s.estado === 'reiniciando';
      const h = historial(s);
      return volver +
      '<div class="page-head"><div>' +
        '<h1 tabindex="-1" class="mono">' + CP.esc(s.nombre) + '</h1>' +
        '<p>' + CP.insignia(s.estado) + ' &nbsp;' + CP.esc(s.descripcion) + '</p>' +
      '</div>' +
      '<div class="btn-group">' +
        '<button class="btn btn--secondary" type="button" data-accion="configurar"' + (ocupado ? ' disabled' : '') + '>' + CP.icon('sliders', 18) + 'Configurar</button>' +
        '<button class="btn btn--secondary" type="button" data-accion="reiniciar"' + (ocupado || s.estado === 'detenido' ? ' disabled' : '') + '>' + CP.icon('restart', 18) + 'Reiniciar</button>' +
        '<button class="btn btn--danger" type="button" data-accion="eliminar"' + (ocupado ? ' disabled' : '') + '>' + CP.icon('trash', 18) + 'Eliminar…</button>' +
      '</div></div>' +

      '<div class="two-col">' +
        '<section class="card" aria-labelledby="d-cpu">' +
          '<div class="card__head"><h2 id="d-cpu">Uso de CPU · últimas 24 h</h2><strong class="num">' + s.cpu + ' % ahora</strong></div>' +
          '<div class="card__body">' +
            '<div class="chart" style="min-height:200px">' +
              '<div class="chart__y" aria-hidden="true"><span>100%</span><span>50%</span><span>0%</span></div>' +
              CP.grafica.lineas([{ valores: h }], { max: 100, rejilla: true, descripcion: 'Uso de CPU de las últimas 24 horas. Valor actual ' + s.cpu + ' por ciento.' }) +
            '</div>' +
            '<div class="bars">' +
              '<div class="bars__row"><span>Memoria</span><span class="num">' + s.memoria + ' %</span><div class="progress"><span style="width:' + s.memoria + '%"></span></div></div>' +
              '<div class="bars__row"><span>Disco</span><span class="num">' + s.disco + ' %</span><div class="progress"><span style="width:' + s.disco + '%"></span></div></div>' +
            '</div>' +
          '</div>' +
        '</section>' +

        '<section class="card" aria-labelledby="d-datos">' +
          '<div class="card__head"><h2 id="d-datos">Datos de la instancia</h2></div>' +
          '<div class="card__body"><dl class="dl">' +
            '<div><dt>Dirección IP</dt><dd class="mono">' + s.ip + '</dd></div>' +
            '<div><dt>Región</dt><dd>' + CP.REGIONES[s.region] + ' <span class="muted mono">' + s.region + '</span></dd></div>' +
            '<div><dt>Tipo</dt><dd class="mono">' + s.tipo + '</dd></div>' +
            '<div><dt>Tiempo activo</dt><dd>' + s.diasActivo + ' días</dd></div>' +
            '<div><dt>Autoescalado</dt><dd>' + (s.autoescalado ? 'Activado' : 'Desactivado') + '</dd></div>' +
            '<div><dt>Respaldos diarios</dt><dd>' + (s.respaldos ? 'Activados' : 'Desactivados') + '</dd></div>' +
            '<div><dt>Próximo mantenimiento</dt><dd>' + fecha(s.mantenimiento) + '</dd></div>' +
          '</dl></div>' +
        '</section>' +
      '</div>';
    },

    mount: function (el, id) {
      el.addEventListener('click', alHacerClic);
      el.dataset.id = id;
      // Si la instancia cambia (guardar, reiniciar), se vuelve a pintar la vista.
      cancelarStore = CP.store.alCambiar(function () {
        if (CP.store.obtener(id)) CP.router.refrescar();
      });
    },

    unmount: function () {
      if (cancelarStore) cancelarStore();
      const el = document.getElementById('vista');
      el.removeEventListener('click', alHacerClic);
    }
  };

  function alHacerClic(e) {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const id = e.currentTarget.dataset.id;
    if (boton.dataset.accion === 'eliminar') {
      CP.acciones.eliminar(id, function () { location.hash = '#/servidores'; });
    } else {
      CP.acciones[boton.dataset.accion](id);
    }
  }
})();
