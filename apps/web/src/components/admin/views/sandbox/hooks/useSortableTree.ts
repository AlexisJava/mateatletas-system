/**
 * useSortableTree - Hook for drag & drop tree functionality
 *
 * Uses @dnd-kit for drag & drop with tree structure support.
 * Handles both reordering (same parent) and moving (different parent).
 */

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSandboxState } from '../context/SandboxContext';
import { useSandboxApi } from './useSandboxApi';
import { findParentId, flattenTree, type FlattenedNodo } from '../utils/tree.utils';

export interface UseSortableTreeResult {
  /** DndContext component wrapper */
  DndContext: typeof DndContext;
  /** SortableContext component wrapper */
  SortableContext: typeof SortableContext;
  /** DragOverlay component wrapper */
  DragOverlay: typeof DragOverlay;
  /** Configured sensors for drag detection */
  sensors: ReturnType<typeof useSensors>;
  /** Collision detection strategy */
  collisionDetection: typeof closestCenter;
  /** Sorting strategy */
  sortingStrategy: typeof verticalListSortingStrategy;
  /** Flattened tree for rendering */
  flattenedTree: FlattenedNodo[];
  /** IDs for SortableContext */
  sortableIds: string[];
  /** Currently dragging node ID */
  activeId: string | null;
  /** Node being dragged */
  activeNode: FlattenedNodo | null;
  /** Handle drag start */
  handleDragStart: (event: DragStartEvent) => void;
  /** Handle drag over (for visual feedback) */
  handleDragOver: (event: DragOverEvent) => void;
  /** Handle drag end */
  handleDragEnd: (event: DragEndEvent) => void;
  /** Handle drag cancel */
  handleDragCancel: () => void;
  /** Whether a drag is in progress */
  isDragging: boolean;
}

export function useSortableTree(): UseSortableTreeResult {
  const state = useSandboxState();
  const { reorderNodos, moveNodo } = useSandboxApi();

  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Flatten tree for drag & drop
  const flattenedTree = useMemo(() => {
    if (!state.contenido) return [];
    return flattenTree(state.contenido.nodos);
  }, [state.contenido]);

  // Get sortable IDs (exclude bloqueado nodes)
  const sortableIds = useMemo(() => {
    return flattenedTree.filter((item) => !item.nodo.bloqueado).map((item) => item.id);
  }, [flattenedTree]);

  // Get active node being dragged
  const activeNode = useMemo(() => {
    if (!activeId) return null;
    return flattenedTree.find((item) => item.id === activeId) ?? null;
  }, [activeId, flattenedTree]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Can add visual feedback logic here if needed
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || !state.contenido || active.id === over.id) {
        return;
      }

      const activeItem = flattenedTree.find((item) => item.id === active.id);
      const overItem = flattenedTree.find((item) => item.id === over.id);

      if (!activeItem || !overItem) return;

      // Don't allow dragging bloqueado nodes
      if (activeItem.nodo.bloqueado) return;

      const activeParentId = activeItem.parentId;
      const overParentId = overItem.parentId;

      // Same parent = reorder
      if (activeParentId === overParentId) {
        // Get siblings at this level
        const siblings = flattenedTree.filter((item) => item.parentId === activeParentId);
        const oldIndex = siblings.findIndex((item) => item.id === active.id);
        const newIndex = siblings.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        // Calculate new order
        const newOrder = siblings.map((item, index) => {
          if (index === oldIndex) {
            return { nodoId: item.id, orden: newIndex };
          }
          if (oldIndex < newIndex) {
            // Moving down
            if (index > oldIndex && index <= newIndex) {
              return { nodoId: item.id, orden: index - 1 };
            }
          } else {
            // Moving up
            if (index >= newIndex && index < oldIndex) {
              return { nodoId: item.id, orden: index + 1 };
            }
          }
          return { nodoId: item.id, orden: index };
        });

        void reorderNodos(state.contenido.id, activeParentId, newOrder);
      } else {
        // Different parent = move
        void moveNodo(active.id as string, overParentId);
      }
    },
    [flattenedTree, state.contenido, reorderNodos, moveNodo],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return {
    DndContext,
    SortableContext,
    DragOverlay,
    sensors,
    collisionDetection: closestCenter,
    sortingStrategy: verticalListSortingStrategy,
    flattenedTree,
    sortableIds,
    activeId,
    activeNode,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    isDragging: activeId !== null,
  };
}

// Re-export for convenience
export { DndContext, SortableContext, DragOverlay };
export { useSortable } from '@dnd-kit/sortable';
export { CSS } from '@dnd-kit/utilities';
