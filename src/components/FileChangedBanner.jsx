import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

/**
 * Aviso de que el archivo cambió en el disco desde que se abrió.
 *
 * Aparece al intentar abrir un documento que ya está abierto y cuyo contenido
 * en disco es distinto del que se está editando. Sin este aviso se seguiría
 * trabajando sobre una versión antigua sin saberlo.
 */
export function FileChangedBanner({ nombre, tieneCambiosSinGuardar, onReload, onKeep }) {
  if (!nombre) return null;

  return (
    <div className="changed-banner" role="alert">
      <AlertTriangle size={17} color="var(--accent-amber)" style={{ flexShrink: 0 }} />

      <div className="changed-banner-text">
        <strong>“{nombre}” cambió fuera del editor.</strong>{' '}
        {tieneCambiosSinGuardar
          ? 'Tienes cambios sin guardar: si recargas, se perderán.'
          : 'La versión que estás viendo no es la del disco.'}
      </div>

      <button type="button" className="btn btn-sm btn-primary" onClick={onReload}>
        <RefreshCw size={14} />
        <span>Recargar del disco</span>
      </button>

      <button type="button" className="btn btn-sm" onClick={onKeep} title="Seguir con la versión que tengo abierta">
        <span>Mantener el mío</span>
      </button>

      <button type="button" className="btn btn-sm changed-banner-close" onClick={onKeep} title="Cerrar el aviso">
        <X size={15} />
      </button>
    </div>
  );
}
