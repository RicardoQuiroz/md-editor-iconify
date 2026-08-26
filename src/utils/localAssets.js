/**
 * ARCHIVOS LOCALES DE LA SESIÓN
 *
 * Cuando eliges una imagen o un audio del disco, en el documento se escribe
 * únicamente su ruta relativa (`./foto.png`). Eso mantiene el Markdown pequeño
 * y portable, pero el navegador no puede resolver esa ruta: la página se sirve
 * desde otro origen, no desde la carpeta del documento.
 *
 * La solución es este registro. El archivo elegido se guarda en memoria con un
 * enlace temporal (blob) y la vista previa lo usa para mostrarlo. El enlace
 * vive solo durante la sesión; el documento nunca lo contiene.
 *
 *     Markdown   ->  ![Diagrama](./diagrama.png)      38 caracteres
 *     Vista      ->  blob:http://localhost/8f3a-…     solo en memoria
 */

/** ruta normalizada -> { url, name, size, type } */
const registry = new Map();

/** Quita "./", "../" y las barras invertidas de Windows. */
export function normalizeAssetPath(path) {
  if (!path) return '';
  return String(path)
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .trim();
}

/** ¿Es una dirección remota o incrustada, en vez de una ruta local? */
export function isRemoteSource(src) {
  return /^(https?:)?\/\//i.test(src || '') || /^(data|blob):/i.test(src || '');
}

/** Nombre libre dentro del registro: foto.png, foto-2.png, foto-3.png… */
function uniquePath(name) {
  const limpio = normalizeAssetPath(name) || 'archivo';
  if (!registry.has(limpio)) return limpio;

  const punto = limpio.lastIndexOf('.');
  const base = punto === -1 ? limpio : limpio.slice(0, punto);
  const ext = punto === -1 ? '' : limpio.slice(punto);

  let n = 2;
  while (registry.has(`${base}-${n}${ext}`)) n += 1;
  return `${base}-${n}${ext}`;
}

/**
 * Registra un archivo del disco y devuelve la ruta relativa que debe escribirse
 * en el documento.
 *
 * @param {File|Blob} file
 * @param {string} [name]  Nombre a usar; por defecto el del propio archivo.
 * @returns {string} ruta relativa lista para el Markdown, con "./" delante
 */
export function registerLocalAsset(file, name) {
  if (!file) return '';

  const nombre = name || file.name || 'archivo';
  const ruta = uniquePath(nombre);

  registry.set(ruta, {
    url: URL.createObjectURL(file),
    name: nombre,
    size: file.size ?? 0,
    type: file.type ?? ''
  });

  return `./${ruta}`;
}

/** Enlace temporal de una ruta local, o null si no está registrada. */
export function resolveLocalAsset(path) {
  if (!path || isRemoteSource(path)) return null;
  const entrada = registry.get(normalizeAssetPath(path));
  return entrada ? entrada.url : null;
}

/**
 * Dirección que debe usar la vista previa: el enlace temporal si el archivo
 * está registrado en esta sesión, y si no la ruta tal cual.
 */
export function resolveForPreview(src) {
  return resolveLocalAsset(src) || src;
}

/** ¿Hay archivo cargado para esta ruta? */
export function hasLocalAsset(path) {
  return resolveLocalAsset(path) !== null;
}

/**
 * Marcador para una imagen que no se puede mostrar.
 *
 * Se devuelve como un SVG en línea, de modo que el elemento del documento sigue
 * siendo un `<img>` de verdad: se selecciona con las flechas, se enmarca en
 * azul, abre su ventana de configuración con Ctrl+Enter y se redimensiona con
 * los cuatro manejadores de esquina, exactamente igual que una imagen visible.
 *
 * Este SVG vive solo en el DOM de la vista previa; el documento nunca lo
 * contiene.
 */
export function placeholderImage(path) {
  const nombre = (normalizeAssetPath(path) || 'imagen').split('/').pop();
  const recortado = nombre.length > 42 ? `${nombre.slice(0, 39)}…` : nombre;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 260" width="420" height="260">
  <rect x="3" y="3" width="414" height="254" rx="12"
        fill="#38BDF8" fill-opacity="0.10"
        stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="10 7"/>
  <g transform="translate(210 96)" fill="none" stroke="#38BDF8" stroke-width="3"
     stroke-linecap="round" stroke-linejoin="round">
    <rect x="-26" y="-22" width="52" height="44" rx="5"/>
    <circle cx="-10" cy="-7" r="5"/>
    <path d="M26 12 L6 -6 L-26 22"/>
  </g>
  <text x="210" y="168" text-anchor="middle"
        font-family="Segoe UI, system-ui, sans-serif" font-size="19" font-weight="600"
        fill="#38BDF8">${escapeXml(recortado)}</text>
  <text x="210" y="196" text-anchor="middle"
        font-family="Segoe UI, system-ui, sans-serif" font-size="14"
        fill="#38BDF8" fill-opacity="0.75">Archivo no cargado en esta sesión</text>
  <text x="210" y="218" text-anchor="middle"
        font-family="Segoe UI, system-ui, sans-serif" font-size="12.5"
        fill="#38BDF8" fill-opacity="0.6">Clic para seleccionar · arrastra las esquinas para redimensionar</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Solo para pruebas y para liberar memoria al cerrar documentos. */
export function clearLocalAssets() {
  for (const entrada of registry.values()) {
    try {
      URL.revokeObjectURL(entrada.url);
    } catch (err) {
      /* el navegador ya lo liberó */
    }
  }
  registry.clear();
}
