/**
 * PhaserGame - React Wrapper Component
 *
 * Componente React que inicializa y gestiona una instancia de Phaser.
 * Carga Phaser dinámicamente para evitar problemas de SSR en Next.js.
 *
 * @see https://phaser.io/news/2024/02/official-phaser-3-and-react-template
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { EventBus, destroyEventBus } from './EventBus';
import { GameRegistry } from './GameRegistry';
import type { GameCallbacks, GameConfig, GameProgress, GameResult, SceneInitData } from './types';

// ============================================================================
// Type Guards para boundaries con Phaser
// ============================================================================

/**
 * Verifica que un valor sea un SceneInitData válido.
 * Usado en el boundary con Phaser registry que devuelve unknown.
 */
function isSceneInitData(value: unknown): value is SceneInitData {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.config === 'object' &&
    obj.config !== null &&
    typeof obj.callbacks === 'object' &&
    obj.callbacks !== null
  );
}

// ============================================================================
// Types
// ============================================================================

export interface PhaserGameProps<TConfig = Record<string, unknown>> {
  /** ID del template a cargar */
  template: string;
  /** Configuración del juego */
  config: GameConfig<TConfig>;
  /** Callback cuando el juego termina */
  onComplete: (result: GameResult) => void;
  /** Callback para guardar progreso (opcional) */
  onProgress?: (progress: GameProgress) => void;
  /** Callback para errores (opcional) */
  onError?: (error: Error) => void;
  /** Estado previo para restaurar (opcional) */
  previousState?: GameProgress;
  /** Clases CSS adicionales para el container */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Wrapper React para juegos Phaser
 *
 * @example
 * <PhaserGame
 *   template="catcher"
 *   config={{
 *     title: "Atrapa Fracciones",
 *     instruction: "Atrapa las fracciones equivalentes a 1/2",
 *     lives: 3,
 *     duration: 60,
 *     difficulty: 'medium',
 *     area: 'math',
 *     house: 'quantum',
 *     templateConfig: { ... }
 *   }}
 *   onComplete={(result) => console.log('Game over:', result)}
 * />
 */
export function PhaserGame<TConfig = Record<string, unknown>>({
  template,
  config,
  onComplete,
  onProgress,
  onError,
  previousState,
  className = '',
}: PhaserGameProps<TConfig>): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize callbacks para evitar re-renders
  const callbacks: GameCallbacks = {
    onComplete,
    onProgress,
    onError,
  };

  // Handler para errores
  const handleError = useCallback(
    (err: Error, context?: string) => {
      const message = context ? `${context}: ${err.message}` : err.message;
      setError(message);
      onError?.(err);
    },
    [onError],
  );

  // Efecto principal: cargar Phaser e inicializar juego
  useEffect(() => {
    if (!containerRef.current) return;

    let game: Phaser.Game | null = null;
    let isMounted = true;

    const initGame = async (): Promise<void> => {
      try {
        // Verificar que el template existe
        const SceneClass = GameRegistry.get(template);
        if (!SceneClass) {
          throw new Error(`Template "${template}" not found in GameRegistry`);
        }

        // Importar Phaser dinámicamente (evita SSR issues)
        const Phaser = await import('phaser');

        if (!isMounted || !containerRef.current) return;

        // Crear instancia de la escena
        const sceneKey = `${template}-${Date.now()}`;
        const sceneInstance = new SceneClass(sceneKey);

        // Datos iniciales para la escena
        const initData: SceneInitData<TConfig> = {
          config,
          callbacks,
          previousState,
        };

        // Configuración de Phaser
        const gameConfig: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: containerRef.current,
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          transparent: true,
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { x: 0, y: 300 },
              debug: false,
            },
          },
          scene: sceneInstance,
          callbacks: {
            preBoot: (bootGame) => {
              // Pasar datos iniciales a la escena
              bootGame.registry.set('initData', initData);
            },
          },
        };

        // Crear el juego
        game = new Phaser.Game(gameConfig);
        gameRef.current = game;

        // Escuchar cuando la escena esté lista
        EventBus.onceGameReady(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

        // Override del init de la escena para recibir datos
        const originalInit = sceneInstance.init.bind(sceneInstance);
        sceneInstance.init = function (data: unknown) {
          const storedData = this.game.registry.get('initData');
          if (isSceneInitData(storedData)) {
            originalInit(storedData);
          } else if (isSceneInitData(data)) {
            originalInit(data);
          }
        };
      } catch (err) {
        if (isMounted) {
          handleError(
            err instanceof Error ? err : new Error(String(err)),
            'Game initialization failed',
          );
          setIsLoading(false);
        }
      }
    };

    initGame();

    // Cleanup
    return () => {
      isMounted = false;

      if (game) {
        game.destroy(true);
        gameRef.current = null;
      }

      // Limpiar listeners del EventBus específicos de este juego
      EventBus.removeAllGameListeners();
    };
  }, [template, config, callbacks, previousState, handleError]);

  // Escuchar eventos del EventBus para callbacks
  useEffect(() => {
    const handleComplete = (result: GameResult): void => {
      onComplete(result);
    };

    const handleProgress = (progress: GameProgress): void => {
      onProgress?.(progress);
    };

    const handleGameError = ({ error: err }: { error: Error }): void => {
      handleError(err, 'Game error');
    };

    EventBus.onGameComplete(handleComplete);
    EventBus.onGameProgress(handleProgress);
    EventBus.onGameError(handleGameError);

    return () => {
      EventBus.offGameComplete(handleComplete);
      EventBus.offGameProgress(handleProgress);
      EventBus.offGameError(handleGameError);
    };
  }, [onComplete, onProgress, handleError]);

  // Render
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ touchAction: 'none' }} // Prevenir gestos del browser
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-lg">Cargando juego...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 z-10">
          <div className="text-white text-center p-4">
            <p className="text-lg font-bold mb-2">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook para pausar/resumir el juego desde React
 */
export function useGameControls(): {
  pause: () => void;
  resume: () => void;
} {
  const pause = useCallback(() => {
    EventBus.emitGamePause();
  }, []);

  const resume = useCallback(() => {
    EventBus.emitGameResume();
  }, []);

  return { pause, resume };
}

/**
 * Función para limpiar el EventBus (útil en tests)
 */
export { destroyEventBus };
