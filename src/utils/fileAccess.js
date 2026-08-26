/**
 * ACCESO A ARCHIVOS DEL DISCO
 *
 * Dos caminos, elegidos automáticamente:
 *
 * 1. File System Access API (Chrome, Edge, Opera)
 *    - El selector recuerda la carpeta gracias al parámetro `id`, así que las
 *      aperturas siguientes empiezan donde acabó la anterior, incluso tras
 *      cerrar el navegador. Además se le pasa `startIn` con el último archivo
 *      abierto de la sesión, que fija la carpeta con más precisión.
 *    - Devuelve un manejador del archivo real, lo que permite guardar encima
 *      del original en vez de descargar una copia.
 *
 * 2. Respaldo con <input type="file"> (Firefox, Safari)
 *    - Funciona igual para abrir, pero el navegador decide la carpeta inicial
 *      y no entrega manejador, así que guardar sigue siendo descargar.
 *
 * Nota: los navegadores no exponen la ruta absoluta de un archivo por motivos
 * de privacidad. Se puede volver a la misma carpeta, pero no mostrarla escrita.
 */

/** Identificador del selector. El navegador recuerda una carpeta por cada id. */
const PICKER_ID = 'iconify-md-documentos';

const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdx', '.txt', '.text'];

const PICKER_TYPES = [
  {
    description: 'Documentos Markdown y texto',
    accept: {
      'text/markdown': ['.md', '.markdown', '.mdx'],
      'text/plain': ['.txt', '.text']
    }
  }
];

/** ¿Puede este navegador abrir y escribir archivos directamente? */
export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' && typeof window.showOpenFilePicker === 'function';
}

export function isSavePickerSupported() {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';
}

/** ¿El nombre corresponde a un documento de texto que sepamos abrir? */
export function isMarkdownFileName(name = '') {
  const lower = String(name).toLowerCase();
  return MARKDOWN_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** El usuario canceló el diálogo: no es un error que haya que mostrar. */
function isAbort(error) {
  return error && (error.name === 'AbortError' || error.code === 20);
}

async function readHandle(handle) {
  const file = await handle.getFile();
  return {
    name: file.name,
    content: await file.text(),
    handle,
    // Se guardan para detectar después si el archivo cambió fuera del editor
    size: file.size ?? 0,
    lastModified: file.lastModified ?? 0
  };
}

async function readPlainFile(file) {
  return {
    name: file.name,
    content: await file.text(),
    handle: null,
    size: file.size ?? 0,
    lastModified: file.lastModified ?? 0
  };
}

/** Datos actuales del archivo en disco, para comparar con lo que se abrió. */
export async function statHandle(handle) {
  if (!handle || typeof handle.getFile !== 'function') return null;
  try {
    const file = await handle.getFile();
    return { size: file.size ?? 0, lastModified: file.lastModified ?? 0 };
  } catch (error) {
    return null;
  }
}

/**
 * Abre el selector de archivos.
 *
 * @param {FileSystemFileHandle|null} startInHandle  Último archivo abierto; el
 *        selector se sitúa en su misma carpeta.
 * @returns {Promise<Array<{name, content, handle}>>}  Vacío si se cancela.
 */
export async function openMarkdownFiles(startInHandle = null) {
  if (isFileSystemAccessSupported()) {
    try {
      const options = {
        id: PICKER_ID,
        multiple: true,
        types: PICKER_TYPES,
        excludeAcceptAllOption: false
      };
      // Un manejador de archivo sitúa el diálogo en la carpeta que lo contiene
      if (startInHandle) options.startIn = startInHandle;

      const handles = await window.showOpenFilePicker(options);
      return await Promise.all(handles.map(readHandle));
    } catch (error) {
      if (isAbort(error)) return [];
      // Permisos denegados o contexto no seguro: se intenta con el respaldo
      console.warn('Selector nativo no disponible, usando respaldo:', error);
    }
  }

  return openWithFallbackInput();
}

/** Respaldo universal: un <input type="file"> creado al vuelo. */
export function openWithFallbackInput() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = MARKDOWN_EXTENSIONS.join(',');
    input.multiple = true;
    input.style.display = 'none';

    let resolved = false;
    const finish = async (files) => {
      if (resolved) return;
      resolved = true;
      input.remove();
      resolve(await Promise.all(Array.from(files || []).map(readPlainFile)));
    };

    input.addEventListener('change', () => finish(input.files));
    // Si el usuario cancela, el evento 'cancel' llega en navegadores modernos
    input.addEventListener('cancel', () => finish([]));

    document.body.appendChild(input);
    input.click();
  });
}

