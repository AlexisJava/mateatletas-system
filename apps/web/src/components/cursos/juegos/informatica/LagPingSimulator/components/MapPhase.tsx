import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server } from '../types';
import { SERVERS, USER_LOCATION, getPingColorClass, getPingBorderClass } from '../constants';
import { Globe, ArrowRight, Radio, Scan } from 'lucide-react';

interface MapPhaseProps {
  onComplete: (selectedServer: Server) => void;
}

const MapPhase: React.FC<MapPhaseProps> = ({ onComplete }) => {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<0 | 1 | 2 | 3>(0);

  const handleServerClick = (server: Server) => {
    if (isAnimating) return;
    setSelectedServer(server);
    startSimulation(server);
  };

  const startSimulation = (server: Server) => {
    setIsAnimating(true);
    setSimulationStep(1);

    const oneWayDuration = 400 + server.ping * 4;

    setTimeout(() => {
      setSimulationStep(2);
      setTimeout(() => {
        setSimulationStep(3);
        setTimeout(() => {
          setSimulationStep(0);
          setIsAnimating(false);
        }, oneWayDuration);
      }, 800);
    }, oneWayDuration);
  };

  const worldMapPath =
    'M152.3,139.6 c-2.9-1.3-8.8,1.4-10.9,4.2 c-2.3,3-0.8,6.8,1.3,9.7 c1.6,2.2,6,3.6,8.7,2.2 C154.5,154.2,156,141.3,152.3,139.6 z M228.6,80.1 c-5.6,3.4-6.3,11.5-1.9,16.8 c3.6,4.3,10.6,4.6,15.1,1.1 C248,93.2,236.4,75.3,228.6,80.1 z M634.3,281.4 c-4.6,3.6-2.5,11.6,2.6,13.8 c4.2,1.8,9.7-1,10.7-5.5 C649.3,282.4,640.7,276.4,634.3,281.4 z M525.6,88.4 c-4.5,5.1,0.2,13.8,6.8,14.6 c5.4,0.6,9.8-4.8,7.9-9.9 C538.5,88.4,531.1,82.2,525.6,88.4 z M71.9,89.5 c-13.8,9.7-12.6,33.1,1.1,40.1 c13.2,6.7,29.9-4.8,29.9-19.9 C102.9,94.9,86.6,79.2,71.9,89.5 z M147.3,250.7 c-8.5,8.1-5.9,23.5,4.7,27.9 c9.7,4.1,21.5-2.6,21.5-13.2 C173.5,254.9,160.2,238.4,147.3,250.7 z M457.6,135.5 c-13.2,5.3-15.6,24.3-4.6,33.5 c10.3,8.6,27.1,3.4,29.4-9.8 C484.8,144.3,472.2,129.6,457.6,135.5 z M329.8,210.4 c-10.1,9.4-5.6,27.2,7.4,30.5 c12.1,3.1,23.5-7.3,19.6-19.1 C353.6,212.3,341,200,329.8,210.4 z M590.8,137.6 c-15.9,8.5-17.1,32.4-1.9,42.4 c14.2,9.3,34.4-0.6,35.5-17.5 C625.5,145.4,609.4,127.6,590.8,137.6 z';

  return (
    <div className="flex flex-col items-center w-full h-full max-w-7xl mx-auto">
      {/* HUD Header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 mb-3 shrink-0">
        <h2 className="text-xl md:text-2xl font-black italic font-tech flex items-center gap-2 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 neon-text">
          <Globe className="text-cyan-400" size={24} />
          SELECCIÓN DE SERVIDOR
        </h2>

        <div className="bg-black/40 backdrop-blur border border-cyan-500/30 rounded-none px-4 py-1.5 flex items-center gap-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyan-500/10 -skew-x-12 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          <span className="text-cyan-400 text-xs font-mono tracking-widest uppercase">
            Tu ubicación:
          </span>
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-lg">🇦🇷</span>
            <span className="font-bold font-tech text-white text-sm">ARGENTINA</span>
          </div>
        </div>
      </div>

      {/* Holographic Map Container - Ahora usa flex-1 para llenar espacio */}
      <div className="relative w-full flex-1 bg-[#02040a] rounded-xl border-2 border-slate-800 overflow-hidden shadow-[0_0_50px_rgba(0,100,255,0.1)] mb-3 group select-none ring-1 ring-cyan-500/20 min-h-0">
        {/* Animated Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[10%] w-full animate-[scan_4s_linear_infinite] pointer-events-none z-0"></div>
        <style>{`@keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }`}</style>

        {/* SVG World Map - Hologram Style */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <svg viewBox="0 0 700 350" className="w-full h-full">
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <path d={worldMapPath} fill="none" stroke="#1e293b" strokeWidth="2" />
            <path
              d={worldMapPath}
              fill="rgba(6, 182, 212, 0.05)"
              stroke="rgba(6, 182, 212, 0.4)"
              strokeWidth="1"
              filter="url(#glow)"
            />
          </svg>
        </div>

        {/* Tech Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

        {/* --- CONNECTIONS LAYER --- */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dotted Line */}
          {selectedServer && (
            <line
              x1={`${USER_LOCATION.x}%`}
              y1={`${USER_LOCATION.y}%`}
              x2={`${selectedServer.x}%`}
              y2={`${selectedServer.y}%`}
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* LASER BEAMS */}
          <AnimatePresence>
            {isAnimating && selectedServer && simulationStep === 1 && (
              <motion.line
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: (400 + selectedServer.ping * 4) / 1000, ease: 'linear' }}
                x1={`${USER_LOCATION.x}%`}
                y1={`${USER_LOCATION.y}%`}
                x2={`${selectedServer.x}%`}
                y2={`${selectedServer.y}%`}
                stroke="#00f260"
                strokeWidth="3"
                strokeLinecap="square"
                filter="url(#neon-glow)"
              />
            )}
            {isAnimating && selectedServer && simulationStep === 3 && (
              <motion.line
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: (400 + selectedServer.ping * 4) / 1000, ease: 'linear' }}
                x2={`${USER_LOCATION.x}%`}
                y2={`${USER_LOCATION.y}%`}
                x1={`${selectedServer.x}%`}
                y1={`${selectedServer.y}%`}
                stroke="#00d2ff"
                strokeWidth="3"
                strokeLinecap="square"
                filter="url(#neon-glow)"
              />
            )}
          </AnimatePresence>
        </svg>

        {/* --- USER BASE --- */}
        <div
          className="absolute z-30"
          style={{
            left: `${USER_LOCATION.x}%`,
            top: `${USER_LOCATION.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative flex flex-col items-center group">
            {/* Base */}
            <div className="w-16 h-4 bg-blue-500/20 rounded-[100%] absolute top-8 blur-md"></div>

            {/* House Icon */}
            <div className="w-12 h-12 bg-black border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center z-20 relative clip-octagon">
              <style>{`.clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }`}</style>
              <span className="text-2xl pt-1">🏠</span>
            </div>

            {/* Ping Pulse */}
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>

            <div className="absolute top-14 bg-black/80 px-3 py-1 border border-blue-500/50 text-[10px] font-tech tracking-widest text-blue-300 whitespace-nowrap z-30 shadow-[0_0_10px_rgba(0,0,0,1)]">
              BASE_JUGADOR
            </div>
          </div>
        </div>

        {/* --- SERVER NODES --- */}
        {SERVERS.map((server) => {
          const isSelected = selectedServer?.id === server.id;

          return (
            <div
              key={server.id}
              className="absolute z-20"
              style={{
                left: `${server.x}%`,
                top: `${server.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.button
                className="relative flex flex-col items-center group focus:outline-none"
                onClick={() => handleServerClick(server)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  opacity: selectedServer && !isSelected ? 0.3 : 1,
                  scale: isSelected ? 1.15 : 1,
                }}
              >
                {/* Server Hexagon */}
                <div
                  className={`
                            w-14 h-14 flex items-center justify-center transition-all duration-300 relative clip-hex
                            ${
                              isSelected
                                ? 'bg-black border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] z-40'
                                : 'bg-slate-900/80 border border-slate-600 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                            }
                        `}
                >
                  <style>{`.clip-hex { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }`}</style>

                  {isSelected && simulationStep === 2 && (
                    <div className="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>
                  )}

                  <span className="text-3xl relative z-10">{server.emoji}</span>

                  {/* Status Light */}
                  <div
                    className={`absolute top-1 right-3 w-2 h-2 rounded-full ${getPingColorClass(server.ping).replace('text-', 'bg-').split(' ')[0]} shadow-[0_0_5px_currentColor]`}
                  ></div>
                </div>

                {/* Label Tag */}
                <div
                  className={`
                            mt-2 px-2 py-1 bg-black/90 border border-slate-700 text-center min-w-[90px] backdrop-blur-sm
                            transition-all duration-300
                            ${isSelected ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''}
                        `}
                >
                  <div className="text-[10px] text-cyan-200 font-tech uppercase tracking-wider">
                    {server.nombre}
                  </div>
                  <div className={`font-mono font-bold text-xs ${getPingColorClass(server.ping)}`}>
                    {server.ping}ms
                  </div>
                </div>
              </motion.button>
            </div>
          );
        })}

        {/* --- TRAVELLING DATA PACKET --- */}
        <AnimatePresence>
          {isAnimating && selectedServer && simulationStep !== 0 && simulationStep !== 2 && (
            <motion.div
              className="absolute z-50 pointer-events-none"
              initial={{
                left: simulationStep === 1 ? `${USER_LOCATION.x}%` : `${selectedServer.x}%`,
                top: simulationStep === 1 ? `${USER_LOCATION.y}%` : `${selectedServer.y}%`,
              }}
              animate={{
                left: simulationStep === 1 ? `${selectedServer.x}%` : `${USER_LOCATION.x}%`,
                top: simulationStep === 1 ? `${selectedServer.y}%` : `${USER_LOCATION.y}%`,
              }}
              transition={{
                duration: (400 + selectedServer.ping * 4) / 1000,
                ease: 'linear',
              }}
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              {/* Glowing Energy Ball */}
              <div
                className={`relative w-4 h-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]
                         ${simulationStep === 1 ? 'bg-[#00f260]' : 'bg-[#00d2ff]'}
                    `}
              >
                <div
                  className={`absolute inset-0 rounded-full animate-ping ${simulationStep === 1 ? 'bg-green-400' : 'bg-blue-400'}`}
                ></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel / Dashboard - Compactado */}
      <div className="w-full grid md:grid-cols-[1fr_auto] gap-2 shrink-0">
        {/* Server Data Panel */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500"></div>

          {selectedServer ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Radio
                    size={14}
                    className={`animate-pulse ${simulationStep !== 0 ? 'text-green-400' : 'text-slate-500'}`}
                  />
                  <span className="text-[10px] font-tech text-cyan-500 tracking-[0.2em]">
                    ESTADO_CONEXION
                  </span>
                </div>
                <div className="text-sm md:text-base text-white font-bold mb-0.5 flex items-center gap-2">
                  {simulationStep === 0 && (
                    <span className="font-tech">
                      CONECTADO A{' '}
                      <span className="text-cyan-300">{selectedServer.nombre.toUpperCase()}</span>
                    </span>
                  )}
                  {simulationStep === 1 && (
                    <span className="text-[#00f260] font-bold flex items-center gap-2">
                      ENVIANDO PAQUETE...
                    </span>
                  )}
                  {simulationStep === 2 && (
                    <span className="text-yellow-400 font-bold flex items-center gap-2">
                      PROCESANDO DATOS...
                    </span>
                  )}
                  {simulationStep === 3 && (
                    <span className="text-[#00d2ff] font-bold flex items-center gap-2">
                      RECIBIENDO RESPUESTA...
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono hidden sm:block">
                  {' '}
                  {'//'} {selectedServer.descripcion}
                </p>
              </div>

              <div
                className={`px-3 py-1 bg-black border ${getPingBorderClass(selectedServer.ping)} shadow-[0_0_15px_rgba(0,0,0,0.5)] min-w-[100px] text-center`}
              >
                <div className="text-[9px] text-slate-500 font-tech uppercase mb-0.5">
                  LATENCIA (PING)
                </div>
                <div
                  className={`text-2xl font-black font-tech ${getPingColorClass(selectedServer.ping)}`}
                >
                  {isAnimating ? (
                    <span className="animate-pulse">---</span>
                  ) : (
                    `${selectedServer.ping}ms`
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-1 text-slate-500 gap-1">
              <Scan className="animate-pulse text-cyan-800" size={20} />
              <span className="font-tech uppercase tracking-widest text-[10px]">
                Selecciona un objetivo en el mapa
              </span>
            </div>
          )}
        </div>

        {/* Action Button - Más compacto */}
        <button
          disabled={!selectedServer || isAnimating}
          onClick={() => selectedServer && onComplete(selectedServer)}
          className={`
                relative overflow-hidden group px-4 py-2 min-h-[50px] w-full md:w-auto font-tech font-bold text-xs uppercase tracking-wider transition-all duration-300
                ${
                  !selectedServer || isAnimating
                    ? 'bg-slate-900 border border-slate-800 text-slate-700 cursor-not-allowed grayscale'
                    : 'bg-blue-600 hover:bg-cyan-600 text-white border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                }
            `}
        >
          {/* Hover Glitch Effect Overlay */}
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>

          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <span>INICIAR PRUEBA</span>
            <span className="text-[9px] opacity-70 font-mono">DE LAG</span>
            <ArrowRight
              size={14}
              className={
                !selectedServer || isAnimating
                  ? ''
                  : 'group-hover:translate-x-2 transition-transform'
              }
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default MapPhase;
