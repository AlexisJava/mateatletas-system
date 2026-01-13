'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Grid3X3 } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings, shadows } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface BentoCell {
  /** Unique identifier */
  id: string;
  /** Cell content */
  content: React.ReactNode;
  /** Column span (1-4) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Row span (1-2) */
  rowSpan?: 1 | 2;
  /** Background style */
  background?: 'default' | 'accent' | 'highlight' | 'visual';
  /** Optional title */
  title?: string;
}

export interface BentoIntentProps {
  /** Title above the grid */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Grid cells */
  cells: BentoCell[];
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Category badge */
  category?: string;
  /** Show continue button */
  showContinue?: boolean;
  /** CTA text */
  ctaText?: string;
  /** Called when continuing */
  onContinue?: () => void;
  /** Additional class names */
  className?: string;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cellVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

// =============================================================================
// HELPERS
// =============================================================================

function getCellBackground(bg: BentoCell['background'] = 'default'): React.CSSProperties {
  switch (bg) {
    case 'accent':
      return {
        background: 'var(--house-primary-alpha)',
        border: `1px solid var(--house-primary)`,
      };
    case 'highlight':
      return {
        background:
          'linear-gradient(135deg, var(--house-primary-alpha) 0%, var(--house-secondary-alpha) 100%)',
        border: `1px solid var(--house-primary)`,
        boxShadow: shadows.houseGlow,
      };
    case 'visual':
      return {
        background: backgrounds.surface,
        border: `1px solid ${borders.medium}`,
      };
    default:
      return {
        background: backgrounds.card,
        backdropFilter: `blur(${blur.md})`,
        border: `1px solid ${borders.subtle}`,
      };
  }
}

function getColSpanClass(span: number = 1): string {
  switch (span) {
    case 2:
      return 'col-span-2';
    case 3:
      return 'col-span-3';
    case 4:
      return 'col-span-4';
    default:
      return 'col-span-1';
  }
}

function getRowSpanClass(span: number = 1): string {
  return span === 2 ? 'row-span-2' : 'row-span-1';
}

function getGridColsClass(cols: number): string {
  switch (cols) {
    case 2:
      return 'grid-cols-2';
    case 3:
      return 'grid-cols-2 md:grid-cols-3';
    case 4:
      return 'grid-cols-2 md:grid-cols-4';
    default:
      return 'grid-cols-2 md:grid-cols-3';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * BentoIntent - Apple-style bento grid layout
 *
 * Displays content in a responsive grid with cells of varying sizes.
 * Perfect for showing multiple related concepts or visual overviews.
 *
 * @example
 * ```tsx
 * <BentoIntent
 *   title="Tipos de Fracciones"
 *   cells={[
 *     { id: '1', content: <FractionVisual />, colSpan: 2, rowSpan: 2, background: 'highlight' },
 *     { id: '2', content: <p>Propias</p>, title: '< 1' },
 *     { id: '3', content: <p>Impropias</p>, title: '> 1' },
 *     { id: '4', content: <p>Mixtas</p>, colSpan: 2 },
 *   ]}
 *   columns={3}
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function BentoIntent({
  title,
  subtitle,
  cells,
  columns = 3,
  category = 'Resumen',
  showContinue = true,
  ctaText = 'Continuar',
  onContinue,
  className,
}: BentoIntentProps) {
  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-secondary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.08,
        }}
      />

      {/* Header */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pt-6"
      >
        <Badge variant="level" className="inline-flex items-center gap-2 mb-3">
          <Grid3X3 className="w-3.5 h-3.5" />
          {category}
        </Badge>
        {title && <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>}
        {subtitle && <p className="text-white/60 mt-1">{subtitle}</p>}
      </motion.div>

      {/* Bento grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 relative z-10 px-6 py-6 overflow-hidden"
      >
        <div className={clsx('grid gap-3 md:gap-4 h-full auto-rows-fr', getGridColsClass(columns))}>
          {cells.map((cell) => (
            <motion.div
              key={cell.id}
              variants={cellVariants}
              className={clsx(
                'rounded-2xl overflow-hidden p-4 md:p-5 flex flex-col',
                getColSpanClass(cell.colSpan),
                getRowSpanClass(cell.rowSpan),
              )}
              style={getCellBackground(cell.background)}
            >
              {cell.title && (
                <h3 className="text-sm font-medium text-white/60 mb-2">{cell.title}</h3>
              )}
              <div className="flex-1 flex items-center justify-center">{cell.content}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Continue button */}
      {showContinue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...lessonSprings.button, delay: 0.4 }}
          className="relative z-10 px-6 pb-6 flex justify-center"
        >
          <Button variant="primary" size="lg" onClick={onContinue}>
            {ctaText}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

BentoIntent.displayName = 'BentoIntent';
