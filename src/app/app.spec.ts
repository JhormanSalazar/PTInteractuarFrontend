import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea y dispara el ping de calentamiento a /health en segundo plano', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const req = httpMock.expectOne('/health');
    req.flush({ status: 'ok', database: 'ok', timestamp: new Date().toISOString() });

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no se rompe si el ping de /health falla', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const req = httpMock.expectOne('/health');
    req.flush('backend caído', { status: 503, statusText: 'Service Unavailable' });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
