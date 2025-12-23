'use client';

/**
 * Mateatletas Design System - MascotBIT Component
 * Mascota interactiva del sistema educativo
 */

import { forwardRef } from 'react';
import type { MascotBITProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const moodEmojis: Record<string, string> = {
  happy: '😊',
  excited: '🤩',
  thinking: '🤔',
  celebrating: '🎉',
  encouraging: '💪',
  surprised: '😮',
  proud: '😎',
  confused: '😅',
};

const moodMessages: Record<string, string[]> = {
  happy: ['¡Hola!', '¡Qué bueno verte!'],
  excited: ['¡Increíble!', '¡Wow!'],
  thinking: ['Hmm...', 'Déjame pensar...'],
  celebrating: ['¡Lo lograste!', '¡Felicidades!'],
  encouraging: ['¡Tú puedes!', '¡Vamos!'],
  surprised: ['¡Guau!', '¡No lo esperaba!'],
  proud: ['¡Excelente trabajo!', '¡Eres genial!'],
  confused: ['¿Necesitas ayuda?', 'Puedo explicarlo de nuevo'],
};

export const MascotBIT = forwardRef<HTMLDivElement, MascotBITProps>(
  (
    {
      className = '',
      theme: themeProp,
      mood = 'happy',
      size = 'md',
      animate = true,
      showMessage = false,
      customMessage,
      onClick,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;

    const sizeClasses = {
      sm: 'w-16 h-16 text-3xl',
      md: 'w-24 h-24 text-5xl',
      lg: 'w-32 h-32 text-6xl',
    };

    const getAnimation = () => {
      if (!animate) return '';
      switch (mood) {
        case 'excited':
        case 'celebrating':
          return 'animate-bounce';
        case 'thinking':
          return 'animate-pulse';
        default:
          return 'animate-float';
      }
    };

    const getMessage = () => {
      if (customMessage) return customMessage;
      const messages = moodMessages[mood] ?? moodMessages.happy;
      const messageList = messages ?? ['¡Hola!'];
      return messageList[Math.floor(Math.random() * messageList.length)];
    };

    return (
      <div ref={ref} className={`relative inline-flex flex-col items-center ${className}`}>
        {/* Mensaje flotante */}
        {showMessage && (
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap animate-fadeIn"
            style={{
              backgroundColor: theme.colors.bgCard,
              border: `2px solid ${theme.colors.primary}`,
              color: theme.colors.textMain,
              boxShadow: theme.shadows.md,
            }}
          >
            {getMessage()}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
              style={{
                backgroundColor: theme.colors.bgCard,
                borderRight: `2px solid ${theme.colors.primary}`,
                borderBottom: `2px solid ${theme.colors.primary}`,
              }}
            />
          </div>
        )}

        {/* Mascota */}
        <button
          onClick={onClick}
          className={`
            ${sizeClasses[size]}
            rounded-full flex items-center justify-center
            transition-transform duration-200
            ${onClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
            ${getAnimation()}
          `}
          style={{
            backgroundColor: theme.colors.primary + '20',
            border: `3px solid ${theme.colors.primary}`,
            boxShadow: `0 0 20px ${theme.colors.primary}40`,
          }}
        >
          <span className="select-none">{moodEmojis[mood] || moodEmojis.happy}</span>
        </button>

        {/* Nombre */}
        <span className="mt-2 text-sm font-bold" style={{ color: theme.colors.primary }}>
          BIT
        </span>
      </div>
    );
  },
);

MascotBIT.displayName = 'MascotBIT';

export default MascotBIT;
