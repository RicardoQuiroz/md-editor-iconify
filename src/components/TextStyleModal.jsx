import React, { useState, useEffect } from 'react';
import { Type, X, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

export function TextStyleModal({ isOpen, onClose, initialText, onApplyTextStyle }) {
  const [textContent, setTextContent] = useState('Texto de ejemplo...');
  const [blockType, setBlockType] = useState('p');
  const [fontFamily, setFontFamily] = useState('var(--font-sans)');
  const [fontSize, setFontSize] = useState('16px');
  const [fontWeight, setFontWeight] = useState('400');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textColor, setTextColor] = useState('#F1F5F9');
  const [bgColor, setBgColor] = useState('');
  const [textAlign, setTextAlign] = useState('left');
  const [borderLeftColor, setBorderLeftColor] = useState('');
  const [borderLeftWidth, setBorderLeftWidth] = useState('0px');

  const applyPresetVisuals = (preset) => {
    if (preset === 'h1') { setFontSize('32px'); setFontWeight('700'); }
    if (preset === 'h2') { setFontSize('24px'); setFontWeight('700'); }
    if (preset === 'h3') { setFontSize('20px'); setFontWeight('600'); }
    if (preset === 'p') { setFontSize('16px'); setFontWeight('400'); setBgColor(''); setBorderLeftColor(''); setBorderLeftWidth('0px'); }
    if (preset === 'info') { setBgColor('rgba(56, 189, 248, 0.08)'); setBorderLeftColor('#38BDF8'); setBorderLeftWidth('4px'); setTextColor('#E0F2FE'); }
    if (preset === 'warning') { setBgColor('rgba(245, 158, 11, 0.09)'); setBorderLeftColor('#F59E0B'); setBorderLeftWidth('4px'); setTextColor('#FEF3C7'); }
    if (preset === 'success') { setBgColor('rgba(16, 185, 129, 0.09)'); setBorderLeftColor('#10B981'); setBorderLeftWidth('4px'); setTextColor('#D1FAE5'); }
    if (preset === 'card') { setBgColor('var(--bg-card)'); setBorderLeftColor(''); setBorderLeftWidth('0px'); }
    if (preset === 'quote') { setFontFamily('var(--font-serif)'); setFontStyle('italic'); setBorderLeftColor('#A855F7'); setBorderLeftWidth('4px'); }
    if (preset === 'terminal') { setFontFamily('var(--font-mono)'); setBgColor('#090D16'); setTextColor('#38BDF8'); }
  };

  const handlePresetSelect = (preset) => {
    setBlockType(preset);
    applyPresetVisuals(preset);
  };

  /**
   * Reads the Markdown source of the selected block so the modal opens already
   * matching what is on screen (heading level, callout preset, plain text...).
   */
  useEffect(() => {
    if (!isOpen) return;

    const source = (initialText || '').replace(/\s+$/, '');
    if (!source.trim()) {
      setTextContent('');
      setBlockType('p');
      return;
    }

    const fence = source.match(/^:::[ \t]*([a-zA-Z0-9_-]+)[ \t]*\n([\s\S]*?)\n:::[ \t]*$/);
    if (fence) {
      const preset = fence[1].replace(/^preset-/, '');
      setTextContent(fence[2]);
      if (['info', 'warning', 'success', 'card', 'quote', 'terminal'].includes(preset)) {
        applyPresetVisuals(preset);
        setBlockType(preset);
      } else {
        setBlockType('p');
      }
      return;
    }

    const heading = source.match(/^(#{1,3})\s+([\s\S]*)$/);
    if (heading) {
      const level = `h${heading[1].length}`;
      setTextContent(heading[2].trim());
      applyPresetVisuals(level);
      setBlockType(level);
      return;
    }

    setTextContent(source.trim());
    setBlockType('p');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialText]);

  const handleSave = () => {
    const body = textContent.replace(/\s+$/, '');
    let formattedMarkdown = '';

    if (blockType === 'h1') formattedMarkdown = `# ${body}`;
    else if (blockType === 'h2') formattedMarkdown = `## ${body}`;
    else if (blockType === 'h3') formattedMarkdown = `### ${body}`;
    else if (['info', 'warning', 'success', 'card', 'quote', 'terminal'].includes(blockType)) {
      formattedMarkdown = `:::${blockType}\n${body}\n:::`;
    } else if (borderLeftColor || bgColor) {
      formattedMarkdown = `:::card\n${body}\n:::`;
    } else {
      formattedMarkdown = body;
    }

    onApplyTextStyle(formattedMarkdown);
    onClose();
  };

  // Keyboard Navigation (ESC to close, ENTER to submit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, blockType, textContent, fontFamily, textColor, bgColor, borderLeftColor, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Type size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Editor Visual de Estilo de Texto</h3>
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Editable Text Area */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
              Contenido del Texto (Ctrl+ENTER para aplicar):
            </label>
            <textarea
              rows={3}
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              placeholder="Escribe el texto a estilizar..."
              autoFocus
              style={{
                width: '100%',
                padding: '0.8rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color-strong)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Live Preview Card */}
          <div style={{
            padding: '1.2rem 1.5rem',
            background: bgColor || 'var(--bg-input)',
            borderLeft: borderLeftWidth !== '0px' ? `${borderLeftWidth} solid ${borderLeftColor || 'var(--accent-primary)'}` : '1px solid var(--border-color)',
            borderTop: '1px solid var(--border-color)',
            borderRight: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: textColor,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            textAlign: textAlign,
            minHeight: '70px',
            lineHeight: 1.5
          }}>
            {textContent || 'Vista previa del texto...'}
          </div>

          {/* Quick Block Type Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Tipo de Elemento / Bloque:
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'p', name: 'Párrafo Normal' },
                { id: 'h1', name: 'Título H1' },
                { id: 'h2', name: 'Título H2' },
                { id: 'h3', name: 'Título H3' },
                { id: 'info', name: 'Info Callout' },
                { id: 'warning', name: 'Advertencia' },
                { id: 'success', name: 'Éxito' },
                { id: 'card', name: 'Tarjeta' },
                { id: 'quote', name: 'Cita Serif' },
                { id: 'terminal', name: 'Terminal' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`btn btn-sm ${blockType === item.id ? 'btn-primary' : ''}`}
                  onClick={() => handlePresetSelect(item.id)}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Typography Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Fuente:</label>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '0.8rem' }}
              >
                <option value="var(--font-sans)">Inter (Sans)</option>
                <option value="var(--font-mono)">JetBrains (Mono)</option>
                <option value="var(--font-serif)">Playfair (Serif)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Tamaño:</label>
              <select
                value={fontSize}
                onChange={e => setFontSize(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '0.8rem' }}
              >
                <option value="14px">14px (Pequeño)</option>
                <option value="16px">16px (Normal)</option>
                <option value="20px">20px (Mediano)</option>
                <option value="24px">24px (Grande)</option>
                <option value="32px">32px (Título)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Grosor:</label>
              <select
                value={fontWeight}
                onChange={e => setFontWeight(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '0.8rem' }}
              >
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="600">SemiBold</option>
                <option value="700">Bold</option>
                <option value="900">ExtraBold</option>
              </select>
            </div>
          </div>

          {/* Color & Alignment Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                Color del Texto:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="color"
                  value={textColor.startsWith('#') ? textColor : '#F1F5F9'}
                  onChange={e => setTextColor(e.target.value)}
                  style={{ width: '36px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {['#F1F5F9', '#38BDF8', '#A855F7', '#F59E0B', '#10B981', '#F43F5E'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTextColor(c)}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: c, border: textColor === c ? '2px solid white' : 'none', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                Alineación del Texto:
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button type="button" className={`btn btn-sm ${textAlign === 'left' ? 'btn-primary' : ''}`} onClick={() => setTextAlign('left')}><AlignLeft size={16} /></button>
                <button type="button" className={`btn btn-sm ${textAlign === 'center' ? 'btn-primary' : ''}`} onClick={() => setTextAlign('center')}><AlignCenter size={16} /></button>
                <button type="button" className={`btn btn-sm ${textAlign === 'right' ? 'btn-primary' : ''}`} onClick={() => setTextAlign('right')}><AlignRight size={16} /></button>
                <button type="button" className={`btn btn-sm ${textAlign === 'justify' ? 'btn-primary' : ''}`} onClick={() => setTextAlign('justify')}><AlignJustify size={16} /></button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn" onClick={onClose}>Cancelar (ESC)</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Aplicar (Ctrl+ENTER)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
