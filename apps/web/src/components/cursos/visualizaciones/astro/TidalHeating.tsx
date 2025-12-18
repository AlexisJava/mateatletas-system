'use client';

import { motion } from 'framer-motion';

export default function TidalHeating() {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-black via-indigo-950 to-slate-900 overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
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

      {/* Jupiter/Saturn (giant planet) */}
      <motion.div
        className="absolute left-1/4 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600"
        animate={{
          scale: [1, 1.02, 1],
          boxShadow: [
            '0 0 60px rgba(251, 146, 60, 0.6)',
            '0 0 80px rgba(251, 146, 60, 0.8)',
            '0 0 60px rgba(251, 146, 60, 0.6)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        {/* Planet bands */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`band-${i}`}
              className="absolute w-full h-4 bg-orange-700/30"
              style={{ top: `${i * 16}%` }}
            />
          ))}
        </div>
      </motion.div>

      {/* Europa/Enceladus (ice moon) */}
      <motion.div
        className="absolute right-1/4 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 via-cyan-200 to-blue-200"
        animate={{
          x: [0, -20, 0],
          y: [0, -10, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Ice cracks */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`crack-${i}`}
            className="absolute w-full h-0.5 bg-blue-400/60"
            style={{
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 180}deg)`,
              transformOrigin: 'left',
            }}
            animate={{
              scaleX: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Water geysers */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`geyser-${i}`}
            className="absolute"
            style={{
              left: `${25 + i * 20}%`,
              top: '10%',
            }}
          >
            {Array.from({ length: 10 }).map((_, j) => (
              <motion.div
                key={`particle-${j}`}
                className="absolute w-1 h-1 bg-cyan-300 rounded-full"
                animate={{
                  y: [0, -60 - j * 10],
                  x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + j * 0.1,
                  repeat: Infinity,
                  delay: i * 0.5 + j * 0.05,
                }}
              />
            ))}
          </motion.div>
        ))}
      </motion.div>

      {/* Gravitational tidal forces visualization */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.line
            key={`force-${i}`}
            x1="25%"
            y1="50%"
            x2="75%"
            y2="50%"
            stroke="rgba(168, 85, 247, 0.4)"
            strokeWidth="2"
            strokeDasharray="5,5"
            animate={{
              strokeOpacity: [0.2, 0.6, 0.2],
              y1: ['-2%', '2%', '-2%'],
              y2: ['-2%', '2%', '-2%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </svg>

      {/* Squeeze effect indicators */}
      <motion.div
        className="absolute right-1/4 top-1/2 -translate-y-1/2 w-32 h-32 border-4 border-purple-500/50 rounded-full pointer-events-none"
        animate={{
          scale: [1, 0.85, 1],
          borderColor: [
            'rgba(168, 85, 247, 0.5)',
            'rgba(168, 85, 247, 0.9)',
            'rgba(168, 85, 247, 0.5)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />

      {/* Heat indicators */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`heat-${i}`}
          className="absolute w-3 h-3 bg-orange-400 rounded-full"
          style={{
            right: '25%',
            top: '50%',
            marginRight: `${-16 + (Math.random() - 0.5) * 100}px`,
            marginTop: `${(Math.random() - 0.5) * 100}px`,
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Labels */}
      <motion.div
        className="absolute left-1/4 top-1/4 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-400/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-white font-bold text-sm">Júpiter/Saturno</p>
        <p className="text-white text-xs">Fuerza gravitacional</p>
      </motion.div>

      <motion.div
        className="absolute right-1/4 top-1/4 translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-cyan-400/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-white font-bold text-sm">Europa/Encélado</p>
        <p className="text-white text-xs">Calentamiento por marea</p>
      </motion.div>

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 text-white text-center bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-cyan-400">
          Calentamiento por Marea
        </h2>
        <p className="text-xl mb-2">Cuando la Gravedad Genera Calor</p>
        <p className="text-lg text-white opacity-80">
          Las fuerzas de marea comprimen y estiran las lunas, generando fricción y calor interno
        </p>
      </motion.div>
    </div>
  );
}
