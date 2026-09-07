// Forma exacta observada en las respuestas de error del backend
// (src/middlewares/errorHandler.ts): RFC 9457 Problem Details.
export interface ProblemDetailsFieldError {
  field: string;
  message: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  errors?: ProblemDetailsFieldError[];
}

/**
 * Error tipado que el resto de la app consume, ya traducido desde el
 * Problem Details crudo por el interceptor de errores. Nunca se muestra un
 * JSON ni un código HTTP en pantalla: siempre `friendlyMessage`.
 */
export class AppHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
    public readonly detail: string | undefined,
    public readonly fieldErrors: ProblemDetailsFieldError[] | undefined,
    public readonly traceId: string | undefined,
  ) {
    super(title);
    this.name = 'AppHttpError';
  }

  get isValidationError(): boolean {
    return this.status === 400 && !!this.fieldErrors?.length;
  }

  get friendlyMessage(): string {
    return this.detail?.trim() || this.title;
  }

  fieldMessage(field: string): string | undefined {
    return this.fieldErrors?.find((e) => e.field === field)?.message;
  }
}
