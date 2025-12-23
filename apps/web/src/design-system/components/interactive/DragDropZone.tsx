'use client';

/**
 * Mateatletas Design System - DragDropZone Component
 * Zona de destino para elementos arrastrables
 */

import { forwardRef, useState } from 'react';
import type { DragDropZoneProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const DragDropZone = forwardRef<HTMLDivElement, DragDropZoneProps>(
  (
    {
      className = '',
      theme: themeProp,
      children,
      label,
      isActive = false,
      isValid,
      onDrop,
      onDragOver,
      onDragLeave,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
      onDragOver?.(e);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      setIsDragOver(false);
      onDragLeave?.(e);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      onDrop?.(e);
    };

    const getBorderStyle = () => {
      if (isValid === true) {
        return `2px solid ${theme.colors.success}`;
      }
      if (isValid === false) {
        return `2px solid ${theme.colors.error}`;
      }
      if (isDragOver || isActive) {
        return `2px dashed ${theme.colors.primary}`;
      }
      return `2px dashed ${theme.colors.border}`;
    };

    const getBackgroundColor = () => {
      if (isValid === true) {
        return `${theme.colors.success}10`;
      }
      if (isValid === false) {
        return `${theme.colors.error}10`;
      }
      if (isDragOver || isActive) {
        return `${theme.colors.primary}10`;
      }
      return theme.colors.bgCard;
    };

    return (
      <div
        ref={ref}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          min-h-[80px] rounded-xl p-4
          flex flex-col items-center justify-center gap-2
          transition-all duration-200
          ${className}
        `}
        style={{
          backgroundColor: getBackgroundColor(),
          border: getBorderStyle(),
          borderRadius: theme.borderRadius,
        }}
      >
        {children ? (
          children
        ) : (
          <>
            <span className="text-2xl opacity-50">📥</span>
            {label && (
              <span className="text-sm font-medium" style={{ color: theme.colors.textMuted }}>
                {label}
              </span>
            )}
          </>
        )}
      </div>
    );
  },
);

DragDropZone.displayName = 'DragDropZone';

export default DragDropZone;
