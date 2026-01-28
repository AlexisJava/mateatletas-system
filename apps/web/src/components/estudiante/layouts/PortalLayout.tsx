'use client';

import { CosmicBackground } from '../decorative/CosmicBackground';
import { TopBar } from '../organisms/TopBar';

/**
 * PortalLayout - Layout principal del Portal Estudiante (portal_estudiante.pen)
 *
 * Usado en: Main Menu, Selección de Mundos, Mundo Matemáticas,
 * Mi Progreso, Pantalla de Juegos.
 *
 * Estructura:
 * - Full screen (1280x800)
 * - CosmicBackground (nebulas, stars, particles, vignette)
 * - TopBar (70px, gradient transparent)
 * - Content area (flex-1, scrollable)
 */

interface PortalLayoutProps {
  /** Show the top bar (default: true) */
  showTopBar?: boolean;
  /** Custom top bar component */
  topBar?: React.ReactNode;
  /** Show cosmic background decorations */
  showDecorations?: boolean;
  /** Main content */
  children: React.ReactNode;
  className?: string;
}

export function PortalLayout({
  showTopBar = true,
  topBar,
  showDecorations = true,
  children,
  className = '',
}: PortalLayoutProps): React.JSX.Element {
  return (
    <CosmicBackground
      showNebulas={showDecorations}
      showStars={showDecorations}
      showParticles={showDecorations}
      showOrbs={showDecorations}
      showVignette={showDecorations}
      className={`min-h-screen ${className}`}
    >
      <div className="flex flex-col w-full h-full min-h-screen">
        {/* Top Bar */}
        {showTopBar && (topBar ?? <TopBar />)}

        {/* Content Area */}
        <main className="flex-1 relative">{children}</main>
      </div>
    </CosmicBackground>
  );
}
