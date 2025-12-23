import { useEffect, useCallback, RefObject } from 'react';
import { useCanvasStore } from '../stores/canvas.store';

/**
 * Hook that handles keyboard shortcuts for the canvas
 * Only active when the canvas element has focus
 */
export function useCanvasKeyboard(canvasRef: RefObject<HTMLDivElement | null>) {
  const {
    selectedId,
    gridSize,
    removeElement,
    duplicateElement,
    selectElement,
    updatePosition,
    undo,
    redo,
    elements,
  } = useCanvasStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if we're in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check if canvas has focus
      if (
        !canvasRef.current?.contains(document.activeElement) &&
        document.activeElement !== canvasRef.current
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Escape - Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        selectElement(null);
        return;
      }

      // Ctrl+Z - Undo
      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // The following shortcuts require a selected element
      if (!selectedId) return;

      // Delete or Backspace - Remove element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeElement(selectedId);
        return;
      }

      // Ctrl+D - Duplicate
      if (isCtrlOrCmd && e.key === 'd') {
        e.preventDefault();
        duplicateElement(selectedId);
        return;
      }

      // Arrow keys - Move element
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const element = elements.find((el) => el.id === selectedId);
        if (!element || element.locked) return;

        const moveAmount = e.shiftKey ? gridSize : 1;
        const { x, y } = element.position;

        let newX = x;
        let newY = y;

        switch (e.key) {
          case 'ArrowUp':
            newY = y - moveAmount;
            break;
          case 'ArrowDown':
            newY = y + moveAmount;
            break;
          case 'ArrowLeft':
            newX = x - moveAmount;
            break;
          case 'ArrowRight':
            newX = x + moveAmount;
            break;
        }

        updatePosition(selectedId, { x: newX, y: newY });
      }
    },
    [
      canvasRef,
      selectedId,
      gridSize,
      elements,
      removeElement,
      duplicateElement,
      selectElement,
      updatePosition,
      undo,
      redo,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
