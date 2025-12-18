import { IntroSlide as IntroSlideType, NavigationButtons } from '@ciudad-mateatleta/lms-core';
import LambdaMessage from './LambdaMessage';
import { motion } from 'framer-motion';
import { CourseTheme } from '../../themes/courseThemes';

interface IntroSlideProps {
  slide: IntroSlideType;
  onNext: () => void;
  theme?: CourseTheme;
}

const titleGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300',
  programacion: 'bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300',
  ciencias: 'bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300',
};

const cardGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-gradient-to-br from-orange-900/30 via-amber-900/30 to-yellow-900/30',
  programacion: 'bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30',
  ciencias: 'bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30',
};

const borderColors: Record<CourseTheme, string> = {
  matematicas: 'border-orange-500/20',
  programacion: 'border-indigo-500/20',
  ciencias: 'border-emerald-500/20',
};

const shadowColors: Record<CourseTheme, string> = {
  matematicas: 'shadow-orange-500/20',
  programacion: 'shadow-indigo-500/20',
  ciencias: 'shadow-emerald-500/20',
};

const cardShadows: Record<CourseTheme, string> = {
  matematicas: 'shadow-orange-500/10',
  programacion: 'shadow-indigo-500/10',
  ciencias: 'shadow-emerald-500/10',
};

const particleColors: Record<CourseTheme, string> = {
  matematicas: 'bg-orange-400/30',
  programacion: 'bg-indigo-400/30',
  ciencias: 'bg-emerald-400/30',
};

export default function IntroSlide({ slide, onNext, theme = 'matematicas' }: IntroSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-6"
      >
        <h1
          className={`text-5xl md:text-7xl font-black ${titleGradients[theme]} bg-clip-text text-transparent mb-4 drop-shadow-2xl`}
        >
          {slide.title}
        </h1>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className={`relative w-full h-48 md:h-64 rounded-3xl ${cardGradients[theme]} backdrop-blur-xl overflow-hidden mb-6 flex items-center justify-center border ${borderColors[theme]} shadow-2xl ${shadowColors[theme]}`}
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

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
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

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className={`bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border ${borderColors[theme]} shadow-xl ${cardShadows[theme]}`}
      >
        <LambdaMessage message={slide.subtitle || slide.title} theme={theme} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <NavigationButtons
          onNext={onNext}
          nextLabel="Comenzar"
          showPrevious={false}
          theme={theme}
        />
      </motion.div>
    </motion.div>
  );
}
