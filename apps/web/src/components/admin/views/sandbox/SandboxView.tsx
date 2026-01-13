'use client';

import { Suspense, useCallback, useState, useEffect, type ReactElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PanelLeftClose, PanelLeft, Maximize2, Minimize2 } from 'lucide-react';
import { SandboxProvider, useSandboxState, useSandboxDispatch } from './context/SandboxContext';
import {
  useLoadFromUrl,
  useSandboxApi,
  useAutoSave,
  mapContenidoBackendToFrontend,
  mapPlanificacionBackendToFrontend,
} from './hooks';
import {
  TreePanel,
  EditorPanel,
  PreviewPanel,
  StartModal,
  CompactHeader,
  SandboxLoading,
  type CreatedContentResult,
} from './components';
import { findNodoById } from './utils/tree.utils';
import type { ContenidoBackend } from '@/lib/api/contenidos.api';
import type { Planificacion as PlanificacionBackend } from '@/lib/api/planificaciones-admin.api';
import type { NodoContenido, ClasePlanificacion } from './types/sandbox.types';
import styles from './SandboxView.module.css';

/**
 * SandboxView - Main entry point with Provider wrapper
 * Wraps the layout in SandboxProvider for state management
 */
export function SandboxView(): ReactElement {
  return (
    <SandboxProvider>
      <div className={styles.wrapper}>
        <Suspense fallback={<SandboxLoading />}>
          <SandboxLayout />
        </Suspense>
      </div>
    </SandboxProvider>
  );
}

/**
 * SandboxLayout - 3-panel IDE layout with resizable panels
 * Compact header with work timer | TreePanel | EditorPanel | PreviewPanel
 */
function SandboxLayout(): ReactElement {
  useLoadFromUrl();
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useSandboxState();
  const dispatch = useSandboxDispatch();
  const { saveNodoJson } = useSandboxApi();

  const [isTreeVisible, setIsTreeVisible] = useState<boolean>(true);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState<boolean>(false);

  const toggleFullscreen = useCallback((): void => {
    setIsPreviewFullscreen((prev) => !prev);
  }, []);

  // Close fullscreen with Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape' && isPreviewFullscreen) {
        setIsPreviewFullscreen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewFullscreen]);

  const hasIdInUrl = searchParams.get('id') !== null;

  // Find selected nodo (for microlección)
  const selectedNodo: NodoContenido | null =
    state.contentType === 'microleccion' && state.contenido && state.selectedItemId
      ? findNodoById(state.contenido.nodos, state.selectedItemId)
      : null;

  // Find selected clase (for planificación)
  const selectedClase: ClasePlanificacion | null =
    state.contentType === 'planificacion' && state.planificacion && state.selectedItemId
      ? (state.planificacion.clases.find((c) => c.id === state.selectedItemId) ?? null)
      : null;

  // Auto-save: debounce changes and persist to API
  useAutoSave({
    nodoId: selectedNodo?.id ?? null,
    json: selectedNodo?.contenidoJson ?? null,
    onSave: saveNodoJson,
  });

  const handleEditorChange = useCallback(
    (value: string): void => {
      if (state.contentType === 'microleccion' && state.selectedItemId) {
        dispatch({
          type: 'UPDATE_NODO_JSON',
          payload: { nodoId: state.selectedItemId, json: value },
        });
      }
    },
    [dispatch, state.selectedItemId, state.contentType],
  );

  // Open Teoría/Práctica content from a clase in the sandbox
  const handleOpenContenido = useCallback(
    (contenidoId: string): void => {
      router.push(`/admin/sandbox?type=microleccion&id=${contenidoId}`);
    },
    [router],
  );

  const handleContentCreated = useCallback(
    (result: CreatedContentResult): void => {
      // Load data directly into state (avoids GET that fails with CUID)
      if (result.type === 'planificacion') {
        dispatch({ type: 'SET_CONTENT_TYPE', payload: 'planificacion' });
        const planificacion = mapPlanificacionBackendToFrontend(
          result.data as PlanificacionBackend,
        );
        dispatch({ type: 'SET_PLANIFICACION', payload: planificacion });
      } else {
        dispatch({ type: 'SET_CONTENT_TYPE', payload: 'microleccion' });
        const contenido = mapContenidoBackendToFrontend(result.data as ContenidoBackend);
        dispatch({ type: 'SET_CONTENIDO', payload: contenido });
      }
      // Use replace to update URL without triggering full navigation
      router.replace(`/admin/sandbox?type=${result.type}&id=${result.id}`, { scroll: false });
    },
    [router, dispatch],
  );

  if (state.isLoading) {
    return <SandboxLoading />;
  }

  // Show StartModal if no ID in URL and no content loaded
  const hasContent = state.contenido !== null || state.planificacion !== null;
  if (!hasIdInUrl && !hasContent) {
    return <StartModal onCreated={handleContentCreated} />;
  }

  // Determine panel title
  const panelTitle =
    state.contentType === 'planificacion'
      ? (state.planificacion?.titulo ?? 'Planificación')
      : (state.contenido?.titulo ?? 'Contenido');

  const gridClasses = [styles.sandboxGrid, !isTreeVisible ? styles.sandboxGridTreeHidden : '']
    .filter(Boolean)
    .join(' ');

  const previewClasses = [
    styles.sandboxPanel,
    styles.sandboxPanelPreview,
    isPreviewFullscreen ? styles.previewFullscreen : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.sandboxFull}>
      <CompactHeader
        title={panelTitle}
        contentType={state.contentType}
        saveStatus={state.saveStatus}
      />

      <div className={gridClasses}>
        {/* Tree Panel - 20% (collapsible) */}
        {isTreeVisible && (
          <div className={`${styles.sandboxPanel} ${styles.sandboxPanelTree}`}>
            <div className={styles.sandboxPanelHeader}>
              <span>Árbol</span>
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setIsTreeVisible(false)}
                title="Ocultar árbol"
                aria-label="Ocultar árbol"
              >
                <PanelLeftClose size={14} />
              </button>
            </div>
            <div className={styles.sandboxPanelContent}>
              <TreePanel />
            </div>
          </div>
        )}

        {/* Editor Panel - 30% (or more if tree hidden) */}
        <div className={styles.sandboxPanel}>
          <div className={styles.sandboxPanelHeader}>
            {!isTreeVisible && (
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setIsTreeVisible(true)}
                title="Mostrar árbol"
                aria-label="Mostrar árbol"
              >
                <PanelLeft size={14} />
              </button>
            )}
            <span>Editor</span>
          </div>
          <div className={styles.sandboxPanelContent}>
            <EditorPanel
              contentType={state.contentType}
              selectedNodo={selectedNodo}
              selectedClase={selectedClase}
              onChange={handleEditorChange}
              onOpenContenido={handleOpenContenido}
            />
          </div>
        </div>

        {/* Preview Panel - 50% */}
        <div className={previewClasses}>
          <div className={styles.sandboxPanelHeader}>
            <span>Preview</span>
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={toggleFullscreen}
              title={isPreviewFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isPreviewFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
          <div className={styles.sandboxPanelContent}>
            <PreviewPanel
              content={selectedNodo?.contenidoJson ?? ''}
              nodoId={state.selectedItemId}
              isLeafNode={selectedNodo !== null ? selectedNodo.hijos.length === 0 : false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
