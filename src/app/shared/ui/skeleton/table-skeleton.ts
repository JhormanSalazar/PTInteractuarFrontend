import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-table-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (fila of filas(); track $index) {
      <div class="fila" role="presentation">
        @for (col of columnas(); track $index) {
          <span class="skeleton celda" [style.width.%]="col"></span>
        }
      </div>
    }
  `,
  styles: `
    .fila {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border);
    }
    .celda {
      height: 1rem;
    }
  `,
})
export class TableSkeleton {
  readonly rows = input<number>(6);
  protected readonly columnas = () => [12, 28, 14, 12, 14, 12];
  protected readonly filas = () => Array.from({ length: this.rows() });
}
