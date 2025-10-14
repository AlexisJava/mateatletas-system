'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const textSizeMap = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Círculo exterior */}
        <motion.div
          className={`${sizeMap[size]} border-4 border-transparent border-t-cyan-400 border-r-blue-500 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />

        {/* Círculo interior */}
        <motion.div
          className={`absolute inset-2 border-4 border-transparent border-t-pink-400 border-l-purple-500 rounded-full`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Punto central pulsante */}
        <motion.div
          className="absolute inset-0 m-auto w-3 h-3 bg-yellow-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ boxShadow: '0 0 10px #FFD700' }}
        />
      </div>

      {text && (
        <motion.p
          className={`${textSizeMap[size]} font-fredoka font-bold text-white`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
