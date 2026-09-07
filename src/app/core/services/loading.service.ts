import { Injectable, computed, signal } from '@angular/core';

const SLOW_REQUEST_MS = 2500;

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
