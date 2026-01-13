'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface LeaderboardEntry {
  /** User ID */
  id: string;
  /** Display name */
  name: string;
  /** Avatar URL or emoji */
  avatar?: string;
  /** Current score/XP */
  score: number;
  /** Position change: positive = moved up, negative = moved down, 0 = same */
  change?: number;
  /** Whether this is the current user */
  isCurrentUser?: boolean;
}

export interface LeaderboardIntentProps {
  /** Leaderboard title */
  title?: string;
  /** Subtitle/context */
  subtitle?: string;
  /** Leaderboard entries (ordered by rank) */
  entries: LeaderboardEntry[];
  /** Score label */
  scoreLabel?: string;
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
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const entryVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...lessonSprings.card,
      delay: i * 0.1,
    },
  }),
};

// =============================================================================
// HELPERS
// =============================================================================

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-400" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-300" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return null;
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
      };
    case 2:
      return {
        bg: 'bg-gradient-to-r from-gray-400/20 to-slate-400/20',
        border: 'border-gray-400/50',
        text: 'text-gray-300',
      };
    case 3:
      return {
        bg: 'bg-gradient-to-r from-amber-600/20 to-orange-600/20',
        border: 'border-amber-600/50',
        text: 'text-amber-500',
      };
    default:
      return {
        bg: 'bg-white/[0.03]',
        border: 'border-white/10',
        text: 'text-white/50',
      };
  }
}

function getChangeIcon(change: number | undefined) {
  if (!change || change === 0) return <Minus className="w-4 h-4 text-white/30" />;
  if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
  return <TrendingDown className="w-4 h-4 text-red-400" />;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * LeaderboardIntent - Display rankings/leaderboard
 *
 * Shows ranked list of players with scores and position changes.
 * Highlights current user's position.
 *
 * @example
 * ```tsx
 * <LeaderboardIntent
 *   title="Tabla de Líderes"
 *   subtitle="Esta semana"
 *   scoreLabel="XP"
 *   entries={[
 *     { id: '1', name: 'Ana', score: 1250, avatar: '👩', change: 2 },
 *     { id: '2', name: 'Carlos', score: 1180, avatar: '👦', change: -1, isCurrentUser: true },
 *     { id: '3', name: 'María', score: 1120, avatar: '👧', change: 1 },
 *   ]}
 *   onComplete={() => nextSlide()}
 * />
 * ```
 */
export function LeaderboardIntent({
  title = 'Tabla de Líderes',
  subtitle,
  entries,
  scoreLabel = 'XP',
  onComplete,
  className,
}: LeaderboardIntentProps) {
  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pt-6"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Badge variant="level" className="inline-flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" />
            Rankings
          </Badge>
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mt-3">
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p variants={fadeUp} className="text-white/50 mt-1">
            {subtitle}
          </motion.p>
        )}
      </motion.div>

      {/* Leaderboard */}
      <div className="flex-1 relative z-10 px-6 py-6 overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 max-w-2xl mx-auto"
        >
          {entries.map((entry, index) => {
            const rank = index + 1;
            const style = getRankStyle(rank);

            return (
              <motion.div
                key={entry.id}
                custom={index}
                variants={entryVariants}
                className={clsx(
                  'p-4 rounded-2xl border flex items-center gap-4 transition-all',
                  style.bg,
                  style.border,
                  entry.isCurrentUser &&
                    'ring-2 ring-[var(--house-primary)] ring-offset-2 ring-offset-[#0a0a0f]',
                )}
                style={{
                  backdropFilter: `blur(${blur.md})`,
                }}
              >
                {/* Rank */}
                <div
                  className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-bold',
                    rank <= 3 ? style.bg : 'bg-white/10',
                    style.text,
                  )}
                >
                  {getRankIcon(rank) || rank}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                  {entry.avatar || '👤'}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={clsx(
                      'font-semibold truncate',
                      entry.isCurrentUser ? 'text-[var(--house-primary)]' : 'text-white',
                    )}
                  >
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="text-xs text-white/50 ml-2">(Tú)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(entry.change)}
                    {entry.change !== undefined && entry.change !== 0 && (
                      <span
                        className={clsx(
                          'text-xs',
                          entry.change > 0 ? 'text-green-400' : 'text-red-400',
                        )}
                      >
                        {entry.change > 0 ? `+${entry.change}` : entry.change}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className={clsx('text-xl font-bold', rank <= 3 ? style.text : 'text-white')}>
                    {entry.score.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">{scoreLabel}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={lessonSprings.button}
        className="relative z-10 px-6 pb-6 flex justify-center"
      >
        <Button variant="primary" size="lg" onClick={onComplete}>
          Continuar
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}

LeaderboardIntent.displayName = 'LeaderboardIntent';
