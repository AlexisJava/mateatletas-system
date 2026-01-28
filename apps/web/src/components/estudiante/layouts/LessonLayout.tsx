'use client';

import { ArrowLeft, Lightbulb } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * LessonLayout - Layout para lecciones interactivas (portal_estudiante.pen)
 *
 * Extraído de "9. Slide - Lección Blockly" (QM38Z):
 *
 * Estructura vertical:
 * - Top Bar (56px): back button, title, badges, hint button
 * - Main Content (flex-1): 3-column layout
 *   - Left Panel (280px): mission, blocks palette
 *   - Center Panel (fill): workspace, canvas
 *   - Right Panel (320px): preview, output, hints
 * - Bottom Bar (64px): navigation, progress, actions
 *
 * Background: #030014
 * Panels: gap 20, padding 24
 */

interface LessonBadge {
  icon: LucideIcon;
  text: string;
  color: string;
  bgColor: string;
}

interface LessonLayoutProps {
  /** Lesson title */
  title: string;
  /** Badge next to title (e.g., "Scratch") */
  badge?: LessonBadge;
  /** Level badge (e.g., "Nivel 1") */
  levelBadge?: LessonBadge;
  /** Back button handler */
  onBack?: () => void;
  /** Hint button handler */
  onHint?: () => void;
  /** Left panel content (mission, blocks) */
  leftPanel?: React.ReactNode;
  /** Center panel content (workspace) */
  centerPanel: React.ReactNode;
  /** Right panel content (preview, output) */
  rightPanel?: React.ReactNode;
  /** Bottom bar content (navigation) */
  bottomBar?: React.ReactNode;
  className?: string;
}

export function LessonLayout({
  title,
  badge,
  levelBadge,
  onBack,
  onHint,
  leftPanel,
  centerPanel,
  rightPanel,
  bottomBar,
  className = '',
}: LessonLayoutProps): React.JSX.Element {
  return (
    <div
      className={`flex flex-col w-full h-screen ${className}`}
      style={{ backgroundColor: '#030014' }}
    >
      {/* Top Bar - 56px */}
      <header
        className="flex items-center justify-between w-full shrink-0"
        style={{
          height: 56,
          padding: '0 24px',
          backgroundColor: '#0A0A1A',
        }}
      >
        {/* Left: Back + Title + Badge */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: '#1E1E3A' }}
          >
            <ArrowLeft size={18} color="#9CA3AF" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#9CA3AF',
              }}
            >
              Volver
            </span>
          </button>

          <span
            style={{
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            {title}
          </span>

          {badge && (
            <div
              className="flex items-center gap-1.5 rounded-[20px] px-3 py-1.5"
              style={{ backgroundColor: badge.bgColor }}
            >
              <badge.icon size={14} style={{ color: badge.color }} />
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: badge.color,
                }}
              >
                {badge.text}
              </span>
            </div>
          )}
        </div>

        {/* Right: Level + Hint */}
        <div className="flex items-center gap-3">
          {levelBadge && (
            <div
              className="flex items-center gap-1.5 rounded-[20px] px-3 py-1.5"
              style={{ backgroundColor: levelBadge.bgColor }}
            >
              <levelBadge.icon size={14} style={{ color: levelBadge.color }} />
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: levelBadge.color,
                }}
              >
                {levelBadge.text}
              </span>
            </div>
          )}

          {onHint && (
            <button
              type="button"
              onClick={onHint}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2"
              style={{ backgroundColor: '#374151' }}
            >
              <Lightbulb size={16} color="#FBBF24" />
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                Pista
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content - 3 columns */}
      <main className="flex flex-1 min-h-0" style={{ padding: 24, gap: 20 }}>
        {/* Left Panel - 280px */}
        {leftPanel && (
          <aside className="flex flex-col gap-4 shrink-0 overflow-y-auto" style={{ width: 280 }}>
            {leftPanel}
          </aside>
        )}

        {/* Center Panel - fill */}
        <section className="flex flex-col flex-1 min-w-0 overflow-hidden">{centerPanel}</section>

        {/* Right Panel - 320px */}
        {rightPanel && (
          <aside className="flex flex-col gap-4 shrink-0 overflow-y-auto" style={{ width: 320 }}>
            {rightPanel}
          </aside>
        )}
      </main>

      {/* Bottom Bar - 64px */}
      {bottomBar && (
        <footer
          className="flex items-center justify-between w-full shrink-0"
          style={{
            height: 64,
            padding: '0 24px',
            backgroundColor: '#0A0A1A',
          }}
        >
          {bottomBar}
        </footer>
      )}
    </div>
  );
}
