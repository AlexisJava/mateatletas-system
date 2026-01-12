'use client';

import { Suspense, useCallback } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { SandboxProvider, useSandboxState, useSandboxDispatch } from './context/SandboxContext';
import { useLoadFromUrl } from './hooks';
import { TreePanel, EditorPanel } from './components';
import { findNodoById } from './utils/tree.utils';

/**
 * SandboxView - 3-panel IDE layout with resizable panels
 * TreePanel | EditorPanel | PreviewPanel
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
          }
        `}</style>
      </div>
    </SandboxProvider>
  );
}

function SandboxLoading() {
  return (
    <div className="sandbox-loading">
      <p>Cargando...</p>
      <style jsx>{`
        .sandbox-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          flex: 1;
          background: var(--admin-bg);
          color: var(--admin-text-muted);
        }
      `}</style>
    </div>
  );
}

function SandboxLayout() {
  useLoadFromUrl();
  const state = useSandboxState();
  const dispatch = useSandboxDispatch();

  // Find selected nodo and get its content
  const selectedNodo =
    state.contenido && state.selectedNodoId
      ? findNodoById(state.contenido.nodos, state.selectedNodoId)
      : null;

  const handleEditorChange = useCallback(
    (value: string) => {
      if (state.selectedNodoId) {
        dispatch({
          type: 'UPDATE_NODO_JSON',
          payload: { nodoId: state.selectedNodoId, json: value },
        });
      }
    },
    [dispatch, state.selectedNodoId],
  );

  if (state.isLoading) {
    return <SandboxLoading />;
  }

  return (
    <PanelGroup
      orientation="horizontal"
      className="sandbox-container"
      style={{ flex: '1 1 0', minHeight: 0 }}
    >
      {/* Tree Panel */}
      <Panel defaultSize="20%" minSize="15%" maxSize="35%" style={{ height: '100%' }}>
        <div className="sandbox-panel">
          <div className="sandbox-panel-header">
            {state.contenido ? state.contenido.titulo : 'Árbol'}
          </div>
          <div className="sandbox-panel-content">
            <TreePanel />
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="resize-handle" />

      {/* Editor Panel */}
      <Panel defaultSize="50%" minSize="30%" style={{ height: '100%' }}>
        <div className="sandbox-panel">
          <div className="sandbox-panel-header">Editor</div>
          <div className="sandbox-panel-content">
            <EditorPanel
              content={selectedNodo?.contenidoJson || ''}
              onChange={handleEditorChange}
              nodoId={state.selectedNodoId}
            />
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="resize-handle" />

      {/* Preview Panel */}
      <Panel defaultSize="30%" minSize="15%" style={{ height: '100%' }}>
        <div className="sandbox-panel">
          <div className="sandbox-panel-header">Preview</div>
          <div className="sandbox-panel-content">
            <p className="sandbox-empty">Preview del contenido</p>
          </div>
        </div>
      </Panel>

      <style jsx global>{`
        .sandbox-container {
          flex: 1;
          min-height: 0;
          background: var(--admin-bg);
          color: var(--admin-text);
        }
        .sandbox-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .sandbox-panel-header {
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--admin-text-muted);
          background: var(--admin-surface-1);
          border-bottom: 1px solid var(--admin-border);
          flex-shrink: 0;
        }
        .sandbox-panel-content {
          flex: 1;
          min-height: 0;
          overflow: auto;
          background: var(--admin-surface-1);
        }
        .sandbox-empty {
          color: var(--admin-text-muted);
          font-size: 0.875rem;
          padding: 1rem;
        }
        .resize-handle {
          width: 4px;
          background: var(--admin-border);
          transition: background 0.15s ease;
        }
        .resize-handle:hover {
          background: var(--admin-accent);
        }
        .resize-handle[data-resize-handle-active] {
          background: var(--admin-accent);
        }
      `}</style>
    </PanelGroup>
  );
}
