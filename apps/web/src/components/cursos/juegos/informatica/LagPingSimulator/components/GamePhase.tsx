import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, TargetCircle } from '../types';
import { getPingColorClass } from '../constants';
import { RefreshCcw, Target } from 'lucide-react';

interface GamePhaseProps {
  server: Server;
  onBack: () => void;
  onFinish: () => void;
}

const GamePhase: React.FC<GamePhaseProps> = ({ server, onBack, onFinish }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [targets, setTargets] = useState<TargetCircle[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const [lastHitTime, setLastHitTime] = useState(0);

  // Game Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  // Spawn Targets
  useEffect(() => {
    if (!isPlaying) return;

    // Initial spawn
    if (targets.length === 0) spawnTarget();

    const interval = setInterval(() => {
      if (targets.length < 4) spawnTarget();
    }, 900);

    return () => clearInterval(interval);
  }, [isPlaying, targets.length]);

  const spawnTarget = () => {
    const id = Date.now().toString() + Math.random().toString();
    const newTarget: TargetCircle = {
      id,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      status: 'active',
    };
    setTargets((prev) => [...prev, newTarget]);
  };

  const handleTargetClick = (id: string) => {
    // 1. Visual Click Feedback (Client Side Prediction)
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'hit-waiting' } : t)));

    // 2. Simulate Ping Delay
    const jitter = Math.random() * 20 - 10;
    const actualDelay = Math.max(10, server.ping + jitter);

    setTimeout(() => {
      // 3. Server Confirmation
      setTargets((prev) => prev.filter((t) => t.id !== id));
      setScore((s) => s + 100);
      setLastHitTime(Date.now());
    }, actualDelay);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setTargets([]);
    setGameEnded(false);
    setIsPlaying(true);
  };

  return (
    <div className="w-full h-full max-w-7xl mx-auto flex flex-col items-center font-sans">
      {/* HUD HEADER - Compacto */}
      <div className="w-full grid grid-cols-3 gap-2 mb-2 shrink-0">
        {/* Server Info - Left HUD */}
        <div className="bg-black/80 border-l-4 border-blue-500 p-1.5 clip-hud-left relative overflow-hidden">
          <style>{`.clip-hud-left { clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%); }`}</style>
          <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
          <div className="flex items-center gap-2">
            <div className="text-lg md:text-xl">{server.emoji}</div>
            <div>
              <div className="text-[8px] md:text-[9px] text-blue-400 font-tech tracking-widest uppercase">
                SERVIDOR
              </div>
              <div className="text-xs md:text-sm font-bold font-tech text-white">
                {server.nombre.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Timer - Center HUD */}
        <div className="flex flex-col items-center justify-center bg-black/60 border-t-2 border-b-2 border-yellow-500/50 backdrop-blur-sm relative py-1">
          <div className="text-[8px] md:text-[9px] text-yellow-500 font-tech tracking-[0.3em] mb-0.5">
            TIEMPO
          </div>
          <div
            className={`text-lg md:text-2xl font-black font-tech tabular-nums tracking-widest ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}
          >
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Ping/Score - Right HUD */}
        <div className="bg-black/80 border-r-4 border-green-500 p-1.5 clip-hud-right text-right relative overflow-hidden">
          <style>{`.clip-hud-right { clip-path: polygon(5% 0, 100% 0, 100% 100%, 0% 100%); }`}</style>
          <div className="absolute inset-0 bg-green-900/10 pointer-events-none"></div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[8px] md:text-[9px] text-green-400 font-tech tracking-widest uppercase">
                LATENCIA
              </span>
              <div
                className={`px-1 py-0.5 text-[9px] font-bold bg-black border ${getPingColorClass(server.ping).replace('text-', 'border-')} ${getPingColorClass(server.ping)}`}
              >
                {server.ping}ms
              </div>
            </div>
            <div className="text-lg md:text-xl font-black font-tech text-white tabular-nums">
              {score} <span className="text-[10px] text-slate-500 font-normal">XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* GAME VIEWPORT - Ahora usa flex-1 para llenar espacio */}
      <div className="relative w-full flex-1 bg-[#050505] rounded-none border-y-2 border-slate-800 overflow-hidden shadow-2xl cursor-crosshair group ring-1 ring-white/5 min-h-0">
        {/* Animated Grid Floor */}
        <div className="absolute inset-0 opacity-30 pointer-events-none perspective-grid">
          <style>{`
                .perspective-grid {
                    background-image:
                        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
                    background-size: 40px 40px;
                    transform: perspective(500px) rotateX(20deg);
                    transform-origin: center 80%;
                }
            `}</style>
        </div>

        {/* Vignette & Scanlines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none z-10 opacity-20"></div>

        {/* Start Screen Overlay */}
        {!isPlaying && !gameEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 backdrop-blur-sm">
            <div className="p-6 md:p-10 border border-cyan-500/30 bg-black/80 relative overflow-hidden group max-w-lg text-center mx-4">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>

              <h3 className="text-2xl md:text-4xl font-black font-tech text-white mb-2 tracking-tighter italic">
                ENTRENAMIENTO <span className="text-cyan-400">DE REFLEJOS</span>
              </h3>
              <p className="mb-6 md:mb-8 text-slate-400 font-mono text-xs md:text-sm leading-relaxed">
                EL OBJETIVO: Elimina los objetivos.
                <br />
                LA ADVERTENCIA: El Ping afectará tus disparos.
                <br />
                <span className={`block mt-2 ${getPingColorClass(server.ping)} font-bold`}>
                  PING DETECTADO: {server.ping}ms
                </span>
              </p>
              <button
                onClick={startGame}
                className="bg-cyan-600 hover:bg-cyan-500 text-black font-black font-tech py-3 md:py-4 px-8 md:px-12 text-lg md:text-xl skew-x-[-10deg] hover:skew-x-[-20deg] transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              >
                INICIAR SIMULACIÓN
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 backdrop-blur-md p-4 overflow-y-auto">
            <div className="text-center relative max-w-3xl w-full my-auto">
              <h3 className="text-4xl md:text-6xl font-black font-tech text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-4">
                MISIÓN TERMINADA
              </h3>

              <div className="grid grid-cols-2 gap-4 md:gap-8 my-8 md:my-10 max-w-2xl mx-auto">
                <div className="bg-slate-900/50 p-6 md:p-8 border border-slate-700">
                  <div className="text-xs md:text-sm text-slate-500 font-tech uppercase tracking-widest mb-2">
                    PUNTAJE TOTAL
                  </div>
                  <div className="text-4xl md:text-6xl font-black text-yellow-400 font-tech">
                    {score}
                  </div>
                </div>
                <div className="bg-slate-900/50 p-6 md:p-8 border border-slate-700">
                  <div className="text-xs md:text-sm text-slate-500 font-tech uppercase tracking-widest mb-2">
                    LATENCIA SUFRIDA
                  </div>
                  <div
                    className={`text-4xl md:text-6xl font-black font-tech ${getPingColorClass(server.ping)}`}
                  >
                    {server.ping}ms
                  </div>
                </div>
              </div>

              <div className="max-w-xl mx-auto mb-8 md:mb-10 text-base md:text-lg text-slate-300 bg-blue-900/20 p-4 md:p-5 border-l-4 border-blue-500 text-left">
                {server.ping > 200
                  ? '⚠️ INFORME: Se detectó un retraso significativo entre tu clic y la explosión del objetivo. Esto es el LAG causado por la distancia.'
                  : '✅ INFORME: Respuesta táctil casi instantánea. La proximidad del servidor eliminó el lag.'}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="px-5 md:px-7 py-3 md:py-4 border border-slate-600 hover:bg-slate-800 text-white font-tech uppercase tracking-wider transition flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <RefreshCcw size={16} /> Cambiar Región
                </button>
                <button
                  onClick={startGame}
                  className="px-5 md:px-7 py-3 md:py-4 bg-white text-black hover:bg-gray-200 font-black font-tech uppercase tracking-wider transition text-sm md:text-base"
                >
                  Reintentar
                </button>
                <button
                  onClick={onFinish}
                  className="px-5 md:px-7 py-3 md:py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-black font-tech uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.5)] transition text-sm md:text-base"
                >
                  Análisis Final ➡
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TARGETS */}
        <AnimatePresence>
          {targets.map((target) => (
            <motion.div
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }} // Explode out
              className="absolute w-16 h-16 md:w-20 md:h-20 flex items-center justify-center cursor-pointer"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => target.status === 'active' && handleTargetClick(target.id)}
            >
              {/* HIT MARKER (When waiting for server) */}
              {target.status === 'hit-waiting' && (
                <div className="absolute inset-0 z-20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-yellow-400 rotate-45"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-yellow-400 -rotate-45"></div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-400 text-xs font-bold whitespace-nowrap animate-bounce">
                    LAG...
                  </div>
                </div>
              )}

              {/* TARGET GRAPHIC */}
              <motion.div
                className={`relative w-full h-full flex items-center justify-center
                             ${target.status === 'hit-waiting' ? 'opacity-50 grayscale' : ''}
                        `}
                whileHover={target.status === 'active' ? { scale: 1.1 } : {}}
                whileTap={target.status === 'active' ? { scale: 0.9 } : {}}
              >
                {/* Rotating outer ring */}
                <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-full border-dashed animate-[spin_4s_linear_infinite]"></div>

                {/* Core */}
                <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-900/40 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] backdrop-blur-sm relative overflow-hidden group-hover:bg-cyan-500/20 transition-colors">
                  <Target size={20} className="text-cyan-200 md:w-6 md:h-6" />
                  {/* Scan line effect inside target */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-[scan_1s_linear_infinite]"></div>
                </div>

                {/* Lock-on corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white"></div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Crosshair following cursor (CSS only for perf, simple overlay centered) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <div className="w-px h-full bg-cyan-500"></div>
          <div className="h-px w-full bg-cyan-500 absolute"></div>
        </div>
      </div>

      <div className="mt-1 flex gap-2 text-[8px] md:text-[9px] font-mono text-slate-500 uppercase tracking-wider flex-wrap justify-center">
        <span>
          Estado: <span className="text-green-500">EN LÍNEA</span>
        </span>
        <span>
          Packet Loss: <span className="text-white">0%</span>
        </span>
        <span>
          Interpolation: <span className="text-white">ON</span>
        </span>
      </div>
    </div>
  );
};

export default GamePhase;
