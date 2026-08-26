import React, { useState, useEffect } from 'react';

export function ResizableSplitter({ onResize }) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const windowWidth = window.innerWidth;
      const newRatio = (e.clientX / windowWidth) * 100;
      // Clamp between 20% and 80%
      const clampedRatio = Math.max(20, Math.min(80, newRatio));
      onResize(clampedRatio);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize]);

  return (
    <>
      {/* Global Transparent Overlay during dragging to prevent textareas/iframes from swallowing mouse events */}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            cursor: 'col-resize',
            userSelect: 'none'
          }}
        />
      )}
      <div
        className={`splitter-handle ${isDragging ? 'dragging' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        title="Arrastra con el mouse para redimensionar el ancho de los paneles"
      />
    </>
  );
}
