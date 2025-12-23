'use client';

/**
 * Mateatletas Design System - AchievementPopup Component
 * Popup de logro desbloqueado
 */

import { forwardRef, useEffect, useState } from 'react';
import type { AchievementPopupProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';

export const AchievementPopup = forwardRef<HTMLDivElement, AchievementPopupProps>(
  (
    {
      className = '',
      theme: themeProp,
      title,
      description,
      icon = '🏆',
      xpReward,
      isVisible = true,
      onClose,
      autoHideDuration = 5000,
    },
    ref,
  ) => {
    const { theme: contextTheme } = useTheme();
    const theme = themeProp ?? contextTheme;
    const [show, setShow] = useState(false);

    useEffect(() => {
      if (isVisible) {
        setShow(true);

        if (autoHideDuration && onClose) {
          const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onClose, 300);
          }, autoHideDuration);

          return () => clearTimeout(timer);
        }
      } else {
        setShow(false);
      }
      return undefined;
    }, [isVisible, autoHideDuration, onClose]);

    if (!isVisible && !show) return null;

    return (
      <div
        ref={ref}
        className={`
          fixed top-4 right-4 z-50
          transform transition-all duration-300
          ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          ${className}
        `}
      >
        <div
          className="flex items-center gap-4 p-4 rounded-xl min-w-[300px] max-w-md"
          style={{
            backgroundColor: theme.colors.bgCard,
            border: `2px solid ${theme.colors.xp}`,
            boxShadow: `0 0 30px ${theme.colors.xp}40, ${theme.shadows.lg}`,
          }}
        >
          {/* Icono con animación */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl animate-bounce shrink-0"
            style={{
              backgroundColor: theme.colors.xp + '20',
              border: `2px solid ${theme.colors.xp}`,
            }}
          >
            {icon}
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: theme.colors.xp }}
              >
                ¡Logro Desbloqueado!
              </span>
              <span className="animate-pulse">✨</span>
            </div>
            <h4 className="font-bold text-lg" style={{ color: theme.colors.textMain }}>
              {title}
            </h4>
            {description && (
              <p className="text-sm mt-1" style={{ color: theme.colors.textDim }}>
                {description}
              </p>
            )}
            {xpReward && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-lg">⭐</span>
                <span className="font-bold" style={{ color: theme.colors.xp }}>
                  +{xpReward} XP
                </span>
              </div>
            )}
          </div>

          {/* Botón cerrar */}
          {onClose && (
            <button
              onClick={() => {
                setShow(false);
                setTimeout(onClose, 300);
              }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm opacity-50 hover:opacity-100 transition-opacity"
              style={{
                backgroundColor: theme.colors.bgMain,
                color: theme.colors.textMuted,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Confetti particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][
                  i
                ],
                left: `${10 + i * 15}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  },
);

AchievementPopup.displayName = 'AchievementPopup';

export default AchievementPopup;
