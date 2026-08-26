import React, { useState, useEffect, useRef, useMemo } from 'react';
// Nota: Lucide v1 retiró los iconos de marca (Youtube, Vimeo…), así que se usan
// equivalentes genéricos para identificar el tipo de medio.
import { X, Music, Video, MonitorPlay, Film, Folder, Info } from 'lucide-react';
import {
  parseMediaLine,
  classifyMediaUrl,
  mediaKindLabel,
  renderMediaHtml,
  fileNameFromUrl
} from '../utils/mediaEmbed';
import { registerLocalAsset } from '../utils/localAssets';

const EJEMPLOS = [
  { etiqueta: 'Audio MP3', valor: 'https://ejemplo.com/podcast.mp3' },
  { etiqueta: 'Vídeo MP4', valor: 'https://ejemplo.com/clase.mp4' },
  { etiqueta: 'YouTube', valor: 'https://youtu.be/dQw4w9WgXcQ' },
  { etiqueta: 'Vimeo', valor: 'https://vimeo.com/76979871' }
];

const ICONO = {
  audio: Music,
  video: Video,
  youtube: MonitorPlay,
  vimeo: Film
};

/**
 * Inserta o edita un reproductor de audio/vídeo.
 *
 * Lo que se escribe en el documento es un enlace de Markdown normal en su
 * propia línea; el reproductor lo genera el compilador al previsualizar.
 */
export function MediaEmbedModal({ isOpen, onClose, selectedMediaMarkdown, onApplyMedia }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const urlRef = useRef(null);
  const fileRef = useRef(null);

  // Precarga los valores del reproductor seleccionado en el documento
  useEffect(() => {
    if (!isOpen) return;

    const existing = parseMediaLine(selectedMediaMarkdown || '');
    setUrl(existing ? existing.url : '');
    setTitle(existing ? existing.title : '');
    setTimeout(() => urlRef.current?.focus(), 30);
  }, [isOpen, selectedMediaMarkdown]);

  const trimmedUrl = url.trim();
  const info = classifyMediaUrl(trimmedUrl);

  const media = useMemo(() => {
    if (!info) return null;
    return {
      ...info,
      url: trimmedUrl,
      title: title.trim(),
      isRemote: /^(https?:)?\/\//i.test(trimmedUrl) || /^data:/i.test(trimmedUrl)
    };
  }, [info, trimmedUrl, title]);

  const markdown = media
    ? title.trim()
      ? `[${title.trim()}](${trimmedUrl})`
      : trimmedUrl
    : '';

  const handleLocalFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Un archivo local se referencia por ruta relativa: incrustarlo como
    // datos haría el .md enorme (un MP3 de 3 MB pasaría a ~4 MB de texto).
    // Se registra en memoria para poder reproducirlo durante la sesión.
    setUrl(registerLocalAsset(file));
    if (!title.trim()) setTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleSave = () => {
    if (!media) return;
    onApplyMedia(markdown);
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
  }, [isOpen, url, title, onClose]);

  if (!isOpen) return null;

  const KindIcon = info ? ICONO[info.kind] || Film : Film;

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <KindIcon size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Audio y Vídeo Incrustado</h3>
            {info && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  background: 'var(--accent-glow)',
                  color: 'var(--accent-primary)'
                }}
              >
                {mediaKindLabel(info.kind)} detectado
              </span>
            )}
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Dirección del audio o vídeo:</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                ref={urlRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…  ·  MP3, MP4, YouTube o Vimeo"
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="file"
                ref={fileRef}
                onChange={handleLocalFile}
                accept="audio/*,video/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fileRef.current?.click()}
                title="Elegir un archivo del disco e insertar su ruta relativa"
                style={{ whiteSpace: 'nowrap' }}
              >
                <Folder size={15} />
                <span>Disco</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              {EJEMPLOS.map((ej) => (
                <button
                  key={ej.etiqueta}
                  type="button"
                  className="btn btn-sm"
                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
                  onClick={() => setUrl(ej.valor)}
                >
                  {ej.etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Título del reproductor (opcional):</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={trimmedUrl ? fileNameFromUrl(trimmedUrl) : 'Ej. Clase 3 — Introducción'}
              style={inputStyle}
            />
          </div>

          {/* Vista previa real del reproductor */}
          {media && (
            <div>
              <label style={labelStyle}>Vista previa:</label>
              <div
                className="preview-container"
                style={{ padding: '0.5rem 0.7rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                dangerouslySetInnerHTML={{ __html: renderMediaHtml(media) }}
              />
            </div>
          )}

          {/* Qué se escribe realmente y cómo se comporta fuera */}
          <div>
            <label style={labelStyle}>Se escribirá en el documento:</label>
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
              {markdown || (
                <span style={{ color: 'var(--text-dim)' }}>
                  {trimmedUrl ? 'No reconozco ese tipo de medio…' : 'Escribe una dirección…'}
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.6rem 0.7rem',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.28)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              lineHeight: 1.5,
              color: 'var(--text-main)'
            }}
          >
            <Info size={15} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              Se escribe como un enlace normal en su propia línea, sin sintaxis inventada. Aquí y en
              la exportación <code>.html</code> se ve como reproductor; en GitHub, que elimina audio
              y vídeo, queda como un enlace clicable.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
            <button type="button" className="btn" onClick={onClose}>
              Cancelar (ESC)
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!media}>
              Insertar (ENTER)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
