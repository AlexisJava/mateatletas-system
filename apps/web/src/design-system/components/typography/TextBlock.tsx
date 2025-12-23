'use client';

/**
 * Mateatletas Design System - TextBlock Component
 */

import { forwardRef } from 'react';
import type { TextBlockProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
} as const;

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

export const TextBlock = forwardRef<HTMLParagraphElement, TextBlockProps>(
  (
    {
      children,
      className = '',
      theme: themeProp,
      size = 'md',
      weight = 'normal',
      muted = false,
      centered = false,
      as: Tag = 'p',
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const sizeClass = sizeClasses[size];
    const weightClass = weightClasses[weight];
    const centerClass = centered ? 'text-center' : '';

    const textColor = muted ? theme.colors.textMuted : theme.colors.textMain;

    const combinedClasses = [
      'font-body leading-relaxed',
      sizeClass,
      weightClass,
      centerClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Tag ref={ref} className={combinedClasses} style={{ color: textColor }}>
        {children}
      </Tag>
    );
  },
);

TextBlock.displayName = 'TextBlock';

export default TextBlock;
