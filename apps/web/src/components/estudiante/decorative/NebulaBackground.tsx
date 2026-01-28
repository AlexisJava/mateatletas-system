'use client';

/**
 * NebulaBackground - Nebulosas de colores para fondos (portal_estudiante.pen)
 *
 * Extraído de "1. MAIN MENU" → nebula1, nebula2, nebula3, nebulaCenter:
 *
 * Cada nebulosa es una ellipse grande con:
 * - fill: radial-gradient con 3 stops (color30/35 → color10/08 → color00)
 * - opacity: 0.5-0.7
 * - size: 400-800px
 * - position: absolute, scattered around
 *
 * Colores del diseño:
 * - Purple: #7C3AED (nebula1)
 * - Green: #10B981 (nebula2)
 * - Orange: #FB923C (nebula3)
 * - Mixed: #A78BFA → #7C3AED → #3B82F6 (nebulaCenter)
 */

interface Nebula {
  id: string;
  color: string;
  /** Color stops opacity: [start, mid, end] e.g., [0.21, 0.06, 0] */
  opacityStops?: [number, number, number];
  size: number;
  x: number;
  y: number;
  opacity?: number;
}

interface NebulaBackgroundProps {
  /** Array of nebula configurations */
  nebulas?: Nebula[];
  className?: string;
}

/** Default nebula configuration from Main Menu design */
const DEFAULT_NEBULAS: Nebula[] = [
  {
    id: 'n1',
    color: '#7C3AED',
    opacityStops: [0.21, 0.06, 0],
    size: 500,
    x: -300,
    y: -200,
    opacity: 0.7,
  },
  {
    id: 'n2',
    color: '#10B981',
    opacityStops: [0.19, 0.06, 0],
    size: 450,
    x: 700,
    y: 200,
    opacity: 0.6,
  },
  {
    id: 'n3',
    color: '#FB923C',
    opacityStops: [0.13, 0.03, 0],
    size: 400,
    x: 500,
    y: -100,
    opacity: 0.5,
  },
  {
    id: 'n4',
    color: '#A78BFA',
    opacityStops: [0.08, 0.03, 0],
    size: 500,
    x: 240,
    y: 100,
    opacity: 0.5,
  },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function NebulaBackground({
  nebulas = DEFAULT_NEBULAS,
  className = '',
}: NebulaBackgroundProps): React.JSX.Element {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {nebulas.map((nebula) => {
        const [startOp, midOp, endOp] = nebula.opacityStops ?? [0.2, 0.06, 0];
        return (
          <div
            key={nebula.id}
            className="absolute rounded-full"
            style={{
              width: nebula.size,
              height: nebula.size,
              left: nebula.x,
              top: nebula.y,
              opacity: nebula.opacity ?? 0.6,
              background: `radial-gradient(circle, ${hexToRgba(nebula.color, startOp)} 0%, ${hexToRgba(nebula.color, midOp)} 50%, ${hexToRgba(nebula.color, endOp)} 100%)`,
            }}
          />
        );
      })}
    </div>
  );
}

export { DEFAULT_NEBULAS };
