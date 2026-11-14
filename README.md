# CloudPanel · Dashboard SPA responsivo

Práctica integral de Diseño de Interfaces: panel de control para monitorear servidores e
instancias cloud. Permite ver métricas de consumo en tiempo real, configurar una instancia
desde un panel contextual y ejecutar acciones críticas con confirmación segura.

Hecho con **HTML5 semántico, CSS nativo y JavaScript vanilla**. No usa Bootstrap, Tailwind
ni ninguna otra librería o framework.

**Aplicación en línea:** https://danialex2871608.github.io/dashboard-cloud/

**Prototipo UX interactivo:** https://danialex2871608.github.io/dashboard-cloud/prototipo/prototipo.html

## Cómo abrirlo

No requiere instalación ni servidor: abre `index.html` con doble clic en cualquier navegador moderno.

Los datos son simulados y se reinician al recargar la página.

## Estructura del proyecto

```
dashboard-cloud/
├── index.html              Estructura semántica y las tres zonas
├── css/
│   ├── variables.css       Tokens de diseño y paletas clara/oscura
│   ├── base.css            Reset, tipografía y utilidades de accesibilidad
│   ├── layout.css          Grid macro, header, sidebar y Bento Grid (mobile-first)
│   ├── components.css      Botones, campos, switch, dropdown, tabla, gráficas
│   └── overlays.css        Drawer, modal y toasts
├── js/
│   ├── iconos.js           Iconografía SVG
│   ├── datos.js            Datos simulados y almacén con suscripción
│   ├── tema.js             Modo oscuro (sistema + toggle manual)
│   ├── acciones.js         Configurar, reiniciar y eliminar una instancia
│   ├── router.js           Enrutador por hash, migas de pan y foco
│   ├── main.js             Punto de entrada: sidebar, tema y atajos
│   ├── ui/                 toast, overlay (drawer/modal), dropdown, gráfica
│   └── vistas/             resumen, servidores, detalle, alertas, configuración
└── prototipo/
    ├── index.html          User Persona y wireframes de baja fidelidad
    ├── prototipo.html      Prototipo navegable del flujo principal
    └── wire.css, wire.js   Estilos y pantallas de los wireframes
```

## Qué cubre de la práctica

### UX y prototipado
- **User Persona** y **wireframes** de móvil y escritorio en `prototipo/index.html`.
- **Prototipo navegable** en `prototipo/prototipo.html`: Resumen → Servidores → menú → Reiniciar → confirmación → resultado.

### Layout y mobile-first
- Las reglas base de CSS son para teléfono. Tres media queries con `min-width` amplían el diseño: **600 px**, **768 px** y **1100 px**.
- **CSS Grid:** cuadrícula macro `.app` con `grid-template-areas` y **Bento Grid** `.bento` de 1, 2 y 4 columnas.
- **Flexbox:** header, navegación, grupos de botones, mosaicos, filtros y pies de modal.

### Tres zonas
| Zona | Dónde | Qué hace |
| --- | --- | --- |
| 1 · Navegación | `<header>` y `<aside>` | Header fijo y sidebar retráctil. Enlace activo y migas de pan (¿dónde estoy?), enlace “Volver a…” (¿de dónde vengo?) y menú siempre visible (¿a dónde puedo ir?). |
| 2 · Contenido | `<main>` | Vistas de la SPA: métricas en vivo, tabla con búsqueda, filtros y paginación, detalle, alertas y configuración. |
| 3 · Interacción | `js/ui/overlay.js` | Drawer de configuración y modal de confirmación para reiniciar o eliminar. |

### Controles, estados y tendencias
- **Controles:** texto, área de texto, datepicker (`type="date"`), hora, switches, `select` y menú desplegable de acciones.
- **5 estados** (Default, Hover, Focus, Disabled, Loading) en botones, campos, select y switch. Loading bloquea el reenvío.
- **Modo oscuro** con variables CSS en `:root`, `prefers-color-scheme` y toggle manual que se recuerda.
- **Microinteracciones:** elevación de mosaicos, transiciones de botones, apertura y cierre animados de drawer y modal.

## Atajos de teclado

| Tecla | Acción |
| --- | --- |
| `Esc` | Cierra el modal, el drawer, el menú desplegable o el menú móvil |
| `/` | Va a Servidores y enfoca la búsqueda |
| `Tab` / `Shift+Tab` | Recorre los controles (el foco queda atrapado dentro de modal y drawer) |
| `↑` `↓` `Inicio` `Fin` | Recorre las opciones de un menú desplegable |
