'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

// Components
import { StudioSidebar } from './components/StudioSidebar';
import { TreeSidebar } from './components/TreeSidebar';
import { LessonPlayer } from './components/LessonPlayer';
import { PublishModal, SuccessToast } from './components/PublishModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PlanificacionSidebar, type ContentSection } from './components/PlanificacionSidebar';
import { SandboxIcons } from './components/SandboxIcons';
import { SaveStatusIndicator } from './components/SaveStatusIndicator';
import { EditorPanel } from './components/EditorPanel';
import { SplitView } from './components/SplitView';

// Types & Constants
import { House, type Lesson, type NodoContenido } from './types';
import type { StartParams, ContentType } from './components/WelcomeScreen';
import type { Planificacion } from '@/lib/api/planificaciones-admin.api';
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
import {
  crearPlanificacion,
  type CasaTipo as PlanCasaTipo,
  type MundoTipo as PlanMundoTipo,
} from '@/lib/api/planificaciones-admin.api';

// ─────────────────────────────────────────────────────────────────────────────
// TREE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

function findNodoById(nodos: NodoContenido[], id: string): NodoContenido | null {
  for (const nodo of nodos) {
    if (nodo.id === id) return nodo;
    const found = findNodoById(nodo.hijos, id);
    if (found) return found;
  }
  return null;
}

function updateNodoInTree(
  nodos: NodoContenido[],
  id: string,
  updates: Partial<NodoContenido>,
): NodoContenido[] {
  return nodos.map((nodo) => {
    if (nodo.id === id) return { ...nodo, ...updates };
    if (nodo.hijos.length > 0) {
      return { ...nodo, hijos: updateNodoInTree(nodo.hijos, id, updates) };
    }
    return nodo;
  });
}

function addNodoToParent(
  nodos: NodoContenido[],
  parentId: string,
  nuevoNodo: NodoContenido,
): NodoContenido[] {
  return nodos.map((nodo) => {
    if (nodo.id === parentId) return { ...nodo, hijos: [...nodo.hijos, nuevoNodo] };
    if (nodo.hijos.length > 0) {
      return { ...nodo, hijos: addNodoToParent(nodo.hijos, parentId, nuevoNodo) };
    }
    return nodo;
  });
}

function removeNodoFromTree(nodos: NodoContenido[], id: string): NodoContenido[] {
  return nodos
    .filter((nodo) => nodo.id !== id)
    .map((nodo) => ({ ...nodo, hijos: removeNodoFromTree(nodo.hijos, id) }));
}

function countDescendants(nodo: NodoContenido): number {
  let count = nodo.hijos.length;
  for (const hijo of nodo.hijos) {
    count += countDescendants(hijo);
  }
  return count;
}

function findFirstLeafNode(nodos: NodoContenido[]): NodoContenido | null {
  for (const nodo of nodos) {
    if (nodo.hijos.length === 0) return nodo;
    const found = findFirstLeafNode(nodo.hijos);
    if (found) return found;
  }
  return null;
}

