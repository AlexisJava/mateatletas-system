'use client';

import type { LucideIcon } from 'lucide-react';
import { Users, Clock } from 'lucide-react';

/**
 * FeaturedGameCard - Card de juego destacado (portal_estudiante.pen)
 *
 * Extraído de "10. Pantalla de Juegos" → featuredGames (SvjTa, HyWyB, Gu7U8):
 *
 * Card container:
 * - width: fill_container, height: 200
 * - cornerRadius: 20
 * - fill: linear-gradient(135deg, themed 2-stop)
 * - padding: 20
 * - layout: vertical, justifyContent: space_between
 * - effect: shadow blur 24, offset y:8, themed color
 *
 * Top row (justify-between):
 * - Badge: cornerRadius 12, fill #FFFFFF20, padding [6,10]
 *   - icon 14x14, text Nunito 11px/700, both white
 * - Icon container: 56x56, cornerRadius 16, fill #FFFFFF20, icon 28x28 white
 *
 * Bottom section (gap 8):
 * - Title: Nunito 20px/800 white
 * - Description: Nunito 13px/normal #FFFFFFCC
 * - Stats row (gap 12): players online, best time
 */

interface GameStat {
  icon: LucideIcon;
  text: string;
}

interface FeaturedGameCardProps {
  /** Game icon */
  icon: LucideIcon;
  /** Game title */
  title: string;
  /** Game description */
  description: string;
  /** Badge text (e.g., "Multiplayer", "Popular") */
  badgeText: string;
  /** Badge icon */
  badgeIcon: LucideIcon;
  /** Theme gradient (2 stops) */
  gradient: string;
  /** Shadow glow color */
  glowColor: string;
  /** Stats (players online, best time, etc.) */
  stats?: GameStat[];
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

export function FeaturedGameCard({
  icon: Icon,
  title,
  description,
  badgeText,
  badgeIcon: BadgeIcon,
  gradient,
  glowColor,
  stats = [],
  onClick,
  className = '',
}: FeaturedGameCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col justify-between w-full text-left ${className}`}
      style={{
        height: 200,
        borderRadius: 20,
        background: `linear-gradient(135deg, ${gradient})`,
        padding: 20,
        boxShadow: `0 8px 24px ${glowColor}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between w-full">
        {/* Badge */}
        <div
          className="flex items-center gap-1"
          style={{
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.13)',
            padding: '6px 10px',
          }}
        >
          <BadgeIcon size={14} color="#FFFFFF" />
          <span
            style={{
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            {badgeText}
          </span>
        </div>

        {/* Icon container */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.13)',
          }}
        >
          <Icon size={28} color="#FFFFFF" />
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-2">
        <span
          style={{
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            fontSize: 20,
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          {description}
        </span>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="flex items-center gap-3 mt-1">
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.text} className="flex items-center gap-1">
                  <StatIcon size={12} color="#FFFFFF80" />
                  <span
                    style={{
                      fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {stat.text}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </button>
  );
}

/** Default stats for common game types */
export const DEFAULT_GAME_STATS = {
  multiplayer: [
    { icon: Users, text: '234 online' },
    { icon: Clock, text: '5 min' },
  ],
  singlePlayer: [{ icon: Clock, text: '10 min' }],
} as const;
