'use client';

import { motion } from 'framer-motion';

export default function DiamondPlanet() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-black overflow-hidden">
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

      {/* Pulsar (neutron star) */}
      <motion.div
        className="absolute left-1/3 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500"
        animate={{
          boxShadow: [
            '0 0 40px rgba(6, 182, 212, 0.8)',
            '0 0 80px rgba(6, 182, 212, 1)',
            '0 0 40px rgba(6, 182, 212, 0.8)',
          ],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
        }}
      >
        {/* Pulsar magnetic field lines */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Radiation beams from pulsar */}
      <motion.div
        className="absolute left-1/3 top-1/2 -translate-y-1/2 w-full h-2 origin-left"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-transparent opacity-60" />
      </motion.div>

      <motion.div
        className="absolute left-1/3 top-1/2 -translate-y-1/2 w-full h-2 origin-left"
        animate={{
          rotate: [180, 540],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-transparent opacity-60" />
      </motion.div>

      {/* Orbital path */}
      <motion.div
        className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-2 border-dashed border-purple-500/30"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Diamond planet PSR J1719-1438 b */}
      <motion.div
        className="absolute left-1/3 top-1/2 -translate-y-1/2"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <motion.div
          className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-100 via-blue-200 to-purple-200"
          style={{
            marginLeft: '160px',
            boxShadow: '0 0 40px rgba(147, 197, 253, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.5)',
          }}
          animate={{
            boxShadow: [
              '0 0 40px rgba(147, 197, 253, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.5)',
              '0 0 60px rgba(147, 197, 253, 0.9), inset 0 0 50px rgba(255, 255, 255, 0.8)',
              '0 0 40px rgba(147, 197, 253, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.5)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {/* Diamond facets */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`facet-${i}`}
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(${i * 45}deg, rgba(255, 255, 255, 0.5), transparent)`,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}

          {/* Crystalline structure */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`line-${i}`}
              className="absolute top-1/2 left-1/2 w-full h-0.5 bg-white/40"
              style={{
                transformOrigin: 'center',
                transform: `rotate(${(i * 180) / 6}deg)`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Sparkles around diamond planet */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i * 360) / 20;
        return (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute left-1/3 top-1/2"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              style={{
                marginLeft: '200px',
                marginTop: `${Math.sin((angle * Math.PI) / 180) * 80}px`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          </motion.div>
        );
      })}

      {/* Orbit time indicator */}
      <motion.div
        className="absolute top-1/4 right-1/4 bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-cyan-400/30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white text-center">
          <span className="text-3xl font-bold text-white">2.2 horas</span>
          <br />
          <span className="text-sm text-white opacity-80">Órbita completa</span>
        </p>
      </motion.div>

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 text-white text-center bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
          PSR J1719-1438 b
        </h2>
        <p className="text-xl mb-2">Planeta de Diamante Orbitando un Pulsar</p>
        <div className="flex justify-center items-center gap-8 mt-4">
          <div>
            <p className="text-2xl font-bold text-white">5x Tierra</p>
            <p className="text-sm text-white opacity-80">Masa</p>
          </div>
          <div className="w-px h-12 bg-gray-600" />
          <div>
            <p className="text-2xl font-bold text-white">Cristalino</p>
            <p className="text-sm text-white opacity-80">Carbono puro</p>
          </div>
        </div>
        <p className="text-lg mt-4 text-white opacity-80">
          Ex-estrella compañera convertida en diamante gigante
        </p>
      </motion.div>

      {/* Pulsar label */}
      <motion.div
        className="absolute left-1/3 top-1/3 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-cyan-400/30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-white font-bold text-sm">Pulsar</p>
        <p className="text-white text-xs">Estrella de neutrones</p>
      </motion.div>
    </div>
  );
}