function createDefaultNodos(initialJson: string): NodoContenido[] {
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
          contenidoJson: initialJson,
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

// ─────────────────────────────────────────────────────────────────────────────
// VIEW MODE - Solo 2 opciones: split y editor
// ─────────────────────────────────────────────────────────────────────────────

type ViewMode = 'split' | 'editor';

// ─────────────────────────────────────────────────────────────────────────────
// SANDBOX VIEW
// ─────────────────────────────────────────────────────────────────────────────

export function SandboxView() {
  const searchParams = useSearchParams();
  const contenidoIdFromUrl = searchParams.get('id');

  // ─── State ───
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendId, setBackendId] = useState<string | null>(null);
  const initialJsonString = JSON.stringify(INITIAL_JSON, null, 2);

  const [contentType, setContentType] = useState<ContentType>('microleccion');
  const [planificacion, setPlanificacion] = useState<Planificacion | null>(null);
  const [activeClaseIndex, setActiveClaseIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<ContentSection>('teoria');

  const [lesson, setLesson] = useState<Lesson>({
    id: 'new',
    title: 'Nueva Lección',
    house: House.QUANTUM,
    subject: 'MATH',
    estado: 'BORRADOR',
    nodos: [],
  });

  const {
    status: saveStatus,
    errorMessage: saveError,
    saveNodoContent,
    saveContenidoMeta,
    flushPendingChanges,
  } = useAutoSave(backendId);

  const [activeNodoId, setActiveNodoId] = useState<string | null>(null);
  const [activeNodo, setActiveNodo] = useState<NodoContenido | null>(null);
  const [editorContent, setEditorContent] = useState<string>(initialJsonString);
  const [view, setView] = useState<ViewMode>('editor');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTreeSidebarOpen, setIsTreeSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    nodoId: string;
    titulo: string;
    descendantCount: number;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  }, []);

  // ─── Derived State ───
  const houseStyles = useMemo(() => HOUSES[lesson.house], [lesson.house]);
  const isActiveNodoEditable = activeNodo !== null && activeNodo.hijos.length === 0;

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        setIsPlayerOpen(true);
      }
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
        const [contenido, arbol] = await Promise.all([
          getContenidoById(contenidoIdFromUrl),
          getArbol(contenidoIdFromUrl),
        ]);

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
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingContent();
  }, [contenidoIdFromUrl, hasStarted, initialJsonString, showError]);

  // ─── Editor Content Handler ───
  const updateEditorContent = useCallback(
    (value: string) => {
      setEditorContent(value);

      if (activeNodoId) {
        setLesson((prev) => ({
          ...prev,
          nodos: updateNodoInTree(prev.nodos, activeNodoId, { contenidoJson: value }),
        }));
        setActiveNodo((prev) => (prev ? { ...prev, contenidoJson: value } : null));

        if (backendId) {
          saveNodoContent(activeNodoId, value);
        }
      }
    },
    [activeNodoId, backendId, saveNodoContent],
  );

  const debouncedUpdateContent = useDebouncedCallback(updateEditorContent, 150);

  const handleEditorChange = useCallback(
    (value: string) => {
      debouncedUpdateContent(value);
    },
    [debouncedUpdateContent],
  );

  const handleInsertCode = useCallback(
    (snippet: string) => {
      updateEditorContent(editorContent + '\n' + snippet);
    },
    [editorContent, updateEditorContent],
  );

  const handleUpdateBackground = useCallback(
    (bg: string) => {
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
    },
    [editorContent, updateEditorContent, showError],
  );

  // ─── Nodo Management ───
  const handleSelectNodo = useCallback(
    async (nodo: NodoContenido) => {
      await flushPendingChanges();
      setActiveNodoId(nodo.id);
      setActiveNodo(nodo);

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

      const nodo = findNodoById(lesson.nodos, nodoId);
      if (!nodo) return;

      const descendantCount = countDescendants(nodo);
      if (descendantCount > 0 && !skipConfirmation) {
        setDeleteConfirmation({ nodoId, titulo: nodo.titulo, descendantCount });
        return;
      }

      try {
        await apiDeleteNodo(nodoId);
        setLesson((prev) => ({
          ...prev,
          nodos: removeNodoFromTree(prev.nodos, nodoId),
        }));

        if (activeNodoId === nodoId) {
          setActiveNodoId(null);
          setActiveNodo(null);
          setEditorContent(initialJsonString);
        }

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

        if (activeNodoId === nodoId) {
          setActiveNodo((prev) => (prev ? { ...prev, titulo: nuevoTitulo } : null));
        }
      } catch (error) {
        console.error('Error al renombrar nodo:', error);
        showError('Error al renombrar nodo. Intenta de nuevo.');
      }
    },
    [backendId, activeNodoId, showError],
  );

  // ─── Start Handler ───
  const handleStart = async (params: StartParams) => {
    const { house, subject, contentType: type, cantidadClases, titulo } = params;

    setIsLoading(true);
    setContentType(type);

    try {
      if (type === 'planificacion') {
        const plan = await crearPlanificacion({
          titulo: titulo || 'Nueva Planificación',
          cantidad_clases: cantidadClases || 8,
          casa_tipo: house as PlanCasaTipo,
          mundo_tipo: subjectToMundoTipo(subject) as PlanMundoTipo,
        });

        setPlanificacion(plan);
        setActiveClaseIndex(0);

        const primeraClase = plan.clases[0];
        if (primeraClase) {
          const arbol = await getArbol(primeraClase.teoria_id);

          setBackendId(primeraClase.teoria_id);
          const newLesson: Lesson = {
            id: primeraClase.teoria_id,
            title: `${plan.titulo} - Clase 1: ${primeraClase.titulo} (Teoría)`,
            house: plan.casa_tipo as House,
            subject: mundoTipoToSubject(plan.mundo_tipo),
            estado: plan.estado,
            nodos: arbol.map(mapNodoBackendToFrontend),
          };
          setLesson(newLesson);

          const firstLeaf = findFirstLeafNode(newLesson.nodos);
          if (firstLeaf) {
            handleSelectNodo(firstLeaf);
          }
        }

        setHasStarted(true);
      } else {
        const contenido = await createContenido({
          titulo: titulo || 'Nueva Lección',
          casaTipo: house as CasaTipo,
          mundoTipo: subjectToMundoTipo(subject),
        });

        const arbol = await getArbol(contenido.id);

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

        const firstLeaf = findFirstLeafNode(newLesson.nodos);
        if (firstLeaf) {
          handleSelectNodo(firstLeaf);
        }

        setHasStarted(true);
      }
    } catch (error) {
      console.error('Error al crear contenido:', error);
      showError('Error al crear contenido. Continuando en modo local.');
      setLesson({
        id: 'local',
        title: titulo || 'Nueva Lección',
        house,
        subject,
        estado: 'BORRADOR',
        nodos: createDefaultNodos(initialJsonString),
      });
      setHasStarted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Planificación Navigation ───
  const handleSelectClase = useCallback(
    async (index: number, section: ContentSection) => {
      if (!planificacion || index >= planificacion.clases.length) return;

      await flushPendingChanges();

      const clase = planificacion.clases[index];
      if (!clase) return;

      const contenidoId = section === 'teoria' ? clase.teoria_id : clase.practica_id;

      setIsLoading(true);
      try {
        const arbol = await getArbol(contenidoId);

        setBackendId(contenidoId);
        setActiveClaseIndex(index);
        setActiveSection(section);

        const sectionLabel = section === 'teoria' ? 'Teoría' : 'Práctica';
        const newLesson: Lesson = {
          id: contenidoId,
          title: `${planificacion.titulo} - Clase ${clase.numero}: ${clase.titulo} (${sectionLabel})`,
          house: planificacion.casa_tipo as House,
          subject: mundoTipoToSubject(planificacion.mundo_tipo),
          estado: planificacion.estado,
          nodos: arbol.map(mapNodoBackendToFrontend),
        };
        setLesson(newLesson);

        const firstLeaf = findFirstLeafNode(newLesson.nodos);
        if (firstLeaf) {
          setActiveNodoId(firstLeaf.id);
          setActiveNodo(firstLeaf);
          setEditorContent(firstLeaf.contenidoJson || initialJsonString);
        } else {
          setActiveNodoId(null);
          setActiveNodo(null);
          setEditorContent(initialJsonString);
        }
      } catch (error) {
        console.error('Error al cargar clase:', error);
        showError('Error al cargar la clase. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    },
    [planificacion, flushPendingChanges, initialJsonString, showError],
  );

  // ─── Publish Handler ───
  const handlePublish = async () => {
    if (!backendId) {
      showError('No hay contenido guardado para publicar');
      return;
    }

    setIsPublishing(true);
    try {
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

  const countLeafNodes = (nodos: NodoContenido[]): number => {
    return nodos.reduce((count, nodo) => {
      if (nodo.hijos.length === 0) return count + 1;
      return count + countLeafNodes(nodo.hijos);
    }, 0);
  };

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="flex h-full bg-[#030014] text-slate-200 items-center justify-center rounded-2xl border border-white/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#a855f7]/30 border-t-[#a855f7] rounded-full animate-spin" />
          <p className="text-[#94a3b8] text-sm">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  // ─── Welcome Screen ───
  if (!hasStarted) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  // ─── Main Editor ───
  return (
    <div className="flex h-full bg-[#030014] text-slate-200 overflow-hidden font-sans selection:bg-[#a855f7]/30 relative rounded-2xl border border-white/5">
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
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 hover:text-red-200">
            ✕
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmation(null)}
          />
          <div className="relative bg-[#1e1b4b] border border-white/10 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Confirmar eliminación</h2>
            <p className="text-gray-300">
              ¿Eliminar{' '}
              <strong className="text-white">&quot;{deleteConfirmation.titulo}&quot;</strong>?
            </p>
            <p className="text-red-400 font-medium mt-2">
              Esto eliminará {deleteConfirmation.descendantCount} subnodo(s).
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteNodo(deleteConfirmation.nodoId, true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Studio Sidebar */}
      <StudioSidebar
        currentHouse={lesson.house}
        setHouse={(h) => setLesson((prev) => ({ ...prev, house: h }))}
        onInsertCode={handleInsertCode}
        onUpdateBackground={handleUpdateBackground}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Planificación Sidebar */}
      {contentType === 'planificacion' && planificacion && (
        <div className="w-72 h-full bg-[#02040a] border-r border-[rgba(255,255,255,0.05)] flex flex-col shrink-0">
          <PlanificacionSidebar
            planificacion={planificacion}
            activeClaseIndex={activeClaseIndex}
            activeSection={activeSection}
            onSelectClase={handleSelectClase}
          />
        </div>
      )}

      {/* Tree Sidebar */}
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
            <button
              onClick={() => setIsTreeSidebarOpen(!isTreeSidebarOpen)}
              className={`p-2 rounded-lg transition-all ${isTreeSidebarOpen ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'text-[#64748b] hover:text-white hover:bg-[#131b2e]'}`}
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
            {/* View Toggle - Solo 2 opciones */}
            <div className="flex bg-[#0f0720] p-1 rounded-full border border-white/5">
              {(['split', 'editor'] as const).map((v) => (
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

            <button
              onClick={() => setShowPublishModal(true)}
              className="px-4 py-2 rounded-full border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/10 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
            >
              <SandboxIcons.Upload />
              Publicar
            </button>

            <button
              onClick={() => setIsPlayerOpen(true)}
              className="w-9 h-9 rounded-full bg-white text-black hover:bg-[#06b6d4] transition-all flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]"
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
                  <span className="ml-2 text-[10px] text-[#64748b]">(contenedor)</span>
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
        <div className="flex-1 overflow-hidden px-4 pb-4 pt-2 relative">
          {view === 'split' ? (
            <SplitView
              content={editorContent}
              onChange={handleEditorChange}
              activeNodo={activeNodo}
              isEditable={isActiveNodoEditable}
              houseStyles={houseStyles}
              activeNodoId={activeNodoId}
              refreshKey={refreshKey}
              onRefresh={() => setRefreshKey((k) => k + 1)}
            />
          ) : (
            <div className="h-full rounded-2xl overflow-hidden border border-[#8b5cf6]/20 shadow-2xl">
              <EditorPanel
                content={editorContent}
                onChange={handleEditorChange}
                activeNodo={activeNodo}
                isEditable={isActiveNodoEditable}
              />
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
