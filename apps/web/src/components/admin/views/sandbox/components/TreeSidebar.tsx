'use client';

import React, { useState, useCallback } from 'react';
import type { NodoContenido } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

const TreeIcons = {
  ChevronRight: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Book: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Zap: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  CheckCircle: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  File: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Folder: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  FolderOpen: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1" />
      <path d="M2 10l3 10h17l-4-10H2z" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface TreeSidebarProps {
  nodos: NodoContenido[];
  activeNodoId: string | null;
  onSelectNodo: (nodo: NodoContenido) => void;
  onAddNodo: (parentId: string) => void;
  onDeleteNodo: (nodoId: string) => void;
  onRenameNodo: (nodoId: string, nuevoTitulo: string) => void;
}

interface TreeNodeProps {
  nodo: NodoContenido;
  level: number;
  activeNodoId: string | null;
  expandedNodes: Set<string>;
  editingNodeId: string | null;
  tempTitle: string;
  onSelectNodo: (nodo: NodoContenido) => void;
  onToggleExpand: (nodoId: string) => void;
  onAddNodo: (parentId: string) => void;
  onDeleteNodo: (nodoId: string) => void;
  onStartEditing: (nodoId: string, titulo: string) => void;
  onSaveTitle: () => void;
  onTitleChange: (value: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Obtener icono según tipo de nodo raíz
// ─────────────────────────────────────────────────────────────────────────────

function getRootIcon(titulo: string): React.ReactNode {
  const normalized = titulo.toLowerCase();
  if (normalized.includes('teoría') || normalized.includes('teoria')) {
    return <TreeIcons.Book />;
  }
  if (normalized.includes('práctica') || normalized.includes('practica')) {
    return <TreeIcons.Zap />;
  }
  if (normalized.includes('evaluación') || normalized.includes('evaluacion')) {
    return <TreeIcons.CheckCircle />;
  }
  return <TreeIcons.Folder />;
}

// ─────────────────────────────────────────────────────────────────────────────
// TREE NODE COMPONENT (Recursivo)
// ─────────────────────────────────────────────────────────────────────────────

function TreeNode({
  nodo,
  level,
  activeNodoId,
  expandedNodes,
  editingNodeId,
  tempTitle,
  onSelectNodo,
  onToggleExpand,
  onAddNodo,
  onDeleteNodo,
  onStartEditing,
  onSaveTitle,
  onTitleChange,
}: TreeNodeProps) {
  const isActive = activeNodoId === nodo.id;
  const isExpanded = expandedNodes.has(nodo.id);
  const hasChildren = nodo.hijos.length > 0;
  const isEditing = editingNodeId === nodo.id;
  const isRoot = nodo.parentId === null;
  const isLeaf = nodo.hijos.length === 0;

  // Colores según el tipo de nodo raíz
  const getNodeColor = () => {
    if (!isRoot) return { text: '#94a3b8', bg: '#1e1b4b', accent: '#a855f7' };
    const normalized = nodo.titulo.toLowerCase();
    if (normalized.includes('teoría') || normalized.includes('teoria')) {
      return { text: '#3bf6ff', bg: '#0d3b4b', accent: '#3bf6ff' };
    }
    if (normalized.includes('práctica') || normalized.includes('practica')) {
      return { text: '#fbbf24', bg: '#4b3b0d', accent: '#fbbf24' };
    }
    if (normalized.includes('evaluación') || normalized.includes('evaluacion')) {
      return { text: '#4ade80', bg: '#0d4b2b', accent: '#4ade80' };
    }
    return { text: '#a855f7', bg: '#1e1b4b', accent: '#a855f7' };
  };

  const colors = getNodeColor();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLeaf) {
      onSelectNodo(nodo);
    } else {
      onToggleExpand(nodo.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nodo.bloqueado) {
      onStartEditing(nodo.id, nodo.titulo);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSaveTitle();
    } else if (e.key === 'Escape') {
      onSaveTitle();
    }
  };

  return (
    <div className="select-none">
      {/* Node Row */}
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={`
          group flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200
          ${isActive ? 'bg-[#a855f7]/20 ring-1 ring-[#a855f7]/30' : 'hover:bg-[#131b2e]/60'}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/Collapse Toggle */}
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(nodo.id);
              }}
              className="text-[#64748b] hover:text-white transition-colors"
            >
              {isExpanded ? <TreeIcons.ChevronDown /> : <TreeIcons.ChevronRight />}
            </button>
          ) : (
            <span className="w-1 h-1 rounded-full bg-[#475569]" />
          )}
        </div>

        {/* Node Icon */}
        <div
          className="w-5 h-5 flex items-center justify-center shrink-0 transition-colors"
          style={{ color: isActive ? colors.accent : colors.text }}
        >
          {isRoot ? (
            getRootIcon(nodo.titulo)
          ) : hasChildren ? (
            isExpanded ? (
              <TreeIcons.FolderOpen />
            ) : (
              <TreeIcons.Folder />
            )
          ) : (
            <TreeIcons.File />
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0 flex items-center gap-1">
          {isEditing ? (
            <input
              autoFocus
              value={tempTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={onSaveTitle}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-[#0f0720] border border-[#a855f7]/50 rounded px-2 py-0.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#a855f7]"
            />
          ) : (
            <span
              className={`text-xs font-medium truncate transition-colors ${
                isActive ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'
              }`}
            >
              {nodo.titulo}
            </span>
          )}

          {/* Lock indicator for blocked nodes */}
          {nodo.bloqueado && (
            <span className="text-[#475569]" title="Nodo estructural (no eliminable)">
              <TreeIcons.Lock />
            </span>
          )}
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Add child button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddNodo(nodo.id);
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#a855f7]/20 text-[#64748b] hover:text-[#a855f7] transition-all"
            title="Agregar subnodo"
          >
            <TreeIcons.Plus />
          </button>

          {/* Delete button (only for non-blocked nodes) */}
          {!nodo.bloqueado && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNodo(nodo.id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-[#64748b] hover:text-red-400 transition-all"
              title="Eliminar nodo"
            >
              <TreeIcons.Trash />
            </button>
          )}
        </div>
      </div>

      {/* Children (recursive) */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical connection line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-[#1e1b4b]"
            style={{ marginLeft: `${level * 16 + 16}px` }}
          />
          {nodo.hijos
            .sort((a, b) => a.orden - b.orden)
            .map((hijo) => (
              <TreeNode
                key={hijo.id}
                nodo={hijo}
                level={level + 1}
                activeNodoId={activeNodoId}
                expandedNodes={expandedNodes}
                editingNodeId={editingNodeId}
                tempTitle={tempTitle}
                onSelectNodo={onSelectNodo}
                onToggleExpand={onToggleExpand}
                onAddNodo={onAddNodo}
                onDeleteNodo={onDeleteNodo}
                onStartEditing={onStartEditing}
                onSaveTitle={onSaveTitle}
                onTitleChange={onTitleChange}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TREE SIDEBAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TreeSidebar({
  nodos,
  activeNodoId,
  onSelectNodo,
  onAddNodo,
  onDeleteNodo,
  onRenameNodo,
}: TreeSidebarProps) {
  // Track expanded nodes - roots expanded by default
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const rootIds = nodos.filter((n) => n.parentId === null).map((n) => n.id);
    return new Set(rootIds);
  });

  // Editing state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const handleToggleExpand = useCallback((nodoId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodoId)) {
        next.delete(nodoId);
      } else {
        next.add(nodoId);
      }
      return next;
    });
  }, []);

  const handleStartEditing = useCallback((nodoId: string, titulo: string) => {
    setEditingNodeId(nodoId);
    setTempTitle(titulo);
  }, []);

  const handleSaveTitle = useCallback(() => {
    if (editingNodeId && tempTitle.trim()) {
      onRenameNodo(editingNodeId, tempTitle.trim());
    }
    setEditingNodeId(null);
    setTempTitle('');
  }, [editingNodeId, tempTitle, onRenameNodo]);

  const handleTitleChange = useCallback((value: string) => {
    setTempTitle(value);
  }, []);

  // Sort root nodes by order
  const sortedNodos = [...nodos].sort((a, b) => a.orden - b.orden);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
          <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
            Contenido
          </h3>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
        {sortedNodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#131b2e] flex items-center justify-center mb-3 text-[#475569]">
              <TreeIcons.Folder />
            </div>
            <p className="text-xs text-[#64748b]">Sin contenido</p>
            <p className="text-[10px] text-[#475569] mt-1">Los nodos aparecerán aquí</p>
          </div>
        ) : (
          sortedNodos.map((nodo) => (
            <TreeNode
              key={nodo.id}
              nodo={nodo}
              level={0}
              activeNodoId={activeNodoId}
              expandedNodes={expandedNodes}
              editingNodeId={editingNodeId}
              tempTitle={tempTitle}
              onSelectNodo={onSelectNodo}
              onToggleExpand={handleToggleExpand}
              onAddNodo={onAddNodo}
              onDeleteNodo={onDeleteNodo}
              onStartEditing={handleStartEditing}
              onSaveTitle={handleSaveTitle}
              onTitleChange={handleTitleChange}
            />
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.03)]">
        <p className="text-[9px] text-[#475569] text-center">Doble clic para renombrar</p>
      </div>
    </div>
  );
}

export default TreeSidebar;
