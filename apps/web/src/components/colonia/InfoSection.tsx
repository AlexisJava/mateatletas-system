'use client';

import { motion } from 'framer-motion';
import { Info, Calendar, Clock, Laptop, Gamepad2, CheckCircle } from 'lucide-react';

export default function InfoSection() {
  const features = [
    {
      icon: Laptop,
      title: 'Virtual Sincrónico',
      description: 'Clases en vivo por Google Meet. Desde la comodidad de tu casa.',
    },
    {
      icon: Calendar,
      title: 'Lunes a Jueves',
      description: 'Fines de semana LIBRES para disfrutar el verano al máximo.',
    },
    {
      icon: CheckCircle,
      title: 'Cursos Ilimitados',
      description: 'Elegí todos los cursos que quieras según tu disponibilidad.',
    },
    {
      icon: Clock,
      title: '90 Minutos',
      description: 'Duración perfecta: no se aburren, aprenden todo.',
    },
    {
      icon: Gamepad2,
      title: 'Gamificación Total',
      description: 'Puntos, rankings, badges y avatares exclusivos.',
    },
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-black to-[#0f0f1a]">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-6"
            >
              <Info className="w-5 h-5 text-[#0ea5e9]" />
              <span className="text-sm font-black text-white uppercase tracking-widest">
                Colonia Verano 2026
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white mb-6"
            >
              8 SEMANAS QUE
              <br />
              <span className="title-gradient">CAMBIAN TODO</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
            >
              No es la escuela. No son deberes. Es{' '}
              <strong className="text-white font-black">aprendizaje real</strong>{' '}
              mientras se divierten. Matemática, programación y ciencias como nunca antes.
            </motion.p>
          </div>

          {/* Features Grid - Layout 2-3 */}
          <div className="mb-16 space-y-6">
            {/* Primera fila: 2 cards centradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {features.slice(0, 2).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group card-glass rounded-2xl border-2 border-white/10 p-8 transition-all hover:border-[#0ea5e9]/50 hover:scale-105"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Segunda fila: 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.slice(2, 5).map((feature, index) => (
                <motion.div
                  key={index + 2}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (index + 2) * 0.1 }}
                  className="group card-glass rounded-2xl border-2 border-white/10 p-8 transition-all hover:border-[#0ea5e9]/50 hover:scale-105"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Big Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative card-glass rounded-3xl border-2 border-[#fbbf24]/30 p-12 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#fbbf24]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center">
              <div className="text-6xl md:text-8xl font-black text-white mb-6 leading-none">
                <span className="title-gradient">5 Enero 2026</span>
                <br />
                <span className="text-white/40 text-4xl md:text-6xl">al</span>
                <br />
                <span className="title-gradient">3 Marzo 2026</span>
              </div>

              <p className="text-2xl md:text-3xl text-white/80 font-bold max-w-2xl mx-auto leading-relaxed mb-8">
                8 semanas intensivas de aprendizaje que pueden{' '}
                <span className="text-[#fbbf24]">cambiar su año escolar</span>
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>Virtual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                  <span>En vivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
                  <span>Grupos reducidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                  <span>Certificados</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
