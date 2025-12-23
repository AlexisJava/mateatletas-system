'use client';

/**
 * Mateatletas Design System - CalloutBlock Component
 */

import { forwardRef, useState } from 'react';
import type { CalloutBlockProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const variantIcons: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  tip: '💡',
  note: '📝',
};

export const CalloutBlock = forwardRef<HTMLDivElement, CalloutBlockProps>(
  (
    {
      children,
      className = '',
      theme: themeProp,
      variant = 'info',
      title,
      icon,
      dismissible = false,
      onDismiss,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const variantColors: Record<string, { bg: string; border: string; text: string }> = {
      info: {
        bg: `${theme.colors.primary}15`,
        border: theme.colors.primary,
        text: theme.colors.primary,
      },
      success: {
        bg: `${theme.colors.success}15`,
        border: theme.colors.success,
        text: theme.colors.success,
      },
      warning: {
        bg: `${theme.colors.warning}15`,
        border: theme.colors.warning,
        text: theme.colors.warning,
      },
      error: {
        bg: `${theme.colors.error}15`,
        border: theme.colors.error,
        text: theme.colors.error,
      },
      tip: {
        bg: `${theme.colors.accent}15`,
        border: theme.colors.accent,
        text: theme.colors.accent,
      },
      note: {
        bg: `${theme.colors.textMuted}15`,
        border: theme.colors.textMuted,
        text: theme.colors.textMuted,
      },
    };

    const colors = variantColors[variant] ?? variantColors.info;
    const displayIcon = icon ?? variantIcons[variant];

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    return (
      <div
        ref={ref}
        className={`p-4 rounded-lg border-l-4 ${className}`}
        style={{
          backgroundColor: colors?.bg ?? `${theme.colors.primary}15`,
          borderLeftColor: colors?.border ?? theme.colors.primary,
        }}
      >
        <div className="flex items-start gap-3">
          {displayIcon && <span className="text-xl shrink-0">{displayIcon}</span>}
          <div className="flex-1 min-w-0">
            {title && (
              <h4
                className="font-semibold mb-1"
                style={{ color: colors?.text ?? theme.colors.primary }}
              >
                {title}
              </h4>
            )}
            <div style={{ color: theme.colors.textMain }}>{children}</div>
          </div>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: theme.colors.textMain }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  },
);

CalloutBlock.displayName = 'CalloutBlock';

export default CalloutBlock;
