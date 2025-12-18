import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RobotProps {
  mensaje: string;
  emotion?: 'happy' | 'thinking' | 'celebrating' | 'neutral';
}

export const Robot: React.FC<RobotProps> = ({ mensaje, emotion = 'neutral' }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-3xl mx-auto p-2 z-20">
      {/* ROBOT AVATAR */}
      <motion.div
        className="relative w-28 h-28 flex-shrink-0"
        animate={emotion === 'thinking' ? { y: [0, -5, 0] } : { y: 0 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        {/* Head */}
        <div className="absolute inset-0 bg-indigo-500 rounded-3xl shadow-lg shadow-indigo-500/30 flex items-center justify-center z-10 overflow-hidden">
          {/* Face Screen */}
          <div className="w-20 h-16 bg-indigo-900 rounded-xl flex items-center justify-center gap-3 relative">
            {/* Eyes */}
            <motion.div
              className="w-3 h-5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ repeat: Infinity, delay: 2, duration: 0.15 }}
            />
            <motion.div
              className="w-3 h-5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ repeat: Infinity, delay: 2, duration: 0.15 }}
            />

            {/* Mouth/Expression */}
            {emotion === 'celebrating' && (
              <div className="absolute bottom-2 w-6 h-3 border-b-2 border-cyan-400 rounded-full"></div>
            )}
            {emotion === 'thinking' && (
              <div className="absolute bottom-3 w-4 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
            )}
          </div>

          {/* Antenna */}
          <div className="absolute -top-3 w-8 h-8 bg-red-400 rounded-full border-4 border-white z-0"></div>
        </div>

        {/* Ear things */}
        <div className="absolute top-8 -left-2 w-4 h-12 bg-indigo-700 rounded-l-lg"></div>
        <div className="absolute top-8 -right-2 w-4 h-12 bg-indigo-700 rounded-r-lg"></div>
      </motion.div>

      {/* MESSAGE BUBBLE */}
      <div className="relative bg-white/90 backdrop-blur-sm text-slate-800 px-8 py-6 rounded-[2rem] shadow-xl w-full max-w-lg transform transition-all">
        <AnimatePresence mode="wait">
          <motion.p
            key={mensaje}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xl md:text-2xl font-bold text-center md:text-left leading-relaxed text-indigo-900"
          >
            {mensaje}
          </motion.p>
        </AnimatePresence>

        {/* Triangle Tail */}
        <div className="hidden md:block absolute top-1/2 -left-3 w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-r-white/90 border-b-[10px] border-b-transparent transform -translate-y-1/2 drop-shadow-sm"></div>
        <div className="md:hidden absolute -top-3 left-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-b-[15px] border-b-white/90 border-r-[10px] border-r-transparent transform -translate-x-1/2 drop-shadow-sm"></div>
      </div>
    </div>
  );
};
