import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
} from '@angular/core';
import { Icon } from '../icon/icon';
import { forzarFocoInicialDialog } from '../../utils/forzar-foco-dialog';

export interface ConfirmarDialogData {
  titulo: string;
  mensaje: string;
  /** Frase corta y destacada para lo irreversible. Opcional. */
  advertencia?: string;
  textoConfirmar: string;
  /** Clase del boton de confirmacion: 'btn-primary' o 'btn-danger'. */
  varianteConfirmar?: 'btn-primary' | 'btn-danger';
}

/**
 * Confirmacion generica de si/no. A diferencia de ConfirmarEliminarDialog, no
 * ejecuta la accion: solo cierra con true o false y deja que quien lo abrio
 * decida. Se usa para el reseteo de la demo, que no pertenece al feature de
 * solicitudes.
 *
 * Comparte el diseno centrado (icono, titulo y descripcion en columna) con el
 * dialogo de eliminar: las dos son confirmaciones destructivas y deben leerse
 * igual, para que el usuario reconozca el patron sin tener que releerlo.
 */
@Component({
  selector: 'app-confirmar-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './confirmar-dialog.html',
})
export class ConfirmarDialog implements AfterViewInit {
  protected readonly data = inject<ConfirmarDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<boolean>);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly variante = computed(() => this.data.varianteConfirmar ?? 'btn-primary');
  protected readonly esPeligro = computed(() => this.variante() === 'btn-danger');

  ngAfterViewInit(): void {
    forzarFocoInicialDialog(this.elementRef.nativeElement);
  }

  protected cerrar(confirmado: boolean): void {
    this.dialogRef.close(confirmado);
  }
}
