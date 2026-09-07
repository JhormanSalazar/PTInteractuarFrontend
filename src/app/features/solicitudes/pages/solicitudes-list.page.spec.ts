import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Solicitud } from '../../../core/models/solicitud.model';
import { SolicitudesService } from '../data/solicitudes.service';
import { SolicitudesListPage } from './solicitudes-list.page';

function crearSolicitudesServiceFake(overrides: Record<string, unknown> = {}) {
  return {
    status: signal('idle'),
    solicitudes: signal<Solicitud[]>([]),
    meta: signal({ page: 1, pageSize: 10, total: 0, totalPages: 1 }),
    errorMessage: signal<string | null>(null),
    isEmpty: signal(false),
    cargar: vi.fn(),
    cambiarPagina: vi.fn(),
    actualizarFiltros: vi.fn(),
    filtros: signal({ sort: 'fechaCreacion:desc', page: 1, pageSize: 10 }),
    ...overrides,
  };
}

async function crearFixture(
  fake: ReturnType<typeof crearSolicitudesServiceFake>,
): Promise<ComponentFixture<SolicitudesListPage>> {
  await TestBed.configureTestingModule({
    imports: [SolicitudesListPage],
    providers: [{ provide: SolicitudesService, useValue: fake }],
  }).compileComponents();

  const fixture = TestBed.createComponent(SolicitudesListPage);
  fixture.detectChanges();
  return fixture;
}

describe('SolicitudesListPage — los cuatro estados visuales', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('muestra el skeleton mientras status() es "loading"', async () => {
    const fixture = await crearFixture(crearSolicitudesServiceFake({ status: signal('loading') }));
    expect(fixture.nativeElement.querySelector('app-table-skeleton')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });

  it('muestra el estado de error con el mensaje y un botón de reintentar', async () => {
    const fixture = await crearFixture(
      crearSolicitudesServiceFake({
        status: signal('error'),
        errorMessage: signal('No se pudo conectar con el servidor'),
      }),
    );
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('No se pudo conectar con el servidor');
    expect(texto).toContain('Reintentar');
  });

  it('muestra el estado vacío cuando la carga tuvo éxito pero no hay resultados', async () => {
    const fixture = await crearFixture(
      crearSolicitudesServiceFake({ status: signal('success'), isEmpty: signal(true) }),
    );
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('No hay solicitudes');
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });

  it('muestra la tabla con datos cuando la carga tuvo éxito', async () => {
    const solicitud: Solicitud = {
      id: 1,
      codigo: 'SOL-2026-0001',
      titulo: 'Impresora dañada',
      descripcion: null,
      solicitanteNombre: 'Ana Ríos',
      estado: 'PENDIENTE',
      prioridad: 'ALTA',
      tecnico: null,
      tipoServicio: { id: 1, nombre: 'Mantenimiento Impresora' },
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      fechaLimite: null,
      notasCierre: null,
    };
    const fixture = await crearFixture(
      crearSolicitudesServiceFake({
        status: signal('success'),
        isEmpty: signal(false),
        solicitudes: signal([solicitud]),
      }),
    );
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('SOL-2026-0001');
    expect(texto).toContain('Impresora dañada');
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
  });
});
