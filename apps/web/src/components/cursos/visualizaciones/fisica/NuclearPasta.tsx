'use client';

import { motion } from 'framer-motion';

export default function NuclearPasta() {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-purple-950 to-black overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 150 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Neutron star core */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 via-violet-800 to-indigo-900"
        animate={{
          boxShadow: [
            '0 0 80px rgba(139, 92, 246, 0.8)',
            '0 0 120px rgba(139, 92, 246, 1)',
            '0 0 80px rgba(139, 92, 246, 0.8)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      {/* Nuclear pasta layers */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex flex-col items-center justify-center">
        {/* Gnocchi phase (spheres) - outer layer */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '15%' }}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`gnocchi-${i}`}
                  className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600"
                  animate={{
                    scale: [1, 1.2, 1],
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-400/30">
              <p className="text-white font-bold text-sm">Fase Gnocchi</p>
              <p className="text-white text-xs">Esferas nucleares</p>
            </div>
          </div>
        </motion.div>

        {/* Spaghetti phase (rods) - middle layer */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '40%' }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-400/30">
              <p className="text-white font-bold text-sm">Fase Spaghetti</p>
              <p className="text-white text-xs">Cilindros elongados</p>
            </div>
            <div className="flex flex-col gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`spaghetti-${i}`}
                  className="w-32 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  animate={{
                    scaleX: [1, 1.1, 1],
                    x: [0, 10, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Lasagna phase (sheets) - inner layer */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '65%' }}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={`lasagna-${i}`}
                  className="w-40 h-3 rounded bg-gradient-to-r from-green-400 to-emerald-600"
                  animate={{
                    scaleY: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-400/30">
              <p className="text-white font-bold text-sm">Fase Lasagna</p>
              <p className="text-white text-xs">Láminas planas</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gravitational compression effect */}
      <motion.div
        className="absolute inset-0 border-4 border-purple-500/30 rounded-lg"
        animate={{
          scale: [1, 0.95, 1],
          borderColor: [
            'rgba(168, 85, 247, 0.3)',
            'rgba(168, 85, 247, 0.6)',
            'rgba(168, 85, 247, 0.3)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      {/* Info overlay */}
      <motion.div
        className="absolute top-8 left-8 right-8 text-white text-center bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-green-400">
          Pasta Nuclear
        </h2>
        <p className="text-xl mb-2">La Materia Más Fuerte del Universo</p>
        <p className="text-lg text-white opacity-80">
          En estrellas de neutrones: 10^17 kg/m³ de densidad
        </p>
      </motion.div>

      {/* Density indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-purple-400/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <p className="text-white text-center">
          <span className="text-2xl font-bold text-white">100 Billones</span>
          <br />
          <span className="text-sm text-white">de veces más fuerte que el acero</span>
        </p>
      </motion.div>
    </div>
  );
}
