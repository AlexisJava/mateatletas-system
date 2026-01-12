'use client';

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import type { NodoContenido } from '../types/sandbox.types';
import { useSandboxState, useSandboxDispatch } from '../context/SandboxContext';
import { useSandboxApi } from '../hooks';
import styles from './TreePanel.module.css';

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
  const [isHovered, setIsHovered] = useState(false);
  const [editValue, setEditValue] = useState(nodo.titulo);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const confirmEdit = () => {
    if (editValue.trim() && editValue !== nodo.titulo) onRename(editValue.trim());
    setIsEditing(false);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div
        className={`${styles.node} ${isSelected ? styles.selected : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={onSelect}
        onDoubleClick={() => !nodo.bloqueado && setIsEditing(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button type="button" className={styles.chevron} onClick={handleToggle}>
          {hasChildren ? (isExpanded ? '▼' : '▶') : isLeaf ? '○' : '◇'}
        </button>
        {isEditing ? (
          <input
            ref={inputRef}
            className={styles.input}
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
          <span className={styles.label}>{nodo.titulo}</span>
        )}
        {!nodo.bloqueado && (
          <span className={`${styles.actions} ${isHovered ? styles.actionsVisible : ''}`}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              +
            </button>
            <button
              type="button"
              className={styles.actionBtn}
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
  if (!state.contenido) return <p className={styles.empty}>Sin contenido</p>;

  return (
    <div className={styles.panel}>
      {state.contenido.nodos.map((nodo) => (
        <ConnectedTreeNode key={nodo.id} nodo={nodo} depth={0} />
      ))}
    </div>
  );
}
