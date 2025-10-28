'use client';

import { useState } from 'react';
import { BookOpen, Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

/**
 * 📚 DEMO DOCENTE - HOT RELOAD TEST
 *
 * Esta página es PÚBLICA (sin login) para testear hot reload.
 * Cambiá cualquier texto, color o componente y verás los cambios
 * instantáneamente en el navegador sin refrescar manualmente.
 *
 * Prueba cambiar:
 * - Los números de las estadísticas
 * - Los mensajes de los botones
 * - Los colores del gradiente
 */

export default function DocentePlanificacionesDemoPage() {
  const [mensaje, setMensaje] = useState('¡Esperando tu input!');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/50">
              <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-6xl font-black mb-2 bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                Portal Docente
              </h1>
              <p className="text-blue-300 text-lg font-medium">Planificaciones DEMO - Hot Reload</p>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-amber-500/10 border-2 border-amber-400/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-amber-300 font-bold text-lg mb-2">Modo Hot Reload Activo</h3>
                <p className="text-amber-200/80 text-sm leading-relaxed">
                  Abrí este archivo en VSCode: <code className="bg-amber-900/50 px-2 py-0.5 rounded text-amber-300">apps/web/src/app/demo-planificaciones/docente/page.tsx</code>
                  <br />
                  Cambiá cualquier texto o color y guardá (Ctrl+S). Los cambios aparecerán al instante.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-blue-500/30 rounded-2xl p-6">
            <BookOpen className="w-8 h-8 text-blue-400 mb-3" strokeWidth={2.5} />
            <div className="text-4xl font-black text-white mb-1">4</div>
            <p className="text-slate-400 text-sm font-medium">Planificaciones Activas</p>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-cyan-500/30 rounded-2xl p-6">
            <Users className="w-8 h-8 text-cyan-400 mb-3" strokeWidth={2.5} />
            <div className="text-4xl font-black text-white mb-1">28</div>
            <p className="text-slate-400 text-sm font-medium">Estudiantes Inscritos</p>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-emerald-500/30 rounded-2xl p-6">
            <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" strokeWidth={2.5} />
            <div className="text-4xl font-black text-white mb-1">85%</div>
            <p className="text-slate-400 text-sm font-medium">Completitud Promedio</p>
          </div>
        </div>

        {/* Interactive Message Changer */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 mb-8">
          <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-6" strokeWidth={2.5} />
          <h2 className="text-3xl font-bold text-white mb-4 text-center">Gestor de Mensajes</h2>

          <div className="backdrop-blur-sm bg-slate-800/50 border-2 border-blue-500/30 rounded-2xl p-8 mb-8 text-center">
            <p className="text-2xl font-bold text-blue-300 mb-2">Mensaje Actual:</p>
            <p className="text-4xl font-black text-white">{mensaje}</p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setMensaje('¡Excelente trabajo! 🎉')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-bold shadow-xl shadow-green-500/30 transition-all hover:scale-105"
            >
              Mensaje Positivo
            </button>
            <button
              onClick={() => setMensaje('Recordatorio: Revisar actividades 📝')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl text-white font-bold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
            >
              Recordatorio
            </button>
            <button
              onClick={() => setMensaje('Nueva planificación creada ✨')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold shadow-xl shadow-purple-500/30 transition-all hover:scale-105"
            >
              Notificación
            </button>
            <button
              onClick={() => setMensaje('¡Esperando tu input!')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold transition-colors"
            >
              Resetear
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-2xl p-6">
            <h3 className="text-white font-black text-xl mb-3">🚀 Hot Reload Funciona</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Cada cambio que hagas en el código se reflejará instantáneamente. Probá cambiar los números de las estadísticas
              o los textos de los botones.
            </p>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-2xl p-6">
            <h3 className="text-white font-black text-xl mb-3">📅 Mes de Matemática Aplicada</h3>
            <p className="text-purple-200 text-sm leading-relaxed">
              4 semanas temáticas: Química, Astronomía, Física y Computación. Cada una con 1 clase sincrónica
              y 4 actividades asíncronas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
