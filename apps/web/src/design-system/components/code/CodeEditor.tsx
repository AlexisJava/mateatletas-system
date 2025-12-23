'use client';

/**
 * Mateatletas Design System - CodeEditor Component
 * Editor de código con syntax highlighting según tema
 */

import { forwardRef } from 'react';
import type { CodeEditorProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
  (
    {
      className = '',
      theme: themeProp,
      code,
      language,
      showLineNumbers = true,
      showHeader = true,
      title,
      editable = false,
      onCodeChange,
      onRun,
      highlightedLines = [],
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const lines = code.split('\n');

    const languageLabels: Record<string, string> = {
      lua: 'Lua',
      python: 'Python',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      html: 'HTML',
      css: 'CSS',
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
        {showHeader && (
          <div
            className="flex items-center justify-between px-4 py-2 border-b"
            style={{
              backgroundColor: theme.colors.bgCard,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm font-medium ml-2" style={{ color: theme.colors.textDim }}>
                {title || languageLabels[language] || language}
              </span>
            </div>
            {onRun && (
              <button
                onClick={onRun}
                className="px-3 py-1 text-sm font-medium rounded transition-colors"
                style={{
                  backgroundColor: theme.colors.success,
                  color: '#fff',
                }}
              >
                ▶ Ejecutar
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <pre className="p-4 font-mono text-sm leading-relaxed">
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlightedLines.includes(lineNumber);

              return (
                <div key={index} className={`flex ${isHighlighted ? 'bg-white/5' : ''}`}>
                  {showLineNumbers && (
                    <span
                      className="select-none w-10 pr-4 text-right shrink-0"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {lineNumber}
                    </span>
                  )}
                  <code
                    className="flex-1"
                    style={{ color: theme.colors.textMain }}
                    contentEditable={editable}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (editable && onCodeChange) {
                        const newLines = [...lines];
                        newLines[index] = e.currentTarget.textContent || '';
                        onCodeChange(newLines.join('\n'));
                      }
                    }}
                  >
                    {line || ' '}
                  </code>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    );
  },
);

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
