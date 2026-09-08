import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Solicitud } from '../../../../core/models/solicitud.model';
import { BadgeEstado } from '../../../../shared/ui/badge/badge-estado';
import { BadgePrioridad } from '../../../../shared/ui/badge/badge-prioridad';
import { Icon } from '../../../../shared/ui/icon/icon';

@Component({
  selector: 'app-solicitudes-tabla',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeEstado, BadgePrioridad, Icon],
  templateUrl: './solicitudes-tabla.html',
  styleUrl: './solicitudes-tabla.css',
})
export class SolicitudesTabla {
  readonly solicitudes = input.required<Solicitud[]>();
  readonly cambiarEstado = output<Solicitud>();
  readonly editar = output<Solicitud>();
  readonly eliminar = output<Solicitud>();

  protected formatearFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
