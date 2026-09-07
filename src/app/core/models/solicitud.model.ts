export const ESTADOS = ['PENDIENTE', 'ASIGNADA', 'EN_PROCESO', 'RESUELTA', 'CANCELADA'] as const;
export type Estado = (typeof ESTADOS)[number];

export const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

export interface TecnicoRef {
  id: number;
  nombreCompleto: string;
}

export interface TipoServicioRef {
  id: number;
  nombre: string;
}

// Forma exacta observada en GET /api/v1/solicitudes contra el backend local.
export interface Solicitud {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  solicitanteNombre: string;
  estado: Estado;
  prioridad: Prioridad;
  tecnico: TecnicoRef | null;
  tipoServicio: TipoServicioRef;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaLimite: string | null;
  notasCierre: string | null;
}

export interface CreateSolicitudPayload {
  titulo: string;
  descripcion: string | null;
  solicitanteNombre: string;
  tecnicoId: number | null;
  tipoServicioId: number;
  prioridad: Prioridad;
  fechaLimite: string | null;
}

export type UpdateSolicitudPayload = CreateSolicitudPayload;

export interface PatchEstadoPayload {
  estado: Estado;
  comentario?: string | null;
}
