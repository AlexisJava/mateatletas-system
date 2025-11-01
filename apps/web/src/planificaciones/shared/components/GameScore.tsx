/**
 * GameScore - Componente para mostrar puntaje del juego
 */

'use client';

import type { GameScoreProps } from '../types/index';

export function GameScore({ puntos, className = '' }: GameScoreProps) {
  return (
    <div className={`inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-full shadow-lg ${className}`}>
      <span className="text-2xl">⭐</span>
      <span className="text-xl">{puntos.toLocaleString()}</span>
      <span className="text-sm">puntos</span>
    </div>
  );
}
