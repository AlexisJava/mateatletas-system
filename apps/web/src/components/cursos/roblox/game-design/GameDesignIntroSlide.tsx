'use client';

import { motion } from 'framer-motion';
import type { GameDesignIntroSlide as IntroSlideData } from '@/data/roblox/types/game-design.types';

interface GameDesignIntroSlideProps {
  slide: IntroSlideData;
  onNext: () => void;
}

export default function GameDesignIntroSlide({ slide, onNext }: GameDesignIntroSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Emoji animado */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
        className="text-center"
      >
        <span className="text-8xl md:text-9xl drop-shadow-2xl">{slide.emoji}</span>
      </motion.div>

      {/* Título */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
          {slide.titulo}
        </h1>
      </motion.div>

      {/* Subtítulo */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-center"
      >
        <p className="text-xl md:text-2xl text-indigo-300 font-medium">{slide.subtitulo}</p>
      </motion.div>

      {/* Descripción */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20 shadow-xl shadow-indigo-500/10"
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl md:text-3xl shadow-lg">
              🤖
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-indigo-400 mb-1">Lambda</div>
            <div className="text-slate-300 text-base md:text-lg leading-relaxed">
              {slide.descripcion}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botón comenzar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex justify-center"
      >
        <button
          onClick={onNext}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg transition-all duration-300 shadow-lg shadow-indigo-500/30 flex items-center gap-3"
        >
          Comenzar
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
}
