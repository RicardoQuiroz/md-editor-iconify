/**
 * INCRUSTACIÓN DE AUDIO Y VÍDEO
 *
 * Convención deliberada: **no se inventa sintaxis**. Una línea que contiene
 * únicamente un enlace a un medio se convierte en reproductor.
 *
 *     https://ejemplo.com/podcast.mp3
 *     [Clase 3 — Introducción](https://youtu.be/dQw4w9WgXcQ)
 *
 * El Markdown resultante es estándar, así que:
 *   · aquí y en la exportación .html  -> reproductor incrustado
 *   · en GitHub (que elimina audio, vídeo e iframes) -> enlace clicable
 *   · en Moodle -> su filtro Multimedia lo convierte en reproductor solo
 *   · en cualquier otro lector -> enlace clicable
 *
 * Nunca aparece texto residual en ningún destino.
 */

import { resolveForPreview, hasLocalAsset } from './localAssets';

const AUDIO_EXT = /\.(mp3|ogg|oga|wav|m4a|aac|flac|opus|weba)$/i;
const VIDEO_EXT = /\.(mp4|webm|ogv|mov|m4v)$/i;

const YOUTUBE_PATTERNS = [
  /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/i,
  /^(?:https?:\/\/)?youtu\.be\/([\w-]{11})/i,
  /^(?:https?:\/\/)?(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/i,
  /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{11})/i,
  /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([\w-]{11})/i
];

const VIMEO_PATTERN = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)(?:\/([\w]+))?/i;

/** Escapa un valor para meterlo dentro de un atributo HTML. */
function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Segundos de inicio en enlaces de YouTube (?t=90, &start=90, ?t=1m30s). */
function parseStartSeconds(url) {
  const match = url.match(/[?&](?:t|start)=([\dhms]+)/i);
  if (!match) return 0;
  const raw = match[1];
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  const parts = raw.match(/(\d+)h|(\d+)m|(\d+)s/gi) || [];
  return parts.reduce((total, part) => {
    const n = parseInt(part, 10);
    if (/h$/i.test(part)) return total + n * 3600;
    if (/m$/i.test(part)) return total + n * 60;
    return total + n;
  }, 0);
}

