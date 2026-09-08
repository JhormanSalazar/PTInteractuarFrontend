import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { AppHttpError } from '../../../core/models/problem-details.model';
import { ToastService } from '../../../core/services/toast.service';
import { SolicitudesService } from '../../../features/solicitudes/data/solicitudes.service';
import { ConfirmarDialog, type ConfirmarDialogData } from '../confirmar-dialog/confirmar-dialog';

/**
 * Pie discreto del entorno de demostracion con el boton que restaura los datos
 * de ejemplo. Existe porque quien evalua la prueba va a borrar solicitudes
 * probando el CRUD, y la siguiente persona que abra el enlace no puede
 * encontrarse una tabla vacia.
 *
 * Si el backend corre con DEMO_MODE=false la ruta no existe y responde 404; en
 * ese caso el pie se oculta en vez de dejar un boton que siempre falla.
 */
@Component({
  selector: 'app-demo-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <footer class="demo-footer">
        <span>Entorno de demostración con datos ficticios.</span>
        <button
          type="button"
          class="demo-footer-boton"
          [disabled]="restaurando()"
          (click)="abrirConfirmacion()"
        >
          @if (restaurando()) {
            Restaurando…
          } @else {
            Restaurar datos de ejemplo
          }
        </button>
      </footer>
    }
  `,
  styleUrl: './demo-footer.css',
})
export class DemoFooter {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(Dialog);
  private readonly toasts = inject(ToastService);
  private readonly solicitudesService = inject(SolicitudesService);

  protected readonly visible = signal(true);
  protected readonly restaurando = signal(false);

  protected abrirConfirmacion(): void {
    const ref = this.dialog.open<boolean, ConfirmarDialogData>(ConfirmarDialog, {
      data: {
        titulo: 'Restaurar datos de ejemplo',
        mensaje:
          'Se borrarán todas las solicitudes actuales y se volverá a cargar el conjunto de datos de demostración.',
        advertencia: 'Esta acción no se puede deshacer.',
        textoConfirmar: 'Restaurar',
        varianteConfirmar: 'btn-danger',
      },
      panelClass: 'dialog-panel',
      ariaLabelledBy: 'confirmar-dialog-title',
    });

    ref.closed.subscribe((confirmado) => {
      if (confirmado) void this.restaurar();
    });
  }

  private async restaurar(): Promise<void> {
    this.restaurando.set(true);
    try {
      const resultado = await firstValueFrom(this.api.resetDemo());
      this.solicitudesService.cargar();
      this.toasts.success(
        `Datos de ejemplo restaurados: ${resultado.solicitudes} solicitudes, ${resultado.tecnicos} técnicos.`,
      );
    } catch (error) {
      if (error instanceof AppHttpError && error.status === 404) {
        // El backend no tiene la demo activa: no tiene sentido seguir
        // mostrando un boton que nunca va a funcionar.
        this.visible.set(false);
        return;
      }
      this.toasts.error(
        error instanceof AppHttpError
          ? error.friendlyMessage
          : 'No se pudieron restaurar los datos de ejemplo.',
      );
    } finally {
      this.restaurando.set(false);
    }
  }
}
