'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { GameResult, GameProgress } from '@mateatletas/game-engine/core';

// Cargar dinámicamente para evitar SSR con Phaser
const TemplatePlayer = dynamic(() => import('./TemplatePlayer'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-black/30 rounded-2xl">
      <div className="text-white">Cargando motor de juegos...</div>
    </div>
  ),
});

// Catálogo de templates organizados por categoría
const TEMPLATE_CATALOG = {
  arcade: {
    label: 'Arcade / Reflejos',
    templates: [
      {
        id: 'catcher',
        name: 'Catcher',
        description: 'Atrapar objetos que caen',
        status: 'ready',
      },
      { id: 'shooter', name: 'Shooter', description: 'Disparar a targets', status: 'ready' },
      { id: 'dodger', name: 'Dodger', description: 'Esquivar obstáculos', status: 'ready' },
      { id: 'runner', name: 'Runner', description: 'Endless runner', status: 'ready' },
      { id: 'breakout', name: 'Breakout', description: 'Romper bloques', status: 'pending' },
      { id: 'pong', name: 'Pong', description: 'Rebote de pelota', status: 'pending' },
      { id: 'snake', name: 'Snake', description: 'Serpiente', status: 'pending' },
      { id: 'whackamole', name: 'Whack-a-Mole', description: 'Golpear targets', status: 'ready' },
    ],
  },
  puzzle: {
    label: 'Puzzle / Lógica',
    templates: [
      { id: 'match3', name: 'Match-3', description: 'Conectar 3+ iguales', status: 'pending' },
      { id: 'sokoban', name: 'Sokoban', description: 'Empujar cajas', status: 'pending' },
      { id: 'pipes', name: 'Pipes', description: 'Conectar tuberías', status: 'pending' },
      { id: 'jigsaw', name: 'Jigsaw', description: 'Rompecabezas', status: 'pending' },
      { id: 'tangram', name: 'Tangram', description: 'Rotar piezas', status: 'pending' },
      { id: 'sudoku', name: 'Sudoku', description: 'Llenar grilla', status: 'pending' },
      { id: 'maze', name: 'Maze', description: 'Laberinto', status: 'pending' },
      { id: 'lights', name: 'Lights Out', description: 'Toggle luces', status: 'pending' },
    ],
  },
  platformer: {
    label: 'Platformer',
    templates: [
      {
        id: 'platformer',
        name: 'Platformer',
        description: 'Plataformas clásico',
        status: 'pending',
      },
      {
        id: 'gravityFlip',
        name: 'Gravity Flip',
        description: 'Invertir gravedad',
        status: 'pending',
      },
      { id: 'doubleJump', name: 'Double Jump', description: 'Doble salto', status: 'pending' },
      { id: 'timeRewind', name: 'Time Rewind', description: 'Rebobinar tiempo', status: 'pending' },
      { id: 'portal', name: 'Portal', description: 'Crear portales', status: 'pending' },
    ],
  },
  quiz: {
    label: 'Quiz / Trivia',
    templates: [
      {
        id: 'millionaire',
        name: 'Millionaire',
        description: 'Preguntas escaladas',
        status: 'pending',
      },
      { id: 'fastAnswer', name: 'Fast Answer', description: 'Respuesta rápida', status: 'pending' },
      { id: 'duel', name: 'Duel', description: 'Competir vs CPU', status: 'pending' },
      { id: 'pyramid', name: 'Pyramid', description: 'Pistas reveladoras', status: 'pending' },
    ],
  },
  strategy: {
    label: 'Estrategia / Simulación',
    templates: [
      {
        id: 'towerDefense',
        name: 'Tower Defense',
        description: 'Defender oleadas',
        status: 'pending',
      },
      { id: 'idle', name: 'Idle', description: 'Incremental', status: 'pending' },
      { id: 'tycoon', name: 'Tycoon', description: 'Gestionar recursos', status: 'pending' },
      {
        id: 'cardBattle',
        name: 'Card Battle',
        description: 'Batalla de cartas',
        status: 'pending',
      },
    ],
  },
  creativity: {
    label: 'Creatividad / Habilidad',
    templates: [
      { id: 'typing', name: 'Typing', description: 'Escribir rápido', status: 'pending' },
      { id: 'rhythm', name: 'Rhythm', description: 'Timing musical', status: 'pending' },
      { id: 'drawing', name: 'Drawing', description: 'Dibujar formas', status: 'pending' },
      { id: 'memory', name: 'Memory', description: 'Memorizar', status: 'pending' },
      { id: 'sequence', name: 'Sequence', description: 'Repetir secuencia', status: 'pending' },
    ],
  },
  exploration: {
    label: 'Exploración',
    templates: [
      {
        id: 'pointClick',
        name: 'Point & Click',
        description: 'Explorar escena',
        status: 'pending',
      },
      {
        id: 'visualNovel',
        name: 'Visual Novel',
        description: 'Historia interactiva',
        status: 'pending',
      },
    ],
  },
} as const;

