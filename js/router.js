/* router.js — Enrutador de la SPA basado en el hash de la URL.
   Mantiene la Zona 1 sincronizada con la vista actual:
     ¿Dónde estoy?      -> enlace activo (aria-current) y última miga de pan.
     ¿De dónde vengo?   -> migas de pan y CP.router.anterior (enlace "Volver a…").
     ¿A dónde puedo ir? -> menú lateral siempre disponible. */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});

  const SECCIONES = {
    resumen: 'Resumen',
    servidores: 'Servidores',
    alertas: 'Alertas',
    configuracion: 'Configuración'
  };

  let vistaActual = null;
  let primeraCarga = true;

  function pintarMigas(migas) {
    document.getElementById('migas').innerHTML = migas.map(function (m, i) {
      const ultima = i === migas.length - 1;
      return '<li>' + (ultima
        ? '<span aria-current="page">' + CP.esc(m.texto) + '</span>'
        : '<a href="' + m.hash + '">' + CP.esc(m.texto) + '</a>') + '</li>';
    }).join('');
  }

  function navegar(refresco) {
    const ruta = location.hash.replace(/^#\/?/, '');
    const partes = ruta.split('/').map(decodeURIComponent);
    const seccion = partes[0] || 'resumen';
    const parametro = partes[1];

    if (!SECCIONES[seccion]) {
      location.replace('#/resumen');
      return;
    }

    let vista = CP.vistas[seccion];
    let titulo = SECCIONES[seccion];
    const migas = [{ texto: 'Inicio', hash: '#/resumen' }, { texto: titulo, hash: '#/' + seccion }];

    if (seccion === 'servidores' && parametro) {
      vista = CP.vistas.detalle;
      const s = CP.store.obtener(parametro);
      titulo = s ? s.nombre : 'No encontrada';
      migas.push({ texto: titulo });
    }

    const hash = '#/' + (parametro ? seccion + '/' + parametro : seccion);
    const mismaRuta = CP.router.actual && CP.router.actual.hash === hash;
    if (vistaActual && vistaActual.unmount) vistaActual.unmount();
    if (!mismaRuta) CP.router.anterior = CP.router.actual;
    CP.router.actual = { hash: hash, titulo: titulo, seccion: seccion };

    const contenedor = document.getElementById('vista');
    contenedor.innerHTML = vista.render(parametro);
    if (mismaRuta) contenedor.style.animation = 'none'; else contenedor.style.animation = '';
    if (vista.mount) vista.mount(contenedor, parametro);
    vistaActual = vista;

    // Zona 1: estado activo, migas y título del documento
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.dataset.nav === seccion) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    pintarMigas(migas);
    document.title = titulo + ' · CloudPanel';

    if (refresco === true || mismaRuta) return;

    document.dispatchEvent(new CustomEvent('cp:navegacion'));
    document.getElementById('contenido').scrollTop = 0;
    if (!primeraCarga) {
      // Accesibilidad: el foco pasa al título de la nueva vista.
      const h1 = contenedor.querySelector('h1');
      if (h1) h1.focus({ preventScroll: true });
    }
    primeraCarga = false;
  }

  CP.router = {
    actual: null,
    anterior: null,
    iniciar: function () {
      window.addEventListener('hashchange', function () { navegar(); });
      navegar();
    },
    /** Vuelve a pintar la vista actual sin mover el foco ni el historial. */
    refrescar: function () { navegar(true); }
  };
})();
