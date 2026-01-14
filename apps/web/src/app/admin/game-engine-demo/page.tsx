'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { GameResult, GameProgress } from '@mateatletas/game-engine/core';

// Importar PhaserGame dinámicamente con SSR deshabilitado
// Esto es necesario porque Phaser requiere APIs del browser (canvas, WebGL)
// que no están disponibles durante SSR
const GameContainer = dynamic(() => import('./GameContainer'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-black/30 rounded-2xl">
      <div className="text-white">Cargando motor de juegos...</div>
    </div>
  ),
});

/**
 * GameEngineDemo - Página de prueba para el game-engine
 *
 * Permite verificar que el core del game-engine funciona correctamente:
 * - PhaserGame component se monta
 * - EventBus comunica eventos
 * - BaseScene funciona
 * - GameRegistry registra templates
 */
export default function GameEngineDemoPage(): React.ReactElement {
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleComplete = (result: GameResult): void => {
    setGameResult(result);
    setIsPlaying(false);
  };

  const handleProgress = (progress: GameProgress): void => {
    console.log('Progress:', progress);
  };

  const handleError = (error: Error): void => {
    console.error('Game error:', error);
  };

  const handleStartGame = (): void => {
    setGameResult(null);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Game Engine Demo</h1>
          <p className="text-gray-400">
            Prueba del core del game-engine: PhaserGame, EventBus, BaseScene, GameRegistry
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          {!isPlaying ? (
            <button
              onClick={handleStartGame}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Iniciar Juego
            </button>
          ) : (
            <button
              onClick={() => setIsPlaying(false)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Detener
            </button>
          )}
        </div>

        {/* Game Container */}
        {isPlaying && (
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden mb-6">
            <GameContainer
              onComplete={handleComplete}
              onProgress={handleProgress}
              onError={handleError}
            />
          </div>
        )}

        {/* Results */}
        {gameResult && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Resultado del Juego</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Score</div>
                <div className="text-2xl font-bold text-white">{gameResult.score}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm">XP</div>
                <div className="text-2xl font-bold text-cyan-400">{gameResult.xp}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Tiempo</div>
                <div className="text-2xl font-bold text-white">
                  {gameResult.timeElapsed.toFixed(1)}s
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Max Combo</div>
                <div className="text-2xl font-bold text-amber-400">{gameResult.maxCombo}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Precisión</div>
                <div className="text-2xl font-bold text-green-400">
                  {(gameResult.accuracy * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Vidas</div>
                <div className="text-2xl font-bold text-red-400">{gameResult.livesRemaining}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 col-span-2">
                <div className="text-gray-400 text-sm">Estado</div>
                <div
                  className={`text-2xl font-bold ${gameResult.success ? 'text-green-400' : 'text-red-400'}`}
                >
                  {gameResult.success ? 'Victoria' : 'Derrota'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>
            Este demo verifica el funcionamiento del game-engine core (Fase 1). Haz click 3 veces en
            el área del juego para completarlo.
          </p>
        </div>
      </div>
    </div>
  );
}
