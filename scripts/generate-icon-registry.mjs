/**
 * Genera src/utils/iconRegistry.js con un import explícito de cada icono del
 * catálogo. Es lo que permite que el empaquetador descarte los ~1000 iconos de
 * Lucide que no se usan (con `import * as Icons` entran todos: +130 KB gzip).
 *
 * Ejecutar tras añadir o quitar iconos en iconCatalog.js:  npm run icons
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ICON_CATALOG } from '../src/utils/iconCatalog.js';

const here = dirname(fileURLToPath(import.meta.url));
const FALLBACK = 'Sparkles';

const names = [...new Set([...ICON_CATALOG.map((i) => i.icon), FALLBACK])].sort();

const file = `/**
 * REGISTRO DE ICONOS — ARCHIVO GENERADO, NO EDITAR A MANO.
 * Se regenera con:  npm run icons
 *
 * Importar cada icono por su nombre (en lugar de \`import * as Icons\`) es lo
 * que permite al empaquetador dejar fuera los iconos de Lucide que no se usan.
 * Solo se incluyen los ${names.length} iconos del catálogo: cualquier otro nombre
 * escrito a mano en un atajo \`:Nombre:\` cae en el icono de reserva (${FALLBACK}).
 */
import {
${names.map((n) => `  ${n}`).join(',\n')}
} from 'lucide-react';

export const ICON_REGISTRY = {
${names.map((n) => `  ${n}`).join(',\n')}
};

export const FALLBACK_ICON = ${FALLBACK};

/** Normaliza "shield", "alert-triangle" o "AlertTriangle" a la clave del registro. */
export function normalizeIconName(name) {
  if (!name) return '';
  return String(name)
    .replace(/[-_\\s]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}

/** Componente Lucide de un nombre, o el icono de reserva si no está en el catálogo. */
export function getLucideIcon(name) {
  return ICON_REGISTRY[normalizeIconName(name)] || ICON_REGISTRY[name] || FALLBACK_ICON;
}

/** true si el nombre existe en el catálogo empaquetado. */
export function hasLucideIcon(name) {
  return Boolean(ICON_REGISTRY[normalizeIconName(name)] || ICON_REGISTRY[name]);
}
`;

writeFileSync(join(here, '..', 'src', 'utils', 'iconRegistry.js'), file, 'utf8');
console.log(`iconRegistry.js generado con ${names.length} iconos.`);
