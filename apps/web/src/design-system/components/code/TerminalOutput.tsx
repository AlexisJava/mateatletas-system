'use client';

/**
 * Mateatletas Design System - TerminalOutput Component
 * Simula una terminal con output de comandos
 */

import { forwardRef } from 'react';
import type { TerminalOutputProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const TerminalOutput = forwardRef<HTMLDivElement, TerminalOutputProps>(
  (
    {
      className = '',
      theme: themeProp,
      lines,
      prompt = '$',
      showPrompt = true,
      animate = false,
      title = 'Terminal',
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const getLineColor = (type: 'input' | 'output' | 'error' | 'success') => {
      switch (type) {
        case 'error':
          return theme.colors.error;
        case 'success':
          return theme.colors.success;
        case 'input':
          return theme.colors.accent;
        default:
          return theme.colors.textMain;
      }
    };

    return (
      <div
        ref={ref}
        className={`rounded-lg overflow-hidden ${className}`}
        style={{
          backgroundColor: theme.colors.codeBg,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-2 border-b"
          style={{
            backgroundColor: theme.colors.bgCard,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-medium ml-2" style={{ color: theme.colors.textDim }}>
            {title}
          </span>
        </div>

        {/* Terminal content */}
        <div className="p-4 font-mono text-sm leading-relaxed overflow-x-auto">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`flex gap-2 ${animate ? 'animate-fadeIn' : ''}`}
              style={{
                animationDelay: animate ? `${index * 100}ms` : undefined,
              }}
            >
              {showPrompt && line.type === 'input' && (
                <span style={{ color: theme.colors.success }}>{prompt}</span>
              )}
              {line.type === 'error' && <span style={{ color: theme.colors.error }}>✗</span>}
              {line.type === 'success' && <span style={{ color: theme.colors.success }}>✓</span>}
              <span style={{ color: getLineColor(line.type) }}>{line.content}</span>
            </div>
          ))}

          {/* Cursor parpadeante */}
          <div className="flex gap-2 mt-1">
            {showPrompt && <span style={{ color: theme.colors.success }}>{prompt}</span>}
            <span
              className="w-2 h-5 animate-pulse"
              style={{ backgroundColor: theme.colors.accent }}
            />
          </div>
        </div>
      </div>
    );
  },
);

TerminalOutput.displayName = 'TerminalOutput';

export default TerminalOutput;
