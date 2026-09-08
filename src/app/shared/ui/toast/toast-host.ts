import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="toast-host" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class.toast-error]="toast.type === 'error'">
          <span>{{ toast.message }}</span>
          <button
            type="button"
            class="btn-icon btn-ghost toast-close"
            aria-label="Cerrar aviso"
            (click)="toastService.dismiss(toast.id)"
          >
            <app-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-host {
      position: fixed;
      bottom: var(--space-5);
      right: var(--space-5);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-width: min(24rem, calc(100vw - 2 * var(--space-4)));
    }
    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--color-text);
      color: #fff;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      font-size: var(--font-size-sm);
    }
    .toast-error {
      background: var(--color-danger);
    }
    .toast-close {
      margin-left: auto;
      color: inherit;
      opacity: 0.8;
    }
    .toast-close:hover {
      opacity: 1;
      background: rgb(255 255 255 / 0.15);
    }
  `,
})
export class ToastHost {
  protected readonly toastService = inject(ToastService);
}
