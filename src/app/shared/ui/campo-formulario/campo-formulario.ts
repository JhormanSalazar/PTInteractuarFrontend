import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Envoltorio presentacional de un campo de formulario: label + control
 * proyectado + pie con la ayuda o el error y, opcionalmente, un contador de
 * caracteres. El id del error sigue el patron `${for}-error` a proposito: el
 * input proyectado debe apuntarle con [attr.aria-describedby] desde la
 * plantilla que lo usa (no se puede auto-conectar un <ng-content> con el
 * control real sin una directiva CVA completa, que aqui no hacia falta).
 *
 * El contador vive en el mismo pie que el error pero en su propia columna, y
 * NO desaparece cuando hay error: si el campo se pasa de largo, el contador es
 * justamente la informacion que el usuario necesita para arreglarlo.
 */
@Component({
  selector: 'app-campo-formulario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field">
      <label class="field-label" [for]="for()">{{ label() }}</label>
      <ng-content />
      @if (error() || hint() || max() !== undefined) {
        <div class="field-footer">
          @if (error()) {
            <span class="field-error" [id]="for() + '-error'" role="alert">{{ error() }}</span>
          } @else if (hint()) {
            <span class="field-hint" [id]="for() + '-hint'">{{ hint() }}</span>
          } @else {
            <span></span>
          }

          @if (max(); as maximo) {
            <span
              class="field-contador"
              [class.field-contador--limite]="enElLimite()"
              [attr.aria-label]="'Ha escrito ' + longitud() + ' de ' + maximo + ' caracteres'"
            >
              {{ longitud() }}/{{ maximo }}
            </span>
          }
        </div>
      }
    </div>
  `,
})
export class CampoFormulario {
  readonly label = input.required<string>();
  readonly for = input.required<string>();
  readonly error = input<string | undefined>(undefined);
  readonly hint = input<string | undefined>(undefined);

  /** Maximo de caracteres del campo. Si se pasa, se muestra el contador. */
  readonly max = input<number | undefined>(undefined);
  /** Valor actual del control, para contar. */
  readonly valor = input<string>('');

  protected readonly longitud = computed(() => this.valor().length);
  protected readonly enElLimite = computed(() => {
    const maximo = this.max();
    return maximo !== undefined && this.longitud() >= maximo;
  });
}
