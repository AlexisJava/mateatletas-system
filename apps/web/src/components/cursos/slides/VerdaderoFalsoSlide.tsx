import { useState } from 'react';
import { VerdaderoFalsoSlide as VerdaderoFalsoSlideType } from '@ciudad-mateatleta/lms-core';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CourseTheme } from '../../themes/courseThemes';

interface VerdaderoFalsoSlideProps {
  slide: VerdaderoFalsoSlideType;
  onNext: () => void;
  onPrevious: () => void;
  theme?: CourseTheme;
}

const titleGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400',
  programacion: 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400',
  ciencias: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400',
};

const cardBorders: Record<CourseTheme, string> = {
  matematicas: 'border-yellow-500/20',
  programacion: 'border-indigo-500/20',
  ciencias: 'border-emerald-500/20',
};

const cardShadows: Record<CourseTheme, string> = {
  matematicas: 'shadow-yellow-500/10',
  programacion: 'shadow-indigo-500/10',
  ciencias: 'shadow-emerald-500/10',
};

const verdaderoButtonGradients: Record<CourseTheme, string> = {
  matematicas: 'from-orange-600 to-amber-600',
  programacion: 'from-indigo-600 to-purple-600',
  ciencias: 'from-emerald-600 to-teal-600',
};

const verdaderoButtonHoverGradients: Record<CourseTheme, string> = {
  matematicas: 'hover:from-orange-700 hover:to-amber-700',
  programacion: 'hover:from-indigo-700 hover:to-purple-700',
  ciencias: 'hover:from-emerald-700 hover:to-teal-700',
};

const verdaderoButtonShadows: Record<CourseTheme, string> = {
  matematicas: 'hover:shadow-orange-500/50',
  programacion: 'hover:shadow-indigo-500/50',
  ciencias: 'hover:shadow-emerald-500/50',
};

const feedbackCorrectGradients: Record<CourseTheme, string> = {
  matematicas: 'from-orange-900/90 to-amber-900/90',
  programacion: 'from-indigo-900/90 to-purple-900/90',
  ciencias: 'from-emerald-900/90 to-teal-900/90',
};

const feedbackCorrectBorders: Record<CourseTheme, string> = {
  matematicas: 'border-orange-400',
  programacion: 'border-indigo-400',
  ciencias: 'border-emerald-400',
};

const feedbackCorrectShadows: Record<CourseTheme, string> = {
  matematicas: 'shadow-orange-500/30',
  programacion: 'shadow-indigo-500/30',
  ciencias: 'shadow-emerald-500/30',
};

const continueButtonGradients: Record<CourseTheme, string> = {
  matematicas: 'from-orange-600 to-amber-600',
  programacion: 'from-indigo-600 to-purple-600',
  ciencias: 'from-emerald-600 to-teal-600',
};

const continueButtonHoverGradients: Record<CourseTheme, string> = {
  matematicas: 'hover:from-orange-700 hover:to-amber-700',
  programacion: 'hover:from-indigo-700 hover:to-purple-700',
  ciencias: 'hover:from-emerald-700 hover:to-teal-700',
};

export default function VerdaderoFalsoSlide({
  slide,
  onNext,
  onPrevious,
  theme = 'matematicas',
}: VerdaderoFalsoSlideProps) {
  const [respuesta, setRespuesta] = useState<boolean | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);

  const handleRespuesta = (valor: boolean) => {
    setRespuesta(valor);
    setMostrarFeedback(true);

    // Si es correcto, confetti
    if (valor === slide.content.respuestaCorrecta) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const esCorrecto = respuesta === slide.content.respuestaCorrecta;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col items-center justify-center px-4 space-y-6"
    >
      {/* Emoji */}
      {slide.content.emoji && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-8xl"
        >
          {slide.content.emoji}
        </motion.div>
      )}

      {/* Título */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-3xl md:text-4xl font-bold ${titleGradients[theme]} bg-clip-text text-transparent text-center`}
      >
        {slide.title}
      </motion.h1>

      {/* Pregunta */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`max-w-3xl w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border ${cardBorders[theme]} shadow-xl ${cardShadows[theme]}`}
      >
        <p className="text-2xl md:text-3xl text-white text-center font-bold leading-relaxed">
          {slide.content.pregunta}
        </p>
      </motion.div>

      {/* Botones Verdadero/Falso */}
      {!mostrarFeedback && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-6"
        >
          <button
            onClick={() => handleRespuesta(true)}
            className={`px-12 py-6 bg-gradient-to-r ${verdaderoButtonGradients[theme]} ${verdaderoButtonHoverGradients[theme]} text-white rounded-2xl font-black text-2xl transition-all transform hover:scale-110 shadow-2xl ${verdaderoButtonShadows[theme]}`}
          >
            ✓ VERDADERO
          </button>

          <button
            onClick={() => handleRespuesta(false)}
            className="px-12 py-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-2xl font-black text-2xl transition-all transform hover:scale-110 shadow-2xl hover:shadow-red-500/50"
          >
            ✗ FALSO
          </button>
        </motion.div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {mostrarFeedback && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`max-w-3xl w-full rounded-2xl p-8 border-4 ${
              esCorrecto
                ? `bg-gradient-to-br ${feedbackCorrectGradients[theme]} ${feedbackCorrectBorders[theme]} shadow-2xl ${feedbackCorrectShadows[theme]}`
                : 'bg-gradient-to-br from-red-900/90 to-orange-900/90 border-red-400 shadow-2xl shadow-red-500/30'
            }`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{esCorrecto ? '🎉' : '💡'}</div>
              <p className="text-2xl text-white font-bold leading-relaxed">
                {esCorrecto ? slide.content.feedbackCorrecto : slide.content.feedbackIncorrecto}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botones de navegación */}
      {mostrarFeedback && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
          >
            ← Anterior
          </button>

          <button
            onClick={onNext}
            className={`px-8 py-3 bg-gradient-to-r ${continueButtonGradients[theme]} ${continueButtonHoverGradients[theme]} text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg`}
          >
            Continuar →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
