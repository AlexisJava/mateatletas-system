'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import StartScreen from './components/StartScreen';
import ManualMode from './components/ManualMode';
import AlgorithmMode from './components/AlgorithmMode';
import ComparisonScreen from './components/ComparisonScreen';
import { MAPA_FACIL, MAPA_COMPLEJO } from './constants';
import { AppPhase, Grafo } from './types';

interface GPSSimulatorProps {
  onCompleted?: () => void;
  onExit?: () => void;
}

const GPSSimulator: React.FC<GPSSimulatorProps> = ({ onCompleted, onExit }) => {
  const [phase, setPhase] = useState<AppPhase>('START');
  const [activeMap, setActiveMap] = useState<Grafo>(MAPA_FACIL);
  const [userResult, setUserResult] = useState<{ path: string[]; cost: number } | null>(null);
  const [algoResult, setAlgoResult] = useState<{ path: string[]; cost: number } | null>(null);

  const startSimulation = () => {
    setActiveMap(MAPA_FACIL);
    setPhase('MANUAL');
  };

  const startCityMode = () => {
    setActiveMap(MAPA_COMPLEJO);
    setPhase('ALGORITHM');
    setUserResult(null);
    setAlgoResult(null);
  };

  const handleManualComplete = (path: string[], cost: number) => {
    setUserResult({ path, cost });
    setPhase('ALGORITHM');
  };

  const handleAlgorithmComplete = (cost: number, path: string[]) => {
    setAlgoResult({ path, cost });
    setPhase('COMPARISON');
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <div className="max-h-[85vh] bg-black text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Exit Button */}
      {onExit && (
        <button
          onClick={handleExit}
          className="absolute top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all shadow-lg"
          title="Salir"
        >
          <X size={24} />
        </button>
      )}

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPhase('START')}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-black">
              G
            </div>
            <span className="font-bold tracking-wider">
              GPS<span className="text-cyan-400">SIM</span>
            </span>
          </div>

          <div className="flex gap-4 text-xs font-mono text-slate-400">
            <span className={phase === 'MANUAL' ? 'text-pink-400 animate-pulse' : ''}>
              01_MANUAL
            </span>
            <span>{'//'}</span>
            <span className={phase === 'ALGORITHM' ? 'text-cyan-400 animate-pulse' : ''}>
              02_ALGORITHM
            </span>
            <span>{'//'}</span>
            <span className={phase === 'COMPARISON' ? 'text-green-400 animate-pulse' : ''}>
              03_RESULT
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col p-2 md:p-4 relative overflow-y-auto min-h-0">
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 w-full flex-1 flex flex-col items-center min-h-0">
          {phase === 'START' && <StartScreen onStart={startSimulation} />}

          {phase === 'MANUAL' && <ManualMode grafo={activeMap} onComplete={handleManualComplete} />}

          {phase === 'ALGORITHM' && (
            <AlgorithmMode grafo={activeMap} onComplete={handleAlgorithmComplete} />
          )}

          {phase === 'COMPARISON' && userResult && algoResult && (
            <ComparisonScreen
              userCost={userResult.cost}
              algoCost={algoResult.cost}
              userPath={userResult.path}
              algoPath={algoResult.path}
              onRestart={() => {
                setUserResult(null);
                setPhase('MANUAL');
              }}
              onChangeMap={startCityMode}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default GPSSimulator;
