import React, { useState, useEffect, useMemo } from 'react';
import { CaseUpper, X, Info } from 'lucide-react';
import { CASE_TRANSFORMS, applyCaseTransform } from '../utils/changeCase';

const MAX_VISTA = 240;

/**
 * Cambia mayúsculas y minúsculas del texto seleccionado o del bloque enfocado.
 *
 * Cada opción muestra el resultado real sobre tu propio texto, no un ejemplo
 * genérico, porque las transformaciones respetan la sintaxis Markdown y eso
 * conviene poder comprobarlo antes de aplicar.
 */
export function ChangeCaseModal({ isOpen, onClose, sourceText, origen, onApply }) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (isOpen) setSelected(0);
  }, [isOpen]);

  const previsualizaciones = useMemo(() => {
    if (!isOpen || !sourceText) return [];
    return CASE_TRANSFORMS.map((transform) => ({
      ...transform,
      resultado: applyCaseTransform(transform.id, sourceText)
    }));
  }, [isOpen, sourceText]);

  const aplicar = (indice) => {
    const elegida = previsualizaciones[indice];
    if (!elegida) return;
    onApply(elegida.resultado, elegida.nombre);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((prev) => Math.min(CASE_TRANSFORMS.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        aplicar(selected);
      } else if (/^[1-9]$/.test(e.key)) {
        const indice = Number(e.key) - 1;
        if (indice < CASE_TRANSFORMS.length) {
          e.preventDefault();
          aplicar(indice);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selected, previsualizaciones, onClose]);

  if (!isOpen) return null;

  const recortar = (texto) =>
    texto.length > MAX_VISTA ? `${texto.slice(0, MAX_VISTA)}…` : texto;

  const sinTexto = !sourceText || !sourceText.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CaseUpper size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Cambiar mayúsculas</h3>
            {origen && <span className="case-origen">{origen}</span>}
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {sinTexto ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No hay texto sobre el que trabajar. Selecciona algo en el editor, o sitúate en un
              bloque de la vista previa con las flechas.
            </div>
          ) : (
            <>
              <div>
                <label className="case-label">Texto original:</label>
                <div className="case-original">{recortar(sourceText)}</div>
              </div>

              <div className="case-list">
                {previsualizaciones.map((transform, indice) => (
                  <button
                    key={transform.id}
                    type="button"
                    className={`case-option ${indice === selected ? 'active' : ''}`}
                    onClick={() => aplicar(indice)}
                    onMouseEnter={() => setSelected(indice)}
                  >
                    <span className="case-option-key">{indice + 1}</span>
                    <span className="case-option-body">
                      <span className="case-option-name">{transform.nombre}</span>
                      <span className="case-option-preview">{recortar(transform.resultado)}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="case-note">
                <Info size={14} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>
                  Los atajos de icono, las direcciones de los enlaces, el código entre comillas
                  invertidas y los marcadores de bloque (<code>##</code>, <code>-</code>) no se
                  tocan. Pulsa <strong>1-6</strong> o <strong>ENTER</strong> para aplicar,{' '}
                  <strong>ESC</strong> para cancelar.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