type TemplateId = string;
type CategoryId = keyof typeof TEMPLATE_CATALOG;

/**
 * GameTemplatesDemo - Página para probar todos los 36 templates de juego
 *
 * Permite seleccionar y probar cada template individualmente
 * mostrando el resultado al finalizar.
 */
export default function GameTemplatesDemoPage(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('arcade');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const handleComplete = (result: GameResult): void => {
    setGameResult(result);
    setIsPlaying(false);
  };

  const handleProgress = (progress: GameProgress): void => {
    console.log('[Progress]', progress);
  };

  const handlePlayTemplate = (templateId: TemplateId): void => {
    setSelectedTemplate(templateId);
    setGameResult(null);
    setIsPlaying(true);
  };

  const handleStopGame = (): void => {
    setIsPlaying(false);
    setSelectedTemplate(null);
  };

  const currentCategory = TEMPLATE_CATALOG[selectedCategory];
  const implementedCount = Object.values(TEMPLATE_CATALOG)
    .flatMap((cat) => cat.templates)
    .filter((t) => t.status === 'ready').length;
  const totalCount = Object.values(TEMPLATE_CATALOG).flatMap((cat) => cat.templates).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Game Templates Demo</h1>
          <p className="text-gray-400">
            Catálogo de {totalCount} templates de minijuegos educativos. Implementados:{' '}
            <span className="text-cyan-400 font-medium">
              {implementedCount}/{totalCount}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Categorías */}
          <div className="col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Categorías
              </h2>
              <nav className="space-y-1">
                {Object.entries(TEMPLATE_CATALOG).map(([catId, cat]) => {
                  const readyCount = cat.templates.filter((t) => t.status === 'ready').length;
                  return (
                    <button
                      key={catId}
                      onClick={() => setSelectedCategory(catId as CategoryId)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedCategory === catId
                          ? 'bg-purple-600/30 text-white border border-purple-500/50'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="font-medium">{cat.label}</div>
                      <div className="text-xs mt-1 opacity-60">
                        {readyCount}/{cat.templates.length} listos
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-9">
            {/* Game player (cuando está activo) */}
            {isPlaying && selectedTemplate && (
              <div className="mb-6">
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                      <h3 className="text-lg font-bold text-white">Jugando: {selectedTemplate}</h3>
                    </div>
                    <button
                      onClick={handleStopGame}
                      className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Detener
                    </button>
                  </div>
                  <TemplatePlayer
                    template={selectedTemplate}
                    onComplete={handleComplete}
                    onProgress={handleProgress}
                  />
                </div>
              </div>
            )}

            {/* Game result */}
            {gameResult && !isPlaying && (
              <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Resultado: {selectedTemplate}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ResultCard label="Score" value={gameResult.score} color="white" />
                  <ResultCard label="XP" value={gameResult.xp} color="cyan" />
                  <ResultCard
                    label="Tiempo"
                    value={`${gameResult.timeElapsed.toFixed(1)}s`}
                    color="white"
                  />
                  <ResultCard label="Max Combo" value={gameResult.maxCombo} color="amber" />
                  <ResultCard
                    label="Precisión"
                    value={`${(gameResult.accuracy * 100).toFixed(0)}%`}
                    color="green"
                  />
                  <ResultCard label="Vidas" value={gameResult.livesRemaining} color="red" />
                  <div className="col-span-2 bg-white/5 rounded-lg p-4">
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

            {/* Templates grid */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">{currentCategory.label}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentCategory.templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onPlay={() => handlePlayTemplate(template.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface ResultCardProps {
  label: string;
  value: string | number;
  color: 'white' | 'cyan' | 'amber' | 'green' | 'red';
}

function ResultCard({ label, value, color }: ResultCardProps): React.ReactElement {
  const colorClasses = {
    white: 'text-white',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    green: 'text-green-400',
    red: 'text-red-400',
  };

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    status: 'ready' | 'pending';
  };
  isSelected: boolean;
  onPlay: () => void;
}

function TemplateCard({ template, isSelected, onPlay }: TemplateCardProps): React.ReactElement {
  const isReady = template.status === 'ready';

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        isSelected
          ? 'bg-purple-600/30 border-purple-500/50'
          : isReady
            ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            : 'bg-white/[0.02] border-white/5 opacity-50'
      }`}
    >
      {/* Status badge */}
      <div className="absolute top-2 right-2">
        {isReady ? (
          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
            Listo
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-500 rounded-full">
            Pendiente
          </span>
        )}
      </div>

      <h3 className="font-bold text-white mb-1">{template.name}</h3>
      <p className="text-sm text-gray-400 mb-3">{template.description}</p>

      <button
        onClick={onPlay}
        disabled={!isReady}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          isReady
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isReady ? 'Jugar' : 'Próximamente'}
      </button>
    </div>
  );
}
