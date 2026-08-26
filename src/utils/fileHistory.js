/**
 * HISTORIAL DE ARCHIVOS ABIERTOS
 *
 * Dos almacenes, según lo que permita el navegador:
 *
 *  · IndexedDB (Chrome, Edge, Opera) guarda el manejador del archivo junto a
 *    sus datos. Los manejadores NO se pueden serializar a JSON, pero sí son
 *    clonables por IndexedDB, y sobreviven al reinicio del navegador. Gracias a
 *    eso una entrada del historial reabre el archivo con un clic; la primera vez
 *    tras reiniciar, el navegador pide confirmar el permiso.
 *
 *  · localStorage como respaldo, solo con los datos. La lista se ve igual, pero
 *    al pulsar hay que localizar el archivo en el diálogo.
 *
 * El JSON exportable contiene únicamente los datos, nunca el manejador: sirve
 * para consultar o llevarse la lista, no para reabrir en otro equipo.
 */

const DB_NAME = 'iconify-md-editor';
const DB_VERSION = 1;
const STORE = 'historial';
const RESPALDO_KEY = 'iconify_historial_v1';
const MAX_ENTRADAS = 30;

export function isIndexedDbAvailable() {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

function abrirBase() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error('IndexedDB no disponible'));
      return;
    }
    const peticion = indexedDB.open(DB_NAME, DB_VERSION);
    peticion.onupgradeneeded = () => {
      const db = peticion.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    peticion.onsuccess = () => resolve(peticion.result);
    peticion.onerror = () => reject(peticion.error);
  });
}

function transaccion(db, modo, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, modo);
    const store = tx.objectStore(STORE);
    let resultado;
    try {
      resultado = fn(store);
    } catch (error) {
      reject(error);
      return;
    }
    tx.oncomplete = () => resolve(resultado);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function pedir(peticion) {
  return new Promise((resolve, reject) => {
    peticion.onsuccess = () => resolve(peticion.result);
    peticion.onerror = () => reject(peticion.error);
  });
}

/* ------------------------------------------------------------------ *
 * Respaldo en localStorage (sin manejadores)
 * ------------------------------------------------------------------ */

function leerRespaldo() {
  try {
    const bruto = localStorage.getItem(RESPALDO_KEY);
    const lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista : [];
  } catch (error) {
    return [];
  }
}

function escribirRespaldo(entradas) {
  try {
    const soloDatos = entradas.map(({ handle, ...datos }) => datos);
    localStorage.setItem(RESPALDO_KEY, JSON.stringify(soloDatos));
  } catch (error) {
    /* almacenamiento lleno: el historial no es crítico */
  }
}

/* ------------------------------------------------------------------ *
 * API pública
 * ------------------------------------------------------------------ */

