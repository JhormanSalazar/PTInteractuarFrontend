import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Estado } from '../../../core/models/solicitud.model';
import { ETIQUETAS_ESTADO } from '../../../core/models/etiquetas';

@Component({
  selector: 'app-badge-estado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'estado-' + estado().toLowerCase().replace('_', '-')">{{
    etiqueta()
  }}</span>`,
  styles: `
    .estado-pendiente {
      background: var(--estado-pendiente-bg);
      color: var(--estado-pendiente-text);
    }
    .estado-asignada {
      background: var(--estado-asignada-bg);
      color: var(--estado-asignada-text);
    }
    .estado-en-proceso {
      background: var(--estado-en-proceso-bg);
      color: var(--estado-en-proceso-text);
    }
    .estado-resuelta {
      background: var(--estado-resuelta-bg);
      color: var(--estado-resuelta-text);
    }
    .estado-cancelada {
      background: var(--estado-cancelada-bg);
      color: var(--estado-cancelada-text);
    }
  `,
})
export class BadgeEstado {
  readonly estado = input.required<Estado>();
  protected readonly etiqueta = () => ETIQUETAS_ESTADO[this.estado()];
}
