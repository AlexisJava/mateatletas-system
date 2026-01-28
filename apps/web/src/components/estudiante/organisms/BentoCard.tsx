'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * BentoCard - Card genérica del Main Grid (portal_estudiante.pen)
 *
 * Todas las 5 cards del Main Grid comparten la misma estructura:
 *
 * Outer container:
 * - cornerRadius: 22 (standard) o 28 (Explorar Mundos)
 * - fill: linear-gradient(160deg, 4 stops de color temático)
 * - stroke: gradient border 1.5px (3 stops del color temático)
 * - effect: double outer shadow (blur 35/70 con colores temáticos)
 * - clip: true
 * - layout: none (absolute positioning inside)
 *
 * Inner glow ellipse:
 * - Positioned top-left (x: 80/-100, y: -60/-100)
 * - radial gradient from color 28% → 12% → 00%
 *
 * Content frame (absolute, fill_container):
 * - layout: vertical
 * - justifyContent: space_between
 * - padding: 20 (standard) o 28 (Explorar Mundos)
 *
 * Top section:
 * - Icon box (52x52 standard, 72x72 Explorar):
 *   cornerRadius 14/20, gradient fill, stroke #FFFFFF25/30 1px
 *   double glow shadow, inner icon 22/30px white
 * - Title: Inter 22/28px, weight 800/900, white
 * - Description: Inter 13/14px, weight 500, color temático
 *
 * Bottom section: varies per card type
 */

interface BentoCardTheme {
  /** 4-stop gradient for card background, e.g., "#2E1B6B, #1A1040, #0D0820, #050210" */
  bgGradient: string;
  /** 3-stop gradient for border stroke */
  borderGradient: string;
  /** Primary glow color (e.g., #A78BFA60) */
  glowPrimary: string;
  /** Secondary glow color (e.g., #7C3AED30) */
  glowSecondary: string;
  /** Icon box gradient (4-stop) */
  iconGradient: string;
  /** Icon box glow primary */
  iconGlowPrimary: string;
  /** Icon box glow secondary */
  iconGlowSecondary: string;
  /** Description text color */
  descColor: string;
  /** Inner glow ellipse color stops */
  innerGlow: string;
}

/** Dimension presets for standard vs large cards */
const CARD_DIMENSIONS = {
  standard: {
    cornerRadius: 22,
    padding: 20,
    iconSize: 52,
    iconInnerSize: 22,
    iconRadius: 14,
    titleSize: 22,
    titleWeight: 800,
    descSize: 13,
    glowSize: 250,
    glowLeft: 80,
    glowTop: -60,
    gap: 8,
  },
  large: {
    cornerRadius: 28,
    padding: 28,
    iconSize: 72,
    iconInnerSize: 30,
    iconRadius: 20,
    titleSize: 28,
    titleWeight: 900,
    descSize: 14,
    glowSize: 400,
    glowLeft: -100,
    glowTop: -100,
    gap: 12,
  },
} as const;

interface BentoCardProps {
  /** Lucide icon for the card */
  icon: LucideIcon;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Theme colors */
  theme: BentoCardTheme;
  /** Large variant (Explorar Mundos) */
  large?: boolean;
  /** Bottom content */
  bottomContent?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

export function BentoCard({
  icon: Icon,
  title,
  description,
  theme,
  large = false,
  bottomContent,
  onClick,
  className = '',
}: BentoCardProps): React.JSX.Element {
  const d = large ? CARD_DIMENSIONS.large : CARD_DIMENSIONS.standard;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full h-full overflow-hidden text-left ${className}`}
      style={{
        borderRadius: d.cornerRadius,
        background: `linear-gradient(160deg, ${theme.bgGradient})`,
        border: `1.5px solid transparent`,
        borderImage: `linear-gradient(160deg, ${theme.borderGradient}) 1`,
        boxShadow: `0 0 35px ${theme.glowPrimary}, 0 0 70px ${theme.glowSecondary}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Inner glow ellipse */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: d.glowSize,
          height: d.glowSize,
          left: d.glowLeft,
          top: d.glowTop,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.innerGlow})`,
        }}
      />

      {/* Content */}
      <div
        className="relative flex flex-col justify-between w-full h-full"
        style={{ padding: d.padding }}
      >
        {/* Top */}
        <div className="flex flex-col" style={{ gap: d.gap }}>
          {/* Icon Box */}
          <div
            className="flex items-center justify-center"
            style={{
              width: d.iconSize,
              height: d.iconSize,
              borderRadius: d.iconRadius,
              background: `linear-gradient(145deg, ${theme.iconGradient})`,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: `0 0 16px ${theme.iconGlowPrimary}, 0 0 32px ${theme.iconGlowSecondary}`,
            }}
          >
            <Icon size={d.iconInnerSize} color="#FFFFFF" />
          </div>

          {/* Title */}
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: d.titleSize,
              fontWeight: d.titleWeight,
              color: '#FFFFFF',
            }}
          >
            {title}
          </span>

          {/* Description */}
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: d.descSize,
              fontWeight: 500,
              color: theme.descColor,
              lineHeight: large ? 1.4 : undefined,
              maxWidth: large ? 300 : undefined,
            }}
          >
            {description}
          </span>
        </div>

        {/* Bottom content */}
        {bottomContent && <div>{bottomContent}</div>}
      </div>
    </button>
  );
}
