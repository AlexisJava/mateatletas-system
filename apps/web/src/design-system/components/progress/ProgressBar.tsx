'use client';

/**
 * Mateatletas Design System - ProgressBar Component
 * Barra de progreso con animación y tema
 */

import { forwardRef } from 'react';
import type { ProgressBarProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className = '',
      theme: themeProp,
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      showLabel = false,
      label,
      animate = true,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-5',
    };

    const getVariantColor = () => {
      switch (variant) {
        case 'success':
          return theme.colors.success;
        case 'warning':
          return theme.colors.warning;
        case 'error':
          return theme.colors.error;
        case 'xp':
          return theme.colors.xp;
        default:
          return theme.colors.primary;
      }
    };

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: theme.colors.textMain }}>
              {label || 'Progreso'}
            </span>
            <span className="text-sm font-bold" style={{ color: getVariantColor() }}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}

        <div
          className={`w-full rounded-full overflow-hidden ${sizeClasses[size]}`}
          style={{
            backgroundColor: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            className={`h-full rounded-full ${animate ? 'transition-all duration-500 ease-out' : ''}`}
            style={{
              width: `${percentage}%`,
              backgroundColor: getVariantColor(),
              boxShadow: `0 0 10px ${getVariantColor()}50`,
            }}
          />
        </div>
      </div>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
