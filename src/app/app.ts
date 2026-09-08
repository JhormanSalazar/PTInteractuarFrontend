import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/http/api.service';
import { DemoFooter } from './shared/ui/demo-footer/demo-footer';
import { LoadingBanner } from './shared/ui/loading-banner/loading-banner';
import { ToastHost } from './shared/ui/toast/toast-host';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, LoadingBanner, DemoFooter, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly api = inject(ApiService);

  constructor() {
    // Ping de calentamiento en segundo plano: despierta backend y BD (Neon
    // en cold start) mientras el usuario mira la primera pantalla. No debe
    // bloquear el render ni mostrar error si falla — por eso el subscribe
    // vacio en next/error, sin async/await ni toques al estado de la UI.
    this.api.getHealth().subscribe({ next: () => undefined, error: () => undefined });
  }
}
