'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button, Card } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings, shadows } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface HeroIntentProps {
  /** Main title - the hook that catches attention */
  title: string;
  /** Subtitle with more context */
  subtitle?: string;
  /** Optional icon (defaults to Sparkles) */
  icon?: ReactNode;
  /** Background variant */
  variant?: 'gradient' | 'ambient' | 'minimal';
  /** CTA button text */
  ctaText?: string;
  /** Called when user clicks CTA */
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
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...lessonSprings.button,
      delay: 0.2,
    },
  },
};

const glowVariants = {
  initial: { opacity: 0.3, scale: 0.8 },
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [0.8, 1.2, 0.8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * HeroIntent - Welcome/Introduction slide for lessons
 *
 * Full-viewport hero with animated icon, title, subtitle, and CTA.
 * Creates excitement and sets the tone for the lesson.
 *
 * @example
 * ```tsx
 * <HeroIntent
 *   title="¡Bienvenido a Fracciones!"
 *   subtitle="Aprenderás a dividir pizzas, chocolates y muchas cosas más"
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function HeroIntent({
  title,
  subtitle,
  icon,
  variant = 'gradient',
  ctaText = '¡Empezar!',
  onContinue,
  className,
}: HeroIntentProps) {
  return (
    <div
      className={clsx(
        'h-[100dvh] w-full overflow-hidden relative flex items-center justify-center',
        className,
      )}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow orbs */}
      {variant !== 'minimal' && (
        <>
          <motion.div
            variants={glowVariants}
            initial="initial"
            animate="animate"
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'var(--house-primary)',
              filter: `blur(${blur['2xl']})`,
              opacity: 0.2,
            }}
          />
          <motion.div
            variants={glowVariants}
            initial="initial"
            animate="animate"
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: 'var(--house-secondary)',
              filter: `blur(${blur['2xl']})`,
              opacity: 0.15,
              animationDelay: '2s',
            }}
          />
        </>
      )}

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
      >
        {/* Icon container */}
        <motion.div variants={iconVariants} className="mb-8">
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
              boxShadow: shadows.houseGlow,
            }}
          >
            {/* Inner glow */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
              }}
            />
            {icon || <Sparkles className="w-14 h-14 text-white relative z-10" />}
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-white/70 mb-10 max-w-md leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <Button variant="primary" size="lg" onClick={onContinue} className="group">
            <span>{ctaText}</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom fade gradient */}
      <div
        className="absolute bottom-0 left-0 w-full h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${backgrounds.base}, transparent)`,
        }}
      />
    </div>
  );
}

HeroIntent.displayName = 'HeroIntent';
