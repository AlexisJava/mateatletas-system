'use client';

import { motion } from 'framer-motion';

/**
 * HD 189733b: Lluvia de vidrio horizontal a 7,000 km/h
 * Vientos supersónicos que hacen volar el vidrio como balas
 */
export default function GlassRainPlanet() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-950 to-slate-900">
      {/* Planeta azul oscuro */}
      <motion.div
        className="relative w-56 h-56 rounded-full bg-gradient-to-br from-blue-700 via-blue-900 to-slate-800"
        style={{
          boxShadow: '0 0 60px 20px rgba(29, 78, 216, 0.3)',
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Bandas atmosféricas turbulentas */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-8 bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"
            style={{
              top: `${i * 12}%`,
            }}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1 + Math.random(),
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* Fragmentos de vidrio volando horizontal (supersónicos) */}
      {[...Array(30)].map((_, i) => {
        const startY = Math.random() * 100;

        return (
          <motion.div
            key={i}
            className="absolute w-12 h-1 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
            style={{
              top: `${startY}%`,
              left: '-20%',
              rotate: `${-10 + Math.random() * 20}deg`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              x: ['0%', '140%'],
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'linear',
            }}
          />
        );
      })}

      {/* Partículas de vidrio más pequeñas (destellos) */}
      {[...Array(50)].map((_, i) => {
        const startY = Math.random() * 100;

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-200 rounded-full"
            style={{
              top: `${startY}%`,
              left: '-10%',
            }}
            animate={{
              x: ['0%', '120%'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.6 + Math.random() * 0.3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        );
      })}

      {/* Indicador de velocidad de viento */}
      <motion.div
        className="absolute top-8 right-8 text-right"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="text-white text-xl font-bold">7,000 km/h</div>
        <div className="text-white text-xs">Vientos supersónicos</div>
      </motion.div>

      {/* Texto superpuesto */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="text-white text-2xl font-bold">HD 189733b</div>
        <div className="text-white text-sm mt-2">Lluvia de vidrio horizontal</div>
        <div className="text-white text-xs mt-1">Como balas de cristal</div>
      </motion.div>
    </div>
  );
}