function nuevaId() {
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Manejadores de la sesión en curso, en memoria.
 *
 * IndexedDB los conserva entre sesiones solo en los navegadores que admiten la
 * API de archivos. Este mapa garantiza que, mientras no cierres la pestaña,
 * reabrir desde el historial funcione con un clic en cualquier navegador.
 */
const manejadoresDeSesion = new Map();

/** Devuelve las entradas con su manejador, prefiriendo el de la sesión. */
function conManejadores(entradas) {
  return entradas.map((entrada) => ({
    ...entrada,
    handle: manejadoresDeSesion.get(entrada.id) || entrada.handle || null
  }));
}

/**
 * ¿Dos entradas apuntan al mismo archivo?
 *
 * Cuando ambas tienen manejador, `isSameEntry` es concluyente: si dice que no,
 * son archivos distintos aunque compartan nombre, y no debe compararse por
 * nombre después. Dos README.md en carpetas diferentes son dos documentos.
 */
async function esElMismo(entrada, candidato) {
  if (entrada.handle && candidato.handle && typeof entrada.handle.isSameEntry === 'function') {
    try {
      return await entrada.handle.isSameEntry(candidato.handle);
    } catch (error) {
      /* si la comprobación falla, se cae al criterio por nombre */
    }
  }
  return entrada.name === candidato.name;
}

/** Historial completo, del más reciente al más antiguo. */
export async function listHistory() {
  let lista = [];

  if (isIndexedDbAvailable()) {
    try {
      const db = await abrirBase();
      lista = (await transaccion(db, 'readonly', (store) => pedir(store.getAll()))) || [];
      db.close();
    } catch (error) {
      lista = [];
    }
  }

  // Si IndexedDB no devolvió nada (no disponible, o una escritura anterior
  // falló) se usa el respaldo. Sin esto, un fallo de escritura haría
  // desaparecer el historial en silencio.
  if (lista.length === 0) lista = leerRespaldo();

  return conManejadores(lista).sort((a, b) => b.openedAt - a.openedAt);
}

/**
 * Anota un archivo recién abierto. Si ya estaba en el historial, actualiza su
 * fecha en lugar de duplicarlo.
 */
export async function recordOpened({ name, handle = null, size = 0, lastModified = 0 }) {
  const existentes = await listHistory();

  let entrada = null;
  for (const candidata of existentes) {
    if (await esElMismo(candidata, { name, handle })) {
      entrada = candidata;
      break;
    }
  }

  const actualizada = {
    id: entrada ? entrada.id : nuevaId(),
    name,
    size,
    lastModified,
    openedAt: Date.now(),
    veces: (entrada?.veces || 0) + 1,
    handle: handle || entrada?.handle || null
  };

  const resto = existentes.filter((e) => e.id !== actualizada.id);
  const lista = [actualizada, ...resto].slice(0, MAX_ENTRADAS);

  if (actualizada.handle) manejadoresDeSesion.set(actualizada.id, actualizada.handle);

  await persistir(lista);
  // Se devuelve también el id: quien abre el archivo lo necesita para saber
  // qué entrada del historial le corresponde, sin depender del nombre.
  return { historial: conManejadores(lista), id: actualizada.id };
}

/**
 * Escribe la lista en IndexedDB y en el respaldo.
 *
 * Si el manejador no se puede clonar (algo que no debería pasar con un
 * FileSystemFileHandle real, pero sí con cualquier otro objeto), se reintenta
 * guardando solo los datos: es preferible perder el acceso directo a perder el
 * historial entero.
 */
async function persistir(lista) {
  if (isIndexedDbAvailable()) {
    try {
      const db = await abrirBase();
      try {
        await transaccion(db, 'readwrite', (store) => {
          store.clear();
          for (const item of lista) store.put(item);
        });
      } catch (error) {
        await transaccion(db, 'readwrite', (store) => {
          store.clear();
          for (const { handle, ...datos } of lista) store.put(datos);
        });
      }
      db.close();
    } catch (error) {
      /* solo queda el respaldo */
    }
  }
  escribirRespaldo(lista);
}

export async function removeFromHistory(id) {
  const lista = (await listHistory()).filter((e) => e.id !== id);
  manejadoresDeSesion.delete(id);
  await persistir(lista);
  return conManejadores(lista);
}

export async function clearHistory() {
  manejadoresDeSesion.clear();
  await persistir([]);
  return [];
}

/* ------------------------------------------------------------------ *
 * Exportación e importación en JSON
 * ------------------------------------------------------------------ */

/** JSON legible con los datos del historial (sin manejadores). */
export function historyToJson(entradas) {
  return JSON.stringify(
    {
      aplicacion: 'Iconify MD Editor',
      formato: 'historial-v1',
      exportado: new Date().toISOString(),
      nota: 'Los manejadores de archivo no son serializables: esta lista sirve para consultar o migrar los nombres, no para reabrir automáticamente en otro equipo.',
      archivos: entradas.map(({ handle, ...datos }) => datos)
    },
    null,
    2
  );
}

/** Lee un historial exportado. Devuelve [] si el archivo no es válido. */
export function parseHistoryJson(texto) {
  try {
    const datos = JSON.parse(texto);
    const archivos = Array.isArray(datos) ? datos : datos?.archivos;
    if (!Array.isArray(archivos)) return [];

    return archivos
      .filter((item) => item && typeof item.name === 'string')
      .map((item) => ({
        id: item.id || nuevaId(),
        name: item.name,
        size: Number(item.size) || 0,
        lastModified: Number(item.lastModified) || 0,
        openedAt: Number(item.openedAt) || Date.now(),
        veces: Number(item.veces) || 1,
        handle: null
      }));
  } catch (error) {
    return [];
  }
}

/**
 * Fusiona un historial importado con el actual.
 *
 * Las entradas locales se conservan todas tal cual —pueden existir dos archivos
 * con el mismo nombre en carpetas distintas, y cada una guarda su acceso—; del
 * archivo importado solo se añaden los nombres que aún no estaban.
 */
export async function mergeHistory(importadas) {
  const actuales = await listHistory();
  const nombresLocales = new Set(actuales.map((e) => e.name));
  const nuevas = importadas.filter((entrada) => !nombresLocales.has(entrada.name));

  const lista = [...actuales, ...nuevas]
    .sort((a, b) => b.openedAt - a.openedAt)
    .slice(0, MAX_ENTRADAS);

  await persistir(lista);
  return conManejadores(lista);
}

/** Texto relativo para la interfaz: "hace 5 min", "ayer"… */
export function relativeTime(timestamp) {
  const diferencia = Date.now() - timestamp;
  const minutos = Math.floor(diferencia / 60000);

  if (minutos < 1) return 'ahora mismo';
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ayer';
  if (dias < 30) return `hace ${dias} días`;

  const meses = Math.floor(dias / 30);
  return meses === 1 ? 'hace un mes' : `hace ${meses} meses`;
}
