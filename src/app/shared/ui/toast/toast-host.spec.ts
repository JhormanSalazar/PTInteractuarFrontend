import { TestBed } from '@angular/core/testing';
import { ToastService } from '../../../core/services/toast.service';
import { ToastHost } from './toast-host';

describe('ToastHost', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [ToastHost] }).compileComponents();
  });

  it('el botón de cerrar usa el icono, no un carácter de texto', () => {
    TestBed.inject(ToastService).success('Solicitud creada correctamente.');

    const fixture = TestBed.createComponent(ToastHost);
    fixture.detectChanges();

    const cerrar = fixture.nativeElement.querySelector('.toast-close') as HTMLButtonElement;

    expect(cerrar).toBeTruthy();
    expect(cerrar.querySelector('svg')).toBeTruthy();
    // Sin texto propio: si alguien vuelve a poner una "✕" literal, esto falla.
    expect(cerrar.textContent?.trim()).toBe('');
    expect(cerrar.getAttribute('aria-label')).toBe('Cerrar aviso');
  });

  it('descarta el aviso al pulsar cerrar', () => {
    const toasts = TestBed.inject(ToastService);
    toasts.success('Solicitud creada correctamente.');

    const fixture = TestBed.createComponent(ToastHost);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.toast-close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(toasts.toasts()).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.toast')).toBeNull();
  });
});
