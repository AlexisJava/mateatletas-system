'use client';

/**
 * BentoEditor - Componente principal del editor
 *
 * Integra los tres paneles:
 * - BloquePalette (izquierda)
 * - BentoGrid (centro)
 * - PropsEditor (derecha)
 *
 * Maneja el DndContext para drag & drop entre paleta y grilla.
 */
import { useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { BloquePalette } from './BloquePalette';
import { BentoGrid } from './BentoGrid';
import { PropsEditor } from './PropsEditor';
import { useHojaStore } from '../stores/hoja.store';
import { BLOCK_SIZES } from '../types/studio.types';

/**
 * Editor visual Bento Grid
 */
export function BentoEditor() {
  const { addBloque, updateBloquePosition, bloques } = useHojaStore();

  // Configurar sensor de puntero con delay mínimo
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Mínimo 8px de movimiento para iniciar drag
      },
    }),
  );

  /**
   * Handler cuando termina un drag
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Si no se soltó sobre la grilla, ignorar
      if (!over || over.id !== 'bento-grid') return;

      const data = active.data.current;

      // Si viene de la paleta, agregar nuevo bloque
      if (data?.fromPalette && data?.type) {
        const type = data.type as string;

        // Calcular posición inicial (primer espacio libre)
        const nextRow = Math.max(
          1,
          ...bloques.map((b) => b.position.rowStart + b.position.rowSpan),
        );

        addBloque(type, {
          colStart: 1,
          colSpan: BLOCK_SIZES.wide.colSpan,
          rowStart: bloques.length === 0 ? 1 : nextRow,
          rowSpan: BLOCK_SIZES.wide.rowSpan,
        });
      }

      // Si viene del canvas (mover bloque existente)
      if (data?.fromCanvas && data?.bloqueId) {
        // Por ahora solo permite mover via panel de propiedades
        // El drag dentro del canvas es solo para reordenar visual
        // La posición real se cambia en PropsEditor
      }
    },
    [addBloque, bloques],
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <h1 className="text-xl font-bold text-gray-900">Studio</h1>
            <span className="text-sm text-gray-400">Bento Grid Editor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {bloques.length} bloque{bloques.length !== 1 ? 's' : ''}
            </span>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Panel izquierdo - Paleta */}
          <BloquePalette />

          {/* Panel central - Canvas */}
          <main className="flex-1 overflow-auto p-6">
            <BentoGrid />
          </main>

          {/* Panel derecho - Propiedades */}
          <PropsEditor />
        </div>
      </div>

      {/* Overlay para drag visual */}
      <DragOverlay>{/* El overlay muestra una preview mientras se arrastra */}</DragOverlay>
    </DndContext>
  );
}
