/**
 * ProgressTracker - Barra de progreso para actividades
 */

'use client';

import type { ProgressTrackerProps } from '../types/index';

export function ProgressTracker({
  progreso,
  label = 'Progreso',
  className = '',
}: ProgressTrackerProps) {
  const progresoLimitado = Math.min(100, Math.max(0, progreso));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-sm font-bold text-purple-600">{progresoLimitado}%</span>
        </div>
      )}

      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-500 ease-out relative"
          style={{ width: `${progresoLimitado}%` }}
        >
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
