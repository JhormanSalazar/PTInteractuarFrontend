import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Prioridad } from '../../../core/models/solicitud.model';

const ETIQUETAS: Record<Prioridad, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

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
  protected readonly etiqueta = () => ETIQUETAS[this.prioridad()];
}
