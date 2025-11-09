import PricingCards from '@/components/pricing/PricingCards';
import ScrollReveal from '@/components/ScrollReveal';

export default function PricingSection() {
  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-[1400px] mx-auto px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#10b981]/10 to-[#0ea5e9]/10 rounded-full border border-[#10b981]/20 mb-6">
              <span className="bg-gradient-to-r from-[#10b981] to-[#0ea5e9] bg-clip-text text-transparent font-semibold text-sm">
                Planes accesibles
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Elige tu plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto mb-8">
              Desde $30.000/mes. Cursos gamificados + clases en vivo. Descuento automático por hermanos.
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
                Descuentos disponibles
              </h3>
              <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-6">
                Solicitá información sobre nuestros descuentos especiales para familias y múltiples actividades
              </p>
              <div className="text-center">
                <button className="px-8 py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-[#10b981]/40 transition-all hover:scale-105">
                  Solicitar descuentos
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
