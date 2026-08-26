import React from 'react';
import {
  Sparkles,
  Image,
  Sun,
  Moon,
  Download,
  Copy,
  RotateCcw,
  Smile,
  FileCode,
  Undo2,
  Redo2,
  FolderOpen,
  Upload,
  Save,
  FilePlus,
  ClipboardPaste,
  Monitor,
  Code2,
  ListTree,
  CircleDot,
  Link2,
  Clapperboard,
  Replace,
  CaseUpper
} from 'lucide-react';

export function Navbar({
  theme,
  viewMode,
  onToggleViewMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isSidebarOpen,
  onToggleSidebar,
  onOpenTableOfContents,
  isDirty,
  dirtyCount,
  activeFileName,
  onNewFile,
  onSaveFile,
  onOpenFiles,
  lastOpenedName,
  canUseNativeFiles,
  onToggleTheme,
  onAutoInsertIcons,
  onOpenIconPicker,
  onOpenImageSettings,
  onOpenLinkModal,
  onOpenMediaModal,
  onOpenSearch,
  onOpenChangeCase,
  isSearchOpen,
  onCopyMarkdown,
  onPasteMarkdown,
  onDownloadMarkdown,
  onDownloadHtml,
  onResetDocument
}) {
  return (
    <header className="navbar">
      {/* Brand & Version Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button
          className={`btn btn-sm ${isSidebarOpen ? 'btn-primary' : ''}`}
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Cerrar panel de archivos' : 'Abrir panel de archivos'}
          style={{ padding: '0.45rem' }}
        >
          <FolderOpen size={18} />
        </button>

        <button
          className={`btn btn-sm ${isSidebarOpen ? 'btn-primary' : ''}`}
          onClick={onOpenTableOfContents}
          title="Tabla de contenidos del documento"
          style={{ padding: '0.45rem' }}
        >
          <ListTree size={18} />
        </button>

        <div className="navbar-brand">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ lineHeight: 1.1 }}>Iconify <span style={{ color: 'var(--accent-primary)' }}>MD</span> Editor</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {activeFileName ? `${isDirty ? '● ' : ''}${activeFileName}` : 'Editor Inteligente v5.0'}
            </div>
          </div>
        </div>

        {isDirty && (
          <span
            className="navbar-dirty"
            title={
              dirtyCount > 1
                ? `${dirtyCount} archivos con cambios sin guardar (Ctrl+S para guardar el activo)`
                : 'Este archivo tiene cambios sin guardar (Ctrl+S)'
            }
          >
            <CircleDot size={11} />
            Sin guardar{dirtyCount > 1 ? ` (${dirtyCount})` : ''}
          </span>
        )}
      </div>

      {/* ICON-ONLY GROUPED TOOLBARS */}
      <div className="navbar-actions" style={{ gap: '0.4rem' }}>
        {/* VIEW MODE TOGGLE BUTTON (CTRL+Q) */}
        <button
          className="btn btn-sm btn-primary"
          onClick={onToggleViewMode}
          title={viewMode === 'preview' ? 'Cambiar a Editor Markdown Fuente (Ctrl+Q)' : 'Cambiar a Vista Previa WYSIWYG (Ctrl+Q)'}
        >
          {viewMode === 'preview' ? <Code2 size={16} /> : <Monitor size={16} />}
        </button>

        <div className="toolbar-divider" style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 0.2rem' }} />

        {/* GROUP 1: FILE MANAGEMENT */}
        <div className="toolbar-group" style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
          <button className="btn btn-sm" onClick={onNewFile} title="Nuevo Archivo">
            <FilePlus size={16} color="var(--accent-primary)" />
          </button>
          <button
            className={`btn btn-sm ${isDirty ? 'btn-save-dirty' : ''}`}
            onClick={onSaveFile}
            title={isDirty ? 'Guardar cambios pendientes (Ctrl+S)' : 'Guardar Archivo (Ctrl+S)'}
          >
            <Save size={16} color={isDirty ? 'var(--accent-amber)' : undefined} />
          </button>
          <button
            className="btn btn-sm"
            onClick={onOpenFiles}
            title={
              lastOpenedName
                ? `Abrir documentos (Ctrl+O) — se abrirá en la carpeta de "${lastOpenedName}"`
                : canUseNativeFiles
                  ? 'Abrir documentos del disco (Ctrl+O) — recuerda la última carpeta usada'
                  : 'Abrir documentos del disco (Ctrl+O)'
            }
          >
            <Upload size={16} />
          </button>
        </div>

        <div className="toolbar-divider" style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 0.2rem' }} />

        {/* GROUP 2: HISTORY (UNDO / REDO) */}
        <div className="toolbar-group" style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
          <button className="btn btn-sm" onClick={onUndo} disabled={!canUndo} title="Deshacer (Ctrl+Z)">
            <Undo2 size={16} />
          </button>
          <button className="btn btn-sm" onClick={onRedo} disabled={!canRedo} title="Rehacer (Ctrl+Y)">
            <Redo2 size={16} />
          </button>
        </div>

        <div className="toolbar-divider" style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 0.2rem' }} />

        {/* GROUP 3: EDITING & NLP TOOLS */}
        <div className="toolbar-group" style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
          <button className="btn btn-sm btn-accent" onClick={onAutoInsertIcons} title="Auto-Detectar e Insertar Iconos Inteligentes">
            <Sparkles size={16} color="#38BDF8" />
          </button>
          <button className="btn btn-sm" onClick={onOpenIconPicker} title="Explorador de Iconos (Insertar icono Lucide)">
            <Smile size={16} color="var(--accent-purple)" />
          </button>
          <button className="btn btn-sm" onClick={onOpenImageSettings} title="Configurar Imagen (Text Wrap & Disco Local)">
            <Image size={16} color="var(--accent-emerald)" />
          </button>
          <button className="btn btn-sm" onClick={onOpenLinkModal} title="Insertar enlace en el texto (Ctrl+K)">
            <Link2 size={16} color="var(--accent-primary)" />
          </button>
          <button className="btn btn-sm" onClick={onOpenMediaModal} title="Insertar audio o vídeo incrustado (MP3, MP4, YouTube, Vimeo)">
            <Clapperboard size={16} color="var(--accent-amber)" />
          </button>
          <button
            className={`btn btn-sm ${isSearchOpen ? 'btn-primary' : ''}`}
            onClick={onOpenSearch}
            title="Buscar y reemplazar (Ctrl+H)"
          >
            <Replace size={16} />
          </button>
          <button className="btn btn-sm" onClick={onOpenChangeCase} title="Cambiar mayúsculas y minúsculas (Ctrl+L)">
            <CaseUpper size={16} />
          </button>
        </div>

        <div className="toolbar-divider" style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 0.2rem' }} />

        {/* GROUP 4: COPY / PASTE & EXPORTING */}
        <div className="toolbar-group" style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
          <button className="btn btn-sm" onClick={onCopyMarkdown} title="Copiar selección de Markdown (Ctrl+C)">
            <Copy size={16} />
          </button>
          <button className="btn btn-sm" onClick={onPasteMarkdown} title="Pegar texto del portapapeles (Ctrl+V)">
            <ClipboardPaste size={16} />
          </button>
          <button className="btn btn-sm" onClick={onDownloadMarkdown} title="Descargar una copia (.md) en la carpeta de descargas">
            <Download size={16} />
          </button>
          <button className="btn btn-sm" onClick={onDownloadHtml} title="Descargar archivo HTML generado (.html)">
            <FileCode size={16} />
          </button>
        </div>

        <div className="toolbar-divider" style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 0.2rem' }} />

        {/* GROUP 5: PREFERENCES & THEME */}
        <div className="toolbar-group" style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
          <button className="btn btn-sm" onClick={onResetDocument} title="Reajustar documento al estado por defecto">
            <RotateCcw size={16} />
          </button>
          <button className="btn btn-sm" onClick={onToggleTheme} title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}>
            {theme === 'dark' ? <Sun size={16} color="var(--accent-amber)" /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
