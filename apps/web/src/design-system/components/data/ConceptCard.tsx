'use client';

/**
 * Mateatletas Design System - ConceptCard Component
 * Tarjeta para mostrar conceptos de programación/matemáticas/ciencias
 */

import { forwardRef } from 'react';
import type { ConceptCardProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const ConceptCard = forwardRef<HTMLDivElement, ConceptCardProps>(
  (
    { children, className = '', theme: themeProp, title, icon, variant = 'default', onClick },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const isInteractive = variant === 'interactive' || onClick;

    const variantStyles = {
      default: {},
      highlighted: {
        borderColor: theme.colors.primary,
        boxShadow: theme.shadows.glow ?? theme.shadows.md,
      },
      interactive: {},
    };

    return (
      <div
        ref={ref}
        className={`${theme.classes.card} p-4 ${isInteractive ? 'cursor-pointer hover:scale-[1.02] transition-transform duration-200' : ''} ${className}`}
        style={{
          ...variantStyles[variant],
          borderRadius: theme.borderRadius,
        }}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          {icon && (
            <span
              className="text-2xl shrink-0 p-2 rounded-lg"
              style={{
                backgroundColor: `${theme.colors.primary}20`,
                color: theme.colors.primary,
              }}
            >
              {icon}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2" style={{ color: theme.colors.textMain }}>
              {title}
            </h3>
            <div style={{ color: theme.colors.textDim }}>{children}</div>
          </div>
        </div>
      </div>
    );
  },
);

ConceptCard.displayName = 'ConceptCard';

export default ConceptCard;
