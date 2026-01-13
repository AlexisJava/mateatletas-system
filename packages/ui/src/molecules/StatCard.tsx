import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../primitives/Card';
import { backgrounds } from '../tokens/lesson';

export type StatCardStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatCardProps {
  /** Main stat value */
  value: string | number;
  /** Label describing the stat */
  label: string;
  /** Icon to display (component or element) */
  icon?: ReactNode;
  /** Change percentage (positive = up, negative = down, 0 = neutral) */
  change?: number;
  /** Change label (e.g., "vs last month") */
  changeLabel?: string;
  /** Status for icon background color */
  status?: StatCardStatus;
  /** Custom background color for icon container (overrides status) */
  iconBg?: string;
  /** Custom icon color (overrides status) */
  iconColor?: string;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
  /** Use admin theme variables */
  adminTheme?: boolean;
}

/**
 * StatCard - Molecule for displaying statistics
 *
 * Combines Card + Badge + Icon into a reusable stats display.
 * Replaces 8+ duplicated StatCard variants across the admin portal.
 *
 * @example
 * ```tsx
 * <StatCard
 *   value="1,234"
 *   label="Estudiantes Activos"
 *   icon={<Users />}
 *   change={12.5}
 *   changeLabel="vs mes anterior"
 * />
 * ```
 */
/**
 * Status-based style configurations
 */
const STATUS_STYLES = {
  success: {
    text: 'text-green-400',
    bg: 'bg-green-400/10',
    adminText: 'text-[var(--status-success)]',
    adminBg: 'bg-[var(--status-success-muted)]',
  },
  warning: {
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    adminText: 'text-[var(--status-warning)]',
    adminBg: 'bg-[var(--status-warning-muted)]',
  },
  danger: {
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    adminText: 'text-[var(--status-danger)]',
    adminBg: 'bg-[var(--status-danger-muted)]',
  },
  info: {
    text: 'text-blue-400',
    bg: 'bg-blue-400/10',
    adminText: 'text-[var(--status-info)]',
    adminBg: 'bg-[var(--status-info-muted)]',
  },
  neutral: {
    text: 'text-slate-400',
    bg: 'bg-slate-400/10',
    adminText: 'text-[var(--admin-accent)]',
    adminBg: 'bg-[var(--admin-accent-muted)]',
  },
};

export function StatCard({
  value,
  label,
  icon,
  change,
  changeLabel,
  status = 'neutral',
  iconBg,
  iconColor,
  loading = false,
  onClick,
  className,
  adminTheme = false,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  // Get trend colors based on direction
  const trendStatus = isPositive ? 'success' : isNegative ? 'danger' : 'neutral';
  const trendStyles = STATUS_STYLES[trendStatus];
  const trendColor = adminTheme ? trendStyles.adminText : trendStyles.text;
  const trendBg = adminTheme ? trendStyles.adminBg : trendStyles.bg;

  // Get icon colors based on status
  const statusStyles = STATUS_STYLES[status];
  const iconColorClass = iconColor || (adminTheme ? statusStyles.adminText : statusStyles.text);
  const iconBgClass = iconBg || (adminTheme ? statusStyles.adminBg : statusStyles.bg);

  if (loading) {
    return (
      <Card variant="base" className={clsx('animate-pulse', className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl" style={{ background: backgrounds.surface }} />
          <div className="w-16 h-6 rounded-full" style={{ background: backgrounds.surface }} />
        </div>
        <div className="w-24 h-8 rounded mb-2" style={{ background: backgrounds.surface }} />
        <div className="w-32 h-4 rounded" style={{ background: backgrounds.surface }} />
      </Card>
    );
  }

  // Admin theme uses different base styling
  if (adminTheme) {
    return (
      <div
        className={clsx(
          'group p-5 rounded-2xl transition-all duration-300 hover:shadow-lg',
          'bg-[var(--admin-surface-1)] border border-[var(--admin-border)]',
          'hover:border-[var(--admin-border-accent)]',
          onClick && 'cursor-pointer',
          className,
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          {/* Icon container */}
          {icon && (
            <div
              className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', iconBgClass)}
            >
              <div className={clsx('w-5 h-5', iconColorClass)}>{icon}</div>
            </div>
          )}

          {/* Change badge */}
          {change !== undefined && change !== null && (
            <div
              className={clsx(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                trendBg,
              )}
            >
              <TrendIcon className={clsx('w-3 h-3', trendColor)} />
              <span className={trendColor}>
                {isPositive && '+'}
                {change}%
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div>
          <p className="text-2xl font-bold text-[var(--admin-text)] mb-1">{value}</p>
          <p className="text-sm text-[var(--admin-text-muted)]">{label}</p>
          {changeLabel && (
            <p className="text-xs text-[var(--admin-text-disabled)] mt-1">{changeLabel}</p>
          )}
        </div>
      </div>
    );
  }

  // Default house-themed styling
  return (
    <Card variant="base" hover onClick={onClick} className={className}>
      <div className="flex items-start justify-between mb-4">
        {/* Icon container */}
        {icon && (
          <div
            className="p-3 rounded-xl text-white"
            style={{
              background:
                iconBg || 'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
            }}
          >
            {icon}
          </div>
        )}

        {/* Change badge */}
        {change !== undefined && (
          <div className={clsx('flex items-center gap-1 px-2 py-1 rounded-full text-sm', trendBg)}>
            <TrendIcon className={clsx('w-3 h-3', trendColor)} />
            <span className={trendColor}>
              {isPositive && '+'}
              {change}%
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <motion.div
        className="text-3xl font-bold text-white mb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.div>

      {/* Label */}
      <div className="text-sm text-slate-400">{label}</div>

      {/* Change label */}
      {changeLabel && <div className="text-xs text-slate-500 mt-1">{changeLabel}</div>}
    </Card>
  );
}

StatCard.displayName = 'StatCard';
