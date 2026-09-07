# PT Interactuar — Frontend

Aplicación Angular que consume el API REST del backend (`PTInteractuarBackend`). Este documento
cubre el arranque en desarrollo local; la arquitectura de componentes y el resto de decisiones se
documentan en el entregable (Word) del proyecto.

## Requisitos (versiones verificadas en esta máquina)

| Herramienta | Versión verificada | Cómo se comprobó |
|---|---|---|
| Node.js | **24.20.0** | `node -v` |
| npm | **11.19.0** | `npm -v` |
| Angular CLI | **22.1.7** | `npx @angular/cli@latest version` |

El proyecto se generó con `ng new` usando estas opciones, confirmadas leyendo los archivos que
quedaron realmente en el repo (no se asumió nada):

- **Standalone components**, sin NgModules (`--standalone`, default en v22).
- **Zoneless**: no hay `zone.js` en `dependencies` de `package.json` ni `provideZoneChangeDetection`
  en `app.config.ts` — es el modelo de detección de cambios por defecto desde Angular v21.
- **Test runner: Vitest** (`^4.0.8`), builder `@angular/build:unit-test` — reemplaza a
  Karma/Jasmine como default desde Angular v22.
- **SSR desactivado** (`--ssr=false`): es un sitio estático servido desde Vercel, sin necesidad de
  renderizado en servidor.
- **Formularios: Reactive Forms** (se usarán en el bloque del CRUD). La documentación oficial de
  Angular (`angular.dev/guide/forms`) confirma Reactive Forms como estable; Signal Forms aparece
  marcado como "New" en la navegación pero la página no declara explícitamente su nivel de
  estabilidad, así que se prefirió la opción confirmada como estable para este entregable.

## Arranque desde cero

```bash
npm install
npm start
```

Qué esperar: `npm start` ejecuta `ng serve` (configuración `development` por defecto) y muestra
`Local: http://localhost:4200/`. Al abrir esa URL en el navegador deberías ver "PT Interactuar" y,
debajo, el resultado de consultar `/health` en el backend.

> Este repo no usa Docker ni base de datos: es un sitio estático que solo necesita `npm install`.
> El backend (con Docker/Postgres) se levanta por separado — ver el README de
> `PTInteractuarBackend`.

## Apuntar el frontend al backend

La URL del API se resuelve desde `src/environments/`. **Importante:** la convención de nombres de
Angular 22 es la inversa de versiones anteriores — se confirmó ejecutando
`ng generate environments` y leyendo el `fileReplacements` que quedó en `angular.json`:

| Archivo | Cuándo se usa | Apunta a |
|---|---|---|
| `src/environments/environment.development.ts` | `ng serve` / build `--configuration development` (reemplaza al de abajo vía `fileReplacements`) | `http://localhost:3000/api/v1` (backend local) |
| `src/environments/environment.ts` | Build `production` — el que corre `ng build` por defecto, y el que despliega Vercel | URL del backend en Vercel |

- **Backend local:** ya viene configurado así por defecto (`environment.development.ts`). Solo
  asegúrate de que el backend esté corriendo en `http://localhost:3000` (ver su README).
- **Backend desplegado:** edita `src/environments/environment.ts` y reemplaza `apiUrl` por la URL
  pública real del backend en Vercel, terminada en `/api/v1`. Angular compila este valor **dentro
  del bundle** en tiempo de build — por eso el backend se despliega primero, y por eso este
  archivo nunca debe contener secretos (es código público que cualquiera puede leer en las
  DevTools).

## Scripts npm

| Script | Qué hace |
|---|---|
| `npm start` | `ng serve` — servidor de desarrollo con recarga en caliente en `:4200` |
| `npm run build` | `ng build` — build de producción. Salida real (verificada corriendo el comando): `dist/frontend/browser/` |
| `npm run watch` | Build en modo `development` con `--watch`, sin servidor |
| `npm test` | `ng test` — Vitest |
| `npm run lint` | `ng lint` — ESLint con `angular-eslint` |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |

## Cómo correr los tests

```bash
npm test
```

No requiere backend ni base de datos: el test del componente raíz usa
`provideHttpClientTesting()` para interceptar la llamada a `/health` con una respuesta simulada,
en vez de golpear una red real.

## Problemas frecuentes

- **Puerto 4200 ocupado** — `ng serve --port 4201` o cierra el proceso que lo esté usando.
- **Error de CORS en la consola del navegador** — el backend rechaza el origen. Revisa que
  `CORS_ORIGIN` en el `.env` del backend incluya exactamente
  `http://localhost:4200` (protocolo + host + puerto exactos) en desarrollo, o el dominio de
  producción del frontend en Vercel.
- **La pantalla se queda en "Consultando el backend..."** — el backend no está corriendo, o
  `environment.development.ts` apunta a un puerto distinto al que realmente usa
  (`npm run dev` en el backend imprime el puerto real al arrancar).
- **`ng: command not found`** — usa `npx ng ...` o instala el CLI global (`npm i -g @angular/cli`);
  los scripts de `package.json` (`npm start`, etc.) no lo necesitan instalado globalmente.

## URLs de producción

- Frontend: _pendiente de despliegue — se completa en el siguiente bloque de trabajo, después de
  desplegar el backend y fijar su URL en `environment.ts` (ver arriba)._
- Backend: ver README de `PTInteractuarBackend`.
