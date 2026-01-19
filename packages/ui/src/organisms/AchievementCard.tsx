import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Lock, Star } from 'lucide-react';
import { Card } from '../primitives/Card';

export interface AchievementCardProps {
  /** Achievement title */
  title: string;
  /** Achievement description */
  description?: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Whether this achievement is unlocked */
  unlocked?: boolean;
  /** Unlock date (if unlocked) */
  unlockedAt?: string | Date;
  /** Rarity level */
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
}

const rarityConfig = {
  common: {
    gradient: 'from-slate-400 to-slate-500',
    text: 'Común',
    glow: 'rgba(148, 163, 184, 0.3)',
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    text: 'Raro',
    glow: 'rgba(96, 165, 250, 0.3)',
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    text: 'Épico',
    glow: 'rgba(168, 85, 247, 0.3)',
  },
  legendary: {
    gradient: 'from-amber-400 to-orange-500',
    text: 'Legendario',
    glow: 'rgba(251, 191, 36, 0.3)',
  },
};

/**
 * AchievementCard - Organism for displaying achievements/badges
 *
 * Shows achievement with icon, rarity, and unlock status.
 * Locked achievements are grayed out with a lock overlay.
 *
 * @example
 * ```tsx
 * <AchievementCard
 *   title="Primera Lección"
 *   description="Completa tu primera lección"
 *   icon={<BookOpen />}
 *   unlocked
 *   rarity="common"
 * />
 *
 * <AchievementCard
 *   title="Maestro del Código"
 *   icon={<Code />}
 *   rarity="legendary"
 *   unlocked={false}
 * />
 * ```
 */
export function AchievementCard({
  title,
  description,
  icon,
  unlocked = false,
  unlockedAt,
  rarity = 'common',
  onClick,
  className,
}: AchievementCardProps) {
  const rarityInfo = rarityConfig[rarity];

  // Format unlock date if provided
  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.02 } : {}}
      whileTap={unlocked ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="achievement"
        hover={unlocked}
        onClick={onClick}
        className={clsx(
          'cursor-pointer transition-all duration-300',
          !unlocked && 'opacity-60 grayscale',
          className,
        )}
      >
        {/* Gradient overlay for unlocked */}
        {unlocked && (
          <div
            className="absolute inset-0 opacity-5 pointer-events-none rounded-3xl"
            style={{
              background: `linear-gradient(to right, var(--house-primary), transparent)`,
            }}
          />
        )}

        <div className="flex items-center gap-4 relative z-10">
          {/* Icon container */}
          <div
            className={clsx(
              'relative w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0',
              !unlocked && 'bg-slate-700',
            )}
            style={
              unlocked
                ? {
                    background: `linear-gradient(135deg, var(--house-primary), var(--house-secondary))`,
                    boxShadow: `0 0 20px ${rarityInfo.glow}`,
                  }
                : {}
            }
          >
            {unlocked ? icon || <Star size={28} /> : <Lock size={24} className="text-slate-500" />}

            {/* Rarity indicator */}
            {unlocked && (
              <div
                className={clsx(
                  'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
                  'text-[10px] font-bold text-white border-2 border-[#0f0f22]',
                  `bg-gradient-to-r ${rarityInfo.gradient}`,
                )}
              >
                {rarity === 'legendary'
                  ? '★'
                  : rarity === 'epic'
                    ? '◆'
                    : rarity === 'rare'
                      ? '●'
                      : '○'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Rarity label */}
            {unlocked && (
              <div
                className={clsx(
                  'text-xs font-bold uppercase tracking-wider mb-1',
                  `bg-gradient-to-r ${rarityInfo.gradient} bg-clip-text text-transparent`,
                )}
              >
                {rarityInfo.text}
              </div>
            )}

            {/* Title */}
            <h4
              className={clsx(
                'font-bold text-lg leading-tight',
                unlocked ? 'text-white' : 'text-slate-400',
              )}
            >
              {title}
            </h4>

            {/* Description */}
            {description && (
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{description}</p>
            )}

            {/* Unlock date */}
            {unlocked && formattedDate && (
              <p className="text-xs text-slate-500 mt-2">Desbloqueado: {formattedDate}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

AchievementCard.displayName = 'AchievementCard';
