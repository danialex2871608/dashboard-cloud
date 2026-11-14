/* grafica.js — Gráficas de líneas en SVG nativo (sin librerías). */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});
  const ANCHO = 100;
  const ALTO = 40;
  const MARGEN = 1.5; // evita que el trazo se recorte en los bordes

  function trazo(valores, max) {
    const n = valores.length;
    return valores.map(function (v, i) {
      const x = (i / (n - 1)) * ANCHO;
      const y = MARGEN + (1 - Math.min(v, max) / max) * (ALTO - MARGEN * 2);
      return (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    }).join(' ');
  }

  CP.grafica = {
    /**
     * @param {{valores:number[], variante?:string}[]} series
     * @param {{max:number, descripcion:string, rejilla?:boolean}} o
     * @returns {string} marcado SVG
     */
    lineas: function (series, o) {
      let svg = '<svg class="chart__svg" viewBox="0 0 ' + ANCHO + ' ' + ALTO + '" preserveAspectRatio="none" ' +
        'role="img" aria-label="' + CP.esc(o.descripcion) + '">';
      if (o.rejilla) {
        [MARGEN, ALTO / 2, ALTO - MARGEN].forEach(function (y) {
          svg += '<line class="chart__grid" x1="0" x2="' + ANCHO + '" y1="' + y + '" y2="' + y + '" vector-effect="non-scaling-stroke"/>';
        });
      }
      series.forEach(function (s) {
        const d = trazo(s.valores, o.max);
        const v = s.variante ? ' chart__area--' + s.variante : '';
        const l = s.variante ? ' chart__line--' + s.variante : '';
        svg += '<path class="chart__area' + v + '" d="' + d + ' L' + ANCHO + ' ' + ALTO + ' L0 ' + ALTO + ' Z"/>';
        svg += '<path class="chart__line' + l + '" d="' + d + '" vector-effect="non-scaling-stroke"/>';
      });
      return svg + '</svg>';
    }
  };
})();
