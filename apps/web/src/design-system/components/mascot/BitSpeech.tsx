'use client';

/**
 * Mateatletas Design System - BitSpeech Component
 * Burbuja de diálogo para la mascota BIT
 */

import { forwardRef } from 'react';
import type { BitSpeechProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const BitSpeech = forwardRef<HTMLDivElement, BitSpeechProps>(
  (
    {
      className = '',
      theme: themeProp,
      children,
      mood = 'happy',
      position = 'right',
      animate = true,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const moodEmojis: Record<string, string> = {
      happy: '😊',
      excited: '🤩',
      thinking: '🤔',
      celebrating: '🎉',
      encouraging: '💪',
    };

    const getPositionStyles = () => {
      switch (position) {
        case 'left':
          return 'flex-row-reverse';
        case 'top':
          return 'flex-col-reverse items-center';
        case 'bottom':
          return 'flex-col items-center';
        default:
          return 'flex-row';
      }
    };

    const getArrowStyles = () => {
      const baseArrow = {
        width: 0,
        height: 0,
        borderStyle: 'solid' as const,
      };

      switch (position) {
        case 'left':
          return {
            ...baseArrow,
            borderWidth: '10px 0 10px 15px',
            borderColor: `transparent transparent transparent ${theme.colors.bgCard}`,
          };
        case 'top':
          return {
            ...baseArrow,
            borderWidth: '15px 10px 0 10px',
            borderColor: `${theme.colors.bgCard} transparent transparent transparent`,
          };
        case 'bottom':
          return {
            ...baseArrow,
            borderWidth: '0 10px 15px 10px',
            borderColor: `transparent transparent ${theme.colors.bgCard} transparent`,
          };
        default:
          return {
            ...baseArrow,
            borderWidth: '10px 15px 10px 0',
            borderColor: `transparent ${theme.colors.bgCard} transparent transparent`,
          };
      }
    };

    return (
      <div
        ref={ref}
        className={`flex gap-3 ${getPositionStyles()} ${animate ? 'animate-fadeIn' : ''} ${className}`}
      >
        {/* Mascota mini */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
          style={{
            backgroundColor: theme.colors.primary + '20',
            border: `2px solid ${theme.colors.primary}`,
          }}
        >
          {moodEmojis[mood] || moodEmojis.happy}
        </div>

        {/* Flecha */}
        <div style={getArrowStyles()} />

        {/* Burbuja de mensaje */}
        <div
          className="px-4 py-3 rounded-xl max-w-md"
          style={{
            backgroundColor: theme.colors.bgCard,
            border: `2px solid ${theme.colors.border}`,
            color: theme.colors.textMain,
            boxShadow: theme.shadows.md,
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);

BitSpeech.displayName = 'BitSpeech';

export default BitSpeech;
