'use client';

import { motion } from 'framer-motion';
import { useRecursos } from '@/hooks/useRecursos';
import { formatearNumero } from '@/lib/utils/gamificacion.utils';
import { ProgresoNivel } from './ProgresoNivel';

interface RecursosBarProps {
  estudianteId: string;
}

export function RecursosBar({ estudianteId }: RecursosBarProps) {
  const { data: recursos, isLoading } = useRecursos(estudianteId);

  if (isLoading || !recursos) {
    return (
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-4 animate-pulse">
        <div className="h-20 bg-white/20 rounded-xl"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between gap-6">
        {/* NIVEL */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-4 border-white">
              <span className="text-2xl font-black text-white">
                {recursos.nivel}
              </span>
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-xs">⚡</span>
            </motion.div>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Nivel</p>
            <p className="text-white text-xl font-bold">{recursos.nivel}</p>
          </div>
        </motion.div>

        {/* PROGRESO NIVEL */}
        <div className="flex-1">
          <ProgresoNivel recursos={recursos} />
        </div>

        {/* MONEDAS */}
        <motion.div
          className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3"
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
        >
          <div className="text-3xl">💰</div>
          <div>
            <p className="text-white/80 text-sm font-medium">Monedas</p>
            <p className="text-white text-xl font-bold">
              {formatearNumero(recursos.monedas_total)}
            </p>
          </div>
        </motion.div>

        {/* XP */}
        <motion.div
          className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3"
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
        >
          <div className="text-3xl">⚡</div>
          <div>
            <p className="text-white/80 text-sm font-medium">XP Total</p>
            <p className="text-white text-xl font-bold">
              {formatearNumero(recursos.xp_total)}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
