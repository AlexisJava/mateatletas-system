'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Award, Lock, Star } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings, shadows } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface AchievementIntentProps {
  /** Achievement title */
  title: string;
  /** Achievement description */
  description: string;
  /** Icon or emoji */
  icon?: string;
  /** Achievement tier/rarity */
  tier?: 'common' | 'rare' | 'epic' | 'legendary';
  /** XP reward */
  xpReward?: number;
  /** Whether this is a new unlock */
  isNewUnlock?: boolean;
  /** Progress towards achievement (0-100) */
  progress?: number;
  /** Progress label */
  progressLabel?: string;
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
      staggerChildren: 0.12,
      delayChildren: 0.2,
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

const badgeUnlock = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.3,
    },
  },
};

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const sparkleVariants = {
  animate: (i: number) => ({
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      delay: i * 0.2,
    },
  }),
};

// =============================================================================
// HELPERS
// =============================================================================

interface TierConfig {
  gradient: string;
  glowColor: string;
  label: string;
}

function getTierConfig(tier: AchievementIntentProps['tier']): TierConfig {
  switch (tier) {
    case 'legendary':
      return {
        gradient: 'from-amber-400 via-yellow-300 to-amber-500',
        glowColor: 'rgba(251, 191, 36, 0.5)',
        label: 'Legendario',
      };
    case 'epic':
      return {
        gradient: 'from-purple-500 via-violet-400 to-purple-600',
        glowColor: 'rgba(168, 85, 247, 0.5)',
        label: 'Épico',
      };
    case 'rare':
      return {
        gradient: 'from-blue-500 via-cyan-400 to-blue-600',
        glowColor: 'rgba(59, 130, 246, 0.5)',
        label: 'Raro',
      };
    case 'common':
    default:
      return {
        gradient: 'from-gray-400 via-slate-300 to-gray-500',
        glowColor: 'rgba(148, 163, 184, 0.5)',
        label: 'Común',
      };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * AchievementIntent - Unlock achievement celebration
 *
 * Dramatic reveal of an unlocked achievement with tier styling.
 * Perfect for milestone celebrations and special rewards.
 *
 * @example
 * ```tsx
 * <AchievementIntent
 *   title="Maestro de Fracciones"
 *   description="Completaste 10 lecciones de fracciones"
 *   icon="🏆"
 *   tier="epic"
 *   xpReward={100}
 *   isNewUnlock
 *   onComplete={() => nextSlide()}
 * />
 * ```
 */
export function AchievementIntent({
  title,
  description,
  icon = '🏆',
  tier = 'common',
  xpReward,
  isNewUnlock = true,
  progress,
  progressLabel,
  onComplete,
  className,
}: AchievementIntentProps) {
  const config = getTierConfig(tier);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isNewUnlock) {
      const timer = setTimeout(() => setShowSparkles(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isNewUnlock]);

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
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: config.glowColor,
          filter: `blur(${blur['2xl']})`,
        }}
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg"
      >
        {/* New unlock badge */}
        {isNewUnlock && (
          <motion.div variants={fadeUp}>
            <Badge
              variant="level"
              className={clsx(
                'inline-flex items-center gap-2 mb-6',
                `bg-gradient-to-r ${config.gradient} text-white border-0`,
              )}
            >
              <Award className="w-4 h-4" />
              ¡Logro Desbloqueado!
            </Badge>
          </motion.div>
        )}

        {/* Achievement badge */}
        <motion.div variants={badgeUnlock} className="relative mb-8">
          {/* Sparkles */}
          <AnimatePresence>
            {showSparkles && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={sparkleVariants}
                    animate="animate"
                    className="absolute w-2 h-2"
                    style={{
                      left: `${50 + Math.cos((i * Math.PI) / 4) * 80}%`,
                      top: `${50 + Math.sin((i * Math.PI) / 4) * 80}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <Star
                      className="w-full h-full"
                      style={{ color: config.glowColor, fill: config.glowColor }}
                    />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Badge container */}
          <div
            className={clsx(
              'w-32 h-32 rounded-3xl flex items-center justify-center relative',
              `bg-gradient-to-br ${config.gradient}`,
            )}
            style={{
              boxShadow: `0 0 60px ${config.glowColor}`,
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              variants={shimmer}
              animate="animate"
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                backgroundSize: '200% 100%',
              }}
            />
            <span className="text-6xl relative z-10">{icon}</span>
          </div>
        </motion.div>

        {/* Tier label */}
        <motion.div variants={fadeUp}>
          <span
            className={clsx(
              'text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full',
              `bg-gradient-to-r ${config.gradient} text-white`,
            )}
          >
            {config.label}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          className="text-3xl md:text-4xl font-bold text-white mt-4"
          style={{ letterSpacing: '-0.02em' }}
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p variants={fadeUp} className="text-white/70 mt-3 text-lg leading-relaxed">
          {description}
        </motion.p>

        {/* XP Reward */}
        {xpReward && (
          <motion.div
            variants={fadeUp}
            className="mt-6 px-6 py-3 rounded-2xl"
            style={{
              background: backgrounds.card,
              backdropFilter: `blur(${blur.md})`,
              border: `1px solid ${borders.subtle}`,
              boxShadow: shadows.houseGlow,
            }}
          >
            <p className="text-2xl font-bold" style={{ color: config.glowColor }}>
              +{xpReward} XP
            </p>
          </motion.div>
        )}

        {/* Progress (if not unlocked) */}
        {!isNewUnlock && progress !== undefined && (
          <motion.div variants={fadeUp} className="mt-6 w-full max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm">Progreso</span>
              <span className="text-white/70 text-sm">{progressLabel || `${progress}%`}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={clsx('h-full rounded-full', `bg-gradient-to-r ${config.gradient}`)}
              />
            </div>
            <div className="flex items-center gap-1 mt-2 text-white/40 text-xs">
              <Lock className="w-3 h-3" />
              <span>Aún no desbloqueado</span>
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.div variants={fadeUp} className="mt-10">
          <Button variant="primary" size="lg" onClick={onComplete}>
            Continuar
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

AchievementIntent.displayName = 'AchievementIntent';
