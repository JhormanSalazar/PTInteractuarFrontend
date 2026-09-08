# PT Interactuar — Frontend

Aplicación Angular para gestionar la asignación de solicitudes de soporte TI a técnicos:
listado con filtros y búsqueda, y creación/edición/borrado en modales, consumiendo el API REST
del backend (`PTInteractuarBackend`). Este documento cubre el arranque en desarrollo local; las
decisiones de arquitectura y diseño se documentan también en el entregable (Word) del proyecto.

## Requisitos (versiones verificadas en esta máquina)

| Herramienta | Versión verificada | Cómo se comprobó |
|---|---|---|
| Node.js | **24.20.0** | `node -v` |
| npm | **11.19.0** | `npm -v` |
| Angular CLI | **22.1.7** | `npx @angular/cli@latest version` |
| Angular CDK | **22.1.5** | `npm list @angular/cdk` — no venía instalado por defecto, se agregó en este bloque |

Confirmado leyendo los archivos generados y el comportamiento real, no supuesto:

- **Standalone components**, sin NgModules, **zoneless** (no hay `zone.js` en `dependencies`),
  **signals** para todo el estado y **`ChangeDetectionStrategy.OnPush`** en cada componente.
- **Test runner: Vitest** (builder `@angular/build:unit-test`).
- **Reactive Forms tipados** (`NonNullableFormBuilder`) — ver justificación en el README del
  bootstrap; Signal Forms no tenía su estabilidad confirmada en la documentación oficial al
  momento de decidir.
- **Angular CDK** solo para primitivos accesibles: `Dialog` (modales con focus trap y
  restauración de foco incluidos de fábrica) — nada de Material ni una librería de componentes
  completa.

## Arranque desde cero

```bash
npm install
npm start
```

Qué esperar: `npm start` ejecuta `ng serve` y muestra `Local: http://localhost:4200/`. Al abrir
esa URL deberías ver el listado de solicitudes cargando (skeleton) y luego con datos, siempre que
el backend esté corriendo en `http://localhost:3000` (ver su README — necesita Docker/Postgres).

> Este repo no usa Docker ni base de datos propia: es un sitio estático. Todo el estado vive en
> el backend.

## Qué hay implementado

- **Listado** (`/`): búsqueda por texto con debounce de 300ms, filtros por estado, prioridad,
  técnico y tipo de servicio, paginación resuelta por el backend (no se trae todo y se filtra en
  el cliente), y los cuatro estados visuales — cargando (skeleton), vacío, error (con
  reintentar) y con datos.
- **Crear / editar**: mismo componente de modal (`SolicitudFormDialog`) en los dos modos,
  formulario reactivo tipado cuyas validaciones replican las del backend (`min`/`max` de
  longitud, campos obligatorios), con los errores del servidor (400/422) pintados sobre el
  campo exacto que los causó — nunca en un toast genérico. Cada campo de texto muestra su límite
  y un contador `n/máx` en vivo, y lleva `maxlength` nativo: el usuario no llega a escribir de
  más, en vez de descubrirlo al enviar.
- **Cambiar estado**: modal propio (`CambiarEstadoDialog`) que llama a
  `PATCH /solicitudes/:id/estado`. Es una operación aparte de la edición porque el backend le
  aplica su regla de negocio y registra el cambio en el historial — por eso el contrato de
  actualización ni siquiera acepta `estado`. Los estados que exigen técnico (`Asignada`,
  `En proceso`) aparecen deshabilitados y con el motivo cuando la solicitud no lo tiene; si el
  backend rechaza el cambio igualmente (409), el modal se queda abierto mostrando por qué.
- **Eliminar**: modal de confirmación (`ConfirmarEliminarDialog`) en formato vertical —icono de
  peligro, título, la solicitud concreta y la advertencia de irreversibilidad, en columna— que
  nombra código y título; `Escape` cancela.
- **Acciones por fila**: tres botones solo-icono (cambiar estado, editar, eliminar) con tooltip
  nativo y `aria-label`, bajo una columna «Acciones» con cabecera visible.
- **Manejo de errores**: tres interceptores (`baseUrlInterceptor`, `loadingInterceptor`,
  `errorInterceptor`) — el último traduce el Problem Details del backend a un `AppHttpError`
  tipado; ningún componente ve un `HttpErrorResponse` ni un JSON crudo.
- **Indicador de carga global** y aviso de "el entorno de demo puede estar despertando" si una
  petición tarda más de 1.2s (cold start de Neon).
- **Ping de calentamiento** a `/health` al arrancar, en segundo plano, silencioso si falla.
- **Pie de demostración** (`DemoFooter`): un botón discreto que llama a `POST /demo/reset` del
  backend, con modal de confirmación previo y toast al terminar. Está para que la demo pública no
  quede vacía después de que alguien pruebe el borrado. Si el backend corre con `DEMO_MODE=false`
  la ruta responde `404` y el pie se oculta solo.

## Apuntar el frontend al backend

La URL del API se resuelve desde `src/environments/`. La convención de Angular 22 es la inversa
de versiones anteriores (confirmado leyendo el `fileReplacements` que generó
`ng generate environments` en `angular.json`):

| Archivo | Cuándo se usa | Apunta a |
|---|---|---|
| `src/environments/environment.development.ts` | `ng serve` / build `development` | `http://localhost:3000/api/v1` (backend local) |
| `src/environments/environment.ts` | Build `production` (`ng build`, lo que despliega Vercel) | URL del backend en Vercel |

- **Backend local:** ya viene configurado así por defecto. Solo asegúrate de que el backend esté
  corriendo en `http://localhost:3000`.
