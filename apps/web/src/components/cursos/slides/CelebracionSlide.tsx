import {
  CelebracionSlide as CelebracionSlideType,
  NavigationButtons,
} from '@ciudad-mateatleta/lms-core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MathConfetti } from '../../animations';
import { CourseTheme } from '../../themes/courseThemes';

interface CelebracionSlideProps {
  slide: CelebracionSlideType;
  onNext: () => void;
  onPrevious: () => void;
  theme?: CourseTheme;
}

const titleGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300',
  programacion: 'bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300',
  ciencias: 'bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300',
};

const messageGradients: Record<CourseTheme, string> = {
  matematicas: 'from-amber-900/40 via-orange-900/40 to-yellow-900/40',
  programacion: 'from-indigo-900/40 via-purple-900/40 to-pink-900/40',
  ciencias: 'from-emerald-900/40 via-teal-900/40 to-cyan-900/40',
};

const messageBorders: Record<CourseTheme, string> = {
  matematicas: 'border-yellow-400/30',
  programacion: 'border-indigo-400/30',
  ciencias: 'border-emerald-400/30',
};

const messageShadows: Record<CourseTheme, string> = {
  matematicas: 'shadow-yellow-500/30',
  programacion: 'shadow-indigo-500/30',
  ciencias: 'shadow-emerald-500/30',
};

const logroGradients: Record<CourseTheme, string> = {
  matematicas: 'from-orange-900/50 to-amber-900/50',
  programacion: 'from-indigo-900/50 to-purple-900/50',
  ciencias: 'from-emerald-900/50 to-teal-900/50',
};

const logroBorders: Record<CourseTheme, string> = {
  matematicas: 'border-orange-400/30',
  programacion: 'border-indigo-400/30',
  ciencias: 'border-emerald-400/30',
};

const starColors: Record<CourseTheme, string> = {
  matematicas: 'text-yellow-300',
  programacion: 'text-indigo-300',
  ciencias: 'text-emerald-300',
};

export default function CelebracionSlide({
  slide,
  onNext,
  onPrevious,
  theme = 'matematicas',
}: CelebracionSlideProps) {
  const [showConfetti] = useState(true);

  return (
    <>
      <MathConfetti active={showConfetti} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="h-full flex flex-col items-center justify-center px-4 space-y-8"
      >
        {/* Emoji gigante animado */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-9xl filter drop-shadow-2xl"
        >
          {slide.content.emoji || '🎉'}
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-black text-center"
        >
          <span
            className={`${titleGradients[theme]} bg-clip-text text-transparent drop-shadow-2xl`}
          >
            {slide.title}
          </span>
        </motion.h1>

        {/* Mensaje principal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`max-w-3xl w-full bg-gradient-to-br ${messageGradients[theme]} backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 ${messageBorders[theme]} shadow-2xl ${messageShadows[theme]}`}
        >
          <p className="text-2xl md:text-3xl text-white text-center font-bold leading-relaxed">
            {slide.content.mensaje}
          </p>
        </motion.div>

        {/* Logros */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="max-w-2xl w-full space-y-4"
        >
          {slide.content.logros.map((logro, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className={`bg-gradient-to-r ${logroGradients[theme]} backdrop-blur-sm rounded-xl p-4 border ${logroBorders[theme]} shadow-lg hover:scale-105 transition-transform`}
            >
              <p className="text-xl text-white font-semibold flex items-center gap-3">
                <span className="text-2xl">✨</span>
                {logro}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Botones de navegación */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-6"
        >
          <NavigationButtons
            onPrevious={onPrevious}
            onNext={onNext}
            nextLabel="¡Continuar! 🚀"
            theme={theme}
          />
        </motion.div>

        {/* Estrellas de fondo animadas */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute ${starColors[theme]}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 10}px`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
