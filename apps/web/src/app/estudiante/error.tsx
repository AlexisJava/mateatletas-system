'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary para Portal Estudiante
 */
export default function EstudianteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Error logged for debugging
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-emerald-400/30">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-10 h-10 text-orange-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-4">
          ¡Ups! Algo no funcionó
        </h1>

        <p className="text-emerald-200 text-center mb-6">
          No te preocupes, puedes volver a intentarlo. Si el problema persiste, avísale a tu tutor.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black/30 rounded-lg p-4 mb-6 max-h-40 overflow-auto">
            <p className="text-orange-400 text-xs font-mono">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Intentar otra vez
          </button>
          <a
            href="/estudiante/dashboard"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border-2 border-white/30"
          >
            <Home className="w-5 h-5" />
            Mi Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
