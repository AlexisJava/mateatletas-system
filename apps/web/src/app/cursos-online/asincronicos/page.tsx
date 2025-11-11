'use client';

import Link from 'next/link';

export default function CursosAsincronicosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/20 to-gray-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1)_0%,transparent_50%)] bg-[length:80px_80px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <Link
            href="/cursos-online"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Cursos Online
          </Link>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600 bg-clip-text text-transparent font-[family-name:var(--font-orbitron)]">
            Cursos Asincrónicos
          </h1>
          <p className="text-xl text-white/70 max-w-3xl">
            Estudia a tu ritmo con contenido grabado. Acceso 24/7 a videos, ejercicios y material didáctico de alta calidad.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-cyan-500/20 p-12">
          <div className="text-center space-y-8">
            <div className="text-6xl mb-6">📚</div>

            <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-orbitron)]">
              Próximamente
            </h2>

            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Estamos creando una biblioteca de cursos pregrabados de alta calidad. Pronto podrás acceder a nuestros cursos asincrónicos.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-cyan-500/10 rounded-2xl p-6 border border-cyan-500/20">
                <div className="text-3xl mb-4">⏰</div>
                <h3 className="text-lg font-bold mb-2 font-[family-name:var(--font-orbitron)]">A Tu Ritmo</h3>
                <p className="text-sm text-white/60">Estudia cuando y donde quieras</p>
              </div>

              <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-bold mb-2 font-[family-name:var(--font-orbitron)]">Contenido de Calidad</h3>
                <p className="text-sm text-white/60">Videos, ejercicios y recursos</p>
              </div>

              <div className="bg-cyan-500/10 rounded-2xl p-6 border border-cyan-500/20">
                <div className="text-3xl mb-4">♾️</div>
                <h3 className="text-lg font-bold mb-2 font-[family-name:var(--font-orbitron)]">Acceso Ilimitado</h3>
                <p className="text-sm text-white/60">Repite las lecciones cuantas veces necesites</p>
              </div>
            </div>

            <div className="mt-12">
              <button
                disabled
                className="px-8 py-4 bg-cyan-500/20 text-white/40 rounded-xl font-bold cursor-not-allowed border border-cyan-500/20 font-[family-name:var(--font-orbitron)]"
              >
                Próximamente Disponible
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
