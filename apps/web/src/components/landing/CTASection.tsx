import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export default function CTASection() {
  return (
    <section className="relative py-32 overflow-visible bg-transparent">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Main CTA Card */}
        <ScrollReveal animation="zoom-in">
          <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#0ea5e9] via-[#8b5cf6] to-[#10b981] rounded-[3rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

          {/* Main container */}
          <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-900/98 to-black/95 dark:from-gray-950/95 dark:via-gray-950/98 dark:to-black/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0ea5e9] to-transparent opacity-50" />

            {/* Grid pattern background */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />

            {/* Content */}
            <div className="relative px-8 md:px-16 py-20 md:py-24">
              {/* Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0ea5e9]/10 via-[#8b5cf6]/10 to-[#10b981]/10 rounded-full border border-white/10">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]" />
                  </span>
                  <span className="text-white/90 text-sm font-bold tracking-wide">Inscripciones abiertas 2025</span>
                </div>
              </div>

              {/* Main heading */}
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-center mb-6 leading-[1.1]">
                <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  Transformá el futuro
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#0ea5e9] via-[#8b5cf6] to-[#10b981] bg-clip-text text-transparent">
                  de tus hijos hoy
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-white/60 text-center max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                Únete a más de 500 familias que confían en Mateatletas para el desarrollo STEAM de sus hijos
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link
                  href="/club"
                  className="group/btn relative px-10 py-5 bg-gradient-to-r from-[#0ea5e9] via-[#0ea5e9] to-[#0284c7] rounded-2xl font-black text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#0ea5e9]/50"
                >
                  <span className="relative z-10">Ver planes y precios</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] blur opacity-0 group-hover/btn:opacity-50 transition-opacity" />
                </Link>
                <Link
                  href="/nosotros"
                  className="group/btn px-10 py-5 bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105"
                >
                  Conocer más
                  <span className="inline-block ml-2 transition-transform group-hover/btn:translate-x-1">→</span>
                </Link>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
                {[
                  { value: '500+', label: 'Estudiantes activos' },
                  { value: '73', label: 'Logros desbloqueables' },
                  { value: '4', label: 'Casas competitivas' },
                  { value: '24%', label: 'Descuento máximo' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="relative group/card p-6 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/0 to-[#8b5cf6]/0 group-hover/card:from-[#0ea5e9]/5 group-hover/card:to-[#8b5cf6]/5 rounded-2xl transition-all duration-300" />
                    <div className="relative">
                      <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-white/50 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-50" />
          </div>
          </div>
        </ScrollReveal>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Clases en vivo con docentes certificados</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Grupos reducidos de 8-10 estudiantes</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Pago seguro con MercadoPago</span>
          </div>
        </div>
      </div>
    </section>
  );
}
