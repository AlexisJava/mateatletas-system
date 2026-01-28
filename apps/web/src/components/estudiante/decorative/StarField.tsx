'use client';

/**
 * StarField - Campo de estrellas pequeñas con glow (portal_estudiante.pen)
 *
 * Extraído de "1. MAIN MENU" → star elements:
 *
 * Cada estrella es una ellipse pequeña con:
 * - fill: color sólido (white o themed)
 * - size: 2-4px
 * - effect: outer shadow blur 4-8px con color del fill
 * - opacity: 0.9 (solo algunas)
 *
 * Colores del diseño:
 * - White: #FFFFFF (más común)
 * - Purple: #C4B5FD, #A78BFA
 * - Green: #34D399
 * - Blue: #60A5FA
 * - Gold: #FFD700 (destaca más, doble glow)
 * - Orange: #FB923C
 */

interface Star {
  id: string;
  color: string;
  size: number;
  x: number;
  y: number;
  blur?: number;
  opacity?: number;
  /** Si tiene doble glow (como las estrellas doradas) */
  doubleGlow?: boolean;
}

interface StarFieldProps {
  /** Array of star configurations */
  stars?: Star[];
  className?: string;
}

/** Default stars from Main Menu design (top area) */
const DEFAULT_STARS: Star[] = [
  { id: 's1', color: '#FFFFFF', size: 3, x: 80, y: 160, blur: 4, opacity: 0.9, doubleGlow: true },
  { id: 's2', color: '#C4B5FD', size: 3, x: 200, y: 180, blur: 6 },
  { id: 's3', color: '#FFFFFF', size: 2, x: 350, y: 150, blur: 4 },
  { id: 's4', color: '#34D399', size: 3, x: 520, y: 175, blur: 5 },
  { id: 's5', color: '#FFFFFF', size: 2, x: 680, y: 155, blur: 4 },
  { id: 's6', color: '#FFD700', size: 4, x: 850, y: 170, blur: 8, doubleGlow: true },
  { id: 's7', color: '#FFFFFF', size: 2, x: 1000, y: 160, blur: 4 },
  { id: 's8', color: '#60A5FA', size: 3, x: 1150, y: 175, blur: 6 },
  // Bottom area
  { id: 's9', color: '#FFFFFF', size: 2, x: 150, y: 720, blur: 4 },
  { id: 's10', color: '#A78BFA', size: 3, x: 400, y: 740, blur: 6 },
  { id: 's11', color: '#FFFFFF', size: 2, x: 650, y: 730, blur: 4 },
  { id: 's12', color: '#FB923C', size: 3, x: 900, y: 750, blur: 5 },
  { id: 's13', color: '#FFFFFF', size: 2, x: 1100, y: 720, blur: 4 },
];

export function StarField({
  stars = DEFAULT_STARS,
  className = '',
}: StarFieldProps): React.JSX.Element {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {stars.map((star) => {
        const blur = star.blur ?? 4;
        const baseGlow = `0 0 ${blur}px ${star.color}`;
        const secondGlow = star.doubleGlow ? `, 0 0 ${blur * 2}px ${star.color}60` : '';

        return (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              width: star.size,
              height: star.size,
              left: star.x,
              top: star.y,
              backgroundColor: star.color,
              opacity: star.opacity ?? 1,
              boxShadow: baseGlow + secondGlow,
            }}
          />
        );
      })}
    </div>
  );
}

export { DEFAULT_STARS };
