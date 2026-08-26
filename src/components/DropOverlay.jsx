import React, { useEffect, useState, useRef } from 'react';
import { FileDown, FolderOpen } from 'lucide-react';
import { collectDroppedFiles } from '../utils/fileAccess';

/**
 * Arrastrar y soltar en toda la ventana.
 *
 * Escucha en `window` en lugar de en un panel concreto, así funciona igual en
 * la vista WYSIWYG y en el editor de código, y también sobre la barra lateral.
 *
 * `dragenter` y `dragleave` se disparan al cruzar cualquier elemento hijo, así
 * que se lleva un contador para que la superposición no parpadee.
 */
export function DropOverlay({ onFilesDropped, onDraggingChange, hideOverlay = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const depthRef = useRef(0);
  const notifyRef = useRef(onDraggingChange);
  notifyRef.current = onDraggingChange;

  useEffect(() => {
    const hasFiles = (e) =>
      Array.from(e.dataTransfer?.types || []).includes('Files');

    // Un solo sitio decide si se está arrastrando; la pantalla de apertura
    // solo refleja ese estado, para que el evento no se procese dos veces.
    const setDragging = (value) => {
      setIsDragging(value);
      notifyRef.current?.(value);
    };

    const handleDragEnter = (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depthRef.current += 1;
      setDragging(true);
    };

    const handleDragOver = (e) => {
      if (!hasFiles(e)) return;
      // Sin esto el navegador abre el archivo en lugar de entregárnoslo
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };

    const handleDragLeave = (e) => {
      if (!hasFiles(e)) return;
      depthRef.current = Math.max(0, depthRef.current - 1);
      if (depthRef.current === 0) setDragging(false);
    };

    const handleDrop = async (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depthRef.current = 0;
      setDragging(false);

      const documents = await collectDroppedFiles(e.dataTransfer);
      onFilesDropped?.(documents);
    };

    const handleDragEnd = () => {
      depthRef.current = 0;
      setDragging(false);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragend', handleDragEnd);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, [onFilesDropped]);

  // Con la pantalla de apertura abierta, la zona discontinua de esa pantalla ya
  // hace de destino visible: una segunda superposición encima sobraría.
  if (!isDragging || hideOverlay) return null;

  return (
    <div className="drop-overlay" role="presentation">
      <div className="drop-overlay-card">
        <div className="drop-overlay-icons">
          <FileDown size={38} color="var(--accent-primary)" />
          <FolderOpen size={38} color="var(--accent-primary)" />
        </div>
        <h3>Suelta aquí tus documentos</h3>
        <p>
          Se abrirán en pestañas nuevas. Admite varios archivos a la vez y también
          carpetas enteras.
        </p>
        <span className="drop-overlay-formats">.md · .markdown · .mdx · .txt</span>
      </div>
    </div>
  );
}
