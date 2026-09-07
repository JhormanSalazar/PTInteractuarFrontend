import { HttpErrorResponse } from '@angular/common/http';
import type { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AppHttpError, type ProblemDetails } from '../models/problem-details.model';

/**
 * Unica responsabilidad: traducir el Problem Details del backend (o un fallo
 * de red que no llega a tener body) a un AppHttpError tipado. No decide como
 * se muestra el error en pantalla (toast vs. errores por campo) — eso queda
 * a criterio de quien llama a la API, porque un 400 de validacion necesita
 * pintarse sobre el formulario y un 500 necesita un toast generico.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      const body = err.error as Partial<ProblemDetails> | null;
      const looksLikeProblemDetails = !!body && typeof body === 'object' && 'title' in body;

      if (looksLikeProblemDetails) {
        return throwError(
          () =>
            new AppHttpError(
              body!.status ?? err.status,
              body!.title!,
              body!.detail,
              body!.errors,
              body!.traceId,
            ),
        );
      }

      // Sin body de Problem Details: backend caido, CORS, timeout, sin red.
      return throwError(
        () =>
          new AppHttpError(
            err.status || 0,
            'No se pudo conectar con el servidor',
            'Revisa tu conexión a internet o intenta de nuevo en unos segundos.',
            undefined,
            undefined,
          ),
      );
    }),
  );
