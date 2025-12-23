'use client';

import { useCallback, useRef } from 'react';
import { Toolbar } from './Toolbar';
import { StudioCanvas } from './StudioCanvas';
import { ComponentPanel } from './panels/ComponentPanel';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { useCanvasStore } from '../stores/canvas.store';

const CANVAS_PADDING = 32;

export function StudioEditor() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const { addElement, zoom } = useCanvasStore();

  /**
   * Handle drop from ComponentPanel
   * Calculates correct position considering scroll, zoom, and canvas offset
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const blockType = e.dataTransfer.getData('application/x-studio-block');
      if (!blockType) return;

      const wrapper = canvasWrapperRef.current;
      if (!wrapper) return;

      // Get the canvas element (first child after wrapper)
      const canvasEl = wrapper.querySelector('[data-testid="studio-canvas"]');
      if (!canvasEl) return;

      const canvasRect = canvasEl.getBoundingClientRect();

      // Calculate position relative to canvas, accounting for zoom
      const x = (e.clientX - canvasRect.left) / zoom;
      const y = (e.clientY - canvasRect.top) / zoom;

      // Center the element on the drop point
      const position = {
        x: Math.max(0, x - 100), // 100 = half default width
        y: Math.max(0, y - 75), // 75 = half default height
      };

      addElement(blockType, position);
    },
    [addElement, zoom],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  return (
    <div
      className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden"
      data-testid="studio-editor"
    >
      {/* Toolbar - Full Width */}
      <Toolbar />

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Components */}
        <ComponentPanel />

        {/* Center - Canvas */}
        <div
          ref={canvasWrapperRef}
          className="flex-1 overflow-hidden"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ padding: CANVAS_PADDING }}
        >
          <StudioCanvas />
        </div>

        {/* Right Panel - Properties */}
        <PropertiesPanel />
      </div>
    </div>
  );
}
