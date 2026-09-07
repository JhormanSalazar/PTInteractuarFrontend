// Se usa en la build de produccion (configuracion "production", la que corre `ng build`
// por defecto). Angular compila este valor dentro del bundle: es publico, por eso solo
// contiene la URL del API, nunca secretos. Actualizar apiUrl con la URL real de Vercel
// una vez desplegado el backend, ANTES de desplegar el frontend (ver docs/PLAN-DESARROLLO.md 4.5).
export const environment = {
  production: true,
  apiUrl: 'https://pt-interactuar-backend.vercel.app/api/v1',
};
