'use client';

/**
 * BloqueCard - Wrapper para cada bloque en la grilla
 *
 * Muestra una preview del bloque, permite selección y resize.
 * Posicionado usando CSS Grid.
 */
import { useDraggable } from '@dnd-kit/core';
import type { BloqueHoja } from '../types/studio.types';
import { getBlockDefinition } from '@/components/blocks/registry';

interface BloqueCardProps {
  bloque: BloqueHoja;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Card individual para un bloque en la grilla
 */
export function BloqueCard({ bloque, isSelected, onSelect }: BloqueCardProps) {
  const blockDef = getBlockDefinition(bloque.componentType);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-${bloque.id}`,
    data: {
      type: bloque.componentType,
      bloqueId: bloque.id,
      fromCanvas: true,
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const BlockComponent = blockDef?.component;

  return (
    <div
      ref={setNodeRef}
      data-testid={`bento-block-${bloque.id}`}
      onClick={handleClick}
      style={{
        gridColumn: `${bloque.position.colStart} / span ${bloque.position.colSpan}`,
        gridRow: `${bloque.position.rowStart} / span ${bloque.position.rowSpan}`,
      }}
      className={`
        relative rounded-lg overflow-hidden cursor-pointer
        bg-white border-2 shadow-sm
        transition-all duration-150
        ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-200 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
        ${isDragging ? 'opacity-50 z-50' : 'z-10'}
      `}
      {...listeners}
      {...attributes}
    >
      {/* Header con tipo de bloque */}
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5 border-b
          ${isSelected ? 'bg-cyan-50 border-cyan-200' : 'bg-gray-50 border-gray-100'}
        `}
      >
        <span className="text-lg">{blockDef?.icon ?? '❓'}</span>
        <span className="text-xs font-medium text-gray-600 truncate">
          {blockDef?.displayName ?? bloque.componentType}
        </span>
      </div>

      {/* Contenido del bloque - Muestra icono + nombre en modo editor */}
      <div className="p-2 h-[calc(100%-36px)] overflow-auto flex items-center justify-center">
        <div className="text-center text-gray-400">
          <span className="text-4xl block mb-2">{blockDef?.icon ?? '❓'}</span>
          <span className="text-xs">{blockDef?.displayName ?? bloque.componentType}</span>
        </div>
      </div>

      {/* Indicadores de selección */}
      {isSelected && (
        <>
          {/* Handles de resize (visual, funcionalidad pendiente) */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white" />
        </>
      )}
    </div>
  );
}
