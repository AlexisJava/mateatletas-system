/**
 * Hook: useDragDrop
 *
 * Hook headless para manejar drag and drop de elementos.
 * Preparado para integrar con @dnd-kit/core.
 */

import { useState, useCallback } from 'react';

export interface DragDropItem {
  id: string;
  content: string;
}

export interface UseDragDropOptions {
  items: DragDropItem[];
  onReorder?: (items: DragDropItem[]) => void;
}

export interface UseDragDropReturn {
  items: DragDropItem[];
  activeId: string | null;
  isDragging: boolean;
  handleDragStart: (id: string) => void;
  handleDragEnd: () => void;
  handleDragOver: (overId: string) => void;
  reset: () => void;
}

export function useDragDrop(options: UseDragDropOptions): UseDragDropReturn {
  const [items, setItems] = useState(options.items);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleDragOver = useCallback(
    (overId: string) => {
      if (!activeId || activeId === overId) return;

      setItems((currentItems) => {
        const activeIndex = currentItems.findIndex((item) => item.id === activeId);
        const overIndex = currentItems.findIndex((item) => item.id === overId);

        if (activeIndex === -1 || overIndex === -1) return currentItems;

        const newItems = [...currentItems];
        const [removed] = newItems.splice(activeIndex, 1);
        newItems.splice(overIndex, 0, removed);

        options.onReorder?.(newItems);
        return newItems;
      });
    },
    [activeId, options],
  );

  const reset = useCallback(() => {
    setItems(options.items);
    setActiveId(null);
  }, [options.items]);

  return {
    items,
    activeId,
    isDragging: activeId !== null,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    reset,
  } as const;
}
