'use client';

import { motion } from 'framer-motion';

export default function GreatAttractor() {
  const galaxies = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 30,
    distance: 150 + Math.random() * 200,
    size: Math.random() * 8 + 4,
  }));

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-black via-indigo-950 to-purple-950 overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 200 }).map((_, i) => (
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

      {/* The Great Attractor - mysterious invisible center */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        {/* Invisible gravitational anomaly visualization */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-900/40 to-transparent"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* Question mark for mystery */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.p
            className="text-6xl font-bold text-purple-400/60"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            ?
          </motion.p>
        </div>
      </motion.div>

      {/* Gravitational field rings */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-500/20"
          style={{
            width: `${100 + i * 80}px`,
            height: `${100 + i * 80}px`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Galaxies being pulled in */}
      {galaxies.map((galaxy) => (
        <motion.div
          key={galaxy.id}
          className="absolute left-1/2 top-1/2"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <motion.div
            className="absolute rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"
            style={{
              width: galaxy.size,
              height: galaxy.size,
              marginLeft: `${Math.cos((galaxy.angle * Math.PI) / 180) * galaxy.distance}px`,
              marginTop: `${Math.sin((galaxy.angle * Math.PI) / 180) * galaxy.distance}px`,
              boxShadow: '0 0 10px rgba(147, 51, 234, 0.6)',
            }}
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: galaxy.id * 0.1,
            }}
          />
        </motion.div>
      ))}

      {/* Flow lines showing gravitational pull */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        return (
          <motion.div
            key={`flow-${i}`}
            className="absolute left-1/2 top-1/2"
            style={{
              transformOrigin: '0 0',
              transform: `rotate(${angle}deg)`,
            }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-purple-400/60"
              style={{
                marginLeft: '400px',
              }}
              animate={{
                x: [0, -390],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          </motion.div>
        );
      })}

      {/* Spiral distortion effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 20%, rgba(88, 28, 135, 0.1) 50%, transparent 80%)',
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Velocity indicator */}
      <motion.div
        className="absolute top-12 right-12 bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-purple-400/30"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-white text-center">
          <span className="text-3xl font-bold text-white">600 km/s</span>
          <br />
          <span className="text-sm text-white opacity-80">Velocidad de atracción</span>
        </p>
      </motion.div>

      {/* Mystery labels */}
      <motion.div
        className="absolute top-12 left-12 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-white font-bold text-sm">INVISIBLE</p>
        <p className="text-white text-xs mt-1">Oscurecido por la Vía Láctea</p>
      </motion.div>

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 text-white text-center bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
          El Gran Atractor
        </h2>
        <p className="text-xl mb-2">Anomalía Gravitacional Misteriosa</p>
        <div className="flex justify-center items-center gap-8 mt-4">
          <div>
            <p className="text-2xl font-bold text-white">250 millones</p>
            <p className="text-sm text-white opacity-80">años luz de distancia</p>
          </div>
          <div className="w-px h-12 bg-gray-600" />
          <div>
            <p className="text-2xl font-bold text-white">Miles de galaxias</p>
            <p className="text-sm text-white opacity-80">siendo atraídas</p>
          </div>
        </div>
        <p className="text-lg mt-4 text-white opacity-80">
          Una fuerza gravitacional invisible que arrastra nuestra galaxia y miles más
        </p>
      </motion.div>

      {/* Distance scale */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        <p className="text-white text-xs whitespace-nowrap">Zona de Ocultamiento</p>
      </motion.div>
    </div>
  );
}
