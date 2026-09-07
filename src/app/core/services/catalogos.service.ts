import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../http/api.service';
import type { Tecnico } from '../models/tecnico.model';
import type { TipoServicio } from '../models/tipo-servicio.model';
import { ToastService } from './toast.service';

/**
 * Catalogos de solo lectura (tecnicos, tipos de servicio) usados tanto por
 * los filtros del listado como por el formulario de crear/editar. Se cargan
 * una sola vez y se comparten via signals — no hay necesidad de repetir la
 * peticion cada vez que se abre un modal.
 */
@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  private readonly _tecnicos = signal<Tecnico[]>([]);
  private readonly _tiposServicio = signal<TipoServicio[]>([]);
  private cargado = false;

  readonly tecnicos = this._tecnicos.asReadonly();
  readonly tiposServicio = this._tiposServicio.asReadonly();

  cargarSiHaceFalta(): void {
    if (this.cargado) return;
    this.cargado = true;

    this.api.getTecnicos().subscribe({
      next: (r) => this._tecnicos.set(r.data),
      error: () => this.toast.error('No se pudo cargar el listado de técnicos.'),
    });
    this.api.getTiposServicio().subscribe({
      next: (r) => this._tiposServicio.set(r.data),
      error: () => this.toast.error('No se pudo cargar el listado de tipos de servicio.'),
    });
  }
}
