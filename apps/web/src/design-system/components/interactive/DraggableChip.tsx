'use client';

/**
 * Mateatletas Design System - DraggableChip Component
 * Chip arrastrable para ejercicios de ordenamiento
 */

import { forwardRef } from 'react';
import type { DraggableChipProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const DraggableChip = forwardRef<HTMLDivElement, DraggableChipProps>(
  (
    {
      className = '',
      theme: themeProp,
      children,
      isDragging = false,
      isPlaced = false,
      isCorrect,
      onDragStart,
      onDragEnd,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const getStateStyles = () => {
      if (isDragging) {
        return {
          transform: 'scale(1.05) rotate(-2deg)',
          boxShadow: theme.shadows.lg,
          opacity: 0.9,
        };
      }

      if (isPlaced && isCorrect === true) {
        return {
          backgroundColor: `${theme.colors.success}20`,
          borderColor: theme.colors.success,
        };
      }

      if (isPlaced && isCorrect === false) {
        return {
          backgroundColor: `${theme.colors.error}20`,
          borderColor: theme.colors.error,
        };
      }

      return {};
    };

    return (
      <div
        ref={ref}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          cursor-grab active:cursor-grabbing
          transition-all duration-200 select-none
          ${className}
        `}
        style={{
          backgroundColor: theme.colors.bgCard,
          border: `2px solid ${theme.colors.border}`,
          color: theme.colors.textMain,
          boxShadow: theme.shadows.sm,
          ...getStateStyles(),
        }}
      >
        <span className="text-lg">📦</span>
        {children}
        {isPlaced && isCorrect === true && <span className="ml-1">✅</span>}
        {isPlaced && isCorrect === false && <span className="ml-1">❌</span>}
      </div>
    );
  },
);

DraggableChip.displayName = 'DraggableChip';

export default DraggableChip;
