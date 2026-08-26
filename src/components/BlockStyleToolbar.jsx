import React from 'react';
import { PARAGRAPH_PRESETS } from '../utils/markdownCompiler';
import { Layers, Sparkles, Type } from 'lucide-react';
import { DynamicLucideIcon } from './DynamicLucideIcon';

export function BlockStyleToolbar({ onApplyPreset, onOpenTextStyleModal }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.4rem 0.8rem',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      overflowX: 'auto'
    }}>
      {/* Visual Text Style Customizer Button */}
      <button
        className="btn btn-accent btn-sm"
        onClick={() => onOpenTextStyleModal('')}
        title="Abrir el Editor Visual de Texto (Títulos, Párrafos, Fuentes, Colores)"
        style={{ whiteSpace: 'nowrap', fontWeight: 600 }}
      >
        <Type size={15} color="var(--accent-primary)" />
        <span>Editor Visual de Texto</span>
      </button>

      <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 0.3rem' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginRight: '0.2rem', whiteSpace: 'nowrap' }}>
        <Layers size={14} color="var(--accent-primary)" />
        <span>Presets de Bloque:</span>
      </div>

      {PARAGRAPH_PRESETS.map(preset => (
        <button
          key={preset.id}
          className="btn btn-sm"
          onClick={() => onApplyPreset(preset.id)}
          title={preset.desc}
          style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem',
            whiteSpace: 'nowrap',
            gap: '0.3rem'
          }}
        >
          <DynamicLucideIcon name={preset.icon} size={14} color="var(--accent-primary)" />
          {preset.name}
        </button>
      ))}
    </div>
  );
}
