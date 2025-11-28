'use client';

import { motion } from 'framer-motion';
import { Rocket, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CTASectionProps {
  onInscribe: () => void;
}

export default function CTASection({ onInscribe }: CTASectionProps) {
  return (
    <section className="relative py-32 bg-gradient-to-b from-black to-[#1a1a2e] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#fbbf24]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#f43f5e]/20 rounded-full blur-[120px] animate-pulse" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/40 mb-8"
          >
            <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" />
            <span className="text-lg font-black text-red-400 uppercase tracking-wider">
              ⚡ Cupos Limitados - Inscripciones Abiertas
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white mb-8 leading-none"
          >
            NO TE QUEDES
            <br />
            <span className="title-gradient">AFUERA</span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Cada curso tiene un{' '}
            <strong className="text-white font-black">máximo de 10 estudiantes</strong>.
            <br />
            Las vacantes se asignan por orden de inscripción.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <button
              onClick={onInscribe}
              className="group relative px-12 py-6 bg-gradient-to-r from-[#fbbf24] to-[#f97316] rounded-2xl text-black font-black text-xl transition-all hover:scale-110 hover:shadow-2xl shadow-[#fbbf24]/50 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Rocket className="w-7 h-7" />
                INSCRIBIR AHORA
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
              </span>
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </button>

            <Link
              href="#precios"
              className="px-12 py-6 bg-transparent border-3 border-white/30 rounded-2xl text-white font-black text-xl transition-all hover:bg-white/10 hover:border-white/60 hover:scale-105"
            >
              VER PRECIOS
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              {
                value: '500+',
                label: 'Estudiantes Activos',
                sublabel: 'Confían en nosotros',
              },
              {
                value: '100%',
                label: 'Satisfacción',
                sublabel: 'Padres felices',
              },
              {
                value: '11',
                label: 'Cursos Diferentes',
                sublabel: 'Para todas las edades',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="card-glass rounded-2xl border-2 border-white/10 p-6"
              >
                <div className="text-5xl font-black text-white mb-2 title-gradient">
                  {stat.value}
                </div>
                <div className="text-lg font-bold text-white mb-1">{stat.label}</div>
                <div className="text-sm text-white/50">{stat.sublabel}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Final Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-white/60 text-lg"
          >
            ¿Dudas? Escribinos a{' '}
            <a
              href="mailto:info@mateatletas.com"
              className="text-[#0ea5e9] hover:text-[#fbbf24] transition-colors font-bold"
            >
              info@mateatletas.com
            </a>
          </motion.p>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </section>
  );
}
