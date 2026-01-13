'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, ArrowRight, Star, Lock, Sparkles } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings, shadows } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface NextStep {
  /** Unique identifier */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Icon or emoji */
  icon?: React.ReactNode;
  /** Is this step locked? */
  locked?: boolean;
  /** Is this the recommended next step? */
  recommended?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface NextStepsIntentProps {
  /** Title */
  title?: string;
  /** Subtitle */
  subtitle?: string;
  /** Available next steps */
  steps: NextStep[];
  /** Show Bit mascot */
  showMascot?: boolean;
  /** Bit's mood */
  mascotMood?: 'happy' | 'excited' | 'thinking';
  /** Category badge */
  category?: string;
  /** Show continue button (for default flow) */
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
      staggerChildren: 0.1,
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

const cardVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * NextStepsIntent - What comes next
 *
 * Shows the user available paths after completing a lesson.
 * Can highlight recommended next steps or show branching options.
 *
 * @example
 * ```tsx
 * <NextStepsIntent
 *   title="¿Qué sigue?"
 *   subtitle="Elige tu próxima aventura"
 *   steps={[
 *     { id: '1', title: 'Suma de fracciones', description: 'Aprende a sumar', recommended: true },
 *     { id: '2', title: 'Resta de fracciones', description: 'Aprende a restar' },
 *     { id: '3', title: 'Multiplicación', description: 'Próximamente', locked: true },
 *   ]}
 *   onContinue={() => goToRecommended()}
 * />
 * ```
 */
export function NextStepsIntent({
  title = '¿Qué sigue?',
  subtitle,
  steps,
  showMascot = true,
  mascotMood = 'excited',
  category = 'Siguiente',
  showContinue = true,
  ctaText = 'Ir al siguiente',
  onContinue,
  className,
}: NextStepsIntentProps) {
  const recommendedStep = steps.find((s) => s.recommended);

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
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
            <ArrowRight className="w-3.5 h-3.5" />
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
          <motion.p variants={itemVariants} className="text-white/60 text-center mb-8">
            {subtitle}
          </motion.p>
        )}

        {/* Steps grid */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-2xl grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        >
          {steps.map((step) => (
            <motion.button
              key={step.id}
              variants={cardVariants}
              initial="idle"
              whileHover={!step.locked ? 'hover' : undefined}
              whileTap={!step.locked ? 'tap' : undefined}
              onClick={step.locked ? undefined : step.onClick}
              disabled={step.locked}
              className={clsx(
                'relative p-5 rounded-2xl text-left transition-all',
                step.locked && 'opacity-60 cursor-not-allowed',
                !step.locked && 'cursor-pointer',
              )}
              style={{
                background: step.recommended
                  ? 'linear-gradient(135deg, var(--house-primary-alpha) 0%, var(--house-secondary-alpha) 100%)'
                  : backgrounds.card,
                backdropFilter: `blur(${blur.md})`,
                border: step.recommended
                  ? '2px solid var(--house-primary)'
                  : `1px solid ${borders.subtle}`,
                boxShadow: step.recommended ? shadows.houseGlow : undefined,
              }}
            >
              {/* Recommended badge */}
              {step.recommended && (
                <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Recomendado
                </div>
              )}

              {/* Lock overlay */}
              {step.locked && (
                <div className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white/50" />
                </div>
              )}

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                {step.icon || <Sparkles className="w-5 h-5 text-white/70" />}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>

              {/* Description */}
              {step.description && <p className="text-sm text-white/50">{step.description}</p>}

              {/* Arrow */}
              {!step.locked && (
                <div className="absolute bottom-4 right-4">
                  <ChevronRight className="w-5 h-5 text-white/30" />
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Continue button */}
      {showContinue && recommendedStep && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-6 pb-6 flex justify-center"
        >
          <Button variant="primary" size="lg" onClick={onContinue || recommendedStep.onClick}>
            {ctaText}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

NextStepsIntent.displayName = 'NextStepsIntent';
