'use client';

/**
 * BentoGrid - Canvas de grilla 12 columnas
 *
 * Renderiza los bloques posicionados en una grilla CSS Grid.
 * Acepta drops desde la paleta de bloques.
 */
import { useDroppable } from '@dnd-kit/core';
import { useHojaStore } from '../stores/hoja.store';
import { BloqueCard } from './BloqueCard';
import { BENTO_CONFIG } from '../types/studio.types';

/**
 * Grilla Bento de 12 columnas
 */
export function BentoGrid() {
  const { bloques, selectedId, selectBloque, deselectBloque } = useHojaStore();

  const { setNodeRef, isOver } = useDroppable({
    id: 'bento-grid',
  });

  const handleGridClick = (e: React.MouseEvent) => {
    // Solo deseleccionar si se hace click en el fondo
    if (e.target === e.currentTarget) {
      deselectBloque();
    }
  };

  return (
    <div
      ref={setNodeRef}
      data-testid="bento-grid"
      onClick={handleGridClick}
      className={`
        relative w-full h-full min-h-[600px]
        grid grid-cols-12 auto-rows-[${BENTO_CONFIG.ROW_HEIGHT}px]
        gap-4 p-6 bg-gray-100 rounded-lg
        transition-colors duration-200
        ${isOver ? 'bg-cyan-50 ring-2 ring-cyan-400 ring-inset' : ''}
      `}
      style={{
        gridAutoRows: `${BENTO_CONFIG.ROW_HEIGHT}px`,
        gap: `${BENTO_CONFIG.GAP}px`,
      }}
    >
      {/* Grid lines overlay (visible cuando se arrastra) */}
      {isOver && (
        <div
          className="absolute inset-6 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `calc((100% - ${BENTO_CONFIG.GAP}px * 11) / 12 + ${BENTO_CONFIG.GAP}px) ${BENTO_CONFIG.ROW_HEIGHT + BENTO_CONFIG.GAP}px`,
          }}
        />
      )}

      {/* Bloques renderizados */}
      {bloques.map((bloque) => (
        <BloqueCard
          key={bloque.id}
          bloque={bloque}
          isSelected={selectedId === bloque.id}
          onSelect={() => selectBloque(bloque.id)}
        />
      ))}

      {/* Estado vacío */}
      {bloques.length === 0 && (
        <div className="col-span-12 row-span-4 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium">Canvas vacío</p>
            <p className="text-sm">Arrastrá componentes desde el panel lateral</p>
          </div>
        </div>
      )}
    </div>
  );
}
