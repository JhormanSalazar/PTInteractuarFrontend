import { Dialog } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ApiService } from '../../../core/http/api.service';
import { AppHttpError } from '../../../core/models/problem-details.model';
import { ToastService } from '../../../core/services/toast.service';
import { SolicitudesService } from '../../../features/solicitudes/data/solicitudes.service';
import { DemoFooter } from './demo-footer';

const RESPUESTA_OK = {
  mensaje: 'Datos de demostración restaurados.',
  tecnicos: 5,
  tiposServicio: 6,
  solicitudes: 17,
};

function configurar(confirmado: boolean, resetDemo: () => unknown) {
  const cargar = vi.fn();
  const success = vi.fn();
  const error = vi.fn();

  TestBed.configureTestingModule({
    imports: [DemoFooter],
    providers: [
      { provide: ApiService, useValue: { resetDemo } },
      { provide: SolicitudesService, useValue: { cargar } },
      { provide: ToastService, useValue: { success, error } },
      { provide: Dialog, useValue: { open: () => ({ closed: of(confirmado) }) } },
    ],
  });

  const fixture = TestBed.createComponent(DemoFooter);
  fixture.detectChanges();
  return { fixture, cargar, success, error };
}

function boton(fixture: ReturnType<typeof configurar>['fixture']): HTMLButtonElement | null {
  return fixture.nativeElement.querySelector('.demo-footer-boton');
}

describe('DemoFooter', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('restaura los datos, recarga el listado y muestra un toast de éxito', async () => {
    const resetDemo = vi.fn(() => of(RESPUESTA_OK));
    const { fixture, cargar, success } = configurar(true, resetDemo);

    boton(fixture)!.click();
    await fixture.whenStable();

    expect(resetDemo).toHaveBeenCalledOnce();
    expect(cargar).toHaveBeenCalledOnce();
    expect(success).toHaveBeenCalledOnce();
  });

  it('no llama al backend si se cancela la confirmación', async () => {
    const resetDemo = vi.fn(() => of(RESPUESTA_OK));
    const { fixture } = configurar(false, resetDemo);

    boton(fixture)!.click();
    await fixture.whenStable();

    expect(resetDemo).not.toHaveBeenCalled();
  });

  it('oculta el pie si el backend responde 404 (DEMO_MODE desactivado)', async () => {
    const resetDemo = vi.fn(() =>
      throwError(() => new AppHttpError(404, 'Recurso no encontrado', undefined, undefined, undefined)),
    );
    const { fixture, error } = configurar(true, resetDemo);

    boton(fixture)!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(boton(fixture)).toBeNull();
    expect(error).not.toHaveBeenCalled();
  });

  it('muestra un toast de error si el reseteo falla por otra razón', async () => {
    const resetDemo = vi.fn(() =>
      throwError(() => new AppHttpError(429, 'Demasiadas peticiones', 'Intenta más tarde.', undefined, undefined)),
    );
    const { fixture, error } = configurar(true, resetDemo);

    boton(fixture)!.click();
    await fixture.whenStable();

    expect(error).toHaveBeenCalledWith('Intenta más tarde.');
  });
});
