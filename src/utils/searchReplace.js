/**
 * BÚSQUEDA Y REEMPLAZO
 *
 * Trabaja sobre el texto Markdown en bruto, no sobre el HTML renderizado: así
 * los rangos que devuelve se pueden reutilizar tal cual con el mismo mecanismo
 * de sincronización que usa Ctrl+Q para saltar al bloque o seleccionar la línea.
 */

const MAX_MATCHES = 5000;

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Construye la expresión de búsqueda.
 * @returns {{ regex: RegExp|null, error: string }}
 */
export function buildMatcher(query, { caseSensitive = false, wholeWord = false, useRegex = false } = {}) {
  if (!query) return { regex: null, error: '' };

  let source = useRegex ? query : escapeRegExp(query);
  if (wholeWord) {
    // \b no funciona con acentos: se usan delimitadores por propiedad Unicode
    source = `(?<![\\p{L}\\p{N}_])(?:${source})(?![\\p{L}\\p{N}_])`;
  }

  const flags = `gu${caseSensitive ? '' : 'i'}`;
  try {
    return { regex: new RegExp(source, flags), error: '' };
  } catch (err) {
    // Algunos patrones válidos fallan con la bandera Unicode: se reintenta sin ella
    try {
      return { regex: new RegExp(source, flags.replace('u', '')), error: '' };
    } catch (err2) {
      return { regex: null, error: err2.message || 'Expresión no válida' };
    }
  }
}

/** Todas las coincidencias, con su rango exacto en el documento. */
export function findMatches(text, regex) {
  const matches = [];
  if (!regex || !text) return matches;

  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length, text: match[0] });
    // Un patrón que casa cadena vacía colgaría el bucle
    if (match[0].length === 0) regex.lastIndex += 1;
    if (matches.length >= MAX_MATCHES) break;
  }
  return matches;
}

/**
 * Sustituye UNA coincidencia.
 * En modo expresión regular se respetan las referencias $1, $2… del reemplazo.
 */
export function replaceOne(text, match, replacement, { regex, useRegex } = {}) {
  if (!match) return text;

  let resultado = replacement;
  if (useRegex && regex) {
    const single = new RegExp(regex.source, regex.flags.replace('g', ''));
    resultado = match.text.replace(single, replacement);
  }

  return text.slice(0, match.start) + resultado + text.slice(match.end);
}

/**
 * Sustituye TODAS las coincidencias.
 * @returns {{ text: string, count: number }}
 */
export function replaceAll(text, regex, replacement, { useRegex = false } = {}) {
  if (!regex || !text) return { text, count: 0 };

  const count = findMatches(text, regex).length;
  if (count === 0) return { text, count: 0 };

  regex.lastIndex = 0;
  // Sin expresión regular, el reemplazo se pasa como función para que un "$&"
  // literal escrito por el usuario no lo interprete String.replace
  const resultado = useRegex ? text.replace(regex, replacement) : text.replace(regex, () => replacement);

  return { text: resultado, count };
}

/** Índice de la primera coincidencia en o después de `offset` (cíclico). */
export function matchIndexAfter(matches, offset) {
  if (matches.length === 0) return -1;
  const found = matches.findIndex((m) => m.start >= offset);
  return found === -1 ? 0 : found;
}

/** Número de línea (base 1) donde empieza una posición del documento. */
export function lineNumberAt(text, offset) {
  if (!text) return 1;
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}
