'use client';

import { motion } from 'framer-motion';

export default function GemClouds() {
  const gems = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    type: i % 2 === 0 ? 'ruby' : 'sapphire',
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 12,
  }));

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* HAT-P-7b planet */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-64 h-64 -ml-32 -mt-32 rounded-full bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 shadow-2xl"
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 60px rgba(139, 92, 246, 0.6)',
            '0 0 100px rgba(139, 92, 246, 0.9)',
            '0 0 60px rgba(139, 92, 246, 0.6)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />

      {/* Floating gems */}
      {gems.map((gem) => (
        <motion.div
          key={gem.id}
          className={`absolute rounded-lg ${
            gem.type === 'ruby'
              ? 'bg-gradient-to-br from-red-500 to-pink-600'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          }`}
          style={{
            left: `${gem.x}%`,
            top: `${gem.y}%`,
            width: gem.size,
            height: gem.size,
            boxShadow: `0 0 ${gem.size}px ${
              gem.type === 'ruby' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)'
            }`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: gem.duration,
            repeat: Infinity,
            delay: gem.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Sparkles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 text-white text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-blue-400">
          HAT-P-7b
        </h2>
        <p className="text-xl mb-2">Nubes de Rubíes y Zafiros</p>
        <p className="text-2xl font-bold text-white">2,860°C</p>
        <p className="text-lg mt-2 opacity-80">Gemas preciosas flotando en la atmósfera</p>
      </motion.div>
    </div>
  );
}
