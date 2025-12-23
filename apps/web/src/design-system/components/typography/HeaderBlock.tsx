'use client';

/**
 * Mateatletas Design System - HeaderBlock Component
 */

import { forwardRef, createElement } from 'react';
import type { HeaderBlockProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const levelClasses = {
  1: 'text-4xl md:text-5xl font-bold tracking-tight',
  2: 'text-3xl md:text-4xl font-bold tracking-tight',
  3: 'text-2xl md:text-3xl font-semibold',
  4: 'text-xl md:text-2xl font-semibold',
  5: 'text-lg md:text-xl font-medium',
  6: 'text-base md:text-lg font-medium',
} as const;

export const HeaderBlock = forwardRef<HTMLHeadingElement, HeaderBlockProps>(
  (
    { children, className = '', theme: themeProp, level = 1, centered = false, gradient = false },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const tag = `h${level}`;
    const levelClass = levelClasses[level];
    const centerClass = centered ? 'text-center' : '';

    const gradientStyle = gradient
      ? {
          backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }
      : { color: theme.colors.textMain };

    const combinedClasses = ['font-heading', levelClass, centerClass, theme.classes.text, className]
      .filter(Boolean)
      .join(' ');

    return createElement(tag, { ref, className: combinedClasses, style: gradientStyle }, children);
  },
);

HeaderBlock.displayName = 'HeaderBlock';

export default HeaderBlock;
