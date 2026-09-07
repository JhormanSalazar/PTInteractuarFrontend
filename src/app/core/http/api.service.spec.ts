import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getSolicitudes arma los query params de filtros, paginación y orden', () => {
    service
      .getSolicitudes({ page: 2, pageSize: 5, q: 'impresora', estado: 'PENDIENTE', sort: 'titulo:asc' })
      .subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/solicitudes' &&
        r.params.get('page') === '2' &&
        r.params.get('pageSize') === '5' &&
        r.params.get('q') === 'impresora' &&
        r.params.get('estado') === 'PENDIENTE' &&
        r.params.get('sort') === 'titulo:asc',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], meta: { page: 2, pageSize: 5, total: 0, totalPages: 0 } });
  });

  it('getSolicitudes omite los filtros no provistos', () => {
    service.getSolicitudes({ page: 1, pageSize: 10, sort: 'fechaCreacion:desc' }).subscribe();
    const req = httpMock.expectOne('/solicitudes?page=1&pageSize=10&sort=fechaCreacion:desc');
    expect(req.request.params.has('q')).toBe(false);
    expect(req.request.params.has('estado')).toBe(false);
    req.flush({ data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
  });

  it('createSolicitud hace POST a /solicitudes con el payload completo', () => {
    const payload = {
      titulo: 'Impresora dañada',
      descripcion: null,
      solicitanteNombre: 'Ana Ríos',
      tecnicoId: null,
      tipoServicioId: 1,
      prioridad: 'MEDIA' as const,
      fechaLimite: null,
    };
    service.createSolicitud(payload).subscribe();
    const req = httpMock.expectOne('/solicitudes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('updateSolicitud hace PUT a /solicitudes/:id', () => {
    service
      .updateSolicitud(7, {
        titulo: 'x',
        descripcion: null,
        solicitanteNombre: 'y',
        tecnicoId: null,
        tipoServicioId: 1,
        prioridad: 'BAJA',
        fechaLimite: null,
      })
      .subscribe();
    const req = httpMock.expectOne('/solicitudes/7');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('deleteSolicitud hace DELETE a /solicitudes/:id', () => {
    service.deleteSolicitud(7).subscribe();
    const req = httpMock.expectOne('/solicitudes/7');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getHealth hace GET a /health', () => {
    service.getHealth().subscribe();
    const req = httpMock.expectOne('/health');
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'ok', database: 'ok', timestamp: new Date().toISOString() });
  });
});
