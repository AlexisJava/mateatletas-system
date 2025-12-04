'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para Timeline
 */
interface TimelineEvento {
  id: string;
  año: number;
  titulo: string;
  descripcion?: string;
}

interface TimelineExampleData {
  instruccion: string;
  titulo?: string;
  eventos: TimelineEvento[];
  modoOrdenar?: boolean;
  orientacion?: 'horizontal' | 'vertical';
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i] as T;
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp;
  }
  return shuffled;
}

/**
 * Preview interactivo del componente Timeline
 */
function TimelinePreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as TimelineExampleData;
  const isOrderMode = data.modoOrdenar ?? false;

  const initialOrder = useMemo(() => {
    const ids = data.eventos.map((e) => e.id);
    return isOrderMode ? shuffleArray(ids) : ids;
  }, [data.eventos, isOrderMode]);

  const [ordenActual, setOrdenActual] = useState<string[]>(initialOrder);
  const [verified, setVerified] = useState(false);

  const correctOrder = useMemo(() => {
    return [...data.eventos].sort((a, b) => a.año - b.año).map((e) => e.id);
  }, [data.eventos]);

  const isCorrect = useMemo(() => {
    return ordenActual.every((id, index) => id === correctOrder[index]);
  }, [ordenActual, correctOrder]);

  const handleMoveEvent = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (!interactive || verified) return;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= ordenActual.length) return;

      setOrdenActual((prev) => {
        const newOrder = [...prev];
        const temp = newOrder[index] ?? '';
        newOrder[index] = newOrder[newIndex] ?? '';
        newOrder[newIndex] = temp;
        return newOrder;
      });
    },
    [interactive, verified, ordenActual.length],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
    setOrdenActual(shuffleArray(data.eventos.map((e) => e.id)));
  }, [data.eventos]);

  const eventosOrdenados = useMemo(() => {
    return ordenActual
      .map((id) => data.eventos.find((e) => e.id === id))
      .filter((e): e is TimelineEvento => e !== undefined);
  }, [ordenActual, data.eventos]);

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        {data.titulo && <p className="text-slate-400 mt-1">{data.titulo}</p>}
      </div>

      {/* Timeline */}
      <div className="relative py-4">
        {/* Line connector */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-600" />

        {/* Events */}
        <div className="space-y-4">
          {eventosOrdenados.map((evento, index) => {
            const isFirst = index === 0;
            const isLast = index === eventosOrdenados.length - 1;

            return (
              <div key={evento.id} className="relative flex items-start gap-4 pl-10">
                {/* Marker */}
                <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold z-10">
                  {index + 1}
                </div>

                {/* Card */}
                <div
                  className={`
                    flex-1 bg-slate-800 rounded-lg p-3 border transition-colors
                    ${verified ? (isCorrect ? 'border-green-600' : correctOrder[index] === evento.id ? 'border-green-600' : 'border-red-600') : 'border-slate-700'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-blue-400 text-sm font-bold">{evento.año}</span>
                      <h3 className="text-white font-medium">{evento.titulo}</h3>
                      {evento.descripcion && (
                        <p className="text-slate-400 text-sm mt-1">{evento.descripcion}</p>
                      )}
                    </div>

                    {/* Move buttons */}
                    {interactive && isOrderMode && !verified && (
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => handleMoveEvent(index, 'up')}
                          disabled={isFirst}
                          className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="w-4 h-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveEvent(index, 'down')}
                          disabled={isLast}
                          className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="w-4 h-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {verified && data.feedback && (
        <div
          className={`
            p-4 rounded-lg mt-4 text-center
            ${isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? data.feedback.correcto : data.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && isOrderMode && (
        <div className="flex justify-center gap-3 mt-4">
          {!verified ? (
            <button
              type="button"
              onClick={handleVerify}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150"
            >
              Verificar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors duration-150"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para Timeline
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
    description: 'Título opcional de la línea de tiempo',
    required: false,
  },
  {
    name: 'eventos',
    type: 'array',
    description: 'Array de eventos con id, año, titulo y descripcion opcional',
    required: true,
  },
  {
    name: 'modoOrdenar',
    type: 'boolean',
    description: 'Si es true, el estudiante debe ordenar los eventos cronológicamente',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'orientacion',
    type: 'string',
    description: 'Orientación de la línea: horizontal o vertical',
    required: false,
    defaultValue: 'vertical',
  },
  {
    name: 'feedback',
    type: 'object',
    description: 'Mensajes de feedback al verificar',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: TimelineExampleData = {
  instruccion: 'Ordena los descubrimientos científicos cronológicamente',
  titulo: 'Historia de la Química',
  eventos: [
    {
      id: 'ev1',
      año: 1869,
      titulo: 'Tabla Periódica',
      descripcion: 'Mendeleev organiza los elementos',
    },
    {
      id: 'ev2',
      año: 1911,
      titulo: 'Modelo Atómico',
      descripcion: 'Rutherford descubre el núcleo',
    },
    {
      id: 'ev3',
      año: 1913,
      titulo: 'Modelo de Bohr',
      descripcion: 'Órbitas electrónicas cuantizadas',
    },
    { id: 'ev4', año: 1932, titulo: 'Neutrón', descripcion: 'Chadwick descubre el neutrón' },
  ],
  modoOrdenar: true,
  orientacion: 'vertical',
  feedback: {
    correcto: '¡Perfecto! Has ordenado correctamente los eventos.',
    incorrecto: 'El orden no es correcto. Revisa las fechas.',
  },
};

/**
 * Definición del preview para el registry
 */
export const TimelinePreview: PreviewDefinition = {
  component: TimelinePreviewComponent,
  exampleData,
  propsDocumentation,
};
