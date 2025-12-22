'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import type { ToggleSwitchConfig } from './types';
import type { StudioBlockProps } from '../types';

export function ToggleSwitch({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<ToggleSwitchConfig>): ReactElement {
  const [valorActual, setValorActual] = useState(config.valorInicial);
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const hasCorrectValue = config.valorCorrecto !== undefined;
  const isCorrect = useMemo(
    () => (hasCorrectValue ? valorActual === config.valorCorrecto : true),
    [valorActual, config.valorCorrecto, hasCorrectValue],
  );

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;
  const shouldShowCorrectAnswer =
    config.mostrarRespuestaTras !== undefined &&
    intentos >= config.mostrarRespuestaTras &&
    !isCorrect;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado;
  const isDisabled = disabled || verificado || maxAttemptsReached;

  const labelOff = config.labelOff ?? 'Off';
  const labelOn = config.labelOn ?? 'On';

  const handleToggle = useCallback(() => {
    if (!isInteractive) return;
    const newValue = !valorActual;
    setValorActual(newValue);
    // Reportar progreso: 100 si hay interacción
    onProgress?.(newValue ? 100 : 50);
  }, [isInteractive, valorActual, onProgress]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  const handleVerify = useCallback(() => {
    setVerificado(true);
    setIntentos((prev) => prev + 1);
    onComplete?.({
      completado: true,
      puntuacion: isCorrect ? 100 : 0,
      respuesta: valorActual,
      tiempoMs: 0,
      intentos: intentos + 1,
    });
  }, [isCorrect, valorActual, onComplete, intentos]);

  const handleRetry = useCallback(() => {
    setVerificado(false);
    setValorActual(config.valorInicial);
  }, [config.valorInicial]);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - ToggleSwitch
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm">
          Label: {config.label}
          {hasCorrectValue && ` | Valor correcto: ${config.valorCorrecto ? 'On' : 'Off'}`}
        </div>
      </div>
    );
  }

  const showVerifyButton = modo === 'estudiante' && hasCorrectValue && !verificado;
  const showRetryButton = verificado && !isCorrect && !maxAttemptsReached;

  const getToggleContainerClass = (): string => {
    let baseClass = 'relative inline-flex items-center cursor-pointer';
    if (verificado) {
      baseClass += isCorrect ? ' correct-toggle' : ' incorrect-toggle';
    }
    return baseClass;
  };

  const getToggleTrackClass = (): string => {
    let baseClass = 'w-14 h-8 rounded-full transition-colors duration-200 ease-in-out';
    if (isDisabled) {
      baseClass += ' opacity-50 cursor-not-allowed';
    }
    if (verificado) {
      baseClass += isCorrect ? ' bg-green-600' : ' bg-red-600';
    } else {
      baseClass += valorActual ? ' bg-blue-600' : ' bg-slate-600';
    }
    return baseClass;
  };

  return (
    <div className="relative" data-testid={`toggle-${id}`}>
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{config.instruccion}</h2>
        {config.descripcion && <p className="text-sm text-slate-400 mt-1">{config.descripcion}</p>}
      </div>

      {/* Attempts counter */}
      {config.intentosMaximos !== undefined && (
        <div className="text-sm text-slate-400 mb-4">
          Intento {intentos} de {config.intentosMaximos}
        </div>
      )}

      {/* Toggle Switch */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className={`text-sm font-medium ${!valorActual ? 'text-white' : 'text-slate-500'}`}>
          {labelOff}
        </span>

        <div className={getToggleContainerClass()}>
          <div
            role="switch"
            tabIndex={isDisabled ? -1 : 0}
            aria-checked={valorActual}
            aria-disabled={isDisabled}
            aria-label={config.label}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className={getToggleTrackClass()}
          >
            <span
              className={`
                absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
                transition-transform duration-200 ease-in-out
                ${valorActual ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </div>
        </div>

        <span className={`text-sm font-medium ${valorActual ? 'text-white' : 'text-slate-500'}`}>
          {labelOn}
        </span>
      </div>

      {/* Label */}
      <div className="text-center mb-4">
        <span className="text-white font-medium">{config.label}</span>
      </div>

      {/* Feedback */}
      {verificado && config.feedback && (
        <div
          className={`
            p-4 rounded-lg mb-4 text-center
            ${isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? config.feedback.correcto : config.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Show correct answer after max attempts */}
      {shouldShowCorrectAnswer && (
        <div
          data-testid="correct-answer-display"
          className="p-4 rounded-lg mb-4 bg-blue-900/30 border border-blue-700 text-center"
        >
          <p className="text-blue-400 font-medium">
            La respuesta correcta es: {config.valorCorrecto ? labelOn : labelOff}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {modo === 'estudiante' && hasCorrectValue && (
        <div className="flex justify-center gap-3">
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
