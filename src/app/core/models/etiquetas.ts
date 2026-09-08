import type { Estado, Prioridad } from './solicitud.model';

/**
 * Traduccion de los valores del dominio (que viajan en mayusculas por la API)
 * al texto que se muestra en pantalla.
 *
 * Vive aqui, y no dentro de cada componente, porque estaba repetido en tres
 * sitios: los dos badges y el formulario. Con tres copias, agregar un estado
 * nuevo significaba acordarse de tocar los tres, y la unica forma de notar el
 * olvido era ver un "EN_PROCESO" en crudo en la interfaz.
 */
export const ETIQUETAS_ESTADO: Record<Estado, string> = {
  PENDIENTE: 'Pendiente',
  ASIGNADA: 'Asignada',
  EN_PROCESO: 'En proceso',
  RESUELTA: 'Resuelta',
  CANCELADA: 'Cancelada',
};

export const ETIQUETAS_PRIORIDAD: Record<Prioridad, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};
