'use client';

import { motion } from 'framer-motion';

/**
 * WASP-121b: Planeta deformado en forma de balón de rugby
 * perdiendo atmósfera hacia su estrella
 */
export default function PlanetWASP121b() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* Planeta deformado (forma de balón de rugby) */}
      <motion.div
        className="relative"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Cuerpo principal del planeta - deformado */}
        <div className="relative w-64 h-80">
          <motion.div
            className="absolute inset-0 rounded-[50%] bg-gradient-to-br from-orange-600 via-red-600 to-orange-800"
            style={{
              filter: 'blur(2px)',
            }}
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Nubes metálicas (hierro y magnesio vaporizados) */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-8 bg-slate-400/40 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 80}%`,
                filter: 'blur(4px)',
              }}
              animate={{
                x: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Cola de atmósfera escapando (como cometa) */}
        <motion.div
          className="absolute -right-32 top-1/2 -translate-y-1/2 w-48 h-24"
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scaleX: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Gradiente de atmósfera escapando */}
          <div
            className="w-full h-full bg-gradient-to-r from-orange-500/60 via-red-500/40 to-transparent rounded-r-full"
            style={{ filter: 'blur(8px)' }}
          />

          {/* Partículas escapando */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-orange-400/60 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 60, 120],
                opacity: [0.8, 0.4, 0],
                scale: [1, 0.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Texto superpuesto */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="text-white text-2xl font-bold">WASP-121b</div>
        <div className="text-white text-sm mt-2">Se desintegra a 2,500°C</div>
        <div className="text-white text-xs mt-1">Pierde 3M ton/segundo</div>
      </motion.div>
    </div>
  );
}
