'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import type { TimelineConfig, TimelineEvento } from './types';
import type { StudioBlockProps } from '../types';

interface EventoCardProps {
  evento: TimelineEvento;
  index: number;
  totalEventos: number;
  isInteractive: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  orientacion: 'horizontal' | 'vertical';
}

function EventoCard({
  evento,
  index,
  totalEventos,
  isInteractive,
  onMoveUp,
  onMoveDown,
  orientacion,
}: EventoCardProps): ReactElement {
  const isVertical = orientacion === 'vertical';

  return (
    <div
      data-testid={`event-${evento.id}`}
      className={`
        relative flex ${isVertical ? 'flex-row' : 'flex-col'} items-center
        ${isVertical ? 'mb-6' : 'mx-4'}
      `}
    >
      {/* Connector line */}
      {index > 0 && (
        <div
          className={`
            absolute bg-blue-500
            ${isVertical ? 'w-0.5 h-6 -top-6 left-4' : 'h-0.5 w-8 -left-8 top-4'}
          `}
        />
      )}

      {/* Year marker */}
      <div
        className={`
          w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
          text-white text-xs font-bold z-10 shrink-0
        `}
      >
        {index + 1}
      </div>

      {/* Event content */}
      <div
        className={`
          bg-slate-800 rounded-lg p-3 ${isVertical ? 'ml-4' : 'mt-3'}
          border border-slate-700 min-w-[150px]
        `}
      >
        <div className="text-blue-400 text-sm font-bold">{evento.año}</div>
        <div className="text-white font-medium mt-1">{evento.titulo}</div>
        {evento.descripcion && (
          <div className="text-slate-400 text-sm mt-1">{evento.descripcion}</div>
        )}
      </div>

      {/* Move buttons */}
      {isInteractive && (
        <div className={`flex ${isVertical ? 'flex-col ml-2' : 'flex-row mt-2'} gap-1`}>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label={isVertical ? 'Mover arriba' : 'Mover izquierda'}
            className={`
              p-1 rounded transition-colors
              ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-700'}
            `}
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
                d={isVertical ? 'M5 15l7-7 7 7' : 'M15 19l-7-7 7-7'}
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalEventos - 1}
            aria-label={isVertical ? 'Mover abajo' : 'Mover derecha'}
            className={`
              p-1 rounded transition-colors
              ${index === totalEventos - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-700'}
            `}
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
                d={isVertical ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function Timeline({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<TimelineConfig>): ReactElement {
  // Initialize order based on config eventos (may be shuffled for ordering mode)
  const initialOrder = useMemo(() => {
    return config.eventos.map((e) => e.id);
  }, [config.eventos]);

  const [ordenActual, setOrdenActual] = useState<string[]>(initialOrder);
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const orientacion = config.orientacion || 'horizontal';
  const isOrderingMode = config.modoOrdenar === true;

  // Check if current order is chronologically correct
  const isCorrect = useMemo(() => {
    if (!isOrderingMode) return true;

    const eventosOrdenados = ordenActual
      .map((id) => config.eventos.find((e) => e.id === id))
      .filter((e): e is TimelineEvento => e !== undefined);
    for (let i = 1; i < eventosOrdenados.length; i++) {
      const current = eventosOrdenados[i]!;
      const previous = eventosOrdenados[i - 1]!;
      if (current.año < previous.año) {
        return false;
      }
    }
    return true;
  }, [ordenActual, config.eventos, isOrderingMode]);

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado && isOrderingMode;

  const handleMoveEvent = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!isInteractive) return;
      if (toIndex < 0 || toIndex >= ordenActual.length) return;

      setOrdenActual((prev) => {
        const newOrder = [...prev];
        const removed = newOrder.splice(fromIndex, 1)[0];
        if (removed) {
          newOrder.splice(toIndex, 0, removed);
        }
        return newOrder;
      });

      onProgress?.(50);
    },
    [isInteractive, ordenActual.length, onProgress],
  );

  const handleVerify = useCallback(() => {
    setVerificado(true);
    setIntentos((prev) => prev + 1);
    onComplete?.({
      completado: true,
      puntuacion: isCorrect ? 100 : 0,
      respuesta: ordenActual,
      tiempoMs: 0,
      intentos: intentos + 1,
    });
  }, [isCorrect, ordenActual, onComplete, intentos]);

  const handleRetry = useCallback(() => {
    setVerificado(false);
  }, []);

  // Get eventos in current order
  const eventosOrdenados = useMemo(() => {
    return ordenActual
      .map((id) => config.eventos.find((e) => e.id === id))
      .filter((e): e is TimelineEvento => e !== undefined);
  }, [ordenActual, config.eventos]);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - Timeline
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        {config.titulo && <p className="text-slate-400 text-sm mt-1">{config.titulo}</p>}
        <div className="mt-2 text-slate-400 text-sm">
          Eventos: <span>{config.eventos.length}</span>
          {isOrderingMode && ' | Modo ordenar'}
          {` | ${orientacion}`}
        </div>
      </div>
    );
  }

  const showVerifyButton = modo === 'estudiante' && isOrderingMode && !verificado;
  const showRetryButton = verificado && !isCorrect && !maxAttemptsReached;

  return (
    <div className={`relative ${orientacion}`} data-testid={`timeline-${id}`}>
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{config.instruccion}</h2>
        {config.descripcion && <p className="text-sm text-slate-400 mt-1">{config.descripcion}</p>}
      </div>

      {/* Title */}
      {config.titulo && (
        <h3 className="text-center text-white font-medium mb-4">{config.titulo}</h3>
      )}

      {/* Timeline */}
      <div
        className={`
          flex ${orientacion === 'vertical' ? 'flex-col' : 'flex-row overflow-x-auto'}
          py-4
        `}
      >
        {eventosOrdenados.map((evento, index) => (
          <EventoCard
            key={evento.id}
            evento={evento}
            index={index}
            totalEventos={eventosOrdenados.length}
            isInteractive={isInteractive}
            onMoveUp={() => handleMoveEvent(index, index - 1)}
            onMoveDown={() => handleMoveEvent(index, index + 1)}
            orientacion={orientacion}
          />
        ))}
      </div>

      {/* Feedback */}
      {verificado && config.feedback && (
        <div
          className={`
            p-4 rounded-lg mt-4 text-center
            ${isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? config.feedback.correcto : config.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {modo === 'estudiante' && isOrderingMode && (
        <div className="flex justify-center gap-3 mt-4">
          {showVerifyButton && (
            <button
              type="button"
              onClick={handleVerify}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150"
            >
              Verificar
            </button>
          )}
          {showRetryButton && (
            <button
              type="button"
              onClick={handleRetry}
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
