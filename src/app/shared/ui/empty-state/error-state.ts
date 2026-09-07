import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-state" role="alert">
      <p class="error-title">No se pudo cargar la información</p>
      <p class="error-desc">{{ mensaje() }}</p>
      <button type="button" class="btn btn-secondary" (click)="reintentar.emit()">
        Reintentar
      </button>
    </div>
  `,
  styles: `
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-8) var(--space-4);
      text-align: center;
    }
    .error-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-danger);
    }
    .error-desc {
      color: var(--color-text-muted);
      max-width: 32rem;
    }
  `,
})
export class ErrorState {
  readonly mensaje = input.required<string>();
  readonly reintentar = output<void>();
}
