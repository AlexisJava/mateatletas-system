'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  GameDesignQuizSlide as QuizSlideData,
  GameDesignQuizOption,
} from '@/data/roblox/types/game-design.types';

interface GameDesignQuizSlideProps {
  slide: QuizSlideData;
  onNext: () => void;
  onPrevious: () => void;
}

export default function GameDesignQuizSlide({
  slide,
  onNext,
  onPrevious,
}: GameDesignQuizSlideProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOptionClick = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
    setShowFeedback(true);
  };

  const selectedOptionData: GameDesignQuizOption | undefined =
    selectedOption !== null ? slide.opciones[selectedOption] : undefined;
  const isCorrect = selectedOptionData?.correcta ?? false;

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

      {/* Pregunta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20"
      >
        <p className="text-xl md:text-2xl text-slate-100 font-medium leading-relaxed">
          {slide.pregunta}
        </p>
      </motion.div>

      {/* Opciones */}
      <div className="space-y-3">
        {slide.opciones.map((opcion, index) => {
          const isSelected = selectedOption === index;
          const isCorrectOption = opcion.correcta;

          let buttonStyles =
            'bg-slate-700/80 hover:bg-slate-600/80 border-slate-600 hover:border-indigo-500/50';

          if (showFeedback && isSelected) {
            buttonStyles = isCorrectOption
              ? 'bg-emerald-600/80 border-emerald-500'
              : 'bg-red-600/80 border-red-500';
          }

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => handleOptionClick(index)}
              disabled={showFeedback}
              className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-300 ${buttonStyles} disabled:cursor-not-allowed`}
            >
              <span className="text-slate-100 text-base md:text-lg">{opcion.texto}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && selectedOptionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`rounded-xl p-5 border-2 ${
              isCorrect ? 'bg-emerald-900/40 border-emerald-500' : 'bg-red-900/40 border-red-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{isCorrect ? '✅' : '❌'}</span>
              <p
                className={`text-base md:text-lg leading-relaxed ${
                  isCorrect ? 'text-emerald-100' : 'text-red-100'
                }`}
              >
                {selectedOptionData.feedback}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          disabled={!showFeedback}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
