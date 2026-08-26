/**
 * POSICIÓN REAL DEL CURSOR DENTRO DE UN TEXTAREA
 *
 * Para centrar la línea seleccionada hace falta saber a qué altura en píxeles
 * está. El cálculo evidente —número de línea x alto de línea— es incorrecto en
 * cuanto el texto se ajusta: un párrafo largo ocupa varias filas en pantalla
 * pero es una sola línea lógica. En un documento con párrafos, ese cálculo se
 * queda muy corto, el navegador corrige por su cuenta y la selección acaba
 * pegada al borde inferior.
 *
 * La medición fiable consiste en clonar la tipografía y el ancho del textarea
 * en un elemento oculto, escribir en él el texto que precede al cursor y
 * preguntar por la posición del marcador. El navegador aplica exactamente el
 * mismo ajuste de línea, así que la altura coincide.
 */

/** Propiedades que deben coincidir para que el ajuste de línea sea idéntico. */
const PROPIEDADES_ESPEJO = [
  'boxSizing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'fontVariant',
  'letterSpacing',
  'lineHeight',
  'textTransform',
  'textIndent',
  'wordSpacing',
  'tabSize'
];

/** Alto de línea en píxeles, con reserva si el valor calculado es "normal". */
export function lineHeightOf(element) {
  const estilo = window.getComputedStyle(element);
  const alto = parseFloat(estilo.lineHeight);
  if (!Number.isNaN(alto) && alto > 0) return alto;
  const tamano = parseFloat(estilo.fontSize) || 16;
  return tamano * 1.4;
}

/**
 * Altura en píxeles, dentro del contenido desplazable, del carácter que ocupa
 * la posición `index`.
 */
export function caretOffsetTop(textarea, index) {
  if (!textarea) return 0;

  const estilo = window.getComputedStyle(textarea);
  const espejo = document.createElement('div');

  for (const propiedad of PROPIEDADES_ESPEJO) {
    espejo.style[propiedad] = estilo[propiedad];
  }

  // clientWidth = contenido + relleno, que es justo lo que ocupa el texto
  espejo.style.width = `${textarea.clientWidth}px`;
  espejo.style.position = 'absolute';
  espejo.style.top = '0';
  espejo.style.left = '-9999px';
  espejo.style.visibility = 'hidden';
  espejo.style.height = 'auto';
  espejo.style.overflow = 'hidden';
  espejo.style.whiteSpace = 'pre-wrap';
  espejo.style.overflowWrap = 'break-word';
  espejo.style.wordBreak = 'normal';

  const posicion = Math.max(0, Math.min(index, textarea.value.length));
  espejo.textContent = textarea.value.slice(0, posicion);

  const marcador = document.createElement('span');
  // Algo de texto detrás para que el marcador no colapse al final de una fila
  marcador.textContent = textarea.value.slice(posicion) || '.';
  espejo.appendChild(marcador);

  document.body.appendChild(espejo);
  const alto = marcador.offsetTop;
  document.body.removeChild(espejo);

  return alto;
}

/**
 * Desplaza el textarea para que la posición indicada quede centrada
 * verticalmente, igual que hace `scrollIntoView({ block: 'center' })` en el
 * panel de vista previa. Así el objeto aparece en la misma fila de la pantalla
 * al alternar entre las dos vistas.
 */
export function scrollCaretToCenter(textarea, index) {
  if (!textarea) return;

  const alto = caretOffsetTop(textarea, index);
  const altoLinea = lineHeightOf(textarea);
  const objetivo = alto - textarea.clientHeight / 2 + altoLinea / 2;
  const maximo = Math.max(0, textarea.scrollHeight - textarea.clientHeight);

  textarea.scrollTop = Math.max(0, Math.min(objetivo, maximo));
}
