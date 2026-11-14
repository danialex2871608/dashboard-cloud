/* vistas/servidores.js — Tabla de instancias con búsqueda, filtros y paginación. */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});
  CP.vistas = CP.vistas || {};

  const POR_PAGINA = 8;
  const filtros = { q: '', estado: '', region: '', pagina: 1 };
  let raiz = null;
  let cancelarStore = null;
  let esperaBusqueda = null;

  function filtrar() {
    const q = filtros.q.trim().toLowerCase();
    return CP.store.servidores.filter(function (s) {
      return (!q || s.nombre.toLowerCase().indexOf(q) >= 0 || s.ip.indexOf(q) >= 0) &&
        (!filtros.estado || s.estado === filtros.estado) &&
        (!filtros.region || s.region === filtros.region);
    });
  }

  function insignia(estado) {
    const e = CP.ESTADOS[estado];
    const tono = e.tono === 'neutral' ? '' : ' badge--' + e.tono;
    return '<span class="badge' + tono + (estado === 'reiniciando' ? ' badge--spin' : '') + '">' + e.etiqueta + '</span>';
  }
  CP.insignia = insignia;

  function medidor(v) {
    const tono = v >= 90 ? ' progress--danger' : v >= 80 ? ' progress--warn' : '';
    return '<div class="meter"><div class="progress' + tono + '"><span style="width:' + v + '%"></span></div>' +
      '<span>' + v + ' %</span></div>';
  }

  function menuAcciones(s, haciaArriba) {
    const ocupado = s.estado === 'reiniciando';
    const sinReinicio = ocupado || s.estado === 'detenido';
    return '<div class="dropdown' + (haciaArriba ? ' dropdown--up' : '') + '">' +
      '<button class="btn btn--icon btn--ghost" type="button" data-dropdown aria-haspopup="menu" aria-expanded="false" ' +
        'aria-label="Acciones para ' + CP.esc(s.nombre) + '">' + CP.icon('more') + '</button>' +
      '<div class="dropdown__menu" role="menu" hidden>' +
        '<button class="dropdown__item" type="button" role="menuitem" data-accion="configurar" data-id="' + s.id + '"' + (ocupado ? ' disabled' : '') + '>' +
          CP.icon('sliders', 18) + 'Configurar</button>' +
        '<button class="dropdown__item" type="button" role="menuitem" data-accion="reiniciar" data-id="' + s.id + '"' + (sinReinicio ? ' disabled' : '') + '>' +
          CP.icon('restart', 18) + 'Reiniciar</button>' +
        '<div class="dropdown__sep" role="separator"></div>' +
        '<button class="dropdown__item dropdown__item--danger" type="button" role="menuitem" data-accion="eliminar" data-id="' + s.id + '"' + (ocupado ? ' disabled' : '') + '>' +
          CP.icon('trash', 18) + 'Eliminar…</button>' +
      '</div></div>';
  }

  function fila(s, i, total) {
    return '<tr>' +
      '<td class="table__main" data-label="Nombre"><a href="#/servidores/' + s.id + '">' + CP.esc(s.nombre) + '</a>' +
        '<span class="mono muted">' + s.ip + '</span></td>' +
      '<td data-label="Estado">' + insignia(s.estado) + '</td>' +
      '<td data-label="Región">' + CP.REGIONES[s.region] + '</td>' +
      '<td data-label="Tipo" class="mono col-opt">' + s.tipo + '</td>' +
      '<td data-label="CPU">' + medidor(s.cpu) + '</td>' +
      '<td data-label="Memoria" class="col-opt">' + medidor(s.memoria) + '</td>' +
      '<td class="table__actions">' + menuAcciones(s, total > 4 && i >= total - 3) + '</td>' +
    '</tr>';
  }

  function pintarTabla() {
    if (!raiz) return;
    const lista = filtrar();
    const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    filtros.pagina = Math.min(filtros.pagina, paginas);
    const inicio = (filtros.pagina - 1) * POR_PAGINA;
    const visibles = lista.slice(inicio, inicio + POR_PAGINA);

    raiz.querySelector('[data-cuerpo]').innerHTML = visibles.map(function (s, i) {
      return fila(s, i, visibles.length);
    }).join('');
    raiz.querySelector('[data-tabla]').hidden = !lista.length;
    raiz.querySelector('[data-vacio]').hidden = Boolean(lista.length);

    let botones = '';
    for (let p = 1; p <= paginas; p++) {
      botones += '<button class="btn btn--icon btn--ghost" type="button" data-pagina="' + p + '"' +
        (p === filtros.pagina ? ' aria-current="page"' : '') + ' aria-label="Página ' + p + '">' + p + '</button>';
    }
    raiz.querySelector('[data-paginacion]').innerHTML =
      '<p role="status">' + (lista.length
        ? 'Mostrando <strong>' + (inicio + 1) + '–' + (inicio + visibles.length) + '</strong> de <strong>' + lista.length + '</strong> instancias'
        : 'Sin resultados') + '</p>' +
      '<div class="pagination__pages">' +
        '<button class="btn btn--icon btn--secondary" type="button" data-pagina="' + (filtros.pagina - 1) + '" aria-label="Página anterior"' +
          (filtros.pagina <= 1 ? ' disabled' : '') + '>' + CP.icon('chevronLeft') + '</button>' +
        botones +
        '<button class="btn btn--icon btn--secondary" type="button" data-pagina="' + (filtros.pagina + 1) + '" aria-label="Página siguiente"' +
          (filtros.pagina >= paginas ? ' disabled' : '') + '>' + CP.icon('chevronRight') + '</button>' +
      '</div>';

    raiz.querySelector('[data-limpiar]').disabled = !(filtros.q || filtros.estado || filtros.region);
  }

  function opciones(mapa, actual, etiqueta) {
    return '<option value="">' + etiqueta + '</option>' + Object.keys(mapa).map(function (k) {
      const texto = typeof mapa[k] === 'string' ? mapa[k] : mapa[k].etiqueta;
      return '<option value="' + k + '"' + (k === actual ? ' selected' : '') + '>' + texto + '</option>';
    }).join('');
  }

  CP.vistas.servidores = {
    render: function () {
      return '' +
      '<div class="page-head"><div>' +
        '<h1 tabindex="-1">Servidores</h1>' +
        '<p>Filtra tus instancias, ajusta su configuración o ejecuta acciones.</p>' +
      '</div></div>' +

      '<section class="card" aria-label="Listado de servidores">' +
        '<form class="toolbar" role="search" data-filtros>' +
          '<div class="field field--grow">' +
            '<label for="buscar">Buscar <span class="muted">(atajo <kbd class="kbd">/</kbd>)</span></label>' +
            '<div class="input-wrap" data-buscar>' +
              '<span class="input-wrap__icon">' + CP.icon('search', 18) + '</span>' +
              '<input class="input" id="buscar" type="search" placeholder="Nombre o dirección IP" autocomplete="off" value="' + CP.esc(filtros.q) + '">' +
              '<span class="spinner" aria-hidden="true"></span>' +
            '</div>' +
          '</div>' +
          '<div class="field"><label for="f-estado">Estado</label>' +
            '<div class="select"><select class="input" id="f-estado" data-filtro="estado">' + opciones(CP.ESTADOS, filtros.estado, 'Todos los estados') + '</select></div></div>' +
          '<div class="field"><label for="f-region">Región</label>' +
            '<div class="select"><select class="input" id="f-region" data-filtro="region">' + opciones(CP.REGIONES, filtros.region, 'Todas las regiones') + '</select></div></div>' +
          '<button class="btn btn--ghost" type="button" data-limpiar>Limpiar filtros</button>' +
        '</form>' +

        '<table class="table" data-tabla>' +
          '<caption class="visually-hidden">Instancias de servidores con su estado y consumo</caption>' +
          '<thead><tr>' +
            '<th scope="col">Nombre</th><th scope="col">Estado</th><th scope="col">Región</th>' +
            '<th scope="col" class="col-opt">Tipo</th><th scope="col">CPU</th><th scope="col" class="col-opt">Memoria</th>' +
            '<th scope="col"><span class="visually-hidden">Acciones</span></th>' +
          '</tr></thead>' +
          '<tbody data-cuerpo></tbody>' +
        '</table>' +

        '<div class="empty" data-vacio hidden>' +
          CP.icon('search', 32) +
          '<strong>No encontramos instancias</strong>' +
          '<p>Prueba con otro nombre o quita algún filtro.</p>' +
        '</div>' +

        '<footer class="pagination" data-paginacion></footer>' +
      '</section>';
    },

    mount: function (el) {
      raiz = el;
      const buscar = el.querySelector('#buscar');
      const envoltura = el.querySelector('[data-buscar]');

      // Búsqueda con espera (debounce) y estado Loading mientras "consulta".
      buscar.addEventListener('input', function () {
        clearTimeout(esperaBusqueda);
        envoltura.classList.add('is-loading');
        buscar.setAttribute('aria-busy', 'true');
        esperaBusqueda = setTimeout(function () {
          filtros.q = buscar.value;
          filtros.pagina = 1;
          pintarTabla();
          envoltura.classList.remove('is-loading');
          buscar.removeAttribute('aria-busy');
        }, 450);
      });

      el.querySelector('[data-filtros]').addEventListener('submit', function (e) { e.preventDefault(); });

      el.addEventListener('change', function (e) {
        const clave = e.target.dataset.filtro;
        if (!clave) return;
        filtros[clave] = e.target.value;
        filtros.pagina = 1;
        pintarTabla();
      });

      el.addEventListener('click', function (e) {
        const pagina = e.target.closest('[data-pagina]');
        if (pagina) {
          filtros.pagina = Number(pagina.dataset.pagina);
          pintarTabla();
          const actual = el.querySelector('[data-pagina][aria-current="page"]');
          if (actual) actual.focus();
          return;
        }
        if (e.target.closest('[data-limpiar]')) {
          filtros.q = filtros.estado = filtros.region = '';
          filtros.pagina = 1;
          buscar.value = '';
          el.querySelector('#f-estado').value = '';
          el.querySelector('#f-region').value = '';
          pintarTabla();
          buscar.focus();
          return;
        }
        const accion = e.target.closest('[data-accion]');
        if (accion) CP.acciones[accion.dataset.accion](accion.dataset.id);
      });

      cancelarStore = CP.store.alCambiar(pintarTabla);
      pintarTabla();
    },

    unmount: function () {
      clearTimeout(esperaBusqueda);
      if (cancelarStore) cancelarStore();
      raiz = null;
    }
  };
})();
