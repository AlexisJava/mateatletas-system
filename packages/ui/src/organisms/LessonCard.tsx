import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { BookOpen, Lock, Play, CheckCircle } from 'lucide-react';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Progress } from '../primitives/Progress';
import { Button } from '../primitives/Button';

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface LessonCardProps {
  /** Lesson title */
  title: string;
  /** Category/subject label */
  category?: string;
  /** XP reward for completing */
  xp?: number;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Current status */
  status?: LessonStatus;
  /** Thumbnail image URL */
  thumbnail?: string;
  /** Duration estimate */
  duration?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * Get status-specific UI elements
 */
function getStatusConfig(status: LessonStatus) {
  switch (status) {
    case 'locked':
      return {
        icon: <Lock size={24} />,
        buttonText: 'Bloqueado',
        buttonVariant: 'ghost' as const,
        disabled: true,
        opacity: 'opacity-60 grayscale',
      };
    case 'completed':
      return {
        icon: <CheckCircle size={24} className="text-green-400" />,
        buttonText: 'Repasar',
        buttonVariant: 'secondary' as const,
        disabled: false,
        opacity: '',
      };
    case 'in_progress':
      return {
        icon: <Play size={24} />,
        buttonText: 'Continuar',
        buttonVariant: 'primary' as const,
        disabled: false,
        opacity: '',
      };
    case 'available':
    default:
      return {
        icon: <BookOpen size={24} />,
        buttonText: 'Comenzar',
        buttonVariant: 'primary' as const,
        disabled: false,
        opacity: '',
      };
  }
}

/**
 * LessonCard - Organism for displaying lesson/course items
 *
 * Shows lesson info with progress, XP reward, and status.
 * Supports locked, available, in-progress, and completed states.
 *
 * @example
 * ```tsx
 * <LessonCard
 *   title="Variables en JavaScript"
 *   category="Programación"
 *   xp={50}
 *   progress={75}
 *   status="in_progress"
 *   onClick={() => navigate('/lesson/1')}
 * />
 * ```
 */
export function LessonCard({
  title,
  category,
  xp,
  progress = 0,
  status = 'available',
  thumbnail,
  duration,
  onClick,
  className,
}: LessonCardProps) {
  const config = getStatusConfig(status);

  return (
    <motion.div whileHover={!config.disabled ? { y: -5 } : {}} transition={{ duration: 0.2 }}>
      <Card variant="lesson" hover={!config.disabled} className={clsx(config.opacity, className)}>
        {/* Background glow for non-locked */}
        {status !== 'locked' && (
          <div
            className="absolute -top-10 -right-10 w-40 h-40 blur-[60px] opacity-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom right, var(--house-primary), var(--house-secondary))',
            }}
          />
        )}

        {/* Thumbnail (optional) */}
        {thumbnail && (
          <div className="relative h-32 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-3xl">
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Header row */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          {/* Icon */}
          <div
            className={clsx(
              'p-3 rounded-2xl backdrop-blur-md',
              status === 'locked' ? 'bg-white/5 text-slate-400' : 'text-white',
            )}
            style={
              status !== 'locked'
                ? {
                    background:
                      'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
                  }
                : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }
            }
          >
            {config.icon}
          </div>

          {/* XP Badge */}
          {xp && status !== 'locked' && <Badge variant="xp">+{xp} XP</Badge>}
        </div>

        {/* Category */}
        {category && (
          <div className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-1">
            {category}
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-2xl mb-4 leading-tight text-slate-100">{title}</h3>

        {/* Duration (if provided) */}
        {duration && <div className="text-sm text-slate-400 mb-4">⏱️ {duration}</div>}

        {/* Progress bar (only for in_progress or completed) */}
        {(status === 'in_progress' || status === 'completed') && (
          <div className="mb-5">
            <Progress value={progress} variant="lesson" size="lg" />
          </div>
        )}

        {/* Action button */}
        <Button
          variant={config.buttonVariant}
          disabled={config.disabled}
          onClick={onClick}
          className="w-full"
        >
          {config.buttonText}
        </Button>
      </Card>
    </motion.div>
  );
}

LessonCard.displayName = 'LessonCard';
