'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MathConfettiProps {
  active?: boolean;
  duration?: number;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  rotation: number;
  delay: number;
  symbol: string;
  color: string;
}

export default function MathConfetti({ active = false, duration = 3000 }: MathConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const symbols = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '+',
      '-',
      '×',
      '÷',
      '=',
      '%',
      '$',
      '€',
      '∑',
      '√',
      '∞',
      'π',
      '±',
    ];
    const colors = ['#f97316', '#f59e0b', '#eab308', '#fb923c', '#fbbf24'];
    const newParticles: Particle[] = [];

    // Create 60 particles exploding from center
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        angle: (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.5,
        distance: 300 + Math.random() * 400,
        rotation: Math.random() * 720,
        delay: Math.random() * 0.1,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration]);

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <AnimatePresence>
        {particles.map((particle) => {
          const endX = Math.cos(particle.angle) * particle.distance;
          const endY = Math.sin(particle.angle) * particle.distance;

          return (
            <motion.div
              key={particle.id}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                rotate: 0,
                scale: 0,
              }}
              animate={{
                x: endX,
                y: endY,
                rotate: particle.rotation,
                opacity: [1, 1, 0],
                scale: [0, 1.5, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5 + Math.random() * 0.5,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              className="absolute text-4xl font-bold"
              style={{ color: particle.color }}
            >
              {particle.symbol}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
