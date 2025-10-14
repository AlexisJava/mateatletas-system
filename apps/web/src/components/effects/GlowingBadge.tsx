'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowingBadgeProps {
  children: ReactNode;
  color?: 'gold' | 'blue' | 'purple' | 'pink' | 'green';
  intensity?: 'low' | 'medium' | 'high';
  pulse?: boolean;
}

const colorMap = {
  gold: {
    bg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    shadow: 'rgba(255, 215, 0, 0.6)',
    glow: '#FFD700',
  },
  blue: {
    bg: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    shadow: 'rgba(0, 217, 255, 0.6)',
    glow: '#00D9FF',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-400 to-pink-500',
    shadow: 'rgba(139, 92, 246, 0.6)',
    glow: '#8B5CF6',
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-400 to-rose-500',
    shadow: 'rgba(236, 72, 153, 0.6)',
    glow: '#EC4899',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-400 to-emerald-500',
    shadow: 'rgba(74, 222, 128, 0.6)',
    glow: '#4ADE80',
  },
};

const intensityMap = {
  low: '0 0 20px',
  medium: '0 0 30px',
  high: '0 0 50px',
};

export function GlowingBadge({
  children,
  color = 'gold',
  intensity = 'medium',
  pulse = true,
}: GlowingBadgeProps) {
  const { bg, shadow, glow } = colorMap[color];
  const glowSize = intensityMap[intensity];

  return (
    <motion.div
      className={`relative inline-block p-4 rounded-2xl border-3 border-black ${bg}`}
      style={{
        boxShadow: `5px 5px 0px rgba(0,0,0,1), ${glowSize} ${shadow}`,
      }}
      animate={
        pulse
          ? {
              boxShadow: [
                `5px 5px 0px rgba(0,0,0,1), ${glowSize} ${shadow}`,
                `5px 5px 0px rgba(0,0,0,1), 0 0 ${parseInt(glowSize.split(' ')[2]) + 20}px ${shadow}`,
                `5px 5px 0px rgba(0,0,0,1), ${glowSize} ${shadow}`,
              ],
            }
          : undefined
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: `8px 8px 0px rgba(0,0,0,1), 0 0 ${parseInt(glowSize.split(' ')[2]) + 30}px ${shadow}`,
      }}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-2xl"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {children}
    </motion.div>
  );
}
