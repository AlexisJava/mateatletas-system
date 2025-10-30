'use client';

import { motion } from 'framer-motion';
import type { RecursosEstudiante, RachaEstudiante } from '@/types/gamificacion';
import { formatearNumero } from '@/lib/utils/gamificacion.utils';

interface ProgresoNivelProps {
  recursos: RecursosEstudiante & { racha: RachaEstudiante };
}

export function ProgresoNivel({ recursos }: ProgresoNivelProps) {
  const porcentaje = recursos.porcentaje_nivel || 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-white text-sm">
        <span className="font-medium">
          Nivel {recursos.nivel}
        </span>
        <span className="font-bold">
          {formatearNumero(recursos.xp_progreso || 0)} / {formatearNumero(recursos.xp_necesario || 0)} XP
        </span>
      </div>

      <div className="relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${porcentaje}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute inset-0 bg-white/30"
            animate={{ x: ['0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            style={{ width: '30%' }}
          />
        </motion.div>

        {/* Etiqueta de porcentaje */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs font-bold drop-shadow-lg">
            {porcentaje}%
          </span>
        </div>
      </div>

      <p className="text-white/70 text-xs text-center">
        {(recursos.xp_necesario || 0) - (recursos.xp_progreso || 0)} XP para nivel {recursos.nivel + 1}
      </p>
    </div>
  );
}
