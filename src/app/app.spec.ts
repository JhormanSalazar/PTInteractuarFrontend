import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../environments/environment';
import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/health`).flush({
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
    });

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the health status once the backend responds', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpMock.expectOne(`${environment.apiUrl}/health`).flush({
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('PT Interactuar');
    expect(compiled.querySelector('.ok')?.textContent).toContain('ok');
  });
});
