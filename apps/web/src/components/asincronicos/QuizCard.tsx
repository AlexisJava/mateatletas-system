'use client';

import { motion } from 'framer-motion';
import { HelpCircle, Sparkles, ArrowRight } from 'lucide-react';

interface QuizCardProps {
  onOpenQuiz: () => void;
}

export default function QuizCard({ onOpenQuiz }: QuizCardProps) {
  return (
    <section className="relative py-20 bg-black">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Card principal */}
          <div className="relative group">
            {/* Glow animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/30 via-[#f43f5e]/30 to-[#fbbf24]/30 rounded-3xl blur-2xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Contenido */}
            <div className="relative bg-black/80 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-10 md:p-12">
              {/* Icon central */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#f43f5e] rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <div className="relative bg-gradient-to-br from-[#8b5cf6] to-[#f43f5e] w-20 h-20 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Texto */}
              <div className="text-center mb-8">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  ¿No sabés cuál elegir?
                </h3>
                <p className="text-xl text-white/70 mb-2">
                  Respondé <strong className="text-white">5 preguntas rápidas</strong> y te
                  recomendamos
                </p>
                <p className="text-lg text-white/60">
                  el curso perfecto para tu hijo en base a su edad, intereses y experiencia
                </p>
              </div>

              {/* Features del quiz */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                  <Sparkles className="w-6 h-6 text-[#fbbf24]" />
                  <div>
                    <p className="text-sm font-bold text-white">Solo 2 minutos</p>
                    <p className="text-xs text-white/60">Súper rápido</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                  <Sparkles className="w-6 h-6 text-[#10b981]" />
                  <div>
                    <p className="text-sm font-bold text-white">100% gratis</p>
                    <p className="text-xs text-white/60">Sin tarjeta</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                  <Sparkles className="w-6 h-6 text-[#8b5cf6]" />
                  <div>
                    <p className="text-sm font-bold text-white">Personalizado</p>
                    <p className="text-xs text-white/60">Para tu hijo</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={onOpenQuiz}
                className="group relative w-full px-8 py-5 bg-gradient-to-r from-[#8b5cf6] via-[#f43f5e] to-[#fbbf24] rounded-2xl font-black text-xl text-white shadow-2xl hover:shadow-[#8b5cf6]/50 transition-all hover:scale-[1.02] active:scale-100"
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#8b5cf6] via-[#f43f5e] to-[#fbbf24] blur-xl opacity-0 group-hover:opacity-60"
                  animate={{
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <span className="relative flex items-center justify-center gap-3">
                  HACER EL QUIZ AHORA
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.span>
                </span>
              </button>

              <p className="text-center text-white/50 text-sm mt-4">
                ✨ Más de 200 familias ya lo usaron
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
