import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Solicitud } from '../../../../core/models/solicitud.model';
import { SolicitudesTabla } from './solicitudes-tabla';

const SOLICITUD: Solicitud = {
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
};

describe('SolicitudesTabla — acciones por fila', () => {
  let fixture: ComponentFixture<SolicitudesTabla>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [SolicitudesTabla] }).compileComponents();
    fixture = TestBed.createComponent(SolicitudesTabla);
    fixture.componentRef.setInput('solicitudes', [SOLICITUD]);
    fixture.detectChanges();
  });

  function botones(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.celda-acciones button'));
  }

  it('la columna de acciones tiene cabecera visible', () => {
    const cabeceras = (
      Array.from(fixture.nativeElement.querySelectorAll('thead th')) as HTMLElement[]
    ).map((th) => th.textContent?.trim());

    expect(cabeceras).toContain('Acciones');
  });

  it('cada fila ofrece cambiar estado, editar y eliminar', () => {
    expect(botones()).toHaveLength(3);
  });

  it('los botones son solo icono pero conservan nombre accesible y tooltip', () => {
    for (const boton of botones()) {
      expect(boton.getAttribute('aria-label')).toBeTruthy();
      expect(boton.getAttribute('title')).toBeTruthy();
      // Sin texto visible: lo que se ve es el SVG del icono.
      expect(boton.textContent?.trim()).toBe('');
      expect(boton.querySelector('svg')).toBeTruthy();
    }
  });

  it('cada botón emite su evento con la solicitud de la fila', () => {
    const emitidos: string[] = [];
    fixture.componentInstance.cambiarEstado.subscribe(() => emitidos.push('cambiarEstado'));
    fixture.componentInstance.editar.subscribe(() => emitidos.push('editar'));
    fixture.componentInstance.eliminar.subscribe(() => emitidos.push('eliminar'));

    for (const boton of botones()) boton.click();

    expect(emitidos).toEqual(['cambiarEstado', 'editar', 'eliminar']);
  });
});
