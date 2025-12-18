'use client';

import { motion } from 'framer-motion';

/**
 * Vibrating Atoms Visualization
 * Representa átomos vibrando a alta temperatura
 * Átomos rojos muy pegados vibrando intensamente
 */

export default function VibratingAtoms() {
  // Generar posiciones de átomos en una grilla compacta
  const atoms = [];
  const rows = 6;
  const cols = 6;
  const spacing = 35; // Espaciado muy pequeño para que estén pegados

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      atoms.push({
        id: `atom-${row}-${col}`,
        baseX: col * spacing,
        baseY: row * spacing,
        delay: Math.random() * 0.5,
        vibrationIntensity: 8 + Math.random() * 6, // 8-14px de vibración
      });
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Glow background */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(220,38,38,0.2) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Átomos vibrando */}
      <div className="relative" style={{ width: cols * spacing, height: rows * spacing }}>
        {atoms.map((atom) => (
          <motion.div
            key={atom.id}
            className="absolute w-7 h-7 rounded-full"
            style={{
              left: atom.baseX,
              top: atom.baseY,
              background:
                'radial-gradient(circle at 30% 30%, #fca5a5 0%, #ef4444 50%, #b91c1c 100%)',
              boxShadow: `
                0 0 20px rgba(239, 68, 68, 0.8),
                0 0 40px rgba(239, 68, 68, 0.4),
                inset -3px -3px 8px rgba(185, 28, 28, 0.6)
              `,
            }}
            animate={{
              x: [
                0,
                (Math.random() - 0.5) * atom.vibrationIntensity,
                (Math.random() - 0.5) * atom.vibrationIntensity,
                (Math.random() - 0.5) * atom.vibrationIntensity,
                0,
              ],
              y: [
                0,
                (Math.random() - 0.5) * atom.vibrationIntensity,
                (Math.random() - 0.5) * atom.vibrationIntensity,
                (Math.random() - 0.5) * atom.vibrationIntensity,
                0,
              ],
              scale: [1, 1.1, 0.95, 1.05, 1],
            }}
            transition={{
              duration: 0.3 + Math.random() * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: atom.delay,
            }}
          >
            {/* Núcleo brillante */}
            <motion.div
              className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white/90"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: atom.delay,
              }}
            />
          </motion.div>
        ))}

        {/* Líneas de calor ondulantes */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`heat-${i}`}
            className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-red-400/40 to-transparent"
            style={{
              top: `${20 + i * 30}%`,
              left: 0,
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Temperatura indicator */}
      <motion.div
        className="mt-8 text-4xl font-black font-mono text-white"
        style={{
          textShadow: '0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.4)',
        }}
        animate={{
          textShadow: [
            '0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.4)',
            '0 0 30px rgba(239,68,68,1), 0 0 60px rgba(239,68,68,0.6)',
            '0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.4)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        ALTA TEMP
      </motion.div>

      {/* Partículas de energía escapando */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const distance = 120;

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-red-400"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos(angle) * distance],
              y: [0, Math.sin(angle) * distance],
              opacity: [0.8, 0],
              scale: [1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: i * 0.3,
            }}
          />
        );
      })}
    </div>
  );
}
