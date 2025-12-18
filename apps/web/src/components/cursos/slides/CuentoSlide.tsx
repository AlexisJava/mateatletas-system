import { useState } from 'react';
import { CuentoSlide as CuentoSlideType } from '@ciudad-mateatleta/lms-core';
import { motion } from 'framer-motion';
import { CourseTheme } from '../../themes/courseThemes';

interface CuentoSlideProps {
  slide: CuentoSlideType;
  onNext: () => void;
  onPrevious: () => void;
  theme?: CourseTheme;
}

const cardGradients: Record<CourseTheme, string> = {
  matematicas: 'from-amber-900 to-orange-900',
  programacion: 'from-indigo-900 to-purple-900',
  ciencias: 'from-emerald-900 to-teal-900',
};

const nextButtonGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-gradient-to-r from-orange-600 to-amber-600',
  programacion: 'bg-gradient-to-r from-indigo-600 to-purple-600',
  ciencias: 'bg-gradient-to-r from-emerald-600 to-teal-600',
};

const nextButtonHoverGradients: Record<CourseTheme, string> = {
  matematicas: 'hover:from-orange-700 hover:to-amber-700',
  programacion: 'hover:from-indigo-700 hover:to-purple-700',
  ciencias: 'hover:from-emerald-700 hover:to-teal-700',
};

export default function CuentoSlide({
  slide,
  onNext,
  onPrevious,
  theme = 'matematicas',
}: CuentoSlideProps) {
  const [escenaActual, setEscenaActual] = useState(0);
  const escena = slide.content.escenas[escenaActual];
  const esUltima = escenaActual === slide.content.escenas.length - 1;

  const siguiente = () => {
    if (esUltima) {
      onNext();
    } else {
      setEscenaActual(escenaActual + 1);
    }
  };

  const anterior = () => {
    if (escenaActual > 0) {
      setEscenaActual(escenaActual - 1);
    } else {
      onPrevious();
    }
  };

  return (
    <motion.div
      key={escenaActual}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col items-center justify-center px-4"
    >
      <div
        className={`max-w-4xl w-full bg-gradient-to-br ${escena.color || cardGradients[theme]} rounded-3xl p-8 md:p-12 border-4 border-white/20 shadow-2xl`}
      >
        {/* Emoji gigante */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-9xl text-center mb-8"
        >
          {escena.imagen}
        </motion.div>

        {/* Texto de la escena */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl text-white text-center leading-relaxed font-bold mb-8"
        >
          {escena.texto}
        </motion.p>

        {/* Indicador de progreso */}
        <div className="flex justify-center gap-3 mb-8">
          {slide.content.escenas.map((_, i) => (
            <div
              key={i}
              className={`h-3 rounded-full transition-all ${
                i === escenaActual
                  ? 'w-12 bg-white'
                  : i < escenaActual
                    ? 'w-3 bg-white/60'
                    : 'w-3 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Botones */}
        <div className="flex justify-between gap-4">
          <button
            onClick={anterior}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={escenaActual === 0}
          >
            ← Anterior
          </button>

          <button
            onClick={siguiente}
            className={`px-8 py-3 ${nextButtonGradients[theme]} ${nextButtonHoverGradients[theme]} text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl`}
          >
            {esUltima ? '¡Continuar! →' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
