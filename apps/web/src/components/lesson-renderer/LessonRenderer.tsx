'use client';

import React, { useMemo } from 'react';
import { JSONRenderer } from './JSONRenderer';
import { ViewportContext } from './DesignSystem';
import type { ContentBlock, HouseColors } from './types';
import { DEFAULT_HOUSE_COLORS } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// LESSON RENDERER
// ─────────────────────────────────────────────────────────────────────────────

interface LessonRendererProps {
  /** JSON string del contenido a renderizar */
  contenidoJson: string;
  /** Colores de la casa del estudiante (opcional) */
  houseColors?: HouseColors;
  /** Si está en modo mobile (para simulación) */
  isMobile?: boolean;
}

/**
 * Componente principal para renderizar contenido de lecciones.
 *
 * Parsea el JSON del contenido y lo renderiza usando el DesignSystem.
 * Inyecta las CSS variables de colores de la casa para theming.
 *
 * Uso:
 * ```tsx
 * <LessonRenderer
 *   contenidoJson={nodo.contenidoJson}
 *   houseColors={{ primary: '#F472B6', secondary: '#EC4899', accent: '#FBCFE8' }}
 * />
 * ```
 */
export function LessonRenderer({
  contenidoJson,
  houseColors = DEFAULT_HOUSE_COLORS,
  isMobile = false,
}: LessonRendererProps) {
  // Parsear el JSON
  const { data, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(contenidoJson);
      return { data: parsed as ContentBlock, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Error de parseo' };
    }
  }, [contenidoJson]);

  // CSS variables para theming de la casa
  const themeStyle = {
    '--house-primary': houseColors.primary,
    '--house-secondary': houseColors.secondary,
    '--house-accent': houseColors.accent,
    '--house-primary-alpha': `${houseColors.primary}40`,
  } as React.CSSProperties;

  return (
    <ViewportContext.Provider value={{ isMobile }}>
      <div
        className="h-full w-full flex items-center justify-center relative overflow-hidden"
        style={themeStyle}
      >
        <div className="w-full h-full relative z-10">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="p-6 bg-red-950/90 border border-red-500/20 text-red-200 rounded-xl text-sm font-mono shadow-2xl backdrop-blur-md max-w-md">
                <div className="flex items-center gap-2 mb-2 text-red-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="font-bold uppercase tracking-wide">Error de Contenido</span>
                </div>
                <p className="text-xs opacity-80">{error}</p>
              </div>
            </div>
          ) : (
            <JSONRenderer data={data} />
          )}
        </div>
      </div>
    </ViewportContext.Provider>
  );
}

export default LessonRenderer;
