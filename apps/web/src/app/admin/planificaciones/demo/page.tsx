'use client';

import { useState } from 'react';
import { Rocket, Sparkles, Zap } from 'lucide-react';

export default function AdminPlanificacionesDemoPage() {
  const [clicks, setClicks] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl">
                <Rocket className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            ¡Hola Mundo!
          </h1>

          <p className="text-2xl text-purple-300 font-bold mb-2">Portal Admin - Planificaciones</p>

          <p className="text-slate-400 text-lg">
            🔥 Hot Reload Activado - Los cambios se ven en tiempo real
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all">
            <Sparkles className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Edita el código</h3>
            <p className="text-slate-400 text-sm">
              Cambia cualquier texto en este archivo y verás el resultado instantáneamente
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-2 border-pink-500/30 rounded-2xl p-6 hover:border-pink-400/50 transition-all">
            <Zap className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Sin refrescar</h3>
            <p className="text-slate-400 text-sm">
              No necesitás refrescar el navegador, los cambios aparecen solos
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition-all">
            <Rocket className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Desarrollo rápido</h3>
            <p className="text-slate-400 text-sm">
              Iteración súper rápida: código → guardar → ver resultado
            </p>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/50 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Demo Interactiva</h2>

          <div className="mb-6">
            <div className="text-6xl font-black text-purple-400 mb-2">{clicks}</div>
            <p className="text-slate-400">Clicks registrados</p>
          </div>

          <button
            onClick={() => setClicks(clicks + 1)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all transform hover:scale-105"
          >
            ¡Hacé Click Acá! 🚀
          </button>

          <button
            onClick={() => setClicks(0)}
            className="ml-4 px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold text-lg transition-all"
          >
            Reset
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>
            📍 Ubicación: <code className="text-purple-400">/admin/planificaciones/demo</code>
          </p>
          <p className="mt-2">
            🔧 Archivo:{' '}
            <code className="text-purple-400">
              apps/web/src/app/admin/planificaciones/demo/page.tsx
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
