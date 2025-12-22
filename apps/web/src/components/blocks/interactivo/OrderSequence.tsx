'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { OrderSequenceConfig } from './types';
import type { StudioBlockProps } from '../types';

// ============================================================================
// Types
// ============================================================================

interface OrderSequenceState {
  ordenActual: string[];
  verificado: boolean;
  intentos: number;
  mostrarRespuestas: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

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

function getCorrectOrder(config: OrderSequenceConfig): string[] {
  return [...config.elementos].sort((a, b) => a.ordenCorrecto - b.ordenCorrecto).map((e) => e.id);
}

function isOrderCorrect(currentOrder: string[], config: OrderSequenceConfig): boolean {
  const correctOrder = getCorrectOrder(config);
  return currentOrder.every((id, index) => id === correctOrder[index]);
}

function getPositionStatus(
  elementId: string,
  currentOrder: string[],
  config: OrderSequenceConfig,
): 'correct' | 'incorrect' | 'neutral' {
  const currentIndex = currentOrder.indexOf(elementId);
  const element = config.elementos.find((e) => e.id === elementId);
  if (!element) return 'neutral';

  const correctIndex = element.ordenCorrecto - 1; // 1-indexed to 0-indexed
  return currentIndex === correctIndex ? 'correct' : 'incorrect';
}

// ============================================================================
// Correct Answers Display
// ============================================================================

interface CorrectAnswersDisplayProps {
  config: OrderSequenceConfig;
}

const CorrectAnswersDisplay: React.FC<CorrectAnswersDisplayProps> = ({ config }) => {
  const sortedElements = [...config.elementos].sort((a, b) => a.ordenCorrecto - b.ordenCorrecto);

  return (
    <div
      data-testid="correct-answers"
      className="bg-slate-800 p-4 rounded-xl mt-4 border border-slate-700"
    >
      <h4 className="font-semibold text-slate-300 mb-3">Orden correcto:</h4>
      <div className="space-y-2">
        {sortedElements.map((element, index) => (
          <div key={element.id} className="flex items-center gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <span className="text-white">{element.contenido}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const OrderSequence: React.FC<StudioBlockProps<OrderSequenceConfig>> = ({
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}) => {
  // Initialize with shuffled order
  const initialOrder = useMemo(() => {
    return shuffleArray(config.elementos.map((e) => e.id));
  }, [config.elementos]);

  const [state, setState] = useState<OrderSequenceState>({
    ordenActual: initialOrder,
    verificado: false,
    intentos: 0,
    mostrarRespuestas: false,
  });

  // ============================================================================
  // Computed values
  // ============================================================================

  const allCorrect = useMemo(() => {
    return isOrderCorrect(state.ordenActual, config);
  }, [state.ordenActual, config]);

  const correctCount = useMemo(() => {
    return state.ordenActual.filter((id, index) => {
      const element = config.elementos.find((e) => e.id === id);
      return element && element.ordenCorrecto - 1 === index;
    }).length;
  }, [state.ordenActual, config.elementos]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const moveItem = useCallback(
    (elementId: string, direction: 'up' | 'down') => {
      if (disabled || state.verificado) return;

      setState((prev) => {
        const currentIndex = prev.ordenActual.indexOf(elementId);
        if (currentIndex === -1) return prev;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= prev.ordenActual.length) return prev;

        const newOrder = [...prev.ordenActual];
        const tempValue = newOrder[currentIndex];
        const swapValue = newOrder[newIndex];
        if (tempValue !== undefined && swapValue !== undefined) {
          newOrder[currentIndex] = swapValue;
          newOrder[newIndex] = tempValue;
        }

        return { ...prev, ordenActual: newOrder };
      });

      // Calculate progress
      const newCorrectCount = state.ordenActual.filter((id, index) => {
        const element = config.elementos.find((e) => e.id === id);
        return element && element.ordenCorrecto - 1 === index;
      }).length;
      const progressPercent = Math.round((newCorrectCount / config.elementos.length) * 100);
      onProgress?.(progressPercent);
    },
    [disabled, state.verificado, state.ordenActual, config.elementos, onProgress],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, elementId: string) => {
      if (disabled || state.verificado) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData('text/plain', elementId);
      e.dataTransfer.effectAllowed = 'move';
    },
    [disabled, state.verificado],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (disabled || state.verificado) return;

      const draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId === targetId) return;

      setState((prev) => {
        const draggedIndex = prev.ordenActual.indexOf(draggedId);
        const targetIndex = prev.ordenActual.indexOf(targetId);
        if (draggedIndex === -1 || targetIndex === -1) return prev;

        const newOrder = [...prev.ordenActual];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedId);

        return { ...prev, ordenActual: newOrder };
      });

      onProgress?.(Math.round((correctCount / config.elementos.length) * 100));
    },
    [disabled, state.verificado, correctCount, config.elementos.length, onProgress],
  );

