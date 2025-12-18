'use client';

import { motion } from 'framer-motion';

export default function SuperEarth() {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-black via-orange-950 to-red-950 overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 55 Cancri e planet */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-orange-600 via-red-700 to-gray-900"
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 80px rgba(234, 88, 12, 0.8)',
            '0 0 120px rgba(234, 88, 12, 1)',
            '0 0 80px rgba(234, 88, 12, 0.8)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        {/* Lava flows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`lava-${i}`}
            className="absolute w-full h-8 rounded-full bg-gradient-to-r from-orange-500 via-red-600 to-orange-500"
            style={{
              top: `${i * 12}%`,
              opacity: 0.6,
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'linear',
            }}
          />
        ))}

        {/* Carbon crystalline patches */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`carbon-${i}`}
            className="absolute rounded-lg bg-gradient-to-br from-gray-700 to-black"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
            }}
            animate={{
              opacity: [0.5, 0.9, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Volcanic eruptions */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 360) / 6;
        return (
          <motion.div
            key={`volcano-${i}`}
            className="absolute left-1/2 top-1/2"
            style={{
              marginLeft: `${Math.cos((angle * Math.PI) / 180) * 180}px`,
              marginTop: `${Math.sin((angle * Math.PI) / 180) * 180}px`,
            }}
          >
            {Array.from({ length: 15 }).map((_, j) => (
              <motion.div
                key={`particle-${j}`}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600"
                animate={{
                  x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 80],
                  y: [0, -100 - j * 5],
                  opacity: [1, 0],
                  scale: [1, 0.3],
                }}
                transition={{
                  duration: 2 + j * 0.1,
                  repeat: Infinity,
                  delay: i * 0.5 + j * 0.05,
                }}
              />
            ))}
          </motion.div>
        );
      })}

      {/* Toxic atmosphere */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border-4 border-yellow-600/30"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, transparent 60%, rgba(234, 179, 8, 0.2) 100%)',
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Heat waves */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-400/20"
          style={{
            width: `${300 + i * 50}px`,
            height: `${300 + i * 50}px`,
          }}
          animate={{
            scale: [1, 1.3],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.8,
          }}
        />
      ))}

      {/* Mass comparison */}
      <motion.div
        className="absolute top-12 left-12 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-orange-400/30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <div>
            <div className="w-12 h-12 rounded-full bg-blue-500 mb-2" />
            <p className="text-white text-xs text-center">Tierra</p>
          </div>
          <p className="text-white text-2xl font-bold">{'<'}</p>
          <div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-600 to-red-700" />
            <p className="text-white text-xs text-center mt-2">55 Cancri e</p>
            <p className="text-white text-xs text-center">8x masa</p>
          </div>
        </div>
      </motion.div>

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 text-white text-center bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-gray-400">
          55 Cancri e
        </h2>
        <p className="text-xl mb-2">Super-Tierra con Océanos de Lava</p>
        <div className="flex justify-center items-center gap-8 mt-4">
          <div>
            <p className="text-2xl font-bold text-white">2,400°C</p>
            <p className="text-sm text-white opacity-80">Temperatura</p>
          </div>
          <div className="w-px h-12 bg-gray-600" />
          <div>
            <p className="text-2xl font-bold text-white">Lava de Carbono</p>
            <p className="text-sm text-white opacity-80">Océanos fundidos</p>
          </div>
          <div className="w-px h-12 bg-gray-600" />
          <div>
            <p className="text-2xl font-bold text-white">Tóxica</p>
            <p className="text-sm text-white opacity-80">Atmósfera</p>
          </div>
        </div>
      </motion.div>

      {/* Orbit indicator */}
      <motion.div
        className="absolute top-12 right-12 bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-red-400/30"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-white text-center">
          <span className="text-2xl font-bold text-white">18 horas</span>
          <br />
          <span className="text-sm text-white opacity-80">Órbita alrededor de su estrella</span>
        </p>
      </motion.div>
    </div>
  );
}
