import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import type { Solicitud } from '../../../../core/models/solicitud.model';
import { Icon } from '../../../../shared/ui/icon/icon';
import { forzarFocoInicialDialog } from '../../../../shared/utils/forzar-foco-dialog';
import { SolicitudesService } from '../../data/solicitudes.service';

@Component({
  selector: 'app-confirmar-eliminar-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './confirmar-eliminar-dialog.html',
})
export class ConfirmarEliminarDialog implements AfterViewInit {
  protected readonly solicitud = inject<Solicitud>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<boolean>);
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly eliminando = signal(false);

  ngAfterViewInit(): void {
    forzarFocoInicialDialog(this.elementRef.nativeElement);
  }

  protected cancelar(): void {
    this.dialogRef.close(false);
  }

  protected async confirmar(): Promise<void> {
    this.eliminando.set(true);
    try {
      await this.solicitudesService.eliminar(this.solicitud);
      this.dialogRef.close(true);
    } catch {
      // El toast de error ya lo muestra SolicitudesService.eliminar(); el
      // modal se queda abierto para que el usuario pueda reintentar o cancelar.
      this.eliminando.set(false);
    }
  }
}
