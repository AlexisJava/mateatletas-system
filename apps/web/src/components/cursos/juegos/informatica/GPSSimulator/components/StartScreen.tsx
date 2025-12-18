import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 p-6 md:p-10 glass-panel rounded-3xl text-white shadow-2xl max-w-2xl mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative">
        <div className="text-6xl md:text-7xl animate-bounce mb-3 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
          🗺️
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 neon-text leading-tight">
          GPS: Encontrá el Camino
        </h1>
      </div>

      <div className="space-y-4 text-base md:text-lg text-slate-300 max-w-xl">
        <p>¿Cómo sabe Google Maps el atajo perfecto entre millones de calles?</p>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
          <p className="mb-4">
            🧠 La computadora <strong className="text-red-400">NO ADIVINA</strong>.
          </p>
          <p>
            Usa un <strong className="text-cyan-400">Algoritmo Maestro</strong> que explora el mundo
            como una ola de agua.
          </p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-2xl font-bold rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] transform transition-all hover:scale-105 active:scale-95 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-3">¡Iniciar Simulación! 🚀</span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
      </button>
    </div>
  );
};

export default StartScreen;
