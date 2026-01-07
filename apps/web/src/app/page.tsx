'use client';

import { Zap, Rocket, Mail } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[180px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8 inline-flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
              boxShadow: '0 25px 80px rgba(16,185,129,0.4)',
            }}
          >
            <Zap className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-5xl md:text-7xl font-black mb-4 tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 50%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Mateatletas
        </h1>

        <p className="text-xl md:text-2xl text-white/60 mb-2 font-medium">Club STEAM</p>

        {/* Construction badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8">
          <Rocket className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="text-amber-300 font-semibold text-sm">Sitio en construcción</span>
        </div>

        {/* Description */}
        <p className="text-white/50 text-lg mb-12 leading-relaxed">
          Estamos preparando algo increíble. Muy pronto podrás explorar matemática, programación y
          ciencias de una forma única.
        </p>

        {/* Contact */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-white/40 text-sm">¿Consultas?</p>
          <a
            href="mailto:contacto@mateatletasclub.com.ar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              boxShadow: '0 10px 40px rgba(16,185,129,0.3)',
            }}
          >
            <Mail className="w-5 h-5" />
            contacto@mateatletasclub.com.ar
          </a>
        </div>

        {/* Footer */}
        <p className="mt-16 text-white/20 text-sm">
          © {new Date().getFullYear()} Mateatletas Club
        </p>
      </div>
    </div>
  );
}
