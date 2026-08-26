import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Replace,
  X,
  ChevronUp,
  ChevronDown,
  CaseSensitive,
  WholeWord,
  Regex
} from 'lucide-react';
import { buildMatcher, findMatches, lineNumberAt } from '../utils/searchReplace';

/**
 * Barra de búsqueda y reemplazo.
 *
 * Va acoplada bajo la barra superior en lugar de ser una ventana modal, para
 * poder ver el documento mientras se navega por las coincidencias.
 */
export function SearchReplaceBar({
  isOpen,
  markdown,
  initialQuery,
  onClose,
  onGoToMatch,
  onReplaceOne,
  onReplaceAll
}) {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [current, setCurrent] = useState(0);

  const queryRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialQuery) setQuery(initialQuery);
    setTimeout(() => {
      queryRef.current?.focus();
      queryRef.current?.select();
    }, 20);
  }, [isOpen, initialQuery]);

  const { regex, error } = useMemo(
    () => buildMatcher(query, { caseSensitive, wholeWord, useRegex }),
    [query, caseSensitive, wholeWord, useRegex]
  );

  const matches = useMemo(() => findMatches(markdown, regex), [markdown, regex]);

  // Al cambiar la búsqueda o el documento, el índice puede quedar fuera de rango
  useEffect(() => {
    setCurrent((prev) => (matches.length === 0 ? 0 : Math.min(prev, matches.length - 1)));
  }, [matches.length]);

  const irA = (indice) => {
    if (matches.length === 0) return;
    const siguiente = (indice + matches.length) % matches.length;
    setCurrent(siguiente);
    onGoToMatch?.(matches[siguiente]);
  };

  const siguiente = () => irA(current + 1);
  const anterior = () => irA(current - 1);

  const reemplazarUno = () => {
    if (matches.length === 0) return;
    onReplaceOne?.(matches[current], replacement, { regex, useRegex });
  };

  const reemplazarTodo = () => {
    if (matches.length === 0) return;
    onReplaceAll?.(regex, replacement, { useRegex });
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hayResultados = matches.length > 0;
  const actual = matches[current];

  const manejarEnterBusqueda = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (e.shiftKey) anterior();
    else siguiente();
  };

  return (
    <div className="search-bar" role="search">
      <div className="search-row">
        <div className="search-field">
          <Search size={15} color="var(--text-muted)" />
          <input
            ref={queryRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={manejarEnterBusqueda}
            placeholder="Buscar en el documento…"
            aria-label="Texto a buscar"
          />
        </div>

        <span className={`search-count ${query && !hayResultados && !error ? 'empty' : ''}`}>
          {error
            ? 'Expresión no válida'
            : !query
              ? 'Sin búsqueda'
              : hayResultados
                ? `${current + 1} de ${matches.length}`
                : 'Sin coincidencias'}
        </span>

        <div className="search-nav">
          <button type="button" className="btn btn-sm" onClick={anterior} disabled={!hayResultados} title="Coincidencia anterior (Mayús+Enter)">
            <ChevronUp size={15} />
          </button>
          <button type="button" className="btn btn-sm" onClick={siguiente} disabled={!hayResultados} title="Coincidencia siguiente (Enter)">
            <ChevronDown size={15} />
          </button>
        </div>

        <div className="search-options">
          <button
            type="button"
            className={`btn btn-sm ${caseSensitive ? 'btn-primary' : ''}`}
            onClick={() => setCaseSensitive((v) => !v)}
            title="Distinguir mayúsculas y minúsculas"
          >
            <CaseSensitive size={15} />
          </button>
          <button
            type="button"
            className={`btn btn-sm ${wholeWord ? 'btn-primary' : ''}`}
            onClick={() => setWholeWord((v) => !v)}
            title="Solo palabras completas"
          >
            <WholeWord size={15} />
          </button>
          <button
            type="button"
            className={`btn btn-sm ${useRegex ? 'btn-primary' : ''}`}
            onClick={() => setUseRegex((v) => !v)}
            title="Usar expresión regular (admite $1, $2… en el reemplazo)"
          >
            <Regex size={15} />
          </button>
        </div>

        <button type="button" className="btn btn-sm search-close" onClick={onClose} title="Cerrar (ESC)">
          <X size={16} />
        </button>
      </div>

      <div className="search-row">
        <div className="search-field">
          <Replace size={15} color="var(--text-muted)" />
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="Reemplazar por…"
            aria-label="Texto de reemplazo"
          />
        </div>

        <span className="search-position">
          {actual ? `línea ${lineNumberAt(markdown, actual.start)}` : ''}
        </span>

        <button type="button" className="btn btn-sm" onClick={reemplazarUno} disabled={!hayResultados}>
          Reemplazar
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={reemplazarTodo}
          disabled={!hayResultados}
          title={hayResultados ? `Reemplazar las ${matches.length} coincidencias` : 'No hay coincidencias'}
        >
          Reemplazar todo{hayResultados ? ` (${matches.length})` : ''}
        </button>
      </div>

      {error && <p className="search-error">{error}</p>}
    </div>
  );
}
