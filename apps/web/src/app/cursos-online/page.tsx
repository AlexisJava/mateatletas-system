'use client';

import Link from 'next/link';

export default function CursosOnlinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#fbbf24]/10 rounded-full border border-[#FF6B35]/20 mb-6">
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#fbbf24] bg-clip-text text-transparent font-semibold text-sm">
              Aprendé a tu manera
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight font-[family-name:var(--font-orbitron)]">
            Cursos Online
            <br />
            <span className="bg-gradient-to-r from-[#FF6B35] via-[#fbbf24] to-[#10b981] bg-clip-text text-transparent">
              Sincrónicos y Asincrónicos
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto mb-12">
            Elegí la modalidad que mejor se adapte a tu ritmo de aprendizaje.
            <br />
            Clases en vivo con docentes o contenido pregrabado disponible 24/7.
          </p>
        </div>
      </section>

      {/* Opciones de Cursos */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cursos Sincrónicos */}
            <Link href="/cursos-online/sincronicos">
              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-3xl border-2 border-purple-500/30 p-10 hover:border-purple-400 hover:scale-105 transition-all duration-300 cursor-pointer">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-6xl mb-6">🎥</div>

                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-[family-name:var(--font-orbitron)]">
                    Cursos Sincrónicos
                  </h2>

                  <p className="text-lg text-white/70 mb-8 leading-relaxed">
                    Clases en vivo con docentes expertos. Interacción en tiempo real y feedback inmediato.
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-white/80">Docentes en vivo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-white/80">Feedback instantáneo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-white/80">Construcción de comunidad</span>
                    </li>
                  </ul>

                  <div className="inline-flex items-center gap-2 text-purple-400 font-bold group-hover:gap-4 transition-all">
                    Ver más
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Cursos Asincrónicos */}
            <Link href="/cursos-online/asincronicos">
              <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/30 p-10 hover:border-cyan-400 hover:scale-105 transition-all duration-300 cursor-pointer">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-6xl mb-6">📚</div>

                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-[family-name:var(--font-orbitron)]">
                    Cursos Asincrónicos
                  </h2>

                  <p className="text-lg text-white/70 mb-8 leading-relaxed">
                    Estudia a tu ritmo con contenido grabado. Acceso 24/7 a material de alta calidad.
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-white/80">Aprende a tu ritmo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-white/80">Contenido pregrabado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-white/80">Disponible 24/7</span>
                    </li>
                  </ul>

                  <div className="inline-flex items-center gap-2 text-cyan-400 font-bold group-hover:gap-4 transition-all">
                    Ver más
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 font-[family-name:var(--font-orbitron)]">
              ¿Por qué elegir cursos online?
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Flexibilidad y calidad para adaptarse a tu estilo de aprendizaje
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-center">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-xl font-black text-white mb-2 font-[family-name:var(--font-orbitron)]">Flexibilidad</h3>
              <p className="text-gray-400 text-sm">Elige el horario que mejor te funcione</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-black text-white mb-2 font-[family-name:var(--font-orbitron)]">Tu Ritmo</h3>
              <p className="text-gray-400 text-sm">Avanza según tus necesidades</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-center">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-black text-white mb-2 font-[family-name:var(--font-orbitron)]">Docentes Expertos</h3>
              <p className="text-gray-400 text-sm">Aprende de los mejores profesionales</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-center">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-xl font-black text-white mb-2 font-[family-name:var(--font-orbitron)]">Calidad Premium</h3>
              <p className="text-gray-400 text-sm">Contenido diseñado para el éxito</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/40 to-cyan-900/40 backdrop-blur-xl p-10 md:p-12 rounded-3xl border-2 border-white/20 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 font-[family-name:var(--font-orbitron)]">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Explora nuestras opciones y encuentra el formato perfecto para ti
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all font-[family-name:var(--font-orbitron)]"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
