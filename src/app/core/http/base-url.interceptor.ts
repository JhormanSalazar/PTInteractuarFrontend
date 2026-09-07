import type { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * ApiService solo conoce rutas relativas ('/solicitudes', '/health'...); este
 * interceptor las resuelve contra environment.apiUrl y agrega un id de
 * correlacion por peticion. El backend genera su propio traceId igual (no
 * lee esta cabecera todavia), pero tenerlo en la pestaña Network del
 * navegador ayuda a emparejar una peticion concreta con lo que se reporte.
 */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (/^https?:\/\//i.test(req.url)) {
    return next(req);
  }

  const clientTraceId = crypto.randomUUID();
  const apiReq = req.clone({
    url: `${environment.apiUrl}${req.url}`,
    setHeaders: { 'X-Client-Trace-Id': clientTraceId },
  });

  return next(apiReq);
};
