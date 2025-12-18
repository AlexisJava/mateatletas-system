'use client';

import { motion } from 'framer-motion';

/**
 * LHC Collision: Colisión de partículas a 5.5 billones de °C
 * Recreando el Big Bang en un laboratorio
 */
export default function LHCCollision() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* Partícula izquierda (protón) acelerándose */}
      <motion.div
        className="absolute left-8 w-12 h-12 bg-blue-400 rounded-full"
        style={{
          boxShadow: '0 0 40px 20px rgba(96, 165, 250, 0.8)',
        }}
        animate={{
          x: [0, 400],
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeIn',
          repeatDelay: 1,
        }}
      />

      {/* Partícula derecha (protón) acelerándose */}
      <motion.div
        className="absolute right-8 w-12 h-12 bg-red-400 rounded-full"
        style={{
          boxShadow: '0 0 40px 20px rgba(248, 113, 113, 0.8)',
        }}
        animate={{
          x: [0, -400],
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeIn',
          repeatDelay: 1,
        }}
      />

      {/* Punto de colisión central */}
      <motion.div
        className="absolute w-20 h-20"
        animate={{
          scale: [0, 3, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          delay: 2,
          repeatDelay: 2.5,
        }}
      >
        <div
          className="w-full h-full bg-white rounded-full"
          style={{
            boxShadow: '0 0 100px 50px rgba(255, 255, 255, 1)',
          }}
        />
      </motion.div>

      {/* Explosión de energía (como starburst) */}
      {[...Array(24)].map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const distance = 180;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return (
          <motion.div
            key={i}
            className="absolute w-3 h-40 origin-bottom"
            style={{
              left: '50%',
              top: '50%',
              rotate: `${(i / 24) * 360}deg`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{
              scaleY: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 2,
              repeatDelay: 2.2,
              ease: 'easeOut',
            }}
          >
            <div className="w-full h-full bg-gradient-to-t from-yellow-400 via-orange-500 to-red-600" />
          </motion.div>
        );
      })}

      {/* Partículas subatómicas (quarks liberados) */}
      {[...Array(60)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 120 + Math.random() * 120;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#fbbf24', '#f59e0b', '#ea580c', '#dc2626'][
                Math.floor(Math.random() * 4)
              ],
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: [0, x],
              y: [0, y],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: 2 + Math.random() * 0.3,
              repeatDelay: 2,
              ease: 'easeOut',
            }}
          />
        );
      })}

      {/* Ondas de choque */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-48 h-48 border-4 border-white/60 rounded-full"
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{
            scale: [0, 4],
            opacity: [0.9, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 2 + i * 0.15,
            repeatDelay: 2,
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
        <div className="text-white text-3xl font-bold">5.5 BILLONES °C</div>
        <div className="text-white text-lg mt-2">300,000x más caliente que el Sol</div>
        <div className="text-white text-base mt-1">Dura 0.000000000001 segundos</div>
      </motion.div>
    </div>
  );
}
