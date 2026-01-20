'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  animate?: boolean;
}

export function GlassCard({ children, className = '', glowColor, animate = true }: GlassCardProps) {
  const Wrapper = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Wrapper
      {...animationProps}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
        ${className}
      `}
    >
      {/* Subtle top gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 40%)',
        }}
      />

      {/* Optional glow effect */}
      {glowColor && (
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: glowColor }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </Wrapper>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function KPICard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  trend = 'neutral',
}: KPICardProps) {
  const trendColors = {
    up: '#10b981',
    down: '#ef4444',
    neutral: 'var(--admin-text-muted)',
  };

  return (
    <GlassCard glowColor={`${color}30`} className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--admin-text-muted)] mb-1">{label}</p>
          <p className="text-3xl font-bold tracking-tight" style={{ color }}>
            {value}
          </p>
          {/* Always reserve space for change line to keep cards same height */}
          <div className="flex items-center gap-1 mt-2 min-h-[20px]">
            {change !== undefined ? (
              <>
                <span className="text-sm font-medium" style={{ color: trendColors[trend] }}>
                  {trend === 'up' && '+'}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-[var(--admin-text-muted)]">{changeLabel}</span>
                )}
              </>
            ) : (
              <span className="text-xs text-[var(--admin-text-muted)] opacity-0">-</span>
            )}
          </div>
        </div>

        {/* Icon with glow */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${color}15`,
            boxShadow: `0 0 20px ${color}20`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color, filter: `drop-shadow(0 0 8px ${color}80)` }} />
        </div>
      </div>
    </GlassCard>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
}

export function MiniStat({ label, value, color = 'var(--admin-text)' }: MiniStatProps) {
  return (
    <div className="text-center py-7 px-2">
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-sm text-[var(--admin-text-muted)] mt-1">{label}</p>
    </div>
  );
}
