'use client';

import { memo, useState, useCallback, type ReactElement } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  FolderOpen,
  Folder,
  BookOpen,
  Plus,
  GripVertical,
} from 'lucide-react';
import { useSandboxState, useSandboxDispatch } from '../context/SandboxContext';
import { useSandboxApi, useSortableTree, useSortable, CSS } from '../hooks';
import type { NodoContenido } from '../types/sandbox.types';
import type { SidebarIntentCategory, SidebarIntent } from '../utils/intent.types';
import styles from './SandboxSidebar.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// INTENT CATEGORIES (Sidebar version - uses emojis for compact display)
// Note: IntentLibrary has a richer version with icons/colors for the full modal
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_CATEGORIES = [
  {
    id: 'presentation',
    emoji: '🎯',
    name: 'Presentación',
    intents: [
      { id: 'hero', name: 'Hero', defaultJson: { intent: 'hero', title: '', subtitle: '' } },
      { id: 'concept-intro', name: 'Concept Intro', defaultJson: { intent: 'concept-intro' } },
      { id: 'key-point', name: 'Key Point', defaultJson: { intent: 'key-point' } },
      { id: 'summary', name: 'Summary', defaultJson: { intent: 'summary' } },
    ],
  },
  {
    id: 'interaction',
    emoji: '🎮',
    name: 'Interacción',
    intents: [
      { id: 'quiz', name: 'Quiz', defaultJson: { intent: 'quiz', question: '', options: [] } },
      { id: 'match', name: 'Match', defaultJson: { intent: 'match' } },
      { id: 'sort', name: 'Sort', defaultJson: { intent: 'sort' } },
      { id: 'drag-drop', name: 'Drag & Drop', defaultJson: { intent: 'drag-drop' } },
      { id: 'fill-blank', name: 'Fill Blank', defaultJson: { intent: 'fill-blank' } },
      { id: 'code-challenge', name: 'Code Challenge', defaultJson: { intent: 'code-challenge' } },
    ],
  },
  {
    id: 'narrative',
    emoji: '📖',
    name: 'Narrativa',
    intents: [
      { id: 'mascot', name: 'Mascot Dialog', defaultJson: { intent: 'mascot' } },
      { id: 'conversation', name: 'Conversation', defaultJson: { intent: 'conversation' } },
      { id: 'story', name: 'Story', defaultJson: { intent: 'story' } },
    ],
  },
  {
    id: 'gamification',
    emoji: '🏆',
    name: 'Gamificación',
    intents: [
      { id: 'achievement', name: 'Achievement', defaultJson: { intent: 'achievement' } },
      { id: 'progress', name: 'Progress', defaultJson: { intent: 'progress' } },
      { id: 'level-up', name: 'Level Up', defaultJson: { intent: 'level-up' } },
      { id: 'reward', name: 'Reward', defaultJson: { intent: 'reward' } },
    ],
  },
  {
    id: 'layout',
    emoji: '📐',
    name: 'Layout',
    intents: [
      { id: 'split', name: 'Split View', defaultJson: { intent: 'split' } },
      { id: 'bento', name: 'Bento Grid', defaultJson: { intent: 'bento' } },
      { id: 'carousel', name: 'Carousel', defaultJson: { intent: 'carousel' } },
      { id: 'tabs', name: 'Tabs', defaultJson: { intent: 'tabs' } },
    ],
  },
  {
    id: 'closure',
    emoji: '✅',
    name: 'Cierre',
    intents: [
      { id: 'recap', name: 'Recap', defaultJson: { intent: 'recap' } },
      { id: 'next-steps', name: 'Next Steps', defaultJson: { intent: 'next-steps' } },
      { id: 'celebration', name: 'Celebration', defaultJson: { intent: 'celebration' } },
    ],
  },
] as const satisfies readonly SidebarIntentCategory[];

// Use imported types for component props
type IntentCategoryType = SidebarIntentCategory;
type IntentType = SidebarIntent;

// ─────────────────────────────────────────────────────────────────────────────
// INTENT ITEM
// ─────────────────────────────────────────────────────────────────────────────

interface IntentItemProps {
  intent: IntentType;
  isActive: boolean;
  onSelect: () => void;
}

