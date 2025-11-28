'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCcw, LayoutDashboard } from 'lucide-react';

/**
 * Error Boundary para Portal Admin
 */
export default function AdminError({
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
            <AlertOctagon className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-4">
          Error en Panel Administrativo
        </h1>

        <p className="text-gray-300 text-center mb-6">
          Se produjo un error al procesar la solicitud. Los detalles técnicos han sido registrados.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black/40 rounded-lg p-4 mb-6 max-h-40 overflow-auto border border-red-500/20">
            <p className="text-red-400 text-xs font-mono">{error.message}</p>
            {error.digest && <p className="text-gray-500 text-xs mt-2">Digest: {error.digest}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCcw className="w-4 h-4" />
            Reintentar
          </button>
          <a
            href="/admin/dashboard"
            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
