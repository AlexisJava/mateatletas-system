'use client';

import { useState } from 'react';
import { Rocket, Sparkles, Zap, Calendar, AlertCircle } from 'lucide-react';

/**
 * 🚀 DEMO ADMIN - HOT RELOAD TEST
 *
 * Esta página es PÚBLICA (sin login) para testear hot reload.
 * Cambía cualquier texto, color o componente y verás los cambios
 * instantáneamente en el navegador sin refrescar manualmente.
 *
 * Prueba cambiar:
 * - El texto "¡Hola Mundo!" por otra cosa
 * - Los colores de los gradientes
 * - El emoji del botón
 */

export default function AdminPlanificacionesDemoPage() {
  const [clicks, setClicks] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <Rocket className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-6xl font-black mb-2 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                ¡Hola Mundo!
              </h1>
              <p className="text-purple-300 text-lg font-medium">Portal Admin - Planificaciones DEMO</p>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-blue-500/10 border-2 border-blue-400/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-blue-300 font-bold text-lg mb-2">Modo Hot Reload Activo</h3>
                <p className="text-blue-200/80 text-sm leading-relaxed">
                  Abrí este archivo en VSCode: <code className="bg-blue-900/50 px-2 py-0.5 rounded text-blue-300">apps/web/src/app/demo-planificaciones/admin/page.tsx</code>
                  <br />
                  Cambiá el texto "¡Hola Mundo!" y guardá (Ctrl+S). Verás el cambio acá instantáneamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Counter */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 mb-8 text-center">
          <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Contador Interactivo</h2>
          <div className="text-8xl font-black text-purple-400 mb-8 tabular-nums">
            {clicks}
          </div>
          <button
            onClick={() => setClicks(clicks + 1)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold text-lg shadow-2xl shadow-purple-500/50 transition-all hover:scale-105"
          >
            ¡Hacé Click Acá! 🚀
          </button>
          <button
            onClick={() => setClicks(0)}
            className="ml-4 px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold text-lg transition-colors"
          >
            Resetear
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <Zap className="w-10 h-10 text-yellow-400 mb-4" strokeWidth={2.5} />
            <h3 className="text-white font-black text-xl mb-2">Hot Reload</h3>
            <p className="text-purple-200 text-sm">
              Los cambios se reflejan instantáneamente sin refrescar el navegador. Probalo cambiando cualquier texto.
            </p>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <Calendar className="w-10 h-10 text-blue-400 mb-4" strokeWidth={2.5} />
            <h3 className="text-white font-black text-xl mb-2">Planificaciones</h3>
            <p className="text-blue-200 text-sm">
              Sistema de planificaciones mensuales para el "Mes de Matemática Aplicada" con 4 semanas temáticas.
            </p>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
            <Sparkles className="w-10 h-10 text-emerald-400 mb-4" strokeWidth={2.5} />
            <h3 className="text-white font-black text-xl mb-2">MVP Ready</h3>
            <p className="text-emerald-200 text-sm">
              Comenzando con Semana 1 (Química) y luego expandiendo a las otras 3 semanas de forma escalonada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
