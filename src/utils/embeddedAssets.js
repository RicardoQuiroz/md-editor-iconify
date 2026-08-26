/**
 * IMÁGENES INCRUSTADAS EN BASE64
 *
 * Detecta imágenes que estén escritas dentro del propio Markdown como
 * `data:image/png;base64,…` y permite extraerlas a un archivo real,
 * sustituyéndolas por su ruta relativa.
 *
 * Una foto de 300 KB ocupa unos 400.000 caracteres codificada así, todos en una
 * sola línea, lo que hace el documento imposible de leer, comparar o versionar.
 */

/** `![alt](data:image/png;base64,…){atributos}` */
const EMBEDDED_MARKDOWN = /!\[([^\]]*)\]\(\s*(data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+))\s*\)(\{[^}]*\})?/g;

/** Un `data:image/...;base64,…` suelto, sin sintaxis de imagen alrededor. */
const EMBEDDED_BARE = /(?<!\()data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]{40,})/g;

const EXT_POR_MIME = {
  png: 'png',
  jpeg: 'jpg',
  jpg: 'jpg',
  gif: 'gif',
  webp: 'webp',
  'svg+xml': 'svg',
  bmp: 'bmp',
  avif: 'avif'
};

/** Tamaño real en bytes de una cadena base64. */
export function base64Bytes(base64) {
  if (!base64) return 0;
  const relleno = (base64.match(/=+$/) || [''])[0].length;
  return Math.floor((base64.length * 3) / 4) - relleno;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Encuentra todas las imágenes incrustadas.
 * @returns {Array<{start,end,alt,mime,ext,base64,attrs,chars,bytes,esSuelta}>}
 */
export function findEmbeddedImages(markdown) {
  if (!markdown) return [];

  const encontradas = [];
  const ocupado = [];

  EMBEDDED_MARKDOWN.lastIndex = 0;
  let match;
  while ((match = EMBEDDED_MARKDOWN.exec(markdown)) !== null) {
    const [completo, alt, , subtipo, base64, attrs] = match;
    encontradas.push({
      start: match.index,
      end: match.index + completo.length,
      alt: alt || '',
      mime: `image/${subtipo}`,
      ext: EXT_POR_MIME[subtipo.toLowerCase()] || 'png',
      base64,
      attrs: attrs || '',
      chars: completo.length,
      bytes: base64Bytes(base64),
      esSuelta: false
    });
    ocupado.push([match.index, match.index + completo.length]);
  }

  EMBEDDED_BARE.lastIndex = 0;
  while ((match = EMBEDDED_BARE.exec(markdown)) !== null) {
    const dentroDeOtra = ocupado.some(([a, b]) => match.index >= a && match.index < b);
    if (dentroDeOtra) continue;

    const [completo, subtipo, base64] = match;
    encontradas.push({
      start: match.index,
      end: match.index + completo.length,
      alt: '',
      mime: `image/${subtipo}`,
      ext: EXT_POR_MIME[subtipo.toLowerCase()] || 'png',
      base64,
      attrs: '',
      chars: completo.length,
      bytes: base64Bytes(base64),
      esSuelta: true
    });
  }

  return encontradas.sort((a, b) => a.start - b.start);
}

/** Resumen para el aviso: cuántas hay, cuánto ocupan y qué parte del archivo son. */
export function summarizeEmbedded(markdown) {
  const imagenes = findEmbeddedImages(markdown);
  const chars = imagenes.reduce((total, img) => total + img.chars, 0);
  const total = markdown ? markdown.length : 0;

  return {
    imagenes,
    cuantas: imagenes.length,
    chars,
    bytes: imagenes.reduce((t, img) => t + img.bytes, 0),
    porcentaje: total > 0 ? Math.round((chars / total) * 100) : 0
  };
}

/** Convierte el base64 en un Blob descargable o escribible. */
export function base64ToBlob(base64, mime) {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return new Blob([bytes], { type: mime || 'application/octet-stream' });
}

/** Nombre propuesto para el archivo extraído. */
export function suggestFileName(imagen, indice) {
  const base = (imagen.alt || `imagen-${indice + 1}`)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || `imagen-${indice + 1}`}.${imagen.ext}`;
}

/**
 * Sustituye una imagen incrustada por su versión enlazada.
 * Se aplican de atrás hacia delante para que los rangos no se desplacen.
 */
export function replaceEmbedded(markdown, imagen, rutaRelativa) {
  const alt = imagen.alt || 'Imagen';
  const attrs = imagen.attrs || '';
  const reemplazo = `![${alt}](${rutaRelativa})${attrs}`;
  return markdown.slice(0, imagen.start) + reemplazo + markdown.slice(imagen.end);
}
