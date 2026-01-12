'use client';

import { motion } from 'framer-motion';
import { ActivityCard } from './ActivityCard';
import { Clock, Star, TrendingUp } from 'lucide-react';

/**
 * Evaluación Card Component
 *
 * Card que muestra la evaluación o desafío del día.
 * Incluye:
 * - Nombre del desafío
 * - Descripción
 * - Puntos a ganar
 * - Tiempo estimado
 * - Dificultad
 */

interface EvaluacionCardProps {
  evaluacion?: {
    id: string;
    nombre: string;
    descripcion: string;
    puntos: number;
    tiempoEstimado: number; // en minutos
    dificultad: 'facil' | 'medio' | 'dificil';
  };
  onComenzar?: () => void;
  delay?: number;
}

const dificultadConfig = {
  facil: { label: 'Fácil', color: '#10b981', icon: '⭐' },
  medio: { label: 'Medio', color: '#f59e0b', icon: '⭐⭐' },
  dificil: { label: 'Difícil', color: 'var(--color-incorrect)', icon: '⭐⭐⭐' },
};

export function EvaluacionCard({ evaluacion, onComenzar, delay = 0 }: EvaluacionCardProps) {
  // Mock data si no hay evaluación
  const mockEvaluacion = {
    id: 'eval-1',
    nombre: 'Álgebra Rápida',
    descripcion: 'Resuelve 10 ecuaciones en tiempo récord',
    puntos: 50,
    tiempoEstimado: 5,
    dificultad: 'medio' as const,
  };

  const data = evaluacion || mockEvaluacion;
  const dif = dificultadConfig[data.dificultad];

  return (
    <ActivityCard
      title="EVALUACIÓN DEL DÍA"
      gradient="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
      icon="📝"
      delay={delay}
      action={
        onComenzar
          ? {
              label: '¡COMENZAR!',
              onClick: onComenzar,
              color: '#f59e0b',
            }
          : undefined
      }
    >
      {/* Nombre del desafío */}
      <div
        className="rounded-lg p-4 mb-3"
        style={{
          background: 'rgba(0,0,0,0.2)',
          border: '3px solid #000',
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-xl" style={{ textShadow: '1px 1px 0 #000' }}>
            {data.nombre}
          </h3>
          <span className="text-lg">{dif.icon}</span>
        </div>
        <p className="text-white/90 text-base font-medium">{data.descripcion}</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-2">
        {/* Puntos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.2 }}
          className="rounded-lg p-2 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid #000',
          }}
        >
          <Star className="w-5 h-5 mx-auto mb-1 text-yellow-300" fill="#fde047" />
          <p className="text-white font-bold text-sm" style={{ textShadow: '1px 1px 0 #000' }}>
            +{data.puntos} pts
          </p>
        </motion.div>

        {/* Tiempo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.3 }}
          className="rounded-lg p-2 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid #000',
          }}
        >
          <Clock className="w-5 h-5 mx-auto mb-1 text-cyan-300" />
          <p className="text-white font-bold text-sm" style={{ textShadow: '1px 1px 0 #000' }}>
            {data.tiempoEstimado} min
          </p>
        </motion.div>

        {/* Dificultad */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.4 }}
          className="rounded-lg p-2 text-center"
          style={{
            background: dif.color,
            border: '2px solid #000',
          }}
        >
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-white" />
          <p className="text-white font-bold text-sm" style={{ textShadow: '1px 1px 0 #000' }}>
            {dif.label}
          </p>
        </motion.div>
      </div>
    </ActivityCard>
  );
}
