'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { BloqueJson } from '../blocks/types';
import { BloqueRenderer } from '../renderer';
import { BloqueWrapper } from './components/BloqueWrapper';

interface Props {
  bloques: BloqueJson[];
  bloqueSeleccionadoId: string | null;
  onSeleccionar: (id: string | null) => void;
  onMover: (id: string, nuevaPosicion: number) => void;
  onAgregarBloque: () => void;
  onEliminarBloque: (id: string) => void;
  onDuplicarBloque: (id: string) => void;
  onTituloChange: (id: string, titulo: string) => void;
  onConfigChange: (id: string, config: Record<string, unknown>) => void;
}

interface SortableItemProps {
  bloque: BloqueJson;
  isSelected: boolean;
  onSelect: () => void;
  onTituloChange: (titulo: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onConfigChange: (config: Record<string, unknown>) => void;
}

function SortableItem({
  bloque,
  isSelected,
  onSelect,
  onTituloChange,
  onDuplicate,
  onDelete,
  onConfigChange,
}: SortableItemProps): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: bloque.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BloqueWrapper
        bloque={bloque}
        isSelected={isSelected}
        onSelect={onSelect}
        onTituloChange={onTituloChange}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        <BloqueRenderer
          bloque={bloque}
          modo="editor"
          onConfigChange={(id, config) => onConfigChange(config)}
        />
      </BloqueWrapper>
    </div>
  );
}

export function EditorVisual({
  bloques,
  bloqueSeleccionadoId,
  onSeleccionar,
  onMover,
  onAgregarBloque,
  onEliminarBloque,
  onDuplicarBloque,
  onTituloChange,
  onConfigChange,
}: Props): React.ReactElement {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const bloquesOrdenados = [...bloques].sort((a, b) => a.orden - b.orden);
  const bloqueIds = bloquesOrdenados.map((b) => b.id);

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = bloquesOrdenados.findIndex((b) => b.id === active.id);
      const newIndex = bloquesOrdenados.findIndex((b) => b.id === over.id);
      const newArray = arrayMove(bloquesOrdenados, oldIndex, newIndex);
      const bloqueMovido = newArray.find((b) => b.id === active.id);
      if (bloqueMovido) {
        onMover(active.id as string, newIndex);
      }
    }
  };

  const handleBackgroundClick = (): void => {
    onSeleccionar(null);
  };

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6" onClick={handleBackgroundClick}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={bloqueIds} strategy={verticalListSortingStrategy}>
          <div className="mx-auto max-w-3xl space-y-4">
            {bloquesOrdenados.map((bloque) => (
              <div key={bloque.id} onClick={(e) => e.stopPropagation()}>
                <SortableItem
                  bloque={bloque}
                  isSelected={bloqueSeleccionadoId === bloque.id}
                  onSelect={() => onSeleccionar(bloque.id)}
                  onTituloChange={(titulo) => onTituloChange(bloque.id, titulo)}
                  onDuplicate={() => onDuplicarBloque(bloque.id)}
                  onDelete={() => onEliminarBloque(bloque.id)}
                  onConfigChange={(config) => onConfigChange(bloque.id, config)}
                />
              </div>
            ))}

            {/* Botón agregar */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAgregarBloque();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-8 text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Agregar bloque</span>
            </button>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
