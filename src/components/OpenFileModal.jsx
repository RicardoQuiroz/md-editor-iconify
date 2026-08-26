import React, { useEffect, useRef } from 'react';
import {
  Upload,
  X,
  FilePlus,
  FolderOpen,
  AlertTriangle,
  FileText,
  History,
  Download,
  Trash2
} from 'lucide-react';
import { relativeTime } from '../utils/fileHistory';

/**
 * Pantalla de apertura de documentos.
 *
 * Aparece con Ctrl+O y con el botón `Upload` de la barra. Su motivo de ser es
 * hacer visible que hay dos caminos: el botón (que abre el diálogo del sistema)
 * y soltar el archivo directamente sobre la zona discontinua.
 *
 * El arrastre en sí lo sigue gestionando <DropOverlay> a nivel de ventana; aquí
 * solo se refleja su estado con `isDragging`, para no tener dos canales que
 * procesen el mismo evento.
 */
export function OpenFileModal({
  isOpen,
  onClose,
  onBrowse,
  onCreateBlank,
  isDragging,
  lastOpenedName,
  canUseNativeFiles,
  // Historial
  historial = [],
  entradasAbiertas = new Set(),
  onReopen,
  onForget,
  onClearHistory,
  onExportHistory,
  onImportHistory
}) {
  const importInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onBrowse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onBrowse]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content open-file-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FolderOpen size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Abrir documento</h3>
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Zona discontinua: se ilumina mientras arrastras algo sobre la ventana */}
          <div className={`open-dropzone ${isDragging ? 'is-dragging' : ''}`}>
            <div className="open-dropzone-tile">
              <Upload size={30} color="var(--accent-primary)" />
            </div>

            <button type="button" className="open-dropzone-button" onClick={onBrowse}>
              Buscar en el equipo
            </button>

            <p className="open-dropzone-hint">
              {isDragging ? 'Suelta ahora para abrirlo' : 'o suelta un archivo aquí'}
            </p>

            <button type="button" className="open-dropzone-secondary" onClick={onCreateBlank}>
              <FilePlus size={14} />
              <span>Crear un documento en blanco</span>
              <span aria-hidden="true">-&gt;</span>
            </button>
          </div>

          <p className="open-formats">
            .md · .markdown · .mdx · .txt — varios archivos a la vez, o una carpeta entera
          </p>

          {/* Historial de archivos abiertos */}
          {historial.length > 0 && (
            <div className="open-history">
              <div className="open-history-head">
                <History size={14} color="var(--text-muted)" />
                <span>Abiertos recientemente</span>
                <div className="open-history-actions">
                  <button type="button" className="btn btn-sm" onClick={onExportHistory} title="Exportar el historial como archivo .json">
                    <Download size={13} />
                  </button>
                  <input
                    type="file"
                    accept=".json,application/json"
                    ref={importInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const archivo = e.target.files?.[0];
                      if (archivo) onImportHistory?.(archivo);
                      e.target.value = '';
                    }}
                  />
                  <button type="button" className="btn btn-sm" onClick={() => importInputRef.current?.click()} title="Importar un historial .json">
                    <Upload size={13} />
                  </button>
                  <button type="button" className="btn btn-sm" onClick={onClearHistory} title="Vaciar el historial">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="open-history-list">
                {historial.map((entrada) => {
                  const yaAbierto = entradasAbiertas.has(entrada.id);
                  const reabrible = Boolean(entrada.handle);

                  return (
                    <div key={entrada.id} className={`open-history-item ${yaAbierto ? 'abierto' : ''}`}>
                      <button
                        type="button"
                        className="open-history-open"
                        onClick={() => onReopen?.(entrada)}
                        title={
                          yaAbierto
                            ? 'Ya está abierto: se irá a su pestaña'
                            : reabrible
                              ? 'Abrir de nuevo este archivo'
                              : 'Sin manejador guardado: se abrirá el buscador para localizarlo'
                        }
                      >
                        <FileText size={14} color={yaAbierto ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                        <span className="open-history-name">{entrada.name}</span>
                        {yaAbierto && <span className="open-history-tag">abierto</span>}
                        {!reabrible && !yaAbierto && <span className="open-history-tag buscar">buscar</span>}
                        <span className="open-history-time">{relativeTime(entrada.openedAt)}</span>
                      </button>
                      <button
                        type="button"
                        className="open-history-forget"
                        onClick={() => onForget?.(entrada.id)}
                        title="Quitar del historial"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {canUseNativeFiles ? (
            lastOpenedName && (
              <p className="open-note">
                <FolderOpen size={13} color="var(--accent-primary)" />
                <span>
                  El buscador se abrirá en la carpeta de <strong>{lastOpenedName}</strong>.
                </span>
              </p>
            )
          ) : (
            <div className="open-warning">
              <AlertTriangle size={15} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                <strong>Modo reducido.</strong> Este navegador no permite recordar la carpeta ni
                guardar encima del archivo original, así que <code>Ctrl+S</code> descargará una
                copia. Ocurre en Firefox y Safari, y también al abrir la aplicación con doble clic
                sobre el archivo (<code>file://</code>) en lugar de servirla desde{' '}
                <code>localhost</code> o <code>https://</code>.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
