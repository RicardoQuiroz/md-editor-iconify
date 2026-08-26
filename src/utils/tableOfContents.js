/**
 * Extrae los encabezados de un documento Markdown conservando el offset exacto
 * de cada uno, para poder saltar tanto en el panel WYSIWYG como en el código
 * fuente reutilizando el mismo mecanismo de sincronización que usa Ctrl+Q.
 */

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const FENCE_RE = /^\s*(```|~~~)/;

/** Limpia la sintaxis Markdown del título para mostrarlo en el índice. */
export function cleanHeadingText(raw) {
  return raw
    // atajos de icono :Nombre{...}: y :Nombre:
    .replace(/:([a-zA-Z0-9_-]+)(?:\{[^}]*\})?:/g, '')
    // enlaces [texto](url) -> texto
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // imágenes
    .replace(/!\[[^\]]*\]\([^)]*\)(?:\{[^}]*\})?/g, '')
    // énfasis y código
    .replace(/[*_`~]+/g, '')
    // cierre opcional de encabezado (### Título ###)
    .replace(/\s+#+\s*$/, '')
    .trim();
}

/**
 * @returns {Array<{id, level, text, raw, start, end, index}>}
 */
export function extractHeadings(markdown) {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const headings = [];
  let offset = 0;
  let insideFence = false;

  lines.forEach((line, lineIndex) => {
    const lineStart = offset;
    offset += line.length + 1; // +1 por el salto de línea

    if (FENCE_RE.test(line)) {
      insideFence = !insideFence;
      return;
    }
    if (insideFence) return;

    const match = line.match(HEADING_RE);
    if (!match) return;

    const text = cleanHeadingText(match[2]);
    if (!text) return;

    headings.push({
      id: `toc-${lineIndex}-${headings.length}`,
      level: match[1].length,
      text,
      raw: line,
      start: lineStart,
      end: lineStart + line.length,
      lineIndex,
      index: headings.length
    });
  });

  return headings;
}

/** Encabezado que corresponde a una posición del documento (el más cercano por encima). */
export function findActiveHeading(headings, offset) {
  if (!headings.length || typeof offset !== 'number') return null;
  let active = null;
  for (const heading of headings) {
    if (heading.start <= offset) active = heading;
    else break;
  }
  return active;
}
