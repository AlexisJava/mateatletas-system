/**
 * ActivityTimer - Temporizador para actividades
 */

'use client';

import { useEffect } from 'react';
import type { ActivityTimerProps } from '../types';

export function ActivityTimer({
  tiempoRestante,
  tiempoTotal = 60,
  className = '',
  onTimeout,
}: ActivityTimerProps) {
  const porcentaje = (tiempoRestante / tiempoTotal) * 100;
  const esUrgente = tiempoRestante <= 10;

  useEffect(() => {
    if (tiempoRestante === 0 && onTimeout) {
      onTimeout();
    }
  }, [tiempoRestante, onTimeout]);

  const formatearTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`inline-flex items-center gap-3 ${esUrgente ? 'bg-red-500' : 'bg-blue-500'} text-white font-bold px-6 py-3 rounded-full shadow-lg ${className}`}>
      <span className="text-2xl">⏱️</span>
      <span className="text-xl tabular-nums">{formatearTiempo(tiempoRestante)}</span>

      {/* Barra de progreso circular */}
      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="3"
        />
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeDasharray={`${porcentaje} ${100 - porcentaje}`}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
