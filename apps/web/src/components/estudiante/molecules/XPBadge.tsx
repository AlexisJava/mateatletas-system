'use client';

import { Zap } from 'lucide-react';

/**
 * XPBadge - Badge de puntos/XP con gradiente dorado
 *
 * Extraído de "13. Clase en Vivo" Top Bar (portal_estudiante.pen):
 *
 * - cornerRadius: 12
 * - fill: linear-gradient(180deg, #FBBF24 0%, #D97706 100%)
 * - padding: [6, 12]
 * - gap: 6
 * - stroke: #000000, thickness 2
 * - Zap icon: lucide "zap", 14x14, fill #000000
 * - Text: Inter 13px weight 800, fill #000000
 *
 * Nota: A diferencia de GlowBadge (que es outline/transparent),
 * XPBadge tiene fondo gradiente sólido con texto oscuro.
 */

interface XPBadgeProps {
  /** Texto de puntos (e.g., "+120", "2,450") */
  text: string;
  /** Gradiente CSS del fondo (default: amber gradient del diseño) */
  gradient?: string;
  /** Color del texto e ícono (default: #000000) */
  textColor?: string;
  /** Color del borde (default: #000000) */
  borderColor?: string;
  className?: string;
}

export function XPBadge({
  text,
  gradient = 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
  textColor = '#000000',
  borderColor = '#000000',
  className = '',
}: XPBadgeProps): React.JSX.Element {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${className}`}
      style={{
        background: gradient,
        border: `2px solid ${borderColor}`,
      }}
    >
      <Zap size={14} style={{ color: textColor }} />
      <span
        className="font-[Inter]"
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: textColor,
        }}
      >
        {text}
      </span>
    </div>
  );
}
