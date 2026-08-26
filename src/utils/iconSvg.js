/**
 * SERIALIZADOR DE ICONOS A SVG
 *
 * El compilador necesita convertir un icono Lucide en una cadena de HTML para
 * incrustarlo en la vista previa. Antes eso se hacía con `renderToStaticMarkup`
 * de react-dom/server, que pesa ~57 KB comprimidos solo para esta tarea.
 *
 * Cada icono de Lucide es un envoltorio que expone los trazos crudos del dibujo
 * en la prop `iconNode` (`[['path', { d: '…' }], ['circle', { cx, cy, r }], …]`).
 * Con eso se puede componer el mismo <svg> directamente, sin React de por medio
 * y sin la dependencia en el paquete final.
 */

import { getLucideIcon } from './iconRegistry';

/** Atributos SVG que conservan sus mayúsculas y no se pasan a guiones. */
const PRESERVE_CASE = new Set(['viewBox', 'preserveAspectRatio', 'baseProfile']);

/** Props internas de React que nunca son atributos HTML. */
const SKIP_PROPS = new Set(['key', 'ref', 'children', 'iconNode', 'dangerouslySetInnerHTML']);

const metaCache = new Map();

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function attributeName(prop) {
  if (prop === 'className') return 'class';
  if (PRESERVE_CASE.has(prop)) return prop;
  return prop.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function serializeAttributes(attrs) {
  const parts = [];
  for (const [prop, value] of Object.entries(attrs || {})) {
    if (SKIP_PROPS.has(prop)) continue;
    if (value == null || value === false) continue;
    if (typeof value === 'function' || typeof value === 'object') continue;
    if (value === true) {
      parts.push(attributeName(prop));
      continue;
    }
    parts.push(`${attributeName(prop)}="${escapeAttribute(value)}"`);
  }
  return parts.length ? ` ${parts.join(' ')}` : '';
}

/**
 * Extrae (una sola vez por icono) los trazos y la clase canónica de Lucide.
 * El envoltorio externo no usa hooks, así que se puede evaluar fuera de React.
 */
function getIconMeta(IconComponent) {
  if (metaCache.has(IconComponent)) return metaCache.get(IconComponent);

  let meta = { iconNode: [], lucideClass: '' };
  try {
    const element =
      typeof IconComponent?.render === 'function' ? IconComponent.render({}, null) : null;
    if (element?.props?.iconNode) {
      meta = {
        iconNode: element.props.iconNode,
        lucideClass: element.props.className || ''
      };
    }
  } catch (err) {
    /* icono no serializable: se devuelve vacío y el compilador deja el texto */
  }

  metaCache.set(IconComponent, meta);
  return meta;
}

/**
 * Devuelve el SVG de un icono Lucide como cadena de HTML, con el mismo marcado
 * que producía react-dom/server.
 *
 * @param {string} name  Nombre del icono (":Shield:" -> "Shield")
 * @param {object} options  size, className, color, fill, fillOpacity, strokeWidth
 */
export function renderIconSvg(name, options = {}) {
  const { size = 18, className = '', color, fill, fillOpacity = 0.35, strokeWidth } = options;

  const IconComponent = getLucideIcon(name);
  if (!IconComponent) return '';

  const { iconNode, lucideClass } = getIconMeta(IconComponent);
  if (!iconNode.length) return '';

  const svgAttrs = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: fill || 'none',
    stroke: color || 'currentColor',
    strokeWidth: strokeWidth || 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: ['lucide', lucideClass, className].filter(Boolean).join(' '),
    'aria-hidden': 'true'
  };
  if (fill) svgAttrs.fillOpacity = fillOpacity;

  const body = iconNode
    .map(([tag, tagAttrs]) => `<${tag}${serializeAttributes(tagAttrs)} />`)
    .join('');

  return `<svg${serializeAttributes(svgAttrs)}>${body}</svg>`;
}
