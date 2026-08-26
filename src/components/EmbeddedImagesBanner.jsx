import React from 'react';
import { AlertTriangle, FileDown, X } from 'lucide-react';
import { formatBytes } from '../utils/embeddedAssets';

/**
 * Aviso de imágenes incrustadas en base64.
 *
 * Aparece bajo la barra superior cuando el documento activo contiene imágenes
 * escritas dentro del propio texto. Ofrece extraerlas a archivos reales y
 * dejar en su lugar la ruta relativa.
 */
export function EmbeddedImagesBanner({ resumen, onExtract, onDismiss, extrayendo }) {
  if (!resumen || resumen.cuantas === 0) return null;

  const { cuantas, chars, bytes, porcentaje } = resumen;

  return (
    <div className="embedded-banner" role="alert">
      <AlertTriangle size={17} color="var(--accent-amber)" style={{ flexShrink: 0 }} />

      <div className="embedded-banner-text">
        <strong>
          {cuantas === 1
            ? 'Este documento tiene 1 imagen incrustada'
            : `Este documento tiene ${cuantas} imágenes incrustadas`}
        </strong>{' '}
        en base64: ocupan <strong>{chars.toLocaleString('es')} caracteres</strong> (
        {formatBytes(bytes)}
        {porcentaje > 0 ? `, el ${porcentaje} % del archivo` : ''}). Eso hace el Markdown
        difícil de leer y de versionar.
      </div>

      <button
        type="button"
        className="btn btn-sm btn-primary"
        onClick={onExtract}
        disabled={extrayendo}
        title="Guardar cada imagen como archivo y dejar su ruta relativa en el documento"
      >
        <FileDown size={15} />
        <span>{extrayendo ? 'Extrayendo…' : 'Extraer a archivos'}</span>
      </button>

      <button
        type="button"
        className="btn btn-sm embedded-banner-close"
        onClick={onDismiss}
        title="Ocultar este aviso para el documento actual"
      >
        <X size={15} />
      </button>
    </div>
  );
}
