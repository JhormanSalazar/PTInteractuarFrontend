// Forma exacta observada en GET /api/v1/tipos-servicio contra el backend local.
export interface TipoServicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  slaHoras: number;
  activo: boolean;
}
