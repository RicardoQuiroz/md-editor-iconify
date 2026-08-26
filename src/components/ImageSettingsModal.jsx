import React, { useState, useEffect, useRef } from 'react';
import { Image, X, AlignLeft, AlignRight, AlignCenter, Folder, Info } from 'lucide-react';
import { registerLocalAsset, isRemoteSource, hasLocalAsset } from '../utils/localAssets';

export function ImageSettingsModal({ isOpen, onClose, onInsertImage, selectedImageMarkdown }) {
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80');
  const [altText, setAltText] = useState('Imagen descriptiva');
  const [wrapMode, setWrapMode] = useState('left');
  const [imageWidth, setImageWidth] = useState('220px');
  const localFileInputRef = useRef(null);

  // Prefill modal fields if an existing image is selected in Markdown or Preview
  useEffect(() => {
    if (!isOpen) return;

    if (selectedImageMarkdown) {
      // Matches ![alt](url){wrap=mode width=val}
      const match = selectedImageMarkdown.match(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/);
      if (match) {
        setAltText(match[1] || 'Imagen');
        setImageUrl(match[2] || '');

        if (match[3]) {
          const wrapMatch = match[3].match(/wrap=([a-z]+)/i);
          const widthMatch = match[3].match(/width=([a-z0-9px%]+)/i);

          if (wrapMatch) setWrapMode(wrapMatch[1].toLowerCase());
          if (widthMatch) setImageWidth(widthMatch[1]);
        }
      }
    }
  }, [isOpen, selectedImageMarkdown]);

  /**
   * Imagen del disco.
   *
   * Se escribe la RUTA RELATIVA, nunca el contenido codificado: una foto de
   * 300 KB incrustada en base64 añade unos 400.000 caracteres al documento,
   * todos en una sola línea. El archivo se registra en memoria para que la
   * vista previa sí pueda mostrarlo durante la sesión.
   */
  const handleLocalImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const rutaRelativa = registerLocalAsset(file);
    setImageUrl(rutaRelativa);
    if (!altText || altText === 'Imagen descriptiva') {
      setAltText(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!imageUrl) return;

    const markdownTag = `![${altText || 'Imagen'}](${imageUrl}){wrap=${wrapMode} width=${imageWidth}}`;
    onInsertImage(markdownTag);
    onClose();
  };

  // Keyboard Navigation (ESC to cancel, ENTER to submit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, imageUrl, altText, wrapMode, imageWidth, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Image size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Configurar Imagen (Text Wrap & Disco Local)</h3>
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Local File Explorer & URL Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Seleccionar o Cargar Imagen:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="URL de la imagen o selecciona un archivo local..."
                autoFocus
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color-strong)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
              <input
                type="file"
                ref={localFileInputRef}
                onChange={handleLocalImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => localFileInputRef.current?.click()}
                title="Elegir una imagen del disco e insertar su ruta relativa"
                style={{ padding: '0.6rem 0.8rem', whiteSpace: 'nowrap' }}
              >
                <Folder size={16} />
                <span>Explorar Disco</span>
              </button>
            </div>

            {imageUrl && !isRemoteSource(imageUrl) && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  padding: '0.5rem 0.6rem',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.28)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.73rem',
                  lineHeight: 1.5,
                  color: 'var(--text-main)'
                }}
              >
                <Info size={14} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>
                  Se guardará como <strong>ruta relativa</strong>, no incrustada: el documento
                  crece unos pocos caracteres en lugar de cientos de miles.{' '}
                  {hasLocalAsset(imageUrl)
                    ? 'La verás en la vista previa durante esta sesión.'
                    : 'Recuerda que la imagen debe acompañar al archivo .md.'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Texto Alternativo (Alt):
            </label>
            <input
              type="text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder="Ej. Logotipo de la empresa"
              style={{
                width: '100%',
                padding: '0.6rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color-strong)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Text Wrap Options */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Distribución del Texto (Estilo MS Word):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
              <button
                type="button"
                className={`btn ${wrapMode === 'left' ? 'btn-primary' : ''}`}
                onClick={() => setWrapMode('left')}
                style={{ flexDirection: 'column', padding: '0.8rem', gap: '0.3rem', fontSize: '0.8rem' }}
              >
                <AlignLeft size={20} />
                <span>Flujo a Derecha (Float Left)</span>
              </button>

              <button
                type="button"
                className={`btn ${wrapMode === 'right' ? 'btn-primary' : ''}`}
                onClick={() => setWrapMode('right')}
                style={{ flexDirection: 'column', padding: '0.8rem', gap: '0.3rem', fontSize: '0.8rem' }}
              >
                <AlignRight size={20} />
                <span>Flujo a Izquierda (Float Right)</span>
              </button>

              <button
                type="button"
                className={`btn ${wrapMode === 'center' ? 'btn-primary' : ''}`}
                onClick={() => setWrapMode('center')}
                style={{ flexDirection: 'column', padding: '0.8rem', gap: '0.3rem', fontSize: '0.8rem' }}
              >
                <AlignCenter size={20} />
                <span>Centrado en Bloque</span>
              </button>
            </div>
          </div>

          {/* Width Options */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Ancho de la Imagen:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['140px', '180px', '240px', '320px', '100%'].map(w => (
                <button
                  key={w}
                  type="button"
                  className={`btn btn-sm ${imageWidth === w ? 'btn-accent' : ''}`}
                  onClick={() => setImageWidth(w)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn" onClick={onClose}>Cancelar (ESC)</button>
            <button type="submit" className="btn btn-primary">Guardar Imagen (ENTER)</button>
          </div>
        </form>
      </div>
    </div>
  );
}
