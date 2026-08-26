import React, { useState, useEffect, useRef } from 'react';
import { Link2, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { classifyMediaUrl, mediaKindLabel } from '../utils/mediaEmbed';

/**
 * Inserta un enlace `[texto](url)` en mitad de un párrafo.
 *
 * En el editor de código respeta el cursor y la selección.
 * En la vista WYSIWYG envuelve el texto que hayas seleccionado con el ratón.
 */
export function LinkModal({ isOpen, onClose, initialText, initialUrl, onApplyLink }) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const urlRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setText(initialText || '');
    setUrl(initialUrl || '');
    setTitle('');
    // Si ya hay texto, lo que falta es la dirección: el foco va ahí
    setTimeout(() => urlRef.current?.focus(), 30);
  }, [isOpen, initialText, initialUrl]);

  const trimmedUrl = url.trim();
  const linkLabel = text.trim() || trimmedUrl;
  const markdown = trimmedUrl
    ? `[${linkLabel}](${trimmedUrl}${title.trim() ? ` "${title.trim()}"` : ''})`
    : '';

  // Aviso: un enlace a un medio, si va solo en su línea, se vuelve reproductor
  const mediaInfo = classifyMediaUrl(trimmedUrl);

  const handleSave = () => {
    if (!trimmedUrl) return;
    onApplyLink(markdown, { url: trimmedUrl, text: linkLabel });
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, text, url, title, onClose]);

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%',
    padding: '0.55rem 0.7rem',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color-strong)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-main)',
    fontSize: '0.88rem',
    outline: 'none'
  };
  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    marginBottom: '0.3rem',
    color: 'var(--text-muted)'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Link2 size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Insertar Enlace</h3>
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Texto que se verá:</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ej. la documentación oficial"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Dirección (URL):</label>
            <input
              ref={urlRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/pagina"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Título emergente (opcional):</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Texto que aparece al pasar el ratón"
              style={inputStyle}
            />
          </div>

          {/* Resultado en Markdown */}
          <div>
            <label style={labelStyle}>Se insertará:</label>
            <div
              style={{
                padding: '0.6rem 0.7rem',
                background: '#090D16',
                border: '1px solid var(--border-color-strong)',
                borderRadius: 'var(--radius-md)',
                color: '#38BDF8',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                wordBreak: 'break-all',
                minHeight: '2.2rem'
              }}
            >
              {markdown || <span style={{ color: 'var(--text-dim)' }}>Escribe una dirección…</span>}
            </div>
          </div>

          {mediaInfo && (
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.6rem 0.7rem',
                background: 'rgba(245, 158, 11, 0.10)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.76rem',
                color: 'var(--text-main)',
                lineHeight: 1.45
              }}
            >
              <AlertTriangle size={15} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                Es un enlace de <strong>{mediaKindLabel(mediaInfo.kind)}</strong>. Insertado dentro de
                un párrafo se queda como enlace normal. Si lo quieres como reproductor, ponlo{' '}
                <strong>solo en su propia línea</strong> o usa el botón de multimedia.
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
            <button type="button" className="btn" onClick={onClose}>
              Cancelar (ESC)
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!trimmedUrl}
            >
              <ExternalLink size={15} />
              <span>Insertar (ENTER)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
