import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Iconos de Lucide (https://lucide.dev, licencia ISC) embebidos como trazados.
 *
 * Por que no se instala el paquete `lucide-angular`: su version mas reciente
 * (1.0.0) declara como peer dependency "@angular/core": "13.x - 21.x" y este
 * proyecto va en Angular 22. Instalarlo obligaria a `npm install
 * --legacy-peer-deps`, lo que rompe el arranque documentado en el README
 * ("clonar, npm install, npm start") por una dependencia que aqui solo aporta
 * seis iconos.
 *
 * Se toman entonces los trazados de Lucide tal cual —mismo lenguaje visual,
 * misma rejilla de 24x24 y mismo grosor de trazo— en un componente propio de
 * treinta lineas, sin dependencia, sin conflicto de peers y sin sumar peso al
 * bundle mas alla de los iconos que realmente se usan.
 *
 * Para agregar uno nuevo: copiar los atributos `d` de su SVG en lucide.dev y
 * anadirlos aqui. Solo se usan iconos hechos de <path> para que el componente
 * no tenga que soportar mas formas.
 */
const TRAZADOS = {
  plus: ['M5 12h14', 'M12 5v14'],
  pencil: [
    'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
    'm15 5 4 4',
  ],
  'trash-2': [
    'M3 6h18',
    'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
    'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    'M10 11v6',
    'M14 11v6',
  ],
  'refresh-cw': [
    'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8',
    'M21 3v5h-5',
    'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16',
    'M8 16H3v5',
  ],
  'triangle-alert': [
    'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
    'M12 9v4',
    'M12 17h.01',
  ],
  x: ['M18 6 6 18', 'm6 6 12 12'],
} as const;

export type NombreIcono = keyof typeof TRAZADOS;

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @for (d of trazados(); track d) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      /* El icono hereda el color del texto del boton que lo contiene, asi que
         los estados :hover/:disabled del boton lo arrastran sin CSS extra. */
      color: inherit;
      flex-shrink: 0;
    }
  `,
})
export class Icon {
  readonly name = input.required<NombreIcono>();
  readonly size = input(16);
  readonly strokeWidth = input(2);

  protected readonly trazados = computed<readonly string[]>(() => TRAZADOS[this.name()]);
}
