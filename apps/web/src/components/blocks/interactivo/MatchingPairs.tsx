'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { MatchingPairsConfig, MatchingConnection } from './types';
import type { StudioBlockProps } from '../types';

// ============================================================================
// Types
// ============================================================================

interface MatchingPairsState {
  connections: MatchingConnection[];
  selectedItem: { side: 'left' | 'right'; pairId: string } | null;
  verificado: boolean;
  intentos: number;
  mostrarRespuestas: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getConnectionForLeft(
  connections: MatchingConnection[],
  leftId: string,
): MatchingConnection | undefined {
  return connections.find((c) => c.leftId === leftId);
}

function getConnectionForRight(
  connections: MatchingConnection[],
  rightId: string,
): MatchingConnection | undefined {
  return connections.find((c) => c.rightId === rightId);
}

function isConnectionCorrect(connection: MatchingConnection): boolean {
  // Conexión correcta si leftId y rightId son del mismo par (mismo id base)
  return connection.leftId === connection.rightId;
}

// ============================================================================
// Correct Answers Display
// ============================================================================

interface CorrectAnswersDisplayProps {
  config: MatchingPairsConfig;
}

const CorrectAnswersDisplay: React.FC<CorrectAnswersDisplayProps> = ({ config }) => {
  return (
    <div
      data-testid="correct-answers"
      className="bg-slate-800 p-4 rounded-xl mt-4 border border-slate-700"
    >
      <h4 className="font-semibold text-slate-300 mb-3">Respuestas correctas:</h4>
      <div className="space-y-2">
        {config.pares.map((par) => (
          <div key={par.id} className="flex items-center gap-2 text-sm">
            <span className="text-white bg-slate-700 px-2 py-1 rounded">{par.izquierda}</span>
            <span className="text-slate-400">↔</span>
            <span className="text-white bg-slate-700 px-2 py-1 rounded">{par.derecha}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const MatchingPairs: React.FC<StudioBlockProps<MatchingPairsConfig>> = ({
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}) => {
  const [state, setState] = useState<MatchingPairsState>({
    connections: [],
    selectedItem: null,
    verificado: false,
    intentos: 0,
    mostrarRespuestas: false,
  });

  // ============================================================================
  // Computed values
  // ============================================================================

  const allCorrect = useMemo(() => {
    if (state.connections.length !== config.pares.length) return false;
    return state.connections.every(isConnectionCorrect);
  }, [state.connections, config.pares.length]);

  // Shuffle right items for display (but keep IDs for correct matching)
  const shuffledRightItems = useMemo(() => {
    return [...config.pares].sort(() => Math.random() - 0.5);
  }, [config.pares]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleItemClick = useCallback(
    (side: 'left' | 'right', pairId: string) => {
      if (disabled || state.verificado) return;

      const existingConnection =
        side === 'left'
          ? getConnectionForLeft(state.connections, pairId)
          : getConnectionForRight(state.connections, pairId);

      // Si ya está conectado, desconectar
      if (existingConnection) {
        const newConnections = state.connections.filter(
          (c) => c.leftId !== existingConnection.leftId || c.rightId !== existingConnection.rightId,
        );
        setState((prev) => ({
          ...prev,
          connections: newConnections,
          selectedItem: null,
        }));

        const progressPercent = Math.round((newConnections.length / config.pares.length) * 100);
        onProgress?.(progressPercent);
        return;
      }

      // Si no hay selección previa, seleccionar este item
      if (!state.selectedItem) {
        setState((prev) => ({
          ...prev,
          selectedItem: { side, pairId },
        }));
        return;
      }

      // Si ya hay selección del mismo lado, cambiar selección
      if (state.selectedItem.side === side) {
        setState((prev) => ({
          ...prev,
          selectedItem: { side, pairId },
        }));
        return;
      }

      // Crear conexión entre items de lados diferentes
      const leftId = side === 'left' ? pairId : state.selectedItem.pairId;
      const rightId = side === 'right' ? pairId : state.selectedItem.pairId;

      // Verificar que ninguno esté ya conectado
      const leftAlreadyConnected = getConnectionForLeft(state.connections, leftId);
      const rightAlreadyConnected = getConnectionForRight(state.connections, rightId);

      if (leftAlreadyConnected || rightAlreadyConnected) {
        // Si alguno está conectado, solo cambiar selección
        setState((prev) => ({
          ...prev,
          selectedItem: { side, pairId },
        }));
        return;
      }

      const newConnection: MatchingConnection = { leftId, rightId };
      const newConnections = [...state.connections, newConnection];

      setState((prev) => ({
        ...prev,
        connections: newConnections,
        selectedItem: null,
      }));

      const progressPercent = Math.round((newConnections.length / config.pares.length) * 100);
      onProgress?.(progressPercent);
    },
    [
      disabled,
      state.verificado,
      state.selectedItem,
      state.connections,
      config.pares.length,
      onProgress,
    ],
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

    const correctCount = state.connections.filter(isConnectionCorrect).length;
    const score = Math.round((correctCount / config.pares.length) * 100);

    if (allCorrect) {
      onComplete?.({
        completado: true,
        puntuacion: 100,
        respuesta: state.connections,
        intentos: newIntentos,
        tiempoMs: 0,
      });
    } else if (shouldShowAnswers) {
      onComplete?.({
        completado: false,
        puntuacion: score,
        respuesta: state.connections,
        intentos: newIntentos,
        tiempoMs: 0,
      });
    }
  }, [state, config, allCorrect, onComplete]);

  const handleReintentar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      verificado: false,
      connections: [],
      selectedItem: null,
    }));
  }, []);

  // ============================================================================
  // Item styling helpers
  // ============================================================================

  const getItemClasses = (side: 'left' | 'right', pairId: string): string => {
    const connection =
      side === 'left'
        ? getConnectionForLeft(state.connections, pairId)
        : getConnectionForRight(state.connections, pairId);

    const isSelected = state.selectedItem?.side === side && state.selectedItem?.pairId === pairId;
    const isConnected = !!connection;

    let baseClasses =
      'px-4 py-3 rounded-lg font-medium transition-all duration-150 cursor-pointer select-none';

    if (disabled || state.verificado) {
      baseClasses += ' cursor-not-allowed';
    }

    if (isSelected && !isConnected) {
      return `${baseClasses} bg-slate-600 ring-2 ring-blue-400`;
    }

    if (state.verificado && isConnected) {
      const isCorrect = isConnectionCorrect(connection);
      return `${baseClasses} ${isCorrect ? 'bg-green-600' : 'bg-red-600'} text-white`;
    }

    if (isConnected) {
      return `${baseClasses} bg-blue-600 text-white`;
    }

    return `${baseClasses} bg-slate-700 hover:bg-slate-600 text-white`;
  };

  // ============================================================================
  // Render helpers
  // ============================================================================

  const isInteractive = modo === 'estudiante' && !disabled;
  const canRetry = config.intentosMaximos === undefined || state.intentos < config.intentosMaximos;

  // ============================================================================
  // Render: Preview Mode
  // ============================================================================

  if (modo === 'preview') {
    return (
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <p className="text-slate-300 font-medium mb-3">{config.instruccion}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {config.pares.map((par) => (
              <div key={par.id} className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm">
                {par.izquierda}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {config.pares.map((par) => (
              <div key={par.id} className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm">
                {par.derecha}
              </div>
            ))}
          </div>
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
          <h3 className="font-semibold text-slate-300 mb-1">Matching Pairs - Modo Editor</h3>
          <p className="text-slate-400 text-sm">{config.instruccion}</p>
        </div>

        <div className="bg-slate-700/50 p-3 rounded-lg text-sm">
          <span className="text-slate-400">Pares:</span>
          <span className="text-slate-200 ml-2">{config.pares.length}</span>
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

      {/* Matching Grid */}
      <div className="grid grid-cols-2 gap-6 mb-5">
        {/* Left Column */}
        <div className="space-y-3">
          {config.pares.map((par) => (
            <div
              key={par.id}
              data-testid={`left-item-${par.id}`}
              onClick={() => isInteractive && handleItemClick('left', par.id)}
              className={getItemClasses('left', par.id)}
            >
              {par.izquierda}
            </div>
          ))}
        </div>

        {/* Right Column (shuffled) */}
        <div className="space-y-3">
          {shuffledRightItems.map((par) => (
            <div
              key={par.id}
              data-testid={`right-item-${par.id}`}
              onClick={() => isInteractive && handleItemClick('right', par.id)}
              className={getItemClasses('right', par.id)}
            >
              {par.derecha}
            </div>
          ))}
        </div>
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
            disabled={!isInteractive || state.connections.length === 0}
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

export default MatchingPairs;
