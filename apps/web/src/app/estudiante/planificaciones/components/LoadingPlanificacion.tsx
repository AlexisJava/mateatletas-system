/**
 * Loading state para carga de planificaciones
 */

'use client';

import { motion } from 'framer-motion';

export function LoadingPlanificacion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-8 border-white/20 border-t-white rounded-full"
          />
        </div>

        {/* Texto */}
        <h2 className="text-white text-2xl font-black mb-2">Cargando aventura científica...</h2>
        <p className="text-white/70 text-lg font-medium">Preparando experimentos y actividades</p>

        {/* Puntos animados */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-white/60 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
