import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { ESTADOS, PRIORIDADES, type Estado, type Prioridad } from '../../../../core/models/solicitud.model';
import { SolicitudesService } from '../../data/solicitudes.service';

@Component({
  selector: 'app-solicitudes-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './solicitudes-filtros.html',
  styleUrl: './solicitudes-filtros.css',
})
export class SolicitudesFiltros implements OnInit {
  protected readonly solicitudesService = inject(SolicitudesService);
  protected readonly catalogos = inject(CatalogosService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ESTADOS = ESTADOS;
  protected readonly PRIORIDADES = PRIORIDADES;
  protected readonly busqueda = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.catalogos.cargarSiHaceFalta();

    this.busqueda.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => this.solicitudesService.actualizarFiltros({ q: q.trim() || undefined }));
  }

  protected onEstadoChange(value: string): void {
    this.solicitudesService.actualizarFiltros({ estado: (value || undefined) as Estado | undefined });
  }

  protected onPrioridadChange(value: string): void {
    this.solicitudesService.actualizarFiltros({ prioridad: (value || undefined) as Prioridad | undefined });
  }

  protected onTecnicoChange(value: string): void {
    this.solicitudesService.actualizarFiltros({ tecnicoId: value ? Number(value) : undefined });
  }

  protected onTipoServicioChange(value: string): void {
    this.solicitudesService.actualizarFiltros({ tipoServicioId: value ? Number(value) : undefined });
  }
}
