import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import type { Solicitud } from '../../../core/models/solicitud.model';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { ErrorState } from '../../../shared/ui/empty-state/error-state';
import { TableSkeleton } from '../../../shared/ui/skeleton/table-skeleton';
import { ConfirmarEliminarDialog } from '../components/confirmar-eliminar-dialog/confirmar-eliminar-dialog';
import { SolicitudesFiltros } from '../components/solicitudes-filtros/solicitudes-filtros';
import { SolicitudFormDialog, type SolicitudFormDialogData } from '../components/solicitud-form-dialog/solicitud-form-dialog';
import { SolicitudesTabla } from '../components/solicitudes-tabla/solicitudes-tabla';
import { SolicitudesService } from '../data/solicitudes.service';

@Component({
  selector: 'app-solicitudes-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SolicitudesFiltros, SolicitudesTabla, TableSkeleton, EmptyState, ErrorState],
  templateUrl: './solicitudes-list.page.html',
  styleUrl: './solicitudes-list.page.css',
})
export class SolicitudesListPage implements OnInit {
  protected readonly solicitudesService = inject(SolicitudesService);
  private readonly dialog = inject(Dialog);

  ngOnInit(): void {
    this.solicitudesService.cargar();
  }

  protected reintentar(): void {
    this.solicitudesService.cargar();
  }

  protected paginaAnterior(): void {
    const meta = this.solicitudesService.meta();
    if (meta.page > 1) this.solicitudesService.cambiarPagina(meta.page - 1);
  }

  protected paginaSiguiente(): void {
    const meta = this.solicitudesService.meta();
    if (meta.page < meta.totalPages) this.solicitudesService.cambiarPagina(meta.page + 1);
  }

  protected abrirCrear(): void {
    if (this.hayDialogoAbierto()) return;
    this.dialog.open<'saved' | undefined, SolicitudFormDialogData>(SolicitudFormDialog, {
      data: { mode: 'create' },
      panelClass: 'dialog-panel',
      ariaLabelledBy: 'solicitud-dialog-title',
    });
  }

  protected abrirEditar(solicitud: Solicitud): void {
    if (this.hayDialogoAbierto()) return;
    this.dialog.open<'saved' | undefined, SolicitudFormDialogData>(SolicitudFormDialog, {
      data: { mode: 'edit', solicitud },
      panelClass: 'dialog-panel',
      ariaLabelledBy: 'solicitud-dialog-title',
    });
  }

  protected abrirEliminar(solicitud: Solicitud): void {
    if (this.hayDialogoAbierto()) return;
    this.dialog.open<boolean, Solicitud>(ConfirmarEliminarDialog, {
      data: solicitud,
      panelClass: 'dialog-panel',
      ariaLabelledBy: 'confirmar-eliminar-title',
    });
  }

  /**
   * Guarda contra una condicion de carrera real de CDK Dialog: al reabrir un
   * dialogo del mismo tipo justo despues de cerrar el anterior con Escape, la
   * restauracion de foco del cierre anterior puede resolverse DESPUES del
   * autofocus del nuevo dialogo y devolver el foco al boton disparador (fuera
   * del dialogo) en vez de dejarlo dentro. Si en ese instante se presiona
   * Enter, el click "fantasma" sobre el boton de la fila vuelve a abrir un
   * segundo dialogo encima del primero. Se reprodujo con Playwright
   * (crear → editar → eliminar-cancelar-con-Escape → eliminar de nuevo) y se
   * corrige aqui, no parcheando CDK: simplemente no se abre un dialogo nuevo
   * si ya hay uno registrado.
   */
  private hayDialogoAbierto(): boolean {
    return this.dialog.openDialogs.length > 0;
  }
}
