import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  CreateSolicitudPayload,
  PatchEstadoPayload,
  Solicitud,
  UpdateSolicitudPayload,
} from '../models/solicitud.model';
import type { PagedResult } from '../models/pagination.model';
import type { Tecnico } from '../models/tecnico.model';
import type { TipoServicio } from '../models/tipo-servicio.model';

export interface SolicitudesQuery {
  page: number;
  pageSize: number;
  q?: string;
  estado?: string;
  prioridad?: string;
  tecnicoId?: number;
  tipoServicioId?: number;
  sort: string;
}

interface HealthResponse {
  status: string;
  database: string;
  timestamp: string;
}

/**
 * Unico punto de contacto con HttpClient en toda la app (ver reglas del
 * bloque). Usa rutas relativas: el baseUrlInterceptor las resuelve contra
 * environment.apiUrl, asi que ningun componente construye una URL a mano.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  getSolicitudes(query: SolicitudesQuery): Observable<PagedResult<Solicitud>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize)
      .set('sort', query.sort);

    if (query.q) params = params.set('q', query.q);
    if (query.estado) params = params.set('estado', query.estado);
    if (query.prioridad) params = params.set('prioridad', query.prioridad);
    if (query.tecnicoId != null) params = params.set('tecnicoId', query.tecnicoId);
    if (query.tipoServicioId != null) params = params.set('tipoServicioId', query.tipoServicioId);

    return this.http.get<PagedResult<Solicitud>>('/solicitudes', { params });
  }

  getSolicitud(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`/solicitudes/${id}`);
  }

  createSolicitud(payload: CreateSolicitudPayload): Observable<Solicitud> {
    return this.http.post<Solicitud>('/solicitudes', payload);
  }

  updateSolicitud(id: number, payload: UpdateSolicitudPayload): Observable<Solicitud> {
    return this.http.put<Solicitud>(`/solicitudes/${id}`, payload);
  }

  patchEstadoSolicitud(id: number, payload: PatchEstadoPayload): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`/solicitudes/${id}/estado`, payload);
  }

  deleteSolicitud(id: number): Observable<void> {
    return this.http.delete<void>(`/solicitudes/${id}`);
  }

  getTecnicos(): Observable<{ data: Tecnico[] }> {
    return this.http.get<{ data: Tecnico[] }>('/tecnicos');
  }

  getTiposServicio(): Observable<{ data: TipoServicio[] }> {
    return this.http.get<{ data: TipoServicio[] }>('/tipos-servicio');
  }

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>('/health');
  }
}
