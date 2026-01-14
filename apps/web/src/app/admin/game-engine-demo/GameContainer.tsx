'use client';

import { PhaserGame, useGameControls } from '@mateatletas/game-engine/core';
import type { GameResult, GameProgress } from '@mateatletas/game-engine/core';
// Importar templates para registrarlos en el GameRegistry
import '@mateatletas/game-engine/templates';

interface GameContainerProps {
  onComplete: (result: GameResult) => void;
  onProgress: (progress: GameProgress) => void;
  onError: (error: Error) => void;
}

/**
 * GameContainer - Componente que renderiza el juego Phaser
 *
 * Este componente se carga dinámicamente con ssr: false para evitar
 * problemas con las APIs del browser que Phaser necesita.
 */
export default function GameContainer({
  onComplete,
  onProgress,
  onError,
}: GameContainerProps): React.ReactElement {
  const { pause, resume } = useGameControls();

  return (
    <div className="relative">
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={pause}
          className="px-4 py-2 bg-amber-600/80 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors"
        >
          Pausar
        </button>
        <button
          onClick={resume}
          className="px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
        >
          Reanudar
        </button>
      </div>

      {/* Game canvas container */}
      <div className="h-[500px]">
        <PhaserGame
          template="test"
          config={{
            title: 'Test Game',
            instruction: 'Haz click 3 veces para completar',
            lives: 3,
            difficulty: 'easy',
            area: 'math',
            house: 'quantum',
            templateConfig: {
              backgroundColor: 0x1a1a2e,
              message: 'Game Engine Test',
            },
          }}
          onComplete={onComplete}
          onProgress={onProgress}
          onError={onError}
        />
      </div>
    </div>
  );
}
