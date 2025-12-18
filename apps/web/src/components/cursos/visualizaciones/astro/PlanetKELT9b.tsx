'use client';

import { motion } from 'framer-motion';

/**
 * KELT-9b Planet Visualization
 * Pure CSS + Framer Motion visualization of the hottest exoplanet
 *
 * Features:
 * - 4,300°C incandescent sphere
 * - Evaporating atmosphere with particles
 * - Heat shimmer effects
 * - Smooth rotation
 * - White/yellow/orange gradient
 */

export default function PlanetKELT9b() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Background glow */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(251,146,60,0.5) 0%, rgba(234,179,8,0.3) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main planet container */}
      <motion.div
        className="relative w-48 h-48 mb-4"
        animate={{ rotate: 360 }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Planet core - incandescent */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, #ffffff 0%, #fef08a 30%, #fbbf24 60%, #fb923c 100%)',
            boxShadow: `
              0 0 60px 20px rgba(255,255,255,0.8),
              0 0 100px 30px rgba(255,200,0,0.6),
              0 0 140px 40px rgba(255,140,0,0.4),
              inset -20px -20px 60px rgba(251,146,60,0.6)
            `,
          }}
        >
          {/* Heat shimmer overlay */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Hot spots */}
          <motion.div
            className="absolute top-1/4 left-1/3 w-16 h-16 rounded-full bg-white/60 blur-xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-12 h-12 rounded-full bg-yellow-100/40 blur-lg"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        </div>

        {/* Evaporating particles */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8;
          const delay = i * 0.4;
          const size = 2 + Math.random() * 2;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                background: i % 3 === 0 ? '#fff' : i % 3 === 1 ? '#fbbf24' : '#fb923c',
                filter: 'blur(2px)',
                left: '50%',
                top: '50%',
                marginLeft: '-1px',
                marginTop: '-1px',
              }}
              animate={{
                x: [0, Math.cos((angle * Math.PI) / 180) * 80],
                y: [0, Math.sin((angle * Math.PI) / 180) * 80],
                opacity: [0.7, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: delay,
              }}
            />
          );
        })}

        {/* Metallic vapor cloud */}
        <motion.div
          className="absolute -inset-8 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(251,146,60,0.3) 0%, rgba(234,179,8,0.2) 50%, transparent 70%)',
          }}
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Temperature indicator */}
      <motion.div
        className="text-3xl font-black font-mono text-white text-center"
        style={{
          textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,200,0,0.6)',
        }}
        animate={{
          textShadow: [
            '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,200,0,0.6)',
            '0 0 30px rgba(255,255,255,1), 0 0 60px rgba(255,200,0,0.8)',
            '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,200,0,0.6)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        4,300°C
      </motion.div>
    </div>
  );
}
