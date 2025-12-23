'use client';

/**
 * Mateatletas Design System - QuizBlock Component
 * Bloque de pregunta con opciones múltiples
 */

import { forwardRef, useState } from 'react';
import type { QuizBlockProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const QuizBlock = forwardRef<HTMLDivElement, QuizBlockProps>(
  (
    {
      className = '',
      theme: themeProp,
      question,
      options,
      correctIndex,
      explanation,
      onAnswer,
      showFeedback = true,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);

    const handleSelect = (index: number) => {
      if (answered) return;

      setSelectedIndex(index);
      setAnswered(true);

      const isCorrect = index === correctIndex;
      onAnswer?.(isCorrect);
    };

    const getOptionStyle = (index: number) => {
      if (!answered) {
        return {
          backgroundColor: theme.colors.bgCard,
          borderColor: selectedIndex === index ? theme.colors.primary : theme.colors.border,
        };
      }

      if (index === correctIndex) {
        return {
          backgroundColor: `${theme.colors.success}20`,
          borderColor: theme.colors.success,
        };
      }

      if (index === selectedIndex && index !== correctIndex) {
        return {
          backgroundColor: `${theme.colors.error}20`,
          borderColor: theme.colors.error,
        };
      }

      return {
        backgroundColor: theme.colors.bgCard,
        borderColor: theme.colors.border,
        opacity: 0.5,
      };
    };

    const isCorrect = selectedIndex === correctIndex;

    return (
      <div
        ref={ref}
        className={`rounded-xl p-6 ${className}`}
        style={{
          backgroundColor: theme.colors.bgMain,
          border: `2px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius,
        }}
      >
        {/* Pregunta */}
        <div className="flex items-start gap-3 mb-6">
          <span
            className="text-2xl shrink-0 w-10 h-10 flex items-center justify-center rounded-full"
            style={{ backgroundColor: theme.colors.primary + '20' }}
          >
            ❓
          </span>
          <h3
            className="text-lg font-semibold leading-relaxed"
            style={{ color: theme.colors.textMain }}
          >
            {question}
          </h3>
        </div>

        {/* Opciones */}
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={answered}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                !answered ? 'hover:scale-[1.01] cursor-pointer' : 'cursor-default'
              }`}
              style={getOptionStyle(index)}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: '#fff',
                }}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span style={{ color: theme.colors.textMain }}>{option}</span>

              {answered && index === correctIndex && <span className="ml-auto text-xl">✅</span>}
              {answered && index === selectedIndex && index !== correctIndex && (
                <span className="ml-auto text-xl">❌</span>
              )}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && answered && (
          <div
            className="mt-6 p-4 rounded-lg animate-fadeIn"
            style={{
              backgroundColor: isCorrect ? `${theme.colors.success}15` : `${theme.colors.error}15`,
              border: `1px solid ${isCorrect ? theme.colors.success : theme.colors.error}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{isCorrect ? '🎉' : '💡'}</span>
              <span
                className="font-semibold"
                style={{ color: isCorrect ? theme.colors.success : theme.colors.error }}
              >
                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </span>
            </div>
            {explanation && (
              <p className="text-sm" style={{ color: theme.colors.textDim }}>
                {explanation}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

QuizBlock.displayName = 'QuizBlock';

export default QuizBlock;
