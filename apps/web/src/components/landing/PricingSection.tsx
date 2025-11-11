import PricingCards from '@/components/pricing/PricingCards';
import ScrollReveal from '@/components/ScrollReveal';

export default function PricingSection() {
  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-[1400px] mx-auto px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#fbbf24]/10 to-[#f97316]/10 rounded-full border border-[#fbbf24]/20 mb-6">
              <span className="bg-gradient-to-r from-[#fbbf24] to-[#f97316] bg-clip-text text-transparent font-semibold text-sm uppercase tracking-wider">
                Inscripciones Abiertas
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Inscripciones 2026
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto mb-8">
              Colonia de Verano en Enero, Ciclo 2026 desde Marzo, o ambos con descuento. Elegí tu opción.
            </p>
          </div>
        </ScrollReveal>

        {/* Game Store Pricing Cards */}
        <PricingCards />

        {/* Discount Info */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="max-w-4xl mx-auto mt-12">
            <div className="p-8 bg-gradient-to-br from-[#10b981]/10 to-[#059669]/10 rounded-2xl border-2 border-[#10b981]/30">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 text-center">
                👨‍👩‍👧‍👦 Descuentos por hermanos
              </h3>
              <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-2">
                <strong className="text-[#10b981]">2 hermanos:</strong> 12% de descuento •{' '}
                <strong className="text-[#10b981]">3+ hermanos:</strong> 24% de descuento
              </p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Se aplica automáticamente sobre la cuota mensual durante la inscripción
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
