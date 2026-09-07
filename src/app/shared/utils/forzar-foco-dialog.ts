const SELECTOR_FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * CDK Dialog mueve el foco al primer elemento tabulable al abrir
 * (autoFocus: 'first-tabbable', el default), pero se observo con Playwright
 * una condicion de carrera real: si un dialogo del MISMO tipo se reabre muy
 * poco despues de cerrar el anterior con Escape, el restore-focus del cierre
 * anterior puede resolverse DESPUES del autofocus del nuevo dialogo y
 * devolver el foco al boton disparador (fuera del dialogo) en vez de
 * dejarlo dentro. Si en ese instante se presiona Enter, se dispara un click
 * "fantasma" sobre el elemento de la pagina que quedo debajo.
 *
 * Este helper reafirma el foco despues de que la vista del dialogo esta
 * lista, en un setTimeout(0): como los timers se ejecutan en el orden en que
 * se encolan, si ya hay un restore-focus pendiente del dialogo anterior
 * corre primero, y esta reafirmacion corre despues y gana.
 */
export function forzarFocoInicialDialog(host: HTMLElement): void {
  setTimeout(() => {
    if (host.contains(document.activeElement)) return;
    host.querySelector<HTMLElement>(SELECTOR_FOCUSABLE)?.focus();
  });
}
