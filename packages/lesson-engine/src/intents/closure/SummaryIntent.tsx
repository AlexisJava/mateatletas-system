'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, BookOpen, Check, Sparkles } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface SummaryPoint {
  /** Unique identifier */
  id: string;
  /** Summary point text */
  text: string;
  /** Optional icon or emoji */
  icon?: React.ReactNode;
}

export interface SummaryIntentProps {
  /** Title for the summary */
  title?: string;
  /** Subtitle/intro text */
  subtitle?: string;
  /** Key learning points */
  points: SummaryPoint[];
  /** Optional closing message */
  closingMessage?: string;
  /** Show Bit mascot */
  showMascot?: boolean;
  /** Bit's mood */
  mascotMood?: 'happy' | 'celebrating' | 'excited';
  /** Category badge */
  category?: string;
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
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const checkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * SummaryIntent - Review what was learned
 *
 * Displays key learning points from the lesson in a visually engaging way.
 * Perfect for reinforcing concepts before moving on.
 *
 * @example
 * ```tsx
 * <SummaryIntent
 *   title="¡Lo que aprendiste hoy!"
 *   points={[
 *     { id: '1', text: 'El numerador es el número de arriba' },
 *     { id: '2', text: 'El denominador indica el total de partes' },
 *     { id: '3', text: 'Las fracciones representan partes de un todo' },
 *   ]}
 *   closingMessage="¡Excelente trabajo completando esta lección!"
 *   onContinue={() => nextLesson()}
 * />
 * ```
 */
export function SummaryIntent({
  title = '¡Lo que aprendiste!',
  subtitle,
  points,
  closingMessage,
  showMascot = true,
  mascotMood = 'celebrating',
  category = 'Resumen',
  ctaText = 'Continuar',
  onContinue,
  className,
}: SummaryIntentProps) {
  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.12,
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

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 py-8"
      >
        {/* Mascot */}
        {showMascot && (
          <motion.div variants={itemVariants} className="mb-4">
            <BitMascot mood={mascotMood} size="md" />
          </motion.div>
        )}

        {/* Badge */}
        <motion.div variants={itemVariants}>
          <Badge variant="level" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            {category}
          </Badge>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-2xl md:text-3xl font-bold text-white text-center mb-2"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p variants={itemVariants} className="text-white/60 text-center mb-6">
            {subtitle}
          </motion.p>
        )}

        {/* Summary points */}
        <motion.div variants={itemVariants} className="w-full max-w-lg space-y-3 mb-6">
          {points.map((point, index) => (
            <motion.div
              key={point.id}
              variants={itemVariants}
              custom={index}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                background: backgrounds.card,
                backdropFilter: `blur(${blur.md})`,
                border: `1px solid ${borders.subtle}`,
              }}
            >
              {/* Check icon */}
              <motion.div
                variants={checkVariants}
                className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                {point.icon || <Check className="w-4 h-4 text-white" />}
              </motion.div>

              {/* Text */}
              <p className="text-white/90 leading-relaxed">{point.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing message */}
        {closingMessage && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 text-white/60 text-center"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <p>{closingMessage}</p>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Continue button */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pb-6 flex justify-center"
      >
        <Button variant="primary" size="lg" onClick={onContinue}>
          {ctaText}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}

SummaryIntent.displayName = 'SummaryIntent';
