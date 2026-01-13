'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Trophy, Star, Zap, Flame, ChevronRight, Sparkles } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface RewardItem {
  type: 'xp' | 'streak' | 'achievement' | 'level' | 'custom';
  value: number | string;
  label: string;
  icon?: ReactNode;
}

export interface RewardIntentProps {
  /** Main celebration title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Rewards earned */
  rewards: RewardItem[];
  /** Show confetti animation */
  showConfetti?: boolean;
  /** Show Bit celebrating */
  showMascot?: boolean;
  /** Custom celebration icon */
  icon?: ReactNode;
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
      delayChildren: 0.3,
    },
  },
};

const bounceIn = {
  hidden: { opacity: 0, scale: 0, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
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

const rewardItemVariants = {
  hidden: { opacity: 0, scale: 0.8, x: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: lessonSprings.button,
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const confettiVariants = {
  initial: { y: -100, opacity: 0, rotate: 0 },
  animate: (i: number) => ({
    y: 800,
    opacity: [0, 1, 1, 0],
    rotate: 360 * (i % 2 === 0 ? 1 : -1),
    transition: {
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 0.5,
      ease: 'linear',
      repeat: Infinity,
    },
  }),
};

// =============================================================================
// CONFETTI COMPONENT
// =============================================================================

function Confetti() {
  const colors = [
    'var(--house-primary)',
    'var(--house-secondary)',
    '#fbbf24', // amber
    '#f472b6', // pink
    '#60a5fa', // blue
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={confettiVariants}
          initial="initial"
          animate="animate"
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
          }}
        />
      ))}
    </div>
  );
}

// =============================================================================
// REWARD ICON COMPONENT
// =============================================================================

function RewardIcon({ type, icon }: { type: RewardItem['type']; icon?: ReactNode }) {
  if (icon) return <>{icon}</>;

  switch (type) {
    case 'xp':
      return <Zap className="w-6 h-6" />;
    case 'streak':
      return <Flame className="w-6 h-6" />;
    case 'achievement':
      return <Trophy className="w-6 h-6" />;
    case 'level':
      return <Star className="w-6 h-6" />;
    default:
      return <Sparkles className="w-6 h-6" />;
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * RewardIntent - Celebration/reward screen
 *
 * Displays XP, achievements, and other rewards with celebration animations.
 * Used after completing sections or achieving milestones.
 *
 * @example
 * ```tsx
 * <RewardIntent
 *   title="¡Excelente trabajo!"
 *   subtitle="Completaste la lección de fracciones"
 *   rewards={[
 *     { type: 'xp', value: 50, label: 'XP ganados' },
 *     { type: 'streak', value: 5, label: 'Días de racha' },
 *   ]}
 *   showConfetti
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function RewardIntent({
  title,
  subtitle,
  rewards,
  showConfetti = true,
  showMascot = true,
  icon,
  onContinue,
  className,
}: RewardIntentProps) {
  const [showContent, setShowContent] = useState(false);

  // Delay content for dramatic effect
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={clsx(
        'h-[100dvh] w-full overflow-hidden relative flex flex-col items-center justify-center',
        className,
      )}
      style={{ background: backgrounds.base }}
    >
      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Ambient glows */}
      <motion.div
        variants={pulseVariants}
        animate="animate"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.15,
        }}
      />
      <motion.div
        variants={pulseVariants}
        animate="animate"
        className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-secondary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
          animationDelay: '1s',
        }}
      />

      {/* Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg"
          >
            {/* Mascot */}
            {showMascot && (
              <motion.div variants={bounceIn} className="mb-4">
                <BitMascot mood="celebrating" size="md" />
              </motion.div>
            )}

            {/* Main icon */}
            {!showMascot && (
              <motion.div variants={bounceIn} className="mb-6">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  >
                    {icon || <Trophy className="w-12 h-12 text-white" />}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-2">
              {title}
            </motion.h1>

            {/* Subtitle */}
            {subtitle && (
              <motion.p variants={fadeUp} className="text-lg text-white/70 mb-8">
                {subtitle}
              </motion.p>
            )}

            {/* Rewards grid */}
            <motion.div
              variants={containerVariants}
              className="flex flex-wrap justify-center gap-4 mb-10"
            >
              {rewards.map((reward, index) => (
                <motion.div
                  key={index}
                  variants={rewardItemVariants}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                  style={{
                    background: backgrounds.card,
                    backdropFilter: `blur(${blur.md})`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        reward.type === 'xp'
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : reward.type === 'streak'
                            ? 'linear-gradient(135deg, #f97316, #ef4444)'
                            : 'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
                    }}
                  >
                    <span className="text-white">
                      <RewardIcon type={reward.type} icon={reward.icon} />
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-white">
                      {typeof reward.value === 'number' && reward.type === 'xp' && '+'}
                      {reward.value}
                      {reward.type === 'xp' && ' XP'}
                    </p>
                    <p className="text-sm text-white/50">{reward.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Continue button */}
            <motion.div variants={fadeUp}>
              <Button variant="primary" size="lg" onClick={onContinue}>
                Continuar
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

RewardIntent.displayName = 'RewardIntent';
