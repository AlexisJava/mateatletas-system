'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

interface LevelUpAnimationProps {
  show: boolean;
  level: number;
  onComplete?: () => void;
}

export function LevelUpAnimation({ show, level, onComplete }: LevelUpAnimationProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Confetti */}
          {showConfetti && (
            <Confetti
              width={width}
              height={height}
              numberOfPieces={500}
              recycle={false}
              colors={['#FFD700', '#FFA500', '#FF6B35', '#00D9FF', '#8B5CF6']}
              gravity={0.3}
            />
          )}

          {/* Overlay oscuro */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Contenido central */}
            <motion.div
              className="relative flex flex-col items-center gap-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
            >
              {/* Círculo de fondo animado */}
              <motion.div
                className="absolute -inset-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Estrella giratoria */}
              <motion.div
                className="relative text-[150px]"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ⭐
              </motion.div>

              {/* Texto LEVEL UP */}
              <motion.div
                className="relative text-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="font-[family-name:var(--font-fredoka)] text-6xl text-white mb-2" style={{ textShadow: '4px 4px 0px rgba(0,0,0,1)' }}>
                  LEVEL UP!
                </h1>
                <motion.p
                  className="font-fredoka text-3xl text-yellow-400"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ textShadow: '3px 3px 0px rgba(0,0,0,1)' }}
                >
                  Nivel {level}
                </motion.p>
              </motion.div>

              {/* Partículas orbitando */}
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <motion.div
                  key={angle}
                  className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                  style={{
                    boxShadow: '0 0 20px #FFD700',
                  }}
                  animate={{
                    x: [
                      Math.cos((angle * Math.PI) / 180) * 100,
                      Math.cos(((angle + 360) * Math.PI) / 180) * 100,
                    ],
                    y: [
                      Math.sin((angle * Math.PI) / 180) * 100,
                      Math.sin(((angle + 360) * Math.PI) / 180) * 100,
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
