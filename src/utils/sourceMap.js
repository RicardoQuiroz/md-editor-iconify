/**
 * Helpers that translate a DOM node of the WYSIWYG preview back into the exact
 * character range of the Markdown source that produced it.
 *
 * The compiler (markdownCompiler.js) stamps every top level block with
 * data-src-start / data-src-end. Inline objects (images and icons) are located
 * by looking for their n-th occurrence inside the owning block.
 */

export const FOCUSABLE_SELECTOR = '[data-src-start], img, .icon-wrapper';

const IMAGE_RE = /!\[[^\]]*\]\([^)]*\)(?:\{[^}]*\})?/g;

/** Every selectable object of the preview, in document order. */
export function collectFocusableElements(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.tagName === 'HR') return false;
    if (el.tagName === 'IMG') return true;
    if (el.classList.contains('icon-wrapper')) return true;
    // Los reproductores son objetos aunque no tengan título visible
    if (el.classList.contains('media-embed')) return true;
    // Las imágenes dentro de un reproductor no cuentan por separado
    if (el.closest('.media-embed') && !el.classList.contains('media-embed')) return false;
    return (el.textContent || '').trim().length > 0;
  });
}

/** The owning top-level block (with its source range) for any preview node. */
export function getBlockRange(el, root) {
  if (!el || !root) return null;
  const holder = el.closest('[data-src-start]');
  if (!holder || !root.contains(holder)) return null;
  const start = Number(holder.getAttribute('data-src-start'));
  const end = Number(holder.getAttribute('data-src-end'));
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return { start, end, element: holder };
}

/** Source range of an <img> inside the preview. */
export function resolveImageRange(markdown, el, root) {
  const block = getBlockRange(el, root);
  if (!block) return null;

  const images = Array.from(block.element.querySelectorAll('img'));
  const position = Math.max(0, images.indexOf(el));
  const slice = markdown.slice(block.start, block.end);
  const matches = Array.from(slice.matchAll(IMAGE_RE));
  const match = matches[position] || matches[0];
  if (!match) return null;

  return {
    start: block.start + match.index,
    end: block.start + match.index + match[0].length,
    text: match[0]
  };
}

/** Source range of an icon shortcode (`:Name{...}:`) inside the preview. */
export function resolveIconRange(markdown, el, root) {
  const block = getBlockRange(el, root);
  if (!block) return null;

  const shortcode = decodeURIComponent(el.getAttribute('data-shortcode') || '');
  if (!shortcode) return null;

  const twins = Array.from(block.element.querySelectorAll('.icon-wrapper')).filter(
    (node) => decodeURIComponent(node.getAttribute('data-shortcode') || '') === shortcode
  );
  const position = Math.max(0, twins.indexOf(el));

  const slice = markdown.slice(block.start, block.end);
  let cursor = 0;
  let found = -1;
  for (let i = 0; i <= position; i++) {
    found = slice.indexOf(shortcode, cursor);
    if (found < 0) break;
    cursor = found + shortcode.length;
  }
  if (found < 0) return null;

  return {
    start: block.start + found,
    end: block.start + found + shortcode.length,
    text: shortcode
  };
}

/** Full descriptor (kind + source range + raw markdown) of a focused object. */
export function describeElement(markdown, el, root) {
  if (!el) return null;

  // Reproductor de audio/vídeo: el rango es la línea del enlace completa
  const mediaHolder = el.classList?.contains('media-embed') ? el : el.closest?.('.media-embed');
  if (mediaHolder) {
    const block = getBlockRange(mediaHolder, root);
    if (block) {
      return {
        kind: 'media',
        start: block.start,
        end: block.end,
        text: markdown.slice(block.start, block.end),
        mediaKind: mediaHolder.getAttribute('data-media-kind') || '',
        element: mediaHolder
      };
    }
  }

  // Los objetos en línea (iconos e imágenes) llevan además el rango del bloque
  // que los contiene: insertar un bloque nuevo detrás de un icono partiría el
  // párrafo por la mitad, así que quien inserte necesita saber dónde termina.
  const ownerBlock = getBlockRange(el, root);

  if (el.tagName === 'IMG') {
    const range = resolveImageRange(markdown, el, root);
    if (range) {
      return {
        kind: 'image',
        ...range,
        blockStart: ownerBlock?.start,
        blockEnd: ownerBlock?.end,
        element: el
      };
    }
  }

  if (el.classList && el.classList.contains('icon-wrapper')) {
    const range = resolveIconRange(markdown, el, root);
    if (range) {
      return {
        kind: 'icon',
        ...range,
        blockStart: ownerBlock?.start,
        blockEnd: ownerBlock?.end,
        element: el
      };
    }
  }

  if (!ownerBlock) return null;

  return {
    kind: 'text',
    start: ownerBlock.start,
    end: ownerBlock.end,
    blockStart: ownerBlock.start,
    blockEnd: ownerBlock.end,
    text: markdown.slice(ownerBlock.start, ownerBlock.end),
    element: el
  };
}

/** Replaces [start, end) of the document with `replacement`. */
export function replaceRange(markdown, range, replacement) {
  if (!range) return markdown;
  return markdown.slice(0, range.start) + replacement + markdown.slice(range.end);
}
