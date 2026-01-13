'use client';

import { Suspense, useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileCode2, Layers, PanelLeftClose, PanelLeft, Maximize2, Minimize2 } from 'lucide-react';
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
  SaveIndicator,
  type CreatedContentResult,
} from './components';
import { findNodoById } from './utils/tree.utils';
import type { ContenidoBackend } from '@/lib/api/contenidos.api';
import type { Planificacion as PlanificacionBackend } from '@/lib/api/planificaciones-admin.api';

/**
 * SandboxView - 3-panel IDE layout with resizable panels
 * Compact header with work timer | TreePanel | EditorPanel | PreviewPanel
 */
export function SandboxView() {
  return (
    <SandboxProvider>
      <div className="sandbox-wrapper">
        <Suspense fallback={<SandboxLoading />}>
          <SandboxLayout />
        </Suspense>
        <style jsx>{`
          .sandbox-wrapper {
            flex: 1 1 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
        `}</style>
      </div>
    </SandboxProvider>
  );
}

function SandboxLoading() {
  return (
    <div className="sandbox-loading">
      <div className="loading-spinner" />
      <p>Cargando Sandbox...</p>
      <style jsx>{`
        .sandbox-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          height: 100%;
          flex: 1;
          background: var(--admin-bg);
          color: var(--admin-text-muted);
        }
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid var(--admin-border);
          border-top-color: var(--admin-accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POMODORO CLOCK - Reloj con indicador de descanso cada 25 min
// ─────────────────────────────────────────────────────────────────────────────

function PomodoroClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStart] = useState(() => new Date());
  const [needsBreak, setNeedsBreak] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Calcular minutos desde inicio de sesión
      const minutesWorked = Math.floor((now.getTime() - sessionStart.getTime()) / 60000);
      // Indicar descanso después de 25 minutos
      setNeedsBreak(minutesWorked >= 25);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`pomodoro-clock ${needsBreak ? 'needs-break' : ''}`}>
      <div className="clock-indicator" />
      <span className="clock-time">{formatTime(currentTime)}</span>
      {needsBreak && <span className="break-hint">Descanso</span>}
      <style jsx>{`
        .pomodoro-clock {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: var(--admin-surface-2);
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          font-variant-numeric: tabular-nums;
          transition: all 0.3s ease;
        }
        .pomodoro-clock.needs-break {
          background: linear-gradient(
            135deg,
            rgba(245, 158, 11, 0.15) 0%,
            rgba(239, 68, 68, 0.1) 100%
          );
          border-color: rgba(245, 158, 11, 0.4);
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.2);
          animation: pulse-break 2s ease-in-out infinite;
        }
        @keyframes pulse-break {
          0%,
          100% {
            box-shadow: 0 0 16px rgba(245, 158, 11, 0.2);
          }
          50% {
            box-shadow: 0 0 24px rgba(245, 158, 11, 0.35);
          }
        }
        .clock-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--admin-accent);
          animation: blink 1s ease-in-out infinite;
        }
        .needs-break .clock-indicator {
          background: #f59e0b;
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .clock-time {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--admin-text);
        }
        .break-hint {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #f59e0b;
          padding: 0.125rem 0.375rem;
          background: rgba(245, 158, 11, 0.15);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPACT HEADER - Reemplaza el saludo por info del contenido + timer
// ─────────────────────────────────────────────────────────────────────────────

interface CompactHeaderProps {
  title: string;
  contentType: 'microleccion' | 'planificacion';
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

function CompactHeader({ title, contentType, saveStatus }: CompactHeaderProps) {
  return (
    <header className="compact-header">
      <div className="header-left">
        <div className="content-badge">
          {contentType === 'planificacion' ? <Layers size={14} /> : <FileCode2 size={14} />}
          <span>{contentType === 'planificacion' ? 'Planificación' : 'Microlección'}</span>
        </div>
        <h1 className="content-title">{title}</h1>
        <SaveIndicator status={saveStatus} />
      </div>
      <div className="header-right">
        <PomodoroClock />
      </div>
      <style jsx>{`
        .compact-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: #000;
          border-bottom: 1px solid var(--admin-border);
          flex-shrink: 0;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }
        .content-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.625rem;
          background: var(--admin-accent-muted);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 6px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--admin-accent);
          flex-shrink: 0;
        }
        .content-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--admin-text);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
      `}</style>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

function SandboxLayout() {
  useLoadFromUrl();
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useSandboxState();
  const dispatch = useSandboxDispatch();
  const { saveNodoJson } = useSandboxApi();
  const [isTreeVisible, setIsTreeVisible] = useState(true);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsPreviewFullscreen((prev) => !prev);
  }, []);

  // Cerrar fullscreen con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewFullscreen) {
        setIsPreviewFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewFullscreen]);

  const hasIdInUrl = !!searchParams.get('id');

  // Find selected nodo (for microlección)
  const selectedNodo =
    state.contentType === 'microleccion' && state.contenido && state.selectedItemId
      ? findNodoById(state.contenido.nodos, state.selectedItemId)
      : null;

  // Find selected clase (for planificación)
  const selectedClase =
    state.contentType === 'planificacion' && state.planificacion && state.selectedItemId
      ? state.planificacion.clases.find((c) => c.id === state.selectedItemId)
      : null;

  // Auto-save: debounce changes and persist to API
  useAutoSave({
    nodoId: selectedNodo?.id ?? null,
    json: selectedNodo?.contenidoJson ?? null,
    onSave: saveNodoJson,
  });

  const handleEditorChange = useCallback(
    (value: string) => {
      if (state.contentType === 'microleccion' && state.selectedItemId) {
        dispatch({
          type: 'UPDATE_NODO_JSON',
          payload: { nodoId: state.selectedItemId, json: value },
        });
      }
    },
    [dispatch, state.selectedItemId, state.contentType],
  );

  // Abrir contenido de Teoría/Práctica de una clase en el sandbox
  const handleOpenContenido = useCallback(
    (contenidoId: string) => {
      router.push(`/admin/sandbox?type=microleccion&id=${contenidoId}`);
    },
    [router],
  );

  const handleContentCreated = useCallback(
    (result: CreatedContentResult) => {
      // Cargar datos directamente en el estado (evita GET que falla con CUID)
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
      // Usar replace para actualizar URL sin disparar navegación completa
      router.replace(`/admin/sandbox?type=${result.type}&id=${result.id}`, { scroll: false });
    },
    [router, dispatch],
  );

  if (state.isLoading) {
    return <SandboxLoading />;
  }

  // Show StartModal if no ID in URL and no content loaded
  const hasContent = state.contenido || state.planificacion;
  if (!hasIdInUrl && !hasContent) {
    return <StartModal onCreated={handleContentCreated} />;
  }

  // Determine panel title
  const panelTitle =
    state.contentType === 'planificacion'
      ? state.planificacion?.titulo || 'Planificación'
      : state.contenido?.titulo || 'Contenido';

  return (
    <div className="sandbox-full">
      {/* Compact Header con timer */}
      <CompactHeader
        title={panelTitle}
        contentType={state.contentType}
        saveStatus={state.saveStatus}
      />

      {/* 3-Panel Layout con CSS Grid */}
      <div className={`sandbox-grid ${isTreeVisible ? '' : 'tree-hidden'}`}>
        {/* Tree Panel - 20% (colapsable) */}
        {isTreeVisible && (
          <div className="sandbox-panel sandbox-panel-tree">
            <div className="sandbox-panel-header">
              <span>Árbol</span>
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsTreeVisible(false)}
                title="Ocultar árbol"
                aria-label="Ocultar árbol"
              >
                <PanelLeftClose size={14} />
              </button>
            </div>
            <div className="sandbox-panel-content">
              <TreePanel />
            </div>
          </div>
        )}

        {/* Editor Panel - 30% (o más si árbol oculto) */}
        <div className="sandbox-panel">
          <div className="sandbox-panel-header">
            {!isTreeVisible && (
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsTreeVisible(true)}
                title="Mostrar árbol"
                aria-label="Mostrar árbol"
              >
                <PanelLeft size={14} />
              </button>
            )}
            <span>Editor</span>
          </div>
          <div className="sandbox-panel-content">
            <EditorPanel
              contentType={state.contentType}
              selectedNodo={selectedNodo}
              selectedClase={selectedClase}
              onChange={handleEditorChange}
              onOpenContenido={handleOpenContenido}
            />
          </div>
        </div>

        {/* Preview Panel - 70% */}
        <div
          className={`sandbox-panel sandbox-panel-preview ${isPreviewFullscreen ? 'preview-fullscreen' : ''}`}
        >
          <div className="sandbox-panel-header">
            <span>Preview</span>
            <button
              type="button"
              className="toggle-btn"
              onClick={toggleFullscreen}
              title={isPreviewFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isPreviewFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
          <div className="sandbox-panel-content">
            <PreviewPanel
              content={selectedNodo?.contenidoJson ?? ''}
              nodoId={state.selectedItemId}
              isLeafNode={selectedNodo ? selectedNodo.hijos.length === 0 : false}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .sandbox-full {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background: #000;
        }
        .sandbox-grid {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 20fr 30fr 50fr;
          gap: 2px;
          background: var(--admin-border);
          transition: grid-template-columns 0.3s ease;
        }
        .sandbox-grid.tree-hidden {
          grid-template-columns: 30fr 70fr;
        }
        .sandbox-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0a0a0a;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .sandbox-panel-tree {
          border-radius: 12px 0 0 12px;
        }
        .sandbox-panel-preview {
          border-radius: 0 12px 12px 0;
        }
        .sandbox-panel-preview.preview-fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          border-radius: 0;
          background: #000;
        }
        .sandbox-panel-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--admin-text-muted);
          background: #111;
          border-bottom: 1px solid var(--admin-border);
          flex-shrink: 0;
        }
        .sandbox-panel-header span {
          flex: 1;
        }
        .sandbox-panel-content {
          flex: 1;
          min-height: 0;
          overflow: auto;
          background: #0a0a0a;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          padding: 0;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          color: var(--admin-text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .toggle-btn:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--admin-accent);
          color: var(--admin-accent);
        }
      `}</style>
    </div>
  );
}
