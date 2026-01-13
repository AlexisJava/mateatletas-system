'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Columns } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export type SplitRatio = '50-50' | '60-40' | '40-60' | '70-30' | '30-70';

export interface SplitIntentProps {
  /** Left panel content */
  left: {
    title?: string;
    content: React.ReactNode;
    background?: 'default' | 'accent' | 'visual';
  };
  /** Right panel content */
  right: {
    title?: string;
    content: React.ReactNode;
    background?: 'default' | 'accent' | 'visual';
  };
  /** Split ratio */
  ratio?: SplitRatio;
  /** Whether to stack on mobile */
  stackOnMobile?: boolean;
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
      staggerChildren: 0.15,
    },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...lessonSprings.button,
      delay: 0.3,
    },
  },
};

// =============================================================================
// HELPERS
// =============================================================================

function getRatioClasses(ratio: SplitRatio, isLeft: boolean): string {
  switch (ratio) {
    case '60-40':
      return isLeft ? 'md:w-[60%]' : 'md:w-[40%]';
    case '40-60':
      return isLeft ? 'md:w-[40%]' : 'md:w-[60%]';
    case '70-30':
      return isLeft ? 'md:w-[70%]' : 'md:w-[30%]';
    case '30-70':
      return isLeft ? 'md:w-[30%]' : 'md:w-[70%]';
    case '50-50':
    default:
      return 'md:w-1/2';
  }
}

function getPanelBackground(bg: 'default' | 'accent' | 'visual' = 'default'): React.CSSProperties {
  switch (bg) {
    case 'accent':
      return {
        background: 'var(--house-primary-alpha)',
        border: `1px solid var(--house-primary)`,
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

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * SplitIntent - Two-column layout
 *
 * Divides content into two panels with configurable ratios.
 * Perfect for comparing concepts, showing visual + text, or side-by-side content.
 *
 * @example
 * ```tsx
 * <SplitIntent
 *   left={{
 *     title: "Numerador",
 *     content: <p>El número de arriba</p>,
 *     background: "accent"
 *   }}
 *   right={{
 *     title: "Denominador",
 *     content: <p>El número de abajo</p>
 *   }}
 *   ratio="50-50"
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function SplitIntent({
  left,
  right,
  ratio = '50-50',
  stackOnMobile = true,
  category = 'Comparar',
  showContinue = true,
  ctaText = 'Continuar',
  onContinue,
  className,
}: SplitIntentProps) {
  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={lessonSprings.card}
        className="relative z-10 px-6 pt-6"
      >
        <Badge variant="level" className="inline-flex items-center gap-2">
          <Columns className="w-3.5 h-3.5" />
          {category}
        </Badge>
      </motion.div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={clsx(
          'flex-1 relative z-10 flex items-center justify-center px-6 py-6',
          stackOnMobile ? 'flex-col md:flex-row' : 'flex-row',
          'gap-4 md:gap-6',
        )}
      >
        {/* Left panel */}
        <motion.div
          variants={panelVariants}
          className={clsx(
            'w-full rounded-2xl overflow-hidden',
            stackOnMobile ? 'md:h-full' : 'h-full',
            getRatioClasses(ratio, true),
          )}
          style={getPanelBackground(left.background)}
        >
          <div className="h-full p-6 flex flex-col">
            {left.title && (
              <h3 className="text-lg font-semibold text-white/80 mb-4">{left.title}</h3>
            )}
            <div className="flex-1 flex items-center justify-center">{left.content}</div>
          </div>
        </motion.div>

        {/* Right panel */}
        <motion.div
          variants={panelVariants}
          className={clsx(
            'w-full rounded-2xl overflow-hidden',
            stackOnMobile ? 'md:h-full' : 'h-full',
            getRatioClasses(ratio, false),
          )}
          style={getPanelBackground(right.background)}
        >
          <div className="h-full p-6 flex flex-col">
            {right.title && (
              <h3 className="text-lg font-semibold text-white/80 mb-4">{right.title}</h3>
            )}
            <div className="flex-1 flex items-center justify-center">{right.content}</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Continue button */}
      {showContinue && (
        <motion.div
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
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

SplitIntent.displayName = 'SplitIntent';
