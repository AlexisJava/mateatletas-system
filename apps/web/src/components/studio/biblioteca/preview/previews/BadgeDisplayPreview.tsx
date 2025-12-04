'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import { Award, Star, Trophy, Target, Zap, BookOpen, Brain, Rocket } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para BadgeDisplay
 */
interface Badge {
  id: string;
  nombre: string;
  descripcion: string;
  icono: 'award' | 'star' | 'trophy' | 'target' | 'zap' | 'book' | 'brain' | 'rocket';
  color: string;
  obtenida: boolean;
  fechaObtencion?: string;
  progreso?: number; // 0-100 para insignias en progreso
}

interface BadgeDisplayExampleData {
  instruccion: string;
  titulo?: string;
  insignias: Badge[];
  mostrarProgreso?: boolean;
  columnas?: 2 | 3 | 4;
}

const iconMap = {
  award: Award,
  star: Star,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  book: BookOpen,
  brain: Brain,
  rocket: Rocket,
};

/**
 * Preview interactivo del componente BadgeDisplay
 */
function BadgeDisplayPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as BadgeDisplayExampleData;

  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const handleBadgeClick = useCallback(
    (badgeId: string) => {
      if (!interactive) return;
      setSelectedBadge(selectedBadge === badgeId ? null : badgeId);
    },
    [interactive, selectedBadge],
  );

  const columnas = data.columnas ?? 3;
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columnas];

  const obtenidasCount = data.insignias.filter((b) => b.obtenida).length;

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        {data.titulo && <p className="text-sm text-slate-400 mt-1">{data.titulo}</p>}
      </div>

      {/* Stats */}
      <div className="mb-4 p-3 bg-slate-800 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-white font-medium">
            {obtenidasCount} de {data.insignias.length} insignias
          </span>
        </div>
        <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-500"
            style={{ width: `${(obtenidasCount / data.insignias.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badge Grid */}
      <div className={`grid ${gridCols} gap-3`}>
        {data.insignias.map((badge) => {
          const Icon = iconMap[badge.icono];
          const isSelected = selectedBadge === badge.id;

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => handleBadgeClick(badge.id)}
              disabled={!interactive}
              className={`
                relative p-4 rounded-xl transition-all duration-200 text-center
                ${badge.obtenida ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-800/50 opacity-60'}
                ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''}
                disabled:cursor-default
              `}
            >
              {/* Badge Icon */}
              <div
                className={`
                  w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-2
                  ${badge.obtenida ? 'shadow-lg' : 'bg-slate-700 grayscale'}
                `}
                style={{
                  backgroundColor: badge.obtenida ? badge.color + '30' : undefined,
                  boxShadow: badge.obtenida ? `0 0 20px ${badge.color}40` : undefined,
                }}
              >
                <Icon
                  className="w-7 h-7"
                  style={{ color: badge.obtenida ? badge.color : '#64748b' }}
                />
              </div>

              {/* Badge Name */}
              <h4
                className={`text-sm font-medium ${badge.obtenida ? 'text-white' : 'text-slate-500'}`}
              >
                {badge.nombre}
              </h4>

              {/* Progress bar for incomplete badges */}
              {!badge.obtenida &&
                badge.progreso !== undefined &&
                data.mostrarProgreso !== false && (
                  <div className="mt-2">
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${badge.progreso}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">{badge.progreso}%</span>
                  </div>
                )}

              {/* Obtained indicator */}
              {badge.obtenida && (
                <div className="absolute top-2 right-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Badge Detail */}
      {selectedBadge && (
        <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-slate-700 animate-in fade-in duration-200">
          {(() => {
            const badge = data.insignias.find((b) => b.id === selectedBadge);
            if (!badge) return null;
            const Icon = iconMap[badge.icono];

            return (
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: badge.obtenida ? badge.color + '30' : '#334155',
                  }}
                >
                  <Icon
                    className="w-8 h-8"
                    style={{ color: badge.obtenida ? badge.color : '#64748b' }}
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{badge.nombre}</h4>
                  <p className="text-sm text-slate-400 mt-1">{badge.descripcion}</p>
                  {badge.obtenida && badge.fechaObtencion && (
                    <p className="text-xs text-green-400 mt-2">
                      ✓ Obtenida el {badge.fechaObtencion}
                    </p>
                  )}
                  {!badge.obtenida && badge.progreso !== undefined && (
                    <p className="text-xs text-blue-400 mt-2">⏳ Progreso: {badge.progreso}%</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para BadgeDisplay
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'titulo',
    type: 'string',
    description: 'Título opcional de la colección de insignias',
    required: false,
  },
  {
    name: 'insignias',
    type: 'array',
    description: 'Lista de insignias con id, nombre, descripcion, icono, color, obtenida',
    required: true,
  },
  {
    name: 'mostrarProgreso',
    type: 'boolean',
    description: 'Si se muestra el progreso de insignias no obtenidas',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'columnas',
    type: 'number',
    description: 'Número de columnas en el grid (2, 3, o 4)',
    required: false,
    defaultValue: '3',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: BadgeDisplayExampleData = {
  instruccion: 'Tus logros y insignias',
  titulo: 'Colección de Matemáticas',
  insignias: [
    {
      id: 'b1',
      nombre: 'Primer Paso',
      descripcion: 'Completaste tu primera actividad de matemáticas',
      icono: 'rocket',
      color: '#3B82F6',
      obtenida: true,
      fechaObtencion: '15/03/2024',
    },
    {
      id: 'b2',
      nombre: 'Calculador',
      descripcion: 'Resolviste 10 ejercicios de cálculo sin errores',
      icono: 'brain',
      color: '#8B5CF6',
      obtenida: true,
      fechaObtencion: '18/03/2024',
    },
    {
      id: 'b3',
      nombre: 'Explorador',
      descripcion: 'Exploraste todas las secciones del curso',
      icono: 'target',
      color: '#10B981',
      obtenida: false,
      progreso: 75,
    },
    {
      id: 'b4',
      nombre: 'Maestro',
      descripcion: 'Obtuviste puntuación perfecta en un examen',
      icono: 'trophy',
      color: '#F59E0B',
      obtenida: false,
      progreso: 0,
    },
    {
      id: 'b5',
      nombre: 'Lector',
      descripcion: 'Leíste todo el material de apoyo',
      icono: 'book',
      color: '#EC4899',
      obtenida: true,
      fechaObtencion: '20/03/2024',
    },
    {
      id: 'b6',
      nombre: 'Veloz',
      descripcion: 'Completaste una actividad en tiempo récord',
      icono: 'zap',
      color: '#F97316',
      obtenida: false,
      progreso: 40,
    },
  ],
  mostrarProgreso: true,
  columnas: 3,
};

/**
 * Definición del preview para el registry
 */
export const BadgeDisplayPreview: PreviewDefinition = {
  component: BadgeDisplayPreviewComponent,
  exampleData,
  propsDocumentation,
};
