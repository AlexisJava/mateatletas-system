'use client';

/**
 * Mateatletas Design System - PostItNote Component
 */

import { forwardRef, useMemo } from 'react';
import type { PostItNoteProps } from '../../types';

const colorStyles: Record<string, { bg: string; shadow: string }> = {
  yellow: { bg: '#fef08a', shadow: 'rgba(234, 179, 8, 0.3)' },
  pink: { bg: '#fbcfe8', shadow: 'rgba(236, 72, 153, 0.3)' },
  green: { bg: '#bbf7d0', shadow: 'rgba(34, 197, 94, 0.3)' },
  blue: { bg: '#bfdbfe', shadow: 'rgba(59, 130, 246, 0.3)' },
  orange: { bg: '#fed7aa', shadow: 'rgba(249, 115, 22, 0.3)' },
  purple: { bg: '#e9d5ff', shadow: 'rgba(168, 85, 247, 0.3)' },
};

export const PostItNote = forwardRef<HTMLDivElement, PostItNoteProps>(
  (
    {
      children,
      className = '',
      color = 'yellow',
      rotation = 0,
      pinStyle = 'pin',
      foldedCorner = true,
      floating = false,
      title,
    },
    ref,
  ) => {
    const colors = colorStyles[color] ?? colorStyles.yellow;

    const rotationDeg = useMemo(() => {
      if (rotation === 'random') {
        return Math.floor(Math.random() * 6) - 3;
      }
      return rotation;
    }, [rotation]);

    const floatClass = floating ? 'animate-float' : '';

    return (
      <div
        ref={ref}
        className={`relative p-4 font-handwriting text-gray-800 ${floatClass} ${className}`}
        style={{
          backgroundColor: colors?.bg ?? '#fef08a',
          transform: `rotate(${rotationDeg}deg)`,
          boxShadow: `3px 3px 10px ${colors?.shadow ?? 'rgba(234, 179, 8, 0.3)'}`,
          minWidth: '150px',
          maxWidth: '280px',
        }}
      >
        {/* Pin/Tape decoration */}
        {pinStyle === 'pin' && (
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md"
            style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)' }}
          />
        )}
        {pinStyle === 'tape' && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 bg-yellow-200/80"
            style={{ transform: 'translateX(-50%) rotate(-2deg)' }}
          />
        )}

        {/* Content */}
        {title && (
          <h4 className="font-bold text-lg mb-2 underline decoration-wavy decoration-gray-400">
            {title}
          </h4>
        )}
        <div className="text-lg leading-relaxed">{children}</div>

        {/* Folded corner */}
        {foldedCorner && (
          <div
            className="absolute bottom-0 right-0 w-6 h-6"
            style={{
              background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)`,
            }}
          />
        )}
      </div>
    );
  },
);

PostItNote.displayName = 'PostItNote';

export default PostItNote;
