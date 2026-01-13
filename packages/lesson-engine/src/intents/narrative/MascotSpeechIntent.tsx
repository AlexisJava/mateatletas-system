'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Heart, Star, Zap, Trophy, Sparkles } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings, shadows } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export type SpeechType = 'motivation' | 'encouragement' | 'celebration' | 'tip' | 'introduction';

export interface MascotSpeechIntentProps {
  /** Main message from Bit */
  message: string;
  /** Type of speech affects styling and icon */
  type?: SpeechType;
  /** Bit's mood */
  mood?: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'excited';
  /** Optional title/heading */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Button text */
  ctaText?: string;
  /** Called when user continues */
  onComplete?: () => void;
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const mascotVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...lessonSprings.button,
      delay: 0.2,
    },
  },
};

const pulseGlow = {
  initial: { opacity: 0.3, scale: 0.9 },
  animate: {
    opacity: [0.3, 0.5, 0.3],
    scale: [0.9, 1.1, 0.9],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// =============================================================================
// HELPERS
// =============================================================================

interface TypeConfig {
  icon: React.ReactNode;
  label: string;
  gradient: string;
}

function getTypeConfig(type: SpeechType): TypeConfig {
  switch (type) {
    case 'motivation':
      return {
        icon: <Zap className="w-5 h-5" />,
        label: 'Motivación',
        gradient: 'from-amber-500 to-orange-500',
      };
    case 'encouragement':
      return {
        icon: <Heart className="w-5 h-5" />,
        label: 'Ánimo',
        gradient: 'from-pink-500 to-rose-500',
      };
    case 'celebration':
      return {
        icon: <Trophy className="w-5 h-5" />,
        label: 'Celebración',
        gradient: 'from-yellow-400 to-amber-500',
      };
    case 'tip':
      return {
        icon: <Star className="w-5 h-5" />,
        label: 'Consejo',
        gradient: 'from-cyan-500 to-blue-500',
      };
    case 'introduction':
    default:
      return {
        icon: <Sparkles className="w-5 h-5" />,
        label: 'Hola',
        gradient: 'from-violet-500 to-purple-500',
      };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * MascotSpeechIntent - Bit delivers a motivational message
 *
 * Full-screen message from Bit with emotional impact.
 * Perfect for motivation, encouragement, and celebrations.
 *
 * @example
 * ```tsx
 * <MascotSpeechIntent
 *   type="motivation"
 *   mood="excited"
 *   title="¡Tú puedes!"
 *   message="Cada problema que resuelves te hace más fuerte. ¡Sigue adelante!"
 *   ctaText="¡Vamos!"
 *   onComplete={() => nextSlide()}
 * />
 * ```
 */
export function MascotSpeechIntent({
  message,
  type = 'introduction',
  mood = 'happy',
  title,
  subtitle,
  ctaText = 'Continuar',
  onComplete,
  className,
}: MascotSpeechIntentProps) {
  const config = getTypeConfig(type);

  return (
    <div
      className={clsx(
        'h-[100dvh] w-full overflow-hidden relative flex flex-col items-center justify-center',
        className,
      )}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glows */}
      <motion.div
        variants={pulseGlow}
        initial="initial"
        animate="animate"
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.15,
        }}
      />
      <motion.div
        variants={pulseGlow}
        initial="initial"
        animate="animate"
        className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-secondary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
          animationDelay: '1.5s',
        }}
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <Badge
            variant="level"
            className={clsx(
              'inline-flex items-center gap-2 mb-6',
              `bg-gradient-to-r ${config.gradient} text-white border-0`,
            )}
          >
            {config.icon}
            {config.label}
          </Badge>
        </motion.div>

        {/* Bit mascot */}
        <motion.div variants={mascotVariants} className="mb-8">
          <motion.div variants={floatAnimation} animate="animate">
            <BitMascot mood={mood} size="lg" />
          </motion.div>
        </motion.div>

        {/* Title */}
        {title && (
          <motion.h1
            variants={fadeUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            {title}
          </motion.h1>
        )}

        {/* Message bubble */}
        <motion.div
          variants={fadeUp}
          className="p-6 md:p-8 rounded-3xl relative max-w-xl"
          style={{
            background: backgrounds.card,
            backdropFilter: `blur(${blur.md})`,
            border: `1px solid ${borders.subtle}`,
            boxShadow: shadows.houseGlow,
          }}
        >
          {/* Gradient accent */}
          <div
            className={clsx(
              'absolute -top-1 left-1/2 -translate-x-1/2 w-1/3 h-1.5 rounded-b-full',
              `bg-gradient-to-r ${config.gradient}`,
            )}
          />

          <p className="text-lg md:text-xl text-white/90 leading-relaxed">{message}</p>
        </motion.div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p variants={fadeUp} className="text-white/60 mt-4 text-base">
            {subtitle}
          </motion.p>
        )}

        {/* CTA Button */}
        <motion.div variants={fadeUp} className="mt-10">
          <Button variant="primary" size="lg" onClick={onComplete} className="group">
            <span>{ctaText}</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

MascotSpeechIntent.displayName = 'MascotSpeechIntent';
