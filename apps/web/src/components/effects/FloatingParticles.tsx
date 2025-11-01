'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Particle {
  id: number;
  x: string;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
}

export function FloatingParticles({
  count = 30,
  colors = ['#00d9ff', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
  minSize = 4,
  maxSize = 12,
  minDuration = 10,
  maxDuration = 20,
}: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    const palette = colors.length > 0 ? colors : ['#ffffff'];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      size: Math.random() * (maxSize - minSize) + minSize,
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
      delay: Math.random() * 5,
      color: palette[Math.floor(Math.random() * palette.length)] ?? '#ffffff',
    }));
  }, [count, colors, minSize, maxSize, minDuration, maxDuration]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, ${particle.color}, transparent)`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          initial={{ y: '110vh', opacity: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
