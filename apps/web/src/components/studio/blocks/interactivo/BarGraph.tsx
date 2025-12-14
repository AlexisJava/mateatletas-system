'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { BarGraphConfig } from './types';
import type { StudioBlockProps } from '../types';

// Paleta de colores por defecto
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

export function BarGraph({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<BarGraphConfig>): ReactElement {
  const [barraSeleccionada, setBarraSeleccionada] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const hasCorrectBar = config.barraCorrectaId !== undefined;

  const isCorrect = useMemo(() => {
    if (!hasCorrectBar || !barraSeleccionada) return false;
    return barraSeleccionada === config.barraCorrectaId;
  }, [barraSeleccionada, config.barraCorrectaId, hasCorrectBar]);

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado;

  // Prepare data with colors
  const chartData = useMemo(() => {
    return config.datos.map((d, index) => ({
      ...d,
      color: d.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));
  }, [config.datos]);

  const handleBarClick = useCallback(
    (data: BarGraphDato | null | undefined) => {
      if (!isInteractive || !hasCorrectBar) return;
      if (data?.id) {
        setBarraSeleccionada(data.id);
        onProgress?.(50);
      }
    },
    [isInteractive, hasCorrectBar, onProgress],
  );

  const handleVerify = useCallback(() => {
    if (!barraSeleccionada) return;

    setVerificado(true);
    setIntentos((prev) => prev + 1);
    onComplete?.({
      completado: true,
      puntuacion: isCorrect ? 100 : 0,
      respuesta: barraSeleccionada,
      tiempoMs: 0,
      intentos: intentos + 1,
    });
  }, [barraSeleccionada, isCorrect, onComplete, intentos]);

  const handleRetry = useCallback(() => {
    setVerificado(false);
    setBarraSeleccionada(null);
  }, []);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - BarGraph
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        {config.titulo && <p className="text-slate-400 text-sm mt-1">{config.titulo}</p>}
        <div className="mt-2 text-slate-400 text-sm">
          Barras: {config.datos.length}
          {hasCorrectBar && ` | Respuesta: ${config.barraCorrectaId}`}
          {config.orientacion && ` | ${config.orientacion}`}
        </div>
      </div>
    );
  }

  const showVerifyButton =
    modo === 'estudiante' && hasCorrectBar && !verificado && barraSeleccionada;
  const showRetryButton = verificado && !isCorrect && !maxAttemptsReached;

  return (
    <div className="relative" data-testid={`bar-graph-${id}`}>
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{config.instruccion}</h2>
        {config.descripcion && <p className="text-sm text-slate-400 mt-1">{config.descripcion}</p>}
      </div>

      {/* Title */}
      {config.titulo && (
        <h3 className="text-center text-white font-medium mb-4">{config.titulo}</h3>
      )}

      {/* Question for interactive mode */}
      {config.pregunta && (
        <div className="mb-4 p-3 bg-slate-800 rounded-lg">
          <p className="text-white">{config.pregunta}</p>
        </div>
      )}

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout={config.orientacion === 'horizontal' ? 'vertical' : 'horizontal'}
          >
            <XAxis
              dataKey={config.orientacion === 'horizontal' ? 'valor' : 'label'}
              type={config.orientacion === 'horizontal' ? 'number' : 'category'}
              label={
                config.ejeX
                  ? { value: config.ejeX, position: 'bottom', fill: '#94a3b8' }
                  : undefined
              }
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis
              dataKey={config.orientacion === 'horizontal' ? 'label' : 'valor'}
              type={config.orientacion === 'horizontal' ? 'category' : 'number'}
              label={
                config.ejeY
                  ? { value: config.ejeY, angle: -90, position: 'insideLeft', fill: '#94a3b8' }
                  : undefined
              }
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-800 border border-slate-600 rounded px-3 py-2">
                    <p className="text-white font-medium">{data.label}</p>
                    <p className="text-slate-300">Valor: {data.valor}</p>
                  </div>
                );
              }}
            />
            <Legend formatter={(value) => <span className="text-slate-300">{value}</span>} />
            <Bar
              dataKey="valor"
              onClick={hasCorrectBar ? handleBarClick : undefined}
              style={{ cursor: hasCorrectBar && isInteractive ? 'pointer' : 'default' }}
              label={config.mostrarValores ? { position: 'top', fill: '#94a3b8' } : false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={barraSeleccionada === entry.id ? '#fff' : 'transparent'}
                  strokeWidth={barraSeleccionada === entry.id ? 2 : 0}
                  opacity={
                    verificado
                      ? entry.id === config.barraCorrectaId
                        ? 1
                        : 0.5
                      : barraSeleccionada && barraSeleccionada !== entry.id
                        ? 0.6
                        : 1
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selected bar info */}
      {barraSeleccionada && !verificado && (
        <div className="mt-4 p-3 bg-slate-800 rounded-lg text-center">
          <p className="text-white">
            Seleccionado:{' '}
            <span className="font-medium">
              {chartData.find((d) => d.id === barraSeleccionada)?.label}
            </span>
          </p>
        </div>
      )}

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
      {modo === 'estudiante' && hasCorrectBar && (
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