const IntentItem = memo(function IntentItem({ intent, isActive, onSelect }: IntentItemProps) {
  return (
    <button
      type="button"
      className={`${styles.intentItem} ${isActive ? styles.active : ''}`}
      onClick={onSelect}
    >
      <span className={styles.intentName}>{intent.name}</span>
    </button>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// INTENT CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

interface IntentCategoryProps {
  category: IntentCategoryType;
  isExpanded: boolean;
  activeIntentId: string | null;
  onToggle: () => void;
  onSelectIntent: (intent: IntentType) => void;
}

const IntentCategory = memo(function IntentCategory({
  category,
  isExpanded,
  activeIntentId,
  onToggle,
  onSelectIntent,
}: IntentCategoryProps) {
  return (
    <div className={styles.category}>
      <button type="button" className={styles.categoryHeader} onClick={onToggle}>
        <span className={styles.categoryEmoji}>{category.emoji}</span>
        <span className={styles.categoryName}>{category.name}</span>
        <span className={styles.categoryCount}>{category.intents.length}</span>
        <span className={styles.categoryChevron}>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      {isExpanded && (
        <div className={styles.intentsList}>
          {category.intents.map((intent) => (
            <IntentItem
              key={intent.id}
              intent={intent}
              isActive={activeIntentId === intent.id}
              onSelect={() => onSelectIntent(intent)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// TREE NODE (for Structure section) - Now with drag & drop support
// ─────────────────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  nodo: NodoContenido;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isDragging?: boolean;
}

const TreeNode = memo(function TreeNode({
  nodo,
  depth,
  selectedId,
  onSelect,
  isDragging = false,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = nodo.hijos.length > 0;
  const isSelected = selectedId === nodo.id;
  const canDrag = !nodo.bloqueado;

  // Sortable hook for drag & drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: nodo.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) setIsExpanded(!isExpanded);
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.treeNodeContainer}>
      <button
        type="button"
        className={`${styles.treeNode} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(nodo.id)}
      >
        {/* Drag handle */}
        {canDrag && (
          <span
            className={styles.dragHandle}
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={12} />
          </span>
        )}
        <span className={styles.treeNodeIcon} onClick={handleIconClick}>
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen size={14} />
            ) : (
              <Folder size={14} />
            )
          ) : (
            <FileText size={14} />
          )}
        </span>
        <span className={styles.treeNodeLabel}>{nodo.titulo}</span>
      </button>
      {hasChildren && isExpanded && (
        <div className={styles.treeNodeChildren}>
          {nodo.hijos.map((child) => (
            <TreeNode
              key={child.id}
              nodo={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function SandboxSidebar(): ReactElement {
  const state = useSandboxState();
  const dispatch = useSandboxDispatch();
  const { addNodo } = useSandboxApi();

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['presentation']);
  const [activeIntentId, setActiveIntentId] = useState<string | null>(null);

  // Drag & drop for tree structure
  const {
    DndContext,
    SortableContext,
    DragOverlay,
    sensors,
    collisionDetection,
    sortingStrategy,
    sortableIds,
    activeNode,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useSortableTree();

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  }, []);

  const handleSelectIntent = useCallback(
    (intent: IntentType) => {
      setActiveIntentId(intent.id);
      if (state.contenido && state.selectedItemId) {
        dispatch({
          type: 'UPDATE_NODO_JSON',
          payload: {
            nodoId: state.selectedItemId,
            json: JSON.stringify(intent.defaultJson, null, 2),
          },
        });
      }
    },
    [dispatch, state.contenido, state.selectedItemId],
  );

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      dispatch({ type: 'SELECT_ITEM', payload: nodeId });
    },
    [dispatch],
  );

  const handleAddRootNode = useCallback(async () => {
    if (!state.contenido) return;
    const newNodo = await addNodo(state.contenido.id, { titulo: 'Nuevo nodo' });
    if (newNodo) {
      dispatch({ type: 'SELECT_ITEM', payload: newNodo.id });
    }
  }, [addNodo, dispatch, state.contenido]);

  return (
    <div className={styles.sidebar}>
      {/* Intents Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Intents</span>
          <button type="button" className={styles.searchBtn} aria-label="Buscar">
            <Search size={14} />
          </button>
        </div>

        <div className={styles.categoriesContainer}>
          {INTENT_CATEGORIES.map((category) => (
            <IntentCategory
              key={category.id}
              category={category}
              isExpanded={expandedCategories.includes(category.id)}
              activeIntentId={activeIntentId}
              onToggle={() => toggleCategory(category.id)}
              onSelectIntent={handleSelectIntent}
            />
          ))}
        </div>
      </div>

      {/* Structure Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Structure</span>
          {state.contenido && (
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAddRootNode}
              aria-label="Agregar nodo"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        <div className={styles.treeContainer}>
          {state.contentType === 'planificacion' ? (
            state.planificacion?.clases.map((clase) => (
              <button
                key={clase.id}
                type="button"
                className={`${styles.treeNode} ${state.selectedItemId === clase.id ? styles.selected : ''}`}
                onClick={() => handleSelectNode(clase.id)}
              >
                <span className={styles.treeNodeIcon}>
                  <BookOpen size={14} />
                </span>
                <span className={styles.treeNodeLabel}>
                  Clase {clase.numero}: {clase.titulo}
                </span>
              </button>
            ))
          ) : state.contenido?.nodos.length ? (
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext items={sortableIds} strategy={sortingStrategy}>
                {state.contenido.nodos.map((nodo) => (
                  <TreeNode
                    key={nodo.id}
                    nodo={nodo}
                    depth={0}
                    selectedId={state.selectedItemId}
                    onSelect={handleSelectNode}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeNode ? (
                  <div className={styles.dragOverlay}>
                    <FileText size={14} />
                    <span>{activeNode.nodo.titulo}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className={styles.emptyState}>
              <p>Sin nodos</p>
              <button type="button" className={styles.addNodeBtn} onClick={handleAddRootNode}>
                <Plus size={14} />
                <span>Agregar nodo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
