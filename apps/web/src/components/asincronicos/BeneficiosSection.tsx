'use client';

import { motion } from 'framer-motion';
import { Clock, Target, Repeat, Shield, TrendingUp, Users } from 'lucide-react';

const beneficios = [
  {
    icon: Clock,
    titulo: 'Sin horarios fijos',
    descripcion: '¿Tu hijo tiene fútbol los martes? ¿Prefiere estudiar los fines de semana? No hay problema. Accede cuando quiera, 24/7.',
    color: '#0ea5e9',
    gradient: 'from-[#0ea5e9]/20 to-[#0ea5e9]/5'
  },
  {
    icon: Target,
    titulo: 'Aprende a SU ritmo',
    descripcion: '¿Quiere avanzar más rápido? Puede. ¿Necesita repetir un tema? También. Sin presión, sin compararse con otros.',
    color: '#10b981',
    gradient: 'from-[#10b981]/20 to-[#10b981]/5'
  },
  {
    icon: Repeat,
    titulo: 'Repite cuantas veces quieras',
    descripcion: 'Acceso permanente a TODO el contenido. No hay vencimientos. Puede volver a ver las clases cuando necesite.',
    color: '#fbbf24',
    gradient: 'from-[#fbbf24]/20 to-[#fbbf24]/5'
  },
  {
    icon: Shield,
    titulo: 'Cero estrés para la familia',
    descripcion: 'No más carreras para llegar a clase a las 18hs. No más reorganizar toda la agenda. Se adapta a ustedes.',
    color: '#8b5cf6',
    gradient: 'from-[#8b5cf6]/20 to-[#8b5cf6]/5'
  },
  {
    icon: TrendingUp,
    titulo: 'Progreso visible en tiempo real',
    descripcion: 'Ves exactamente qué está aprendiendo, qué proyectos está haciendo, y cómo está avanzando.',
    color: '#f43f5e',
    gradient: 'from-[#f43f5e]/20 to-[#f43f5e]/5'
  },
  {
    icon: Users,
    titulo: 'Mismo contenido de calidad',
    descripcion: 'Los mismos profes, los mismos proyectos, la misma gamificación. Solo que en video y a demanda.',
    color: '#FF6B35',
    gradient: 'from-[#FF6B35]/20 to-[#FF6B35]/5'
  }
];

export default function BeneficiosSection() {
  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
            ¿Por qué <span className="title-gradient">asincrónico</span>?
          </h2>
          <p className="text-2xl text-white/70 max-w-3xl mx-auto">
            Porque <strong className="text-white">la vida de las familias</strong> no siempre encaja en un horario fijo
          </p>
        </motion.div>

        {/* Grid de beneficios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {beneficios.map((beneficio, index) => {
            const Icon = beneficio.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${beneficio.gradient} rounded-3xl blur-xl group-hover:blur-2xl transition-all`}
                />

                {/* Card */}
                <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all h-full">
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                      background: `linear-gradient(135deg, ${beneficio.color}20, ${beneficio.color}10)`
                    }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{ color: beneficio.color }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-black text-white mb-4">
                    {beneficio.titulo}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {beneficio.descripcion}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mensaje persuasivo final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/20 via-[#10b981]/20 to-[#fbbf24]/20 rounded-3xl blur-2xl" />
            <div className="relative bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center">
              <p className="text-2xl md:text-3xl text-white font-bold leading-relaxed mb-4">
                "Los cursos asincrónicos no son <em className="text-[#0ea5e9]">menos</em> que los sincrónicos"
              </p>
              <p className="text-xl text-white/70 leading-relaxed">
                Son <strong className="text-[#10b981]">DIFERENTES</strong>. Diseñados para familias que valoran la <strong className="text-[#fbbf24]">flexibilidad</strong> sin sacrificar la <strong className="text-[#f43f5e]">calidad</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