- **Backend desplegado:** edita `src/environments/environment.ts`, reemplaza `apiUrl` por la URL
  pública real del backend en Vercel terminada en `/api/v1`, y vuelve a compilar. Angular
  compila este valor **dentro del bundle** en tiempo de build — por eso el backend se despliega
  primero, y por eso este archivo nunca lleva secretos (el bundle es público, cualquiera puede
  leerlo en las DevTools).
- Ningún componente construye una URL a mano: todos pasan por `ApiService`, que usa rutas
  relativas (`/solicitudes`, `/health`...) resueltas por `baseUrlInterceptor` contra
  `environment.apiUrl`.

## Sistema de diseño

Nada de Angular Material ni una librería de UI pesada. `src/app/styles/tokens.css` define
custom properties (color, espaciado, radios, sombras, tipografía) y `src/app/styles/base.css`
los componentes base (`.btn`, `.input`, `.select`, `.badge`, dialogos, skeleton). Dirección
visual: consola operativa neutra en slate/gris con un solo acento índigo para acciones
primarias, y colores semánticos consistentes para los badges de estado y prioridad (verificados
a mano contra WCAG AA). `prefers-reduced-motion` desactiva todas las transiciones. El
justificativo completo está en el reporte del bloque y en el entregable.

### Iconos

Los iconos son de [Lucide](https://lucide.dev) (licencia ISC), pero **no** vía el paquete
`lucide-angular`: su versión más reciente (1.0.0) declara como peer dependency
`"@angular/core": "13.x - 21.x"` y este proyecto va en Angular 22, así que instalarlo obligaría a
`npm install --legacy-peer-deps` y rompería el arranque documentado más arriba. En su lugar,
`src/app/shared/ui/icon/icon.ts` embebe los trazados de Lucide en un componente propio: mismo
lenguaje visual (rejilla 24×24, trazo de 2, extremos redondeados), sin dependencia y sin sumar al
bundle más que los seis iconos en uso (`plus`, `pencil`, `trash-2`, `refresh-cw`,
`triangle-alert`, `x`). Para agregar uno nuevo se copian los atributos `d` de su SVG en
lucide.dev.

Todos los puntos de cierre de la interfaz —los cuatro modales y el botón de descartar un aviso—
usan el mismo icono `x`, no el carácter `✕`. Un glifo de texto depende de la fuente instalada, no
hereda el grosor de trazo del resto de iconos y se apoya en la línea base en vez de centrarse;
`ToastHost` tiene una prueba que falla si alguien vuelve a poner uno literal.

## Scripts npm

| Script | Qué hace |
|---|---|
| `npm start` | `ng serve` — servidor de desarrollo con recarga en caliente en `:4200` |
| `npm run build` | `ng build` — build de producción. Salida real: `dist/frontend/browser/` |
| `npm run watch` | Build en modo `development` con `--watch`, sin servidor |
| `npm test` | `ng test` — Vitest |
| `npm run lint` | `ng lint` — ESLint con `angular-eslint` |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |

## Cómo correr los tests

```bash
npm test
```

No requiere backend real ni base de datos: todos los tests usan `provideHttpClientTesting()`
(`HttpTestingController`) para interceptar las peticiones con respuestas simuladas. Cubren:

- `ApiService` (métodos, URLs y query params exactos que arma cada llamada).
- Validaciones del formulario reactivo de `SolicitudFormDialog`, incluidos los límites de
  longitud y el mapeo de un error 422 del backend al campo correspondiente.
- `CambiarEstadoDialog`: qué estados quedan bloqueados sin técnico, que confirmar llame al
  servicio con el estado elegido, y que un 409 deje el modal abierto con el motivo.
- `SolicitudesTabla`: la cabecera «Acciones», que los botones solo-icono conserven nombre
  accesible y tooltip, y que cada uno emita su evento.
- Los cuatro estados visuales del listado (`SolicitudesListPage`), inyectando un
  `SolicitudesService` simulado en cada caso.
- `DemoFooter`: restaurar, cancelar, ocultarse ante un 404 y avisar ante otros errores.
- `ToastHost`: que el botón de cerrar sea el icono y no un carácter, y que descarte el aviso.
- El componente raíz (`App`): dispara el ping a `/health` y no se rompe si falla.

## Problemas frecuentes

- **Puerto 4200 ocupado** — `ng serve --port 4201` o cierra el proceso que lo esté usando.
- **Error de CORS en la consola del navegador** — el backend rechaza el origen. Revisa que
  `CORS_ORIGIN` en el `.env` del backend incluya exactamente `http://localhost:4200` (protocolo +
  host + puerto exactos) en desarrollo, o el dominio de producción del frontend en Vercel.
- **El listado se queda en "cargando" o pasa directo a "error"** — el backend no está corriendo,
  o `environment.development.ts` apunta a un puerto distinto al real (`npm run dev` en el
  backend imprime el puerto al arrancar).
- **Los modales no abren o el foco no se ve** — falta el CSS de CDK Overlay
  (`@angular/cdk/overlay-prebuilt.css` en `angular.json` → `styles`); ya está agregado, pero si
  se reinstala el proyecto desde cero verifícalo.
- **`ng: command not found`** — usa `npx ng ...` o instala el CLI global; los scripts de
  `package.json` no lo necesitan instalado globalmente.

## URLs de producción

- Frontend: <https://interactuar-frontend.vercel.app>
- Backend: <https://interactuar-backend.vercel.app>
- Documentación interactiva de la API (Swagger UI): <https://interactuar-backend.vercel.app/api/docs>
- Health check: <https://interactuar-backend.vercel.app/api/v1/health>

La URL del backend se compila dentro del bundle (`src/environments/environment.ts`), así que
cambiarla exige reconstruir y redesplegar el frontend.
