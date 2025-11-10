'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  Sparkles,
  Target,
  Heart,
  Users,
  Rocket,
  Brain,
  Zap,
  Star,
  Trophy,
  Code,
  Microscope,
} from 'lucide-react';

/**
 * Página Nosotros - Historia y equipo de Mateatletas
 * Ultra-premium design matching landing page
 * Ruta: /nosotros
 */
export default function NosotrosPage() {
  const valores = [
    {
      icon: Heart,
      title: 'Pasión por el aprendizaje',
      description: 'Creemos que aprender puede y debe ser apasionante. Cada clase es una aventura.',
      color: 'from-[#FF6B35] to-[#f59e0b]',
    },
    {
      icon: Zap,
      title: 'Innovación constante',
      description: 'Gamificación, tecnología y metodologías modernas para aprender del siglo XXI.',
      color: 'from-[#fbbf24] to-[#f59e0b]',
    },
    {
      icon: Users,
      title: 'Comunidad real',
      description: 'No solo enseñamos contenido. Construimos una comunidad donde todos crecen juntos.',
      color: 'from-[#10b981] to-[#059669]',
    },
    {
      icon: Trophy,
      title: 'Excelencia sin presión',
      description: 'Buscamos la excelencia, pero sin perder la diversión. El proceso es tan importante como el resultado.',
      color: 'from-[#0ea5e9] to-[#0284c7]',
    },
  ];

  const stats = [
    {
      number: '500+',
      label: 'Familias confían en nosotros',
      icon: Heart,
    },
    {
      number: '3',
      label: 'Mundos STEAM',
      icon: Sparkles,
    },
    {
      number: '95%',
      label: 'Satisfacción de padres',
      icon: Star,
    },
    {
      number: '2026',
      label: 'Año de lanzamiento Club',
      icon: Rocket,
    },
  ];

  const equipo = [
    {
      nombre: 'Matemática',
      rol: 'Mundo STEAM',
      icon: Brain,
      color: 'from-[#0ea5e9] to-[#0284c7]',
      description: 'De olimpíadas a finanzas, matemática que transforma',
    },
    {
      nombre: 'Programación',
      rol: 'Mundo STEAM',
      icon: Code,
      color: 'from-[#8b5cf6] to-[#7c3aed]',
      description: 'Creadores, no consumidores de tecnología',
    },
    {
      nombre: 'Ciencias',
      rol: 'Mundo STEAM',
      icon: Microscope,
      color: 'from-[#10b981] to-[#059669]',
      description: 'Experimentos que despiertan curiosidad',
    },
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Los inicios',
      description: 'Nace la idea de transformar la educación STEAM en Argentina',
    },
    {
      year: '2021-2023',
      title: 'Crecimiento orgánico',
      description: 'Más de 300 familias se suman a la comunidad',
    },
    {
      year: '2024',
      title: 'Consolidación',
      description: 'Lanzamiento de plataforma gamificada y sistema de logros',
    },
    {
      year: '2025-2026',
      title: 'Club STEAM',
      description: 'Lanzamiento del Club con 3 mundos y experiencia completa',
    },
  ];

  return (
    <div className="relative">
      {/* Cosmos Background - Fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Animated orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#10b981]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[120px]" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-40 right-1/4 w-64 h-64 bg-[#fbbf24]/10 rounded-full blur-[100px]"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-64 h-64 bg-[#FF6B35]/10 rounded-full blur-[100px]"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Animated grid */}
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

      <div className="relative z-10">
        <Navbar />
        <main className="min-h-screen">
          {/* Hero Section */}
          <section className="section-landing relative" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#0ea5e9]/20 to-[#10b981]/20 border border-[#0ea5e9]/30 mb-8">
                <Sparkles className="w-4 h-4 text-[#0ea5e9] animate-pulse" />
                <span className="text-xs font-black text-[#0ea5e9] uppercase tracking-widest">
                  Sobre Nosotros
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                Transformamos la relación
                <br />
                <span className="title-gradient">de tus hijos</span>
                <br />
                con el aprendizaje
              </h1>

              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Somos una comunidad de más de <strong className="text-white">500 familias</strong> que descubrió
                que aprender matemática, programación y ciencias puede ser la parte más emocionante del día.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="card-glass p-8 rounded-3xl border-2 border-white/10 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#10b981] mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-black text-white mb-2">{stat.number}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Historia Section */}
        <section className="section-landing">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Nuestra historia
              </h2>
              <p className="text-xl text-white/70 leading-relaxed">
                Todo comenzó con una pregunta simple: <strong className="text-white">¿Por qué tantos chicos odian
                matemática y ciencias?</strong> La respuesta era clara: porque no las enseñaban de forma
                apasionante.
              </p>
            </div>

            <div className="card-glass p-12 rounded-3xl border-2 border-white/10 space-y-6">
              <p className="text-lg text-white/80 leading-relaxed">
                En <strong className="text-white">2020</strong>, decidimos cambiar eso. Empezamos con clases
                pequeñas, experimentando con gamificación, desafíos y metodologías que hacían que los chicos
                <strong className="text-white"> pidieran más clases</strong> en vez de evitarlas.
              </p>

              <p className="text-lg text-white/80 leading-relaxed">
                Hoy somos una comunidad de <strong className="text-white">más de 500 familias</strong> que
                confían en nosotros para transformar la educación de sus hijos. Y recién estamos empezando.
              </p>

              <div className="pt-6 border-t border-white/10">
                <p className="text-lg font-bold text-[#0ea5e9]">
                  &ldquo;No queremos que tus hijos sean buenos en matemática. Queremos que la amen.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Nuestro camino
              </h2>
            </div>

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative pl-12"
                >
                  {/* Vertical line */}
                  {index < timeline.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-[#0ea5e9] to-transparent" />
                  )}

                  {/* Dot */}
                  <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] border-4 border-black" />

                  <div className="card-glass p-6 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-[#0ea5e9] mb-2">{item.year}</div>
                    <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
                    <p className="text-white/70">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Valores Section */}
        <section className="section-landing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Nuestros valores
              </h2>
              <p className="text-xl text-white/70">
                Lo que nos define y guía cada decisión que tomamos
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {valores.map((valor, index) => {
                const Icon = valor.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="card-glass p-8 rounded-3xl border-2 border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${valor.color} mb-6 shadow-xl`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">{valor.title}</h3>
                    <p className="text-white/70 leading-relaxed">{valor.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mundos Section */}
        <section className="section-landing bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Nuestros 3 mundos STEAM
              </h2>
              <p className="text-xl text-white/70">
                Cada uno diseñado para despertar una pasión diferente
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {equipo.map((mundo, index) => {
                const Icon = mundo.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="card-glass p-8 rounded-3xl border-2 border-white/10 hover:border-white/20 transition-all text-center"
                  >
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${mundo.color} mb-6 shadow-2xl`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">{mundo.nombre}</h3>
                    <div className="text-sm text-white/50 font-bold uppercase tracking-wider mb-4">{mundo.rol}</div>
                    <p className="text-white/70">{mundo.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-landing">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-glass p-12 rounded-3xl border-2 border-[#0ea5e9]/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/10 to-[#10b981]/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] mb-6">
                  <Rocket className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  ¿Listo para unirte?
                </h2>
                <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                  Más de 500 familias ya transformaron la relación de sus hijos con el aprendizaje.
                  <br />
                  Es tu turno.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <Link href="/register" className="btn-pulse">
                    Crear mi cuenta
                  </Link>
                  <Link href="/#mundos" className="btn-arrow">
                    Explorar los mundos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
