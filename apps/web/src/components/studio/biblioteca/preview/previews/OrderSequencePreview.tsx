'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para OrderSequence
 */
interface OrderSequenceElement {
  id: string;
  contenido: string;
  ordenCorrecto: number;
}

interface OrderSequenceExampleData {
  instruccion: string;
  elementos: OrderSequenceElement[];
  feedback: {
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
 * Preview interactivo del componente OrderSequence
 */
function OrderSequencePreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as OrderSequenceExampleData;

  const initialOrder = useMemo(
    () => shuffleArray(data.elementos.map((e) => e.id)),
    [data.elementos],
  );

  const [ordenActual, setOrdenActual] = useState<string[]>(initialOrder);
  const [verified, setVerified] = useState(false);

  const correctOrder = useMemo(
    () => [...data.elementos].sort((a, b) => a.ordenCorrecto - b.ordenCorrecto).map((e) => e.id),
    [data.elementos],
  );

  const allCorrect = useMemo(
    () => ordenActual.every((id, index) => id === correctOrder[index]),
    [ordenActual, correctOrder],
  );

  const getPositionStatus = (elementId: string): 'correct' | 'incorrect' => {
    const currentIndex = ordenActual.indexOf(elementId);
    const element = data.elementos.find((e) => e.id === elementId);
    if (!element) return 'incorrect';
    return currentIndex === element.ordenCorrecto - 1 ? 'correct' : 'incorrect';
  };

  const moveItem = useCallback(
    (elementId: string, direction: 'up' | 'down') => {
      if (!interactive || verified) return;

      setOrdenActual((prev) => {
        const currentIndex = prev.indexOf(elementId);
        if (currentIndex === -1) return prev;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= prev.length) return prev;

        const newOrder = [...prev];
        const tempValue = newOrder[currentIndex] ?? '';
        const swapValue = newOrder[newIndex] ?? '';
        newOrder[currentIndex] = swapValue;
        newOrder[newIndex] = tempValue;
        return newOrder;
      });
    },
    [interactive, verified],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setOrdenActual(shuffleArray(data.elementos.map((e) => e.id)));
    setVerified(false);
  }, [data.elementos]);

  const getItemClasses = (elementId: string): string => {
    let baseClasses =
      'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150';

    if (verified) {
      const status = getPositionStatus(elementId);
      baseClasses += status === 'correct' ? ' bg-green-600 text-white' : ' bg-red-600 text-white';
    } else {
      baseClasses += ' bg-slate-700 text-white hover:bg-slate-600';
    }

    return baseClasses;
  };

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Sortable List */}
      <div className="space-y-2 mb-4">
        {ordenActual.map((elementId, index) => {
          const element = data.elementos.find((e) => e.id === elementId);
          if (!element) return null;

          const isFirst = index === 0;
          const isLast = index === ordenActual.length - 1;

          return (
            <div key={elementId} className={getItemClasses(elementId)}>
              {/* Position Number */}
              <span className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>

              {/* Content */}
              <span className="flex-1">{element.contenido}</span>

              {/* Move Buttons */}
              {interactive && !verified && (
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(elementId, 'up')}
                    disabled={isFirst}
                    className="p-1 rounded hover:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(elementId, 'down')}
                    disabled={isLast}
                    className="p-1 rounded hover:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Verification indicator */}
              {verified && (
                <span className="text-lg shrink-0">
                  {getPositionStatus(elementId) === 'correct' ? '✓' : '✗'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {verified && (
        <div
          className={`
            p-4 rounded-lg mb-4 text-center
            ${allCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${allCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {allCorrect ? data.feedback.correcto : data.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && (
        <div className="flex justify-center gap-3">
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
 * Documentación de props para OrderSequence
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'elementos',
    type: 'array',
    description: 'Lista de elementos con id, contenido y ordenCorrecto',
    required: true,
  },
  {
    name: 'feedback',
    type: 'object',
    description: 'Mensajes de feedback con propiedades correcto e incorrecto',
    required: true,
  },
  {
    name: 'intentosMaximos',
    type: 'number',
    description: 'Número máximo de intentos permitidos',
    required: false,
  },
  {
    name: 'mostrarRespuestasTras',
    type: 'number',
    description: 'Número de intentos tras los cuales mostrar el orden correcto',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: OrderSequenceExampleData = {
  instruccion: 'Ordena los pasos del método científico',
  elementos: [
    { id: 'e1', contenido: 'Observación', ordenCorrecto: 1 },
    { id: 'e2', contenido: 'Hipótesis', ordenCorrecto: 2 },
    { id: 'e3', contenido: 'Experimentación', ordenCorrecto: 3 },
    { id: 'e4', contenido: 'Conclusión', ordenCorrecto: 4 },
  ],
  feedback: {
    correcto: '¡Excelente! El orden es correcto.',
    incorrecto: 'El orden no es correcto. Inténtalo de nuevo.',
  },
};

/**
 * Definición del preview para el registry
 */
export const OrderSequencePreview: PreviewDefinition = {
  component: OrderSequencePreviewComponent,
  exampleData,
  propsDocumentation,
};
