'use client';

import { useState, useMemo, useCallback } from 'react';
import { useCanvasStore } from '../../stores/canvas.store';
import { blockRegistry, getBlockDefinition } from '@/components/blocks/registry';
import type { BloqueCategoria } from '@/components/blocks/types';

const CATEGORY_LABELS: Record<BloqueCategoria, string> = {
  INTERACTIVO: 'Interactivos',
  MOTRICIDAD_FINA: 'Motricidad Fina',
  SIMULADOR: 'Simuladores',
  EDITOR_CODIGO: 'Editores de Código',
  CREATIVO: 'Creativos',
  MULTIMEDIA: 'Multimedia',
  EVALUACION: 'Evaluación',
  MULTIPLAYER: 'Multijugador',
};

const CATEGORY_ORDER: BloqueCategoria[] = [
  'INTERACTIVO',
  'EVALUACION',
  'MULTIMEDIA',
  'SIMULADOR',
  'MOTRICIDAD_FINA',
  'EDITOR_CODIGO',
  'CREATIVO',
  'MULTIPLAYER',
];

export function ComponentPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<BloqueCategoria>>(
    new Set(['INTERACTIVO', 'EVALUACION', 'MULTIMEDIA']),
  );

  const { addElement } = useCanvasStore();

  const filteredBlockTypes = useMemo(() => {
    if (!searchQuery.trim()) {
      return Object.keys(blockRegistry);
    }

    const query = searchQuery.toLowerCase();
    return Object.entries(blockRegistry)
      .filter(([, definition]) => definition.displayName.toLowerCase().includes(query))
      .map(([type]) => type);
  }, [searchQuery]);

  const toggleCategory = useCallback((category: BloqueCategoria) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleBlockClick = useCallback(
    (type: string) => {
      const definition = getBlockDefinition(type);
      if (definition) {
        // Add at center-ish position
        addElement(type, { x: 400, y: 300 });
      }
    },
    [addElement],
  );

  const handleDragStart = useCallback((e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/x-studio-block', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const totalBlocks = Object.keys(blockRegistry).length;

  return (
    <div
      className="w-[280px] h-full bg-white border-r border-gray-200 flex flex-col"
      data-testid="component-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Componentes</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar componentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            data-testid="component-search"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">{totalBlocks} componentes disponibles</p>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {CATEGORY_ORDER.map((category) => {
          const categoryBlocks = Object.entries(blockRegistry).filter(
            ([type, def]) => def.category === category && filteredBlockTypes.includes(type),
          );

          if (categoryBlocks.length === 0) return null;

          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="mb-2" data-testid={`category-${category}`}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span>{CATEGORY_LABELS[category]}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{categoryBlocks.length}</span>
                  <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </span>
              </button>

              {isExpanded && (
                <div className="mt-1 space-y-1 pl-2">
                  {categoryBlocks.map(([type, definition]) => (
                    <button
                      key={type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, type)}
                      onClick={() => handleBlockClick(type)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg transition-colors cursor-grab active:cursor-grabbing"
                      data-testid={`block-${type}`}
                    >
                      <span className="text-lg">{definition.icon}</span>
                      <span>{definition.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {searchQuery && filteredBlockTypes.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm">No se encontraron componentes</p>
          </div>
        )}
      </div>
    </div>
  );
}
