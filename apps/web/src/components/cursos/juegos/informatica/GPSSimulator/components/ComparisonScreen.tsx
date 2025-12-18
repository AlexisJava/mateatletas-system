import React from 'react';

interface ComparisonScreenProps {
  userCost: number;
  algoCost: number;
  userPath: string[];
  algoPath: string[];
  onRestart: () => void;
  onChangeMap: () => void;
}

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({
  userCost,
  algoCost,
  onRestart,
  onChangeMap,
}) => {
  const difference = userCost - algoCost;
  const isOptimal = difference === 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in text-white overflow-y-auto flex-1 min-h-0">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 pb-2">
          🏆 Resultado Final
        </h2>
        <p className="text-slate-400 text-xl">Humano vs Máquina</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Card */}
        <div className="glass-panel rounded-3xl p-8 text-center transform transition hover:scale-105 relative overflow-hidden group">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-pink-500 to-transparent"></div>
          <div className="text-6xl mb-4 group-hover:animate-bounce">👤</div>
          <h3 className="text-pink-400 font-bold uppercase tracking-wider mb-2">Tu Estrategia</h3>
          <div className="text-6xl font-black text-white">
            {userCost} <span className="text-2xl text-slate-500">km</span>
          </div>
        </div>

        {/* Algo Card */}
        <div className="glass-panel rounded-3xl p-8 text-center transform transition hover:scale-105 relative overflow-hidden group">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
          <div className="text-6xl mb-4 group-hover:animate-spin-slow">🤖</div>
          <h3 className="text-cyan-400 font-bold uppercase tracking-wider mb-2">Dijkstra (IA)</h3>
          <div className="text-6xl font-black text-white">
            {algoCost} <span className="text-2xl text-slate-500">km</span>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div
        className={`p-8 rounded-2xl border border-white/10 shadow-2xl ${isOptimal ? 'bg-gradient-to-r from-green-900/50 to-green-800/30' : 'bg-gradient-to-r from-amber-900/50 to-amber-800/30'}`}
      >
        {isOptimal ? (
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <span className="text-6xl animate-pulse">🥇</span>
            <div>
              <h3 className="text-3xl font-bold text-green-400 mb-2">¡EMPATE PERFECTO!</h3>
              <p className="text-lg text-slate-200">
                Encontraste el camino matemáticamente óptimo. ¡Tu cerebro funciona como una
                supercomputadora!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <span className="text-6xl">🚀</span>
            <div>
              <h3 className="text-3xl font-bold text-amber-400 mb-2">
                El algoritmo ahorró {difference} km
              </h3>
              <p className="text-lg text-slate-200">
                La computadora explora cientos de caminos por segundo para asegurar el mínimo
                absoluto. ¡Por eso usamos GPS!
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-full transition border border-slate-600"
        >
          🔄 Reintentar
        </button>
        <button
          onClick={onChangeMap}
          className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-full shadow-lg transition transform hover:-translate-y-1"
        >
          🌍 Siguiente Nivel / Mapa
        </button>
      </div>
    </div>
  );
};

export default ComparisonScreen;
