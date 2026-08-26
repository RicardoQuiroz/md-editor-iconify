/**
 * CAMBIO DE MAYÚSCULAS Y MINÚSCULAS
 *
 * El punto delicado: transformar el Markdown en bruto sin romperlo.
 * Pasar a mayúsculas un párrafo entero convertiría `:Shield:` en `:SHIELD:`
 * (icono roto) y `](https://ejemplo.com/a.png)` en una URL inválida.
 *
 * Por eso se calculan primero los tramos intocables y la transformación solo
 * se aplica al texto visible que queda entre ellos.
 */

const LOCALE = 'es';

/** Tramos que nunca se transforman. */
const PROTECTED_PATTERNS = [
  /`+[^`]*`+/g, // código en línea
  /:[a-zA-Z0-9_-]+(?:\{[^}]*\})?:/g, // atajos de icono
  /\]\([^)]*\)(?:\{[^}]*\})?/g, // destino de enlaces e imágenes (el texto sí se transforma)
  /<[^>\s][^>]*>/g, // etiquetas HTML y autoenlaces
  /\bhttps?:\/\/\S+/gi, // URLs desnudas
  /^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+[.)]\s+)/gm // marcadores de bloque al inicio de línea
];

function protectedRanges(text) {
  const ranges = [];

  for (const pattern of PROTECTED_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[0].length === 0) {
        pattern.lastIndex += 1;
        continue;
      }
      ranges.push([match.index, match.index + match[0].length]);
    }
  }

  ranges.sort((a, b) => a[0] - b[0]);

  const merged = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}

/**
 * Aplica `fn` solo al texto visible, dejando intacta la sintaxis.
 *
 * `fn` recibe un objeto `estado` que se conserva entre tramos. Lo necesita
 * «Tipo oración»: sin él reiniciaría la frase después de cada trozo de código
 * o cada enlace, y capitalizaría palabras en mitad de una oración.
 */
export function transformPreservingSyntax(text, fn) {
  if (!text) return text;

  const protegidos = protectedRanges(text);
  const estado = {};
  let resultado = '';
  let cursor = 0;

  for (const [inicio, fin] of protegidos) {
    if (inicio > cursor) resultado += fn(text.slice(cursor, inicio), estado);
    resultado += text.slice(inicio, fin);
    cursor = fin;
  }
  resultado += fn(text.slice(cursor), estado);

  return resultado;
}

/* ------------------------------------------------------------------ *
 * Transformaciones
 * ------------------------------------------------------------------ */

const toUpper = (s) => s.toLocaleUpperCase(LOCALE);
const toLower = (s) => s.toLocaleLowerCase(LOCALE);

/** Primera letra de cada palabra en mayúscula. */
function titleCase(text) {
  return text.replace(/\p{L}[\p{L}\p{M}'’-]*/gu, (palabra) =>
    toUpper(palabra.charAt(0)) + toLower(palabra.slice(1))
  );
}

/**
 * Primera letra de cada frase en mayúscula, el resto en minúscula.
 * Usa `estado` para no reiniciar la frase al cruzar un tramo protegido.
 */
function sentenceCase(text, estado = {}) {
  if (estado.empezandoFrase === undefined) estado.empezandoFrase = true;

  return Array.from(toLower(text))
    .map((caracter) => {
      if (/[.!?¡¿…]/.test(caracter)) {
        estado.empezandoFrase = true;
        return caracter;
      }
      if (estado.empezandoFrase && /\p{L}/u.test(caracter)) {
        estado.empezandoFrase = false;
        return toUpper(caracter);
      }
      return caracter;
    })
    .join('');
}

/** Invierte cada letra: MAYÚS a minús y viceversa. */
function invertCase(text) {
  return Array.from(text)
    .map((caracter) => {
      const arriba = toUpper(caracter);
      const abajo = toLower(caracter);
      if (arriba === abajo) return caracter;
      return caracter === arriba ? abajo : arriba;
    })
    .join('');
}

/** Convierte a identificador con guiones, útil para anclas y nombres de archivo. */
function kebabCase(text) {
  return toLower(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita los acentos separados por NFD
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Catálogo de transformaciones.
 * `preservaSintaxis: false` significa que actúa sobre el texto completo,
 * porque el resultado ya no pretende seguir siendo Markdown con formato.
 */
export const CASE_TRANSFORMS = [
  {
    id: 'upper',
    nombre: 'MAYÚSCULAS',
    descripcion: 'Todo en mayúsculas',
    ejemplo: 'TEXTO DE EJEMPLO',
    apply: (t) => transformPreservingSyntax(t, toUpper)
  },
  {
    id: 'lower',
    nombre: 'minúsculas',
    descripcion: 'Todo en minúsculas',
    ejemplo: 'texto de ejemplo',
    apply: (t) => transformPreservingSyntax(t, toLower)
  },
  {
    id: 'sentence',
    nombre: 'Tipo oración',
    descripcion: 'Mayúscula tras cada punto',
    ejemplo: 'Texto de ejemplo. Otra frase.',
    apply: (t) => transformPreservingSyntax(t, sentenceCase)
  },
  {
    id: 'title',
    nombre: 'Cada Palabra En Mayúscula',
    descripcion: 'Inicial de cada palabra',
    ejemplo: 'Texto De Ejemplo',
    apply: (t) => transformPreservingSyntax(t, titleCase)
  },
  {
    id: 'invert',
    nombre: 'iNVERTIDO',
    descripcion: 'Intercambia mayúsculas y minúsculas',
    ejemplo: 'tEXTO DE EJEMPLO',
    apply: (t) => transformPreservingSyntax(t, invertCase)
  },
  {
    id: 'kebab',
    nombre: 'texto-con-guiones',
    descripcion: 'Para anclas y nombres de archivo (quita acentos y símbolos)',
    ejemplo: 'texto-de-ejemplo',
    apply: (t) => kebabCase(t.replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+[.)]\s+)/, ''))
  }
];

export function applyCaseTransform(id, text) {
  const transform = CASE_TRANSFORMS.find((t) => t.id === id);
  return transform ? transform.apply(text) : text;
}
