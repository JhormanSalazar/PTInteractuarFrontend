import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppHttpError } from '../../../../core/models/problem-details.model';
import type { Solicitud } from '../../../../core/models/solicitud.model';
import { SolicitudesService } from '../../data/solicitudes.service';
import { CambiarEstadoDialog } from './cambiar-estado-dialog';

function crearSolicitud(overrides: Partial<Solicitud> = {}): Solicitud {
  return {
    id: 1,
    codigo: 'SOL-2026-0001',
    titulo: 'Impresora del piso 3 no imprime a color',
    descripcion: null,
    solicitanteNombre: 'Julián Restrepo',
    estado: 'PENDIENTE',
    prioridad: 'MEDIA',
    tecnico: null,
    tipoServicio: { id: 1, nombre: 'Mantenimiento Impresora' },
    fechaCreacion: '2026-09-07T04:00:00.000Z',
    fechaActualizacion: '2026-09-07T04:00:00.000Z',
    fechaLimite: null,
    notasCierre: null,
    ...overrides,
  };
}

describe('CambiarEstadoDialog', () => {
  let fixture: ComponentFixture<CambiarEstadoDialog>;
  let component: CambiarEstadoDialog;
  const dialogRefMock = { close: vi.fn() };
  const servicioMock = { cambiarEstado: vi.fn() };

  async function montar(solicitud: Solicitud) {
    dialogRefMock.close.mockReset();
    servicioMock.cambiarEstado.mockReset();
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CambiarEstadoDialog],
      providers: [
        { provide: DIALOG_DATA, useValue: solicitud },
        { provide: DialogRef, useValue: dialogRefMock },
        { provide: SolicitudesService, useValue: servicioMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CambiarEstadoDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('arranca con el estado actual seleccionado y el botón deshabilitado', async () => {
    await montar(crearSolicitud({ estado: 'PENDIENTE' }));

    expect(component['seleccionado']()).toBe('PENDIENTE');
    expect(component['sinCambios']()).toBe(true);
  });

  it('sin técnico asignado, bloquea ASIGNADA y EN_PROCESO', async () => {
    await montar(crearSolicitud({ tecnico: null }));

    expect(component['bloqueado']('ASIGNADA')).toBe(true);
    expect(component['bloqueado']('EN_PROCESO')).toBe(true);
    expect(component['bloqueado']('CANCELADA')).toBe(false);
    expect(component['bloqueado']('RESUELTA')).toBe(false);
  });

  it('con técnico asignado, no bloquea ningún estado', async () => {
    await montar(crearSolicitud({ tecnico: { id: 4, nombreCompleto: 'Laura Torres' } }));

    expect(component['bloqueado']('ASIGNADA')).toBe(false);
    expect(component['bloqueado']('EN_PROCESO')).toBe(false);
  });

  it('seleccionar un estado bloqueado no cambia la selección', async () => {
    await montar(crearSolicitud({ estado: 'PENDIENTE', tecnico: null }));

    component['seleccionar']('ASIGNADA');

    expect(component['seleccionado']()).toBe('PENDIENTE');
  });

  it('confirmar llama al servicio con el estado elegido y cierra el diálogo', async () => {
    const solicitud = crearSolicitud({ estado: 'PENDIENTE' });
    await montar(solicitud);
    servicioMock.cambiarEstado.mockResolvedValue(solicitud);

    component['seleccionar']('CANCELADA');
    await component['confirmar']();

    expect(servicioMock.cambiarEstado).toHaveBeenCalledWith(solicitud, 'CANCELADA');
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('un 409 del backend deja el diálogo abierto y muestra el motivo', async () => {
    const solicitud = crearSolicitud({ estado: 'PENDIENTE' });
    await montar(solicitud);
    servicioMock.cambiarEstado.mockRejectedValue(
      new AppHttpError(
        409,
        'Conflicto con el estado actual del recurso',
        'No se puede pasar a EN_PROCESO sin un técnico asignado.',
        undefined,
        undefined,
      ),
    );

    component['seleccionar']('RESUELTA');
    await component['confirmar']();

    expect(component['error']()).toBe('No se puede pasar a EN_PROCESO sin un técnico asignado.');
    expect(dialogRefMock.close).not.toHaveBeenCalled();
    expect(component['guardando']()).toBe(false);
  });

  it('no llama al servicio si no se cambió el estado', async () => {
    await montar(crearSolicitud({ estado: 'PENDIENTE' }));

    await component['confirmar']();

    expect(servicioMock.cambiarEstado).not.toHaveBeenCalled();
  });
});
