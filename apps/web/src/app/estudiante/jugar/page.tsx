'use client';

import Link from 'next/link';
import { ArrowLeft, Gamepad2, Construction } from 'lucide-react';

export default function JugarPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/estudiante"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Placeholder content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
            <Gamepad2 className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-2">Arcade Zone</h1>
          <p className="text-slate-400 text-lg mb-8 max-w-md">
            Juegos educativos que harán volar tu imaginación mientras aprendes
          </p>

          <div className="flex items-center gap-3 px-6 py-4 bg-cyan-900/30 border border-cyan-500/30 rounded-2xl">
            <Construction className="w-6 h-6 text-cyan-400" />
            <div className="text-left">
              <p className="font-semibold text-cyan-200">Próximamente</p>
              <p className="text-sm text-slate-400">Estamos preparando los mejores juegos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
