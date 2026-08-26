import React from 'react';

/**
 * Editor del código Markdown.
 *
 * El arrastrar y soltar lo gestiona <DropOverlay> a nivel de ventana, para que
 * funcione igual aquí, en la vista WYSIWYG y sobre la barra lateral.
 */
export function EditorPanel({ markdown, onChangeMarkdown, textareaRef, onCaretPositionChange }) {
  const handleCaretChange = () => {
    if (!textareaRef.current) return;
    // Se informa del desplazamiento del cursor: la vista previa lo traduce al bloque exacto.
    onCaretPositionChange?.(textareaRef.current.selectionStart ?? 0);
  };

  return (
    <div className="panel panel-editor" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div className="panel-content" style={{ overflow: 'hidden', height: '100%' }}>
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={markdown}
          onChange={(e) => onChangeMarkdown(e.target.value)}
          onClick={handleCaretChange}
          onKeyUp={handleCaretChange}
          onSelect={handleCaretChange}
          placeholder="Escribe tu contenido en Markdown aquí, o arrastra un archivo a la ventana…"
          spellCheck={false}
          style={{ padding: '2rem 3rem', fontSize: '1rem', lineHeight: '1.7' }}
        />
      </div>
    </div>
  );
}
