'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * IconButton - Botón cuadrado con ícono, gradiente y glow
 *
 * Extraído del diseño Pencil (portal_estudiante.pen):
 *
 * === BACK BUTTON (Header de Selección de Mundos / Mundos internos) ===
 * size: 40x40, cornerRadius: 12, icon: arrow-left 20x20
 * fill: linear-gradient(180deg, #374151 0%, #1F2937 100%)
 * stroke: #4B5563, thickness: 2
 * shadow: blur 8px #00000060
 * icon color: #9CA3AF
 *
 * === EXPLORE ARROW BUTTON (Explorar Card bottom row) ===
 * size: 44x44, cornerRadius: 22
 * fill: linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)
 * shadow: blur 12px #A78BFA50
 * icon color: #FFFFFF
 */

interface IconButtonProps {
  icon: LucideIcon;
  /** Tamaño del botón en px (default: 40 - extraído del back button) */
  size?: number;
  /** Tamaño del ícono en px (default: 20) */
  iconSize?: number;
  /** Border radius en px (default: 12) */
  borderRadius?: number;
  /** Gradiente CSS para el fondo */
  gradient?: string;
  /** Color sólido de fondo (alternativa) */
  bgColor?: string;
  /** Color del borde */
  borderColor?: string;
  /** Grosor del borde (default: 2) */
  borderWidth?: number;
  /** Color del ícono (default: #9CA3AF - extraído del back icon) */
  iconColor?: string;
  /** Color del glow/shadow */
  glowColor?: string;
  /** Handler de click */
  onClick?: () => void;
  /** Label para accesibilidad */
  ariaLabel?: string;
  className?: string;
}

export function IconButton({
  icon: Icon,
  size = 40,
  iconSize = 20,
  borderRadius = 12,
  gradient = 'linear-gradient(180deg, #374151 0%, #1F2937 100%)',
  bgColor,
  borderColor = '#4B5563',
  borderWidth = 2,
  iconColor = '#9CA3AF',
  glowColor = '#00000060',
  onClick,
  ariaLabel,
  className = '',
}: IconButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        flex items-center justify-center shrink-0
        transition-all duration-200 ease-out
        hover:brightness-125 hover:scale-105
        active:scale-95
        ${className}
      `}
      style={{
        width: size,
        height: size,
        borderRadius,
        background: bgColor ?? gradient,
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: `0 0 8px ${glowColor}`,
      }}
    >
      <Icon size={iconSize} style={{ color: iconColor }} />
    </button>
  );
}
