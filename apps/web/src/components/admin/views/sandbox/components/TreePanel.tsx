'use client';

import { memo, useCallback } from 'react';
import type { NodoContenido } from '../types/sandbox.types';
import { useSandboxState, useSandboxDispatch } from '../context/SandboxContext';
import { useSandboxApi } from '../hooks';

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTED TREE NODE (recursive)
// ─────────────────────────────────────────────────────────────────────────────

interface ConnectedNodeProps {
  nodo: NodoContenido;
  depth: number;
}

const ConnectedTreeNode = memo(function ConnectedTreeNode({ nodo, depth }: ConnectedNodeProps) {
  const state = useSandboxState();
  const dispatch = useSandboxDispatch();
  const { addNodo, removeNodo, renameNodo } = useSandboxApi();

  const isSelected = state.selectedNodoId === nodo.id;
  const hasChildren = nodo.hijos.length > 0;
  const isLeaf = !hasChildren && nodo.contenidoJson !== null;

  const handleSelect = useCallback(() => {
    dispatch({ type: 'SELECT_NODO', payload: nodo.id });
  }, [dispatch, nodo.id]);

  const handleAdd = useCallback(async () => {
    if (!state.contenido) return;
    const newNodo = await addNodo(state.contenido.id, {
      titulo: 'Nuevo nodo',
      parentId: nodo.id,
    });
    if (newNodo) {
      dispatch({ type: 'SELECT_NODO', payload: newNodo.id });
    }
  }, [addNodo, dispatch, nodo.id, state.contenido]);

  const handleDelete = useCallback(() => {
    if (nodo.bloqueado) return;
    removeNodo(nodo.id);
  }, [nodo.bloqueado, nodo.id, removeNodo]);

  const handleRename = useCallback(
    (titulo: string) => {
      renameNodo(nodo.id, titulo);
    },
    [nodo.id, renameNodo],
  );

  return (
    <TreeNodeView
      nodo={nodo}
      depth={depth}
      isSelected={isSelected}
      hasChildren={hasChildren}
      isLeaf={isLeaf}
      onSelect={handleSelect}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onRename={handleRename}
    />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// TREE NODE VIEW (presentational)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';

interface TreeNodeViewProps {
  nodo: NodoContenido;
  depth: number;
  isSelected: boolean;
  hasChildren: boolean;
  isLeaf: boolean;
  onSelect: () => void;
  onAdd: () => void;
  onDelete: () => void;
  onRename: (titulo: string) => void;
}

const TreeNodeView = memo(function TreeNodeView({
  nodo,
  depth,
  isSelected,
  hasChildren,
  isLeaf,
  onSelect,
  onAdd,
  onDelete,
  onRename,
}: TreeNodeViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(nodo.titulo);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const confirmEdit = () => {
    if (editValue.trim() && editValue !== nodo.titulo) onRename(editValue.trim());
    setIsEditing(false);
  };

  return (
    <div className="tree-node-wrapper">
      <div
        className={`tree-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={onSelect}
        onDoubleClick={() => !nodo.bloqueado && setIsEditing(true)}
      >
        <span
          className="tree-chevron"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {hasChildren ? (isExpanded ? '▼' : '▶') : isLeaf ? '○' : '◇'}
        </span>
        {isEditing ? (
          <input
            ref={inputRef}
            className="tree-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmEdit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onBlur={confirmEdit}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="tree-label">{nodo.titulo}</span>
        )}
        {!nodo.bloqueado && (
          <span className="tree-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              +
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              ×
            </button>
          </span>
        )}
      </div>
      {hasChildren &&
        isExpanded &&
        nodo.hijos.map((h) => <ConnectedTreeNode key={h.id} nodo={h} depth={depth + 1} />)}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// TREE PANEL
// ─────────────────────────────────────────────────────────────────────────────

export function TreePanel() {
  const state = useSandboxState();
  if (!state.contenido) return <p className="tree-empty">Sin contenido</p>;

  return (
    <div className="tree-panel">
      {state.contenido.nodos.map((nodo) => (
        <ConnectedTreeNode key={nodo.id} nodo={nodo} depth={0} />
      ))}
    </div>
  );
}
