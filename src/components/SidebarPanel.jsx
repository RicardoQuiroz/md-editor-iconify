import React from 'react';
import { FolderOpen, ListTree, ChevronLeft } from 'lucide-react';
import { SidebarFiles } from './SidebarFiles';
import { TableOfContents } from './TableOfContents';

/**
 * Barra lateral con dos pestañas: Archivos e Índice (tabla de contenidos).
 * Comparte el mismo ancho, así que activar el índice no roba espacio extra.
 */
export function SidebarPanel({
  isCollapsed,
  activeTab,
  onChangeTab,
  onToggleSidebar,
  // Archivos
  files,
  activeFileId,
  onSelectFile,
  onNewFile,
  onCloseFile,
  onRenameFile,
  isFileDirty,
  // Índice
  markdown,
  currentOffset,
  onNavigateHeading
}) {
  if (isCollapsed) return null;

  const tabs = [
    { id: 'files', label: 'Archivos', icon: <FolderOpen size={14} />, badge: files.length },
    { id: 'toc', label: 'Índice', icon: <ListTree size={14} /> }
  ];

  return (
    <aside className="sidebar-files">
      <div className="sidebar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onChangeTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge != null && <span className="sidebar-tab-badge">{tab.badge}</span>}
          </button>
        ))}
        <button
          className="btn btn-sm sidebar-collapse"
          onClick={onToggleSidebar}
          title="Colapsar panel lateral"
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      {activeTab === 'files' ? (
        <SidebarFiles
          files={files}
          activeFileId={activeFileId}
          onSelectFile={onSelectFile}
          onNewFile={onNewFile}
          onCloseFile={onCloseFile}
          onRenameFile={onRenameFile}
          isFileDirty={isFileDirty}
        />
      ) : (
        <TableOfContents
          markdown={markdown}
          currentOffset={currentOffset}
          onNavigate={onNavigateHeading}
        />
      )}
    </aside>
  );
}
