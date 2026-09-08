import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
import { forzarFocoInicialDialog } from '../../utils/forzar-foco-dialog';

export interface ConfirmarDialogData {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  /** Clase del boton de confirmacion: 'btn-primary' o 'btn-danger'. */
  varianteConfirmar?: 'btn-primary' | 'btn-danger';
}

/**
 * Confirmacion generica de si/no. A diferencia de ConfirmarEliminarDialog, no
 * ejecuta la accion: solo cierra con true o false y deja que quien lo abrio
 * decida. Se usa para el reseteo de la demo, que no pertenece al feature de
 * solicitudes.
 */
@Component({
  selector: 'app-confirmar-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirmar-dialog.html',
})
export class ConfirmarDialog implements AfterViewInit {
  protected readonly data = inject<ConfirmarDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<boolean>);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    forzarFocoInicialDialog(this.elementRef.nativeElement);
  }

  protected cerrar(confirmado: boolean): void {
    this.dialogRef.close(confirmado);
  }
}
