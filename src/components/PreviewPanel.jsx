import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { compileMarkdownToHtml } from '../utils/markdownCompiler';
import {
  collectFocusableElements,
  describeElement,
  getBlockRange
} from '../utils/sourceMap';

export function PreviewPanel({
  markdown,
  onChangeMarkdown,
  previewContainerRef,
  syncRequest,
  onFocusedObjectChange,
  onOpenIconStyleModal,
  onOpenTextStyleModal,
  onOpenImageSettings,
  onOpenMediaModal
}) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const focusedIndexRef = useRef(0);
  const markdownRef = useRef(markdown);
  const isResizingRef = useRef(false);
  // Último índice sobre el que se hizo scroll y última selección notificada
  const lastScrolledIndexRef = useRef(-1);
  const lastNotifiedRef = useRef(null);
  // Los saltos (Ctrl+Q, índice, búsqueda) centran el objeto; las flechas solo
  // desplazan lo imprescindible, para que recorrer el documento no dé tirones.
  const centrarSiguienteRef = useRef(false);

  markdownRef.current = markdown;

  const compiledHtml = useMemo(() => compileMarkdownToHtml(markdown), [markdown]);

  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  /* ------------------------------------------------------------------ *
   * The panel must be focused for the arrow keys to reach it.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const container = previewContainerRef.current;
    if (container) container.focus({ preventScroll: true });
  }, [previewContainerRef]);

  /* ------------------------------------------------------------------ *
   * Ctrl+Q sync coming from the Markdown editor: focus the block that
   * contains the caret offset of the source panel.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!syncRequest || typeof syncRequest.offset !== 'number') return;
    const container = previewContainerRef.current;
    if (!container) return;

    const elements = collectFocusableElements(container);
    if (elements.length === 0) return;

    let bestIndex = -1;
    elements.forEach((el, index) => {
      const block = getBlockRange(el, container);
      if (!block) return;
      if (syncRequest.offset >= block.start && syncRequest.offset < block.end && bestIndex === -1) {
        bestIndex = index;
      }
    });

    if (bestIndex === -1) {
      // Fall back to the last block that starts before the caret
      elements.forEach((el, index) => {
        const block = getBlockRange(el, container);
        if (block && block.start <= syncRequest.offset) bestIndex = index;
      });
    }

    if (bestIndex >= 0) {
      // Viene de un salto: el objeto debe quedar centrado, en la misma altura
      // de pantalla que ocupa en el otro panel.
      centrarSiguienteRef.current = true;
      lastScrolledIndexRef.current = -1;
      setFocusedIndex(bestIndex);
    }
    container.focus({ preventScroll: true });
  }, [syncRequest, previewContainerRef]);

  /* ------------------------------------------------------------------ *
   * Marco azul punteado + manejadores de imagen sobre el objeto enfocado.
   *
   * El marco se aplica de forma imperativa sobre HTML inyectado con
   * dangerouslySetInnerHTML, así que CUALQUIER re-render (un toast, activar
   * deshacer, cambiar de tema…) puede reescribir ese HTML y borrarlo. Por eso
   * este efecto se ejecuta tras cada render y repinta solo si hace falta:
   * es una operación barata e idempotente que mantiene la selección estable.
   * ------------------------------------------------------------------ */
  const notifyFocus = useCallback(
    (descriptor) => {
      const signature = descriptor
        ? `${descriptor.kind}:${descriptor.start}:${descriptor.end}`
        : 'none';
      if (lastNotifiedRef.current === signature) return;
      lastNotifiedRef.current = signature;
      onFocusedObjectChange?.(descriptor);
    },
    [onFocusedObjectChange]
  );

  useLayoutEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const elements = collectFocusableElements(container);
    if (elements.length === 0) {
      notifyFocus(null);
      return;
    }

    const safeIndex = Math.min(Math.max(focusedIndex, 0), elements.length - 1);
    if (safeIndex !== focusedIndex) {
      setFocusedIndex(safeIndex);
      return;
    }

    const targetEl = elements[safeIndex];
    if (!targetEl) return;

    const alreadyFramed = targetEl.classList.contains('active-editor-highlight');
    const needsHandles =
      targetEl.tagName === 'IMG' && container.querySelectorAll('.image-resize-handle').length !== 4;

    if (!alreadyFramed || needsHandles) {
      container.querySelectorAll('.active-editor-highlight').forEach((el) => {
        el.classList.remove('active-editor-highlight');
        el.style.outline = '';
        el.style.outlineOffset = '';
      });
      container.querySelectorAll('.image-resize-handle').forEach((h) => h.remove());

      targetEl.classList.add('active-editor-highlight');
      targetEl.style.outline = '2px dashed var(--accent-primary)';
      targetEl.style.outlineOffset = '4px';

      if (targetEl.tagName === 'IMG') attachImageResizeHandles(targetEl);
    }

    // Desplazar solo cuando cambia realmente el objeto enfocado
    if (lastScrolledIndexRef.current !== safeIndex && !isResizingRef.current) {
      lastScrolledIndexRef.current = safeIndex;

      const centrar = centrarSiguienteRef.current;
      centrarSiguienteRef.current = false;

      targetEl.scrollIntoView({
        behavior: centrar ? 'auto' : 'smooth',
        block: centrar ? 'center' : 'nearest'
      });
    }

    notifyFocus(describeElement(markdownRef.current, targetEl, container));
  });

  /* ------------------------------------------------------------------ *
   * Image resize handles (4 corners, anchored to the image itself).
   * ------------------------------------------------------------------ */
  const attachImageResizeHandles = useCallback((imgEl) => {
    const container = previewContainerRef.current;
    if (!container) return;

    const corners = ['nw', 'ne', 'sw', 'se'];
    const handles = [];

    const placeHandles = () => {
      const containerRect = container.getBoundingClientRect();
      const imgRect = imgEl.getBoundingClientRect();
      const top = imgRect.top - containerRect.top + container.scrollTop;
      const left = imgRect.left - containerRect.left + container.scrollLeft;

      handles.forEach(({ corner, node }) => {
        node.style.top = `${(corner[0] === 'n' ? top : top + imgRect.height) - 5}px`;
        node.style.left = `${(corner[1] === 'w' ? left : left + imgRect.width) - 5}px`;
      });
    };

    corners.forEach((corner) => {
      const handle = document.createElement('div');
      handle.className = `image-resize-handle handle-${corner}`;
      handle.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: var(--accent-primary);
        border: 1px solid #fff;
        border-radius: 2px;
        z-index: 100;
        cursor: ${corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'};
      `;

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        isResizingRef.current = true;
        const startX = e.clientX;
        const startWidth = imgEl.clientWidth;

        const onMouseMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const newWidth = Math.max(60, startWidth + (corner[1] === 'e' ? dx : -dx));
          imgEl.style.width = `${newWidth}px`;
          placeHandles();
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);

          const newWidth = `${Math.round(imgEl.getBoundingClientRect().width)}px`;
          const descriptor = describeElement(markdownRef.current, imgEl, container);

          if (descriptor && descriptor.kind === 'image' && onChangeMarkdown) {
            const current = markdownRef.current;
            let tag = descriptor.text;
            if (/\{[^}]*\}$/.test(tag)) {
              tag = /width=/.test(tag)
                ? tag.replace(/width=[^\s}]+/, `width=${newWidth}`)
                : tag.replace(/\}$/, ` width=${newWidth}}`);
            } else {
              tag = `${tag}{wrap=${imgEl.getAttribute('data-wrap') || 'left'} width=${newWidth}}`;
            }
            const updated =
              current.slice(0, descriptor.start) + tag + current.slice(descriptor.end);
            onChangeMarkdown(updated);
          }

          isResizingRef.current = false;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      handles.push({ corner, node: handle });
      container.appendChild(handle);
    });

    placeHandles();
    // Images may still be loading; reposition once they are ready.
    if (!imgEl.complete) imgEl.addEventListener('load', placeHandles, { once: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChangeMarkdown, previewContainerRef]);

  /* ------------------------------------------------------------------ *
   * Open the modal that matches the focused object type.
   * ------------------------------------------------------------------ */
  const openModalForElement = useCallback(
    (el) => {
      const container = previewContainerRef.current;
      const descriptor = describeElement(markdownRef.current, el, container);
      if (!descriptor) return;

      if (descriptor.kind === 'media') {
        onOpenMediaModal?.(descriptor.text.trim(), descriptor);
      } else if (descriptor.kind === 'image') {
        onOpenImageSettings?.(descriptor.text, descriptor);
      } else if (descriptor.kind === 'icon') {
        const iconName = el.getAttribute('data-icon-name') || 'Shield';
        onOpenIconStyleModal?.(iconName, descriptor.text, descriptor);
      } else {
        onOpenTextStyleModal?.(descriptor.text, descriptor);
      }
    },
    [
      onOpenImageSettings,
      onOpenIconStyleModal,
      onOpenTextStyleModal,
      onOpenMediaModal,
      previewContainerRef
    ]
  );

  /* ------------------------------------------------------------------ *
   * Keyboard navigation.
   * Bound on `window` so the arrows keep working even when the focus ring
   * sits on a toolbar button; it steps aside for text fields and modals.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const isTypingTarget = (node) =>
      !!node &&
      (node.tagName === 'INPUT' ||
        node.tagName === 'TEXTAREA' ||
        node.tagName === 'SELECT' ||
        node.isContentEditable);

    const handleKeyDown = (e) => {
      const container = previewContainerRef.current;
      if (!container) return;
      // A modal owns the keyboard while it is open.
      if (document.querySelector('.modal-overlay')) return;
      if (isTypingTarget(document.activeElement)) return;

      const elements = collectFocusableElements(container);
      if (elements.length === 0) return;
      const last = elements.length - 1;

      // Ctrl+Enter -> open the modal of the framed object
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        openModalForElement(elements[Math.min(focusedIndexRef.current, last)]);
        return;
      }

      // Leave the global shortcuts (Ctrl+Q, Ctrl+S, Alt+Arrows...) alone.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(last, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setFocusedIndex(last);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        openModalForElement(elements[Math.min(focusedIndexRef.current, last)]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModalForElement, previewContainerRef]);

  /* ------------------------------------------------------------------ *
   * Mouse selection.
   * ------------------------------------------------------------------ */
  const focusFromEvent = (e) => {
    const container = previewContainerRef.current;
    if (!container) return null;

    const elements = collectFocusableElements(container);
    const icon = e.target.closest('.icon-wrapper');
    const image = e.target.closest('img');
    const target = icon || image || e.target.closest('[data-src-start]');
    if (!target) return null;

    const index = elements.indexOf(target);
    if (index >= 0) setFocusedIndex(index);
    container.focus({ preventScroll: true });
    return target;
  };

  const handlePreviewClick = (e) => {
    const target = focusFromEvent(e);
    // Clicking an icon opens its visual editor directly (see manual 5.2).
    if (target && target.classList && target.classList.contains('icon-wrapper')) {
      openModalForElement(target);
    }
  };

  const handlePreviewDoubleClick = (e) => {
    const target = focusFromEvent(e);
    if (!target) return;
    // En un reproductor el doble clic pertenece al propio reproductor
    // (pantalla completa), así que ahí solo se edita con Ctrl+Enter.
    if (target.closest('.media-embed')) return;
    openModalForElement(target);
  };

  return (
    <div className="panel panel-preview" style={{ width: '100%', height: '100%' }}>
      <div
        ref={previewContainerRef}
        className="panel-content"
        tabIndex={0}
        onClick={handlePreviewClick}
        onDoubleClick={handlePreviewDoubleClick}
        style={{ height: '100%', outline: 'none' }}
      >
        <div className="preview-container" dangerouslySetInnerHTML={{ __html: compiledHtml }} />
      </div>
    </div>
  );
}
