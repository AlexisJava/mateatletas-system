'use client';

import { motion } from 'framer-motion';

/**
 * Nebulosa Boomerang: El lugar más frío del universo (-272°C)
 * Gas expandiéndose a 600,000 km/h, cristales de hielo congelados
 */
export default function NebulaBoomerang() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* Núcleo central (estrella moribunda) */}
      <motion.div
        className="absolute w-6 h-6 bg-cyan-200 rounded-full"
        style={{
          boxShadow: '0 0 20px 10px rgba(103, 232, 249, 0.3)',
        }}
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Gas expandiéndose en forma de arco (boomerang) */}
      <motion.div
        className="absolute w-96 h-96"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Arco superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32">
          <motion.div
            className="w-full h-full rounded-t-full bg-gradient-to-b from-cyan-900/60 via-blue-900/40 to-transparent"
            style={{
              filter: 'blur(12px)',
            }}
            animate={{
              scaleY: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Arco inferior */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32">
          <motion.div
            className="w-full h-full rounded-b-full bg-gradient-to-t from-cyan-900/60 via-blue-900/40 to-transparent"
            style={{
              filter: 'blur(12px)',
            }}
            animate={{
              scaleY: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2.5,
            }}
          />
        </div>
      </motion.div>

      {/* Cristales de hielo (partículas congeladas) */}
      {[...Array(80)].map((_, i) => {
        const angle = (i / 80) * Math.PI * 2;
        const distance = 80 + Math.random() * 120;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300 rounded-full"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              boxShadow: '0 0 4px 2px rgba(103, 232, 249, 0.4)',
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* Ondas de expansión (gas moviéndose a 600,000 km/h) */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-32 border-2 border-cyan-500/30 rounded-full"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{
            scale: [0, 3],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: i * 2,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Texto superpuesto */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="text-white text-2xl font-bold">-272°C</div>
        <div className="text-white text-sm mt-2">1° sobre el cero absoluto</div>
        <div className="text-white text-xs mt-1">Más frío que el vacío del espacio</div>
      </motion.div>
    </div>
  );
}
