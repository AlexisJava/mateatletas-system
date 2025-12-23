'use client';

/**
 * Mateatletas Design System - VariableBadge Component
 * Badge para mostrar variables en código con su tipo
 */

import { forwardRef } from 'react';
import type { VariableBadgeProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const typeEmojis: Record<string, string> = {
  string: '📝',
  number: '🔢',
  boolean: '✅',
  table: '📋',
  function: '⚡',
  nil: '❌',
};

export const VariableBadge = forwardRef<HTMLSpanElement, VariableBadgeProps>(
  ({ className = '', theme: themeProp, name, value, type, showType = true }, ref) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const getTypeColor = () => {
      switch (type) {
        case 'string':
          return theme.syntax.string;
        case 'number':
          return theme.syntax.number;
        case 'boolean':
          return theme.colors.accent;
        case 'function':
          return theme.syntax.function;
        case 'table':
          return theme.syntax.keyword;
        case 'nil':
          return theme.colors.textMuted;
        default:
          return theme.colors.textMain;
      }
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded font-mono text-sm ${className}`}
        style={{
          backgroundColor: theme.colors.codeBg,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {showType && <span>{typeEmojis[type]}</span>}
        <span style={{ color: theme.syntax.variable }}>{name}</span>
        <span style={{ color: theme.syntax.operator }}>=</span>
        <span style={{ color: getTypeColor() }}>{type === 'string' ? `"${value}"` : value}</span>
      </span>
    );
  },
);

VariableBadge.displayName = 'VariableBadge';

export default VariableBadge;
