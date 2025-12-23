'use client';

import { useCallback, useRef } from 'react';
import { useCanvasStore } from '../stores/canvas.store';
import { CanvasElement } from './CanvasElement';
import { useCanvasKeyboard } from '../hooks/useCanvasKeyboard';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export function StudioCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { elements, selectedId, selectElement, zoom, snapToGrid, gridSize } = useCanvasStore();

  // Enable keyboard shortcuts when canvas has focus
  useCanvasKeyboard(canvasRef);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // Only deselect if clicking directly on the canvas background
      if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasBackground) {
        selectElement(null);
      }
    },
    [selectElement],
  );

  const handleElementSelect = useCallback(
    (id: string) => {
      selectElement(id);
    },
    [selectElement],
  );

  // Sort elements by zIndex for proper layering
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className="w-full h-full overflow-auto bg-gray-100 p-8"
      data-testid="studio-canvas-wrapper"
    >
      <div
        ref={canvasRef}
        tabIndex={0}
        onClick={handleCanvasClick}
        data-testid="studio-canvas"
        className="relative mx-auto outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-4"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Canvas background with grid */}
        <div
          data-canvas-background="true"
          className="absolute inset-0 bg-white rounded-lg shadow-lg border border-gray-200"
          style={{
            backgroundImage: snapToGrid
              ? `
                linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
              `
              : 'none',
            backgroundSize: snapToGrid ? `${gridSize}px ${gridSize}px` : 'auto',
          }}
        />

        {/* Canvas elements */}
        {sortedElements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedId === element.id}
            onSelect={handleElementSelect}
          />
        ))}

        {/* Empty state */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">🎨</div>
              <div className="text-lg font-medium">Canvas vacío</div>
              <div className="text-sm">Arrastra componentes desde el panel lateral</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
