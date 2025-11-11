'use client';

import Link from 'next/link';

export default function CursosSincronicosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1)_0%,transparent_50%)] bg-[length:80px_80px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <Link
            href="/cursos-online"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Cursos Online
          </Link>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent font-[family-name:var(--font-orbitron)]">
            Cursos Sincrónicos
          </h1>
          <p className="text-xl text-white/70 max-w-3xl">
            Clases en vivo con docentes expertos. Interacción en tiempo real, feedback inmediato y construcción de comunidad.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-12">
          <div className="text-center space-y-8">
            <div className="text-6xl mb-6">🎥</div>

            <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-orbitron)]">
              Próximamente
            </h2>

            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Estamos preparando una experiencia increíble de cursos en vivo. Pronto podrás inscribirte a nuestras clases sincrónicas.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-purple-500/10 rounded-2xl p-6 border border-purple-500/20">
                <div className="text-3xl mb-4">👨‍🏫</div>
                <h3 className="text-lg font-bold mb-2 font-[family-name:var(--font-orbitron)]">Docentes en Vivo</h3>
                <p className="text-sm text-white/60">Interacción directa con expertos</p>
              </div>

              <div className="bg-pink-500/10 rounded-2xl p-6 border border-pink-500/20">
                <div className="text-3xl mb-4">💬</div>
                <h3 className="text-lg font-bold mb-2 font-[family-name:var(--font-orbitron)]">Feedback Inmediato</h3>
                <p className="text-sm text-white/60">Resuelve tus dudas al instante</p>
              </div>

              <div className="bg-purple-500/10 rounded-2xl p-6 border border-purple-500/20">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-lg font-bold mb-2 font-[family-name:var(--font-orbitron)]">Comunidad</h3>
                <p className="text-sm text-white/60">Aprende junto a otros estudiantes</p>
              </div>
            </div>

            <div className="mt-12">
              <button
                disabled
                className="px-8 py-4 bg-purple-500/20 text-white/40 rounded-xl font-bold cursor-not-allowed border border-purple-500/20 font-[family-name:var(--font-orbitron)]"
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