/**
 * Lee lo que se acaba de soltar sobre la ventana.
 *
 * Importante: `dataTransfer` deja de ser válido en cuanto se hace `await`, así
 * que primero se recogen las referencias de forma síncrona y luego se leen.
 */
export function collectDroppedFiles(dataTransfer) {
  if (!dataTransfer) return Promise.resolve([]);

  const items = Array.from(dataTransfer.items || []);
  const canUseHandles = items.some((item) => typeof item.getAsFileSystemHandle === 'function');

  if (canUseHandles) {
    // Recogida síncrona de las promesas, antes de cualquier await
    const pending = items
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFileSystemHandle());
    return resolveDroppedHandles(pending);
  }

  const files = Array.from(dataTransfer.files || []).filter((file) => isMarkdownFileName(file.name));
  return Promise.all(files.map(readPlainFile));
}

async function resolveDroppedHandles(pending) {
  const handles = (await Promise.all(pending.map((p) => p.catch(() => null)))).filter(Boolean);
  const results = [];

  for (const handle of handles) {
    try {
      if (handle.kind === 'directory') {
        // Una carpeta soltada abre los documentos que contiene (sin recursión)
        for await (const entry of handle.values()) {
          if (entry.kind === 'file' && isMarkdownFileName(entry.name)) {
            results.push(await readHandle(entry));
          }
        }
      } else if (isMarkdownFileName(handle.name)) {
        results.push(await readHandle(handle));
      }
    } catch (error) {
      console.warn('No se pudo leer un elemento soltado:', error);
    }
  }

  return results;
}

/**
 * Comprueba (y pide) permiso de LECTURA.
 * Un manejador recuperado del historial suele volver en estado "prompt" tras
 * reiniciar el navegador, así que hay que pedirlo desde un gesto del usuario.
 */
export async function ensureReadPermission(handle) {
  if (!handle || typeof handle.queryPermission !== 'function') return false;
  const options = { mode: 'read' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  try {
    return (await handle.requestPermission(options)) === 'granted';
  } catch (error) {
    return false;
  }
}

/** Comprueba (y pide, si hace falta) permiso de escritura sobre un archivo. */
export async function ensureWritePermission(handle) {
  if (!handle || typeof handle.queryPermission !== 'function') return false;
  const options = { mode: 'readwrite' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  try {
    return (await handle.requestPermission(options)) === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * Escribe el contenido en el archivo original.
 * @returns {Promise<boolean>} false si no hay manejador o se denegó el permiso.
 */
export async function writeToHandle(handle, content) {
  if (!handle || typeof handle.createWritable !== 'function') return false;
  if (!(await ensureWritePermission(handle))) return false;

  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
  return true;
}

/**
 * Diálogo «Guardar como». Devuelve el manejador nuevo, o null si se cancela
 * o el navegador no lo admite.
 */
export async function pickSaveHandle(suggestedName, startInHandle = null) {
  if (!isSavePickerSupported()) return null;
  try {
    const options = {
      id: PICKER_ID,
      suggestedName: suggestedName || 'documento.md',
      types: PICKER_TYPES
    };
    if (startInHandle) options.startIn = startInHandle;
    return await window.showSaveFilePicker(options);
  } catch (error) {
    if (!isAbort(error)) console.warn('No se pudo abrir el diálogo de guardado:', error);
    return null;
  }
}

/** Descarga clásica: una copia en la carpeta de descargas del navegador. */
export function downloadAsFile(name, content, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
