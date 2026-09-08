import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ETIQUETAS_ESTADO } from '../../../../core/models/etiquetas';
import { AppHttpError } from '../../../../core/models/problem-details.model';
import type { Estado, Solicitud } from '../../../../core/models/solicitud.model';
import { ESTADOS } from '../../../../core/models/solicitud.model';
import { Icon } from '../../../../shared/ui/icon/icon';
import { forzarFocoInicialDialog } from '../../../../shared/utils/forzar-foco-dialog';
import { SolicitudesService } from '../../data/solicitudes.service';

/** Estados que el backend no permite sin un técnico asignado. */
const REQUIEREN_TECNICO: readonly Estado[] = ['ASIGNADA', 'EN_PROCESO'];

@Component({
  selector: 'app-cambiar-estado-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './cambiar-estado-dialog.html',
  styleUrl: './cambiar-estado-dialog.css',
})
export class CambiarEstadoDialog implements AfterViewInit {
  protected readonly solicitud = inject<Solicitud>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<boolean>);
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly estados = ESTADOS;
  protected readonly etiqueta = (e: Estado) => ETIQUETAS_ESTADO[e];

  protected readonly seleccionado = signal<Estado>(this.solicitud.estado);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly tieneTecnico = this.solicitud.tecnico !== null;

  /**
   * Los estados que exigen técnico se deshabilitan cuando la solicitud no lo
   * tiene. El backend responde 409 en ese caso y esa validación sigue siendo
   * la que manda —aquí no se replica la regla, se refleja— pero dejar el botón
   * pulsable para luego rechazarlo es una trampa: es mejor mostrar desde el
   * principio por qué no se puede y qué hay que hacer antes.
   */
  protected readonly bloqueado = (estado: Estado): boolean =>
    !this.tieneTecnico && REQUIEREN_TECNICO.includes(estado);

  protected readonly sinCambios = computed(() => this.seleccionado() === this.solicitud.estado);

  ngAfterViewInit(): void {
    forzarFocoInicialDialog(this.elementRef.nativeElement);
  }

  protected seleccionar(estado: Estado): void {
    if (this.bloqueado(estado)) return;
    this.error.set(null);
    this.seleccionado.set(estado);
  }

  protected cancelar(): void {
    this.dialogRef.close(false);
  }

  protected async confirmar(): Promise<void> {
    if (this.sinCambios() || this.guardando()) return;

    this.guardando.set(true);
    this.error.set(null);
    try {
      await this.solicitudesService.cambiarEstado(this.solicitud, this.seleccionado());
      this.dialogRef.close(true);
    } catch (err) {
      // El modal se queda abierto: si el backend rechaza el cambio (409 por la
      // regla del técnico), el usuario necesita leer el motivo con la
      // selección todavía a la vista para poder corregirla.
      this.error.set(
        err instanceof AppHttpError ? err.friendlyMessage : 'No se pudo cambiar el estado.',
      );
      this.guardando.set(false);
    }
  }
}
