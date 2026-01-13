'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Timer, Zap, Trophy, X } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface ChallengeQuestion {
  /** Question ID */
  id: string;
  /** Question text */
  question: string;
  /** Answer options */
  options: string[];
  /** Index of correct answer */
  correctIndex: number;
}

export interface ChallengeIntentProps {
  /** Challenge title */
  title?: string;
  /** Time limit in seconds */
  timeLimit: number;
  /** Questions to answer */
  questions: ChallengeQuestion[];
  /** XP per correct answer */
  xpPerQuestion?: number;
  /** Bonus XP for completing all */
  completionBonus?: number;
  /** Called when challenge ends */
  onComplete?: (results: { correct: number; total: number; timeLeft: number }) => void;
  /** Additional class names */
  className?: string;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const questionVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0, transition: lessonSprings.card },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const optionVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const pulseWarning = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
    },
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ChallengeIntent - Timed challenge/quiz
 *
 * Fast-paced quiz with countdown timer for extra pressure.
 * Perfect for review sessions and competitive moments.
 *
 * @example
 * ```tsx
 * <ChallengeIntent
 *   title="Reto Relámpago"
 *   timeLimit={60}
 *   questions={[
 *     { id: '1', question: '1/2 + 1/2 = ?', options: ['1/4', '1', '2/2', '1/2'], correctIndex: 1 },
 *     { id: '2', question: '3/4 - 1/4 = ?', options: ['1/2', '2/4', '1/4', '2/8'], correctIndex: 0 },
 *   ]}
 *   xpPerQuestion={10}
 *   completionBonus={50}
 *   onComplete={(results) => handleResults(results)}
 * />
 * ```
 */
export function ChallengeIntent({
  title = 'Reto Relámpago',
  timeLimit,
  questions,
  xpPerQuestion = 10,
  completionBonus = 50,
  onComplete,
  className,
}: ChallengeIntentProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLowTime = timeLeft <= 10;
  const progress = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  // Timer
  useEffect(() => {
    if (!started || isFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, isFinished]);

  const handleAnswer = useCallback(
    (index: number) => {
      if (selectedAnswer !== null || !started) return;

      setSelectedAnswer(index);
      const isCorrect = index === currentQuestion.correctIndex;
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }

      setShowResult(true);

      // Auto-advance after short delay
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          setIsFinished(true);
        }
      }, 800);
    },
    [selectedAnswer, started, currentQuestion, currentIndex, questions.length],
  );

  const handleStart = () => {
    setStarted(true);
  };

  const handleFinish = () => {
    onComplete?.({
      correct: correctCount,
      total: questions.length,
      timeLeft,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start screen
  if (!started) {
    return (
      <div
        className={clsx(
          'h-[100dvh] w-full overflow-hidden relative flex flex-col items-center justify-center',
          className,
        )}
        style={{ background: backgrounds.base }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center px-6 max-w-md"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="level" className="inline-flex items-center gap-2 mb-6">
              <Zap className="w-4 h-4" />
              Reto
            </Badge>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6"
          >
            <Timer className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-3xl font-bold text-white mb-4">
            {title}
          </motion.h1>

          <motion.div variants={fadeUp} className="space-y-2 text-white/60 mb-8">
            <p>
              <strong className="text-white">{questions.length}</strong> preguntas
            </p>
            <p>
              <strong className="text-white">{formatTime(timeLimit)}</strong> de tiempo
            </p>
            <p>
              <strong className="text-amber-400">+{xpPerQuestion} XP</strong> por respuesta correcta
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Button variant="primary" size="lg" onClick={handleStart}>
              <Zap className="w-5 h-5 mr-2" />
              ¡Empezar Reto!
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Finished screen
  if (isFinished) {
    const totalXP =
      correctCount * xpPerQuestion + (correctCount === questions.length ? completionBonus : 0);
    const isPerfect = correctCount === questions.length;

    return (
      <div
        className={clsx(
          'h-[100dvh] w-full overflow-hidden relative flex flex-col items-center justify-center',
          className,
        )}
        style={{ background: backgrounds.base }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center px-6 max-w-md"
        >
          <motion.div
            variants={fadeUp}
            className={clsx(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
              isPerfect
                ? 'bg-gradient-to-br from-amber-500 to-yellow-400'
                : 'bg-gradient-to-br from-blue-500 to-cyan-400',
            )}
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-3xl font-bold text-white mb-2">
            {isPerfect ? '¡Perfecto!' : timeLeft === 0 ? '¡Tiempo!' : '¡Reto Completado!'}
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="p-6 rounded-2xl mt-6"
            style={{
              background: backgrounds.card,
              backdropFilter: `blur(${blur.md})`,
              border: `1px solid ${borders.subtle}`,
            }}
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-white">
                  {correctCount}/{questions.length}
                </p>
                <p className="text-white/50 text-sm">Correctas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400">+{totalXP}</p>
                <p className="text-white/50 text-sm">XP Ganados</p>
              </div>
            </div>
            {isPerfect && (
              <p className="text-green-400 mt-4 text-sm">
                +{completionBonus} XP bonus por respuestas perfectas
              </p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <Button variant="primary" size="lg" onClick={handleFinish}>
              Continuar
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Active challenge
  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Header with timer */}
      <div className="relative z-10 px-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="level" className="inline-flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            Pregunta {currentIndex + 1}/{questions.length}
          </Badge>

          <motion.div
            animate={isLowTime ? 'animate' : undefined}
            variants={isLowTime ? pulseWarning : undefined}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-full',
              isLowTime ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white',
            )}
          >
            <Timer className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full max-w-xl"
          >
            {/* Question text */}
            <div
              className="p-6 rounded-2xl mb-6 text-center"
              style={{
                background: backgrounds.card,
                backdropFilter: `blur(${blur.md})`,
                border: `1px solid ${borders.subtle}`,
              }}
            >
              <p className="text-xl md:text-2xl text-white font-medium">
                {currentQuestion.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === currentQuestion.correctIndex;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={i}
                    variants={optionVariants}
                    initial="idle"
                    whileHover={selectedAnswer === null ? 'hover' : undefined}
                    whileTap={selectedAnswer === null ? 'tap' : undefined}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={clsx(
                      'p-4 rounded-xl font-medium transition-colors text-left',
                      selectedAnswer === null && 'cursor-pointer',
                    )}
                    style={{
                      background: showCorrect
                        ? 'rgba(34, 197, 94, 0.2)'
                        : showIncorrect
                          ? 'rgba(239, 68, 68, 0.2)'
                          : backgrounds.card,
                      backdropFilter: `blur(${blur.md})`,
                      border: showCorrect
                        ? '2px solid #22c55e'
                        : showIncorrect
                          ? '2px solid #ef4444'
                          : `1px solid ${borders.subtle}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                          showCorrect
                            ? 'bg-green-500 text-white'
                            : showIncorrect
                              ? 'bg-red-500 text-white'
                              : 'bg-white/10 text-white/70',
                        )}
                      >
                        {showCorrect ? (
                          '✓'
                        ) : showIncorrect ? (
                          <X className="w-4 h-4" />
                        ) : (
                          String.fromCharCode(65 + i)
                        )}
                      </span>
                      <span className="text-white">{option}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

ChallengeIntent.displayName = 'ChallengeIntent';
