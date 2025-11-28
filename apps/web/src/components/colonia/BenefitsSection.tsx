'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Award, Target, Users, BookOpen, Gamepad2, Shield } from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Gamepad2,
      title: 'Sistema de Gamificación',
      description:
        'XP doble de verano, insignias exclusivas, rankings semanales y avatares especiales.',
      color: '#f43f5e',
    },
    {
      icon: Award,
      title: 'Certificados Digitales',
      description:
        'Cada estudiante recibe un certificado digital verificable al completar el curso.',
      color: '#fbbf24',
    },
    {
      icon: Target,
      title: '80% Práctica / 20% Teoría',
      description: 'Método probado: aprenden haciendo, no solo escuchando. Proyectos reales.',
      color: '#10b981',
    },
    {
      icon: Users,
      title: 'Profesores Especializados',
      description: 'Docentes con experiencia real en cada área. No improvisamos.',
      color: '#0ea5e9',
    },
    {
      icon: BookOpen,
      title: 'Plataforma LMS Propia',
      description: 'Sistema de gestión de aprendizaje completo. Todo en un solo lugar.',
      color: '#8b5cf6',
    },
    {
      icon: Shield,
      title: 'Contenido Probado',
      description: 'Más de 500 estudiantes activos. Metodología que funciona.',
      color: '#ec4899',
    },
    {
      icon: Zap,
      title: 'Clases 100% En Vivo',
      description: 'Nada de videos pregrabados. Interacción real, dudas en el momento.',
      color: '#f97316',
    },
    {
      icon: Trophy,
      title: 'Grupos Reducidos',
      description: 'Máximo 10 estudiantes por curso. Atención personalizada garantizada.',
      color: '#06b6d4',
    },
  ];

  return (
    <section className="relative py-32 bg-black">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Trophy className="w-5 h-5 text-[#fbbf24]" />
            <span className="text-sm font-black text-white uppercase tracking-widest">
              Beneficios
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-6"
          >
            ¿POR QUÉ
            <br />
            <span className="title-gradient">MATEATLETAS?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mx-auto"
          >
            No es la escuela, es diversión pura. Aprendizaje real mientras se divierten.
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative card-glass rounded-2xl border-2 border-white/10 p-6 transition-all hover:border-white/30 hover:scale-105"
            >
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{
                  backgroundColor: `${benefit.color}20`,
                  border: `2px solid ${benefit.color}40`,
                }}
              >
                <benefit.icon className="w-8 h-8" style={{ color: benefit.color }} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-white mb-3 leading-tight">{benefit.title}</h3>

              {/* Description */}
              <p className="text-white/70 text-sm leading-relaxed">{benefit.description}</p>

              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${benefit.color}15 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 card-glass rounded-3xl border-2 border-white/10 p-8 max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '500+', label: 'Estudiantes Activos', sublabel: 'Comunidad creciente' },
              { number: '8', label: 'Semanas de Contenido', sublabel: 'Enero a Marzo' },
              { number: '90', label: 'Minutos por Clase', sublabel: 'Aprendizaje efectivo' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl md:text-6xl font-black text-white mb-2 title-gradient">
                  {stat.number}
                </div>
                <div className="text-lg font-bold text-white mb-1">{stat.label}</div>
                <div className="text-sm text-white/50">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
