'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * CategoryCard - Card de categoría dentro de un mundo (portal_estudiante.pen)
 *
 * Extraído de "3. Mundo Matemáticas" → Category Cards (fUX2r, lkFwg, c4g3P, 5v9Fy):
 *
 * Card container:
 * - width: 280, height: 380
 * - cornerRadius: 32
 * - fill: linear-gradient(180deg, 2-stop themed)
 * - stroke: {color}80 2px
 * - effect: double shadow (blur 50 offset y:12, blur 40)
 * - layout: none (absolute positioning)
 * - clip: true
 *
 * Icon Container (top):
 * - 110x110, cornerRadius: 32
 * - fill: linear-gradient(135deg, light→dark themed)
 * - shadow: blur 40 primary, blur 20 offset y:8 secondaryCC
 * - at (85, 35)
 * - inner icon: 56x56 white
 *
 * Title: Inter 32px/800, white, textAlign center, fixedWidth 280, at y:190
 * Description: Inter 13px/800, themed, letterSpacing 2, lineHeight 1.5, textAlign center, at y:267
 */

interface CategoryCardProps {
  /** Category icon */
  icon: LucideIcon;
  /** Category name */
  title: string;
  /** Category tagline (uppercase) */
  description: string;
  /** Theme colors */
  theme: {
    /** Card background gradient (2 stops) */
    bgGradient: string;
    /** Card border color (with 80 opacity appended) */
    borderColor: string;
    /** Outer glow primary */
    glowPrimary: string;
    /** Outer glow secondary */
    glowSecondary: string;
    /** Icon gradient (2 stops) */
    iconGradient: string;
    /** Icon glow primary */
    iconGlowPrimary: string;
    /** Icon glow secondary */
    iconGlowSecondary: string;
    /** Description text color */
    descColor: string;
  };
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

export function CategoryCard({
  icon: Icon,
  title,
  description,
  theme,
  onClick,
  className = '',
}: CategoryCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden text-left ${className}`}
      style={{
        width: 280,
        height: 380,
        borderRadius: 32,
        background: `linear-gradient(180deg, ${theme.bgGradient})`,
        border: `2px solid ${theme.borderColor}80`,
        boxShadow: `0 12px 50px ${theme.glowPrimary}, 0 0 40px ${theme.glowSecondary}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Icon Container */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          width: 110,
          height: 110,
          borderRadius: 32,
          left: 85,
          top: 35,
          background: `linear-gradient(135deg, ${theme.iconGradient})`,
          boxShadow: `0 0 40px ${theme.iconGlowPrimary}, 0 8px 20px ${theme.iconGlowSecondary}`,
        }}
      >
        <Icon size={56} color="#FFFFFF" />
      </div>

      {/* Title */}
      <span
        className="absolute w-full text-center"
        style={{
          top: 190,
          left: 0,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 32,
          fontWeight: 800,
          color: '#FFFFFF',
        }}
      >
        {title}
      </span>

      {/* Description */}
      <span
        className="absolute w-full text-center"
        style={{
          top: 267,
          left: 0,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 2,
          lineHeight: 1.5,
          color: theme.descColor,
        }}
      >
        {description}
      </span>
    </button>
  );
}
