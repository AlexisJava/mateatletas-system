'use client';

/**
 * Mateatletas Design System - Card Component
 * Componente base para tarjetas con soporte de temas
 */

import { forwardRef } from 'react';
import type { CardProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      theme: themeProp,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      onClick,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const baseClasses = theme.classes.card;
    const paddingClass = paddingClasses[padding];
    const hoverClass = hoverable ? 'cursor-pointer' : '';
    const interactiveClass = onClick ? 'cursor-pointer' : '';

    const variantClasses = {
      default: '',
      elevated: 'shadow-lg',
      outlined: 'shadow-none',
      glass: 'backdrop-blur-xl bg-opacity-50',
    };

    const combinedClasses = [
      baseClasses,
      paddingClass,
      hoverClass,
      interactiveClass,
      variantClasses[variant],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={combinedClasses} onClick={onClick}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
