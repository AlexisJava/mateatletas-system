export default function VideoSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/50 to-cyan-50/50 dark:from-gray-800 dark:via-blue-950/30 dark:to-cyan-950/30">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Descubre la experiencia Mateatletas
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto">
            Mira cómo transformamos el aprendizaje de matemáticas en una aventura emocionante
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Video Container with Glassmorphism */}
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/50">
            {/* Gradient Overlay for Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/80 via-[#38bdf8]/70 to-[#0284c7]/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-6 p-8">
                {/* Play Button Mockup */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full border-4 border-white/40 shadow-2xl hover:scale-110 transition-transform cursor-pointer group">
                  <div className="w-0 h-0 border-t-[16px] border-t-transparent border-l-[28px] border-l-white border-b-[16px] border-b-transparent ml-2 group-hover:border-l-[#0ea5e9] transition-colors" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-white">Video presentación</h3>
                  <p className="text-lg text-white/90 max-w-md mx-auto font-light">
                    Conoce cómo funciona nuestro sistema de gamificación, avatares 3D y clases en vivo
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30">
              <span className="text-white font-semibold text-sm">2:30</span>
            </div>
          </div>

          {/* Features Below Video */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-3xl font-black text-[#0ea5e9] mb-2">Clases en vivo</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Docentes expertos en grupos reducidos
              </p>
            </div>
            <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-3xl font-black text-[#FF6B35] mb-2">Avatares 3D</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ready Player Me personalizable
              </p>
            </div>
            <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-3xl font-black text-[#10b981] mb-2">Gamificación</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                73 logros y sistema de progresión
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
