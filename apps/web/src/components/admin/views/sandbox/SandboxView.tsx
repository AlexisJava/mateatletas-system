'use client';

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Editor, { type OnMount } from '@monaco-editor/react';

// Components
import { StudioSidebar } from './components/StudioSidebar';
import { TreeSidebar } from './components/TreeSidebar';
import { CodePreview } from './components/CodePreview';
import { LessonPlayer } from './components/LessonPlayer';
import { PreviewErrorBoundary } from './components/PreviewErrorBoundary';
import { PublishModal, SuccessToast } from './components/PublishModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ViewportContext } from './components/DesignSystem';
import { SandboxIcons } from './components/SandboxIcons';
import { SaveStatusIndicator } from './components/SaveStatusIndicator';
import { Modal } from '@/components/ui/Modal';

// Types & Constants
import {
  House,
  type Subject,
  type Lesson,
  type NodoContenido,
  type SandboxViewMode,
  type PreviewMode,
} from './types';
import { INITIAL_JSON, HOUSES } from './constants';

// Hooks
import { useDebouncedCallback, useAutoSave } from './hooks';

// API
import {
  createContenido,
  publicarContenido,
  createNodo,
  updateNodo as apiUpdateNodo,
  deleteNodo as apiDeleteNodo,
  getArbol,
  getContenidoById,
  subjectToMundoTipo,
  mundoTipoToSubject,
  type NodoBackend,
  type CasaTipo,
} from '@/lib/api/contenidos.api';

// ─────────────────────────────────────────────────────────────────────────────
// TREE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Convierte NodoBackend del API a NodoContenido del frontend */
function mapNodoBackendToFrontend(nodo: NodoBackend): NodoContenido {
  return {
    id: nodo.id,
    titulo: nodo.titulo,
    bloqueado: nodo.bloqueado,
    parentId: nodo.parentId,
    orden: nodo.orden,
    contenidoJson: nodo.contenidoJson,
    hijos: (nodo.hijos ?? []).map(mapNodoBackendToFrontend),
  };
}

/** Buscar nodo por ID en árbol recursivo */
function findNodoById(nodos: NodoContenido[], id: string): NodoContenido | null {
  for (const nodo of nodos) {
    if (nodo.id === id) return nodo;
    const found = findNodoById(nodo.hijos, id);
    if (found) return found;
  }
  return null;
}

/** Actualizar nodo en árbol (immutable) */
function updateNodoInTree(
  nodos: NodoContenido[],
  id: string,
  updates: Partial<NodoContenido>,
): NodoContenido[] {
  return nodos.map((nodo) => {
    if (nodo.id === id) {
      return { ...nodo, ...updates };
    }
    if (nodo.hijos.length > 0) {
      return { ...nodo, hijos: updateNodoInTree(nodo.hijos, id, updates) };
    }
    return nodo;
  });
}

/** Agregar hijo a un nodo */
function addNodoToParent(
  nodos: NodoContenido[],
  parentId: string,
  nuevoNodo: NodoContenido,
): NodoContenido[] {
  return nodos.map((nodo) => {
    if (nodo.id === parentId) {
      return { ...nodo, hijos: [...nodo.hijos, nuevoNodo] };
    }
    if (nodo.hijos.length > 0) {
      return { ...nodo, hijos: addNodoToParent(nodo.hijos, parentId, nuevoNodo) };
    }
    return nodo;
  });
}

/** Eliminar nodo del árbol */
function removeNodoFromTree(nodos: NodoContenido[], id: string): NodoContenido[] {
  return nodos
    .filter((nodo) => nodo.id !== id)
    .map((nodo) => ({
      ...nodo,
      hijos: removeNodoFromTree(nodo.hijos, id),
    }));
}

