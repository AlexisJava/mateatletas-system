'use client';

import { motion } from 'framer-motion';

export default function FloatingGlass() {
  const glassParticles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 15 + 5,
    delay: Math.random() * 3,
    duration: Math.random() * 6 + 8,
  }));

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-300 overflow-hidden">
      {/* Bright background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-white via-transparent to-transparent opacity-50"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      {/* Kepler-7b planet */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-80 h-80 -ml-40 -mt-40 rounded-full bg-gradient-to-br from-white via-cyan-100 to-sky-200 shadow-2xl"
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            '0 0 80px rgba(255, 255, 255, 0.8)',
            '0 0 120px rgba(255, 255, 255, 1)',
            '0 0 80px rgba(255, 255, 255, 0.8)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />

      {/* Floating glass particles */}
      {glassParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white/60 backdrop-blur-sm rounded-lg shadow-lg"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.8), inset 0 0 10px rgba(6, 182, 212, 0.3)',
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Reflective light beams */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`beam-${i}`}
          className="absolute w-1 bg-gradient-to-b from-white via-cyan-200 to-transparent"
          style={{
            left: `${(i * 100) / 12}%`,
            top: 0,
            height: '100%',
            transformOrigin: 'top',
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scaleY: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Sparkles for extra reflection effect */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-3 h-3 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: 'blur(1px)',
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 text-slate-900 text-center bg-white/40 backdrop-blur-md rounded-lg p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
          Kepler-7b
        </h2>
        <p className="text-xl mb-2 font-semibold">Nubes de Polvo de Vidrio</p>
        <p className="text-2xl font-bold text-white">50% de reflectividad</p>
        <p className="text-lg mt-2">
          Partículas de silicato suspendidas reflejan la luz como un espejo
        </p>
      </motion.div>
    </div>
  );
}
