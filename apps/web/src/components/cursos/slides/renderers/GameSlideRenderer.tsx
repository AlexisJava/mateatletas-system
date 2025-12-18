/**
 * components/slides/renderers/GameSlideRenderer.tsx
 * ===================================================
 * Renderizador para slides de juegos (dashboard y embeds)
 *
 * MIGRACIÓN PROMPT 3: Actualizado para usar tipos nuevos
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { GameDashboardSlide } from '../../../types/registry';
import LambdaMessage from '../../LambdaMessage';
import NavigationButtons from '../shared/NavigationButtons';

interface GameSlideRendererProps {
  slide: GameDashboardSlide;
  onNext: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  isFirst?: boolean;
  completedGames?: string[];
  hideNavigation?: boolean;
}

export default function GameSlideRenderer({
  slide,
  onNext,
  onPrevious,
  showPrevious = true,
  isFirst = false,
  completedGames = [],
  hideNavigation = false,
}: GameSlideRendererProps) {
  const message = slide.gameDescription || '';
  const ctaText = 'Continuar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Título */}
      {slide.title && (
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-slate-100 mb-4"
        >
          {slide.title}
        </motion.h1>
      )}

      {/* Mensaje */}
      {message && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LambdaMessage message={message} />
        </motion.div>
      )}

      {/* Game Options */}
      {slide.gameOptions && slide.gameOptions.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {slide.gameOptions.map((game, index) => {
            const isCompleted = completedGames.includes(game.id);

            return (
              <motion.div
                key={game.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                className={`relative bg-slate-800 rounded-xl p-6 border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'border-green-500/50 bg-green-900/20'
                    : 'border-slate-600 hover:border-indigo-500/50'
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <span>✓</span>
                    Completado
                  </div>
                )}

                <div className="text-5xl mb-4">{game.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{game.label}</h3>
                <p className="text-slate-300 mb-4 text-sm">{game.description}</p>

                <button
                  onClick={() => (window.location.href = `/games/${game.id}`)}
                  className={`block w-full text-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-700 hover:bg-green-600 text-white'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                  }`}
                >
                  {isCompleted ? '🔄 Volver a jugar' : '🎮 Jugar'}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Navegación - solo si NO está hideNavigation */}
      {!hideNavigation && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <NavigationButtons
            onPrevious={onPrevious}
            onNext={onNext}
            nextLabel={ctaText}
            showPrevious={showPrevious && !isFirst}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
