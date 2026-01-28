'use client';

/**
 * Vignette - Efecto de viñeta oscura en bordes (portal_estudiante.pen)
 *
 * Extraído de "1. MAIN MENU" → vignette (6Xair):
 *
 * Frame con:
 * - fill: radial-gradient desde centro hacia afuera
 * - center: { y: 0.4 } (ligeramente arriba del centro)
 * - size: { width: 1.6, height: 1.6 } (más grande que el container)
 * - 4 stops de opacidad:
 *   - 20%: #00000000 (transparent)
 *   - 60%: #00000030 (19% opacity)
 *   - 85%: #00000070 (44% opacity)
 *   - 100%: #000000AA (67% opacity)
 *
 * Crea efecto de "spotlight" en el centro con oscurecimiento
 * gradual hacia los bordes.
 */

interface VignetteProps {
  /** Vertical center position (0-1, default: 0.4 = slightly above center) */
  centerY?: number;
  /** Opacity multiplier (default: 1) */
  intensity?: number;
  className?: string;
}

export function Vignette({
  centerY = 0.4,
  intensity = 1,
  className = '',
}: VignetteProps): React.JSX.Element {
  // Opacity values from design, scaled by intensity
  const op1 = Math.round(0 * intensity);
  const op2 = Math.round(48 * intensity); // #30 = 48
  const op3 = Math.round(112 * intensity); // #70 = 112
  const op4 = Math.round(170 * intensity); // #AA = 170

  const toHex = (n: number) => Math.min(255, n).toString(16).padStart(2, '0');

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(ellipse 160% 160% at 50% ${centerY * 100}%,
          #000000${toHex(op1)} 20%,
          #000000${toHex(op2)} 60%,
          #000000${toHex(op3)} 85%,
          #000000${toHex(op4)} 100%)`,
      }}
    />
  );
}
