import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { EditorPanel } from './components/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { SidebarPanel } from './components/SidebarPanel';
import { IconPickerModal } from './components/IconPickerModal';
import { ImageSettingsModal } from './components/ImageSettingsModal';
import { IconStyleModal } from './components/IconStyleModal';
import { TextStyleModal } from './components/TextStyleModal';
import { LinkModal } from './components/LinkModal';
import { MediaEmbedModal } from './components/MediaEmbedModal';
import { DropOverlay } from './components/DropOverlay';
import { OpenFileModal } from './components/OpenFileModal';
import { SearchReplaceBar } from './components/SearchReplaceBar';
import { EmbeddedImagesBanner } from './components/EmbeddedImagesBanner';
import { FileChangedBanner } from './components/FileChangedBanner';
import {
  listHistory,
  recordOpened,
  removeFromHistory,
  clearHistory,
  historyToJson,
  parseHistoryJson,
  mergeHistory
} from './utils/fileHistory';
import {
  summarizeEmbedded,
  base64ToBlob,
  suggestFileName,
  replaceEmbedded,
  formatBytes
} from './utils/embeddedAssets';
import { registerLocalAsset } from './utils/localAssets';
import { ChangeCaseModal } from './components/ChangeCaseModal';
import { replaceOne as replaceOneMatch, replaceAll as replaceAllMatches } from './utils/searchReplace';
import {
  openMarkdownFiles,
  writeToHandle,
  pickSaveHandle,
  downloadAsFile,
  isFileSystemAccessSupported,
  ensureReadPermission,
  statHandle
} from './utils/fileAccess';
import { DEFAULT_MARKDOWN_DOCUMENT } from './utils/defaultDocument';
import { autoInjectIconsToText } from './utils/keywordIconMap';
import { compileMarkdownToHtml } from './utils/markdownCompiler';
import { HistoryManager } from './utils/historyManager';
import { insertTextAtCursor } from './utils/textInsert';
import { replaceRange } from './utils/sourceMap';
import { scrollCaretToCenter } from './utils/caretPosition';

