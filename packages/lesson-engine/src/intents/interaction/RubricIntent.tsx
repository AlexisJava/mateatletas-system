'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Award, RotateCcw, Star } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface RubricLevel {
  /** Score for this level */
  score: number;
  /** Short label (e.g., "Excelente", "Bien", "Mejorable") */
  label: string;
  /** Optional description of what this level means */
  description?: string;
}

export interface RubricCriterion {
  /** Unique identifier */
  id: string;
  /** Name of the criterion (e.g., "Claridad", "Completitud") */
  name: string;
  /** Optional description of what this criterion evaluates */
  description?: string;
  /** Scoring levels for this criterion (typically 3-5 levels) */
  levels: RubricLevel[];
}

export interface RubricIntentProps {
  /** Title of the rubric */
  title: string;
  /** Optional instruction text */
  instruction?: string;
  /** Criteria to evaluate */
  criteria: RubricCriterion[];
  /** Minimum total score to pass (optional - if not set, any completion passes) */
  passingScore?: number;
  /** Whether to show the total score */
  showTotal?: boolean;
  /** Feedback for passing */
  correctFeedback?: string;
  /** Feedback for not passing */
  incorrectFeedback?: string;
  /** Whether to show mascot */
  showMascot?: boolean;
  /** XP to award */
  xpReward?: number;
  /** Called when completed */
  onComplete?: (passed: boolean) => void;
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

const criterionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: lessonSprings.card,
  },
};

