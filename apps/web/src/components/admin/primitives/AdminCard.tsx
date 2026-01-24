'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  animate?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_STYLES = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function AdminCard({
  children,
  glowColor,
  animate = true,
  padding = 'md',
  className,
}: AdminCardProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.95 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      transition={animate ? { duration: 0.3 } : undefined}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/[0.03] backdrop-blur-xl',
        'border border-white/[0.08]',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]',
        PADDING_STYLES[padding],
        className,
      )}
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
    </motion.div>
  );
}
