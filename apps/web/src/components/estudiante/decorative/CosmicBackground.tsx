'use client';

import { NebulaBackground, DEFAULT_NEBULAS } from './NebulaBackground';
import { StarField, DEFAULT_STARS } from './StarField';
import { FloatingParticles, DEFAULT_PARTICLES } from './FloatingParticles';
import { GlowOrbs, DEFAULT_ORBS } from './GlowOrbs';
import { Vignette } from './Vignette';

/**
 * CosmicBackground - Fondo espacial completo (portal_estudiante.pen)
 *
 * Combina todos los elementos decorativos del Main Menu:
 * - Radial gradient background
 * - Vignette effect
 * - Nebulas (large colored blurs)
 * - Star field (small glowing dots)
 * - Floating particles (medium glowing dots on edges)
 * - Glow orbs (radial gradient circles)
 *
 * Background gradient from design:
 * - radial-gradient at center y:30%
 * - size: 150% x 150%
 * - colors: #0F0720 0% → #030014 60% → #000008 100%
 */

interface CosmicBackgroundProps {
  /** Show vignette effect */
  showVignette?: boolean;
  /** Show nebulas */
  showNebulas?: boolean;
  /** Show stars */
  showStars?: boolean;
  /** Show particles */
  showParticles?: boolean;
  /** Show orbs */
  showOrbs?: boolean;
  /** Vignette intensity (0-1) */
  vignetteIntensity?: number;
  className?: string;
  children?: React.ReactNode;
}

export function CosmicBackground({
  showVignette = true,
  showNebulas = true,
  showStars = true,
  showParticles = true,
  showOrbs = true,
  vignetteIntensity = 1,
  className = '',
  children,
}: CosmicBackgroundProps): React.JSX.Element {
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(ellipse 150% 150% at 50% 30%,
          #0F0720 0%,
          #030014 60%,
          #000008 100%)`,
      }}
    >
      {/* Decorative layers - back to front */}
      {showNebulas && <NebulaBackground nebulas={DEFAULT_NEBULAS} />}
      {showOrbs && <GlowOrbs orbs={DEFAULT_ORBS} />}
      {showParticles && <FloatingParticles particles={DEFAULT_PARTICLES} />}
      {showStars && <StarField stars={DEFAULT_STARS} />}
      {showVignette && <Vignette intensity={vignetteIntensity} />}

      {/* Content layer */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
