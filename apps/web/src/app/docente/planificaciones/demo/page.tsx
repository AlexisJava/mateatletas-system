'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

export default function DocentePlanificacionesDemoPage() {
  const [mensaje, setMensaje] = useState('¡Esperando tu input!');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-2xl">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
            Portal Docente
          </h1>

          <p className="text-2xl text-blue-300 font-bold mb-2">
            Gestión de Planificaciones
          </p>

          <p className="text-slate-400 text-lg">
            👨‍🏫 Dashboard en tiempo real
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl p-6">
            <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
            <div className="text-3xl font-black text-white mb-1">4</div>
            <p className="text-slate-400 text-sm">Planificaciones Activas</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-2 border-green-500/30 rounded-2xl p-6">
            <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
            <div className="text-3xl font-black text-white mb-1">28</div>
            <p className="text-slate-400 text-sm">Estudiantes Activos</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6">
            <Clock className="w-8 h-8 text-purple-400 mb-3" />
            <div className="text-3xl font-black text-white mb-1">85%</div>
            <p className="text-slate-400 text-sm">Tasa de Completitud</p>
          </div>
        </div>

        {/* Interactive Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Mensaje del Día
          </h2>

          <div className="bg-slate-700/50 rounded-xl p-6 mb-6 min-h-[100px] flex items-center justify-center">
            <p className="text-2xl font-bold text-blue-300 text-center">
              {mensaje}
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setMensaje('¡Excelente trabajo! 🎉')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white font-bold transition-all"
            >
              Mensaje Positivo
            </button>

            <button
              onClick={() => setMensaje('Seguí así, vas muy bien 💪')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg text-white font-bold transition-all"
            >
              Motivación
            </button>

            <button
              onClick={() => setMensaje('¡El conocimiento es poder! 📚')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-bold transition-all"
            >
              Inspiración
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>📍 Ubicación: <code className="text-blue-400">/docente/planificaciones/demo</code></p>
          <p className="mt-2">🔧 Archivo: <code className="text-blue-400">apps/web/src/app/docente/planificaciones/demo/page.tsx</code></p>
        </div>
      </div>
    </div>
  );
}
