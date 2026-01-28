'use client';

/**
 * GlowOrbs - Orbes flotantes con radial gradient y glow (portal_estudiante.pen)
 *
 * Extraído de "1. MAIN MENU" → floatingOrb elements:
 *
 * Cada orbe es una ellipse mediana con:
 * - fill: radial-gradient (color40 → color00)
 * - size: 14-20px
 * - effect: outer shadow blur 12-18px con color50
 * - opacity: 0.5-0.6
 *
 * Diferencia con partículas: los orbes son más grandes
 * y tienen gradiente radial (no solid fill).
 *
 * Colores del diseño:
 * - Purple: #A78BFA
 * - Green: #10B981
 * - Fuchsia: #C084FC
 * - Blue: #60A5FA
 */

interface Orb {
  id: string;
  color: string;
  size: number;
  x: number;
  y: number;
  blur?: number;
  opacity?: number;
}

interface GlowOrbsProps {
  /** Array of orb configurations */
  orbs?: Orb[];
  className?: string;
}

/** Default orbs from Main Menu design */
const DEFAULT_ORBS: Orb[] = [
  { id: 'o1', color: '#A78BFA', size: 16, x: 100, y: 350, blur: 15, opacity: 0.6 },
  { id: 'o2', color: '#10B981', size: 20, x: 1150, y: 420, blur: 18, opacity: 0.5 },
  { id: 'o3', color: '#C084FC', size: 14, x: 50, y: 520, blur: 12, opacity: 0.5 },
  { id: 'o4', color: '#60A5FA', size: 18, x: 1200, y: 580, blur: 15, opacity: 0.5 },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function GlowOrbs({
  orbs = DEFAULT_ORBS,
  className = '',
}: GlowOrbsProps): React.JSX.Element {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((orb) => {
        const blur = orb.blur ?? 15;

        return (
          <div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              opacity: orb.opacity ?? 0.5,
              background: `radial-gradient(circle, ${hexToRgba(orb.color, 0.25)} 0%, ${hexToRgba(orb.color, 0)} 100%)`,
              boxShadow: `0 0 ${blur}px ${orb.color}50`,
            }}
          />
        );
      })}
    </div>
  );
}

export { DEFAULT_ORBS };
