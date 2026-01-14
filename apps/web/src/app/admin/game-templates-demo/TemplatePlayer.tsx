'use client';

import { PhaserGame, useGameControls } from '@mateatletas/game-engine/core';
import type { GameResult, GameProgress } from '@mateatletas/game-engine/core';
// Importar templates para registrarlos en el GameRegistry
import '@mateatletas/game-engine/templates';

interface TemplatePlayerProps {
  template: string;
  onComplete: (result: GameResult) => void;
  onProgress: (progress: GameProgress) => void;
}

/**
 * TemplatePlayer - Componente que renderiza el template de juego seleccionado
 *
 * Se carga dinámicamente con ssr: false para evitar problemas
 * con las APIs del browser que Phaser necesita.
 */
export default function TemplatePlayer({
  template,
  onComplete,
  onProgress,
}: TemplatePlayerProps): React.ReactElement {
  const { pause, resume } = useGameControls();

  // Configuración de demo para cada template
  const demoConfig = getDemoConfigForTemplate(template);

  const handleError = (error: Error): void => {
    console.error(`[TemplatePlayer] Error in ${template}:`, error);
  };

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

      {/* Game canvas */}
      <div className="h-[600px]">
        <PhaserGame
          template={template}
          config={demoConfig}
          onComplete={onComplete}
          onProgress={onProgress}
          onError={handleError}
        />
      </div>
    </div>
  );
}

/**
 * Genera configuración de demo para cada template
 */