/** Nombre de archivo legible a partir de una URL, para usarlo como título. */
export function fileNameFromUrl(url) {
  try {
    const clean = String(url).split(/[?#]/)[0];
    const name = clean.substring(clean.lastIndexOf('/') + 1);
    return decodeURIComponent(name) || url;
  } catch (err) {
    return url;
  }
}

/** Clasifica una URL. Devuelve null si no es un medio reproducible. */
export function classifyMediaUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return { kind: 'youtube', id: match[1], start: parseStartSeconds(trimmed) };
    }
  }

  const vimeo = trimmed.match(VIMEO_PATTERN);
  if (vimeo) {
    return { kind: 'vimeo', id: vimeo[1], hash: vimeo[2] || '' };
  }

  const path = trimmed.split(/[?#]/)[0];
  if (AUDIO_EXT.test(path)) return { kind: 'audio' };
  if (VIDEO_EXT.test(path)) return { kind: 'video' };

  return null;
}

/**
 * Analiza una línea suelta de Markdown.
 * Reconoce una URL desnuda o un enlace `[título](url)` que ocupe la línea entera.
 *
 * @returns {null | { kind, url, title, id, start, hash, isRemote }}
 */
export function parseMediaLine(rawLine) {
  if (!rawLine) return null;
  const line = String(rawLine).trim();
  if (!line || line.includes('\n')) return null;

  let title = '';
  let url = '';

  const linkMatch = line.match(/^\[([^\]]*)\]\(\s*<?([^)\s>]+)>?\s*(?:"[^"]*")?\s*\)$/);
  if (linkMatch) {
    title = linkMatch[1].trim();
    url = linkMatch[2].trim();
  } else if (!/\s/.test(line)) {
    url = line.replace(/^<|>$/g, '');
  } else {
    return null;
  }

  const info = classifyMediaUrl(url);
  if (!info) return null;

  return {
    ...info,
    url,
    title,
    isRemote: /^(https?:)?\/\//i.test(url) || /^data:/i.test(url)
  };
}

/** Etiqueta legible del tipo de medio, para la interfaz. */
export function mediaKindLabel(kind) {
  switch (kind) {
    case 'audio':
      return 'Audio';
    case 'video':
      return 'Vídeo';
    case 'youtube':
      return 'YouTube';
    case 'vimeo':
      return 'Vimeo';
    default:
      return 'Medio';
  }
}

/** URL del reproductor incrustado para servicios externos. */
export function embedUrl(media) {
  if (media.kind === 'youtube') {
    const params = new URLSearchParams({ rel: '0', modestbranding: '1' });
    if (media.start) params.set('start', String(media.start));
    return `https://www.youtube-nocookie.com/embed/${media.id}?${params.toString()}`;
  }
  if (media.kind === 'vimeo') {
    const suffix = media.hash ? `?h=${media.hash}` : '';
    return `https://player.vimeo.com/video/${media.id}${suffix}`;
  }
  return media.url;
}

/**
 * Genera el HTML del reproductor.
 *
 * Los estilos esenciales van en línea además de por clase, para que la
 * exportación .html se vea bien aunque no lleve la hoja de estilos de la app.
 */
export function renderMediaHtml(media, { srcStart, srcEnd } = {}) {
  if (!media) return '';

  const range =
    srcStart != null && srcEnd != null
      ? ` data-src-start="${srcStart}" data-src-end="${srcEnd}"`
      : '';

  const caption = media.title || fileNameFromUrl(media.url);
  const safeCaption = escapeText(caption);

  // Un archivo local elegido en esta sesión se reproduce con su enlace
  // temporal; el documento sigue guardando solo la ruta relativa.
  const cargadoEnSesion = !media.isRemote && hasLocalAsset(media.url);
  const safeUrl = escapeAttribute(resolveForPreview(media.url));
  const safeOriginal = escapeAttribute(media.url);
  const localClass = media.isRemote || cargadoEnSesion ? '' : ' media-local';

  const figcaption = `<figcaption class="media-caption">${safeCaption}${
    media.isRemote || cargadoEnSesion
      ? ''
      : ' <span class="media-local-hint">(ruta local: se reproduce al abrir el documento junto al archivo)</span>'
  }</figcaption>`;

  if (media.kind === 'audio') {
    return (
      `<figure class="media-embed media-audio${localClass}"${range} data-media-kind="audio" data-media-url="${safeOriginal}" style="margin:1.4rem 0;">` +
      `<audio controls preload="metadata" src="${safeUrl}" style="width:100%;">` +
      `Tu navegador no puede reproducir este audio. <a href="${safeUrl}">Descargarlo</a>.` +
      `</audio>${figcaption}</figure>`
    );
  }

  if (media.kind === 'video') {
    return (
      `<figure class="media-embed media-video${localClass}"${range} data-media-kind="video" data-media-url="${safeOriginal}" style="margin:1.4rem 0;">` +
      `<video controls preload="metadata" src="${safeUrl}" style="width:100%; max-width:100%; border-radius:10px; background:#000;">` +
      `Tu navegador no puede reproducir este vídeo. <a href="${safeUrl}">Descargarlo</a>.` +
      `</video>${figcaption}</figure>`
    );
  }

  // YouTube y Vimeo: iframe con proporción 16:9 mantenida
  const frame = embedUrl(media);
  return (
    `<figure class="media-embed media-${media.kind}"${range} data-media-kind="${media.kind}" data-media-url="${safeOriginal}" style="margin:1.4rem 0;">` +
    `<div class="media-frame" style="position:relative; width:100%; aspect-ratio:16/9; border-radius:10px; overflow:hidden; background:#000;">` +
    `<iframe src="${escapeAttribute(frame)}" title="${escapeAttribute(caption)}" loading="lazy" ` +
    `allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ` +
    `style="position:absolute; inset:0; width:100%; height:100%; border:0;"></iframe>` +
    `</div>${figcaption}</figure>`
  );
}
