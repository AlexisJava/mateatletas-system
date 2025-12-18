'use client';

import { motion } from 'framer-motion';

export default function DiamondStar() {
  const facets = [
    { angle: 0, size: 1 },
    { angle: 45, size: 0.9 },
    { angle: 90, size: 0.95 },
    { angle: 135, size: 0.85 },
    { angle: 180, size: 1 },
    { angle: 225, size: 0.9 },
    { angle: 270, size: 0.95 },
    { angle: 315, size: 0.85 },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-black overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 200 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Diamond star core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Main diamond sphere */}
        <motion.div
          className="relative w-96 h-96 rounded-full bg-gradient-to-br from-cyan-200 via-blue-100 to-indigo-200"
          animate={{
            boxShadow: [
              '0 0 100px rgba(147, 197, 253, 0.8), inset 0 0 80px rgba(255, 255, 255, 0.5)',
              '0 0 160px rgba(147, 197, 253, 1), inset 0 0 120px rgba(255, 255, 255, 0.8)',
              '0 0 100px rgba(147, 197, 253, 0.8), inset 0 0 80px rgba(255, 255, 255, 0.5)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          {/* Diamond facets */}
          {facets.map((facet, index) => (
            <motion.div
              key={`facet-${index}`}
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(${facet.angle}deg, rgba(255, 255, 255, 0.4), transparent)`,
                transform: `scale(${facet.size})`,
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}

          {/* Crystalline structure lines */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                transformOrigin: 'center',
                transform: `rotate(${(i * 360) / 12}deg)`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>

        {/* Sparkle effects */}
        {Array.from({ length: 30 }).map((_, i) => {
          const angle = (i * 360) / 30;
          const distance = 200 + Math.random() * 50;
          return (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-4 h-4 bg-white rounded-full"
              style={{
                left: '50%',
                top: '50%',
                x: Math.cos((angle * Math.PI) / 180) * distance,
                y: Math.sin((angle * Math.PI) / 180) * distance,
                filter: 'blur(2px)',
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          );
        })}
      </div>

      {/* Rainbow refraction */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-blue-500/10 to-purple-500/10"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 text-white text-center bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
          BPM 37093 "Lucy"
        </h2>
        <p className="text-xl mb-2">Estrella de Diamante Cristalino</p>
        <p className="text-2xl font-bold text-white">90% Carbono</p>
        <p className="text-lg mt-2 text-white opacity-80">
          Una enana blanca cristalizada de 10 mil millones de trillones de quilates
        </p>
      </motion.div>
    </div>
  );
}
