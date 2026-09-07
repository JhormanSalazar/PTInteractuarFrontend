import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty" role="status">
      <p class="empty-title">{{ titulo() }}</p>
      <p class="empty-desc">{{ descripcion() }}</p>
      <ng-content />
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-8) var(--space-4);
      text-align: center;
    }
    .empty-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
    }
    .empty-desc {
      color: var(--color-text-muted);
      max-width: 32rem;
    }
  `,
})
export class EmptyState {
  readonly titulo = input.required<string>();
  readonly descripcion = input.required<string>();
}
