'use client';

import { motion } from 'framer-motion';
import { Sparkles, Calendar, Users, Trophy } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  onInscribe: () => void;
}

export default function HeroSection({ onInscribe: _onInscribe }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Cosmos Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#fbbf24]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#f43f5e]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-[120px]" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-40 right-1/4 w-96 h-96 bg-[#10b981]/30 rounded-full blur-[120px]"
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
          className="absolute bottom-40 left-1/4 w-96 h-96 bg-[#8b5cf6]/30 rounded-full blur-[120px]"
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

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(251, 191, 36, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(251, 191, 36, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#fbbf24]/20 to-[#f97316]/20 border border-[#fbbf24]/30 mb-8"
          >
            <Sparkles className="w-5 h-5 text-[#fbbf24] animate-pulse" />
            <span className="text-sm font-black text-[#fbbf24] uppercase tracking-widest">
              Verano 2026
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight"
          >
            COLONIA DE
            <br />
            <span className="title-gradient">VERANO STEAM</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl text-white/80 mb-4 leading-relaxed"
          >
            8 semanas de aprendizaje, diversión y aventura
          </motion.p>

          {/* Dates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mb-12"
          >
            <Calendar className="w-6 h-6 text-[#fbbf24]" />
            <span className="text-xl md:text-2xl font-bold text-white">5 Enero - 3 Marzo 2026</span>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12"
          >
            {[
              { icon: Trophy, label: '11 Cursos', sublabel: 'Diferentes áreas' },
              { icon: Users, label: '10 Alumnos', sublabel: 'Máx. por curso' },
              { icon: Sparkles, label: 'Virtual', sublabel: 'En vivo' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="card-glass p-6 rounded-2xl border border-white/10"
              >
                <stat.icon className="w-10 h-10 text-[#fbbf24] mx-auto mb-3" />
                <div className="text-2xl font-black text-white mb-1">{stat.label}</div>
                <div className="text-sm text-white/60">{stat.sublabel}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="#cursos"
              className="px-10 py-5 bg-gradient-to-r from-[#fbbf24] to-[#f97316] rounded-2xl text-black font-black text-lg transition-all hover:scale-105 hover:shadow-2xl shadow-[#fbbf24]/50"
            >
              VER CURSOS DISPONIBLES
            </Link>
            <Link
              href="#precios"
              className="px-10 py-5 bg-transparent border-3 border-white/20 rounded-2xl text-white font-black text-lg transition-all hover:bg-white/5 hover:border-white/40"
            >
              VER PRECIOS
            </Link>
          </motion.div>

          {/* Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 text-white/50 text-sm"
          >
            ⚡ Cupos limitados - Inscripciones abiertas
          </motion.p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