const levelSelectVariants = {
  unselected: { scale: 1 },
  selected: {
    scale: 1.05,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
};

const feedbackVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: lessonSprings.card,
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * RubricIntent - Self-assessment rubric
 *
 * Students evaluate themselves on multiple criteria, each with defined scoring levels.
 * The system calculates total score and optionally compares to a passing threshold.
 *
 * @example
 * ```tsx
 * <RubricIntent
 *   title="Autoevalúa tu trabajo"
 *   criteria={[
 *     {
 *       id: 'clarity',
 *       name: 'Claridad',
 *       description: 'El trabajo es fácil de entender',
 *       levels: [
 *         { score: 3, label: 'Excelente', description: 'Muy claro' },
 *         { score: 2, label: 'Bueno', description: 'Mayormente claro' },
 *         { score: 1, label: 'Mejorable', description: 'Confuso en partes' },
 *       ],
 *     },
 *     // ... more criteria
 *   ]}
 *   passingScore={6}
 * />
 * ```
 */
export function RubricIntent({
  title,
  instruction,
  criteria,
  passingScore,
  showTotal = true,
  correctFeedback = '¡Excelente autoevaluación! Has demostrado buen criterio',
  incorrectFeedback = 'Sigue trabajando para mejorar tu desempeño',
  showMascot = true,
  xpReward = 20,
  onComplete,
  className,
}: RubricIntentProps): React.ReactElement {
  // Track selected level for each criterion
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  // Calculate evaluation result
  const evaluationResult = useMemo(() => {
    const selectedCount = Object.keys(selectedLevels).length;
    const allSelected = selectedCount === criteria.length;

    // Calculate total score
    const totalScore = Object.values(selectedLevels).reduce((sum, score) => sum + score, 0);

    // Calculate max possible score
    const maxScore = criteria.reduce((sum, criterion) => {
      const maxLevel = Math.max(...criterion.levels.map((l) => l.score));
      return sum + maxLevel;
    }, 0);

    // Determine if passed
    const passed = passingScore !== undefined ? totalScore >= passingScore : allSelected;

    return {
      allSelected,
      totalScore,
      maxScore,
      passed,
      percentage: Math.round((totalScore / maxScore) * 100),
    };
  }, [selectedLevels, criteria, passingScore]);

  // Handlers
  const handleSelectLevel = (criterionId: string, score: number): void => {
    if (showResult) return;

    setSelectedLevels((prev) => ({
      ...prev,
      [criterionId]: score,
    }));
  };

  const handleEvaluate = (): void => {
    if (!evaluationResult.allSelected) return;
    setShowResult(true);
  };

  const handleRetry = (): void => {
    setSelectedLevels({});
    setShowResult(false);
  };

  const handleContinue = (): void => {
    onComplete?.(evaluationResult.passed);
  };

  // Get level color based on score position (higher = greener)
  const getLevelColor = (score: number, levels: RubricLevel[]): string => {
    const maxScore = Math.max(...levels.map((l) => l.score));
    const minScore = Math.min(...levels.map((l) => l.score));
    const range = maxScore - minScore;

    if (range === 0) return 'var(--house-primary)';

    const position = (score - minScore) / range;
    if (position >= 0.66) return '#22c55e'; // green
    if (position >= 0.33) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pt-6"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Badge variant="level" className="inline-flex items-center gap-2">
            <Award className="w-3.5 h-3.5" />
            Rúbrica
          </Badge>
          {showResult && evaluationResult.passed && (
            <Badge
              variant="xp"
              className="inline-flex items-center gap-1"
              style={{ background: 'var(--house-primary)', color: 'white' }}
            >
              +{xpReward} XP
            </Badge>
          )}
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mt-3">
          {title}
        </motion.h1>
        {instruction && (
          <motion.p variants={fadeUp} className="text-white/70 mt-2">
            {instruction}
          </motion.p>
        )}
      </motion.div>

      {/* Main content - scrollable criteria list */}
      <div className="flex-1 relative z-10 overflow-y-auto px-6 py-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto space-y-4"
        >
          {criteria.map((criterion) => {
            const selectedScore = selectedLevels[criterion.id];
            const isSelected = selectedScore !== undefined;

            return (
              <motion.div
                key={criterion.id}
                variants={criterionVariants}
                className="p-5 rounded-2xl"
                style={{
                  background: backgrounds.card,
                  backdropFilter: `blur(${blur.md})`,
                  border: `1px solid ${borders.subtle}`,
                }}
              >
                {/* Criterion header */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-white">{criterion.name}</h3>
                  {criterion.description && (
                    <p className="text-sm text-white/60 mt-1">{criterion.description}</p>
                  )}
                </div>

                {/* Levels */}
                <div className="flex flex-wrap gap-2">
                  {criterion.levels
                    .sort((a, b) => b.score - a.score) // Show highest first
                    .map((level) => {
                      const isLevelSelected = selectedScore === level.score;
                      const levelColor = getLevelColor(level.score, criterion.levels);

                      return (
                        <motion.button
                          key={`${criterion.id}-${level.score}`}
                          variants={levelSelectVariants}
                          animate={isLevelSelected ? 'selected' : 'unselected'}
                          onClick={() => handleSelectLevel(criterion.id, level.score)}
                          disabled={showResult}
                          className={clsx(
                            'flex-1 min-w-[100px] p-3 rounded-xl transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--house-primary)]',
                            !showResult && 'hover:bg-white/10 cursor-pointer',
                            showResult && 'cursor-default',
                            !isLevelSelected && 'bg-white/5 border border-white/10',
                            isLevelSelected && 'border-2',
                          )}
                          style={
                            isLevelSelected
                              ? {
                                  background: `${levelColor}20`,
                                  borderColor: levelColor,
                                }
                              : undefined
                          }
                          aria-pressed={isLevelSelected}
                          aria-label={`${level.label}: ${level.description || ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={clsx(
                                'font-medium',
                                isLevelSelected ? 'text-white' : 'text-white/70',
                              )}
                            >
                              {level.label}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: level.score }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3"
                                  style={{ color: isLevelSelected ? levelColor : 'white' }}
                                  fill={isLevelSelected ? levelColor : 'transparent'}
                                />
                              ))}
                            </div>
                          </div>
                          {level.description && (
                            <p
                              className={clsx(
                                'text-xs text-left',
                                isLevelSelected ? 'text-white/80' : 'text-white/50',
                              )}
                            >
                              {level.description}
                            </p>
                          )}
                        </motion.button>
                      );
                    })}
                </div>
              </motion.div>
            );
          })}

          {/* Score indicator (before evaluation) */}
          {showTotal && !showResult && (
            <motion.div variants={fadeUp} className="text-center text-white/50 text-sm py-2">
              {evaluationResult.allSelected
                ? `Puntuación: ${evaluationResult.totalScore} de ${evaluationResult.maxScore} puntos`
                : `${Object.keys(selectedLevels).length} de ${criteria.length} criterios evaluados`}
            </motion.div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                variants={feedbackVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex items-start gap-4 mt-4"
              >
                {showMascot && (
                  <BitMascot
                    mood={evaluationResult.passed ? 'celebrating' : 'thinking'}
                    size="sm"
                  />
                )}
                <div
                  className="flex-1 p-4 rounded-2xl"
                  style={{
                    background: evaluationResult.passed
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${evaluationResult.passed ? '#22c55e' : '#ef4444'}`,
                  }}
                >
                  <p
                    className="font-semibold text-lg"
                    style={{ color: evaluationResult.passed ? '#22c55e' : '#ef4444' }}
                  >
                    {evaluationResult.passed ? correctFeedback : incorrectFeedback}
                  </p>
                  {showTotal && (
                    <p className="text-white/70 mt-1">
                      Puntuación final: {evaluationResult.totalScore} de {evaluationResult.maxScore}{' '}
                      ({evaluationResult.percentage}%)
                      {passingScore !== undefined && (
                        <span className="text-white/50"> - Requerido: {passingScore} puntos</span>
                      )}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer actions */}
      <div className="relative z-10 px-6 pb-6 flex justify-center gap-4">
        {!showResult && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleEvaluate}
            disabled={!evaluationResult.allSelected}
          >
            <Award className="w-5 h-5 mr-2" />
            Evaluar
          </Button>
        )}

        {showResult && !evaluationResult.passed && (
          <Button variant="ghost" onClick={handleRetry}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Reintentar
          </Button>
        )}

        {showResult && (
          <Button variant="primary" size="lg" onClick={handleContinue}>
            Continuar
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

RubricIntent.displayName = 'RubricIntent';
