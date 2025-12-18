'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, ArrowRight, Ruler, RotateCcw, Globe, Cpu, Zap, Activity } from 'lucide-react';
import { Phase, Server } from './types';
import MapPhase from './components/MapPhase';
import GamePhase from './components/GamePhase';

interface LagPingSimulatorProps {
  onCompleted?: () => void;
  onExit?: () => void;
}

const LagPingSimulator: React.FC<LagPingSimulatorProps> = ({ onCompleted, onExit }) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 0.3 } },
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <div className="h-full w-full bg-[#050505] text-white font-sans selection:bg-cyan-500 selection:text-black flex flex-col relative overflow-hidden">
      {/* --- CYBERPUNK BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Moving Grid */}
        <div className="absolute inset-0 bg-grid opacity-20 transform-gpu"></div>
        {/* Glow spots */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]"></div>
      </div>

      {/* Main Content Area - Ocupa todo el espacio */}
      <main className="flex-1 flex flex-col px-4 md:px-6 py-4 md:py-6 relative z-10 overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          {/* PHASE 1: INTRO */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto text-center relative"
            >
              {/* Decorative glitch squares */}
              <div className="absolute -top-10 -left-10 w-20 h-20 border-l-2 border-t-2 border-cyan-500/30"></div>
              <div className="absolute -bottom-10 -right-10 w-20 h-20 border-r-2 border-b-2 border-pink-500/30"></div>

              <div className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-mono text-xs tracking-wider">
                <Zap size={14} className="fill-yellow-400" /> ¡ALERTA DE LAG DETECTADA!
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black font-tech mb-4 md:mb-6 leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                ¿POR QUÉ SE
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 neon-text">
                  TILDA TU JUEGO?
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-400 mb-8 md:mb-12 max-w-xl mx-auto font-light leading-relaxed px-4">
                Descubre la ciencia detrás del <span className="text-white font-bold">Ping</span>,
                la latencia y por qué tu personaje se teletransporta solo.
              </p>

              <button
                onClick={() => setPhase('explanation')}
                className="group relative px-8 md:px-10 py-4 md:py-5 bg-blue-600 overflow-hidden rounded-none font-tech font-bold text-lg md:text-2xl uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] clip-btn"
              >
                <style>{`.clip-btn { clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%); }`}</style>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-3">
                  INICIAR_SISTEMA{' '}
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </motion.div>
          )}

          {/* PHASE 2: EXPLANATION */}
          {phase === 'explanation' && (
            <motion.div
              key="explanation"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto"
            >
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 p-32 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

                <h2 className="text-xl md:text-3xl font-black font-tech mb-4 md:mb-6 border-l-4 border-cyan-500 pl-3 md:pl-4 uppercase">
                  Protocolo de <span className="text-cyan-400">Transferencia</span>
                </h2>

                <div className="grid md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6 relative z-10">
                  {/* Step 1 */}
                  <div className="bg-slate-900/50 p-3 md:p-4 border border-slate-700 hover:border-blue-500 transition-colors group">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-900/30 rounded flex items-center justify-center text-lg md:text-xl mb-2 group-hover:scale-110 transition-transform border border-blue-500/30">
                      ⌨️
                    </div>
                    <h3 className="font-bold font-tech text-sm md:text-base text-blue-300 mb-1">
                      1. INPUT
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Presionas una tecla en tu setup. Tu PC procesa la orden en milisegundos.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-900/50 p-3 md:p-4 border border-slate-700 hover:border-yellow-500 transition-colors group">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-900/30 rounded flex items-center justify-center text-lg md:text-xl mb-2 group-hover:scale-110 transition-transform border border-yellow-500/30">
                      ⚡
                    </div>
                    <h3 className="font-bold font-tech text-sm md:text-base text-yellow-300 mb-1">
                      2. TRAVEL
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Los datos viajan por fibra óptica bajo el océano a la velocidad de la luz.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-900/50 p-3 md:p-4 border border-slate-700 hover:border-green-500 transition-colors group">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-900/30 rounded flex items-center justify-center text-lg md:text-xl mb-2 group-hover:scale-110 transition-transform border border-green-500/30">
                      🖥️
                    </div>
                    <h3 className="font-bold font-tech text-sm md:text-base text-green-300 mb-1">
                      3. SERVER
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      El servidor recibe, procesa y envía la confirmación de vuelta.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-950/30 border border-blue-500/30 p-3 md:p-4 rounded text-center mb-4 md:mb-6 relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black px-3 text-xs font-tech text-blue-400 border border-blue-500/30 uppercase">
                    Concepto Clave
                  </div>
                  <p className="text-base md:text-xl font-light">
                    El tiempo total de <strong className="text-white">IDA + VUELTA</strong> ={' '}
                    <span className="font-black text-cyan-400 text-xl md:text-2xl font-tech neon-text mx-2">
                      PING
                    </span>
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setPhase('map')}
                    className="px-6 md:px-8 py-3 md:py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-black font-tech uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] clip-btn-small text-sm md:text-base"
                  >
                    <style>{`.clip-btn-small { clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); }`}</style>
                    ABRIR MAPA HOLOGRÁFICO <Globe size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: MAP */}
          {phase === 'map' && (
            <motion.div
              key="map"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col w-full"
            >
              <MapPhase
                onComplete={(server) => {
                  setSelectedServer(server);
                  setPhase('game');
                }}
              />
            </motion.div>
          )}

          {/* PHASE 4: GAME */}
          {phase === 'game' && selectedServer && (
            <motion.div
              key="game"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col w-full"
            >
              <GamePhase
                server={selectedServer}
                onBack={() => {
                  setPhase('map');
                  setSelectedServer(null);
                }}
                onFinish={() => setPhase('distance')}
              />
            </motion.div>
          )}

          {/* PHASE 5: DISTANCE */}
          {phase === 'distance' && selectedServer && (
            <motion.div
              key="distance"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto"
            >
              <div className="bg-black/80 backdrop-blur border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>

                <h2 className="text-2xl md:text-4xl font-black font-tech mb-6 md:mb-8 flex items-center gap-4">
                  <Ruler className="text-yellow-400" size={32} />
                  <span className="uppercase">Análisis de Distancia</span>
                </h2>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                  {/* Short Distance */}
                  <div className="bg-green-950/20 p-4 md:p-6 border border-green-500/30 rounded hover:bg-green-900/20 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg md:text-xl font-bold font-tech text-green-400">
                        RUTA CORTA
                      </h3>
                      <div className="text-2xl md:text-3xl">🚀</div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full mb-4 overflow-hidden">
                      <div className="h-full bg-green-500 w-[20%]"></div>
                    </div>
                    <ul className="text-xs md:text-sm font-mono text-slate-300 space-y-3">
                      <li className="flex justify-between">
                        <span>DISTANCIA:</span> <span className="text-white">~2,000 km</span>
                      </li>
                      <li className="flex justify-between">
                        <span>LUZ (IDA):</span> <span className="text-white">6 ms</span>
                      </li>
                      <li className="flex justify-between border-t border-white/10 pt-2">
                        <span className="text-green-400 font-bold">PING TOTAL:</span>{' '}
                        <span className="text-green-400 font-bold">~40 ms</span>
                      </li>
                    </ul>
                  </div>

                  {/* Long Distance */}
                  <div className="bg-red-950/20 p-4 md:p-6 border border-red-500/30 rounded hover:bg-red-900/20 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg md:text-xl font-bold font-tech text-red-400">
                        RUTA LARGA
                      </h3>
                      <div className="text-2xl md:text-3xl">🐢</div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full mb-4 overflow-hidden">
                      <div className="h-full bg-red-500 w-[85%]"></div>
                    </div>
                    <ul className="text-xs md:text-sm font-mono text-slate-300 space-y-3">
                      <li className="flex justify-between">
                        <span>DISTANCIA:</span> <span className="text-white">~18,000 km</span>
                      </li>
                      <li className="flex justify-between">
                        <span>LUZ (IDA):</span> <span className="text-white">60 ms</span>
                      </li>
                      <li className="flex justify-between border-t border-white/10 pt-2">
                        <span className="text-red-400 font-bold">PING TOTAL:</span>{' '}
                        <span className="text-red-400 font-bold">~300 ms</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900 border-l-4 border-cyan-500 p-3 md:p-4 mb-6 md:mb-8">
                  <p className="text-xs md:text-sm text-slate-300 font-light">
                    <span className="text-cyan-400 font-bold font-mono mr-2">&gt;&gt; FACT:</span>
                    La luz viaja a <span className="text-white">300,000 km/s</span>. Es rápido, pero
                    la Tierra es inmensa. Sumale el tiempo que tardan los routers en procesar los
                    datos, y tienes LAG.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setPhase('final')}
                    className="px-8 md:px-10 py-3 md:py-4 bg-white text-black font-black font-tech text-base md:text-lg hover:bg-slate-200 transition-colors clip-btn-angle"
                  >
                    <style>{`.clip-btn-angle { clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%); }`}</style>
                    VER RESULTADOS FINALES
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 6: FINAL */}
          {phase === 'final' && (
            <motion.div
              key="final"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col justify-center max-w-5xl w-full mx-auto"
            >
              <div className="bg-black/90 border-2 border-slate-800 p-6 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                {/* Confetti effect simulated with background gradients */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <div className="text-center mb-8 md:mb-12">
                  <h2 className="text-3xl md:text-6xl font-black font-tech mb-4 tracking-tighter text-white">
                    ENTRENAMIENTO <span className="text-cyan-400">COMPLETADO</span>
                  </h2>
                  <p className="text-slate-400 text-lg md:text-xl font-light">
                    Has adquirido el conocimiento para optimizar tu conexión.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
                  {/* Summary */}
                  <div className="bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-700">
                    <h3 className="font-bold font-tech text-lg md:text-xl text-green-400 mb-4 md:mb-6 flex items-center gap-2">
                      <Cpu size={20} /> DATOS ADQUIRIDOS
                    </h3>
                    <ul className="space-y-4">
                      {[
                        'Internet son cables físicos, no magia.',
                        'Más distancia = Más Ping = Más Lag.',
                        'El Ping es el tiempo de ida y vuelta.',
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <div className="mt-1 w-5 h-5 rounded-full bg-green-900/50 border border-green-500/50 flex items-center justify-center text-green-400 text-[10px] font-bold shrink-0">
                            ✔
                          </div>
                          <span className="text-sm md:text-base text-slate-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  <div className="bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-700">
                    <h3 className="font-bold font-tech text-lg md:text-xl text-yellow-400 mb-4 md:mb-6 flex items-center gap-2">
                      <Zap size={20} /> OPTIMIZACIÓN
                    </h3>
                    <ul className="space-y-4">
                      <li className="bg-black/40 p-3 rounded border-l-2 border-yellow-500">
                        <strong className="text-white block font-mono text-xs mb-1">
                          SERVIDOR
                        </strong>
                        <span className="text-slate-400 text-xs md:text-sm">
                          Elige siempre tu región más cercana (Brasil/Sudamérica).
                        </span>
                      </li>
                      <li className="bg-black/40 p-3 rounded border-l-2 border-yellow-500">
                        <strong className="text-white block font-mono text-xs mb-1">
                          CONEXIÓN
                        </strong>
                        <span className="text-slate-400 text-xs md:text-sm">
                          Usa cable Ethernet (LAN) en lugar de WiFi siempre que puedas.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                  <button
                    onClick={() => {
                      setSelectedServer(null);
                      setPhase('intro');
                    }}
                    className="px-6 md:px-8 py-3 md:py-4 border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2 font-tech uppercase text-sm md:text-base"
                  >
                    <RotateCcw size={18} /> Reiniciar Sistema
                  </button>
                  <button
                    onClick={() => {
                      setSelectedServer(null);
                      setPhase('map');
                    }}
                    className="px-6 md:px-8 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 font-tech uppercase tracking-wider text-sm md:text-base"
                  >
                    Probar otra Región <Globe size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default LagPingSimulator;
