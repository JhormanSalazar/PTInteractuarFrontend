import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { baseUrlInterceptor } from './core/http/base-url.interceptor';
import { loadingInterceptor } from './core/http/loading.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      // Orden importa: base-url primero (resuelve la URL relativa antes de
      // que loading/error necesiten inspeccionarla), error al final para que
      // vea la respuesta ya fallida de todos los interceptores anteriores.
      withInterceptors([baseUrlInterceptor, loadingInterceptor, errorInterceptor]),
    ),
  ],
};
