import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Clock, Users, MapPin, Play, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { lessonSprings } from '../tokens/lesson';

export type ClaseStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export interface ProximaClaseCardProps {
  /** Lesson/class title */
  title: string;
  /** Subject/area name */
  subject?: string;
  /** Teacher name */
  teacher?: string;
  /** Start time */
  startTime: string | Date;
  /** End time */
  endTime?: string | Date;
  /** Duration in minutes */
  duration?: number;
  /** Location or virtual room */
  location?: string;
  /** Number of students */
  studentCount?: number;
  /** Class status */
  status?: ClaseStatus;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Click handler */
  onClick?: () => void;
  /** Join/Enter class handler */
  onJoin?: () => void;
  /** Compact mode for sidebars/lists */
  compact?: boolean;
  /** Additional class names */
  className?: string;
  /** Custom icon */
  icon?: ReactNode;
}

/**
 * Format time string or Date to readable format
 */
function formatTime(time: string | Date): string {
  if (typeof time === 'string') {
    // If already formatted string, return as is
    if (time.includes(':') && time.length <= 5) return time;
    time = new Date(time);
  }
  return time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get status configuration
 */
function getStatusConfig(status: ClaseStatus) {
  switch (status) {
    case 'live':
      return {
        label: 'EN VIVO',
        badgeVariant: 'streak' as const,
        pulseColor: 'var(--house-primary)',
        showPulse: true,
      };
    case 'upcoming':
      return {
        label: 'PRÓXIMA',
        badgeVariant: 'level' as const,
        pulseColor: undefined,
        showPulse: false,
      };
    case 'completed':
      return {
        label: 'COMPLETADA',
        badgeVariant: 'xp' as const,
        pulseColor: undefined,
        showPulse: false,
      };
    case 'cancelled':
      return {
        label: 'CANCELADA',
        badgeVariant: 'status' as const,
        pulseColor: undefined,
        showPulse: false,
      };
    default:
      return {
        label: 'PRÓXIMA',
        badgeVariant: 'level' as const,
        pulseColor: undefined,
        showPulse: false,
      };
  }
}

/**
 * ProximaClaseCard - Organism for displaying upcoming/live class information
 *
 * Unified component that replaces 4 duplicate variants across the codebase.
 * Supports compact mode, live status with pulse animation, and house theming.
 *
 * @example
 * ```tsx
 * // Full card
 * <ProximaClaseCard
 *   title="Introducción a Variables"
 *   subject="Programación"
 *   teacher="Prof. García"
 *   startTime="14:00"
 *   duration={60}
 *   status="upcoming"
 *   onClick={() => navigate('/clase/123')}
 * />
 *
 * // Live class
 * <ProximaClaseCard
 *   title="Clase en Progreso"
 *   status="live"
 *   progress={45}
 *   onJoin={() => joinClass()}
 * />
 *
 * // Compact for sidebar
 * <ProximaClaseCard
 *   title="Álgebra Básica"
 *   startTime="16:30"
 *   compact
 * />
 * ```
 */
export function ProximaClaseCard({
  title,
  subject,
  teacher,
  startTime,
  endTime,
  duration,
  location,
  studentCount,
  status = 'upcoming',
  progress,
  onClick,
  onJoin,
  compact = false,
  className,
  icon,
}: ProximaClaseCardProps) {
  const statusConfig = getStatusConfig(status);
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = endTime ? formatTime(endTime) : null;
  const isLive = status === 'live';

  // Compact version for sidebars/lists
  if (compact) {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={lessonSprings.button}
      >
        <Card
          variant="base"
          padding="sm"
          hover
          onClick={onClick}
          className={clsx('cursor-pointer', className)}
        >
          <div className="flex items-center gap-3">
            {/* Time badge */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
              style={{
                background: isLive
                  ? 'linear-gradient(135deg, var(--house-primary), var(--house-secondary))'
                  : 'rgba(255,255,255,0.05)',
              }}
            >
              <span className={clsx('text-sm font-bold', isLive ? 'text-white' : 'text-slate-300')}>
                {formattedStartTime}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">{title}</h4>
              {subject && <p className="text-xs text-slate-400 truncate">{subject}</p>}
            </div>

            {/* Status indicator */}
            {isLive && (
              <div className="relative">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--house-primary)' }}
                />
              </div>
            )}

            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </Card>
      </motion.div>
    );
  }

  // Full card version
  return (
    <motion.div whileHover={{ y: -4 }} transition={lessonSprings.card}>
      <Card
        variant="glass"
        padding="lg"
        hover
        onClick={onClick}
        className={clsx('cursor-pointer relative overflow-hidden', className)}
      >
        {/* Live pulse background */}
        {isLive && (
          <div
            className="absolute inset-0 opacity-10 animate-pulse"
            style={{
              background: `radial-gradient(circle at 50% 50%, var(--house-primary), transparent 70%)`,
            }}
          />
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            {/* Icon container */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
              }}
            >
              {icon ||
                (isLive ? (
                  <Play className="text-white" size={20} />
                ) : (
                  <Calendar className="text-white" size={20} />
                ))}
            </div>

            <div>
              {subject && (
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  {subject}
                </p>
              )}
              <h3 className="font-bold text-lg text-white">{title}</h3>
            </div>
          </div>

          {/* Status badge */}
          <Badge variant={statusConfig.badgeVariant} size="sm">
            {statusConfig.showPulse && (
              <span
                className="w-2 h-2 rounded-full mr-2 animate-pulse"
                style={{ background: statusConfig.pulseColor }}
              />
            )}
            {statusConfig.label}
          </Badge>
        </div>

        {/* Progress bar for live classes */}
        {isLive && typeof progress === 'number' && (
          <div className="mb-4 relative z-10">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--house-primary)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Clock size={14} className="text-slate-500" />
            <span>
              {formattedStartTime}
              {formattedEndTime && ` - ${formattedEndTime}`}
              {duration && !formattedEndTime && ` (${duration}min)`}
            </span>
          </div>

          {/* Students */}
          {typeof studentCount === 'number' && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Users size={14} className="text-slate-500" />
              <span>{studentCount} estudiantes</span>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin size={14} className="text-slate-500" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Teacher */}
          {teacher && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Users size={14} className="text-slate-500" />
              <span className="truncate">{teacher}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {onJoin && isLive && (
          <div className="relative z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              className="w-full py-3 rounded-xl font-medium text-white transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
                boxShadow: '0 4px 15px var(--house-primary-alpha)',
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <Play size={16} />
                Unirse a la clase
              </span>
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

ProximaClaseCard.displayName = 'ProximaClaseCard';
