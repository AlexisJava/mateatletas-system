import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#0ea5e9] via-[#8b5cf6] to-[#10b981]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Comienza la aventura hoy
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
              Únete a cientos de estudiantes que ya están transformando su relación con las matemáticas
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              href="/club"
              className="px-10 py-5 bg-white text-[#0ea5e9] rounded-xl font-black text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl hover:shadow-white/20"
            >
              Comenzar ahora
            </Link>
            <Link
              href="/nosotros"
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-black text-lg hover:bg-white/20 transition-all hover:scale-105"
            >
              Conocer más
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-4xl font-black text-white mb-2">73</div>
              <div className="text-sm text-white/80 font-medium">Logros desbloqueables</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-4xl font-black text-white mb-2">4</div>
              <div className="text-sm text-white/80 font-medium">Casas competitivas</div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-4xl font-black text-white mb-2">24%</div>
              <div className="text-sm text-white/80 font-medium">Descuento máximo</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-white/90 text-sm font-semibold mb-1">Ready Player Me</div>
                <div className="text-white/60 text-xs">Avatares 3D oficiales</div>
              </div>
              <div className="hidden md:block w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white/90 text-sm font-semibold mb-1">Clases en vivo</div>
                <div className="text-white/60 text-xs">Docentes certificados</div>
              </div>
              <div className="hidden md:block w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white/90 text-sm font-semibold mb-1">Grupos reducidos</div>
                <div className="text-white/60 text-xs">10-15 estudiantes máx</div>
              </div>
              <div className="hidden md:block w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white/90 text-sm font-semibold mb-1">Pago seguro</div>
                <div className="text-white/60 text-xs">MercadoPago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
