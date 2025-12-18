'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  GameDesignSlide,
  GameDesignIntroSlide as IntroSlideType,
  GameDesignTeoriaSlide as TeoriaSlideType,
  GameDesignQuizSlide as QuizSlideType,
  GameDesignReflexionSlide as ReflexionSlideType,
  GameDesignSummarySlide as SummarySlideType,
} from '@/data/roblox/types/game-design.types';
import {
  isIntroSlide,
  isTeoriaSlide,
  isQuizSlide,
  isReflexionSlide,
  isSummarySlide,
} from '@/data/roblox/types/game-design.types';

import GameDesignIntroSlide from './GameDesignIntroSlide';
import GameDesignTeoriaSlide from './GameDesignTeoriaSlide';
import GameDesignQuizSlide from './GameDesignQuizSlide';
import GameDesignReflexionSlide from './GameDesignReflexionSlide';
import GameDesignSummarySlide from './GameDesignSummarySlide';

interface GameDesignSlideViewerProps {
  slides: GameDesignSlide[];
  onComplete?: () => void;
}

export default function GameDesignSlideViewer({ slides, onComplete }: GameDesignSlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSlide = slides[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === slides.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete?.();
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
    }
  }, [isLast, onComplete, slides.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        // Don't auto-advance on quiz slides
        if (!isQuizSlide(currentSlide)) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, handleNext, handlePrevious]);

  const renderSlide = () => {
    if (isIntroSlide(currentSlide)) {
      return <GameDesignIntroSlide slide={currentSlide as IntroSlideType} onNext={handleNext} />;
    }

    if (isTeoriaSlide(currentSlide)) {
      return (
        <GameDesignTeoriaSlide
          slide={currentSlide as TeoriaSlideType}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      );
    }

    if (isQuizSlide(currentSlide)) {
      return (
        <GameDesignQuizSlide
          slide={currentSlide as QuizSlideType}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      );
    }

    if (isReflexionSlide(currentSlide)) {
      return (
        <GameDesignReflexionSlide
          slide={currentSlide as ReflexionSlideType}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      );
    }

    if (isSummarySlide(currentSlide)) {
      return (
        <GameDesignSummarySlide
          slide={currentSlide as SummarySlideType}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLast={isLast}
        />
      );
    }

    // Fallback para tipos no reconocidos (exhaustive check)
    const _exhaustiveCheck: never = currentSlide;
    return (
      <div className="text-center text-slate-400">
        <p>Tipo de slide no reconocido</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Slide counter */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-slate-300">
          {currentIndex + 1} / {slides.length}
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 md:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard hint */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-slate-500 flex items-center gap-2">
          <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-400">←</kbd>
          <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-400">→</kbd>
          <span>para navegar</span>
        </div>
      </div>
    </div>
  );
}