/** Contar todos los descendientes de un nodo (hijos, nietos, etc.) */
function countDescendants(nodo: NodoContenido): number {
  let count = nodo.hijos.length;
  for (const hijo of nodo.hijos) {
    count += countDescendants(hijo);
  }
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// SANDBOX VIEW
// ─────────────────────────────────────────────────────────────────────────────

export function SandboxView() {
  // ─── URL Params ───
  const searchParams = useSearchParams();
  const contenidoIdFromUrl = searchParams.get('id');

  // ─── Initial State ───
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendId, setBackendId] = useState<string | null>(null);
  const initialJsonString = JSON.stringify(INITIAL_JSON, null, 2);

  const [lesson, setLesson] = useState<Lesson>({
    id: 'new',
    title: 'Nueva Lección',
    house: House.QUANTUM,
    subject: 'MATH',
    estado: 'BORRADOR',
    nodos: [],
  });

  // ─── Auto-Save Hook ───
  const {
    status: saveStatus,
    errorMessage: saveError,
    saveNodoContent,
    saveContenidoMeta,
    flushPendingChanges,
  } = useAutoSave(backendId);

  // ─── Editor State ───
  const [activeNodoId, setActiveNodoId] = useState<string | null>(null);
  const [activeNodo, setActiveNodo] = useState<NodoContenido | null>(null);
  const [editorContent, setEditorContent] = useState<string>(initialJsonString);
  const [view, setView] = useState<SandboxViewMode>('split');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTreeSidebarOpen, setIsTreeSidebarOpen] = useState(true);
  const [mobileScale, setMobileScale] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Publish State ───
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // ─── Delete Confirmation State ───
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    nodoId: string;
    titulo: string;
    descendantCount: number;
  } | null>(null);

  // ─── Error Toast State ───
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper para mostrar errores al usuario
  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000); // Auto-dismiss después de 5s
  }, []);

  // ─── Refs ───
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // ─── Derived State ───
  const houseStyles = useMemo(() => HOUSES[lesson.house], [lesson.house]);

  // Check if active nodo is a leaf (editable)
  const isActiveNodoEditable = activeNodo !== null && activeNodo.hijos.length === 0;

  // ─── Auto-Scaling for Mobile Simulator ───
  useLayoutEffect(() => {
    if (previewMode !== 'mobile' || !previewContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const TARGET_WIDTH = 450;
        const TARGET_HEIGHT = 900;

        const scaleX = width / TARGET_WIDTH;
        const scaleY = height / TARGET_HEIGHT;

        let newScale = Math.min(scaleX, scaleY, 1);
        newScale = Math.max(newScale * 0.95, 0.4);

        setMobileScale(newScale);
      }
    });

    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [previewMode, view]);

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S = Format
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleFormatCode();
      }
      // Cmd/Ctrl + Enter = Play
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        setIsPlayerOpen(true);
      }
      // Escape = Close player
      if (e.key === 'Escape' && isPlayerOpen) {
        setIsPlayerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerOpen]);

  // ─── Load Existing Content from URL ───
  useEffect(() => {
    if (!contenidoIdFromUrl || hasStarted) return;

    const loadExistingContent = async () => {
      setIsLoading(true);
      try {
        // Fetch contenido metadata and tree in parallel
        const [contenido, arbol] = await Promise.all([
          getContenidoById(contenidoIdFromUrl),
          getArbol(contenidoIdFromUrl),
        ]);

        // Update state with existing content
        setBackendId(contenido.id);
        const loadedLesson: Lesson = {
          id: contenido.id,
          title: contenido.titulo,
          house: contenido.casaTipo as House,
          subject: mundoTipoToSubject(contenido.mundoTipo),
          estado: contenido.estado,
          nodos: arbol.map(mapNodoBackendToFrontend),
        };
        setLesson(loadedLesson);

        // Select first leaf node if available
        const firstLeaf = findFirstLeafNode(loadedLesson.nodos);
        if (firstLeaf) {
          setActiveNodoId(firstLeaf.id);
          setActiveNodo(firstLeaf);
          setEditorContent(firstLeaf.contenidoJson || initialJsonString);
        }

        setHasStarted(true);
      } catch (error) {
        console.error('Error al cargar contenido existente:', error);
        showError('Error al cargar el contenido. Verifica que el ID sea válido.');
        // Don't set hasStarted, let user start fresh via WelcomeScreen
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingContent();
  }, [contenidoIdFromUrl, hasStarted, initialJsonString, showError]);

  // ─── Editor Handlers ───
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const updateEditorContent = useCallback(
    (value: string) => {
      setEditorContent(value);

      // Update local tree state
      if (activeNodoId) {
        setLesson((prev) => ({
          ...prev,
          nodos: updateNodoInTree(prev.nodos, activeNodoId, { contenidoJson: value }),
        }));

        // Also update activeNodo reference
        setActiveNodo((prev) => (prev ? { ...prev, contenidoJson: value } : null));

        // Trigger auto-save to backend
        if (backendId) {
          saveNodoContent(activeNodoId, value);
        }
      }
    },
    [activeNodoId, backendId, saveNodoContent],
  );

  const debouncedUpdateContent = useDebouncedCallback(updateEditorContent, 150);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      debouncedUpdateContent(value);
    }
  };

  const handleInsertCode = (snippet: string) => {
    const editor = editorRef.current;
    if (editor) {
      const selection = editor.getSelection();
      if (selection) {
        const op = { range: selection, text: snippet, forceMoveMarkers: true };
        editor.executeEdits('sandbox', [op]);
        editor.focus();
        setTimeout(() => editor.getAction('editor.action.formatDocument')?.run(), 100);
      }
    } else {
      updateEditorContent(editorContent + '\n' + snippet);
    }
  };

  const handleUpdateBackground = (bg: string) => {
    try {
      const jsonContent = JSON.parse(editorContent);
      if (jsonContent.type === 'Stage') {
        jsonContent.props = { ...jsonContent.props, background: bg };
        const newCode = JSON.stringify(jsonContent, null, 2);
        updateEditorContent(newCode);
      }
    } catch {
      showError('No se pudo actualizar el fondo: JSON inválido');
    }
  };

  // ─── Nodo Management ───
  const handleSelectNodo = useCallback(
    async (nodo: NodoContenido) => {
      // Guardar cambios pendientes antes de cambiar de nodo
      // Esto previene pérdida de datos si el usuario cambia de nodo
      // antes de que expire el debounce del auto-save
      await flushPendingChanges();

      setActiveNodoId(nodo.id);
      setActiveNodo(nodo);

      // Only load editor content if it's a leaf node (editable)
      if (nodo.hijos.length === 0) {
        setEditorContent(nodo.contenidoJson || initialJsonString);
      }
    },
    [initialJsonString, flushPendingChanges],
  );

  const handleAddNodo = useCallback(
    async (parentId: string) => {
      if (!backendId) return;

      try {
        const newNodo = await createNodo(backendId, {
          titulo: 'Nuevo nodo',
          parentId,
          contenidoJson: initialJsonString,
        });

        const frontendNodo = mapNodoBackendToFrontend(newNodo);

        setLesson((prev) => ({
          ...prev,
          nodos: addNodoToParent(prev.nodos, parentId, frontendNodo),
        }));

        // Select the new node
        handleSelectNodo(frontendNodo);
      } catch (error) {
        console.error('Error al agregar nodo:', error);
        showError('Error al agregar nodo. Intenta de nuevo.');
      }
    },
    [backendId, initialJsonString, handleSelectNodo, showError],
  );

  const handleDeleteNodo = useCallback(
    async (nodoId: string, skipConfirmation = false) => {
      if (!backendId) return;

      // Buscar el nodo para verificar si tiene hijos
      const nodo = findNodoById(lesson.nodos, nodoId);
      if (!nodo) return;

      // Si tiene descendientes y no se ha confirmado, pedir confirmación
      const descendantCount = countDescendants(nodo);
      if (descendantCount > 0 && !skipConfirmation) {
        setDeleteConfirmation({
          nodoId,
          titulo: nodo.titulo,
          descendantCount,
        });
        return;
      }

      try {
        await apiDeleteNodo(nodoId);

        setLesson((prev) => ({
          ...prev,
          nodos: removeNodoFromTree(prev.nodos, nodoId),
        }));

        // If deleted node was active, clear selection
        if (activeNodoId === nodoId) {
          setActiveNodoId(null);
          setActiveNodo(null);
          setEditorContent(initialJsonString);
        }

        // Limpiar estado de confirmación si estaba abierto
        setDeleteConfirmation(null);
      } catch (error) {
        console.error('Error al eliminar nodo:', error);
        showError('Error al eliminar nodo. Intenta de nuevo.');
      }
    },
    [backendId, activeNodoId, initialJsonString, lesson.nodos, showError],
  );

  const handleRenameNodo = useCallback(
    async (nodoId: string, nuevoTitulo: string) => {
      if (!backendId) return;

      try {
        await apiUpdateNodo(nodoId, { titulo: nuevoTitulo });

        setLesson((prev) => ({
          ...prev,
          nodos: updateNodoInTree(prev.nodos, nodoId, { titulo: nuevoTitulo }),
        }));

        // Update active nodo if it's the one being renamed
        if (activeNodoId === nodoId) {
          setActiveNodo((prev) => (prev ? { ...prev, titulo: nuevoTitulo } : null));
        }
        // Nota: NO llamamos saveNodoTitle aquí porque apiUpdateNodo ya guardó el título.
        // Llamar a saveNodoTitle causaría un doble request redundante.
      } catch (error) {
        console.error('Error al renombrar nodo:', error);
        showError('Error al renombrar nodo. Intenta de nuevo.');
      }
    },
    [backendId, activeNodoId, showError],
  );

  // ─── Start Handler ───
  const handleStart = async (house: House, subject: Subject, _pattern: string) => {
    setIsLoading(true);
    try {
      // Crear borrador en backend (el backend crea los 3 nodos raíz automáticamente)
      const contenido = await createContenido({
        titulo: 'Nueva Lección',
        casaTipo: house as CasaTipo,
        mundoTipo: subjectToMundoTipo(subject),
      });

      // Obtener árbol jerárquico con hijos (createContenido devuelve nodos planos)
      const arbol = await getArbol(contenido.id);

      // Actualizar estado local con datos del backend
      setBackendId(contenido.id);
      const newLesson: Lesson = {
        id: contenido.id,
        title: contenido.titulo,
        house: contenido.casaTipo as House,
        subject: mundoTipoToSubject(contenido.mundoTipo),
        estado: contenido.estado,
        nodos: arbol.map(mapNodoBackendToFrontend),
      };
      setLesson(newLesson);

      // Select first leaf node if available
      const firstLeaf = findFirstLeafNode(newLesson.nodos);
      if (firstLeaf) {
        handleSelectNodo(firstLeaf);
      }

      setHasStarted(true);
    } catch (error) {
      console.error('Error al crear contenido:', error);
      showError('Error al crear contenido. Continuando en modo local.');
      // Fallback: continuar sin backend con nodos vacíos
      setLesson({
        id: 'local',
        title: 'Nueva Lección',
        house,
        subject,
        estado: 'BORRADOR',
        nodos: createDefaultNodos(),
      });
      setHasStarted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to find first leaf node
  function findFirstLeafNode(nodos: NodoContenido[]): NodoContenido | null {
    for (const nodo of nodos) {
      if (nodo.hijos.length === 0) return nodo;
      const found = findFirstLeafNode(nodo.hijos);
      if (found) return found;
    }
    return null;
  }

  // Create default nodos for offline mode
  function createDefaultNodos(): NodoContenido[] {
    return [
      {
        id: 'teoria-1',
        titulo: 'Teoría',
        bloqueado: true,
        parentId: null,
        orden: 0,
        contenidoJson: null,
        hijos: [
          {
            id: 'teoria-intro',
            titulo: 'Introducción',
            bloqueado: false,
            parentId: 'teoria-1',
            orden: 0,
            contenidoJson: initialJsonString,
            hijos: [],
          },
        ],
      },
      {
        id: 'practica-1',
        titulo: 'Práctica',
        bloqueado: true,
        parentId: null,
        orden: 1,
        contenidoJson: null,
        hijos: [],
      },
      {
        id: 'evaluacion-1',
        titulo: 'Evaluación',
        bloqueado: true,
        parentId: null,
        orden: 2,
        contenidoJson: null,
        hijos: [],
      },
    ];
  }

  // ─── Publish Handler ───
  const handlePublish = async () => {
    if (!backendId) {
      showError('No hay contenido guardado para publicar');
      return;
    }

    setIsPublishing(true);
    try {
      // Guardar cambios pendientes antes de publicar
      await flushPendingChanges();

      await publicarContenido(backendId);
      setShowPublishModal(false);
      setShowSuccessToast(true);
      setLesson((prev) => ({ ...prev, estado: 'PUBLICADO' }));
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Error al publicar:', error);
      showError('Error al publicar. Verifica que el contenido tenga slides con contenido.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Count total leaf nodes for publish modal
  const countLeafNodes = (nodos: NodoContenido[]): number => {
    return nodos.reduce((count, nodo) => {
      if (nodo.hijos.length === 0) return count + 1;
      return count + countLeafNodes(nodo.hijos);
    }, 0);
  };

  // ─── Render Loading State ───
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] bg-[#030014] text-slate-200 items-center justify-center rounded-2xl border border-white/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#a855f7]/30 border-t-[#a855f7] rounded-full animate-spin" />
          <p className="text-[#94a3b8] text-sm">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  // ─── Render Welcome Screen ───
  if (!hasStarted) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  // ─── Render Main Editor ───
  return (
    <div className="flex h-[calc(100vh-10rem)] bg-[#030014] text-slate-200 overflow-hidden font-sans selection:bg-[#a855f7]/30 relative rounded-2xl border border-white/5">
      {/* Modals */}
      {showPublishModal && (
        <PublishModal
          isPublishing={isPublishing}
          onClose={() => setShowPublishModal(false)}
          onConfirm={handlePublish}
          lessonTitle={lesson.title}
          slideCount={countLeafNodes(lesson.nodos)}
        />
      )}
      {showSuccessToast && <SuccessToast />}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-2 hover:text-red-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmation(null)}
          title="Confirmar eliminación"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar{' '}
              <strong>&quot;{deleteConfirmation.titulo}&quot;</strong>?
            </p>
            <p className="text-red-600 font-medium">
              ⚠️ Esta acción eliminará también {deleteConfirmation.descendantCount}{' '}
              {deleteConfirmation.descendantCount === 1 ? 'subnodo' : 'subnodos'} que dependen de
              este nodo.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteNodo(deleteConfirmation.nodoId, true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Eliminar todo
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Studio Sidebar (Components & Backgrounds) */}
      <StudioSidebar
        currentHouse={lesson.house}
        setHouse={(h) => setLesson((prev) => ({ ...prev, house: h }))}
        onInsertCode={handleInsertCode}
        onUpdateBackground={handleUpdateBackground}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Tree Sidebar (Content Structure) */}
      {isTreeSidebarOpen && (
        <div className="w-64 h-full bg-[#02040a] border-r border-[rgba(255,255,255,0.05)] flex flex-col shrink-0">
          <TreeSidebar
            nodos={lesson.nodos}
            activeNodoId={activeNodoId}
            onSelectNodo={handleSelectNodo}
            onAddNodo={handleAddNodo}
            onDeleteNodo={handleDeleteNodo}
            onRenameNodo={handleRenameNodo}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#030014]">
        {/* Navbar */}
        <div className="h-14 flex items-center justify-between px-4 bg-[#030014] shrink-0 z-20 border-b border-[#8b5cf6]/10">
          <div className="flex items-center gap-4">
            {/* Toggle Tree Sidebar */}
            <button
              onClick={() => setIsTreeSidebarOpen(!isTreeSidebarOpen)}
              className={`p-2 rounded-lg transition-all ${isTreeSidebarOpen ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'text-[#64748b] hover:text-white hover:bg-[#131b2e]'}`}
              aria-label={isTreeSidebarOpen ? 'Ocultar árbol' : 'Mostrar árbol'}
            >
              <SandboxIcons.Tree />
            </button>

            <div className="flex items-center gap-4 bg-[#0f0720] p-1.5 pr-4 rounded-full border border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-sm text-[#a855f7]">
                <SandboxIcons.Document />
              </div>
              <input
                value={lesson.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setLesson((prev) => ({ ...prev, title: newTitle }));
                  if (backendId) {
                    saveContenidoMeta({ titulo: newTitle });
                  }
                }}
                className="bg-transparent text-sm font-bold text-white focus:outline-none w-48 placeholder-[#64748b]"
                placeholder="Nombre del Proyecto"
              />
            </div>
            <SaveStatusIndicator status={saveStatus} errorMessage={saveError} />
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-[#0f0720] p-1 rounded-full border border-white/5">
              {(['split', 'editor', 'preview'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all uppercase tracking-wide ${view === v ? 'bg-[#1e1b4b] text-white shadow-sm ring-1 ring-white/10' : 'text-[#64748b] hover:text-white'}`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* Publish Button */}
            <button
              onClick={() => setShowPublishModal(true)}
              className="px-4 py-2 rounded-full border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/10 text-[10px] font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center gap-2"
              aria-label="Publicar lección"
            >
              <SandboxIcons.Upload />
              Publicar
            </button>

            {/* Play Button */}
            <button
              onClick={() => setIsPlayerOpen(true)}
              className="group w-9 h-9 rounded-full bg-white text-black hover:bg-[#06b6d4] transition-all flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              aria-label="Previsualizar lección (Cmd+Enter)"
            >
              <SandboxIcons.Play />
            </button>
          </div>
        </div>

        {/* Active Node Indicator */}
        <div className="h-10 px-4 flex items-center gap-3 bg-[#030014] border-b border-[#8b5cf6]/5 shrink-0">
          {activeNodo ? (
            <>
              <span
                className={`w-2 h-2 rounded-full ${isActiveNodoEditable ? 'bg-[#4ade80] shadow-[0_0_5px_#4ade80]' : 'bg-[#fbbf24] shadow-[0_0_5px_#fbbf24]'}`}
              />
              <span className="text-xs font-medium text-[#94a3b8]">
                {activeNodo.titulo}
                {!isActiveNodoEditable && (
                  <span className="ml-2 text-[10px] text-[#64748b]">
                    (contenedor - seleccioná un nodo hoja)
                  </span>
                )}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#475569]" />
              <span className="text-xs text-[#64748b]">Seleccioná un nodo para editar</span>
            </>
          )}
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden gap-4 bg-[#030014] relative z-0 px-4 pb-4 pt-2">
          {/* EDITOR */}
          {(view === 'split' || view === 'editor') && (
            <div
              className={`flex-1 relative flex flex-col ${view === 'editor' ? 'w-full' : 'w-1/2'} bg-[#0f0720] rounded-2xl overflow-hidden border border-[#8b5cf6]/20 shadow-2xl group transition-all duration-300`}
            >
              {isActiveNodoEditable ? (
                <>
                  <div className="absolute top-3 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleFormatCode}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1b4b]/90 backdrop-blur-sm border border-white/10 rounded-lg text-[10px] font-bold text-[#94a3b8] hover:text-white hover:bg-[#2e1065] transition-colors shadow-lg"
                      aria-label="Formatear JSON (Cmd+S)"
                    >
                      <SandboxIcons.Format />
                      <span>PRETTIFY</span>
                    </button>
                  </div>

                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    theme="vs-dark"
                    value={editorContent}
                    onMount={handleEditorDidMount}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontLigatures: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 24, bottom: 24 },
                      lineNumbers: 'on',
                      renderLineHighlight: 'line',
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      bracketPairColorization: { enabled: true },
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#131b2e] flex items-center justify-center mb-4 text-[#475569]">
                    <SandboxIcons.Folder />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">
                    {activeNodo ? 'Nodo Contenedor' : 'Sin Selección'}
                  </h3>
                  <p className="text-xs text-[#64748b] max-w-xs">
                    {activeNodo
                      ? 'Este nodo contiene sub-nodos. Seleccioná un nodo hoja (sin hijos) para editar su contenido.'
                      : 'Seleccioná un nodo del árbol de contenido para comenzar a editar.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PREVIEW */}
          {(view === 'split' || view === 'preview') && (
            <div
              className={`flex-1 relative flex flex-col ${view === 'preview' ? 'w-full' : 'w-1/2'} transition-all duration-300`}
            >
              <div
                ref={previewContainerRef}
                className="absolute inset-0 bg-[#0f0720] rounded-2xl border border-white/5 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f0720_90%)]" />
              </div>

              <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
                {previewMode === 'mobile' ? (
                  <div
                    style={{ transform: `scale(${mobileScale})` }}
                    className="origin-center transition-transform duration-300 ease-out will-change-transform"
                  >
                    <div className="relative w-[375px] h-[780px] bg-black rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_0_12px_#1a1a1a,0_0_0_13px_#333] border-4 border-[#1a1a1a] overflow-hidden">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-2">
                        <div className="w-16 h-1 bg-[#1a1a1a] rounded-full" />
                        <div className="w-2 h-2 bg-[#1a1a1a] rounded-full" />
                      </div>
                      <div
                        className="w-full h-full bg-[#030014] overflow-hidden relative"
                        style={
                          {
                            '--house-primary': houseStyles.primaryColor,
                            '--house-secondary': houseStyles.secondaryColor,
                            '--house-accent': houseStyles.accentColor,
                          } as React.CSSProperties
                        }
                      >
                        <ViewportContext.Provider value={{ isMobile: true }}>
                          <PreviewErrorBoundary onReset={() => setRefreshKey((k) => k + 1)}>
                            <CodePreview
                              code={editorContent}
                              key={`preview-${activeNodoId}-${refreshKey}`}
                              showGuidelines={false}
                            />
                          </PreviewErrorBoundary>
                        </ViewportContext.Provider>
                        <div className="absolute top-1 right-5 text-[10px] font-bold text-white z-40">
                          100%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full max-h-[700px] bg-[#030014] rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/50">
                    <div className="h-8 bg-[#0b101b] border-b border-white/5 flex items-center px-4 gap-4 shrink-0">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                      </div>
                      <div className="flex-1 bg-[#02040a] h-5 rounded flex items-center justify-center text-[9px] text-[#64748b] font-mono border border-white/5">
                        <span className="text-[#a855f7]">localhost</span>:3000/preview
                      </div>
                    </div>
                    <div
                      className="flex-1 relative overflow-hidden"
                      style={
                        {
                          '--house-primary': houseStyles.primaryColor,
                          '--house-secondary': houseStyles.secondaryColor,
                          '--house-accent': houseStyles.accentColor,
                        } as React.CSSProperties
                      }
                    >
                      <PreviewErrorBoundary onReset={() => setRefreshKey((k) => k + 1)}>
                        <CodePreview
                          code={editorContent}
                          key={`preview-${activeNodoId}-${refreshKey}`}
                          showGuidelines={true}
                        />
                      </PreviewErrorBoundary>
                    </div>
                  </div>
                )}

                {/* Floating Control Bar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-[#0f0720]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 hover:scale-105 transition-transform duration-300">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-full transition-all duration-300 ${previewMode === 'desktop' ? 'bg-[#3bf6ff]/10 text-[#3bf6ff] shadow-[0_0_15px_rgba(59,246,255,0.2)]' : 'text-[#64748b] hover:text-white hover:bg-white/5'}`}
                    aria-label="Modo escritorio"
                  >
                    <SandboxIcons.Desktop />
                  </button>
                  <div className="w-px h-4 bg-white/10" />
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-full transition-all duration-300 ${previewMode === 'mobile' ? 'bg-[#3bf6ff]/10 text-[#3bf6ff] shadow-[0_0_15px_rgba(59,246,255,0.2)]' : 'text-[#64748b] hover:text-white hover:bg-white/5'}`}
                    aria-label="Modo móvil"
                  >
                    <SandboxIcons.Mobile />
                  </button>
                  <div className="w-px h-4 bg-white/10" />
                  <button
                    onClick={() => setRefreshKey((k) => k + 1)}
                    className="p-2 rounded-full text-[#64748b] hover:text-[#00ffa3] hover:bg-[#00ffa3]/10 transition-all active:rotate-180 duration-500"
                    aria-label="Recargar preview"
                  >
                    <SandboxIcons.Refresh />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lesson Player Overlay */}
      {isPlayerOpen && (
        <LessonPlayer
          lesson={lesson}
          houseStyles={houseStyles}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}
    </div>
  );
}

export default SandboxView;
