// Se usa en la build de produccion (configuracion "production", la que corre `ng build`
// por defecto). Angular compila este valor dentro del bundle: es publico, por eso solo
// contiene la URL del API, nunca secretos. Al ser de tiempo de build, cambiar apiUrl
// obliga a reconstruir y redesplegar el frontend; si el proyecto del backend se renombra
// en Vercel (cambia su dominio), hay que actualizarlo aqui.
export const environment = {
  production: true,
  apiUrl: 'https://interactuar-backend.vercel.app/api/v1',
};
