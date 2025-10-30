'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

const ParticleField = memo(() => {
  const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Partículas de energía flotantes */}
      {[...Array(50)].map((_, i) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomDuration = 8 + Math.random() * 10;
        const randomDelay = Math.random() * 10;
        const xMovement = (Math.random() - 0.5) * 60;
        const yMovement = (Math.random() - 0.5) * 60;

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: '5px',
              height: '5px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: randomColor,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.4, 0.8, 0.3],
              scale: [1, 1.3, 1.5, 1.2, 1],
              boxShadow: [
                `0 0 8px ${randomColor}`,
                `0 0 15px ${randomColor}`,
                `0 0 20px ${randomColor}`,
                `0 0 12px ${randomColor}`,
                `0 0 8px ${randomColor}`,
              ],
              x: [0, xMovement, 0],
              y: [0, yMovement, 0],
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* Líneas de campo magnético */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`field-line-${i}`}
          className="absolute h-px"
          style={{
            width: `${100 + Math.random() * 200}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent)`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scaleX: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});

ParticleField.displayName = 'ParticleField';

export default ParticleField;
