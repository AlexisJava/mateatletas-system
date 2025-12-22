'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts';
import type { PieChartConfig } from './types';
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

export function PieChart({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<PieChartConfig>): ReactElement {
  const [segmentoSeleccionado, setSegmentoSeleccionado] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const hasCorrectSegment = config.segmentoCorrectoId !== undefined;

  const isCorrect = useMemo(() => {
    if (!hasCorrectSegment || !segmentoSeleccionado) return false;
    return segmentoSeleccionado === config.segmentoCorrectoId;
  }, [segmentoSeleccionado, config.segmentoCorrectoId, hasCorrectSegment]);

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado;

  // Prepare data with colors and percentages
  const chartData = useMemo(() => {
    const total = config.datos.reduce((sum, d) => sum + d.valor, 0);
    return config.datos.map((d, index) => ({
      ...d,
      color: d.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      porcentaje: total > 0 ? ((d.valor / total) * 100).toFixed(1) : '0',
    }));
  }, [config.datos]);

  const handleSegmentClick = useCallback(
    (data: { id: string }) => {
      if (!isInteractive || !hasCorrectSegment) return;

      setSegmentoSeleccionado(data.id);
      onProgress?.(50); // Progreso parcial al seleccionar
    },
    [isInteractive, hasCorrectSegment, onProgress],
  );

  const handleVerify = useCallback(() => {
    if (!segmentoSeleccionado) return;

    setVerificado(true);
    setIntentos((prev) => prev + 1);
    onComplete?.({
      completado: true,
      puntuacion: isCorrect ? 100 : 0,
      respuesta: segmentoSeleccionado,
      tiempoMs: 0,
      intentos: intentos + 1,
    });
  }, [segmentoSeleccionado, isCorrect, onComplete, intentos]);

  const handleRetry = useCallback(() => {
    setVerificado(false);
    setSegmentoSeleccionado(null);
  }, []);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - PieChart
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        {config.titulo && <p className="text-slate-400 text-sm mt-1">{config.titulo}</p>}
        <div className="mt-2 text-slate-400 text-sm">
          Segmentos: {config.datos.length}
          {hasCorrectSegment && ` | Respuesta: ${config.segmentoCorrectoId}`}
        </div>
      </div>
    );
  }

  const showVerifyButton =
    modo === 'estudiante' && hasCorrectSegment && !verificado && segmentoSeleccionado;
  const showRetryButton = verificado && !isCorrect && !maxAttemptsReached;

  return (
    <div className="relative" data-testid={`pie-chart-${id}`}>
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

      {/* Percentage info */}
      {config.mostrarPorcentaje && (
        <p className="text-sm text-slate-400 text-center mb-2">
          Haz clic en un segmento para ver el porcentaje
        </p>
      )}

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={chartData}
              dataKey="valor"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              onClick={hasCorrectSegment ? handleSegmentClick : undefined}
              style={{ cursor: hasCorrectSegment && isInteractive ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={segmentoSeleccionado === entry.id ? '#fff' : 'transparent'}
                  strokeWidth={segmentoSeleccionado === entry.id ? 3 : 0}
                  opacity={
                    verificado
                      ? entry.id === config.segmentoCorrectoId
                        ? 1
                        : 0.5
                      : segmentoSeleccionado && segmentoSeleccionado !== entry.id
                        ? 0.6
                        : 1
                  }
                />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-800 border border-slate-600 rounded px-3 py-2">
                    <p className="text-white font-medium">{data.label}</p>
                    <p className="text-slate-300">
                      Valor: {data.valor}
                      {config.mostrarPorcentaje && ` (${data.porcentaje}%)`}
                    </p>
                  </div>
                );
              }}
            />
            {config.mostrarLeyenda && (
              <Legend
                verticalAlign="bottom"
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      {/* Selected segment info */}
      {segmentoSeleccionado && !verificado && (
        <div className="mt-4 p-3 bg-slate-800 rounded-lg text-center">
          <p className="text-white">
            Seleccionado:{' '}
            <span className="font-medium">
              {chartData.find((d) => d.id === segmentoSeleccionado)?.label}
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
      {modo === 'estudiante' && hasCorrectSegment && (
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
