'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, DollarSign, Calendar } from 'lucide-react';

interface PricingSectionProps {
  onInscribe: () => void;
}

export default function PricingSection({ onInscribe }: PricingSectionProps) {

  return (
    <section id="precios" className="relative py-32 bg-gradient-to-b from-black via-[#0f0f1a] to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#fbbf24]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#fbbf24]/20 to-[#f97316]/20 border border-[#fbbf24]/30 mb-6"
          >
            <Sparkles className="w-5 h-5 text-[#fbbf24]" />
            <span className="text-sm font-black text-white uppercase tracking-widest">
              Precios
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white mb-8 leading-none"
          >
            INVERSIÓN EN
            <br />
            <span className="title-gradient">SU FUTURO</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            Transparente, simple y sin sorpresas
          </motion.p>
        </div>

        {/* Single Unified Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="card-glass rounded-3xl border-2 border-[#fbbf24]/30 p-12 shadow-2xl shadow-[#fbbf24]/20">
            {/* Inscription Section */}
            <div className="mb-12 pb-12 border-b border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-black text-white">Inscripción</h3>
                  <p className="text-white/60">$25.000 por hijo • Sin descuentos</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-8 mb-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-6xl md:text-7xl font-black text-white">$25.000</span>
                  <span className="text-2xl text-white/50">por hijo</span>
                </div>
                <p className="text-white/70 text-lg">
                  <strong className="text-[#fbbf24]">Precio fijo por hijo.</strong> Sin descuentos. Pagás una sola vez por cada hijo que inscribís.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-2">Ejemplos:</div>
                  <div className="space-y-2 text-white/80">
                    <div className="flex justify-between">
                      <span>1 hijo:</span>
                      <span className="font-bold">$25.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2 hijos:</span>
                      <span className="font-bold">$50.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3 hijos:</span>
                      <span className="font-bold">$75.000</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-[#0ea5e9] flex-shrink-0 mt-1" />
                    <span className="text-white/80">Cupo garantizado</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-[#0ea5e9] flex-shrink-0 mt-1" />
                    <span className="text-white/80">Certificado al finalizar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Fees Section */}
            <div className="mb-12 pb-12 border-b border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-black text-white">Cuotas Mensuales</h3>
                  <p className="text-white/60">Precio por curso • Con descuentos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sin descuento */}
                <div className="bg-white/5 rounded-2xl p-6 border-2 border-white/10">
                  <div className="text-sm font-black text-white/60 uppercase tracking-wider mb-2">
                    Sin Descuento
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black text-white">$55.000</span>
                    <span className="text-lg text-white/50">/mes</span>
                  </div>
                  <p className="text-white/70 text-sm">1 hijo • 1 curso</p>
                </div>

                {/* 12% OFF */}
                <div className="bg-gradient-to-br from-[#10b981]/10 to-[#059669]/10 rounded-2xl p-6 border-2 border-[#10b981] relative">
                  <div className="absolute -top-3 -right-3 px-4 py-1 rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-black text-xs uppercase">
                    12% OFF
                  </div>
                  <div className="text-sm font-black text-[#10b981] uppercase tracking-wider mb-2">
                    Descuento Estándar
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black text-white">$48.400</span>
                    <span className="text-lg text-white/50">/mes</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-white/40 line-through text-sm">$55.000</span>
                    <span className="text-green-400 font-bold text-xs">-$6.600</span>
                  </div>
                  <p className="text-white/70 text-sm">2+ hermanos O 1 hijo con 2+ cursos</p>
                </div>

                {/* 20% OFF */}
                <div className="bg-gradient-to-br from-[#fbbf24]/10 to-[#f97316]/10 rounded-2xl p-6 border-2 border-[#fbbf24] relative">
                  <div className="absolute -top-3 -right-3 px-4 py-1 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#f97316] text-black font-black text-xs uppercase">
                    20% OFF
                  </div>
                  <div className="text-sm font-black text-[#fbbf24] uppercase tracking-wider mb-2">
                    Descuento Máximo
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black title-gradient">$44.000</span>
                    <span className="text-lg text-white/50">/mes</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-white/40 line-through text-sm">$55.000</span>
                    <span className="text-green-400 font-bold text-xs">-$11.000</span>
                  </div>
                  <p className="text-white/70 text-sm">2+ hermanos Y cada uno con 2+ cursos</p>
                </div>
              </div>
            </div>

            {/* Payment Examples - Only complex cases */}
            <div>
              <h4 className="text-2xl font-black text-white mb-6">Ejemplos (casos más comunes)</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Example 1: 1 hijo, 2 cursos (12% OFF) */}
                <div className="bg-gradient-to-br from-[#10b981]/10 to-[#059669]/10 rounded-xl p-6 border-2 border-[#10b981]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-[#10b981] uppercase">12% OFF</div>
                    <div className="text-sm text-white/60">1 hijo • 2 cursos</div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-white/70">Inscripción (1 hijo):</span>
                      <span className="text-white font-bold">$25.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">2 cuotas c/u $48.400:</span>
                      <span className="text-white font-bold">$96.800</span>
                    </div>
                    <div className="h-px bg-white/20 my-2" />
                    <div className="flex justify-between">
                      <span className="text-white/70">Total mes 1:</span>
                      <span className="text-[#10b981] font-black text-xl">$121.800</span>
                    </div>
                  </div>
                  <div className="text-xs text-green-400">
                    Ahorrás $13.200/mes en cuotas (12% OFF)
                  </div>
                </div>

                {/* Example 2: 2 hermanos, 2 cursos c/u (20% OFF) */}
                <div className="bg-gradient-to-br from-[#fbbf24]/10 to-[#f97316]/10 rounded-xl p-6 border-2 border-[#fbbf24]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-[#fbbf24] uppercase">20% OFF</div>
                    <div className="text-sm text-white/60">2 hermanos • 2 cursos c/u</div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-white/70">Inscripción (2 hijos):</span>
                      <span className="text-white font-bold">$50.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">4 cuotas c/u $44.000:</span>
                      <span className="text-white font-bold">$176.000</span>
                    </div>
                    <div className="h-px bg-white/20 my-2" />
                    <div className="flex justify-between">
                      <span className="text-white/70">Total mes 1:</span>
                      <span className="text-[#fbbf24] font-black text-xl">$226.000</span>
                    </div>
                  </div>
                  <div className="text-xs text-green-400">
                    Ahorrás $44.000/mes en cuotas (20% OFF)
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-white/70 text-sm">
                  <strong className="text-white">Recordá:</strong> La inscripción siempre es $25.000 por hijo (sin descuento). Los descuentos solo aplican a las cuotas mensuales.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <button
            onClick={onInscribe}
            className="px-12 py-6 bg-gradient-to-r from-[#fbbf24] via-[#f97316] to-[#ef4444] rounded-2xl text-white font-black text-2xl uppercase tracking-wider transition-all hover:scale-110 hover:shadow-2xl shadow-[#fbbf24]/50"
          >
            INSCRIBIR AHORA →
          </button>
          <p className="text-white/50 mt-6 text-sm">
            Cupos limitados • Inscripciones por orden de llegada
          </p>
        </motion.div>
      </div>
    </section>
  );
}
