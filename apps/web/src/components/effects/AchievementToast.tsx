'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AchievementToastProps {
  show: boolean;
  title: string;
  description: string;
  icon?: string;
  points?: number;
  onClose?: () => void;
}

export function AchievementToast({
  show,
  title,
  description,
  icon = '🏆',
  points,
  onClose,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <motion.div
        className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-1 rounded-2xl border-3 border-black"
        style={{ boxShadow: '8px 8px 0px rgba(0,0,0,1)' }}
        animate={{
          boxShadow: [
            '8px 8px 0px rgba(0,0,0,1)',
            '8px 8px 0px rgba(0,0,0,1), 0 0 30px rgba(255,215,0,0.6)',
            '8px 8px 0px rgba(0,0,0,1)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="bg-[#2a1a5e] rounded-xl p-4 flex items-center gap-4 min-w-[320px]">
          {/* Icon con animación */}
          <motion.div
            className="text-5xl"
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            {icon}
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-lilita text-lg text-white mb-1">{title}</h3>
            <p className="font-fredoka text-sm text-gray-300">{description}</p>
            {points && (
              <motion.p
                className="font-fredoka font-bold text-yellow-400 mt-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                +{points} puntos
              </motion.p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
