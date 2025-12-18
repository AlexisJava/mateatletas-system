import {
  GameDashboardSlide as GameDashboardSlideType,
  NavigationButtons,
} from '@ciudad-mateatleta/lms-core';
import LambdaMessage from './LambdaMessage';
import GameCard from './GameCard';
import { motion } from 'framer-motion';
import { CourseTheme } from '../../themes/courseThemes';

interface GameDashboardSlideProps {
  slide: GameDashboardSlideType;
  onNext: () => void;
  onPrevious: () => void;
  completedGames?: string[];
  theme?: CourseTheme;
}

const titleGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400',
  programacion: 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400',
  ciencias: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400',
};

const cardBorders: Record<CourseTheme, string> = {
  matematicas: 'border-amber-500/20',
  programacion: 'border-indigo-500/20',
  ciencias: 'border-emerald-500/20',
};

const cardShadows: Record<CourseTheme, string> = {
  matematicas: 'shadow-amber-500/10',
  programacion: 'shadow-indigo-500/10',
  ciencias: 'shadow-emerald-500/10',
};

const noteGradients: Record<CourseTheme, string> = {
  matematicas: 'from-orange-900/40 to-amber-900/40',
  programacion: 'from-indigo-900/40 to-purple-900/40',
  ciencias: 'from-emerald-900/40 to-teal-900/40',
};

const noteBorders: Record<CourseTheme, string> = {
  matematicas: 'border-orange-400',
  programacion: 'border-indigo-400',
  ciencias: 'border-emerald-400',
};

const noteShadows: Record<CourseTheme, string> = {
  matematicas: 'shadow-orange-500/10',
  programacion: 'shadow-indigo-500/10',
  ciencias: 'shadow-emerald-500/10',
};

export default function GameDashboardSlide({
  slide,
  onNext,
  onPrevious,
  completedGames = [],
  theme = 'matematicas',
}: GameDashboardSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.h1
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-3xl md:text-4xl font-bold ${titleGradients[theme]} bg-clip-text text-transparent mb-4`}
      >
        {slide.title}
      </motion.h1>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border ${cardBorders[theme]} shadow-xl ${cardShadows[theme]}`}
      >
        <LambdaMessage message={slide.content.lambda_message} theme={theme} />
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        {slide.content.games.map(
          (
            game: {
              id: string;
              title: string;
              description: string;
              route: string;
              icon?: string;
              estimated_time?: string;
            },
            idx: number,
          ) => (
            <motion.div
              key={game.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
            >
              <GameCard game={game} completed={completedGames.includes(game.id)} />
            </motion.div>
          ),
        )}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={`bg-gradient-to-r ${noteGradients[theme]} backdrop-blur-sm rounded-xl p-4 border-l-4 ${noteBorders[theme]} shadow-lg ${noteShadows[theme]}`}
      >
        <p className="text-slate-200 text-sm font-medium flex items-center gap-2">
          <span className="text-xl">💡</span>
          {slide.content.navigation_note}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <NavigationButtons
          onPrevious={onPrevious}
          onNext={onNext}
          nextLabel={slide.content.cta_continue}
          theme={theme}
        />
      </motion.div>
    </motion.div>
  );
}
