'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * GlowBadge - Badge pill con ícono + texto + glow effect
 *
 * Extraído del Top Bar del Main Menu (portal_estudiante.pen):
 * - Streak badge: red (#EF4444), flame icon, padding [6,14], cornerRadius 20
 * - XP badge: purple (#A78BFA), zap icon
 * - Coins badge: gold (#FFD700), coins icon
 * - Club STEAM badge: gold (#FFD700), bg #FFD70020, border #FFD70050
 *
 * Todos comparten: Inter font, fontSize 14, fontWeight 700, gap 6
 */

type GlowBadgeVariant = 'streak' | 'xp' | 'coins' | 'club' | 'live' | 'custom';

interface GlowBadgeProps {
  variant?: GlowBadgeVariant;
  icon?: LucideIcon;
  text: string;
  /** Color principal - se usa para texto, ícono, glow, borde y fondo (con opacidad) */
  color?: string;
  /** Override de className para el contenedor */
  className?: string;
}

/**
 * Colores extraídos del diseño Pencil (portal_estudiante.pen - Top Bar)
 *
 * Cada badge tiene:
 * - fill: {color}18 (fondo con ~9% opacidad)
 * - stroke: {color}60 (borde con ~37% opacidad)
 * - effect: blur 10px, {color}30 (shadow con ~19% opacidad)
 * - text/icon: {color} sólido
 */
const VARIANT_COLORS: Record<Exclude<GlowBadgeVariant, 'custom'>, string> = {
  streak: '#EF4444',
  xp: '#A78BFA',
  coins: '#FFD700',
  club: '#FFD700',
  live: '#EF4444',
};

export function GlowBadge({
  variant = 'custom',
  icon: Icon,
  text,
  color,
  className = '',
}: GlowBadgeProps): React.JSX.Element {
  const baseColor = color ?? (variant !== 'custom' ? VARIANT_COLORS[variant] : '#FFFFFF');

  /**
   * Estilos extraídos exactos del diseño Pencil:
   * - cornerRadius: 20 (club badge usa 10)
   * - padding: [6, 14] para badges regulares, [5, 12] para club
   * - gap: 6
   * - font: Inter, 14px, weight 700
   * - icon: 16x16
   * - bg: {color}18
   * - border: 1px solid {color}60
   * - shadow: 0 0 10px {color}30
   */
  const isClub = variant === 'club';

  return (
    <div
      className={`
        inline-flex items-center
        ${isClub ? 'gap-0 rounded-[10px] px-3 py-[5px]' : 'gap-1.5 rounded-[20px] px-3.5 py-1.5'}
        font-[Inter] text-[14px] font-bold
        ${className}
      `}
      style={{
        backgroundColor: `${baseColor}18`,
        border: `1px solid ${baseColor}60`,
        boxShadow: `0 0 10px ${baseColor}30`,
        color: baseColor,
      }}
    >
      {Icon && (
        <Icon
          size={16}
          style={{
            color: baseColor,
            filter: `drop-shadow(0 0 8px ${baseColor})`,
          }}
        />
      )}
      <span>{text}</span>
    </div>
  );
}
