'use client';

import { motion } from 'framer-motion';

export default function MethaneLakes() {
  const raindrops = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: Math.random() * 15 + 20,
  }));

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-blue-950 to-slate-800 overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Titan moon */}
      <motion.div
        className="absolute left-1/2 bottom-0 w-[600px] h-[300px] -ml-[300px] rounded-t-full bg-gradient-to-t from-orange-900 via-amber-950 to-yellow-900 border-t-4 border-orange-700"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      {/* Methane lakes */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900 via-slate-700 to-transparent opacity-70"
        animate={{
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      />

      {/* Slow-falling methane rain */}
      {raindrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute w-1 h-8 bg-gradient-to-b from-transparent via-blue-400 to-blue-500 rounded-full opacity-60"
          style={{
            left: `${drop.x}%`,
            top: -40,
          }}
          animate={{
            y: ['0vh', '120vh'],
            opacity: [0, 0.8, 0.6, 0],
          }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            delay: drop.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Ripples in the lake */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`ripple-${i}`}
          className="absolute bottom-0 left-1/2 -ml-24 w-48 h-12 border-2 border-blue-400 rounded-full opacity-30"
          animate={{
            scale: [1, 2.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 1.5,
          }}
        />
      ))}

      {/* Mist/Fog */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-transparent via-blue-900/20 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      {/* Info overlay */}
      <motion.div
        className="absolute top-8 left-8 right-8 text-white text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-slate-300">
          Titán
        </h2>
        <p className="text-xl mb-2">Lluvia de Metano en Cámara Lenta</p>
        <p className="text-2xl font-bold text-white">-179°C</p>
        <p className="text-lg mt-2 opacity-80">
          Lagos de metano líquido y lluvia a 1/7 de la velocidad terrestre
        </p>
      </motion.div>
    </div>
  );
}
