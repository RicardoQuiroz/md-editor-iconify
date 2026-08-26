import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ListTree, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { extractHeadings, findActiveHeading } from '../utils/tableOfContents';

export function TableOfContents({ markdown, currentOffset, onNavigate }) {
  const [filter, setFilter] = useState('');
  const [collapsed, setCollapsed] = useState(() => new Set());
  const listRef = useRef(null);

  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  const active = useMemo(() => findActiveHeading(headings, currentOffset), [headings, currentOffset]);

  // El nivel mínimo presente marca la sangría base (documentos que empiezan en ##)
  const baseLevel = useMemo(
    () => (headings.length ? Math.min(...headings.map((h) => h.level)) : 1),
    [headings]
  );

  const term = filter.trim().toLowerCase();

  /** Un encabezado se oculta si algún ancestro está plegado. */
  const hiddenIds = useMemo(() => {
    const hidden = new Set();
    if (collapsed.size === 0) return hidden;

    for (let i = 0; i < headings.length; i++) {
      if (!collapsed.has(headings[i].id)) continue;
      const parentLevel = headings[i].level;
      for (let j = i + 1; j < headings.length && headings[j].level > parentLevel; j++) {
        hidden.add(headings[j].id);
      }
    }
    return hidden;
  }, [collapsed, headings]);

  const hasChildren = (index) =>
    index + 1 < headings.length && headings[index + 1].level > headings[index].level;

  const visible = headings.filter((heading, index) => {
    if (term) return heading.text.toLowerCase().includes(term);
    return !hiddenIds.has(heading.id);
  });

  const toggle = (id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Mantener visible la sección activa mientras se navega por el documento
  useEffect(() => {
    if (!active || !listRef.current) return;
    listRef.current
      .querySelector(`[data-toc-id="${active.id}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (headings.length === 0) {
    return (
      <div className="toc-empty">
        <ListTree size={26} color="var(--text-muted)" />
        <p>Este documento aún no tiene encabezados.</p>
        <span>
          Añade líneas que empiecen por <code>#</code>, <code>##</code> o <code>###</code> y
          aparecerán aquí automáticamente.
        </span>
      </div>
    );
  }

  return (
    <div className="toc-panel">
      <div className="toc-search">
        <Search size={13} color="var(--text-muted)" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filtrar ${headings.length} secciones…`}
        />
      </div>

      <div className="toc-list" ref={listRef}>
        {visible.map((heading) => {
          const isActive = active && active.id === heading.id;
          const depth = Math.min(heading.level - baseLevel, 4);
          const expandable = !term && hasChildren(heading.index);
          const isCollapsed = collapsed.has(heading.id);

          return (
            <div
              key={heading.id}
              data-toc-id={heading.id}
              className={`toc-item toc-level-${heading.level} ${isActive ? 'active' : ''}`}
              style={{ paddingLeft: `${0.45 + depth * 0.75}rem` }}
              onClick={() => onNavigate(heading)}
              title={heading.text}
            >
              <button
                type="button"
                className="toc-twisty"
                onClick={(e) => {
                  e.stopPropagation();
                  if (expandable) toggle(heading.id);
                }}
                tabIndex={-1}
                style={{ visibility: expandable ? 'visible' : 'hidden' }}
                aria-label={isCollapsed ? 'Desplegar' : 'Plegar'}
              >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
              <span className="toc-text">{heading.text}</span>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div style={{ padding: '1rem 0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Ninguna sección coincide con “{filter}”.
          </div>
        )}
      </div>
    </div>
  );
}
