/* datos.js — Datos simulados y almacén (store) con suscripción a cambios.
   En un proyecto real este módulo se reemplaza por llamadas a la API. */
(function () {
  'use strict';
  const CP = (window.CP = window.CP || {});

  /* ---------- Utilidades compartidas ---------- */

  /** Escapa texto antes de insertarlo como HTML (evita inyección). */
  CP.esc = function (texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /** Simula la latencia de red de una operación asíncrona. */
  CP.espera = function (ms) {
    return new Promise(function (ok) { setTimeout(ok, ms); });
  };

  /* Generador pseudoaleatorio con semilla: los datos son iguales en cada carga. */
  function crearAzar(semilla) {
    return function () {
      semilla |= 0;
      semilla = (semilla + 0x6d2b79f5) | 0;
      let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  CP.crearAzar = crearAzar;

  /* ---------- Catálogos ---------- */
  CP.REGIONES = {
    'us-east-1': 'Virginia',
    'us-west-2': 'Oregón',
    'eu-west-1': 'Irlanda',
    'sa-east-1': 'São Paulo'
  };

  CP.TIPOS = ['t3.micro', 't3.medium', 'm5.large', 'c5.xlarge'];

  CP.ESTADOS = {
    activo: { etiqueta: 'Activo', tono: 'success' },
    alerta: { etiqueta: 'En alerta', tono: 'warning' },
    detenido: { etiqueta: 'Detenido', tono: 'neutral' },
    reiniciando: { etiqueta: 'Reiniciando', tono: 'info' }
  };

  CP.SEVERIDADES = {
    critica: { etiqueta: 'Crítica', icono: 'alert' },
    advertencia: { etiqueta: 'Advertencia', icono: 'alert' },
    info: { etiqueta: 'Informativa', icono: 'info' }
  };

  /* ---------- Servidores ---------- */
  const azar = crearAzar(20261113);
  const entre = function (min, max) { return Math.round(min + azar() * (max - min)); };
  const ROLES = ['web', 'api', 'db', 'cache', 'worker'];
  const DESCRIPCION = {
    web: 'Servidor web público detrás del balanceador.',
    api: 'Nodo de la API REST interna.',
    db: 'Réplica de base de datos PostgreSQL.',
    cache: 'Nodo de caché en memoria (Redis).',
    worker: 'Procesador de tareas en segundo plano.'
  };
  const regiones = Object.keys(CP.REGIONES);
  const EN_ALERTA = ['srv-db-01', 'srv-worker-02', 'srv-api-03', 'srv-cache-01'];
  const DETENIDOS = ['srv-worker-01', 'srv-web-04', 'srv-cache-05'];

  const servidores = [];
  for (let i = 0; i < 24; i++) {
    const rol = ROLES[i % ROLES.length];
    const nombre = 'srv-' + rol + '-' + String(Math.floor(i / ROLES.length) + 1).padStart(2, '0');
    // Estados coherentes con las alertas definidas más abajo.
    const estado = EN_ALERTA.indexOf(nombre) >= 0 ? 'alerta' : DETENIDOS.indexOf(nombre) >= 0 ? 'detenido' : 'activo';
    servidores.push({
      id: nombre,
      nombre: nombre,
      descripcion: DESCRIPCION[rol],
      region: regiones[(i + Math.floor(i / ROLES.length)) % regiones.length],
      tipo: CP.TIPOS[entre(0, CP.TIPOS.length - 1)],
      estado: estado,
      cpu: estado === 'detenido' ? 0 : estado === 'alerta' ? entre(86, 98) : entre(12, 68),
      memoria: estado === 'detenido' ? 0 : entre(28, 90),
      disco: entre(20, 88),
      ip: '10.0.' + entre(1, 12) + '.' + entre(10, 240),
      diasActivo: estado === 'detenido' ? 0 : entre(1, 210),
      autoescalado: azar() > 0.5,
      respaldos: azar() > 0.3,
      mantenimiento: '2026-12-' + String(entre(1, 28)).padStart(2, '0'),
      umbralCpu: 85
    });
  }

  const alertas = [
    { id: 'a1', severidad: 'critica', texto: 'Uso de CPU por encima del 95 % durante 10 minutos', servidor: 'srv-db-01', hace: 'hace 4 min' },
    { id: 'a2', severidad: 'critica', texto: 'El disco alcanzó el 92 % de su capacidad', servidor: 'srv-worker-02', hace: 'hace 18 min' },
    { id: 'a3', severidad: 'advertencia', texto: 'Latencia de respuesta mayor a 800 ms', servidor: 'srv-api-03', hace: 'hace 35 min' },
    { id: 'a4', severidad: 'advertencia', texto: 'Memoria disponible por debajo del 15 %', servidor: 'srv-cache-01', hace: 'hace 1 h' },
    { id: 'a5', severidad: 'info', texto: 'Respaldo automático completado correctamente', servidor: 'srv-db-02', hace: 'hace 2 h' },
    { id: 'a6', severidad: 'info', texto: 'Certificado TLS renovado', servidor: 'srv-web-01', hace: 'hace 5 h' },
    { id: 'a7', severidad: 'advertencia', texto: 'Se detectaron 3 reinicios en las últimas 24 horas', servidor: 'srv-worker-01', hace: 'ayer' },
    { id: 'a8', severidad: 'info', texto: 'Autoescalado agregó una instancia al grupo web', servidor: 'srv-web-04', hace: 'ayer' }
  ];

  /* ---------- Almacén con patrón observador ---------- */
  const oyentes = new Set();
  function avisar() {
    // Se recorre una copia: un oyente puede darse de baja o de alta al ejecutarse.
    Array.from(oyentes).forEach(function (fn) { fn(); });
  }

  CP.store = {
    servidores: servidores,
    alertas: alertas,

    /** Suscribe una función a los cambios. Devuelve la función para cancelar. */
    alCambiar: function (fn) {
      oyentes.add(fn);
      return function () { oyentes.delete(fn); };
    },

    obtener: function (id) {
      return servidores.find(function (s) { return s.id === id; });
    },

    actualizar: function (id, cambios) {
      const s = this.obtener(id);
      if (s) { Object.assign(s, cambios); avisar(); }
    },

    eliminar: function (id) {
      const i = servidores.findIndex(function (s) { return s.id === id; });
      if (i >= 0) { servidores.splice(i, 1); avisar(); }
    },

    /** Reinicio: pasa por el estado "reiniciando" y vuelve a "activo". */
    reiniciar: function (id) {
      const self = this;
      self.actualizar(id, { estado: 'reiniciando', cpu: 0, memoria: 0 });
      setTimeout(function () {
        if (self.obtener(id)) {
          self.actualizar(id, { estado: 'activo', cpu: 9, memoria: 31, diasActivo: 0 });
        }
      }, 5000);
    },

    contar: function () {
      const c = { total: servidores.length, activo: 0, alerta: 0, detenido: 0, reiniciando: 0 };
      servidores.forEach(function (s) { c[s.estado]++; });
      return c;
    }
  };
})();
