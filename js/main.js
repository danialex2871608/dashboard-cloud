/* main.js — Punto de entrada: conecta header, sidebar, tema y atajos de teclado. */
(function () {
  'use strict';
  const CP = window.CP;

  const app = document.getElementById('app');
  const btnMenu = document.getElementById('btn-menu');
  const btnTema = document.getElementById('btn-tema');
  const mqTableta = window.matchMedia('(min-width: 768px)');
  const mqEscritorio = window.matchMedia('(min-width: 1100px)');

  CP.hidratarIconos();

  /* ---------- Sidebar retráctil ----------
     Una sola clase (.sidebar-toggled) invierte el estado por defecto de cada tamaño:
     móvil = abre el panel off-canvas · tableta = expande el riel · escritorio = lo contrae. */
  function sincronizarMenu() {
    const alternado = app.classList.contains('sidebar-toggled');
    const expandido = mqEscritorio.matches ? !alternado : alternado;
    btnMenu.setAttribute('aria-expanded', String(expandido));
  }

  function cerrarMenuMovil() {
    if (!mqTableta.matches && app.classList.contains('sidebar-toggled')) {
      app.classList.remove('sidebar-toggled');
      sincronizarMenu();
      return true;
    }
    return false;
  }

  btnMenu.addEventListener('click', function () {
    app.classList.toggle('sidebar-toggled');
    sincronizarMenu();
    if (!mqTableta.matches && app.classList.contains('sidebar-toggled')) {
      document.querySelector('.nav__link[aria-current="page"], .nav__link').focus();
    }
  });

  document.getElementById('sidebar-backdrop').addEventListener('click', cerrarMenuMovil);
  document.addEventListener('cp:navegacion', cerrarMenuMovil);

  // Al cruzar un punto de quiebre se vuelve al estado por defecto de ese tamaño.
  [mqTableta, mqEscritorio].forEach(function (mq) {
    mq.addEventListener('change', function () {
      app.classList.remove('sidebar-toggled');
      sincronizarMenu();
    });
  });
  sincronizarMenu();

  /* ---------- Toggle manual de modo oscuro ---------- */
  function pintarBotonTema() {
    const oscuro = CP.tema.efectivo() === 'oscuro';
    btnTema.innerHTML = CP.icon(oscuro ? 'sun' : 'moon');
    btnTema.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    btnTema.title = oscuro ? 'Modo claro' : 'Modo oscuro';
  }
  btnTema.addEventListener('click', CP.tema.alternar);
  document.addEventListener('cp:tema', pintarBotonTema);
  pintarBotonTema();

  /* ---------- Contadores de la navegación ---------- */
  function pintarContadores() {
    const criticas = CP.store.alertas.filter(function (a) { return a.severidad === 'critica'; }).length;
    document.getElementById('cuenta-servidores').textContent = CP.store.servidores.length;
    document.getElementById('cuenta-alertas').textContent = criticas;
    document.getElementById('btn-alertas').setAttribute('aria-label', 'Ver alertas (' + criticas + ' críticas)');
    document.querySelector('[data-nav="servidores"]').setAttribute('aria-label', 'Servidores (' + CP.store.servidores.length + ')');
  }
  CP.store.alCambiar(pintarContadores);
  pintarContadores();

  /* ---------- Atajos de teclado globales (5D: comportamiento) ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !CP.overlay.abierto()) {
      if (cerrarMenuMovil()) btnMenu.focus();
      return;
    }
    const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if (e.key === '/' && !escribiendo && !CP.overlay.abierto() && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      if (CP.router.actual.hash !== '#/servidores') location.hash = '#/servidores';
      setTimeout(function () {
        const buscar = document.getElementById('buscar');
        if (buscar) buscar.focus();
      }, 60);
    }
  });

  CP.router.iniciar();
})();
