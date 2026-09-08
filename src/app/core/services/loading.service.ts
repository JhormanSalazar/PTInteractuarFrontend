import { Injectable, computed, signal } from '@angular/core';

/**
 * Umbral a partir del cual una peticion se considera "lenta" y se muestra el
 * aviso de que el entorno esta despertando.
 *
 * Estaba en 2500ms, calculado a ojo. Medido contra el despliegue real, el
 * arranque en frio de Neon tarda ~1.9s en responder: con el umbral en 2500ms
 * el aviso aparecia justo cuando la peticion ya estaba a punto de terminar, o
 * directamente no llegaba a aparecer, que es el peor de los dos mundos —el
 * usuario se come toda la espera sin explicacion y luego ve un mensaje que ya
 * no aplica. A 1200ms el aviso sale mientras la espera todavia esta
 * ocurriendo, que es cuando sirve de algo, y sigue por encima del tiempo de
 * una peticion normal en caliente (~400ms) para no aparecer en cada clic.
 */
const SLOW_REQUEST_MS = 1200;

/**
 * Contador de peticiones activas para el indicador de carga global. Ademas
 * detecta peticiones "lentas": si la primera de una racha no termina en
 * SLOW_REQUEST_MS, isSlow() se enciende para que la UI pueda avisar que el
 * entorno de demo (Neon en cold start) puede estar despertando, en vez de
 * dejar al usuario mirando un spinner sin explicacion.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);
  private readonly slowFlag = signal(false);
  private slowTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isLoading = computed(() => this.activeRequests() > 0);
  readonly isSlow = computed(() => this.isLoading() && this.slowFlag());

  increment(): void {
    this.activeRequests.update((n) => n + 1);
    if (this.activeRequests() === 1) {
      this.slowTimer = setTimeout(() => this.slowFlag.set(true), SLOW_REQUEST_MS);
    }
  }

  decrement(): void {
    this.activeRequests.update((n) => Math.max(0, n - 1));
    if (this.activeRequests() === 0) {
      if (this.slowTimer) {
        clearTimeout(this.slowTimer);
        this.slowTimer = null;
      }
      this.slowFlag.set(false);
    }
  }
}
