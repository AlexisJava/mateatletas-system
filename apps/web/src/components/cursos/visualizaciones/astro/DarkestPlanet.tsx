'use client';

import { motion } from 'framer-motion';

export default function DarkestPlanet() {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Very dim stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* TrES-2b - The darkest planet */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-gray-950 via-black to-gray-950"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.9)',
        }}
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      >
        {/* Very faint red glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-red-950/30 via-transparent to-transparent"
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />

        {/* Subtle heat signature */}
        <motion.div
          className="absolute inset-8 rounded-full border border-red-900/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Absorption visualization - light rays being absorbed */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16;
        return (
          <motion.div
            key={`ray-${i}`}
            className="absolute left-1/2 top-1/2"
            style={{
              transformOrigin: '0 0',
              transform: `rotate(${angle}deg)`,
            }}
          >
            <motion.div
              className="w-1 h-32 bg-gradient-to-b from-yellow-200/20 to-transparent"
              animate={{
                scaleY: [1, 0.3],
                opacity: [0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          </motion.div>
        );
      })}

      {/* Void effect - darker ring around planet */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.8) 100%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      />

      {/* Minimal red glow particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute left-1/2 top-1/2 w-2 h-2 bg-red-900/40 rounded-full"
          style={{
            marginLeft: `${(Math.random() - 0.5) * 200}px`,
            marginTop: `${(Math.random() - 0.5) * 200}px`,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.6,
          }}
        />
      ))}

      {/* Comparison - Coal visualization */}
      <motion.div
        className="absolute top-1/4 right-12 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-gray-800"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg" />
          <div className="text-white">
            <p className="text-sm font-bold">Carbón</p>
            <p className="text-xs text-white">Refleja ~4% luz</p>
          </div>
        </div>
      </motion.div>

      {/* TrES-2b comparison */}
      <motion.div
        className="absolute top-1/2 right-12 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-red-900/30"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black border border-red-900/40" />
          <div className="text-white">
            <p className="text-sm font-bold">TrES-2b</p>
            <p className="text-xs text-white">Refleja {'<'}1% luz</p>
          </div>
        </div>
      </motion.div>

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 text-white text-center bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-red-900 to-gray-700">
          TrES-2b
        </h2>
        <p className="text-xl mb-2">El Planeta Más Oscuro del Universo</p>
        <div className="flex justify-center items-center gap-8 mt-4">
          <div>
            <p className="text-2xl font-bold text-white">99%</p>
            <p className="text-sm text-white opacity-80">Absorción de luz</p>
          </div>
          <div className="w-px h-12 bg-gray-700" />
          <div>
            <p className="text-2xl font-bold text-white">1,100°C</p>
            <p className="text-sm text-white opacity-80">Temperatura</p>
          </div>
        </div>
        <p className="text-lg mt-4 text-white opacity-80">
          Más oscuro que el carbón, absorbe casi toda la luz que lo alcanza
        </p>
      </motion.div>

      {/* Darkness percentage indicator */}
      <motion.div
        className="absolute top-8 left-8 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-gray-800"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-white text-center">
          <span className="text-sm text-white opacity-60">Albedo</span>
          <br />
          <span className="text-3xl font-bold text-white">&lt;1%</span>
        </p>
      </motion.div>
    </div>
  );
}
