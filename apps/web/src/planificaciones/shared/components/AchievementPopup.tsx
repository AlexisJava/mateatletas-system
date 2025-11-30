/**
 * AchievementPopup - Popup de logro desbloqueado
 */

'use client';

import { useEffect } from 'react';
import type { AchievementPopupProps } from '../types/index';

export function AchievementPopup({ achievement, visible, onClose }: AchievementPopupProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-cerrar después de 5 segundos

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-bounce-in pointer-events-auto">
        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 shadow-2xl max-w-md transform scale-100 animate-pulse-slow">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">{achievement.icono || '🏆'}</div>

            <h3 className="text-3xl font-bold text-white mb-2">¡Logro Desbloqueado!</h3>

            <h4 className="text-2xl font-bold text-yellow-100 mb-3">{achievement.titulo}</h4>

            <p className="text-white text-lg mb-4">{achievement.descripcion}</p>

            {achievement.puntos && (
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-30 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-2xl">⭐</span>
                <span className="text-xl font-bold text-white">+{achievement.puntos} puntos</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-6 bg-white text-orange-600 font-bold px-6 py-2 rounded-full hover:bg-yellow-100 transition-colors"
            >
              ¡Genial!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
