import React, { useState, useEffect } from 'react';
import { Palette, X, Code2 } from 'lucide-react';
import { DynamicLucideIcon } from './DynamicLucideIcon';
import { parseIconAttributes, resolveDuoColors } from '../utils/markdownCompiler';
import { DUO_PALETTES, getDuoPalette } from '../utils/iconCatalog';

export function IconStyleModal({ isOpen, onClose, iconName, initialShortcode, onApplyIconStyle }) {
  const [name, setName] = useState(iconName || 'Shield');
  const [color, setColor] = useState('#38BDF8');
  const [size, setSize] = useState(28);
  const [bg, setBg] = useState('');
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderColor, setBorderColor] = useState('#38BDF8');
  const [borderRadius, setBorderRadius] = useState('8px');
  const [padding, setPadding] = useState(4);
  const [opacity, setOpacity] = useState(1);
  const [shadowColor, setShadowColor] = useState('');
  const [rotateAngle, setRotateAngle] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [spin, setSpin] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [float, setFloat] = useState(false);
  const [filterMode, setFilterMode] = useState('none');
  const [rawCode, setRawCode] = useState('');

  // Relleno: 'line' (trazo simple) | 'auto' (multicolor por categoría) | 'duo' (dos colores a medida)
  const [fillMode, setFillMode] = useState('line');
  const [duoFill, setDuoFill] = useState('#38BDF8');
  const [duoStroke, setDuoStroke] = useState('#0C4A6E');
  const [duoOpacity, setDuoOpacity] = useState(0.35);

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let targetIcon = iconName || 'Shield';
    let attrString = '';

    if (initialShortcode) {
      const match = initialShortcode.match(/:([a-zA-Z0-9_-]+)(?:\{([^}]+)\})?:/);
      if (match) {
        targetIcon = match[1];
        attrString = match[2] || '';
      }
    }

    setName(targetIcon);
    const attrs = parseIconAttributes(attrString);

    setColor(attrs.color || '#38BDF8');
    setSize(attrs.size || 28);
    setBg(attrs.bg || '');

    if (attrs.border) {
      const bParts = attrs.border.split(' ');
      setBorderWidth(parseInt(bParts[0], 10) || 1);
      setBorderStyle(bParts[1] || 'solid');
      setBorderColor(bParts[2] || '#38BDF8');
    } else {
      setBorderWidth(0);
    }

    setBorderRadius(attrs.radius || '8px');
    setPadding(attrs.padding ? parseInt(attrs.padding, 10) : 0);
    setOpacity(attrs.opacity ?? 1);
    setShadowColor(attrs.shadow || '');
    setRotateAngle(attrs.rotate || 0);
    setFlipX(attrs.flipx || false);
    setFlipY(attrs.flipy || false);
    setSpin(attrs.spin || false);
    setPulse(attrs.pulse || false);
    setBounce(attrs.bounce || false);
    setFloat(attrs.float || false);
    setFilterMode(attrs.filter || 'none');

    // Estado del relleno duotono
    const autoPalette = getDuoPalette(targetIcon);
    setDuoOpacity(attrs.duoOpacity ?? 0.35);
    if (!attrs.duo) {
      setFillMode('line');
      setDuoFill(autoPalette.fill);
      setDuoStroke(autoPalette.stroke);
    } else if (attrs.duo === 'auto' || attrs.duo === 'true') {
      setFillMode('auto');
      setDuoFill(autoPalette.fill);
      setDuoStroke(autoPalette.stroke);
    } else {
      const resolved = resolveDuoColors(attrs.duo, targetIcon);
      setFillMode('duo');
      setDuoFill(resolved?.fill || autoPalette.fill);
      setDuoStroke(resolved?.stroke || autoPalette.stroke);
    }
  }, [isOpen, iconName, initialShortcode]);

  // Colores efectivos que se están viendo en la vista previa
  const activePalette = getDuoPalette(name);
  const effectiveFill =
    fillMode === 'auto' ? activePalette.fill : fillMode === 'duo' ? duoFill : null;
  const effectiveStroke =
    fillMode === 'auto'
      ? activePalette.stroke
      : fillMode === 'duo'
        ? duoStroke
        : color || '#38BDF8';

  // Generate shortcode string from visual control states
  const generatedShortcode = (() => {
    const parts = [];

    if (fillMode === 'auto') {
      parts.push('duo=auto');
    } else if (fillMode === 'duo') {
      parts.push(`duo="${duoFill},${duoStroke}"`);
    } else if (color) {
      parts.push(`color="${color}"`);
    }
    if (fillMode !== 'line' && Math.abs(duoOpacity - 0.35) > 0.001) {
      parts.push(`duoopacity="${duoOpacity}"`);
    }

    if (size !== 18) parts.push(`size="${size}"`);
    if (bg) parts.push(`bg="${bg}"`);
    if (borderWidth > 0) parts.push(`border="${borderWidth}px ${borderStyle} ${borderColor}"`);
    // El radio solo se nota si hay fondo o borde: no ensuciamos el Markdown si no
    if (borderRadius && borderRadius !== '0px' && (bg || borderWidth > 0)) {
      parts.push(`radius="${borderRadius}"`);
    }
    if (padding > 0) parts.push(`padding="${padding}px"`);
    if (shadowColor) parts.push(`shadow="${shadowColor}"`);
    if (opacity < 1) parts.push(`opacity="${opacity}"`);
    if (rotateAngle > 0) parts.push(`rotate="${rotateAngle}"`);
    if (flipX) parts.push(`flipx=true`);
    if (flipY) parts.push(`flipy=true`);
    if (spin) parts.push(`spin=true`);
    if (pulse) parts.push(`pulse=true`);
    if (bounce) parts.push(`bounce=true`);
    if (float) parts.push(`float=true`);
    if (filterMode && filterMode !== 'none') parts.push(`filter="${filterMode}"`);

    return parts.length > 0 ? `:${name}{${parts.join(' ')}}:` : `:${name}:`;
  })();

  useEffect(() => {
    setRawCode(generatedShortcode);
  }, [generatedShortcode]);

  const applyPaletteSwatch = (key) => {
    const palette = DUO_PALETTES[key];
    if (!palette) return;
    setFillMode('duo');
    setDuoFill(palette.fill);
    setDuoStroke(palette.stroke);
  };

  // Keyboard navigation (ESC to cancel, ENTER to confirm)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onApplyIconStyle(rawCode || generatedShortcode);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, rawCode, generatedShortcode, onClose, onApplyIconStyle]);

  if (!isOpen) return null;

  const handleSave = () => {
    onApplyIconStyle(rawCode || generatedShortcode);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Palette size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Estilizar Icono Visual :{name}:</h3>
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Live Preview Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color-strong)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '120px',
            position: 'relative'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${padding}px`,
              background: bg || 'transparent',
              border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
              borderRadius: borderRadius,
              opacity: opacity,
              filter: shadowColor ? `drop-shadow(0 0 14px ${shadowColor}) ${filterMode !== 'none' ? filterMode : ''}` : filterMode !== 'none' ? filterMode : 'none',
              transform: `rotate(${rotateAngle}deg) ${flipX ? 'scaleX(-1)' : ''} ${flipY ? 'scaleY(-1)' : ''}`,
              animation: spin ? 'spin 3s linear infinite' : pulse ? 'pulse 1.8s ease-in-out infinite' : bounce ? 'bounce 1.5s ease infinite' : float ? 'float 3s ease-in-out infinite' : 'none'
            }}>
              <DynamicLucideIcon
                name={name}
                size={size}
                color={effectiveStroke}
                fill={effectiveFill || undefined}
                fillOpacity={duoOpacity}
              />
            </div>
          </div>

          {/* ---- RELLENO: línea / multicolor automático / duotono a medida ---- */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Relleno del Icono:
            </label>

            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
              {[
                { id: 'line', label: 'Línea', hint: 'Trazo de un solo color (estilo clásico)' },
                { id: 'auto', label: 'Multicolor auto', hint: `Usa la paleta de su categoría (${activePalette.label})` },
                { id: 'duo', label: 'Duotono a medida', hint: 'Elige relleno y trazo manualmente' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  title={mode.hint}
                  className={`btn btn-sm ${fillMode === mode.id ? 'btn-primary' : ''}`}
                  onClick={() => setFillMode(mode.id)}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {fillMode !== 'line' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Paletas rápidas */}
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {Object.entries(DUO_PALETTES).map(([key, palette]) => {
                    const isActive = fillMode === 'duo' && duoFill === palette.fill && duoStroke === palette.stroke;
                    return (
                      <button
                        key={key}
                        type="button"
                        title={palette.label}
                        onClick={() => applyPaletteSwatch(key)}
                        style={{
                          width: '26px',
                          height: '20px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          padding: 0,
                          background: palette.fill,
                          border: `2px solid ${isActive ? '#fff' : palette.stroke}`
                        }}
                      />
                    );
                  })}
                </div>

                {fillMode === 'duo' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Relleno
                      <input type="color" value={duoFill} onChange={(e) => setDuoFill(e.target.value)}
                        style={{ width: '32px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Trazo
                      <input type="color" value={duoStroke} onChange={(e) => setDuoStroke(e.target.value)}
                        style={{ width: '32px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                    </label>
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Intensidad del relleno:</span>
                    <strong>{Math.round(duoOpacity * 100)}%</strong>
                  </div>
                  <input type="range" min="0.05" max="1" step="0.05" value={duoOpacity}
                    onChange={(e) => setDuoOpacity(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
                </div>

                {fillMode === 'auto' && (
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Paleta <strong style={{ color: activePalette.fill }}>{activePalette.label}</strong>, asignada
                    automáticamente a la categoría de <code>:{name}:</code>. Cada icono del documento se colorea solo.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* VISUAL CONTROL TABS & PANELS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            {/* Left Column: Color, Size, Background, Border */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Color (solo aplica en modo Línea; en duotono manda la paleta) */}
              <div style={{ display: fillMode === 'line' ? 'block' : 'none' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  Color Principal:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    style={{ width: '36px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {['#38BDF8', '#A855F7', '#10B981', '#F59E0B', '#F43F5E', '#FFFFFF'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          border: color === c ? '2px solid white' : 'none',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Size Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  <span>Tamaño del Icono:</span>
                  <strong>{size}px</strong>
                </div>
                <input
                  type="range"
                  min="12"
                  max="128"
                  value={size}
                  onChange={e => setSize(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              {/* Background Color & Gradients */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  Color de Fondo:
                </label>
                <input
                  type="text"
                  placeholder="ej. rgba(56,189,248,0.15) o linear-gradient(...)"
                  value={bg}
                  onChange={e => setBg(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
                  <button type="button" className="btn btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => setBg('')}>Ninguno</button>
                  <button type="button" className="btn btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => setBg('rgba(56,189,248,0.15)')}>Azul Soft</button>
                  <button type="button" className="btn btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => setBg('linear-gradient(135deg, #a855f7, #38bdf8)')}>Gradient</button>
                </div>
              </div>

              {/* Border Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  Borde & Forma (Radius):
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={borderWidth}
                    onChange={e => setBorderWidth(parseInt(e.target.value, 10) || 0)}
                    placeholder="Ancho px"
                    style={{ width: '70px', padding: '0.3rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '0.8rem' }}
                  />
                  <select
                    value={borderStyle}
                    onChange={e => setBorderStyle(e.target.value)}
                    style={{ padding: '0.3rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '0.8rem' }}
                  >
                    <option value="solid">Sólido</option>
                    <option value="dashed">Punteado</option>
                    <option value="dotted">Puntos</option>
                    <option value="double">Doble</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {['0px', '4px', '8px', '16px', '50%'].map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`btn btn-sm ${borderRadius === r ? 'btn-accent' : ''}`}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                      onClick={() => setBorderRadius(r)}
                    >
                      {r === '50%' ? 'Círculo' : r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Effects, Rotation, Animations, Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Padding & Opacity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Padding: <strong>{padding}px</strong></label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={padding}
                    onChange={e => setPadding(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opacidad: <strong>{Math.round(opacity * 100)}%</strong></label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={e => setOpacity(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                  />
                </div>
              </div>

              {/* Shadow / Glow Color */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  Sombra / Brillo (Glow Color):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="ej. #38BDF8 o rgba(...)"
                    value={shadowColor}
                    onChange={e => setShadowColor(e.target.value)}
                    style={{ flex: 1, padding: '0.35rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '0.8rem' }}
                  />
                  <button type="button" className="btn btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => setShadowColor('#38BDF8')}>Brillo Cyan</button>
                  <button type="button" className="btn btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => setShadowColor('')}>Sin Sombra</button>
                </div>
              </div>

              {/* Static Rotation & Flips */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  <span>Rotación Estática:</span>
                  <strong>{rotateAngle}°</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotateAngle}
                  onChange={e => setRotateAngle(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={flipX} onChange={e => setFlipX(e.target.checked)} />
                    <span>Espejo H (Flip X)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={flipY} onChange={e => setFlipY(e.target.checked)} />
                    <span>Espejo V (Flip Y)</span>
                  </label>
                </div>
              </div>

              {/* Animations */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  Animación CSS:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={spin} onChange={e => { setSpin(e.target.checked); if (e.target.checked) { setPulse(false); setBounce(false); setFloat(false); } }} />
                    <span>Rotación (Spin)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={pulse} onChange={e => { setPulse(e.target.checked); if (e.target.checked) { setSpin(false); setBounce(false); setFloat(false); } }} />
                    <span>Palpitar (Pulse)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={bounce} onChange={e => { setBounce(e.target.checked); if (e.target.checked) { setSpin(false); setPulse(false); setFloat(false); } }} />
                    <span>Rebotar (Bounce)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={float} onChange={e => { setFloat(e.target.checked); if (e.target.checked) { setSpin(false); setPulse(false); setBounce(false); } }} />
                    <span>Flotación (Float)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* DIRECT CODE EDIT OPTION */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              <Code2 size={14} color="var(--accent-purple)" />
              <span>Edición Directa por Código (ENTER para guardar, ESC para cancelar):</span>
            </div>
            <input
              type="text"
              value={rawCode}
              onChange={e => setRawCode(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: '#090D16',
                border: '1px solid var(--border-color-strong)',
                borderRadius: 'var(--radius-md)',
                color: '#38BDF8',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn" onClick={onClose}>Cancelar (ESC)</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Aplicar (ENTER)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
