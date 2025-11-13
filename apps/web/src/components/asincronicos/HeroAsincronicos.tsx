'use client';

import { motion } from 'framer-motion';
import { Clock, PlayCircle, Calendar, Star } from 'lucide-react';

interface HeroAsincronicosProps {
  onExplorarCursos: () => void;
}

export default function HeroAsincronicos({ onExplorarCursos }: HeroAsincronicosProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Cosmos Background - Estilo Mateatletas */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10b981]/10 rounded-full blur-[120px]" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-40 right-1/4 w-96 h-96 bg-[#fbbf24]/30 rounded-full blur-[120px]"
          animate={{
            y: [0, -40, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-96 h-96 bg-[#f43f5e]/30 rounded-full blur-[120px]"
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(14, 165, 233, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(14, 165, 233, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#0ea5e9]/20 to-[#8b5cf6]/20 border border-[#0ea5e9]/30 mb-8"
          >
            <PlayCircle className="w-5 h-5 text-[#0ea5e9] animate-pulse" />
            <span className="text-sm font-black text-[#0ea5e9] uppercase tracking-widest">
              Aprendé a tu ritmo
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight"
          >
            CURSOS
            <br />
            <span className="title-gradient">ASINCRÓNICOS</span>
          </motion.h1>

          {/* Subtitle - PERSUASIVO */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl text-white/80 mb-12 leading-relaxed max-w-4xl mx-auto"
          >
            Tu hijo aprende <strong className="text-[#0ea5e9]">cuando quiere</strong>,
            <strong className="text-[#10b981]"> donde quiere</strong>, y
            <strong className="text-[#fbbf24]"> a su propio ritmo</strong>
          </motion.p>

          {/* 3 Beneficios Clave - Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto"
          >
            {/* Beneficio 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 to-[#0ea5e9]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#0ea5e9]/50 transition-all">
                <Clock className="w-12 h-12 text-[#0ea5e9] mb-4 mx-auto" />
                <h3 className="text-xl font-black text-white mb-2">100% Flexible</h3>
                <p className="text-white/70 text-sm">
                  Sin horarios fijos. Se adapta a la agenda de tu familia
                </p>
              </div>
            </div>

            {/* Beneficio 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#10b981]/50 transition-all">
                <Calendar className="w-12 h-12 text-[#10b981] mb-4 mx-auto" />
                <h3 className="text-xl font-black text-white mb-2">Acceso de por vida</h3>
                <p className="text-white/70 text-sm">
                  Puede repetir las clases cuantas veces quiera
                </p>
              </div>
            </div>

            {/* Beneficio 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/20 to-[#fbbf24]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#fbbf24]/50 transition-all">
                <Star className="w-12 h-12 text-[#fbbf24] mb-4 mx-auto" />
                <h3 className="text-xl font-black text-white mb-2">A su ritmo</h3>
                <p className="text-white/70 text-sm">
                  Avanza más rápido o tómate tu tiempo según necesites
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={onExplorarCursos}
              className="group relative px-12 py-5 bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] rounded-2xl font-black text-xl text-white shadow-2xl hover:shadow-[#0ea5e9]/50 transition-all hover:scale-105 active:scale-100"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] blur-xl opacity-0 group-hover:opacity-60"
                animate={{
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <span className="relative flex items-center gap-3">
                VER CURSOS DISPONIBLES
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              </span>
            </button>

            <p className="text-white/60 text-sm">
              🎯 Más de 15 cursos en programación, matemática y ciencias
            </p>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#fbbf24] fill-[#fbbf24]" />
              <span className="font-bold text-white">4.9/5</span>
              <span>(+50 familias)</span>
            </div>
            <div className="hidden md:block h-4 w-px bg-white/20" />
            <div>🎓 +200 estudiantes activos</div>
            <div className="hidden md:block h-4 w-px bg-white/20" />
            <div>✨ Acceso permanente garantizado</div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
      >
        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-2 hover:border-[#0ea5e9] transition-colors">
          <motion.div
            className="w-2 h-2 bg-[#0ea5e9] rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