export function App() {
  // View Mode: 'preview' (Fullscreen WYSIWYG Editor by default) or 'editor' (Fullscreen Markdown)
  const [viewMode, setViewMode] = useState('preview');

  // Multi-file state. `savedContent` guarda la última versión escrita a disco:
  // si difiere del contenido actual, el archivo tiene cambios sin guardar.
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('iconify_files_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migración: archivos guardados antes de existir el indicador
          return parsed.map(f => ({ ...f, savedContent: f.savedContent ?? f.content }));
        }
      } catch (e) { /* fallback */ }
    }
    return [{
      id: 'file-1',
      name: 'Documento Principal.md',
      content: DEFAULT_MARKDOWN_DOCUMENT,
      savedContent: DEFAULT_MARKDOWN_DOCUMENT
    }];
  });
  const [activeFileId, setActiveFileId] = useState('file-1');

  // UI States
  const [theme, setTheme] = useState('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('files');
  const [toastMessage, setToastMessage] = useState(null);

  // Posición actual dentro del documento (para resaltar la sección del índice)
  const [documentOffset, setDocumentOffset] = useState(0);

  // --- Bidirectional Selection Sync (Ctrl+Q) ---------------------------------
  // Caret offset inside the Markdown source panel
  const caretOffsetRef = useRef(0);
  // Object currently framed with the dashed blue rectangle in the WYSIWYG panel
  const focusedObjectRef = useRef(null);
  // One-shot request sent to the preview when switching back from the editor
  const [previewSyncRequest, setPreviewSyncRequest] = useState(null);
  // One-shot request sent to the editor when switching from the preview
  const [editorSyncRequest, setEditorSyncRequest] = useState(null);

  // Modals state
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isImageSettingsOpen, setIsImageSettingsOpen] = useState(false);
  const [selectedImageMarkdown, setSelectedImageMarkdown] = useState('');

  const [isIconStyleModalOpen, setIsIconStyleModalOpen] = useState(false);
  const [editingIconName, setEditingIconName] = useState('Shield');
  const [editingIconShortcode, setEditingIconShortcode] = useState('');

  const [isTextStyleModalOpen, setIsTextStyleModalOpen] = useState(false);
  const [editingTextInitial, setEditingTextInitial] = useState('');

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInitialText, setLinkInitialText] = useState('');
  const [linkInitialUrl, setLinkInitialUrl] = useState('');

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMediaMarkdown, setSelectedMediaMarkdown] = useState('');

  // Pantalla de apertura de documentos y estado del arrastre
  const [isOpenFileModalOpen, setIsOpenFileModalOpen] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  // Búsqueda y reemplazo (barra acoplada, no es una ventana modal)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchSeed, setSearchSeed] = useState('');

  // Cambio de mayúsculas
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [caseSource, setCaseSource] = useState({ text: '', range: null, origen: '' });

  // Imágenes incrustadas en base64 detectadas en el documento
  const [dismissedEmbedded, setDismissedEmbedded] = useState(() => new Set());
  const [extrayendoImagenes, setExtrayendoImagenes] = useState(false);

  // Source range being edited by the currently open modal (null = plain insert)
  const editingRangeRef = useRef(null);

  const isAnyModalOpen =
    isIconPickerOpen ||
    isImageSettingsOpen ||
    isIconStyleModalOpen ||
    isTextStyleModalOpen ||
    isLinkModalOpen ||
    isMediaModalOpen ||
    isOpenFileModalOpen ||
    isCaseModalOpen;

  // History Stack Manager
  const historyRef = useRef(new HistoryManager(50));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Refs
  const textareaRef = useRef(null);
  const previewContainerRef = useRef(null);

  /* --------------------------------------------------------------------- *
   * Acceso a archivos del disco
   *
   * Los manejadores del sistema de archivos no se pueden serializar a JSON,
   * así que viven aquí en memoria, fuera del estado que va a localStorage.
   * `lastHandleRef` es el que sitúa el selector en la última carpeta usada.
   * --------------------------------------------------------------------- */
  const fileHandlesRef = useRef(new Map());
  const lastHandleRef = useRef(null);
  const [lastOpenedName, setLastOpenedName] = useState('');
  const canUseNativeFiles = isFileSystemAccessSupported();

  // Tamaño y fecha con los que se leyó cada archivo, para detectar cambios
  // hechos fuera del editor.
  const fileStatsRef = useRef(new Map());

  // Historial de archivos abiertos y aviso de cambio externo.
  // `historyIdsRef` relaciona cada pestaña con su entrada del historial, para
  // marcar cuáles están abiertas sin depender del nombre (dos archivos pueden
  // llamarse igual y estar en carpetas distintas).
  const historyIdsRef = useRef(new Map());
  const [entradasAbiertas, setEntradasAbiertas] = useState(new Set());
  const [historial, setHistorial] = useState([]);
  const [cambioExterno, setCambioExterno] = useState(null);

  // Current Active File
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  /* --------------------------------------------------------------------- *
   * Estado "sin guardar"
   * --------------------------------------------------------------------- */
  const isFileDirty = (file) => !!file && (file.savedContent ?? file.content) !== file.content;
  const isActiveFileDirty = isFileDirty(activeFile);
  const dirtyCount = files.filter(isFileDirty).length;

  const markFileAsSaved = (fileId) => {
    setFiles(prev => prev.map(f => (f.id === fileId ? { ...f, savedContent: f.content } : f)));
  };

  // Título de la ventana: un punto delante avisa de cambios pendientes
  useEffect(() => {
    const name = activeFile?.name || 'Documento';
    document.title = `${isActiveFileDirty ? '● ' : ''}${name} — Iconify MD Editor`;
  }, [activeFile?.name, isActiveFileDirty]);

  // Aviso del navegador al cerrar con cambios pendientes
  useEffect(() => {
    if (dirtyCount === 0) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtyCount]);

  // Initialize history when active file changes
  useEffect(() => {
    if (activeFile) {
      historyRef.current.init(activeFile.content);
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [activeFileId]);

  // Auto-save files to localStorage
  useEffect(() => {
    localStorage.setItem('iconify_files_v5', JSON.stringify(files));
  }, [files]);

  // Give the keyboard back to the WYSIWYG panel once every modal is closed
  useEffect(() => {
    if (isAnyModalOpen || viewMode !== 'preview') return;
    const timer = setTimeout(() => {
      previewContainerRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(timer);
  }, [isAnyModalOpen, viewMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateActiveFileContent = (newContent, recordHistory = true) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
    if (recordHistory) {
      historyRef.current.push(newContent);
      setCanUndo(historyRef.current.canUndo());
      setCanRedo(historyRef.current.canRedo());
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    const prev = historyRef.current.undo();
    if (prev !== null) {
      updateActiveFileContent(prev, false);
      setCanUndo(historyRef.current.canUndo());
      setCanRedo(historyRef.current.canRedo());
      showToast('↩️ Deshecho');
    }
  };

  const handleRedo = () => {
    const next = historyRef.current.redo();
    if (next !== null) {
      updateActiveFileContent(next, false);
      setCanUndo(historyRef.current.canUndo());
      setCanRedo(historyRef.current.canRedo());
      showToast('↪️ Rehecho');
    }
  };

  // Toggle View Mode (Ctrl+Q) with bidirectional selection sync
  const handleToggleViewMode = () => {
    const nextMode = viewMode === 'preview' ? 'editor' : 'preview';

    if (nextMode === 'editor') {
      // WYSIWYG -> Source: select the exact lines that produced the framed object
      const focused = focusedObjectRef.current;
      setEditorSyncRequest({
        token: Date.now(),
        start: focused ? focused.start : caretOffsetRef.current,
        end: focused ? focused.end : caretOffsetRef.current
      });
    } else {
      // Source -> WYSIWYG: frame the block that contains the caret
      setPreviewSyncRequest({ token: Date.now(), offset: caretOffsetRef.current });
    }

    setViewMode(nextMode);
    showToast(nextMode === 'preview' ? '🖥️ Vista Previa WYSIWYG (Pantalla Completa)' : '📝 Editor Markdown (Pantalla Completa)');
  };

  // Apply the pending selection inside the Markdown textarea
  useEffect(() => {
    if (viewMode !== 'editor' || !editorSyncRequest) return;

    const timer = setTimeout(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();

      const start = Math.max(0, Math.min(editorSyncRequest.start, ta.value.length));
      const end = Math.max(start, Math.min(editorSyncRequest.end, ta.value.length));
      // Trim the trailing blank lines of the block so the selection looks tight
      const raw = ta.value.slice(start, end);
      const trimmedEnd = start + raw.replace(/\s+$/, '').length;

      ta.setSelectionRange(start, Math.max(start, trimmedEnd));
      caretOffsetRef.current = start;

      // Centrar verticalmente, midiendo la altura real: contar líneas lógicas
      // falla en cuanto un párrafo se ajusta en varias filas de pantalla.
      scrollCaretToCenter(ta, start);
    }, 30);

    return () => clearTimeout(timer);
  }, [viewMode, editorSyncRequest]);

  // File Explorer Actions
  const handleNewFile = () => {
    const newId = `file-${Date.now()}`;
    const content = `# Nuevo Documento\n\nEmpieza a escribir tu contenido aquí...\n`;
    const newFile = {
      id: newId,
      name: `Nota ${files.length + 1}.md`,
      content,
      savedContent: content
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
    showToast('📄 Nuevo archivo creado.');
  };

  /**
   * Ctrl+S — guardar de verdad.
   *
   * 1. Si el archivo se abrió desde el disco, se sobrescribe el original.
   * 2. Si no, se ofrece «Guardar como» y se recuerda el manejador resultante,
   *    de modo que los guardados siguientes ya sean directos.
   * 3. Si el navegador no admite nada de esto, se descarga una copia.
   */
  const handleSaveFile = async () => {
    const file = activeFile;
    if (!file) return;

    const existing = fileHandlesRef.current.get(file.id);
    if (existing) {
      const written = await writeToHandle(existing, file.content);
      if (written) {
        markFileAsSaved(file.id);
        lastHandleRef.current = existing;
        // Guardar cambia el tamaño y la fecha: se anotan para no confundirlo
        // luego con una modificación hecha fuera del editor.
        const datos = await statHandle(existing);
        if (datos) fileStatsRef.current.set(file.id, datos);
        showToast(`💾 Guardado en "${file.name}".`);
        return;
      }
      showToast('⚠️ Permiso de escritura denegado. Se descargará una copia.');
      downloadAsFile(file.name || 'documento.md', file.content);
      return;
    }

    if (canUseNativeFiles) {
      const handle = await pickSaveHandle(file.name || 'documento.md', lastHandleRef.current);
      if (!handle) return; // cancelado por el usuario
      const written = await writeToHandle(handle, file.content);
      if (written) {
        fileHandlesRef.current.set(file.id, handle);
        lastHandleRef.current = handle;
        const datos = await statHandle(handle);
        if (datos) fileStatsRef.current.set(file.id, datos);
        const anotado = await recordOpened({
          name: handle.name || file.name,
          handle,
          size: datos?.size || 0,
          lastModified: datos?.lastModified || 0
        });
        historyIdsRef.current.set(file.id, anotado.id);
        refrescarHistorial();
        setLastOpenedName(handle.name || file.name);
        setFiles(prev => prev.map(f => (f.id === file.id ? { ...f, name: handle.name || f.name } : f)));
        markFileAsSaved(file.id);
        showToast(`💾 Guardado en "${handle.name || file.name}".`);
        return;
      }
    }

    // Firefox y Safari: sigue siendo una descarga
    downloadAsFile(file.name || 'documento.md', file.content);
    markFileAsSaved(file.id);
    showToast('💾 Copia descargada (este navegador no permite guardar en el sitio).');
  };

  const handleCloseFile = (fileId = activeFileId) => {
    if (files.length <= 1) {
      showToast('⚠️ No puedes cerrar el único archivo abierto.');
      return;
    }
    const targetId = fileId || activeFileId;
    const target = files.find(f => f.id === targetId);

    if (isFileDirty(target)) {
      const confirmed = window.confirm(
        `“${target.name}” tiene cambios sin guardar.\n\n¿Cerrarlo de todas formas y perder los cambios?`
      );
      if (!confirmed) return;
    }

    const remaining = files.filter(f => f.id !== targetId);
    fileHandlesRef.current.delete(targetId);
    fileStatsRef.current.delete(targetId);
    historyIdsRef.current.delete(targetId);
    setEntradasAbiertas(new Set(historyIdsRef.current.values()));
    setFiles(remaining);
    if (activeFileId === targetId) {
      setActiveFileId(remaining[0].id);
    }
    showToast('❌ Archivo cerrado.');
  };

  const handleNextTab = () => {
    const idx = files.findIndex(f => f.id === activeFileId);
    const nextIdx = (idx + 1) % files.length;
    setActiveFileId(files[nextIdx].id);
  };

  const handlePrevTab = () => {
    const idx = files.findIndex(f => f.id === activeFileId);
    const prevIdx = (idx - 1 + files.length) % files.length;
    setActiveFileId(files[prevIdx].id);
  };

  // Classic Keyboard Shortcuts (Ctrl+Q, Ctrl+S, Ctrl+W, Ctrl+C, Ctrl+V, Alt+Arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // While a modal is open it owns the keyboard (ENTER / ESC).
      if (isAnyModalOpen) return;
      if (typeof e.key !== 'string') return;

      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      const escribiendoEnCampo = () => {
        const activo = document.activeElement;
        return (
          !!activo &&
          (activo.tagName === 'INPUT' || activo.tagName === 'SELECT' || activo.isContentEditable)
        );
      };

      // Cambio de pestaña.
      //
      // Chrome reserva Ctrl+AvPág y Ctrl+RePág para cambiar de pestaña del
      // NAVEGADOR y ni siquiera envía el evento a la página, así que se
      // mantienen por si otro navegador sí los entrega, pero los atajos que
      // realmente funcionan son Alt+Flecha.
      if ((ctrl && e.key === 'PageDown') || (e.altKey && e.key === 'ArrowRight')) {
        e.preventDefault();
        handleNextTab();
        return;
      }
      if ((ctrl && e.key === 'PageUp') || (e.altKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        handlePrevTab();
        return;
      }
      // Alt+W: alternativa fiable a Ctrl+W, que el navegador se queda
      if (e.altKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleCloseFile(activeFileId);
        return;
      }

      if (!ctrl) return;

      switch (key) {
        // Ctrl+Q: Switch panel view mode
        case 'q':
          e.preventDefault();
          handleToggleViewMode();
          break;
        // Ctrl+S: Save file
        case 's':
          e.preventDefault();
          handleSaveFile();
          break;
        // Cerrar el archivo activo.
        //
        // Ctrl+W cierra la pestaña del navegador y Chrome no entrega el evento
        // a la página, así que el atajo real es Alt+W. Ctrl+W se deja por si
        // algún navegador lo permite, pero no se puede prometer.
        case 'w':
          e.preventDefault();
          handleCloseFile(activeFileId);
          break;
        // Ctrl+Z / Ctrl+Shift+Z: Undo / Redo
        case 'z':
          e.preventDefault();
          if (e.shiftKey) handleRedo();
          else handleUndo();
          break;
        // Ctrl+Y: Redo
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        // Ctrl+K: insertar enlace sobre el texto seleccionado
        case 'k':
          e.preventDefault();
          handleOpenLinkModal();
          break;
        // Ctrl+O: pantalla de apertura de documentos
        case 'o':
          e.preventDefault();
          handleShowOpenScreen();
          break;
        // Ctrl+H: búsqueda y reemplazo
        case 'h':
          e.preventDefault();
          handleOpenSearch();
          break;
        // Ctrl+L: cambiar mayúsculas
        case 'l':
          e.preventDefault();
          handleOpenChangeCase();
          break;
        // Ctrl+C / Ctrl+V solo hacen falta en el panel WYSIWYG; dentro de un
        // campo de texto (la barra de búsqueda, por ejemplo) manda el navegador.
        case 'c':
          if (viewMode === 'preview' && !escribiendoEnCampo()) {
            e.preventDefault();
            handleCopyMarkdown();
          }
          break;
        case 'v':
          if (viewMode === 'preview' && !escribiendoEnCampo()) {
            e.preventDefault();
            handlePasteMarkdown();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFileId, files, viewMode, isAnyModalOpen]);

  /* --------------------------------------------------------------------- *
   * Abrir documentos (Ctrl+O, botón de la barra y arrastrar y soltar)
   * --------------------------------------------------------------------- */

  /**
   * ¿Este documento ya está abierto?
   *
   * `isSameEntry` es el criterio fiable: compara la entrada real del sistema de
   * archivos, así que distingue dos archivos con el mismo nombre en carpetas
   * distintas. Cuando no hay manejador (Firefox, Safari) solo queda el nombre.
   */
  const buscarArchivoAbierto = async (doc) => {
    if (doc.handle) {
      for (const archivo of files) {
        const manejador = fileHandlesRef.current.get(archivo.id);
        if (!manejador || typeof manejador.isSameEntry !== 'function') continue;
        try {
          if (await manejador.isSameEntry(doc.handle)) return archivo;
        } catch (error) {
          /* se ignora este candidato */
        }
      }

      // Con manejador, `isSameEntry` ya ha decidido: si ninguno coincidió es un
      // archivo distinto, aunque comparta nombre (dos README.md de carpetas
      // diferentes son documentos diferentes). Solo se compara por nombre con
      // los que se abrieron sin manejador y no admiten esa comprobación.
      return (
        files.find(
          (archivo) => archivo.name === doc.name && !fileHandlesRef.current.get(archivo.id)
        ) || null
      );
    }

    // Sin manejador (Firefox, Safari) el nombre es lo único disponible
    return files.find((archivo) => archivo.name === doc.name) || null;
  };

  /** Incorpora al espacio de trabajo los documentos ya leídos. */
  const adoptDocuments = async (documents, origen) => {
    if (!documents || documents.length === 0) return;

    const nuevos = [];
    const yaAbiertos = [];
    let cambio = null;

    for (const doc of documents) {
      const existente = await buscarArchivoAbierto(doc);

      if (existente) {
        yaAbiertos.push({ doc, archivo: existente });

        // ¿Cambió en el disco desde que se abrió?
        const previo = fileStatsRef.current.get(existente.id);
        const distinto =
          previo &&
          (previo.size !== doc.size || previo.lastModified !== doc.lastModified) &&
          doc.content !== existente.content;

        if (distinto && !cambio) {
          cambio = {
            fileId: existente.id,
            nombre: existente.name,
            contenidoDisco: doc.content,
            size: doc.size,
            lastModified: doc.lastModified
          };
        }
        continue;
      }

      const id = `file-${Date.now()}-${nuevos.length}`;
      nuevos.push({
        id,
        name: doc.name || 'Documento.md',
        content: doc.content ?? '',
        savedContent: doc.content ?? ''
      });

      if (doc.handle) {
        fileHandlesRef.current.set(id, doc.handle);
        lastHandleRef.current = doc.handle;
        setLastOpenedName(doc.name || '');
      }
      fileStatsRef.current.set(id, { size: doc.size ?? 0, lastModified: doc.lastModified ?? 0 });

      const anotado = await recordOpened({
        name: doc.name,
        handle: doc.handle,
        size: doc.size,
        lastModified: doc.lastModified
      });
      historyIdsRef.current.set(id, anotado.id);
    }

    if (nuevos.length > 0) {
      setFiles((prev) => [...prev, ...nuevos]);
      setActiveFileId(nuevos[nuevos.length - 1].id);
    } else if (yaAbiertos.length > 0) {
      // Nada nuevo: se va a la pestaña del que ya estaba
      setActiveFileId(yaAbiertos[0].archivo.id);
    }

    setIsOpenFileModalOpen(false);
    if (cambio) setCambioExterno(cambio);
    refrescarHistorial();

    // Mensajes claros según lo que haya pasado
    const sufijo = origen === 'drop' ? ' (soltado)' : '';
    if (nuevos.length === 0 && yaAbiertos.length === 1) {
      showToast(`📄 "${yaAbiertos[0].archivo.name}" ya estaba abierto: se activó su pestaña.`);
    } else if (nuevos.length === 0) {
      showToast(`📄 Los ${yaAbiertos.length} documentos ya estaban abiertos.`);
    } else if (yaAbiertos.length > 0) {
      showToast(
        `📂 ${nuevos.length} abierto${nuevos.length === 1 ? '' : 's'}${sufijo}; ` +
          `${yaAbiertos.length} ya estaba${yaAbiertos.length === 1 ? '' : 'n'} abierto${yaAbiertos.length === 1 ? '' : 's'}.`
      );
    } else if (nuevos.length === 1) {
      showToast(`📂 "${nuevos[0].name}" abierto${sufijo}.`);
    } else {
      showToast(`📂 ${nuevos.length} documentos abiertos${sufijo}.`);
    }
  };

  /** Ctrl+O y botón de la barra: muestra la pantalla con la zona de soltado. */
  const handleShowOpenScreen = () => {
    setIsOpenFileModalOpen(true);
  };

  /** Botón «Buscar en el equipo»: aquí sí se abre el diálogo del sistema. */
  const handleBrowseForFiles = async () => {
    try {
      const documents = await openMarkdownFiles(lastHandleRef.current);
      if (documents.length === 0) return; // cancelado: la pantalla sigue abierta
      adoptDocuments(documents, 'picker');
    } catch (error) {
      showToast('⚠️ No se pudo abrir el archivo.');
    }
  };

  const handleCreateBlankFromScreen = () => {
    setIsOpenFileModalOpen(false);
    handleNewFile();
  };

  const handleFilesDropped = (documents) => {
    if (!documents || documents.length === 0) {
      showToast('⚠️ Solo se pueden soltar archivos .md, .markdown, .mdx o .txt.');
      return;
    }
    adoptDocuments(documents, 'drop');
  };

  /* --------------------------------------------------------------------- *
   * Historial de archivos abiertos
   * --------------------------------------------------------------------- */
  const refrescarHistorial = async () => {
    setHistorial(await listHistory());
    setEntradasAbiertas(new Set(historyIdsRef.current.values()));
  };

  useEffect(() => {
    refrescarHistorial();
  }, []);

  /** Reabre una entrada del historial usando su manejador guardado. */
  const handleReopenFromHistory = async (entrada) => {
    // Si ya está abierto, basta con activar su pestaña
    const fileIdAbierto = [...historyIdsRef.current.entries()].find(([, hid]) => hid === entrada.id)?.[0];
    const abierto = files.find((f) => f.id === fileIdAbierto);
    if (abierto) {
      setActiveFileId(abierto.id);
      setIsOpenFileModalOpen(false);
      showToast(`📄 "${entrada.name}" ya estaba abierto: se activó su pestaña.`);
      return;
    }

    // Sin manejador guardado (Firefox, Safari o historial importado)
    if (!entrada.handle) {
      showToast(`Busca "${entrada.name}" en el diálogo: no hay acceso guardado.`);
      handleBrowseForFiles();
      return;
    }

    try {
      const permiso = await ensureReadPermission(entrada.handle);
      if (!permiso) {
        showToast('⚠️ Permiso denegado para volver a leer ese archivo.');
        return;
      }
      const archivo = await entrada.handle.getFile();
      await adoptDocuments(
        [
          {
            name: archivo.name,
            content: await archivo.text(),
            handle: entrada.handle,
            size: archivo.size ?? 0,
            lastModified: archivo.lastModified ?? 0
          }
        ],
        'historial'
      );
    } catch (error) {
      showToast(`⚠️ No se pudo abrir "${entrada.name}". Puede que ya no exista.`);
      await removeFromHistory(entrada.id);
      refrescarHistorial();
    }
  };

  const handleForgetHistory = async (id) => {
    setHistorial(await removeFromHistory(id));
  };

  const handleClearHistory = async () => {
    setHistorial(await clearHistory());
    showToast('🗑️ Historial vaciado.');
  };

  const handleExportHistory = () => {
    downloadAsFile('historial-iconify.json', historyToJson(historial), 'application/json;charset=utf-8');
    showToast('⬇️ Historial exportado.');
  };

  const handleImportHistory = async (archivo) => {
    try {
      const entradas = parseHistoryJson(await archivo.text());
      if (entradas.length === 0) {
        showToast('⚠️ Ese archivo no contiene un historial válido.');
        return;
      }
      setHistorial(await mergeHistory(entradas));
      showToast(
        `📥 ${entradas.length} entrada${entradas.length === 1 ? '' : 's'} importada${entradas.length === 1 ? '' : 's'}. ` +
          'Las importadas se abren buscando el archivo.'
      );
    } catch (error) {
      showToast('⚠️ No se pudo leer el historial.');
    }
  };

  /* --------------------------------------------------------------------- *
   * Cambio del archivo fuera del editor
   * --------------------------------------------------------------------- */
  const handleReloadFromDisk = () => {
    if (!cambioExterno) return;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === cambioExterno.fileId
          ? { ...f, content: cambioExterno.contenidoDisco, savedContent: cambioExterno.contenidoDisco }
          : f
      )
    );
    fileStatsRef.current.set(cambioExterno.fileId, {
      size: cambioExterno.size,
      lastModified: cambioExterno.lastModified
    });
    historyRef.current.init(cambioExterno.contenidoDisco);
    setCanUndo(false);
    setCanRedo(false);
    setActiveFileId(cambioExterno.fileId);
    setCambioExterno(null);
    showToast('🔄 Documento recargado desde el disco.');
  };

  const handleKeepMine = () => {
    if (cambioExterno) {
      // Se anota la versión del disco como conocida para no repetir el aviso
      fileStatsRef.current.set(cambioExterno.fileId, {
        size: cambioExterno.size,
        lastModified: cambioExterno.lastModified
      });
    }
    setCambioExterno(null);
  };

  const handleRenameFile = (fileId, newName) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName } : f));
  };

  // Auto-Insert Icons NLP Engine
  const handleAutoInsertIcons = () => {
    const updated = autoInjectIconsToText(activeFile.content);
    updateActiveFileContent(updated);
    showToast('✨ ¡Iconos insertados automáticamente según el contexto!');
  };

  /* --------------------------------------------------------------------- *
   * Insertion helpers: in the source editor we honour the caret, in the
   * WYSIWYG panel we insert relative to the object framed in blue.
   * --------------------------------------------------------------------- */
  const insertInline = (snippet) => {
    if (viewMode === 'editor' && textareaRef.current) {
      return insertTextAtCursor(textareaRef.current, activeFile.content, snippet);
    }
    const focused = focusedObjectRef.current;
    if (focused) {
      const content = activeFile.content;
      const block = content.slice(focused.start, focused.end);
      const trailing = block.length - block.replace(/\s+$/, '').length;
      const at = focused.end - trailing;
      return content.slice(0, at) + snippet + content.slice(at);
    }
    return activeFile.content + snippet;
  };

  /**
   * Inserta un bloque completo (imagen, reproductor, bloque estilizado).
   *
   * Debe quedar aislado entre líneas en blanco: un enlace multimedia solo se
   * convierte en reproductor si ocupa su propio párrafo. Por eso se inserta al
   * final del BLOQUE que contiene al objeto enfocado, no justo detrás del
   * objeto: si lo enfocado es un icono en mitad de una frase, insertar ahí
   * partiría el párrafo en dos.
   */
  const insertBlock = (snippet) => {
    if (viewMode === 'editor' && textareaRef.current) {
      return insertTextAtCursor(textareaRef.current, activeFile.content, `\n\n${snippet}\n`);
    }

    const content = activeFile.content;
    const focused = focusedObjectRef.current;

    let at = content.length;
    if (focused) {
      at = focused.blockEnd ?? focused.end;
      // Si cayó a mitad de una línea, se avanza hasta el final de esa línea
      if (at < content.length && content[at - 1] !== '\n') {
        const salto = content.indexOf('\n', at);
        at = salto === -1 ? content.length : salto + 1;
      }
    }

    const antes = content.slice(0, at).replace(/\s*$/, '');
    const despues = content.slice(at).replace(/^\s*/, '');

    return [antes, snippet, despues].filter((parte) => parte.length > 0).join('\n\n') + '\n';
  };

  // Open Icon Picker -> Modal
  const handleSelectIconFromPicker = (iconName, colorful = true) => {
    editingRangeRef.current = null;
    setEditingIconName(iconName);
    // El explorador muestra los iconos ya coloreados: se abre el editor en el
    // mismo modo que el usuario acaba de ver.
    setEditingIconShortcode(colorful ? `:${iconName}{duo=auto}:` : `:${iconName}:`);
    setIsIconStyleModalOpen(true);
  };

  const handleOpenIconStyleModal = (iconName, shortcode, range = null) => {
    editingRangeRef.current = range;
    setEditingIconName(iconName);
    setEditingIconShortcode(shortcode || `:${iconName}:`);
    setIsIconStyleModalOpen(true);
  };

  // Apply Icon Style
  const handleApplyIconStyle = (newShortcode) => {
    const range = editingRangeRef.current;
    if (range) {
      updateActiveFileContent(replaceRange(activeFile.content, range, newShortcode));
      showToast(`✨ Estilo de icono actualizado: ${newShortcode}`);
    } else {
      updateActiveFileContent(insertInline(` ${newShortcode} `));
      showToast(`✨ Icono insertado: ${newShortcode}`);
    }
    editingRangeRef.current = null;
  };

  // Open Text Style Customizer Modal
  const handleOpenTextStyleModal = (initialTextContent = '', range = null) => {
    let textToEdit = initialTextContent;
    let targetRange = range;

    if (!textToEdit && viewMode === 'editor' && textareaRef.current) {
      const ta = textareaRef.current;
      const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd);
      if (selected) {
        textToEdit = selected;
        targetRange = { start: ta.selectionStart, end: ta.selectionEnd };
      }
    }

    editingRangeRef.current = targetRange;
    setEditingTextInitial(textToEdit || '');
    setIsTextStyleModalOpen(true);
  };

  // Apply Text Style from TextStyleModal
  const handleApplyTextStyle = (formattedMarkdown) => {
    const range = editingRangeRef.current;
    if (range) {
      const original = activeFile.content.slice(range.start, range.end);
      // Keep the blank lines that separated the original block
      const trailing = original.slice(original.replace(/\s+$/, '').length);
      updateActiveFileContent(replaceRange(activeFile.content, range, formattedMarkdown + trailing));
      showToast('📝 Estilo de texto aplicado al bloque seleccionado.');
    } else {
      updateActiveFileContent(insertBlock(formattedMarkdown));
      showToast('📝 Bloque de texto estilizado insertado.');
    }
    editingRangeRef.current = null;
  };

  /* --------------------------------------------------------------------- *
   * Enlaces en mitad de un párrafo (Ctrl+K)
   * --------------------------------------------------------------------- */
  const handleOpenLinkModal = () => {
    let selected = '';

    if (viewMode === 'editor' && textareaRef.current) {
      const ta = textareaRef.current;
      selected = ta.value.substring(ta.selectionStart, ta.selectionEnd);
      editingRangeRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
    } else {
      // En WYSIWYG se aprovecha el texto marcado con el ratón
      const domSelection = window.getSelection();
      selected = domSelection && !domSelection.isCollapsed ? domSelection.toString().trim() : '';
      editingRangeRef.current = null;
    }

    // Si lo seleccionado ya es una dirección, va al campo de la URL
    const looksLikeUrl = /^(https?:\/\/|www\.)\S+$/i.test(selected);
    setLinkInitialText(looksLikeUrl ? '' : selected);
    setLinkInitialUrl(looksLikeUrl ? selected : '');
    setIsLinkModalOpen(true);
  };

  const handleApplyLink = (linkMarkdown, { text: linkText } = {}) => {
    const range = editingRangeRef.current;
    editingRangeRef.current = null;

    // Editor de código: sustituye exactamente la selección o inserta en el cursor
    if (viewMode === 'editor' && range) {
      updateActiveFileContent(replaceRange(activeFile.content, range, linkMarkdown));
      showToast('🔗 Enlace insertado.');
      return;
    }

    // WYSIWYG: envuelve el texto marcado dentro del bloque enfocado
    const focused = focusedObjectRef.current;
    if (focused && linkText) {
      const content = activeFile.content;
      const block = content.slice(focused.start, focused.end);
      const at = block.indexOf(linkText);
      if (at >= 0) {
        const absolute = focused.start + at;
        updateActiveFileContent(
          replaceRange(content, { start: absolute, end: absolute + linkText.length }, linkMarkdown)
        );
        showToast('🔗 Enlace aplicado al texto seleccionado.');
        return;
      }
    }

    updateActiveFileContent(insertInline(` ${linkMarkdown} `));
    showToast(
      focused
        ? '🔗 Enlace añadido al final del bloque (no encontré el texto exacto en el origen).'
        : '🔗 Enlace insertado.'
    );
  };

  /* --------------------------------------------------------------------- *
   * Audio y vídeo incrustados
   * --------------------------------------------------------------------- */
  const handleOpenMediaModal = (mediaMarkdown = '', range = null) => {
    editingRangeRef.current = range;
    setSelectedMediaMarkdown(mediaMarkdown);
    setIsMediaModalOpen(true);
  };

  const handleApplyMedia = (mediaMarkdown) => {
    const range = editingRangeRef.current;
    editingRangeRef.current = null;

    if (range) {
      const original = activeFile.content.slice(range.start, range.end);
      const trailing = original.slice(original.replace(/\s+$/, '').length);
      updateActiveFileContent(replaceRange(activeFile.content, range, mediaMarkdown + trailing));
      showToast('🎬 Reproductor actualizado.');
    } else {
      // Debe quedar en su propia línea para que se convierta en reproductor
      updateActiveFileContent(insertBlock(mediaMarkdown));
      showToast('🎬 Reproductor insertado.');
    }
  };

  // Open Image Settings Modal (with prefilled selected image tag)
  const handleOpenImageSettings = (imageMarkdownTag = '', range = null) => {
    editingRangeRef.current = range;
    setSelectedImageMarkdown(imageMarkdownTag);
    setIsImageSettingsOpen(true);
  };

  // Insert or Update Image with Text-Wrap
  const handleInsertImage = (imageMarkdownTag) => {
    const range = editingRangeRef.current;
    if (range) {
      updateActiveFileContent(replaceRange(activeFile.content, range, imageMarkdownTag));
      showToast('🖼️ Propiedades de imagen actualizadas.');
    } else {
      updateActiveFileContent(insertBlock(imageMarkdownTag));
      showToast('🖼️ Imagen insertada en el documento.');
    }
    editingRangeRef.current = null;
  };

  /* --------------------------------------------------------------------- *
   * Imágenes incrustadas en base64
   *
   * Las versiones anteriores insertaban las imágenes del disco codificadas
   * dentro del propio Markdown. Una foto de 300 KB añadía unos 400.000
   * caracteres en una sola línea. Ahora se detectan y se pueden extraer.
   * --------------------------------------------------------------------- */
  const resumenIncrustadas = useMemo(
    () => summarizeEmbedded(activeFile?.content || ''),
    [activeFile?.content]
  );

  const mostrarAvisoIncrustadas =
    resumenIncrustadas.cuantas > 0 && !dismissedEmbedded.has(activeFileId);

  const handleExtractEmbedded = async () => {
    const imagenes = resumenIncrustadas.imagenes;
    if (imagenes.length === 0) return;

    setExtrayendoImagenes(true);
    let contenido = activeFile.content;
    let extraidas = 0;

    try {
      // De atrás hacia delante: así los rangos de las anteriores no se mueven
      for (let i = imagenes.length - 1; i >= 0; i--) {
        const imagen = imagenes[i];
        const sugerido = suggestFileName(imagen, i);
        const blob = base64ToBlob(imagen.base64, imagen.mime);

        let nombreFinal = sugerido;

        if (canUseNativeFiles) {
          const handle = await pickSaveHandle(sugerido, lastHandleRef.current);
          if (!handle) continue; // el usuario canceló esta imagen
          const escrito = await writeToHandle(handle, blob);
          if (!escrito) continue;
          nombreFinal = handle.name || sugerido;
        } else {
          // Sin acceso al sistema de archivos, se descarga y hay que moverla
          downloadAsFile(sugerido, blob, imagen.mime);
        }

        // Queda disponible para la vista previa de esta sesión
        registerLocalAsset(blob, nombreFinal);
        contenido = replaceEmbedded(contenido, imagen, `./${nombreFinal}`);
        extraidas += 1;
      }

      if (extraidas === 0) {
        showToast('No se extrajo ninguna imagen.');
        return;
      }

      const ahorro = activeFile.content.length - contenido.length;
      updateActiveFileContent(contenido);
      showToast(
        `🖼️ ${extraidas} ${extraidas === 1 ? 'imagen extraída' : 'imágenes extraídas'}. ` +
          `El documento adelgaza ${ahorro.toLocaleString('es')} caracteres (${formatBytes(ahorro)}).`
      );
    } catch (error) {
      showToast('⚠️ No se pudieron extraer las imágenes.');
    } finally {
      setExtrayendoImagenes(false);
    }
  };

  const handleDismissEmbedded = () => {
    setDismissedEmbedded((prev) => new Set(prev).add(activeFileId));
  };

  /* --------------------------------------------------------------------- *
   * Búsqueda y reemplazo (Ctrl+H)
   * --------------------------------------------------------------------- */

  /** Lleva la vista hasta una coincidencia, en el panel que esté activo. */
  const irACoincidencia = (match) => {
    if (!match) return;
    caretOffsetRef.current = match.start;
    setDocumentOffset(match.start);

    if (viewMode === 'editor') {
      setEditorSyncRequest({ token: Date.now(), start: match.start, end: match.end });
    } else {
      setPreviewSyncRequest({ token: Date.now(), offset: match.start });
    }
  };

  const handleOpenSearch = () => {
    // Si hay texto seleccionado, se usa como búsqueda inicial
    let semilla = '';
    if (viewMode === 'editor' && textareaRef.current) {
      const ta = textareaRef.current;
      semilla = ta.value.substring(ta.selectionStart, ta.selectionEnd);
    } else {
      const seleccion = window.getSelection();
      if (seleccion && !seleccion.isCollapsed) semilla = seleccion.toString().trim();
    }
    if (semilla && !semilla.includes('\n')) setSearchSeed(semilla);
    setIsSearchOpen(true);
  };

  const handleReplaceOne = (match, replacement, opciones) => {
    const actualizado = replaceOneMatch(activeFile.content, match, replacement, opciones);
    updateActiveFileContent(actualizado);
    irACoincidencia({ start: match.start, end: match.start + replacement.length });
    showToast('🔁 Coincidencia reemplazada.');
  };

  const handleReplaceAll = (regex, replacement, opciones) => {
    const { text, count } = replaceAllMatches(activeFile.content, regex, replacement, opciones);
    if (count === 0) {
      showToast('No hay coincidencias que reemplazar.');
      return;
    }
    updateActiveFileContent(text);
    showToast(
      count === 1
        ? '🔁 1 coincidencia reemplazada.'
        : `🔁 ${count} coincidencias reemplazadas.`
    );
  };

  /* --------------------------------------------------------------------- *
   * Cambio de mayúsculas (Ctrl+L)
   * --------------------------------------------------------------------- */
  const handleOpenChangeCase = () => {
    // Editor de código: la selección, y si no hay, la línea del cursor
    if (viewMode === 'editor' && textareaRef.current) {
      const ta = textareaRef.current;
      const { selectionStart: inicio, selectionEnd: fin } = ta;

      if (inicio !== fin) {
        setCaseSource({
          text: ta.value.slice(inicio, fin),
          range: { start: inicio, end: fin },
          origen: 'selección'
        });
      } else {
        const desde = ta.value.lastIndexOf('\n', Math.max(0, inicio - 1)) + 1;
        const hasta = ta.value.indexOf('\n', inicio);
        const finLinea = hasta === -1 ? ta.value.length : hasta;
        setCaseSource({
          text: ta.value.slice(desde, finLinea),
          range: { start: desde, end: finLinea },
          origen: 'línea actual'
        });
      }
      setIsCaseModalOpen(true);
      return;
    }

    // WYSIWYG: el bloque enmarcado en azul
    const focused = focusedObjectRef.current;
    if (focused) {
      const inicio = focused.blockStart ?? focused.start;
      const fin = focused.blockEnd ?? focused.end;
      const bruto = activeFile.content.slice(inicio, fin);
      const recortado = bruto.replace(/\s+$/, '');
      setCaseSource({
        text: recortado,
        range: { start: inicio, end: inicio + recortado.length },
        origen: 'bloque seleccionado'
      });
    } else {
      setCaseSource({ text: '', range: null, origen: '' });
    }
    setIsCaseModalOpen(true);
  };

  const handleApplyCase = (textoTransformado, nombreTransformacion) => {
    const { range } = caseSource;
    if (!range) return;
    updateActiveFileContent(replaceRange(activeFile.content, range, textoTransformado));
    showToast(`🔠 Aplicado: ${nombreTransformacion}.`);
  };

  /* --------------------------------------------------------------------- *
   * Tabla de contenidos: salta al encabezado en el panel que esté activo,
   * reutilizando el mismo canal de sincronización que usa Ctrl+Q.
   * --------------------------------------------------------------------- */
  const handleNavigateHeading = (heading) => {
    caretOffsetRef.current = heading.start;
    setDocumentOffset(heading.start);

    if (viewMode === 'preview') {
      setPreviewSyncRequest({ token: Date.now(), offset: heading.start });
    } else {
      setEditorSyncRequest({ token: Date.now(), start: heading.start, end: heading.end });
    }
  };

  const handleOpenTableOfContents = () => {
    setSidebarTab('toc');
    setIsSidebarOpen(true);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(open => !open);
  };

  // Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Copy Selected Markdown Only
  const handleCopyMarkdown = async () => {
    let textToCopy = '';

    if (viewMode === 'editor' && textareaRef.current) {
      const ta = textareaRef.current;
      textToCopy = ta.value.substring(ta.selectionStart, ta.selectionEnd);
    } else if (focusedObjectRef.current) {
      textToCopy = focusedObjectRef.current.text;
    }
    if (!textToCopy) textToCopy = activeFile.content;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('📋 Selección de Markdown copiada al portapapeles.');
    } catch (err) {
      showToast('⚠️ Permiso de portapapeles no disponible.');
    }
  };

  // Paste Clipboard Text at Cursor
  const handlePasteMarkdown = async () => {
    try {
      const textToPaste = await navigator.clipboard.readText();
      if (textToPaste) {
        updateActiveFileContent(insertInline(textToPaste));
        showToast('📋 Texto pegado en el documento.');
      }
    } catch (err) {
      showToast('⚠️ Permiso de portapapeles no disponible.');
    }
  };

  // Export handlers
  /** Botón `Download`: siempre una copia en la carpeta de descargas. */
  const handleDownloadMarkdown = () => {
    downloadAsFile(activeFile.name || 'documento.md', activeFile.content);
    showToast('⬇️ Copia descargada.');
  };

  const handleDownloadHtml = () => {
    const rawHtml = compileMarkdownToHtml(activeFile.content);
    const fullHtml = `<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n<title>${activeFile.name}</title>\n</head>\n<body>\n${rawHtml}\n</body>\n</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeFile.name.replace(/\.[^/.]+$/, "")}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('📄 Archivo HTML descargado.');
  };

  const handleResetDocument = () => {
    updateActiveFileContent(DEFAULT_MARKDOWN_DOCUMENT);
    showToast('Documento reajustado.');
  };

  return (
    <div className="app-container">
      {/* Arrastrar y soltar sobre cualquier parte de la ventana */}
      <DropOverlay
        onFilesDropped={handleFilesDropped}
        onDraggingChange={setIsDraggingFiles}
        hideOverlay={isOpenFileModalOpen}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-primary)',
          color: 'var(--text-main)',
          padding: '0.6rem 1.2rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 2000,
          fontSize: '0.85rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* ICON-ONLY GROUPED NAVBAR */}
      <Navbar
        theme={theme}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onOpenTableOfContents={handleOpenTableOfContents}
        isDirty={isActiveFileDirty}
        dirtyCount={dirtyCount}
        activeFileName={activeFile?.name}
        onNewFile={handleNewFile}
        onSaveFile={handleSaveFile}
        onOpenFiles={handleShowOpenScreen}
        lastOpenedName={lastOpenedName}
        canUseNativeFiles={canUseNativeFiles}
        onToggleTheme={handleToggleTheme}
        onAutoInsertIcons={handleAutoInsertIcons}
        onOpenIconPicker={() => setIsIconPickerOpen(true)}
        onOpenTextStyleModal={handleOpenTextStyleModal}
        onOpenImageSettings={() => handleOpenImageSettings('')}
        onOpenLinkModal={handleOpenLinkModal}
        onOpenMediaModal={() => handleOpenMediaModal('')}
        onOpenSearch={handleOpenSearch}
        onOpenChangeCase={handleOpenChangeCase}
        isSearchOpen={isSearchOpen}
        onCopyMarkdown={handleCopyMarkdown}
        onPasteMarkdown={handlePasteMarkdown}
        onDownloadMarkdown={handleDownloadMarkdown}
        onDownloadHtml={handleDownloadHtml}
        onResetDocument={handleResetDocument}
      />

      {cambioExterno && (
        <FileChangedBanner
          nombre={cambioExterno.nombre}
          tieneCambiosSinGuardar={isFileDirty(files.find((f) => f.id === cambioExterno.fileId))}
          onReload={handleReloadFromDisk}
          onKeep={handleKeepMine}
        />
      )}

      {mostrarAvisoIncrustadas && (
        <EmbeddedImagesBanner
          resumen={resumenIncrustadas}
          onExtract={handleExtractEmbedded}
          onDismiss={handleDismissEmbedded}
          extrayendo={extrayendoImagenes}
        />
      )}

      <SearchReplaceBar
        isOpen={isSearchOpen}
        markdown={activeFile.content}
        initialQuery={searchSeed}
        onClose={() => { setIsSearchOpen(false); setSearchSeed(''); }}
        onGoToMatch={irACoincidencia}
        onReplaceOne={handleReplaceOne}
        onReplaceAll={handleReplaceAll}
      />

      <main className="workarea">
        <SidebarPanel
          isCollapsed={!isSidebarOpen}
          activeTab={sidebarTab}
          onChangeTab={setSidebarTab}
          onToggleSidebar={() => setIsSidebarOpen(false)}
          files={files}
          activeFileId={activeFileId}
          onSelectFile={setActiveFileId}
          onNewFile={handleNewFile}
          onCloseFile={handleCloseFile}
          onRenameFile={handleRenameFile}
          isFileDirty={isFileDirty}
          markdown={activeFile.content}
          currentOffset={documentOffset}
          onNavigateHeading={handleNavigateHeading}
        />

        {/* FULLSCREEN PREVIEW PANEL (WYSIWYG DEFAULT) */}
        {viewMode === 'preview' && (
          <PreviewPanel
            markdown={activeFile.content}
            onChangeMarkdown={updateActiveFileContent}
            previewContainerRef={previewContainerRef}
            syncRequest={previewSyncRequest}
            onFocusedObjectChange={(descriptor) => {
              focusedObjectRef.current = descriptor;
              setDocumentOffset(descriptor ? descriptor.start : 0);
            }}
            onOpenIconStyleModal={handleOpenIconStyleModal}
            onOpenTextStyleModal={handleOpenTextStyleModal}
            onOpenImageSettings={handleOpenImageSettings}
            onOpenMediaModal={handleOpenMediaModal}
          />
        )}

        {/* FULLSCREEN EDITOR PANEL (MARKDOWN SOURCE) */}
        {viewMode === 'editor' && (
          <EditorPanel
            markdown={activeFile.content}
            onChangeMarkdown={updateActiveFileContent}
            textareaRef={textareaRef}
            onCaretPositionChange={(offset) => {
              caretOffsetRef.current = offset;
              setDocumentOffset(offset);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={handleSelectIconFromPicker}
      />

      <ImageSettingsModal
        isOpen={isImageSettingsOpen}
        onClose={() => setIsImageSettingsOpen(false)}
        onInsertImage={handleInsertImage}
        selectedImageMarkdown={selectedImageMarkdown}
      />

      <IconStyleModal
        isOpen={isIconStyleModalOpen}
        onClose={() => setIsIconStyleModalOpen(false)}
        iconName={editingIconName}
        initialShortcode={editingIconShortcode}
        onApplyIconStyle={handleApplyIconStyle}
      />

      <TextStyleModal
        isOpen={isTextStyleModalOpen}
        onClose={() => setIsTextStyleModalOpen(false)}
        initialText={editingTextInitial}
        onApplyTextStyle={handleApplyTextStyle}
      />

      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        initialText={linkInitialText}
        initialUrl={linkInitialUrl}
        onApplyLink={handleApplyLink}
      />

      <MediaEmbedModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        selectedMediaMarkdown={selectedMediaMarkdown}
        onApplyMedia={handleApplyMedia}
      />

      <ChangeCaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        sourceText={caseSource.text}
        origen={caseSource.origen}
        onApply={handleApplyCase}
      />

      <OpenFileModal
        isOpen={isOpenFileModalOpen}
        onClose={() => setIsOpenFileModalOpen(false)}
        onBrowse={handleBrowseForFiles}
        onCreateBlank={handleCreateBlankFromScreen}
        isDragging={isDraggingFiles}
        lastOpenedName={lastOpenedName}
        canUseNativeFiles={canUseNativeFiles}
        historial={historial}
        entradasAbiertas={entradasAbiertas}
        onReopen={handleReopenFromHistory}
        onForget={handleForgetHistory}
        onClearHistory={handleClearHistory}
        onExportHistory={handleExportHistory}
        onImportHistory={handleImportHistory}
      />
    </div>
  );
}

export default App;
