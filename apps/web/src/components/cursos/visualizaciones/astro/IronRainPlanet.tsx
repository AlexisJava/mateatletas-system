'use client';

import { motion } from 'framer-motion';

/**
 * WASP-76b: Lluvia de hierro fundido
 * Día 2,400°C / Noche 1,500°C - En el terminador llueve metal
 */
export default function IronRainPlanet() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-950 via-slate-900 to-blue-950">
      {/* Planeta dividido (día/noche) */}
      <div className="relative w-64 h-64 rounded-full overflow-hidden">
        {/* Lado del día (naranja brillante) */}
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-orange-600 to-red-700"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Lado de la noche (azul oscuro) */}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-950 to-slate-800" />

        {/* Línea del terminador (zona de transición) */}
        <div className="absolute inset-y-0 left-1/2 w-1 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600 blur-sm" />

        {/* Gotas de hierro fundido cayendo en el terminador */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-6 rounded-full bg-gradient-to-b from-yellow-400 via-orange-500 to-red-700"
            style={{
              left: `calc(50% - 20px + ${Math.random() * 40}px)`,
              top: '-10px',
              filter: 'blur(1px)',
              boxShadow: '0 0 10px 2px rgba(251, 146, 60, 0.6)',
            }}
            animate={{
              y: [0, 280],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeIn',
            }}
          />
        ))}

        {/* Vapor de hierro (calor emanando) */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`vapor-${i}`}
            className="absolute w-4 h-4 bg-orange-400/30 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: '10%',
              filter: 'blur(4px)',
            }}
            animate={{
              y: [0, -60],
              opacity: [0.6, 0],
              scale: [1, 1.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Indicador de temperaturas */}
      <motion.div
        className="absolute top-8 left-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="text-white text-xl font-bold">DÍA: 2,400°C</div>
        <div className="text-white text-xs mt-1">Hierro vaporizado</div>
      </motion.div>

      <motion.div
        className="absolute top-8 right-8 text-right"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="text-white text-xl font-bold">NOCHE: 1,500°C</div>
        <div className="text-white text-xs mt-1">Hierro condensado</div>
      </motion.div>

      {/* Texto superpuesto */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="text-white text-2xl font-bold">WASP-76b</div>
        <div className="text-white text-sm mt-2">Lluvia de hierro fundido</div>
        <div className="text-white text-xs mt-1">En el terminador día/noche</div>
      </motion.div>
    </div>
  );
}
