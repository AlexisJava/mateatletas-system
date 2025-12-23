'use client';

/**
 * Mateatletas Design System - XPCounter Component
 * Contador de puntos de experiencia con animación
 */

import { forwardRef, useEffect, useState } from 'react';
import type { XPCounterProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const XPCounter = forwardRef<HTMLDivElement, XPCounterProps>(
  (
    {
      className = '',
      theme: themeProp,
      currentXP,
      maxXP,
      level,
      showLevel = true,
      animate = true,
      size = 'md',
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;
    const [displayXP, setDisplayXP] = useState(animate ? 0 : currentXP);

    useEffect(() => {
      if (!animate) {
        setDisplayXP(currentXP);
        return;
      }

      const duration = 1000;
      const steps = 30;
      const increment = currentXP / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(currentXP, Math.round(increment * step));
        setDisplayXP(current);

        if (step >= steps) {
          clearInterval(timer);
          setDisplayXP(currentXP);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [currentXP, animate]);

    const percentage = maxXP ? (currentXP / maxXP) * 100 : 0;

    const sizeStyles = {
      sm: {
        container: 'p-3',
        text: 'text-lg',
        label: 'text-xs',
        bar: 'h-2',
      },
      md: {
        container: 'p-4',
        text: 'text-2xl',
        label: 'text-sm',
        bar: 'h-3',
      },
      lg: {
        container: 'p-6',
        text: 'text-4xl',
        label: 'text-base',
        bar: 'h-4',
      },
    };

    const styles = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={`rounded-xl ${styles.container} ${className}`}
        style={{
          backgroundColor: theme.colors.bgCard,
          border: `2px solid ${theme.colors.xp}40`,
          boxShadow: `0 0 20px ${theme.colors.xp}20`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <div>
              <div className={`${styles.text} font-bold`} style={{ color: theme.colors.xp }}>
                {displayXP.toLocaleString()}
                {maxXP && (
                  <span
                    className={`${styles.label} font-normal ml-1`}
                    style={{ color: theme.colors.textMuted }}
                  >
                    / {maxXP.toLocaleString()}
                  </span>
                )}
              </div>
              <div className={styles.label} style={{ color: theme.colors.textDim }}>
                Puntos XP
              </div>
            </div>
          </div>

          {showLevel && level !== undefined && (
            <div
              className="px-4 py-2 rounded-lg text-center"
              style={{
                backgroundColor: theme.colors.primary + '20',
                border: `1px solid ${theme.colors.primary}`,
              }}
            >
              <div className={`${styles.text} font-bold`} style={{ color: theme.colors.primary }}>
                {level}
              </div>
              <div className={styles.label} style={{ color: theme.colors.textDim }}>
                Nivel
              </div>
            </div>
          )}
        </div>

        {maxXP && (
          <div
            className={`w-full rounded-full overflow-hidden ${styles.bar}`}
            style={{
              backgroundColor: theme.colors.bgMain,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: theme.colors.xp,
                boxShadow: `0 0 8px ${theme.colors.xp}`,
              }}
            />
          </div>
        )}
      </div>
    );
  },
);

XPCounter.displayName = 'XPCounter';

export default XPCounter;
