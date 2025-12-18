'use client';

import { getDecisionCounts } from '@/lib/utils/profile-calculator';
import { decisionProfiles } from '@/data/juegos/matematicas/situations-library';

interface Decision {
  type: 'comprar' | 'usar' | 'compartir';
}

interface ProfileResultsProps {
  profileType: string;
  decisions: Decision[];
  onRestart: () => void;
  onReturn: () => void;
}

export default function ProfileResults({
  profileType,
  decisions,
  onRestart,
  onReturn,
}: ProfileResultsProps) {
  const profile = decisionProfiles[profileType];
  const counts = getDecisionCounts(decisions);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">¡Análisis Completo!</h1>
          <div className="text-6xl mb-4">{profile.icon}</div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6 border border-white/20 shadow-2xl animate-fadeIn">
          <h2 className="text-3xl font-bold text-white mb-3">{profile.title}</h2>
          <p className="text-xl text-white/90 mb-6">{profile.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{counts.comprar}</div>
              <div className="text-sm text-white/80">💰 Comprar</div>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/40 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{counts.usar}</div>
              <div className="text-sm text-white/80">🔧 Usar</div>
            </div>
            <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{counts.compartir}</div>
              <div className="text-sm text-white/80">🤝 Compartir</div>
            </div>
          </div>

          {/* Lambda Feedback */}
          <div className="bg-indigo-500/20 border border-indigo-400/40 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">🤖</div>
              <div>
                <div className="font-bold text-white mb-2">Lambda dice:</div>
                <p className="text-white/90">{profile.lambda_message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 animate-fadeIn">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          >
            🔄 Intentar de nuevo
          </button>
          <button
            onClick={onReturn}
            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 px-6 rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95 border border-white/20 shadow-lg"
          >
            ← Volver a Distrito Valor
          </button>
        </div>
      </div>
    </div>
  );
}
