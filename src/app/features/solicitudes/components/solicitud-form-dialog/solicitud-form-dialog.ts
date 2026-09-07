import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampoFormulario } from '../../../../shared/ui/campo-formulario/campo-formulario';
import { forzarFocoInicialDialog } from '../../../../shared/utils/forzar-foco-dialog';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { AppHttpError } from '../../../../core/models/problem-details.model';
import type { Prioridad, Solicitud } from '../../../../core/models/solicitud.model';
import { PRIORIDADES } from '../../../../core/models/solicitud.model';
import { SolicitudesService } from '../../data/solicitudes.service';

export type SolicitudFormDialogData = { mode: 'create' } | { mode: 'edit'; solicitud: Solicitud };

const ETIQUETAS_PRIORIDAD: Record<Prioridad, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

@Component({
  selector: 'app-solicitud-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CampoFormulario],
  templateUrl: './solicitud-form-dialog.html',
  styleUrl: './solicitud-form-dialog.css',
})
export class SolicitudFormDialog implements OnInit, AfterViewInit {
  protected readonly data = inject<SolicitudFormDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<'saved' | undefined>);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly catalogos = inject(CatalogosService);

  protected readonly prioridades = PRIORIDADES;
  protected readonly etiquetaPrioridad = (p: Prioridad) => ETIQUETAS_PRIORIDAD[p];
  protected readonly guardando = signal(false);
  protected readonly erroresGenerales = signal<string | null>(null);

  protected readonly esEdicion = this.data.mode === 'edit';
  protected readonly titulo = this.esEdicion
    ? `Editar solicitud ${(this.data as { solicitud: Solicitud }).solicitud.codigo}`
    : 'Nueva solicitud';

  protected readonly form = this.fb.group({
    titulo: this.fb.control('', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]),
    descripcion: this.fb.control(''),
    solicitanteNombre: this.fb.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(120),
    ]),
    tecnicoId: this.fb.control<number | null>(null),
    tipoServicioId: this.fb.control<number | null>(null, [Validators.required]),
    prioridad: this.fb.control<Prioridad>('MEDIA', [Validators.required]),
    fechaLimite: this.fb.control(''),
  });

  ngOnInit(): void {
    this.catalogos.cargarSiHaceFalta();

    if (this.data.mode === 'edit') {
      const s = this.data.solicitud;
      this.form.patchValue({
        titulo: s.titulo,
        descripcion: s.descripcion ?? '',
        solicitanteNombre: s.solicitanteNombre,
        tecnicoId: s.tecnico?.id ?? null,
        tipoServicioId: s.tipoServicio.id,
        prioridad: s.prioridad,
        fechaLimite: isoToDatetimeLocal(s.fechaLimite),
      });
    }
  }

  ngAfterViewInit(): void {
    forzarFocoInicialDialog(this.elementRef.nativeElement);
  }

  protected errorFor(name: keyof typeof this.form.controls): string | undefined {
    const control = this.form.get(name);
    if (!control || !control.touched || !control.errors) return undefined;
    const errors = control.errors;
    if (errors['server']) return errors['server'] as string;
    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['minlength']) {
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
    }
    if (errors['maxlength']) {
      return `No puede superar los ${errors['maxlength'].requiredLength} caracteres.`;
    }
    return 'Valor inválido.';
  }

  protected cancelar(): void {
    this.dialogRef.close(undefined);
  }

  protected async guardar(): Promise<void> {
    if (this.form.invalid || this.guardando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.erroresGenerales.set(null);

    const valor = this.form.getRawValue();
    const payload = {
      titulo: valor.titulo.trim(),
      descripcion: valor.descripcion.trim() || null,
      solicitanteNombre: valor.solicitanteNombre.trim(),
      tecnicoId: valor.tecnicoId,
      tipoServicioId: valor.tipoServicioId!,
      prioridad: valor.prioridad,
      fechaLimite: datetimeLocalToIso(valor.fechaLimite),
    };

    try {
      if (this.data.mode === 'edit') {
        await this.solicitudesService.actualizar(this.data.solicitud.id, payload);
      } else {
        await this.solicitudesService.crear(payload);
      }
      this.dialogRef.close('saved');
    } catch (err) {
      this.aplicarError(err);
    } finally {
      this.guardando.set(false);
    }
  }

  private aplicarError(err: unknown): void {
    if (err instanceof AppHttpError && err.fieldErrors?.length) {
      this.form.markAllAsTouched();
      for (const fieldError of err.fieldErrors) {
        const control = this.form.get(fieldError.field);
        if (control) {
          control.setErrors({ ...control.errors, server: fieldError.message });
        } else {
          // Error de campo que el backend reporta pero que no tiene control propio
          // en este formulario (por ejemplo una llave no reconocida): se muestra general.
          this.erroresGenerales.set(fieldError.message);
        }
      }
      return;
    }

    this.erroresGenerales.set(
      err instanceof AppHttpError ? err.friendlyMessage : 'Ocurrió un error inesperado al guardar.',
    );
  }
}
