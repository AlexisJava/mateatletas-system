'use client';

import { Suspense } from 'react';
import { SandboxProvider, useSandboxState } from './context/SandboxContext';
import { useLoadFromUrl } from './hooks';
import { TreePanel } from './components';

/**
 * SandboxView - 3-panel IDE layout
 * TreePanel | EditorPanel | PreviewPanel
 */
export function SandboxView() {
  return (
    <SandboxProvider>
      <Suspense fallback={<SandboxLoading />}>
        <SandboxLayout />
      </Suspense>
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

  if (state.isLoading) {
    return <SandboxLoading />;
  }

  return (
    <div className="sandbox-container">
      {/* Tree Panel */}
      <aside className="sandbox-tree">
        <div className="sandbox-panel-header">
          {state.contenido ? state.contenido.titulo : 'Árbol'}
        </div>
        <div className="sandbox-panel-content">
          <TreePanel />
        </div>
      </aside>

      {/* Editor Panel */}
      <main className="sandbox-editor">
        <div className="sandbox-panel-header">Editor</div>
        <div className="sandbox-panel-content">
          {state.selectedNodoId ? (
            <p>TODO: Monaco Editor (nodo: {state.selectedNodoId.slice(0, 8)}...)</p>
          ) : (
            <p className="sandbox-empty">Selecciona un nodo</p>
          )}
        </div>
      </main>

      {/* Preview Panel */}
      <aside className="sandbox-preview">
        <div className="sandbox-panel-header">Preview</div>
        <div className="sandbox-panel-content">
          <p className="sandbox-empty">Preview del contenido</p>
        </div>
      </aside>

      <style jsx>{`
        .sandbox-container {
          display: grid;
          grid-template-columns: 240px 1fr 320px;
          height: 100%;
          background: var(--admin-bg);
          color: var(--admin-text);
        }
        .sandbox-tree,
        .sandbox-editor,
        .sandbox-preview {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--admin-border);
        }
        .sandbox-preview {
          border-right: none;
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
        }
        .sandbox-panel-content {
          flex: 1;
          padding: 0;
          overflow: auto;
          background: var(--admin-surface-1);
        }
        .sandbox-empty {
          color: var(--admin-text-muted);
          font-size: 0.875rem;
          padding: 1rem;
        }
      `}</style>

      <style jsx global>{`
        .tree-panel {
          padding: 0.5rem 0;
        }
        .tree-empty {
          color: var(--admin-text-muted);
          font-size: 0.875rem;
          padding: 1rem;
        }
        .tree-node {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--admin-text);
        }
        .tree-node:hover {
          background: var(--admin-surface-2);
        }
        .tree-node.selected {
          background: color-mix(in srgb, var(--admin-accent) 20%, transparent);
        }
        .tree-chevron {
          width: 1rem;
          font-size: 0.625rem;
          color: var(--admin-text-muted);
          cursor: pointer;
        }
        .tree-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tree-input {
          flex: 1;
          background: var(--admin-bg);
          border: 1px solid var(--admin-accent);
          color: var(--admin-text);
          padding: 0.125rem 0.25rem;
          font-size: 0.875rem;
          outline: none;
        }
        .tree-actions {
          display: none;
          gap: 0.25rem;
        }
        .tree-node:hover .tree-actions {
          display: flex;
        }
        .tree-actions button {
          background: transparent;
          border: none;
          color: var(--admin-text-muted);
          cursor: pointer;
          padding: 0 0.25rem;
          font-size: 0.875rem;
        }
        .tree-actions button:hover {
          color: var(--admin-accent);
        }
      `}</style>
    </div>
  );
}
