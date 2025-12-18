/**
 * DIBUJÁ LA FORMA
 * ===============
 *
 * Simulación de reconocimiento de formas geométricas
 * El usuario dibuja formas y el algoritmo las detecta usando matemáticas
 *
 * Enseña: Cómo las computadoras "ven" y analizan imágenes usando geometría
 *
 * Grupos: B1 (6-7 años) y B2 (8-9 años)
 * Duración: 8-12 minutos
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  analizarDibujo,
  type FormaType,
  type Tolerancia,
  type Point,
  type ResultadoAnalisis,
} from '@/lib/services/geometryService';

// ============================================================================
// TIPOS Y CONFIGURACIÓN
// ============================================================================

interface LevelConfig {
  id: 1 | 2 | 3;
  name: string;
  stars: number;
  formas: FormaType[];
  rondas: number;
  tolerancia: Tolerancia;
  mostrarEjemplo: boolean;
}

interface GameStats {
  score: number;
  correctAnswers: number;
  totalRounds: number;
}

type GameState = 'menu' | 'playing' | 'analyzing' | 'feedback' | 'summary';
type AnalysisPhase = 'scanning' | 'measuring' | 'result';

const FORMAS_INFO: Record<
  FormaType,
  { label: string; emoji: string; color: string; hint: string }
> = {
  circulo: {
    label: 'CÍRCULO',
    emoji: '🔵',
    color: 'text-cyan-400',
    hint: 'Redondo, sin esquinas',
  },
  cuadrado: {
    label: 'CUADRADO',
    emoji: '🟥',
    color: 'text-pink-500',
    hint: '4 lados iguales, cajita perfecta',
  },
  triangulo: {
    label: 'TRIÁNGULO',
    emoji: '🔺',
    color: 'text-yellow-400',
    hint: '3 puntas',
  },
  linea: {
    label: 'LÍNEA',
    emoji: '➖',
    color: 'text-lime-400',
    hint: 'Derechito de un lado a otro',
  },
  rectangulo: {
    label: 'RECTÁNGULO',
    emoji: '🟧',
    color: 'text-orange-500',
    hint: 'Como un cuadrado pero estirado',
  },
  rombo: {
    label: 'ROMBO',
    emoji: '🔶',
    color: 'text-purple-400',
    hint: 'Como un diamante parado de punta',
  },
};

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Fácil',
    stars: 1,
    formas: ['circulo', 'cuadrado'],
    rondas: 4,
    tolerancia: 'alta',
    mostrarEjemplo: true,
  },
  {
    id: 2,
    name: 'Medio',
    stars: 2,
    formas: ['circulo', 'cuadrado', 'triangulo', 'linea', 'rectangulo'],
    rondas: 6,
    tolerancia: 'media',
    mostrarEjemplo: true,
  },
  {
    id: 3,
    name: 'Difícil',
    stars: 3,
    formas: ['circulo', 'cuadrado', 'triangulo', 'linea', 'rectangulo', 'rombo'],
    rondas: 8,
    tolerancia: 'baja',
    mostrarEjemplo: false,
  },
];

// ============================================================================
// SUB-COMPONENTES
// ============================================================================

interface GameCanvasProps {
  onDrawEnd: (points: Point[]) => void;
  isLocked: boolean;
  clearTrigger: number;
}

function GameCanvas({ onDrawEnd, isLocked, clearTrigger }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setPoints([]);
    }
  }, [clearTrigger]);

  const getCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (x: number, y: number) => {
    if (isLocked) return;
    setIsDrawing(true);
    const newPoint = { x, y };
    setPoints([newPoint]);

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
    }
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing || isLocked) return;

    const newPoint = { x, y };
    setPoints((prev) => [...prev, newPoint]);

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
      ctx.shadowBlur = 0;
    }
    onDrawEnd(points);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCoordinates(e.clientX, e.clientY);
    startDrawing(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCoordinates(e.clientX, e.clientY);
    draw(x, y);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const { x, y } = getCoordinates(touch.clientX, touch.clientY);
    startDrawing(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const { x, y } = getCoordinates(touch.clientX, touch.clientY);
    draw(x, y);
  };

  return (
    <div className="relative w-full h-80 rounded-3xl overflow-hidden border-[6px] border-slate-700/50 bg-slate-900/50 shadow-[0_0_30px_rgba(0,0,0,0.3)] ring-4 ring-white/10">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={endDrawing}
      />
      {!isDrawing && points.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50 animate-pulse">
          <span className="text-6xl mb-2">☝️</span>
          <span className="text-xl font-bold text-white tracking-widest">DIBUJÁ AQUÍ</span>
        </div>
      )}
    </div>
  );
}

interface AnalysisOverlayProps {
  isVisible: boolean;
  points: Point[];
  phase: AnalysisPhase;
  centroide?: Point;
}

function AnalysisOverlay({ isVisible, points, phase, centroide }: AnalysisOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {phase === 'scanning' && (
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"
          animate={{ y: [0, 400, 0] }}
          transition={{ duration: 1.5, repeat: 0 }}
        />
      )}

      {(phase === 'measuring' || phase === 'result') && centroide && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
        >
          <motion.circle
            cx={centroide.x}
            cy={centroide.y}
            r="8"
            fill="#f472b6"
            stroke="white"
            strokeWidth="3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />

          {points
            .filter((_, i) => i % 8 === 0)
            .map((p, i) => (
              <motion.line
                key={i}
                x1={centroide.x}
                y1={centroide.y}
                x2={p.x}
                y2={p.y}
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="2"
                strokeDasharray="5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}

          <circle
            cx={centroide.x}
            cy={centroide.y}
            r="50"
            fill="none"
            stroke="rgba(250, 204, 21, 0.3)"
            strokeWidth="2"
            strokeDasharray="4 2"
            className="animate-spin-slow"
          />
        </svg>
      )}

      <div className="absolute bottom-6 left-0 right-0 text-center flex justify-center">
        {phase === 'scanning' && (
          <motion.div
            className="bg-slate-900/90 backdrop-blur-md border border-green-500/50 text-green-400 px-6 py-3 rounded-full font-mono text-xl font-bold flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              ●
            </motion.span>
            Analizando puntos...
          </motion.div>
        )}
        {phase === 'measuring' && (
          <motion.div
            className="bg-slate-900/90 backdrop-blur-md border border-yellow-500/50 text-yellow-400 px-6 py-3 rounded-full font-mono text-xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            📐 Midiendo distancias...
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PROPS DEL COMPONENTE
// ============================================================================

interface DibujaLaFormaProps {
  onCompleted?: () => void;
  onExit?: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function DibujaLaForma({ onCompleted, onExit }: DibujaLaFormaProps) {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [round, setRound] = useState(1);
  const [stats, setStats] = useState<GameStats>({ score: 0, correctAnswers: 0, totalRounds: 0 });
  const [currentShapeIdx, setCurrentShapeIdx] = useState(0);

  const [drawnPoints, setDrawnPoints] = useState<Point[]>([]);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ResultadoAnalisis | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('scanning');

  const startGame = (levelId: number) => {
    const level = LEVELS.find((l) => l.id === levelId);
    if (!level) return;

    setCurrentLevel(level);
    setRound(1);
    setStats({ score: 0, correctAnswers: 0, totalRounds: level.rondas });
    setGameState('playing');
    setCurrentShapeIdx(0);
    setClearTrigger((c) => c + 1);
  };

  const handleDrawEnd = (points: Point[]) => {
    setDrawnPoints(points);
  };

  const handleClear = () => {
    setDrawnPoints([]);
    setClearTrigger((c) => c + 1);
  };

  const handleAnalyze = () => {
    if (!currentLevel || drawnPoints.length < 5) return;

    setGameState('analyzing');
    setAnalysisPhase('scanning');

    const expectedShape = currentLevel.formas[currentShapeIdx % currentLevel.formas.length];

    setTimeout(() => {
      const result = analizarDibujo(drawnPoints, expectedShape, currentLevel.tolerancia);
      setAnalysisResult(result);
      setAnalysisPhase('measuring');

      setTimeout(() => {
        setAnalysisPhase('result');
        setGameState('feedback');

        if (result.esCorrecta) {
          setStats((prev) => ({
            ...prev,
            score: prev.score + 100,
            correctAnswers: prev.correctAnswers + 1,
          }));
          confetti({ particleCount: 100, spread: 70 });
        }
      }, 1500);
    }, 1500);
  };

  const handleNextRound = () => {
    if (!currentLevel) return;

    if (round >= currentLevel.rondas) {
      setGameState('summary');
    } else {
      setRound((r) => r + 1);
      setCurrentShapeIdx((prev) => prev + 1);
      setGameState('playing');
      setDrawnPoints([]);
      setClearTrigger((c) => c + 1);
      setAnalysisResult(null);
    }
  };

  const handleExitToMenu = () => {
    setGameState('menu');
    setCurrentLevel(null);
  };

  const handleExitGame = () => {
    if (onExit) {
      onExit();
    } else {
      handleExitToMenu();
    }
  };

  const handleCompletedAndExit = () => {
    confetti({ particleCount: 200, spread: 100 });
    if (onCompleted) {
      setTimeout(() => onCompleted(), 2000);
    } else {
      handleExitToMenu();
    }
  };

  const RoundIndicator = () => {
    if (!currentLevel) return null;
    return (
      <div className="flex gap-2">
        {Array.from({ length: currentLevel.rondas }).map((_, i) => {
          let colorClass = 'bg-slate-700 border-slate-600';
          if (i < round - 1)
            colorClass = 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]';
          if (i === round - 1) colorClass = 'bg-yellow-400 border-yellow-200 animate-pulse';

          return (
            <div key={i} className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 ${colorClass}`} />
          );
        })}
      </div>
    );
  };

  // ============================================================================
  // RENDERS
  // ============================================================================

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 space-y-12">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500">
            Dibujá la Forma
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 font-medium">
            ¿Puede la compu adivinar tu dibujo? 🤖✨
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
          {LEVELS.map((level, idx) => {
            const colors = {
              1: 'from-green-400 to-emerald-600 border-emerald-400',
              2: 'from-yellow-400 to-amber-600 border-amber-400',
              3: 'from-red-400 to-rose-600 border-rose-400',
            }[level.id];

            return (
              <motion.button
                key={level.id}
                onClick={() => startGame(level.id)}
                className={`group relative flex flex-col items-center p-8 rounded-3xl bg-gradient-to-b ${colors} border-4 shadow-2xl hover:scale-105 active:scale-95 transition-transform`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {level.id === 1 ? '😊' : level.id === 2 ? '😎' : '🤯'}
                </div>
                <h3 className="text-4xl font-black text-white mb-2">{level.name}</h3>
                <div className="flex gap-1 mb-4 text-2xl">
                  {Array(level.stars).fill('⭐').join('')}
                </div>
                <div className="flex flex-wrap justify-center gap-2 bg-black/20 px-4 py-2 rounded-xl">
                  {level.formas.map((f) => (
                    <span key={f} className="text-2xl" title={FORMAS_INFO[f].label}>
                      {FORMAS_INFO[f].emoji}
                    </span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        {onExit && (
          <motion.button
            onClick={onExit}
            className="px-8 py-3 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 rounded-xl font-bold transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ← Volver
          </motion.button>
        )}
      </div>
    );
  }

  if (gameState === 'playing' || gameState === 'analyzing' || gameState === 'feedback') {
    if (!currentLevel) return null;
    const currentShapeKey = currentLevel.formas[currentShapeIdx % currentLevel.formas.length];
    const shapeInfo = FORMAS_INFO[currentShapeKey];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center p-4 max-w-4xl mx-auto w-full">
        <div className="w-full flex justify-between items-center mb-6 bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border-2 border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleExitGame}
              className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Nivel
              </span>
              <span className="text-white font-bold text-lg">{currentLevel.name}</span>
            </div>
          </div>

          <RoundIndicator />

          <div className="hidden md:flex flex-col items-end">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Puntaje
            </span>
            <span className="text-yellow-400 font-black text-xl">{stats.score}</span>
          </div>
        </div>

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-2">
            Dibujá un <span className={`${shapeInfo.color}`}>{shapeInfo.label}</span>{' '}
            {shapeInfo.emoji}
          </h2>
          {currentLevel.mostrarEjemplo && (
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mt-2 border border-white/10">
              <span className="text-lg text-blue-100 font-medium">💡 Tip: {shapeInfo.hint}</span>
            </div>
          )}
        </motion.div>

        <div className="relative w-full mb-8 max-w-2xl">
          <GameCanvas
            onDrawEnd={handleDrawEnd}
            isLocked={gameState !== 'playing'}
            clearTrigger={clearTrigger}
          />
          {(gameState === 'analyzing' || gameState === 'feedback') && (
            <AnalysisOverlay
              isVisible={true}
              points={drawnPoints}
              phase={analysisPhase}
              centroide={analysisResult?.detalles.centroide}
            />
          )}
        </div>

        {gameState === 'playing' && (
          <div className="flex w-full max-w-2xl gap-4">
            <button
              onClick={handleClear}
              className="flex-1 bg-gradient-to-b from-slate-600 to-slate-800 text-slate-200 font-black py-4 rounded-2xl text-xl hover:brightness-110 transition-all"
            >
              🗑️ Borrar
            </button>
            <button
              onClick={handleAnalyze}
              disabled={drawnPoints.length < 5}
              className={`flex-[2] font-black py-4 rounded-2xl text-2xl transition-all ${
                drawnPoints.length < 5
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-b from-green-400 to-emerald-600 text-white shadow-lg hover:brightness-110'
              }`}
            >
              ✅ ¡Listo!
            </button>
          </div>
        )}

        <AnimatePresence>
          {gameState === 'feedback' && analysisResult && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-lg bg-slate-900/95 backdrop-blur-xl p-8 rounded-3xl border-4 border-white/20 text-center max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="text-7xl mb-4">{analysisResult.esCorrecta ? '🎉' : '🤔'}</div>
                <h3
                  className={`text-4xl font-black mb-6 ${analysisResult.esCorrecta ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  {analysisResult.esCorrecta ? '¡CORRECTO!' : 'Mmm... casi'}
                </h3>

                <div className="w-full bg-slate-800/80 p-6 rounded-3xl border border-white/10 mb-8">
                  <p className="text-slate-300 mb-4 text-xl">
                    La compu ve un: <br />
                    <span className="font-black text-3xl text-white block mt-1">
                      {analysisResult.formaDetectada.toUpperCase()}
                    </span>
                  </p>

                  <div className="relative h-8 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      className={`h-full ${analysisResult.esCorrecta ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${analysisResult.confianza}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm font-bold">
                    <span className="text-slate-500">No sé...</span>
                    <span className="text-white">{analysisResult.confianza}% Seguro</span>
                    <span className="text-slate-500">¡Sí!</span>
                  </div>

                  <p className="text-lg text-blue-300 mt-4 font-medium italic">
                    "{analysisResult.detalles.mensaje}"
                  </p>
                </div>

                <button
                  onClick={handleNextRound}
                  className="w-full bg-gradient-to-b from-blue-400 to-indigo-600 text-white font-black py-4 rounded-2xl text-2xl hover:brightness-110 transition-all"
                >
                  Siguiente Forma ➡
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (gameState === 'summary') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 space-y-8">
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-8xl mb-4">🏆</div>
          <h2 className="text-5xl font-black text-white mb-2">¡Nivel Completado!</h2>
          <p className="text-2xl text-blue-200">¡Sos un artista digital! 🎨</p>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-md p-8 rounded-3xl w-full max-w-lg border border-white/20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6 text-2xl font-bold text-white border-b border-white/10 pb-4">
            <span>Aciertos:</span>
            <span className="text-green-400 bg-green-400/20 px-4 py-1 rounded-lg">
              {stats.correctAnswers} / {stats.totalRounds}
            </span>
          </div>
          <div className="flex justify-between items-center text-2xl font-bold text-white">
            <span>Puntaje:</span>
            <span className="text-yellow-400 bg-yellow-400/20 px-4 py-1 rounded-lg">
              {stats.score}
            </span>
          </div>
        </motion.div>

        <motion.button
          onClick={handleCompletedAndExit}
          className="w-full max-w-lg bg-gradient-to-b from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black py-5 rounded-2xl text-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {onCompleted ? 'Continuar →' : '🏠 Volver al Inicio'}
        </motion.button>
      </div>
    );
  }

  return null;
}
