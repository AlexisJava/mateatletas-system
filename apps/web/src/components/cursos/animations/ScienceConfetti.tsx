'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScienceConfettiProps {
  active?: boolean;
  duration?: number;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  rotation: number;
  delay: number;
  emoji: string;
  scale: number;
}

export default function ScienceConfetti({ active = false, duration = 3000 }: ScienceConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const emojis = [
      '⚛️',
      '🧬',
      '🔬',
      '🧪',
      '⚡',
      '💧',
      '🪐',
      '⭐',
      '🌙',
      '☄️',
      '🔭',
      '🧲',
      '🌟',
      '✨',
      '💫',
    ];
    const newParticles: Particle[] = [];

    // Create 50 particles exploding from center
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        angle: (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.5,
        distance: 300 + Math.random() * 400,
        rotation: Math.random() * 720,
        delay: Math.random() * 0.1,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        scale: 0.8 + Math.random() * 0.4,
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
                scale: [0, particle.scale * 1.5, particle.scale],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5 + Math.random() * 0.5,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              className="absolute text-4xl"
            >
              {particle.emoji}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
