import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService, type SolicitudesQuery } from '../../../core/http/api.service';
import { AppHttpError } from '../../../core/models/problem-details.model';
import type { PaginationMeta } from '../../../core/models/pagination.model';
import type {
  CreateSolicitudPayload,
  Estado,
  Prioridad,
  Solicitud,
  UpdateSolicitudPayload,
} from '../../../core/models/solicitud.model';
import { ETIQUETAS_ESTADO } from '../../../core/models/etiquetas';
import { ToastService } from '../../../core/services/toast.service';

export interface SolicitudesFiltros {
  q?: string;
  estado?: Estado;
  prioridad?: Prioridad;
  tecnicoId?: number;
  tipoServicioId?: number;
  sort: string;
  page: number;
  pageSize: number;
}

export type EstadoCarga = 'idle' | 'loading' | 'success' | 'error';

const FILTROS_INICIALES: SolicitudesFiltros = {
  sort: 'fechaCreacion:desc',
  page: 1,
  pageSize: 10,
};

/**
 * Estado del feature "solicitudes" en signals; nada de NgRx. Ningun
 * componente llama a HttpClient/ApiService directamente para leer o mutar
 * este estado: pasan por aqui.
 */
@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  private readonly _solicitudes = signal<Solicitud[]>([]);
  private readonly _meta = signal<PaginationMeta>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  private readonly _status = signal<EstadoCarga>('idle');
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _filtros = signal<SolicitudesFiltros>(FILTROS_INICIALES);

  readonly solicitudes = this._solicitudes.asReadonly();
  readonly meta = this._meta.asReadonly();
  readonly status = this._status.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly filtros = this._filtros.asReadonly();
  readonly isEmpty = computed(() => this._status() === 'success' && this._solicitudes().length === 0);

  cargar(): void {
    this._status.set('loading');
    const query: SolicitudesQuery = { ...this._filtros() };

    this.api.getSolicitudes(query).subscribe({
      next: (result) => {
        this._solicitudes.set(result.data);
        this._meta.set(result.meta);
        this._status.set('success');
      },
      error: (err: unknown) => {
        this._errorMessage.set(
          err instanceof AppHttpError ? err.friendlyMessage : 'No se pudo cargar el listado de solicitudes.',
        );
        this._status.set('error');
      },
    });
  }

  /** Cambiar cualquier filtro que no sea la pagina vuelve a la pagina 1. */
  actualizarFiltros(patch: Partial<Omit<SolicitudesFiltros, 'page'>>): void {
    this._filtros.update((f) => ({ ...f, ...patch, page: 1 }));
    this.cargar();
  }

  cambiarPagina(page: number): void {
    this._filtros.update((f) => ({ ...f, page }));
    this.cargar();
  }

  async crear(payload: CreateSolicitudPayload): Promise<Solicitud> {
    const creada = await firstValueFrom(this.api.createSolicitud(payload));
    this.toast.success(`Solicitud ${creada.codigo} creada correctamente.`);
    this.cargar();
    return creada;
  }

  async actualizar(id: number, payload: UpdateSolicitudPayload): Promise<Solicitud> {
    const actualizada = await firstValueFrom(this.api.updateSolicitud(id, payload));
    this.toast.success(`Solicitud ${actualizada.codigo} actualizada correctamente.`);
    this.cargar();
    return actualizada;
  }

  /**
   * Cambia solo el estado, via PATCH /solicitudes/:id/estado. Es una operacion
   * aparte del PUT a proposito: el backend le aplica su propia regla de negocio
   * (no se puede pasar a ASIGNADA o EN_PROCESO sin tecnico) y registra el
   * cambio en el historial de la solicitud, cosa que una edicion normal no
   * hace. Por eso el contrato de actualizacion ni siquiera acepta "estado".
   *
   * Relanza el error para que el dialogo que lo llama pueda quedarse abierto y
   * mostrar el motivo del rechazo junto a la seleccion.
   */
  async cambiarEstado(solicitud: Solicitud, estado: Estado): Promise<Solicitud> {
    const actualizada = await firstValueFrom(this.api.patchEstadoSolicitud(solicitud.id, { estado }));
    this.toast.success(`Solicitud ${actualizada.codigo} pasó a ${ETIQUETAS_ESTADO[estado]}.`);
    this.cargar();
    return actualizada;
  }

  async eliminar(solicitud: Solicitud): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteSolicitud(solicitud.id));
      this.toast.success(`Solicitud ${solicitud.codigo} eliminada.`);
      this.cargar();
    } catch (err) {
      this.toast.error(
        err instanceof AppHttpError ? err.friendlyMessage : 'No se pudo eliminar la solicitud.',
      );
      throw err;
    }
  }
}
