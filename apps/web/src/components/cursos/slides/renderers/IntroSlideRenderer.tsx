/**
 * components/slides/renderers/IntroSlideRenderer.tsx
 * ===================================================
 * Renderizador para slides de introducción
 *
 * MIGRACIÓN PROMPT 3: Actualizado para usar tipos nuevos
 */

'use client';

import { motion } from 'framer-motion';
import type { IntroSlide } from '../../../types/registry';
import LambdaMessage from '../../LambdaMessage';
import NavigationButtons from '../shared/NavigationButtons';

interface IntroSlideRendererProps {
  slide: IntroSlide;
  onNext: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  hideNavigation?: boolean;
}

// Mapeo de colores por theme
const titleGradients = {
  matematicas: 'from-orange-300 via-amber-300 to-yellow-300',
  programacion: 'from-indigo-300 via-purple-300 to-pink-300',
  roblox: 'from-indigo-300 via-purple-300 to-pink-300',
  ciencias: 'from-emerald-300 via-teal-300 to-cyan-300',
  astro: 'from-emerald-300 via-teal-300 to-cyan-300',
  quimica: 'from-emerald-300 via-teal-300 to-cyan-300',
  fisica: 'from-emerald-300 via-teal-300 to-cyan-300',
  default: 'from-slate-300 via-slate-200 to-slate-300',
};

const visualGradients = {
  matematicas: 'from-orange-900/30 via-amber-900/30 to-yellow-900/30',
  programacion: 'from-indigo-900/30 via-purple-900/30 to-pink-900/30',
  roblox: 'from-indigo-900/30 via-purple-900/30 to-pink-900/30',
  ciencias: 'from-emerald-900/30 via-teal-900/30 to-cyan-900/30',
  astro: 'from-emerald-900/30 via-teal-900/30 to-cyan-900/30',
  quimica: 'from-emerald-900/30 via-teal-900/30 to-cyan-900/30',
  fisica: 'from-emerald-900/30 via-teal-900/30 to-cyan-900/30',
  default: 'from-slate-900/30 via-slate-800/30 to-slate-900/30',
};

const borderColors = {
  matematicas: 'border-orange-500/20',
  programacion: 'border-indigo-500/20',
  roblox: 'border-indigo-500/20',
  ciencias: 'border-emerald-500/20',
  astro: 'border-emerald-500/20',
  quimica: 'border-emerald-500/20',
  fisica: 'border-emerald-500/20',
  default: 'border-slate-500/20',
};

const shadowColors = {
  matematicas: 'shadow-orange-500/20',
  programacion: 'shadow-indigo-500/20',
  roblox: 'shadow-indigo-500/20',
  ciencias: 'shadow-emerald-500/20',
  astro: 'shadow-emerald-500/20',
  quimica: 'shadow-emerald-500/20',
  fisica: 'shadow-emerald-500/20',
  default: 'shadow-slate-500/20',
};

const particleColors = {
  matematicas: 'bg-orange-400/30',
  programacion: 'bg-indigo-400/30',
  roblox: 'bg-indigo-400/30',
  ciencias: 'bg-emerald-400/30',
  astro: 'bg-emerald-400/30',
  quimica: 'bg-emerald-400/30',
  fisica: 'bg-emerald-400/30',
  default: 'bg-slate-400/30',
};

const messageShadows = {
  matematicas: 'shadow-orange-500/10',
  programacion: 'shadow-indigo-500/10',
  roblox: 'shadow-indigo-500/10',
  ciencias: 'shadow-emerald-500/10',
  astro: 'shadow-emerald-500/10',
  quimica: 'shadow-emerald-500/10',
  fisica: 'shadow-emerald-500/10',
  default: 'shadow-slate-500/10',
};

export default function IntroSlideRenderer({
  slide,
  onNext,
  showPrevious = false,
  hideNavigation = false,
}: IntroSlideRendererProps) {
  // Extraer información del tipo nuevo
  const message = slide.description || slide.subtitle || '';
  const ctaText = 'Comenzar';

  // Obtener theme de la slide
  const theme = (slide.theme || 'default') as keyof typeof titleGradients;

  return (
    <div className="relative h-full w-full">
      {/* Container principal CENTRADO */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full space-y-6"
        >
          {/* Título */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-6"
          >
            <h1
              className={`text-5xl md:text-7xl font-black bg-gradient-to-r ${titleGradients[theme]} bg-clip-text text-transparent mb-4 drop-shadow-2xl`}
            >
              {slide.title}
            </h1>
          </motion.div>

          {/* Visual animado */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className={`relative w-full h-48 md:h-64 rounded-3xl bg-gradient-to-br ${visualGradients[theme]} backdrop-blur-xl overflow-hidden mb-6 flex items-center justify-center border ${borderColors[theme]} shadow-2xl ${shadowColors[theme]}`}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-9xl drop-shadow-2xl"
            >
              🚀
            </motion.div>

            {/* Partículas animadas de fondo */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1 h-1 ${particleColors[theme]} rounded-full`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Mensaje de Lambda */}
          {message && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className={`bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border ${borderColors[theme]} shadow-xl ${messageShadows[theme]}`}
            >
              <LambdaMessage message={message} />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Botones de navegación FIJOS abajo - solo si NO está hideNavigation */}
      {!hideNavigation && (
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <NavigationButtons onNext={onNext} nextLabel={ctaText} showPrevious={showPrevious} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
