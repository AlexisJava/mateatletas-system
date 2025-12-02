'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Shield, BookOpen, ArrowRight, Sparkles, Zap } from 'lucide-react';

const portals = [
  {
    id: 'tutor',
    title: 'Portal Tutor',
    description: 'Seguí el progreso de tus hijos',
    href: '/login',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    delay: 0,
  },
  {
    id: 'estudiante',
    title: 'Portal Estudiante',
    description: 'Accedé a tus cursos y misiones',
    href: '/estudiante-login',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-500',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    delay: 0.1,
  },
  {
    id: 'docente',
    title: 'Portal Docente',
    description: 'Gestioná tus clases y estudiantes',
    href: '/docente-login',
    icon: BookOpen,
    gradient: 'from-violet-500 to-purple-500',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    delay: 0.2,
  },
  {
    id: 'admin',
    title: 'Administración',
    description: 'Panel de control del sistema',
    href: '/admin',
    icon: Shield,
    gradient: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    delay: 0.3,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090b] relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
            Mateatletas
          </h1>
          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            Club de Matemáticas, Ciencia y Tecnología
          </p>
        </motion.div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={portal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: portal.delay }}
              >
                <Link
                  href={portal.href}
                  className="group relative block p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 overflow-hidden"
                  style={{
                    boxShadow: `0 0 0 0 ${portal.glowColor}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 40px 0 ${portal.glowColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 0 ${portal.glowColor}`;
                  }}
                >
                  {/* Gradient line on top */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${portal.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${portal.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {portal.title}
                        </h2>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-zinc-500">{portal.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Colonia 2026 Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 w-full max-w-2xl"
        >
          <Link
            href="/colonia-2026"
            className="group relative block p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">Colonia de Verano 2026</h3>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full">
                      INSCRIPCIONES ABIERTAS
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Enero y Febrero - Matemática, Robótica, Programación
                  </p>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Mateatletas Club. Todos los derechos reservados.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
