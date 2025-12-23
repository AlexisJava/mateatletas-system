'use client';

/**
 * BloquePalette - Panel lateral con bloques arrastrables
 *
 * Muestra todos los bloques disponibles agrupados por categoría.
 * Cada bloque es arrastrable usando dnd-kit.
 */
import { useDraggable } from '@dnd-kit/core';
import { blockRegistry, getBlocksByCategory } from '@/components/blocks/registry';
import type { BloqueCategoria } from '@/components/blocks/types';

/**
 * Nombres legibles para las categorías
 */
const CATEGORY_LABELS: Record<BloqueCategoria, string> = {
  INTERACTIVO: 'Interactivo',
  MOTRICIDAD_FINA: 'Motricidad Fina',
  SIMULADOR: 'Simuladores',
  EDITOR_CODIGO: 'Código',
  CREATIVO: 'Creativos',
  MULTIMEDIA: 'Multimedia',
  EVALUACION: 'Evaluación',
  MULTIPLAYER: 'Multijugador',
};

/**
 * Iconos para las categorías
 */
const CATEGORY_ICONS: Record<BloqueCategoria, string> = {
  INTERACTIVO: '🎮',
  MOTRICIDAD_FINA: '✋',
  SIMULADOR: '🔬',
  EDITOR_CODIGO: '💻',
  CREATIVO: '🎨',
  MULTIMEDIA: '🎬',
  EVALUACION: '📝',
  MULTIPLAYER: '👥',
};

interface DraggableBlockProps {
  type: string;
  icon: string;
  displayName: string;
}

/**
 * Bloque individual arrastrable
 */
function DraggableBlock({ type, icon, displayName }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type,
      fromPalette: true,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`palette-block-${type}`}
      className={`
        flex items-center gap-2 p-2 rounded-lg cursor-grab
        bg-white border border-gray-200 hover:border-cyan-400
        hover:shadow-sm transition-all duration-150
        ${isDragging ? 'opacity-50 cursor-grabbing shadow-lg' : ''}
      `}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-gray-700 truncate">{displayName}</span>
    </div>
  );
}

/**
 * Panel de bloques con categorías colapsables
 */
export function BloquePalette() {
  const blocksByCategory = getBlocksByCategory();

  // Orden de categorías a mostrar (solo las que tienen bloques)
  const categoryOrder: BloqueCategoria[] = [
    'INTERACTIVO',
    'EVALUACION',
    'MULTIMEDIA',
    'SIMULADOR',
    'MOTRICIDAD_FINA',
    'EDITOR_CODIGO',
    'CREATIVO',
    'MULTIPLAYER',
  ];

  return (
    <div className="w-[260px] h-full bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Componentes</h2>
        <p className="text-xs text-gray-500 mt-1">Arrastrá al canvas</p>
      </div>

      {/* Lista de bloques por categoría */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categoryOrder.map((category) => {
          const blocks = blocksByCategory[category];
          if (blocks.length === 0) return null;

          return (
            <div key={category}>
              {/* Header de categoría */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-sm">{CATEGORY_ICONS[category]}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-xs text-gray-400">({blocks.length})</span>
              </div>

              {/* Lista de bloques */}
              <div className="space-y-1.5">
                {Object.entries(blockRegistry)
                  .filter(([, def]) => def.category === category)
                  .map(([type, def]) => (
                    <DraggableBlock
                      key={type}
                      type={type}
                      icon={def.icon}
                      displayName={def.displayName}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con contador */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-400 text-center">
          {Object.keys(blockRegistry).length} bloques disponibles
        </p>
      </div>
    </div>
  );
}
