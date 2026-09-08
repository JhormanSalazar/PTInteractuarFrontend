import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Prioridad } from '../../../core/models/solicitud.model';
import { ETIQUETAS_PRIORIDAD } from '../../../core/models/etiquetas';

@Component({
  selector: 'app-badge-prioridad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'prioridad-' + prioridad().toLowerCase()">{{
    etiqueta()
  }}</span>`,
  styles: `
    .prioridad-baja {
      background: var(--prioridad-baja-bg);
      color: var(--prioridad-baja-text);
    }
    .prioridad-media {
      background: var(--prioridad-media-bg);
      color: var(--prioridad-media-text);
    }
    .prioridad-alta {
      background: var(--prioridad-alta-bg);
      color: var(--prioridad-alta-text);
    }
    .prioridad-critica {
      background: var(--prioridad-critica-bg);
      color: var(--prioridad-critica-text);
    }
  `,
})
export class BadgePrioridad {
  readonly prioridad = input.required<Prioridad>();
  protected readonly etiqueta = () => ETIQUETAS_PRIORIDAD[this.prioridad()];
}
