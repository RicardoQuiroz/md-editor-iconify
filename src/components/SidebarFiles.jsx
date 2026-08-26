import React from 'react';
import { FileText, Plus, X, Edit2 } from 'lucide-react';

export function SidebarFiles({
  files,
  activeFileId,
  onSelectFile,
  onNewFile,
  onCloseFile,
  onRenameFile,
  isFileDirty
}) {
  return (
    <div style={{ padding: '0.8rem', flex: 1, overflowY: 'auto' }}>
      <button
        className="btn btn-primary btn-sm"
        onClick={onNewFile}
        style={{ width: '100%', marginBottom: '0.8rem', justifyContent: 'center' }}
      >
        <Plus size={15} />
        <span>Nuevo Archivo</span>
      </button>

      {files.map((file) => {
        const isActive = file.id === activeFileId;
        const dirty = isFileDirty ? isFileDirty(file) : false;

        return (
          <div
            key={file.id}
            className={`file-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectFile(file.id)}
            title={dirty ? `${file.name} — con cambios sin guardar` : file.name}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
              <FileText size={15} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
              {dirty && <span className="dirty-dot" aria-label="Cambios sin guardar" />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <button
                className="btn btn-sm"
                style={{ padding: '0.1rem 0.2rem', border: 'none', background: 'transparent' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt('Nuevo nombre de archivo:', file.name);
                  if (newName) onRenameFile(file.id, newName);
                }}
                title="Renombrar archivo"
              >
                <Edit2 size={12} color="var(--text-muted)" />
              </button>

              {files.length > 1 && (
                <button
                  className="btn btn-sm"
                  style={{ padding: '0.1rem 0.2rem', border: 'none', background: 'transparent' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.id);
                  }}
                  title={dirty ? 'Cerrar archivo (tiene cambios sin guardar)' : 'Cerrar archivo'}
                >
                  <X size={12} color={dirty ? 'var(--accent-amber)' : 'var(--text-muted)'} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
