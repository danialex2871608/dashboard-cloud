/* vistas/resumen.js — Vista de métricas en tiempo real con Bento Grid. */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});
  CP.vistas = CP.vistas || {};
  CP.ajustes = CP.ajustes || {};

  const MUESTRAS = 30;
  const serie = { cpu: [], entrada: [], salida: [] };
  let memoria = 62;
  let disco = 71;
  let temporizador = null;
  let cancelarStore = null;

  function paso(valor, min, max, delta) {
    return Math.max(min, Math.min(max, valor + (Math.random() - 0.5) * delta));
  }

  function ultimo(lista) {
    return lista[lista.length - 1];
  }

  function sembrar() {
    let c = 46, e = 320, s = 180;
    for (let i = 0; i < MUESTRAS; i++) {
      c = paso(c, 8, 97, 14); e = paso(e, 60, 580, 90); s = paso(s, 40, 420, 70);
      serie.cpu.push(c); serie.entrada.push(e); serie.salida.push(s);
    }
  }

  function avanzar() {
    serie.cpu.push(paso(ultimo(serie.cpu), 8, 97, 14)); serie.cpu.shift();
    serie.entrada.push(paso(ultimo(serie.entrada), 60, 580, 90)); serie.entrada.shift();
    serie.salida.push(paso(ultimo(serie.salida), 40, 420, 70)); serie.salida.shift();
    memoria = paso(memoria, 35, 93, 4);
    disco = paso(disco, 60, 90, 0.6);
  }

  function tonoBarra(v) {
    return v >= 90 ? ' progress--danger' : v >= 80 ? ' progress--warn' : '';
  }

  function poner(el, clave, texto) {
    const nodo = el.querySelector('[data-v="' + clave + '"]');
    if (nodo) nodo.textContent = texto;
  }

  /* Actualiza sólo los nodos que cambian (no se vuelve a crear toda la vista). */
  function pintarMetricas(el) {
    const cpu = Math.round(ultimo(serie.cpu));
    const pico = Math.round(Math.max.apply(null, serie.cpu));
    const media = Math.round(serie.cpu.reduce(function (a, b) { return a + b; }, 0) / serie.cpu.length);
    const seg = Math.round((MUESTRAS * (CP.ajustes.intervalo || 2000)) / 1000);

    poner(el, 'cpu', cpu);
    poner(el, 'cpu-pie', 'Promedio ' + media + ' % · Pico ' + pico + ' % · últimos ' + seg + ' s');
    el.querySelector('[data-g="cpu"]').innerHTML =
      '<div class="chart__y" aria-hidden="true"><span>100%</span><span>50%</span><span>0%</span></div>' +
      CP.grafica.lineas([{ valores: serie.cpu }], {
        max: 100, rejilla: true,
        descripcion: 'Uso de CPU promedio. Valor actual ' + cpu + ' por ciento, pico ' + pico + ' por ciento.'
      });

    const m = Math.round(memoria), d = Math.round(disco);
    poner(el, 'mem', m);
    poner(el, 'disco', d);
    const bm = el.querySelector('[data-p="mem"]'), bd = el.querySelector('[data-p="disco"]');
    bm.className = 'progress' + tonoBarra(m); bm.firstElementChild.style.width = m + '%';
    bd.className = 'progress' + tonoBarra(d); bd.firstElementChild.style.width = d + '%';
    poner(el, 'mem-pie', (m * 2.56).toFixed(0) + ' de 256 GB en uso');
    poner(el, 'disco-pie', (d * 0.08).toFixed(1) + ' de 8 TB en uso');

    const en = Math.round(ultimo(serie.entrada)), sa = Math.round(ultimo(serie.salida));
    poner(el, 'entrada', en + ' Mb/s');
    poner(el, 'salida', sa + ' Mb/s');
    el.querySelector('[data-g="red"]').innerHTML = CP.grafica.lineas(
      [{ valores: serie.entrada }, { valores: serie.salida, variante: '2' }],
      { max: 600, descripcion: 'Tráfico de red: entrada ' + en + ' y salida ' + sa + ' megabits por segundo.' }
    );
  }

  function pintarInventario(el) {
    const c = CP.store.contar();
    poner(el, 'activas', c.activo + c.reiniciando);
    poner(el, 'alerta', c.alerta);
    poner(el, 'detenidas', c.detenido);
    poner(el, 'total', c.total + ' instancias en total');

    el.querySelector('[data-regiones]').innerHTML = Object.keys(CP.REGIONES).map(function (clave) {
      const lista = CP.store.servidores.filter(function (s) { return s.region === clave; });
      const activos = lista.filter(function (s) { return s.estado !== 'detenido'; });
      const carga = activos.length
        ? Math.round(activos.reduce(function (a, s) { return a + s.cpu; }, 0) / activos.length)
        : 0;
      return '<div class="bars__row">' +
        '<span><strong>' + CP.REGIONES[clave] + '</strong> <span class="muted">· ' + lista.length + ' instancias</span></span>' +
        '<span class="num">' + carga + ' %</span>' +
        '<div class="progress' + tonoBarra(carga) + '"><span style="width:' + carga + '%"></span></div>' +
      '</div>';
    }).join('');
  }

  function alertaHTML(a) {
    return '<li class="alert-item alert-item--' + a.severidad + '">' +
      '<span class="alert-item__icon">' + CP.icon(CP.SEVERIDADES[a.severidad].icono) + '</span>' +
      '<div class="alert-item__body"><p>' + CP.esc(a.texto) + '</p>' +
      '<span class="alert-item__meta"><a href="#/servidores/' + a.servidor + '" class="mono">' + a.servidor + '</a> · ' + a.hace + '</span></div>' +
    '</li>';
  }
  CP.alertaHTML = alertaHTML;

  CP.vistas.resumen = {
    render: function () {
      const i = CP.icon;
      return '' +
      '<div class="page-head"><div>' +
        '<h1 tabindex="-1">Resumen</h1>' +
        '<p>Consumo de tu infraestructura en tiempo real.</p>' +
      '</div><span class="live"><span class="pulse" aria-hidden="true"></span>En vivo</span></div>' +

      '<div class="bento">' +
        '<section class="tile tile--cpu" aria-labelledby="t-cpu">' +
          '<div class="tile__head"><h2 class="tile__title" id="t-cpu">' + i('cpu', 18) + 'Uso de CPU (promedio)</h2></div>' +
          '<p class="tile__value"><span data-v="cpu">–</span><small> %</small></p>' +
          '<div class="chart" data-g="cpu"></div>' +
          '<p class="tile__foot" data-v="cpu-pie"></p>' +
        '</section>' +

        '<section class="tile tile--estado" aria-labelledby="t-estado">' +
          '<div class="tile__head"><h2 class="tile__title" id="t-estado">' + i('server', 18) + 'Instancias</h2>' +
            '<a href="#/servidores" class="back-link">Ver servidores ' + i('arrowRight', 16) + '</a></div>' +
          '<div class="stats">' +
            '<div class="stat"><span class="stat__num" data-v="activas">–</span><span class="stat__label"><span class="dot dot--success"></span>Activas</span></div>' +
            '<div class="stat"><span class="stat__num" data-v="alerta">–</span><span class="stat__label"><span class="dot dot--warning"></span>En alerta</span></div>' +
            '<div class="stat"><span class="stat__num" data-v="detenidas">–</span><span class="stat__label"><span class="dot"></span>Detenidas</span></div>' +
          '</div>' +
          '<p class="tile__foot" data-v="total"></p>' +
        '</section>' +

        '<section class="tile tile--mem" aria-labelledby="t-mem">' +
          '<div class="tile__head"><h2 class="tile__title" id="t-mem">' + i('layers', 18) + 'Memoria</h2></div>' +
          '<p class="tile__value"><span data-v="mem">–</span><small> %</small></p>' +
          '<div class="progress" data-p="mem"><span></span></div>' +
          '<p class="tile__foot" data-v="mem-pie"></p>' +
        '</section>' +

        '<section class="tile tile--disco" aria-labelledby="t-disco">' +
          '<div class="tile__head"><h2 class="tile__title" id="t-disco">' + i('disk', 18) + 'Almacenamiento</h2></div>' +
          '<p class="tile__value"><span data-v="disco">–</span><small> %</small></p>' +
          '<div class="progress" data-p="disco"><span></span></div>' +
          '<p class="tile__foot" data-v="disco-pie"></p>' +
        '</section>' +

        '<section class="tile tile--red" aria-labelledby="t-red">' +
          '<div class="tile__head"><h2 class="tile__title" id="t-red">' + i('network', 18) + 'Tráfico de red</h2></div>' +
          '<div class="legend">' +
            '<span><span class="dot dot--c1"></span>Entrada <strong class="num" data-v="entrada"></strong></span>' +
            '<span><span class="dot dot--c2"></span>Salida <strong class="num" data-v="salida"></strong></span>' +
          '</div>' +
          '<div class="chart chart--spark" data-g="red"></div>' +
        '</section>' +

        '<section class="tile tile--alertas" aria-labelledby="t-alertas">' +
          '<div class="tile__head"><h2 class="tile__title" id="t-alertas">' + i('bell', 18) + 'Alertas recientes</h2>' +
            '<a href="#/alertas" class="back-link">Ver todas ' + i('arrowRight', 16) + '</a></div>' +
          '<ul class="alert-list">' + CP.store.alertas.slice(0, 4).map(alertaHTML).join('') + '</ul>' +
        '</section>' +

        '<section class="tile tile--regiones" aria-labelledby="t-regiones">' +
          '<div class="tile__head"><h2 class="tile__title" id="t-regiones">' + i('globe', 18) + 'Carga de CPU por región</h2></div>' +
          '<div class="bars" data-regiones></div>' +
        '</section>' +
      '</div>';
    },

    mount: function (el) {
      if (!serie.cpu.length) sembrar();
      pintarMetricas(el);
      pintarInventario(el);
      cancelarStore = CP.store.alCambiar(function () { pintarInventario(el); });
      temporizador = setInterval(function () {
        avanzar();
        pintarMetricas(el);
      }, CP.ajustes.intervalo || 2000);
    },

    unmount: function () {
      clearInterval(temporizador);
      if (cancelarStore) cancelarStore();
    }
  };
})();
