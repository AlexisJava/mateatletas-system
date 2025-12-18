'use client';

import { motion } from 'framer-motion';
import type { GameDesignReflexionSlide as ReflexionSlideData } from '@/data/roblox/types/game-design.types';

interface GameDesignReflexionSlideProps {
  slide: ReflexionSlideData;
  onNext: () => void;
  onPrevious: () => void;
}

export default function GameDesignReflexionSlide({
  slide,
  onNext,
  onPrevious,
}: GameDesignReflexionSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header con emoji y título */}
      <div className="flex items-center gap-4 mb-6">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-5xl md:text-6xl"
        >
          {slide.emoji}
        </motion.span>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {slide.titulo}
        </h1>
      </div>

      {/* Contenido introductorio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20"
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
              🤖
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-indigo-400 mb-1">Lambda</div>
            <p className="text-slate-200 text-lg leading-relaxed">{slide.contenido}</p>
          </div>
        </div>
      </motion.div>

      {/* Puntos de reflexión */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-6 border-2 border-purple-500/40"
      >
        <ul className="space-y-4">
          {slide.puntosClave.map((punto, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <span className="text-purple-400 font-bold text-lg">→</span>
              <span className="text-slate-200 text-lg leading-relaxed">{punto}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Navegación */}
      <div className="flex justify-between items-center gap-4 mt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Anterior
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 shadow-lg flex items-center gap-2"
        >
          Continuar
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
