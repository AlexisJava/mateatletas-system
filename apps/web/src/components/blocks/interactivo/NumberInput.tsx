'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import type { NumberInputConfig } from './types';
import type { StudioBlockProps } from '../types';

export function NumberInput({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<NumberInputConfig>): ReactElement {
  const [valorActual, setValorActual] = useState<number | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const hasCorrectValue = config.valorCorrecto !== undefined;
  const tolerancia = config.tolerancia ?? 0;

  const isCorrect = useMemo(() => {
    if (!hasCorrectValue || valorActual === null) return false;
    return Math.abs(valorActual - config.valorCorrecto!) <= tolerancia;
  }, [valorActual, config.valorCorrecto, hasCorrectValue, tolerancia]);

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;
  const shouldShowCorrectAnswer =
    config.mostrarRespuestaTras !== undefined &&
    intentos >= config.mostrarRespuestaTras &&
    !isCorrect;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado;
  const isDisabled = disabled || verificado || maxAttemptsReached;

  // Calculate step based on decimales
  const step = useMemo(() => {
    if (config.decimales === undefined || config.decimales === 0) return '1';
    return (1 / Math.pow(10, config.decimales)).toString();
  }, [config.decimales]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isInteractive) return;
      setError(null);

      const value = e.target.value;
      if (value === '') {
        setValorActual(null);
        return;
      }

      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setValorActual(numValue);
        // Reportar progreso como porcentaje del rango
        const progressPercent = ((numValue - config.min) / (config.max - config.min)) * 100;
        onProgress?.(Math.max(0, Math.min(100, progressPercent)));
      }
    },
    [isInteractive, onProgress, config.min, config.max],
  );

  const validateValue = useCallback((): boolean => {
    if (valorActual === null) {
      setError('Ingresa un valor');
      return false;
    }
    if (valorActual < config.min || valorActual > config.max) {
      setError(`El valor debe estar entre ${config.min} y ${config.max}`);
      return false;
    }
    return true;
  }, [valorActual, config.min, config.max]);

  const handleVerify = useCallback(() => {
    if (!validateValue()) return;

    setVerificado(true);
    setIntentos((prev) => prev + 1);
    onComplete?.({
      completado: true,
      puntuacion: isCorrect ? 100 : 0,
      respuesta: valorActual,
      tiempoMs: 0,
      intentos: intentos + 1,
    });
  }, [validateValue, isCorrect, valorActual, onComplete, intentos]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isDisabled && hasCorrectValue) {
        e.preventDefault();
        handleVerify();
      }
    },
    [isDisabled, hasCorrectValue, handleVerify],
  );

  const handleRetry = useCallback(() => {
    setVerificado(false);
    setValorActual(null);
    setError(null);
  }, []);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - NumberInput
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm">
          Label: {config.label} | Rango: {config.min} - {config.max}
          {hasCorrectValue && ` | Valor correcto: ${config.valorCorrecto}`}
          {config.unidad && ` ${config.unidad}`}
        </div>
      </div>
    );
  }

  const showVerifyButton = modo === 'estudiante' && hasCorrectValue && !verificado;
  const showRetryButton = verificado && !isCorrect && !maxAttemptsReached;

  const getInputClass = (): string => {
    let baseClass =
      'w-full px-4 py-3 rounded-lg bg-slate-800 border-2 text-white text-lg font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200';

    if (isDisabled) {
      baseClass += ' opacity-50 cursor-not-allowed';
    }

    if (verificado) {
      if (isCorrect) {
        baseClass += ' border-green-500 bg-green-900/20';
      } else {
        baseClass += ' border-red-500 bg-red-900/20';
      }
    } else if (error) {
      baseClass += ' border-red-500';
    } else {
      baseClass += ' border-slate-600 hover:border-slate-500';
    }

    return baseClass;
  };

  return (
    <div className="relative" data-testid={`number-input-${id}`}>
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

      {/* Label */}
      <div className="mb-2">
        <label className="text-white font-medium">{config.label}</label>
      </div>

      {/* Input with unit */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <input
            type="number"
            value={valorActual ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            min={config.min}
            max={config.max}
            step={step}
            placeholder={config.placeholder}
            aria-label={config.label}
            className={getInputClass()}
          />
        </div>
        {config.unidad && (
          <span className="text-lg font-medium text-slate-300">{config.unidad}</span>
        )}
      </div>

      {/* Validation Error */}
      {error && (
        <div className="p-3 rounded-lg mb-4 bg-red-900/30 border border-red-700">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Feedback */}
      {verificado && config.feedback && !error && (
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
            La respuesta correcta es: {config.valorCorrecto}
            {config.unidad && ` ${config.unidad}`}
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
