'use client';

/**
 * FloatingParticles - Partículas flotantes con doble glow (portal_estudiante.pen)
 *
 * Extraído de "1. MAIN MENU" → particle elements:
 *
 * Cada partícula es una ellipse con:
 * - fill: color sólido
 * - size: 3-4px
 * - effect: DOBLE outer shadow (blur 6-8 + blur 12-16 con 50% opacity)
 * - opacity: 0.6-0.8
 *
 * Diferencia con estrellas: las partículas están en los bordes
 * laterales y tienen doble glow más intenso.
 *
 * Colores del diseño:
 * - Purple: #A78BFA, #C084FC
 * - Green: #10B981
 * - Blue: #60A5FA
 * - Red: #EF4444
 * - Gold: #FFD700
 */

interface Particle {
  id: string;
  color: string;
  size: number;
  x: number;
  y: number;
  blur1?: number;
  blur2?: number;
  opacity?: number;
}

interface FloatingParticlesProps {
  /** Array of particle configurations */
  particles?: Particle[];
  className?: string;
}

/** Default particles from Main Menu design (side edges) */
const DEFAULT_PARTICLES: Particle[] = [
  { id: 'p1', color: '#A78BFA', size: 4, x: 120, y: 280, blur1: 8, blur2: 16, opacity: 0.8 },
  { id: 'p2', color: '#10B981', size: 3, x: 1180, y: 320, blur1: 6, blur2: 12, opacity: 0.7 },
  { id: 'p3', color: '#60A5FA', size: 3, x: 60, y: 450, blur1: 6, blur2: 12, opacity: 0.7 },
  { id: 'p4', color: '#C084FC', size: 3, x: 1220, y: 500, blur1: 6, blur2: 12, opacity: 0.7 },
  { id: 'p5', color: '#EF4444', size: 3, x: 30, y: 600, blur1: 6, blur2: 12, opacity: 0.6 },
  { id: 'p6', color: '#FFD700', size: 4, x: 1250, y: 650, blur1: 8, blur2: 16, opacity: 0.8 },
];

export function FloatingParticles({
  particles = DEFAULT_PARTICLES,
  className = '',
}: FloatingParticlesProps): React.JSX.Element {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => {
        const blur1 = particle.blur1 ?? 6;
        const blur2 = particle.blur2 ?? 12;

        return (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              opacity: particle.opacity ?? 0.7,
              boxShadow: `0 0 ${blur1}px ${particle.color}, 0 0 ${blur2}px ${particle.color}50`,
            }}
          />
        );
      })}
    </div>
  );
}

export { DEFAULT_PARTICLES };
