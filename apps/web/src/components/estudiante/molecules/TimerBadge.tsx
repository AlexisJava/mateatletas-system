'use client';

import { Timer } from 'lucide-react';

/**
 * TimerBadge - Contador de tiempo con ícono y borde de color
 *
 * Extraído de "13. Clase en Vivo" Top Bar (portal_estudiante.pen):
 *
 * - cornerRadius: 12
 * - fill: #1E1B4B (surface oscuro)
 * - padding: [6, 12]
 * - gap: 6
 * - stroke: #60A5FA (azul), thickness 2
 * - Timer icon: lucide "timer", 14x14, fill #60A5FA
 * - Text: Inter 13px weight 700, fill #60A5FA
 */

interface TimerBadgeProps {
  /** Tiempo formateado (e.g., "23:45") */
  time: string;
  /** Color del badge (default: #60A5FA azul) */
  color?: string;
  className?: string;
}

export function TimerBadge({
  time,
  color = '#60A5FA',
  className = '',
}: TimerBadgeProps): React.JSX.Element {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${className}`}
      style={{
        backgroundColor: '#1E1B4B',
        border: `2px solid ${color}`,
      }}
    >
      <Timer size={14} style={{ color }} />
      <span
        className="font-[Inter]"
        style={{
          fontSize: 13,
          fontWeight: 700,
          color,
        }}
      >
        {time}
      </span>
    </div>
  );
}
