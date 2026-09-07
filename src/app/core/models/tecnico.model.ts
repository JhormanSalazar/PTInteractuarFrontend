// Forma exacta observada en GET /api/v1/tecnicos contra el backend local.
export interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  activo: boolean;
}
