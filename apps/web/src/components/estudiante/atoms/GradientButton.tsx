'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * GradientButton - Botón CTA con gradiente, glow y borde luminoso
 *
 * Extraído del diseño Pencil (portal_estudiante.pen):
 *
 * === EXPLORE BUTTON (Selección de Mundos - World Portal Cards) ===
 * width: 160, height: 44, cornerRadius: 14
 * text: "EXPLORAR", Inter 13px weight 900, letter-spacing implicit
 * icon: chevron-right 18x18
 * gap: 10
 * Per-world gradients:
 *   Math:    linear-gradient(180deg, #A78BFA → #7C3AED → #5B21B6)
 *   Code:    linear-gradient(180deg, #34D399 → #10B981 → #059669)
 *   Science: linear-gradient(180deg, #FB923C → #F97316 → #EA580C)
 *   Olympics: linear-gradient(180deg, #FFD700 → #FFA500 → #B8860B)
 * stroke: {light variant}, thickness 3
 * shadow: blur 16px {color}60, blur 8px #FFFFFF30 (offset y: -2)
 * text shadow: blur 4px #00000040
 *
 * === COMENZAR AVENTURA (Selección Hover - Center Card) ===
 * width: 240, height: 52, cornerRadius: 29 (pill)
 * text: "Comenzar aventura", Inter 14px weight 700, letter-spacing: 1
 * icon: arrow-right 18x18
 * gap: 10
 * fill: #7C3AED solid
 * stroke: #C4B5FD, thickness: 2
 * shadow: blur 20px #A78BFAAA, blur 40px #7C3AED60 spread 2
 */

interface GradientButtonProps {
  text: string;
  icon?: LucideIcon;
  /** Posición del ícono */
  iconPosition?: 'left' | 'right';
  /** Gradiente CSS para el fondo */
  gradient: string;
  /** Color del borde */
  borderColor: string;
  /** Grosor del borde (default: 3 - Pencil world buttons, 2 for CTA) */
  borderWidth?: number;
  /** Color principal del glow */
  glowColor: string;
  /** Ancho (default: auto) */
  width?: number | string;
  /** Alto (default: 44 - extraído del explore button) */
  height?: number;
  /** Border radius (default: 14 - world buttons, 29 for pill) */
  borderRadius?: number;
  /** Font size en px (default: 13 - world buttons) */
  fontSize?: number;
  /** Font weight (default: 900 - world buttons) */
  fontWeight?: number;
  /** Letter spacing en px */
  letterSpacing?: number;
  /** Handler de click */
  onClick?: () => void;
  className?: string;
}

export function GradientButton({
  text,
  icon: Icon,
  iconPosition = 'right',
  gradient,
  borderColor,
  borderWidth = 3,
  glowColor,
  width,
  height = 44,
  borderRadius = 14,
  fontSize = 13,
  fontWeight = 900,
  letterSpacing,
  onClick,
  className = '',
}: GradientButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        gap-2.5 font-[Inter]
        text-white
        transition-all duration-200 ease-out
        hover:brightness-110 hover:scale-[1.02]
        active:scale-[0.98]
        ${className}
      `}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height,
        borderRadius,
        background: gradient,
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: [`0 0 16px ${glowColor}60`, `0 -2px 8px #FFFFFF30`].join(', '),
        fontSize,
        fontWeight,
        letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
        textShadow: '0 0 4px rgba(0, 0, 0, 0.4)',
      }}
    >
      {Icon && iconPosition === 'left' && <Icon size={18} />}
      <span>{text}</span>
      {Icon && iconPosition === 'right' && <Icon size={18} />}
    </button>
  );
}
