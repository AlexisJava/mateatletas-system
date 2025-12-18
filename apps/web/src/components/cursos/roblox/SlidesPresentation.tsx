'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slide, QuizSlide } from '@/data/roblox/semana1-slides';

interface SlidesPresentationProps {
  slides: Slide[];
  theme: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
}

export default function SlidesPresentation({ slides, theme }: SlidesPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const slide = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentSlide(currentSlide + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handlePrev = () => {
    if (!isFirstSlide) {
      setCurrentSlide(currentSlide - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  const handleCopyCode = () => {
    const codeElement = document.querySelector(`#slide-${slide.id} code`);
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.textContent || '');
      alert('¡Código copiado! 📋');
    }
  };

  const getTransitionVariants = () => {
    const transition = slide.transition || 'fade';

    switch (transition) {
      case 'slide':
        return {
          initial: { x: 100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -100, opacity: 0 },
        };
      case 'zoom':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 },
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const renderSlideContent = () => {
    // Quiz slide
    if (slide.type === 'quiz' && slide.quiz) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-900/80 backdrop-blur-md border-2 border-indigo-500/40 rounded-3xl p-8 md:p-12">
            <div className="text-5xl mb-8 text-center">🤔</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              {slide.quiz.question}
            </h2>

            <div className="space-y-4 mb-8">
              {slide.quiz.options.map((option, idx) => {
                const optionLetter = option.charAt(0);
                const isSelected = selectedAnswer === optionLetter;
                const isCorrect = slide.quiz!.correct_answer === optionLetter;
                const showResult = showFeedback && isSelected;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(optionLetter)}
                    disabled={showFeedback}
                    className={`w-full p-6 rounded-xl text-left text-lg font-semibold transition-all duration-300 border-2 ${
                      showResult
                        ? isCorrect
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : 'bg-red-500/20 border-red-500 text-red-300'
                        : isSelected
                          ? 'bg-indigo-500/20 border-indigo-500 text-white'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-700/50'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border-2 ${
                  selectedAnswer === slide.quiz.correct_answer
                    ? 'bg-green-500/20 border-green-500'
                    : 'bg-amber-500/20 border-amber-500'
                }`}
              >
                <p className="text-xl text-white font-semibold mb-2">
                  {selectedAnswer === slide.quiz.correct_answer ? '✅ ¡Correcto!' : '💡 Respuesta:'}
                </p>
                <p className="text-lg text-slate-200">{slide.quiz.feedback}</p>
              </motion.div>
            )}
          </div>
        </div>
      );
    }

    // Code slide with copy button
    if (slide.interactivity === 'copy_button') {
      return (
        <div className="max-w-4xl mx-auto">
          {slide.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              {slide.title}
            </h2>
          )}
          <div className="relative">
            <button
              onClick={handleCopyCode}
              className="absolute top-4 right-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 z-10"
            >
              📋 Copiar Código
            </button>
            <div dangerouslySetInnerHTML={{ __html: slide.content }} />
          </div>
        </div>
      );
    }

    // Activity slide
    if (slide.type === 'activity') {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md border-2 border-amber-500/40 rounded-3xl p-8 md:p-12">
            <div className="text-5xl mb-6 text-center">🎯</div>
            {slide.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                {slide.title}
              </h2>
            )}
            <div dangerouslySetInnerHTML={{ __html: slide.content }} />
          </div>
        </div>
      );
    }

    // Regular slides
    return (
      <div className="max-w-4xl mx-auto">
        {slide.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            {slide.title}
          </h2>
        )}
        <div dangerouslySetInnerHTML={{ __html: slide.content }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.background }}>
      {/* Header with progress */}
      <header className="p-4 md:p-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-slate-400 font-semibold">
            Slide {currentSlide + 1} / {slides.length}
          </div>
          <div className="flex-1 mx-8">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${((currentSlide + 1) / slides.length) * 100}%`,
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Slide content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            {...getTransitionVariants()}
            transition={{ duration: 0.5 }}
            className="w-full"
            id={`slide-${slide.id}`}
          >
            {renderSlideContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <footer className="p-4 md:p-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={isFirstSlide}
            className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700"
          >
            ← Anterior
          </button>

          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">Navegación</p>
            <p className="text-white font-bold">
              {slide.type === 'title'
                ? '🎬'
                : slide.type === 'quiz'
                  ? '❓'
                  : slide.type === 'activity'
                    ? '🎯'
                    : '📄'}
            </p>
          </div>

          <button
            onClick={handleNext}
            disabled={isLastSlide}
            className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 text-white"
            style={{
              background: isLastSlide
                ? '#475569'
                : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
          >
            Siguiente →
          </button>
        </div>
      </footer>
    </div>
  );
}
