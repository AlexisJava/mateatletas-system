'use client';

import { motion } from 'framer-motion';

export default function RoguePlanets() {
  const roguePlanets = [
    { id: 1, x: 20, y: 30, size: 60, speed: 40 },
    { id: 2, x: 60, y: 60, size: 80, speed: 55 },
    { id: 3, x: 35, y: 75, size: 50, speed: 35 },
  ];

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Very sparse distant stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.15,
            }}
            animate={{
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: Math.random() * 5 + 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Rogue planets floating in the void */}
      {roguePlanets.map((planet, index) => (
        <motion.div
          key={planet.id}
          className="absolute"
          style={{
            left: `${planet.x}%`,
            top: `${planet.y}%`,
            width: planet.size,
            height: planet.size,
          }}
          animate={{
            x: [0, -300, 0],
            y: [0, Math.sin(index) * 100, 0],
          }}
          transition={{
            duration: planet.speed,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Planet body - dark and cold */}
          <motion.div
            className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-slate-950 to-black"
            style={{
              boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.9)',
            }}
            animate={{
              boxShadow: [
                'inset 0 0 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(100, 100, 120, 0.1)',
                'inset 0 0 40px rgba(0, 0, 0, 0.9), 0 0 30px rgba(100, 100, 120, 0.15)',
                'inset 0 0 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(100, 100, 120, 0.1)',
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
            }}
          >
            {/* Faint surface features */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`feature-${i}`}
                  className="absolute rounded-full bg-gray-800"
                  style={{
                    left: `${Math.random() * 70}%`,
                    top: `${Math.random() * 70}%`,
                    width: `${Math.random() * 30 + 20}%`,
                    height: `${Math.random() * 30 + 20}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Frozen atmosphere indicator */}
          <motion.div
            className="absolute inset-0 rounded-full border border-blue-900/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: index * 1.5,
            }}
          />

          {/* Cold particle effect */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-blue-300/20 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 80],
                y: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 80],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 1.2,
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* No star indicator - empty space */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-24 h-24 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center mb-4"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <p className="text-4xl text-gray-700">☀</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-red-700/60 rotate-45" />
          </div>
        </motion.div>
        <p className="text-white text-sm">Sin estrella</p>
      </motion.div>

      {/* Loneliness indicators */}
      <motion.div
        className="absolute top-12 left-12 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-gray-800"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white font-bold text-sm mb-2">ESTADO</p>
        <p className="text-white text-xs">❄️ Congelados</p>
        <p className="text-white text-xs">🌑 Oscuridad eterna</p>
        <p className="text-white text-xs">🚀 A la deriva</p>
      </motion.div>

      {/* Temperature indicator */}
      <motion.div
        className="absolute top-12 right-12 bg-black/80 backdrop-blur-sm rounded-lg px-6 py-4 border border-blue-900/30"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3 }}
      >
        <p className="text-white text-center">
          <span className="text-3xl font-bold text-white">-230°C</span>
          <br />
          <span className="text-sm text-white opacity-80">Temperatura aproximada</span>
        </p>
      </motion.div>

      {/* Darkness effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/60 pointer-events-none"
        animate={{
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 text-white text-center bg-black/80 backdrop-blur-sm rounded-lg p-6 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-slate-400 to-gray-600">
          Planetas Huérfanos
        </h2>
        <p className="text-xl mb-2 text-white">Mundos Solitarios sin Estrella</p>
        <div className="flex justify-center items-center gap-8 mt-4">
          <div>
            <p className="text-2xl font-bold text-white">Miles de millones</p>
            <p className="text-sm text-white">en la Vía Láctea</p>
          </div>
          <div className="w-px h-12 bg-gray-700" />
          <div>
            <p className="text-2xl font-bold text-white">Oscuridad Total</p>
            <p className="text-sm text-white">Sin luz solar</p>
          </div>
          <div className="w-px h-12 bg-gray-700" />
          <div>
            <p className="text-2xl font-bold text-white">A la Deriva</p>
            <p className="text-sm text-white">Por la galaxia</p>
          </div>
        </div>
        <p className="text-lg mt-4 text-white">
          Expulsados de sus sistemas solares, vagan eternamente por el espacio interestelar
        </p>
      </motion.div>

      {/* Loneliness quote */}
      <motion.div
        className="absolute left-1/2 bottom-32 -translate-x-1/2 text-white italic text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        "Solos en la oscuridad del cosmos..."
      </motion.div>
    </div>
  );
}
