import React from 'react';
import { getLucideIcon } from '../utils/iconRegistry';

/**
 * Renderiza cualquier icono Lucide por nombre.
 *
 * Soporta modo DUOTONO: Lucide dibuja siluetas con `fill="none"`, así que al
 * pasar un `fill` propio las formas se rellenan y el `stroke` queda como
 * contorno. El resultado son iconos de dos colores sin cambiar de librería.
 */
export function DynamicLucideIcon({
  name,
  size = 18,
  className = '',
  color,
  fill,
  fillOpacity = 0.35,
  strokeWidth
}) {
  if (!name) return null;

  const IconComponent = getLucideIcon(name);

  const extra = {};
  if (fill) {
    extra.fill = fill;
    extra.fillOpacity = fillOpacity;
  }
  if (strokeWidth) extra.strokeWidth = strokeWidth;

  return <IconComponent size={size} className={className} color={color} {...extra} />;
}
