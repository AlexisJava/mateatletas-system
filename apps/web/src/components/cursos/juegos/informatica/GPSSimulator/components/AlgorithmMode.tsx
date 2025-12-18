import React, { useState, useEffect, useRef } from 'react';
import { Grafo, SimulationTimeline } from '../types';
import { calculateFlows } from '../services/dijkstra';
import GraphCanvas from './GraphCanvas';

interface AlgorithmModeProps {
  grafo: Grafo;
  onComplete: (cost: number, path: string[]) => void;
}

const AlgorithmMode: React.FC<AlgorithmModeProps> = ({ grafo, onComplete }) => {
  const [simulation, setSimulation] = useState<SimulationTimeline | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const reqRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // 1. Initialize Simulation (Pre-calculate everything)
  useEffect(() => {
    const simData = calculateFlows(grafo);
    setSimulation(simData);
    setCurrentTime(0);
    setIsPlaying(true);
    // Adjust speed based on map size.
    // Small maps = slow speed to see it.
    // Big maps = faster relative speed?
    // Let's stick to 1 unit of cost per second approx by default, times multiplier
    setPlaybackSpeed(1.5);
  }, [grafo]);

  // 2. Animation Loop
  useEffect(() => {
    if (!isPlaying || !simulation) {
      cancelAnimationFrame(reqRef.current);
      lastTimeRef.current = 0;
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timestamp;

      // Update Time
      // Playback speed: 1.0 means 10 simulation units per second?
      // Let's say speed 1 = 5 cost units / sec
      const deltaSim = deltaTime * 10 * playbackSpeed;

      setCurrentTime((prev) => {
        const next = prev + deltaSim;
        if (next >= simulation.maxTime) {
          setIsPlaying(false);
          return simulation.maxTime;
        }
        return next;
      });

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, simulation, playbackSpeed]);

  if (!simulation)
    return <div className="text-white text-center p-10">Calculando física de flujo...</div>;

  // Derive stats
  const finished = currentTime >= simulation.maxTime;
  const progressPercent = Math.min(100, (currentTime / simulation.maxTime) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 animate-fade-in overflow-y-auto flex-1 flex flex-col min-h-0">
      {/* Top HUD */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-2 p-3 glass-panel rounded-xl border-b-2 border-cyan-500 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            VISUALIZADOR DE ALGORITMO
          </h2>
          <p className="text-slate-400 font-mono text-sm">SIMULACIÓN DE FLUJO HIDRÁULICO v2.0</p>
        </div>
        <div className="text-right font-mono">
          <div className="text-xs text-slate-500 uppercase">TIEMPO TRANSCURRIDO</div>
          <div className="text-4xl text-cyan-400 font-bold leading-none">
            {currentTime.toFixed(1)}
            <span className="text-lg text-slate-600">s</span>
          </div>
        </div>
      </div>

      {/* Main Visualizer */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <GraphCanvas
          grafo={grafo}
          simulation={simulation}
          currentTime={currentTime}
          width={800}
          height={400}
        />
      </div>

      {/* Control Deck */}
      <div className="glass-panel p-3 md:p-4 rounded-xl border border-slate-800 bg-slate-900/80 shrink-0">
        {/* Timeline Slider */}
        <div className="mb-6 relative group">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <input
            type="range"
            min="0"
            max={simulation.maxTime}
            step="0.1"
            value={currentTime}
            onChange={(e) => {
              setCurrentTime(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            className="relative w-full h-8 opacity-0 cursor-pointer z-10"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Transport Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (currentTime >= simulation.maxTime) setCurrentTime(0);
                setIsPlaying(!isPlaying);
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition-all ${isPlaying ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 animate-pulse' : 'bg-cyan-600 text-white hover:bg-cyan-500'}`}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              ⏮ Reiniciar
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-bold uppercase pl-2">Velocidad</span>
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-3 py-1 text-xs font-bold rounded ${playbackSpeed === s ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Result Action */}
          <div className="ml-auto">
            {finished ? (
              <button
                onClick={() =>
                  onComplete(
                    simulation.nodes.get(grafo.nodos.find((n) => n.esDestino)!.id)?.discoveryTime ||
                      0,
                    simulation.optimalPath,
                  )
                }
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(192,38,211,0.5)] animate-pulse"
              >
                VER RESULTADOS ➔
              </button>
            ) : (
              <div className="text-sm text-slate-500 font-mono flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                CALCULANDO RUTA ÓPTIMA...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmMode;
