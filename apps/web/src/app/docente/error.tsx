'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, LayoutDashboard } from 'lucide-react';

/**
 * Error Boundary para Portal Docente
 */
export default function DocenteError({
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-400/30">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-4">
          Error en Portal Docente
        </h1>

        <p className="text-purple-200 text-center mb-6">
          Ocurrió un error al cargar esta página. Por favor, intenta nuevamente.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black/30 rounded-lg p-4 mb-6 max-h-40 overflow-auto">
            <p className="text-red-400 text-xs font-mono">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Reintentar
          </button>
          <a
            href="/docente/dashboard"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-white/30"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