function getDemoConfigForTemplate(template: string): {
  title: string;
  instruction: string;
  lives: number;
  difficulty: 'easy' | 'medium' | 'hard';
  area: 'math' | 'code' | 'science';
  house: 'quantum' | 'vertex' | 'pulsar';
  duration?: number;
  templateConfig: Record<string, unknown>;
} {
  const baseConfig = {
    lives: 3,
    difficulty: 'easy' as const,
    area: 'math' as const,
    house: 'quantum' as const,
  };

  // Configuraciones específicas por template
  const configs: Record<
    string,
    {
      title: string;
      instruction: string;
      duration?: number;
      templateConfig: Record<string, unknown>;
    }
  > = {
    // Arcade
    catcher: {
      title: 'Atrapa Fracciones',
      instruction: 'Mueve el balde para atrapar las fracciones equivalentes a 1/2',
      duration: 60,
      templateConfig: {
        targets: {
          correct: ['1/2', '2/4', '3/6', '4/8'],
          wrong: ['1/3', '1/4', '2/3', '3/4'],
        },
        spawnRate: 1500,
        fallSpeed: { min: 100, max: 200 },
      },
    },
    shooter: {
      title: 'Dispara Primos',
      instruction: 'Dispara solo a los números primos',
      duration: 45,
      templateConfig: {
        targets: {
          correct: [2, 3, 5, 7, 11, 13],
          wrong: [4, 6, 8, 9, 10, 12],
        },
      },
    },
    dodger: {
      title: 'Esquiva Errores',
      instruction: 'Esquiva los errores de sintaxis',
      duration: 30,
      templateConfig: {},
    },
    runner: {
      title: 'Corre y Salta',
      instruction: 'Salta solo en los múltiplos de 3',
      templateConfig: {},
    },
    breakout: {
      title: 'Rompe Bloques',
      instruction: 'Destruye los bloques con la pelota',
      templateConfig: {},
    },
    pong: {
      title: 'Pong Matemático',
      instruction: 'Rebota la pelota para sumar puntos',
      templateConfig: {},
    },
    snake: {
      title: 'Serpiente de Verbos',
      instruction: 'Come solo los verbos en infinitivo',
      templateConfig: {},
    },
    whackamole: {
      title: 'Golpea Múltiplos',
      instruction: 'Golpea solo los múltiplos de 5',
      duration: 45,
      templateConfig: {
        correct: ['5', '10', '15', '20', '25', '30'],
        wrong: ['3', '7', '11', '13', '17', '23'],
        grid: { cols: 3, rows: 3 },
        timing: { spawnInterval: 1200, showTime: 2000 },
      },
    },

    // Puzzle
    match3: {
      title: 'Match-3 Moléculas',
      instruction: 'Conecta 3 o más moléculas iguales',
      templateConfig: {},
    },
    sokoban: {
      title: 'Empuja Números',
      instruction: 'Mueve los números para formar la ecuación',
      templateConfig: {},
    },
    pipes: {
      title: 'Circuitos',
      instruction: 'Conecta el circuito eléctrico',
      templateConfig: {},
    },
    jigsaw: {
      title: 'Rompecabezas',
      instruction: 'Arma el mapa de Argentina',
      templateConfig: {},
    },
    tangram: {
      title: 'Tangram',
      instruction: 'Forma la figura con los triángulos',
      templateConfig: {},
    },
    sudoku: {
      title: 'Mini Sudoku',
      instruction: 'Completa la grilla 4x4',
      templateConfig: {},
    },
    maze: {
      title: 'Laberinto',
      instruction: 'Encuentra la salida del laberinto',
      templateConfig: {},
    },
    lights: {
      title: 'Luces',
      instruction: 'Enciende todas las luces',
      templateConfig: {},
    },

    // Platformer
    platformer: {
      title: 'Plataformas',
      instruction: 'Recolecta los números en orden',
      templateConfig: {},
    },
    gravityFlip: {
      title: 'Gravedad',
      instruction: 'Cambia la gravedad para avanzar',
      templateConfig: {},
    },
    doubleJump: {
      title: 'Doble Salto',
      instruction: 'Usa el doble salto para alcanzar las potencias',
      templateConfig: {},
    },
    timeRewind: {
      title: 'Rebobinar',
      instruction: 'Rebobina el tiempo para corregir errores',
      templateConfig: {},
    },
    portal: {
      title: 'Portales',
      instruction: 'Crea portales con coordenadas',
      templateConfig: {},
    },

    // Quiz
    millionaire: {
      title: 'Millonario',
      instruction: 'Responde correctamente para ganar',
      templateConfig: {},
    },
    fastAnswer: {
      title: 'Respuesta Rápida',
      instruction: 'Responde antes de que se acabe el tiempo',
      duration: 60,
      templateConfig: {},
    },
    duel: {
      title: 'Duelo',
      instruction: 'Compite contra la CPU',
      templateConfig: {},
    },
    pyramid: {
      title: 'Pirámide',
      instruction: 'Adivina el personaje con las pistas',
      templateConfig: {},
    },

    // Strategy
    towerDefense: {
      title: 'Tower Defense',
      instruction: 'Defiende tu base con torres matemáticas',
      templateConfig: {},
    },
    idle: {
      title: 'Civilización',
      instruction: 'Construye tu civilización',
      templateConfig: {},
    },
    tycoon: {
      title: 'Ecosistema',
      instruction: 'Balancea el ecosistema',
      templateConfig: {},
    },
    cardBattle: {
      title: 'Batalla de Cartas',
      instruction: 'Usa cartas de elementos químicos',
      templateConfig: {},
    },

    // Creativity
    typing: {
      title: 'Typing',
      instruction: 'Escribe el código correctamente',
      duration: 60,
      templateConfig: {},
    },
    rhythm: {
      title: 'Ritmo',
      instruction: 'Sigue el ritmo de las tablas de multiplicar',
      templateConfig: {},
    },
    drawing: {
      title: 'Dibujo',
      instruction: 'Dibuja el gráfico de la función',
      templateConfig: {},
    },
    memory: {
      title: 'Memoria',
      instruction: 'Encuentra los pares de banderas',
      templateConfig: {},
    },
    sequence: {
      title: 'Secuencia',
      instruction: 'Repite la secuencia de colores',
      templateConfig: {},
    },

    // Exploration
    pointClick: {
      title: 'Explora la Célula',
      instruction: 'Encuentra todos los orgánulos',
      templateConfig: {},
    },
    visualNovel: {
      title: 'Aventura Histórica',
      instruction: 'Toma decisiones en la historia',
      templateConfig: {},
    },
  };

  const templateConfig = configs[template] ?? {
    title: `Demo: ${template}`,
    instruction: 'Template en desarrollo',
    templateConfig: {},
  };

  return {
    ...baseConfig,
    ...templateConfig,
  };
}
