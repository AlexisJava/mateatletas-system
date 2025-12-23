'use client';

/**
 * Mateatletas Design System - Divider Component
 */

import { forwardRef } from 'react';
import type { DividerProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    { className = '', theme: themeProp, orientation = 'horizontal', variant = 'solid', label },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const isHorizontal = orientation === 'horizontal';

    const variantStyles = {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    };

    const baseClasses = isHorizontal
      ? `w-full border-t ${variantStyles[variant]}`
      : `h-full border-l ${variantStyles[variant]}`;

    const colorStyle = { borderColor: theme.colors.border };

    if (label && isHorizontal) {
      return (
        <div ref={ref} className={`flex items-center gap-4 ${className}`}>
          <div className={baseClasses + ' flex-1'} style={colorStyle} />
          <span className="text-sm font-medium shrink-0" style={{ color: theme.colors.textMuted }}>
            {label}
          </span>
          <div className={baseClasses + ' flex-1'} style={colorStyle} />
        </div>
      );
    }

    return <div ref={ref} className={`${baseClasses} ${className}`} style={colorStyle} />;
  },
);

Divider.displayName = 'Divider';

export default Divider;
