'use client';

import type { LucideIcon } from 'lucide-react';
import { GradientButton } from '../atoms/GradientButton';

/**
 * WorldPortalCard - Card de portal de mundo (portal_estudiante.pen)
 *
 * Extraído de "2. Selección de Mundos" → World Portals:
 *
 * Card container:
 * - width: 220, height: 400
 * - cornerRadius: 24
 * - fill: linear-gradient(180deg, 2-stop dark themed)
 * - stroke: gradient border 4px (3-stop themed)
 * - effect: double shadow (blur 40 spread 4, blur 80)
 * - layout: none (absolute positioning)
 *
 * Vortex Container: 190x150 at (15, 55) - decorative rings
 *
 * Icon Container (center):
 * - 110x110, cornerRadius: 55
 * - fill: radial-gradient (themed, size 1.2x1.2)
 * - stroke: themed 4px
 * - shadow: blur 24 themed, blur 20 #00000040
 * - inner icon: 50x50 white
 * - at (55, 75)
 *
 * Title: Inter 17-20px/900, white, textShadow themed, at y:210
 * Stats: at y:245 - 2 stats with gap 10
 * Badge (optional): at (70-75, 12) - Popular/New/Elite
 * Explore Button: at y:285 - GradientButton themed
 */

interface WorldPortalBadge {
  text: string;
  gradient: string;
  glowColor: string;
}

interface WorldStat {
  icon: LucideIcon;
  text: string;
  color: string;
}

interface WorldPortalCardProps {
  /** World icon */
  icon: LucideIcon;
  /** World name */
  title: string;
  /** Theme colors */
  theme: {
    /** Card background gradient (2 stops) */
    bgGradient: string;
    /** Card border gradient (3 stops) */
    borderGradient: string;
    /** Outer glow primary */
    glowPrimary: string;
    /** Outer glow secondary */
    glowSecondary: string;
    /** Icon container radial gradient */
    iconGradient: string;
    /** Icon border color */
    iconBorder: string;
    /** Icon glow color */
    iconGlow: string;
    /** Title text-shadow color */
    titleGlow: string;
    /** Button gradient */
    buttonGradient: string;
    /** Button border color */
    buttonBorder: string;
    /** Button glow color */
    buttonGlow: string;
  };
  /** Optional badge (Popular, New, Elite) */
  badge?: WorldPortalBadge;
  /** Stats displayed under the title */
  stats?: WorldStat[];
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

export function WorldPortalCard({
  icon: Icon,
  title,
  theme,
  badge,
  stats = [],
  onClick,
  className = '',
}: WorldPortalCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative ${className}`}
      style={{
        width: 220,
        height: 400,
        borderRadius: 24,
        background: `linear-gradient(180deg, ${theme.bgGradient})`,
        border: `4px solid transparent`,
        borderImage: `linear-gradient(180deg, ${theme.borderGradient}) 1`,
        boxShadow: `0 0 40px ${theme.glowPrimary}, 0 0 80px ${theme.glowSecondary}`,
        cursor: 'pointer',
      }}
    >
      {/* Badge (optional) */}
      {badge && (
        <div
          className="absolute flex items-center gap-1.5"
          style={{
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: 10,
            background: `linear-gradient(90deg, ${badge.gradient})`,
            padding: '4px 10px',
            boxShadow: `0 0 16px ${badge.glowColor}`,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: 10,
              fontWeight: 800,
              color: '#000000',
              letterSpacing: 1,
            }}
          >
            {badge.text}
          </span>
        </div>
      )}

      {/* Icon Container - centered */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          width: 110,
          height: 110,
          borderRadius: 55,
          left: 55,
          top: 75,
          background: `radial-gradient(circle, ${theme.iconGradient})`,
          border: `4px solid ${theme.iconBorder}`,
          boxShadow: `0 0 24px ${theme.iconGlow}, 0 0 20px rgba(0,0,0,0.25)`,
        }}
      >
        <Icon size={50} color="#FFFFFF" />
      </div>

      {/* Title */}
      <span
        className="absolute w-full text-center"
        style={{
          top: 210,
          left: 0,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: title.length > 12 ? 17 : 20,
          fontWeight: 900,
          color: '#FFFFFF',
          textShadow: `0 0 8px ${theme.titleGlow}`,
        }}
      >
        {title}
      </span>

      {/* Stats */}
      {stats.length > 0 && (
        <div
          className="absolute flex items-center justify-center gap-2.5"
          style={{ top: 245, left: 0, width: '100%' }}
        >
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div key={stat.text} className="flex items-center gap-1">
                <StatIcon size={12} style={{ color: stat.color }} />
                <span
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: stat.color,
                  }}
                >
                  {stat.text}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Explore Button */}
      <div className="absolute" style={{ top: 285, left: 30 }}>
        <GradientButton
          text="Explorar"
          gradient={`linear-gradient(180deg, ${theme.buttonGradient})`}
          borderColor={theme.buttonBorder}
          glowColor={theme.buttonGlow}
          width={160}
          height={44}
          borderRadius={14}
          borderWidth={3}
          fontSize={13}
          fontWeight={900}
        />
      </div>
    </button>
  );
}
