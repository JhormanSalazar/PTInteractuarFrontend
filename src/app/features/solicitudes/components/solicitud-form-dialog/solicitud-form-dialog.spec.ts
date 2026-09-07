import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { errorInterceptor } from '../../../../core/http/error.interceptor';
import { SolicitudFormDialog } from './solicitud-form-dialog';

describe('SolicitudFormDialog — validaciones', () => {
  let fixture: ComponentFixture<SolicitudFormDialog>;
  let component: SolicitudFormDialog;
  let httpMock: HttpTestingController;
  const dialogRefMock = { close: vi.fn() };

  beforeEach(async () => {
    dialogRefMock.close.mockReset();

    await TestBed.configureTestingModule({
      imports: [SolicitudFormDialog],
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: DialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SolicitudFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // CatalogosService.cargarSiHaceFalta() dispara estas dos peticiones en ngOnInit.
    httpMock.expectOne('/tecnicos').flush({ data: [] });
    httpMock.expectOne('/tipos-servicio').flush({ data: [] });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('el formulario arranca inválido (campos obligatorios vacíos)', () => {
    expect(component['form'].invalid).toBe(true);
  });

  it('título exige al menos 5 caracteres, igual que el backend', () => {
    const control = component['form'].controls.titulo;
    control.setValue('ab');
    expect(control.hasError('minlength')).toBe(true);
    control.setValue('Título válido');
    expect(control.hasError('minlength')).toBe(false);
  });

  it('solicitanteNombre exige al menos 3 caracteres', () => {
    const control = component['form'].controls.solicitanteNombre;
    control.setValue('X');
    expect(control.hasError('minlength')).toBe(true);
  });

  it('tipoServicioId es obligatorio', () => {
    const control = component['form'].controls.tipoServicioId;
    expect(control.hasError('required')).toBe(true);
    control.setValue(1);
    expect(control.valid).toBe(true);
  });

  it('es válido con datos completos y correctos', () => {
    component['form'].setValue({
      titulo: 'Título de prueba válido',
      descripcion: '',
      solicitanteNombre: 'Juan Pérez',
      tecnicoId: null,
      tipoServicioId: 1,
      prioridad: 'MEDIA',
      fechaLimite: '',
    });
    expect(component['form'].valid).toBe(true);
  });

  it('errorFor traduce los errores de Angular a mensajes en español (tras touched)', () => {
    const control = component['form'].controls.titulo;
    control.markAsTouched();
    control.setValue('');
    expect(component['errorFor']('titulo')).toBe('Este campo es obligatorio.');
  });

  it('un 422 del backend pinta el error sobre el campo correspondiente, no en un toast', async () => {
    component['form'].setValue({
      titulo: 'Título de prueba válido',
      descripcion: '',
      solicitanteNombre: 'Juan Pérez',
      tecnicoId: null,
      tipoServicioId: 999,
      prioridad: 'MEDIA',
      fechaLimite: '',
    });

    const guardarPromise = component['guardar']();
    const req = httpMock.expectOne('/solicitudes');
    req.flush(
      {
        type: 'https://api.local/errors/unprocessable-entity',
        title: 'La solicitud no se puede procesar',
        status: 422,
        errors: [{ field: 'tipoServicioId', message: 'No existe un tipo de servicio con ese id' }],
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await guardarPromise;

    expect(component['form'].controls.tipoServicioId.errors?.['server']).toBe(
      'No existe un tipo de servicio con ese id',
    );
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
