'use client';

import React, { ReactElement, useMemo, useEffect } from 'react';
import type { ProgressTrackerConfig } from './types';
import type { StudioBlockProps } from '../types';

export function ProgressTracker({
  id,
  config,
  modo,
  onProgress,
}: StudioBlockProps<ProgressTrackerConfig>): ReactElement {
  const { pasos, orientacion = 'horizontal', modoCompacto = false } = config;

  // Calculate progress
  const { porcentaje, completados, total } = useMemo(() => {
    const completadosCount = pasos.filter((p) => p.completado).length;
    const totalCount = pasos.length;
    const pct = totalCount > 0 ? Math.round((completadosCount / totalCount) * 100) : 0;
    return { porcentaje: pct, completados: completadosCount, total: totalCount };
  }, [pasos]);

  // Call onProgress on mount with current percentage
  useEffect(() => {
    onProgress?.(porcentaje);
  }, [onProgress, porcentaje]);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - ProgressTracker
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm">
          <span>{total} pasos</span>
        </div>
      </div>
    );
  }

  const containerClasses = `
    relative
    ${orientacion === 'horizontal' ? 'horizontal' : 'vertical'}
    ${modoCompacto ? 'compact' : ''}
  `;

  return (
    <div className={containerClasses.trim()} data-testid={`progress-tracker-${id}`}>
      {/* Title and instruction */}
      {config.titulo && <h2 className="text-lg font-semibold text-white mb-1">{config.titulo}</h2>}
      <p className="text-slate-300 mb-2">{config.instruccion}</p>
      {config.descripcion && <p className="text-sm text-slate-400 mb-4">{config.descripcion}</p>}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">
            {completados} de {total}
          </span>
          <span className="text-sm font-medium text-white">{porcentaje}%</span>
        </div>
        <div
          data-testid="progress-bar"
          className="w-full h-3 bg-slate-700 rounded-full overflow-hidden"
        >
          <div
            data-testid="progress-fill"
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Steps list (hidden in compact mode) */}
      {!modoCompacto && (
        <div
          className={`
            ${orientacion === 'horizontal' ? 'flex flex-row gap-4 overflow-x-auto' : 'flex flex-col gap-3'}
          `}
        >
          {pasos.map((paso) => {
            const isCurrent = config.pasoActual === paso.id;
            const stepClasses = `
              flex items-center gap-2 p-3 rounded-lg
              ${paso.completado ? 'completed bg-green-900/20 border border-green-700' : 'bg-slate-800 border border-slate-600'}
              ${isCurrent ? 'current ring-2 ring-blue-500' : ''}
              ${orientacion === 'horizontal' ? 'min-w-[150px]' : ''}
            `;

            return (
              <div key={paso.id} data-testid={`step-${paso.id}`} className={stepClasses.trim()}>
                {/* Checkmark or number */}
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium
                    ${paso.completado ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-300'}
                  `}
                >
                  {paso.completado ? '✓' : pasos.indexOf(paso) + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{paso.titulo}</div>
                  {paso.descripcion && (
                    <div className="text-slate-400 text-xs mt-1">{paso.descripcion}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
