import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#0ea5e9]/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-[#38bdf8]/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-[#0284c7]/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-[#0ea5e9]/10 rounded-full border border-[#0ea5e9]/20">
              <span className="text-[#0ea5e9] dark:text-[#38bdf8] font-semibold text-sm">
                Educación innovadora en matemáticas
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-[#0284c7] bg-clip-text text-transparent">
                Transformamos
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                las matemáticas en
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#fbbf24] bg-clip-text text-transparent">
                aventura
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 font-light max-w-xl leading-relaxed">
              Clases en vivo con docentes expertos, gamificación con 73 logros, avatares 3D personalizados y una comunidad de aprendizaje donde cada estudiante brilla.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/club"
                className="px-8 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-[#0ea5e9]/40 transition-all hover:scale-105 text-center"
              >
                Comenzar ahora
              </Link>
              <Link
                href="/nosotros"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#0ea5e9] dark:hover:border-[#38bdf8] transition-all hover:scale-105 text-center"
              >
                Conocer más
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-black text-[#0ea5e9] dark:text-[#38bdf8]">73</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Logros</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#FF6B35]">4</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Casas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#10b981]">15+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Niveles</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Placeholder */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Glassmorphism Card with Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 via-[#38bdf8]/20 to-[#0284c7]/20 rounded-3xl backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-6 p-8">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-6xl font-black text-white">M</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">Avatares 3D</div>
                      <div className="text-gray-600 dark:text-gray-300">Ready Player Me</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#FF6B35] to-[#fbbf24] rounded-2xl shadow-xl rotate-12 flex items-center justify-center">
                <span className="text-3xl font-black text-white">+XP</span>
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl shadow-xl -rotate-12 flex items-center justify-center">
                <span className="text-2xl font-black text-white">Logro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
