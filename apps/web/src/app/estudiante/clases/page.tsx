'use client';

import Link from 'next/link';
import { ArrowLeft, GraduationCap, Construction } from 'lucide-react';

export default function ClasesPage() {
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
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-2">Mi Aula Virtual</h1>
          <p className="text-slate-400 text-lg mb-8 max-w-md">
            Accede a tus clases, horarios y conecta con tus profesores
          </p>

          <div className="flex items-center gap-3 px-6 py-4 bg-amber-900/30 border border-amber-500/30 rounded-2xl">
            <Construction className="w-6 h-6 text-amber-400" />
            <div className="text-left">
              <p className="font-semibold text-amber-200">Próximamente</p>
              <p className="text-sm text-slate-400">Tu aula virtual está en camino</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
