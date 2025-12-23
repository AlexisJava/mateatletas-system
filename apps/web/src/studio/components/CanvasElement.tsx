'use client';

import { useCallback, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import type { CanvasElement as CanvasElementType } from '../types/canvas.types';
import { useCanvasStore } from '../stores/canvas.store';
import { getBlockDefinition } from '@/components/blocks/registry';

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function CanvasElement({ element, isSelected, onSelect }: CanvasElementProps) {
  const { updatePosition, updateSize } = useCanvasStore();

  const blockDefinition = useMemo(
    () => getBlockDefinition(element.componentType),
    [element.componentType],
  );

  const handleDragStop = useCallback(
    (_e: unknown, d: { x: number; y: number }) => {
      if (element.locked) return;
      updatePosition(element.id, { x: d.x, y: d.y });
    },
    [element.id, element.locked, updatePosition],
  );

  const handleResizeStop = useCallback(
    (
      _e: unknown,
      _direction: unknown,
      ref: HTMLElement,
      _delta: unknown,
      position: { x: number; y: number },
    ) => {
      if (element.locked) return;
      updateSize(element.id, {
        width: parseInt(ref.style.width, 10),
        height: parseInt(ref.style.height, 10),
      });
      updatePosition(element.id, position);
    },
    [element.id, element.locked, updatePosition, updateSize],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(element.id);
    },
    [element.id, onSelect],
  );

  const BlockComponent = blockDefinition?.component;

  return (
    <Rnd
      position={{ x: element.position.x, y: element.position.y }}
      size={{ width: element.size.width, height: element.size.height }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={element.locked}
      enableResizing={!element.locked && isSelected}
      style={{
        zIndex: element.zIndex,
        cursor: element.locked ? 'not-allowed' : isSelected ? 'grab' : 'pointer',
      }}
      bounds="parent"
      resizeHandleStyles={{
        top: { cursor: 'n-resize' },
        right: { cursor: 'e-resize' },
        bottom: { cursor: 's-resize' },
        left: { cursor: 'w-resize' },
        topRight: { cursor: 'ne-resize' },
        bottomRight: { cursor: 'se-resize' },
        bottomLeft: { cursor: 'sw-resize' },
        topLeft: { cursor: 'nw-resize' },
      }}
    >
      <div
        onClick={handleClick}
        data-testid={`canvas-element-${element.id}`}
        className={`
          relative w-full h-full rounded-lg overflow-hidden
          ${isSelected ? 'ring-2 ring-cyan-500 ring-offset-2' : 'ring-1 ring-gray-300'}
          ${element.locked ? 'opacity-75' : ''}
          bg-white shadow-sm
          transition-shadow duration-150
          hover:shadow-md
        `}
      >
        {/* Selection handles overlay */}
        {isSelected && !element.locked && (
          <>
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-cyan-500 rounded-full" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-cyan-500 rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full" />
          </>
        )}

        {/* Lock indicator */}
        {element.locked && (
          <div className="absolute top-2 right-2 text-gray-500 z-10">
            <span role="img" aria-label="Locked">
              🔒
            </span>
          </div>
        )}

        {/* Block content */}
        <div className="w-full h-full p-2 overflow-auto">
          {BlockComponent ? (
            <BlockComponent
              id={element.id}
              config={element.props}
              modo="editor"
              disabled={element.locked}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-2xl mb-2">{blockDefinition?.icon ?? '❓'}</div>
                <div className="text-sm">{element.componentType}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Rnd>
  );
}
