'use client';

import { useState } from 'react';
import { Star, Trophy, Zap, Target } from 'lucide-react';

export default function EstudiantePlanificacionesDemoPage() {
  const [puntos, setPuntos] = useState(0);
  const [nivel, setNivel] = useState(1);

  const ganarPuntos = (cantidad: number) => {
    const nuevosPuntos = puntos + cantidad;
    setPuntos(nuevosPuntos);

    // Subir de nivel cada 100 puntos
    const nuevoNivel = Math.floor(nuevosPuntos / 100) + 1;
    if (nuevoNivel > nivel) {
      setNivel(nuevoNivel);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-4 rounded-2xl">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
            ¡A Jugar!
          </h1>

          <p className="text-2xl text-pink-300 font-bold mb-2">
            Portal Estudiante - Planificaciones
          </p>

          <p className="text-slate-400 text-lg">
            🎮 Aprendé mientras te divertís
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl p-8 text-center">
            <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <div className="text-5xl font-black text-yellow-400 mb-2">
              {puntos}
            </div>
            <p className="text-slate-400 text-lg font-bold">Puntos Totales</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-8 text-center">
            <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <div className="text-5xl font-black text-purple-400 mb-2">
              {nivel}
            </div>
            <p className="text-slate-400 text-lg font-bold">Nivel Actual</p>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-pink-500/50 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-bold text-lg">Progreso al Nivel {nivel + 1}</span>
            <span className="text-pink-400 font-bold">{puntos % 100}/100</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(puntos % 100)}%` }}
            />
          </div>
        </div>

        {/* Botones de Actividades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => ganarPuntos(10)}
            className="group bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-2 border-blue-500/50 rounded-2xl p-8 text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
          >
            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">Quiz Rápido</h3>
            <p className="text-slate-400 mb-4">Respondé preguntas</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg">
              <Star className="w-5 h-5 text-white" />
              <span className="text-white font-bold">+10 puntos</span>
            </div>
          </button>

          <button
            onClick={() => ganarPuntos(25)}
            className="group bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-2 border-green-500/50 rounded-2xl p-8 text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/50"
          >
            <Trophy className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">Ejercicios</h3>
            <p className="text-slate-400 mb-4">Completá desafíos</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg">
              <Star className="w-5 h-5 text-white" />
              <span className="text-white font-bold">+25 puntos</span>
            </div>
          </button>

          <button
            onClick={() => ganarPuntos(50)}
            className="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-2 border-purple-500/50 rounded-2xl p-8 text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
          >
            <Target className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">Proyecto</h3>
            <p className="text-slate-400 mb-4">Creá algo increíble</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 rounded-lg">
              <Star className="w-5 h-5 text-white" />
              <span className="text-white font-bold">+50 puntos</span>
            </div>
          </button>

          <button
            onClick={() => {
              setPuntos(0);
              setNivel(1);
            }}
            className="bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 rounded-2xl p-8 text-center transition-all"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Reiniciar</h3>
            <p className="text-slate-400">Empezar de nuevo</p>
          </button>
        </div>

        {/* Logros */}
        {nivel >= 2 && (
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-6 text-center animate-bounce">
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">
              🎉 ¡Nuevo Logro Desbloqueado! 🎉
            </h3>
            <p className="text-white">
              Alcanzaste el Nivel {nivel}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>📍 Ubicación: <code className="text-pink-400">/estudiante/planificaciones/demo</code></p>
          <p className="mt-2">🔧 Archivo: <code className="text-pink-400">apps/web/src/app/estudiante/planificaciones/demo/page.tsx</code></p>
        </div>
      </div>
    </div>
  );
}
