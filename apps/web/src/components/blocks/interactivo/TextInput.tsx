'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import type { TextInputConfig } from './types';
import type { StudioBlockProps } from '../types';

export function TextInput({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<TextInputConfig>): ReactElement {
  const [valorActual, setValorActual] = useState<string>('');
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const hasCorrectAnswer = config.respuestaCorrecta !== undefined;
  const caseSensitive = config.caseSensitive ?? false;

  // Check if value matches correct answer or alternatives
  const isCorrect = useMemo(() => {
    if (!hasCorrectAnswer) return false;
    const trimmedValue = valorActual.trim();
    if (!trimmedValue) return false;

    const compareValue = caseSensitive ? trimmedValue : trimmedValue.toLowerCase();
    const correctValue = caseSensitive
      ? config.respuestaCorrecta!
      : config.respuestaCorrecta!.toLowerCase();

    if (compareValue === correctValue) return true;

    // Check alternatives
    if (config.respuestasAlternativas) {
      return config.respuestasAlternativas.some((alt) => {
        const altValue = caseSensitive ? alt : alt.toLowerCase();
        return compareValue === altValue;
      });
    }

    return false;
  }, [
    valorActual,
    config.respuestaCorrecta,
    config.respuestasAlternativas,
    hasCorrectAnswer,
    caseSensitive,
  ]);

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;
  const shouldShowCorrectAnswer =
    config.mostrarRespuestaTras !== undefined &&
    intentos >= config.mostrarRespuestaTras &&
    !isCorrect;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado;
  const isDisabled = disabled || verificado || maxAttemptsReached;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!isInteractive) return;
      setError(null);

      const value = e.target.value;
      setValorActual(value);

      // Report progress based on input length
      if (config.maxLength) {
        const progressPercent = (value.length / config.maxLength) * 100;
        onProgress?.(Math.min(100, progressPercent));
      } else {
        // If no maxLength, report 50% when there's any text
        onProgress?.(value.length > 0 ? 50 : 0);
      }
    },
    [isInteractive, onProgress, config.maxLength],
  );

  const validateValue = useCallback((): boolean => {
    const trimmedValue = valorActual.trim();

    if (!trimmedValue) {
      setError('Ingresa una respuesta');
      return false;
    }

    // Validate against pattern if provided
    if (config.patron) {
      const regex = new RegExp(config.patron);
      if (!regex.test(trimmedValue)) {
        setError(config.mensajePatron || 'El formato no es válido');
        return false;
      }
    }

    return true;
  }, [valorActual, config.patron, config.mensajePatron]);

  const handleVerify = useCallback(() => {
    if (!validateValue()) return;

    setVerificado(true);
    setIntentos((prev) => prev + 1);
    onComplete?.({
      completado: true,
      puntuacion: isCorrect ? 100 : 0,
      respuesta: valorActual.trim(),
      tiempoMs: 0,
      intentos: intentos + 1,
    });
  }, [validateValue, isCorrect, valorActual, onComplete, intentos]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Don't submit on Enter in multiline mode
      if (config.multiline) return;

      if (e.key === 'Enter' && !isDisabled && hasCorrectAnswer) {
        e.preventDefault();
        handleVerify();
      }
    },
    [isDisabled, hasCorrectAnswer, handleVerify, config.multiline],
  );

  const handleBlur = useCallback(() => {
    // In free mode (no correct answer), complete on blur
    if (!hasCorrectAnswer && valorActual.trim()) {
      onComplete?.({
        completado: true,
        puntuacion: 100, // Free mode always "completes"
        respuesta: valorActual.trim(),
        tiempoMs: 0,
        intentos: 1,
      });
    }
  }, [hasCorrectAnswer, valorActual, onComplete]);

  const handleRetry = useCallback(() => {
    setVerificado(false);
    setValorActual('');
    setError(null);
  }, []);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - TextInput
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm">
          Label: {config.label}
          {hasCorrectAnswer && ` | Respuesta: ${config.respuestaCorrecta}`}
          {config.multiline && ' | Multilínea'}
        </div>
      </div>
    );
  }

  const showVerifyButton = modo === 'estudiante' && hasCorrectAnswer && !verificado;
  const showRetryButton = verificado && !isCorrect && !maxAttemptsReached;

  const getInputClass = (): string => {
    let baseClass =
      'w-full px-4 py-3 rounded-lg bg-slate-800 border-2 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200';

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

  const inputProps = {
    value: valorActual,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    disabled: isDisabled,
    placeholder: config.placeholder,
    maxLength: config.maxLength,
    'aria-label': config.label,
    className: getInputClass(),
  };

  return (
    <div className="relative" data-testid={`text-input-${id}`}>
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

      {/* Input */}
      <div className="mb-4">
        {config.multiline ? (
          <textarea {...inputProps} rows={config.rows || 4} />
        ) : (
          <input type="text" {...inputProps} />
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
            La respuesta correcta es: {config.respuestaCorrecta}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {modo === 'estudiante' && hasCorrectAnswer && (
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
