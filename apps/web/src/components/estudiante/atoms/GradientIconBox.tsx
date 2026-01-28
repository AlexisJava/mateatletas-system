'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * GradientIconBox - Contenedor de ícono con gradiente, glow y borde
 *
 * Extraído del diseño Pencil (portal_estudiante.pen):
 *
 * === LOGO (Top Bar - Logo Icon) ===
 * size: 44x44, cornerRadius: 14, icon: trophy 24x24
 * fill: linear-gradient(145deg, #FDE68A 0%, #FFD700 30%, #F59E0B 70%, #D97706 100%)
 * stroke: #FFFFFF30, thickness: 1
 * shadow: blur 16px #FFD700CC, blur 32px #F59E0B60
 *
 * === CARD ICONS (Main Grid - explorarIcon, arcadeIcon, etc.) ===
 * size: 72x72 (explorar) / 52x52 (others), cornerRadius: 20/14
 * icon size: 36/28
 * Each has unique gradient from light to dark of its accent color
 * stroke: #FFFFFF30/#FFFFFF25, thickness: 1
 * shadow: blur 20px {color}DD, blur 40px {color}80
 *
 * === MINI ICONS (Explorar Card bottom row) ===
 * size: 40x40, cornerRadius: 12, icon: 20x20
 * fill: {color}25, stroke: {color}40, thickness: 1
 *
 * === WORLD ICON (Selección de Mundos - Icon Container) ===
 * size: 110x110 / 180x180, cornerRadius: 55/100
 * Radial gradient, stroke: solid accent, thickness: 4
 * shadow: blur 24px {color}80, blur 20px #00000040
 */

type GradientIconBoxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface GradientIconBoxProps {
  icon: LucideIcon;
  /** Tamaño predefinido extraído del diseño */
  size?: GradientIconBoxSize;
  /** Gradiente CSS para el fondo (override) */
  gradient?: string;
  /** Color sólido de fondo (alternativa al gradiente, se le aplica opacidad para mini icons) */
  bgColor?: string;
  /** Color del borde */
  borderColor?: string;
  /** Grosor del borde en px */
  borderWidth?: number;
  /** Color del glow principal */
  glowColor?: string;
  /** Radio del borde en px (override) */
  borderRadius?: number;
  /** Color del ícono */
  iconColor?: string;
  className?: string;
}

/**
 * Mapeo de tamaños extraído exactamente del diseño Pencil:
 *
 * xs (40x40): Mini world icons en Explorar Card bottom row
 * sm (44x44): Logo icon en Top Bar
 * md (52x52): Card icons (arcade, progreso, clase, continuar)
 * lg (72x72): Explorar Mundos card icon
 * xl (110x110): World portal card icon (Selección de Mundos)
 * 2xl (180x180): Hover card center icon (Selección Hover)
 */
const SIZE_CONFIG: Record<
  GradientIconBoxSize,
  {
    box: number;
    icon: number;
    radius: number;
  }
> = {
  xs: { box: 40, icon: 20, radius: 12 },
  sm: { box: 44, icon: 24, radius: 14 },
  md: { box: 52, icon: 28, radius: 14 },
  lg: { box: 72, icon: 36, radius: 20 },
  xl: { box: 110, icon: 52, radius: 55 },
  '2xl': { box: 180, icon: 80, radius: 100 },
};

export function GradientIconBox({
  icon: Icon,
  size = 'md',
  gradient,
  bgColor,
  borderColor = '#FFFFFF30',
  borderWidth = 1,
  glowColor,
  borderRadius,
  iconColor = '#FFFFFF',
  className = '',
}: GradientIconBoxProps): React.JSX.Element {
  const config = SIZE_CONFIG[size];
  const finalRadius = borderRadius ?? config.radius;

  const backgroundStyle = gradient
    ? { background: gradient }
    : bgColor
      ? { backgroundColor: bgColor }
      : {};

  const shadowStyle = glowColor
    ? {
        boxShadow: [
          `0 0 ${config.box * 0.3}px ${glowColor}`,
          `0 0 ${config.box * 0.6}px ${glowColor}60`,
        ].join(', '),
      }
    : {};

  return (
    <div
      className={`flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: config.box,
        height: config.box,
        borderRadius: finalRadius,
        border: `${borderWidth}px solid ${borderColor}`,
        ...backgroundStyle,
        ...shadowStyle,
      }}
    >
      <Icon
        size={config.icon}
        style={{
          color: iconColor,
          filter: glowColor ? `drop-shadow(0 0 8px ${glowColor}60)` : undefined,
        }}
      />
    </div>
  );
}
