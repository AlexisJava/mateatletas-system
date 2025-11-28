'use client';

import { motion } from 'framer-motion';
import { Calendar, UserPlus, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';

interface HowToEnrollSectionProps {
  onInscribe: () => void;
}

export default function HowToEnrollSection({ onInscribe }: HowToEnrollSectionProps) {
  const steps = [
    {
      number: 1,
      icon: Calendar,
      title: 'Explorá los Cursos',
      description:
        'Mirá el calendario arriba y elegí los horarios que mejor se adapten a tu familia.',
      color: '#10b981',
    },
    {
      number: 2,
      icon: UserPlus,
      title: 'Completá el Formulario',
      description: 'Ingresá tus datos como tutor y los datos de cada hijo que quieras inscribir.',
      color: '#0ea5e9',
    },
    {
      number: 3,
      icon: CheckCircle,
      title: 'Seleccioná Cursos',
      description:
        'Para cada hijo, elegí todos los cursos que quieras. Sin límites, sin restricciones.',
      color: '#fbbf24',
    },
    {
      number: 4,
      icon: CreditCard,
      title: 'Pagá con MercadoPago',
      description:
        'Recibís un link de pago seguro. Una vez pagado, la inscripción queda confirmada automáticamente.',
      color: '#f43f5e',
    },
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-[#1a1a2e] to-black">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-6"
            >
              <CheckCircle className="w-5 h-5 text-[#10b981]" />
              <span className="text-sm font-black text-white uppercase tracking-widest">
                Inscripción Simple
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6"
            >
              ¿CÓMO
              <br />
              <span className="title-gradient">INSCRIBIRSE?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto"
            >
              En 4 pasos simples tenés asegurado el lugar de tus hijos en la mejor colonia de
              verano.
            </motion.p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Connector Arrow (desktop only, not on last item of each row) */}
                {index % 2 === 0 && index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                )}

                <div className="card-glass rounded-2xl border-2 border-white/10 p-8 h-full transition-all hover:border-white/20 hover:scale-[1.02]">
                  {/* Step Number Badge */}
                  <div className="flex items-start gap-6 mb-6">
                    <div
                      className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                      }}
                    >
                      {step.number}
                    </div>

                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <step.icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-black text-white mb-3">{step.title}</h3>
                  <p className="text-white/70 leading-relaxed">{step.description}</p>

                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at center, ${step.color}15 0%, transparent 70%)`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative card-glass rounded-3xl border-2 border-[#10b981]/30 p-8 md:p-12 overflow-hidden text-center"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#10b981]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                ¿Listo para inscribir a tus hijos?
              </h3>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Los cupos son limitados. Asegurá su lugar ahora.
              </p>

              {/* Botón de Inscripción */}
              <button
                onClick={onInscribe}
                className="px-10 py-5 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-2xl text-white font-black text-xl uppercase tracking-wider transition-all hover:scale-110 hover:shadow-2xl shadow-[#10b981]/50 mb-8"
              >
                ABRIR FORMULARIO DE INSCRIPCIÓN
              </button>

              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>Inscripción en minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                  <span>Pago 100% seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
                  <span>Confirmación automática</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
