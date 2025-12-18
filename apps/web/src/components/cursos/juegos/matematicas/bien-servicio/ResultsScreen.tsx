import Link from 'next/link';
import { getScoringMessage } from '@/lib/utils/game-helpers';

interface ResultsScreenProps {
  score: number;
  total: number;
  onRestart: () => void;
  showBackButton: boolean;
}

export default function ResultsScreen({
  score,
  total,
  onRestart,
  showBackButton,
}: ResultsScreenProps) {
  const percentage = Math.round((score / total) * 100);
  const message = getScoringMessage(score, total);

  const getScoreColor = () => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 70) return 'text-blue-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">¡Juego Completado!</h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-6xl">🎉</div>
          <div className={`text-6xl md:text-7xl font-bold ${getScoreColor()}`}>
            {score}/{total}
          </div>
          <div className="text-6xl">🎉</div>
        </div>
        <p className="text-2xl text-slate-300 mb-2">Acertaste {percentage}% de las preguntas</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border-2 border-slate-700">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl">
              🤖
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-indigo-400 mb-2">Lambda</div>
            <p className="text-lg md:text-xl text-slate-200 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onRestart}
          className="w-full px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
        >
          🔄 Jugar de nuevo
        </button>

        {showBackButton && (
          <Link
            href="/matematicas/semana-1"
            className="block w-full px-8 py-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-lg text-center transition-all duration-300"
          >
            ← Volver a Semana 1
          </Link>
        )}
      </div>
    </div>
  );
}