  const handleVerificar = useCallback(() => {
    const newIntentos = state.intentos + 1;
    const shouldShowAnswers =
      config.mostrarRespuestasTras !== undefined && newIntentos >= config.mostrarRespuestasTras;

    setState((prev) => ({
      ...prev,
      verificado: true,
      intentos: newIntentos,
      mostrarRespuestas: shouldShowAnswers,
    }));

    const score = Math.round((correctCount / config.elementos.length) * 100);

    onComplete?.({
      completado: allCorrect,
      puntuacion: score,
      respuesta: state.ordenActual,
      intentos: newIntentos,
      tiempoMs: 0,
    });
  }, [state, config, allCorrect, correctCount, onComplete]);

  const handleReintentar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      verificado: false,
      ordenActual: shuffleArray(config.elementos.map((e) => e.id)),
    }));
  }, [config.elementos]);

  // ============================================================================
  // Render helpers
  // ============================================================================

  const isInteractive = modo === 'estudiante' && !disabled;
  const canRetry = config.intentosMaximos === undefined || state.intentos < config.intentosMaximos;

  const getItemClasses = (elementId: string): string => {
    let baseClasses =
      'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 bg-slate-700';

    if (state.verificado) {
      const status = getPositionStatus(elementId, state.ordenActual, config);
      if (status === 'correct') {
        baseClasses += ' bg-green-600 text-white';
      } else {
        baseClasses += ' bg-red-600 text-white';
      }
    } else {
      baseClasses += ' text-white hover:bg-slate-600';
    }

    if (isInteractive && !state.verificado) {
      baseClasses += ' cursor-grab active:cursor-grabbing';
    }

    return baseClasses;
  };

  // ============================================================================
  // Render: Preview Mode
  // ============================================================================

  if (modo === 'preview') {
    return (
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <p className="text-slate-300 font-medium mb-3">{config.instruccion}</p>
        <div className="space-y-2">
          {config.elementos.map((element, index) => (
            <div
              key={element.id}
              className="flex items-center gap-3 bg-slate-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              <span className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs">
                {index + 1}
              </span>
              <span>{element.contenido}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Editor Mode
  // ============================================================================

  if (modo === 'editor') {
    return (
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div data-testid="editor-mode-indicator" className="mb-3">
          <h3 className="font-semibold text-slate-300 mb-1">Order Sequence - Modo Editor</h3>
          <p className="text-slate-400 text-sm">{config.instruccion}</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg text-sm">
          <span className="text-slate-400">Elementos:</span>
          <span className="text-slate-200 ml-2">{config.elementos.length}</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Estudiante Mode
  // ============================================================================

  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
      {/* Instruction Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-200 mb-1">{config.instruccion}</h2>
        {config.intentosMaximos && (
          <p className="text-slate-400 text-sm">
            Intento {state.intentos} de {config.intentosMaximos}
          </p>
        )}
      </div>

      {/* Sortable List */}
      <div className="space-y-2 mb-5">
        {state.ordenActual.map((elementId, index) => {
          const element = config.elementos.find((e) => e.id === elementId);
          if (!element) return null;

          const isFirst = index === 0;
          const isLast = index === state.ordenActual.length - 1;

          return (
            <div
              key={elementId}
              data-testid={`order-item-${elementId}`}
              draggable={isInteractive && !state.verificado}
              onDragStart={(e) => handleDragStart(e, elementId)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, elementId)}
              className={getItemClasses(elementId)}
            >
              {/* Position Number */}
              <span className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>

              {/* Content */}
              <span className="flex-1">{element.contenido}</span>

              {/* Move Buttons */}
              {isInteractive && !state.verificado && (
                <div className="flex gap-1 shrink-0">
                  <button
                    data-testid={`move-up-${elementId}`}
                    onClick={() => moveItem(elementId, 'up')}
                    disabled={isFirst || disabled}
                    className="p-1 rounded hover:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    data-testid={`move-down-${elementId}`}
                    onClick={() => moveItem(elementId, 'down')}
                    disabled={isLast || disabled}
                    className="p-1 rounded hover:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Verification indicator */}
              {state.verificado && (
                <span className="text-lg shrink-0">
                  {getPositionStatus(elementId, state.ordenActual, config) === 'correct'
                    ? '✓'
                    : '✗'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {state.verificado && (
        <div
          className={`
            p-4 rounded-lg mb-4 text-center
            ${allCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${allCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {allCorrect ? config.feedback.correcto : config.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Show correct answers after max attempts */}
      {state.mostrarRespuestas && <CorrectAnswersDisplay config={config} />}

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        {!state.verificado ? (
          <button
            onClick={handleVerificar}
            disabled={!isInteractive}
            className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Verificar
          </button>
        ) : (
          canRetry &&
          !allCorrect &&
          !state.mostrarRespuestas && (
            <button
              onClick={handleReintentar}
              disabled={!isInteractive}
              className="px-6 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Reintentar
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default OrderSequence;
