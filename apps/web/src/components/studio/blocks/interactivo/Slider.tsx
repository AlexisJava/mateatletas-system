'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import type { SliderConfig } from './types';
import type { StudioBlockProps } from '../types';

function isValueCorrect(value: number, config: SliderConfig): boolean {
  if (config.valorCorrecto === undefined) return true;
  const tolerance = config.tolerancia ?? 0;
  return Math.abs(value - config.valorCorrecto) <= tolerance;
}

function calculateCorrectPosition(config: SliderConfig): number {
  if (config.valorCorrecto === undefined) return 0;
  return ((config.valorCorrecto - config.min) / (config.max - config.min)) * 100;
}

export function Slider({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<SliderConfig>): ReactElement {
  const [valorActual, setValorActual] = useState(config.valorInicial);
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const hasCorrectValue = config.valorCorrecto !== undefined;
  const isCorrect = useMemo(() => isValueCorrect(valorActual, config), [valorActual, config]);

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;
  const shouldShowCorrectAnswer =
    config.mostrarRespuestaTras !== undefined &&
    intentos >= config.mostrarRespuestaTras &&
    !isCorrect;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isInteractive) return;
      const newValue = Number(e.target.value);
      setValorActual(newValue);
      // Reportar progreso como porcentaje
      const progressPercent = ((newValue - config.min) / (config.max - config.min)) * 100;
      onProgress?.(progressPercent);
    },
    [isInteractive, onProgress, config.min, config.max],
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

  const formatValue = (value: number): string => {
    return config.unidad ? `${value} ${config.unidad}` : String(value);
  };

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - Slider
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm">
          Rango: {config.min} - {config.max} {config.unidad}
          {hasCorrectValue && ` | Valor correcto: ${config.valorCorrecto}`}
        </div>
      </div>
    );
  }

  const showVerifyButton = modo === 'estudiante' && hasCorrectValue && !verificado;
  const showRetryButton = verificado && !isCorrect && !maxAttemptsReached;

  return (
    <div className="relative" data-testid={`slider-${id}`}>
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{config.instruccion}</h2>
      </div>

      {/* Attempts counter */}
      {config.intentosMaximos !== undefined && (
        <div className="text-sm text-slate-400 mb-2">
          Intento {intentos} de {config.intentosMaximos}
        </div>
      )}

      {/* Current value display */}
      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-white">{formatValue(valorActual)}</span>
      </div>

      {/* Slider container */}
      <div className="relative px-2 mb-4">
        {/* Markers */}
        {config.marcadores && (
          <div className="relative h-6 mb-2">
            {config.marcadores.map((marker) => {
              const position = ((marker.valor - config.min) / (config.max - config.min)) * 100;
              return (
                <div
                  key={marker.valor}
                  className="absolute transform -translate-x-1/2 text-xs text-slate-400"
                  style={{ left: `${position}%` }}
                >
                  {marker.etiqueta}
                </div>
              );
            })}
          </div>
        )}

        {/* Slider input */}
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.paso}
          value={valorActual}
          onChange={handleChange}
          disabled={disabled || verificado}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:bg-blue-400
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-blue-500
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Correct value indicator (shown after verification) */}
        {verificado && hasCorrectValue && !isCorrect && (
          <div
            data-testid="correct-value-indicator"
            className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            style={{ left: `calc(${calculateCorrectPosition(config)}% - 6px)` }}
            title={`Valor correcto: ${config.valorCorrecto}`}
          />
        )}

        {/* Min/Max labels */}
        <div className="flex justify-between mt-2 text-sm text-slate-400">
          <span>{config.min}</span>
          <span>{config.max}</span>
        </div>
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
            La respuesta correcta es: {formatValue(config.valorCorrecto!)}
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
