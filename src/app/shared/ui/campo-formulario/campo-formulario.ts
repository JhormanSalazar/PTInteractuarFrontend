import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Envoltorio presentacional de un campo de formulario: label + control
 * proyectado + mensaje de error. El id del error sigue el patron
 * `${for}-error` a proposito: el input proyectado debe apuntarle con
 * [attr.aria-describedby] desde la plantilla que lo usa (no se puede
 * auto-conectar un <ng-content> con el control real sin una directiva CVA
 * completa, que aqui no hacia falta).
 */
@Component({
  selector: 'app-campo-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field">
      <label class="field-label" [for]="for()">{{ label() }}</label>
      <ng-content />
      @if (error()) {
        <span class="field-error" [id]="for() + '-error'" role="alert">{{ error() }}</span>
      } @else if (hint()) {
        <span class="field-hint" [id]="for() + '-hint'">{{ hint() }}</span>
      }
    </div>
  `,
})
export class CampoFormulario {
  readonly label = input.required<string>();
  readonly for = input.required<string>();
  readonly error = input<string | undefined>(undefined);
  readonly hint = input<string | undefined>(undefined);
}
