import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * Barra superior indeterminada mientras hay peticiones en curso (indicador
 * de carga global pedido en el criterio de exito), mas un aviso textual si
 * la peticion se demora más de lo normal: el backend y la base en Neon
 * pueden estar "despertando" tras inactividad, y sin este aviso un spinner
 * largo se ve como la app rota en vez de como un entorno de demo gratuito.
 */
@Component({
  selector: 'app-loading-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading.isLoading()) {
      <div class="bar" role="progressbar" aria-label="Cargando"></div>
    }
    @if (loading.isSlow()) {
      <p class="slow-banner" role="status">
        El entorno de demostración puede estar despertando tras un rato inactivo. Esto puede
        tardar unos segundos…
      </p>
    }
  `,
  styles: `
    .bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 1100;
      overflow: hidden;
      background: var(--color-primary-soft);
    }
    .bar::after {
      content: '';
      position: absolute;
      inset: 0;
      width: 40%;
      background: var(--color-primary);
      animation: bar-slide 1.1s ease-in-out infinite;
    }
    @keyframes bar-slide {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(350%);
      }
    }
    .slow-banner {
      position: fixed;
      top: 3px;
      left: 0;
      right: 0;
      z-index: 1090;
      margin: 0;
      padding: var(--space-2) var(--space-4);
      background: var(--color-primary-soft);
      color: var(--color-primary-active);
      font-size: var(--font-size-sm);
      text-align: center;
    }
  `,
})
export class LoadingBanner {
  protected readonly loading = inject(LoadingService);
}
