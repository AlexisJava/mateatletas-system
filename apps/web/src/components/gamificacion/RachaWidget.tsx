'use client';

import { motion } from 'framer-motion';
import { useRacha } from '@/hooks/useRecursos';
import { estaEnRiesgoRacha } from '@/lib/utils/gamificacion.utils';

interface RachaWidgetProps {
  estudianteId: string;
}

export function RachaWidget({ estudianteId }: RachaWidgetProps) {
  const { data: racha, isLoading } = useRacha(estudianteId);

  if (isLoading || !racha) {
    return (
      <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 animate-pulse">
        <div className="h-24 bg-white/20 rounded-xl"></div>
      </div>
    );
  }

  const enRiesgo = estaEnRiesgoRacha(racha.ultima_actividad);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl p-6 shadow-xl ${
        enRiesgo
          ? 'bg-gradient-to-br from-red-500 to-orange-600'
          : 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500'
      }`}
    >
      {/* Llamas animadas de fondo */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 text-6xl"
            style={{ left: `${i * 20}%` }}
            animate={{
              y: [0, -100],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
          >
            🔥
          </motion.div>
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🔥
            </motion.span>
            <h3 className="text-white font-bold text-lg">Racha de Fuego</h3>
          </div>
          {enRiesgo && (
            <motion.span
              className="bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              ⚠️ ¡En riesgo!
            </motion.span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Racha actual */}
          <div className="text-center">
            <motion.div
              className="text-5xl font-black text-white mb-1"
              key={racha.racha_actual}
              initial={{ scale: 1.5, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#ffffff' }}
            >
              {racha.racha_actual}
            </motion.div>
            <p className="text-white/80 text-sm font-medium">Días actuales</p>
          </div>

          {/* Racha máxima */}
          <div className="text-center border-x border-white/20">
            <div className="text-3xl font-bold text-white mb-1">{racha.racha_maxima}</div>
            <p className="text-white/80 text-sm font-medium">Récord</p>
          </div>

          {/* Total días */}
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{racha.total_dias_activos}</div>
            <p className="text-white/80 text-sm font-medium">Total días</p>
          </div>
        </div>

        {enRiesgo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-yellow-300/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-300/30"
          >
            <p className="text-white text-sm font-medium text-center">
              ⏰ ¡Completa un ejercicio hoy para mantener tu racha!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
