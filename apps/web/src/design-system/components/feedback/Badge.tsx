'use client';

/**
 * Mateatletas Design System - Badge Component
 */

import { forwardRef } from 'react';
import type { BadgeProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
} as const;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      className = '',
      theme: themeProp,
      variant = 'default',
      size = 'md',
      icon,
      pulse = false,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const variantColors: Record<string, { bg: string; text: string }> = {
      default: { bg: theme.colors.bgCard, text: theme.colors.textMain },
      success: { bg: `${theme.colors.success}20`, text: theme.colors.success },
      warning: { bg: `${theme.colors.warning}20`, text: theme.colors.warning },
      error: { bg: `${theme.colors.error}20`, text: theme.colors.error },
      info: { bg: `${theme.colors.primary}20`, text: theme.colors.primary },
      accent: { bg: `${theme.colors.accent}20`, text: theme.colors.accent },
    };

    const colors = variantColors[variant] ?? variantColors.default;
    const sizeClass = sizeClasses[size];
    const pulseClass = pulse ? 'animate-pulse' : '';

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${pulseClass} ${className}`}
        style={{
          backgroundColor: colors?.bg ?? theme.colors.bgCard,
          color: colors?.text ?? theme.colors.textMain,
          borderRadius: theme.borderRadius,
        }}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;
