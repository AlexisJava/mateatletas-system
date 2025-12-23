'use client';

/**
 * Mateatletas Design System - Tooltip Component
 */

import { forwardRef, useState, useRef, useEffect } from 'react';
import type { TooltipProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, content, className = '', theme: themeProp, position = 'top', delay = 200 }, ref) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const positionClasses: Record<string, string> = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses: Record<string, string> = {
      top: 'top-full left-1/2 -translate-x-1/2 border-t-current border-x-transparent border-b-transparent',
      bottom:
        'bottom-full left-1/2 -translate-x-1/2 border-b-current border-x-transparent border-t-transparent',
      left: 'left-full top-1/2 -translate-y-1/2 border-l-current border-y-transparent border-r-transparent',
      right:
        'right-full top-1/2 -translate-y-1/2 border-r-current border-y-transparent border-l-transparent',
    };

    return (
      <div
        ref={ref}
        className={`relative inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {isVisible && (
          <div
            className={`absolute z-50 px-3 py-2 text-sm rounded-lg whitespace-nowrap animate-fadeIn ${positionClasses[position]}`}
            style={{
              backgroundColor: theme.colors.bgCard,
              color: theme.colors.textMain,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.md,
            }}
          >
            {content}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
              style={{ color: theme.colors.bgCard }}
            />
          </div>
        )}
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
