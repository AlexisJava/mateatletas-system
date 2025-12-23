'use client';

/**
 * Mateatletas Design System - Container Component
 */

import { forwardRef } from 'react';
import type { ContainerProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const sizeClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: 'max-w-full',
} as const;

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className = '', theme: themeProp, size = 'lg', centered = true }, ref) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const sizeClass = sizeClasses[size];
    const centerClass = centered ? 'mx-auto' : '';

    const combinedClasses = [
      'w-full px-4 sm:px-6 lg:px-8',
      sizeClass,
      centerClass,
      theme.classes.container,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={combinedClasses}>
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';

export default Container;
