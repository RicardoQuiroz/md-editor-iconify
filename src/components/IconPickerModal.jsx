import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ICON_CATALOG, ICON_CATEGORIES, DUO_PALETTES, getDuoPalette } from '../utils/iconCatalog';
import { DynamicLucideIcon } from './DynamicLucideIcon';
import { Search, X, Sparkles, Star, LayoutGrid, Palette } from 'lucide-react';

const RECENTS_KEY = 'iconify_recent_icons_v1';
const MAX_RECENTS = 12;

function readRecents() {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.slice(0, MAX_RECENTS) : [];
  } catch (err) {
    return [];
  }
}

function pushRecent(iconName) {
  const list = [iconName, ...readRecents().filter((n) => n !== iconName)].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(list));
  } catch (err) {
    /* espacio lleno: no es crítico */
  }
  return list;
}

export function IconPickerModal({ isOpen, onClose, onSelectIcon }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [colorful, setColorful] = useState(true);
  const [recents, setRecents] = useState([]);

  const gridRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (isOpen) setRecents(readRecents());
  }, [isOpen]);

  const totalCount = ICON_CATALOG.length;

  const filteredIcons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let base = ICON_CATALOG;
    if (selectedCategory === 'Recientes') {
      base = recents
        .map((name) => ICON_CATALOG.find((item) => item.icon === name))
        .filter(Boolean);
    } else if (selectedCategory !== 'Todos') {
      base = ICON_CATALOG.filter((item) => item.category === selectedCategory);
    }

    if (!term) return base;

    return base.filter(
      (item) =>
        item.icon.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.keywords.some((kw) => kw.includes(term))
    );
  }, [searchTerm, selectedCategory, recents]);

  // Cuántas columnas tiene la cuadrícula ahora mismo (para las flechas ↑ ↓)
  const columnCount = () => {
    const grid = gridRef.current;
    if (!grid) return 5;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
    return Math.max(1, cols);
  };

  useEffect(() => {
    setFocusedIndex(0);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (!isOpen || !gridRef.current) return;
    gridRef.current.children[focusedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex, isOpen]);

  const choose = (iconName) => {
    setRecents(pushRecent(iconName));
    onSelectIcon(iconName, colorful);
    onClose();
  };

  // Teclado: flechas para moverse, ENTER para insertar, ESC para cerrar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const last = filteredIcons.length - 1;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredIcons[focusedIndex]) choose(filteredIcons[focusedIndex].icon);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(last, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(last, prev + columnCount()));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(0, prev - columnCount()));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setFocusedIndex(last);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, focusedIndex, filteredIcons, colorful, onClose, onSelectIcon]);

  if (!isOpen) return null;

  const renderCategoryButton = (name, count, paletteKey, icon) => {
    const isActive = selectedCategory === name;
    const palette = DUO_PALETTES[paletteKey];
    return (
      <button
        key={name}
        type="button"
        className={`icon-cat-item ${isActive ? 'active' : ''}`}
        onClick={() => setSelectedCategory(name)}
        title={`${name} — ${count} iconos`}
      >
        <span className="icon-cat-dot" style={{ background: palette ? palette.fill : 'var(--text-muted)' }}>
          {icon}
        </span>
        <span className="icon-cat-name">{name}</span>
        <span className="icon-cat-count">{count}</span>
      </button>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content icon-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Explorador de Iconos</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {totalCount} iconos · {ICON_CATEGORIES.length} categorías
            </span>
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Buscador a todo el ancho */}
        <div className="icon-picker-search">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar por nombre, palabra clave o categoría…  (Flechas para navegar · ENTER inserta · ESC cierra)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '0.55rem 0.8rem 0.55rem 2.4rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color-strong)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <button
            type="button"
            className={`btn btn-sm ${colorful ? 'btn-primary' : ''}`}
            onClick={() => setColorful((v) => !v)}
            title={
              colorful
                ? 'Insertar en multicolor (duotono automático por categoría)'
                : 'Insertar en trazo simple de un color'
            }
            style={{ whiteSpace: 'nowrap' }}
          >
            <Palette size={15} />
            <span>{colorful ? 'Multicolor' : 'Línea'}</span>
          </button>
        </div>

        {/* Cuerpo en dos columnas: categorías + cuadrícula */}
        <div className="icon-picker-body">
          <nav className="icon-cat-column">
            {renderCategoryButton('Todos', totalCount, null, <LayoutGrid size={11} color="#fff" />)}
            {recents.length > 0 &&
              renderCategoryButton('Recientes', recents.length, 'amber', <Star size={11} color="#fff" />)}
            <div className="icon-cat-separator" />
            {ICON_CATEGORIES.map((cat) => renderCategoryButton(cat.name, cat.count, cat.palette, null))}
          </nav>

          <div className="icon-picker-results">
            {filteredIcons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                No se encontraron iconos para “{searchTerm}”.
              </div>
            ) : (
              <div className="icon-grid" ref={gridRef}>
                {filteredIcons.map((item, idx) => {
                  const isFocused = idx === focusedIndex;
                  const palette = getDuoPalette(item.icon);
                  return (
                    <div
                      key={`${item.category}-${item.icon}`}
                      className={`icon-card ${isFocused ? 'focused' : ''}`}
                      onClick={() => choose(item.icon)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      title={`${item.icon} · ${item.category}`}
                    >
                      <DynamicLucideIcon
                        name={item.icon}
                        size={26}
                        color={colorful ? palette.stroke : 'var(--accent-primary)'}
                        fill={colorful ? palette.fill : undefined}
                        fillOpacity={0.45}
                      />
                      <span className="icon-card-label">{item.icon}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="icon-picker-footer">
          <span>
            {filteredIcons.length} resultado{filteredIcons.length === 1 ? '' : 's'}
            {selectedCategory !== 'Todos' ? ` en ${selectedCategory}` : ''}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            {filteredIcons[focusedIndex]
              ? `Seleccionado: ${filteredIcons[focusedIndex].icon}`
              : 'Sin selección'}
          </span>
        </div>
      </div>
    </div>
  );
}
