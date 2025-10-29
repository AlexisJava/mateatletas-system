/**
 * LABORATORIO MÁGICO - ECOSISTEMA LEARNDASH STYLE
 * Dashboard interactivo donde los estudiantes trabajan en sus actividades de química
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, FlaskRound, BookOpen, Trophy, Star, Clock } from 'lucide-react';
import { useOverlayStack } from '../../contexts/OverlayStackProvider';
import { useState } from 'react';

export interface LaboratorioEcosistemaProps {
  semanaId: string;
}

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'leccion' | 'experimento' | 'quiz' | 'desafio';
  duracion: string;
  estrellas: number;
  completada: boolean;
  bloqueada: boolean;
}

const ACTIVIDADES_QUIMICA: Actividad[] = [
  {
    id: 'intro-quimica',
    titulo: 'Introducción a la Química',
    descripcion: 'Aprende qué es la química y cómo nos rodea en el día a día',
    tipo: 'leccion',
    duracion: '10 min',
    estrellas: 0,
    completada: false,
    bloqueada: false,
  },
  {
    id: 'experimento-acidos',
    titulo: 'Experimento: Ácidos y Bases',
    descripcion: 'Descubre cómo identificar ácidos y bases con indicadores',
    tipo: 'experimento',
    duracion: '15 min',
    estrellas: 0,
    completada: false,
    bloqueada: false,
  },
  {
    id: 'quiz-elementos',
    titulo: 'Quiz: Elementos Químicos',
    descripcion: 'Pon a prueba tu conocimiento sobre la tabla periódica',
    tipo: 'quiz',
    duracion: '8 min',
    estrellas: 0,
    completada: false,
    bloqueada: false,
  },
  {
    id: 'desafio-reacciones',
    titulo: 'Desafío: Reacciones Químicas',
    descripcion: 'Balancea ecuaciones químicas y crea reacciones asombrosas',
    tipo: 'desafio',
    duracion: '20 min',
    estrellas: 0,
    completada: false,
    bloqueada: false,
  },
];

const TIPO_ICONS = {
  leccion: BookOpen,
  experimento: FlaskRound,
  quiz: Star,
  desafio: Trophy,
};

const TIPO_COLORS = {
  leccion: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    glow: 'rgba(59, 130, 246, 0.6)',
    accent: '#3b82f6',
  },
  experimento: {
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    glow: 'rgba(16, 185, 129, 0.6)',
    accent: '#10b981',
  },
  quiz: {
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.4)',
    glow: 'rgba(251, 191, 36, 0.6)',
    accent: '#fbbf24',
  },
  desafio: {
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    glow: 'rgba(168, 85, 247, 0.6)',
    accent: '#a855f7',
  },
};

function ActividadCard({ actividad, index }: { actividad: Actividad; index: number }) {
  const Icon = TIPO_ICONS[actividad.tipo];
  const colors = TIPO_COLORS[actividad.tipo];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-pointer"
    >
      <motion.div
        className="relative backdrop-blur-xl rounded-2xl p-6 border overflow-hidden"
        style={{
          background: colors.bg,
          borderColor: colors.border,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        }}
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Glow effect on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 -z-10 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle at 50% 50%, ${colors.glow}, transparent 70%)`,
            }}
          />
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: colors.accent,
              boxShadow: `0 4px 16px ${colors.glow}`,
            }}
          >
            <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3
              className="text-white font-bold text-lg mb-1"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
              }}
            >
              {actividad.titulo}
            </h3>
            <p
              className="text-white/70 text-sm mb-3"
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
              }}
            >
              {actividad.descripcion}
            </p>

            {/* Footer: Duración + Estrellas */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-white/60 text-sm font-medium">{actividad.duracion}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < actividad.estrellas ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Arrow indicator */}
          <motion.div
            className="flex-shrink-0"
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-lg">→</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LaboratorioEcosistema({ semanaId }: LaboratorioEcosistemaProps) {
  const { pop } = useOverlayStack();

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Background verde químico */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 50%, #065f46 75%, #064e3b 100%)',
        }}
      />

      {/* Ambient grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Header */}
      <header
        className="relative h-24 backdrop-blur-2xl border-b px-10 flex items-center justify-between"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        }}
      >
        <button
          onClick={pop}
          className="group flex items-center gap-3 backdrop-blur-xl rounded-2xl px-7 py-3.5 border transition-all duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
          <span className="font-bold text-white text-sm uppercase tracking-wider">Volver</span>
        </button>

        <div className="text-center">
          <h1
            className="font-[family-name:var(--font-lilita)] text-5xl text-white tracking-wide uppercase mb-1"
            style={{
              textShadow: '0 4px 20px rgba(16, 185, 129, 0.4), 0 2px 8px rgba(0, 0, 0, 0.6)',
              letterSpacing: '0.05em',
            }}
          >
            🧪 LABORATORIO MÁGICO
          </h1>
          <p
            className="text-emerald-300 text-sm font-bold uppercase tracking-widest"
            style={{
              textShadow: '0 2px 8px rgba(16, 185, 129, 0.5)',
            }}
          >
            Química y Experimentos
          </p>
        </div>

        <div className="w-32" />
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-10 py-10">
        <div className="max-w-5xl mx-auto">
          {/* Progress overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl rounded-3xl p-8 mb-8 border"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-white font-bold text-2xl mb-2"
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  Tu Progreso
                </h2>
                <p className="text-white/70 text-sm">0 de 4 actividades completadas</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black text-white mb-1">0%</div>
                <div className="flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-white/30" />
                  ))}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                initial={{ width: '0%' }}
                animate={{ width: '0%' }}
                style={{
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
                }}
              />
            </div>
          </motion.div>

          {/* Actividades list */}
          <div className="space-y-4">
            <h3
              className="text-white font-bold text-xl mb-4"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
              }}
            >
              Actividades Disponibles
            </h3>
            {ACTIVIDADES_QUIMICA.map((actividad, index) => (
              <ActividadCard key={actividad.id} actividad={actividad} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
