'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Link2, RotateCcw, Check } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface MatchPair {
  /** Unique identifier */
  id: string;
  /** Left side item (question/term) */
  left: string;
  /** Right side item (answer/definition) */
  right: string;
}

export interface MatchingIntentProps {
  /** Title/instruction */
  title?: string;
  /** Pairs to match */
  pairs: MatchPair[];
  /** Feedback for all correct */
  successFeedback?: string;
  /** XP to award */
  xpReward?: number;
  /** Called when completed */
  onComplete?: (allCorrect: boolean) => void;
  /** Additional class names */
  className?: string;
}

interface Connection {
  leftId: string;
  rightId: string;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

const itemVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02, transition: lessonSprings.button },
  selected: { scale: 1.02, transition: lessonSprings.button },
};

// =============================================================================
// HELPERS
// =============================================================================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * MatchingIntent - Connect pairs activity
 *
 * User connects items from left column to right column.
 * Visual feedback shows correct/incorrect matches.
 *
 * @example
 * ```tsx
 * <MatchingIntent
 *   title="Conecta cada fracción con su representación"
 *   pairs={[
 *     { id: '1', left: '1/2', right: 'Mitad' },
 *     { id: '2', left: '1/4', right: 'Cuarto' },
 *     { id: '3', left: '3/4', right: 'Tres cuartos' },
 *   ]}
 *   onComplete={(correct) => handleResult(correct)}
 * />
 * ```
 */
export function MatchingIntent({
  title = 'Conecta los pares',
  pairs,
  successFeedback = '¡Excelente! Todos los pares son correctos',
  xpReward = 20,
  onComplete,
  className,
}: MatchingIntentProps) {
  // Shuffle right side on initial render
  const [shuffledRight] = useState(() =>
    shuffleArray(pairs.map((p) => ({ id: p.id, text: p.right }))),
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Check if all pairs are connected
  const allConnected = connections.length === pairs.length;

  // Check if all connections are correct
  const allCorrect = connections.every((conn) => conn.leftId === conn.rightId);

  // Get connection for a left item
  const getConnectionForLeft = (leftId: string) => connections.find((c) => c.leftId === leftId);

  // Get connection for a right item
  const getConnectionForRight = (rightId: string) => connections.find((c) => c.rightId === rightId);

  // Check if a specific connection is correct
  const isConnectionCorrect = (conn: Connection) => conn.leftId === conn.rightId;

  const handleLeftClick = useCallback(
    (leftId: string) => {
      if (showResults) return;

      // If already connected, disconnect
      const existingConn = getConnectionForLeft(leftId);
      if (existingConn) {
        setConnections((prev) => prev.filter((c) => c.leftId !== leftId));
        setSelectedLeft(null);
        return;
      }

      setSelectedLeft(leftId);
    },
    [showResults, connections],
  );

  const handleRightClick = useCallback(
    (rightId: string) => {
      if (showResults || !selectedLeft) return;

      // If right is already connected, disconnect it first
      const existingConn = getConnectionForRight(rightId);
      if (existingConn) {
        setConnections((prev) => prev.filter((c) => c.rightId !== rightId));
      }

      // Create new connection
      setConnections((prev) => {
        // Remove any existing connection from selected left
        const filtered = prev.filter((c) => c.leftId !== selectedLeft);
        return [...filtered, { leftId: selectedLeft, rightId }];
      });

      setSelectedLeft(null);
    },
    [showResults, selectedLeft],
  );

  const handleCheck = () => {
    setShowResults(true);
  };

  const handleRetry = () => {
    setConnections([]);
    setSelectedLeft(null);
    setShowResults(false);
  };

  const handleContinue = () => {
    onComplete?.(allCorrect);
  };

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
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
            <Link2 className="w-3.5 h-3.5" />
            Conectar
          </Badge>
          {showResults && allCorrect && (
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
      </motion.div>

      {/* Main content */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6 py-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl"
        >
          {/* Matching grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left column */}
            <div className="flex flex-col gap-3">
              {pairs.map((pair) => {
                const conn = getConnectionForLeft(pair.id);
                const isSelected = selectedLeft === pair.id;
                const isCorrect = showResults && conn && isConnectionCorrect(conn);
                const isIncorrect = showResults && conn && !isConnectionCorrect(conn);

                return (
                  <motion.button
                    key={pair.id}
                    variants={itemVariants}
                    initial="idle"
                    whileHover={!showResults ? 'hover' : undefined}
                    animate={isSelected ? 'selected' : 'idle'}
                    onClick={() => handleLeftClick(pair.id)}
                    disabled={showResults}
                    className={clsx(
                      'p-4 rounded-xl text-left transition-colors relative',
                      !showResults && 'cursor-pointer',
                    )}
                    style={{
                      background: isCorrect
                        ? 'rgba(34, 197, 94, 0.2)'
                        : isIncorrect
                          ? 'rgba(239, 68, 68, 0.2)'
                          : isSelected
                            ? 'var(--house-primary-alpha)'
                            : backgrounds.card,
                      backdropFilter: `blur(${blur.md})`,
                      border: isCorrect
                        ? '2px solid #22c55e'
                        : isIncorrect
                          ? '2px solid #ef4444'
                          : isSelected
                            ? '2px solid var(--house-primary)'
                            : conn
                              ? '2px solid var(--house-secondary)'
                              : `1px solid ${borders.subtle}`,
                    }}
                  >
                    <span className="text-white font-medium">{pair.left}</span>
                    {conn && (
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                        style={{
                          background: isCorrect
                            ? '#22c55e'
                            : isIncorrect
                              ? '#ef4444'
                              : 'var(--house-secondary)',
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-3">
              {shuffledRight.map((item) => {
                const conn = getConnectionForRight(item.id);
                const isConnected = !!conn;
                const isCorrect = showResults && conn && isConnectionCorrect(conn);
                const isIncorrect = showResults && conn && !isConnectionCorrect(conn);
                const canSelect = selectedLeft !== null && !showResults;

                return (
                  <motion.button
                    key={item.id}
                    variants={itemVariants}
                    initial="idle"
                    whileHover={canSelect ? 'hover' : undefined}
                    onClick={() => handleRightClick(item.id)}
                    disabled={!canSelect}
                    className={clsx(
                      'p-4 rounded-xl text-left transition-colors relative',
                      canSelect && 'cursor-pointer',
                      !canSelect && !showResults && 'opacity-70',
                    )}
                    style={{
                      background: isCorrect
                        ? 'rgba(34, 197, 94, 0.2)'
                        : isIncorrect
                          ? 'rgba(239, 68, 68, 0.2)'
                          : isConnected
                            ? 'rgba(255,255,255,0.08)'
                            : backgrounds.card,
                      backdropFilter: `blur(${blur.md})`,
                      border: isCorrect
                        ? '2px solid #22c55e'
                        : isIncorrect
                          ? '2px solid #ef4444'
                          : isConnected
                            ? '2px solid var(--house-secondary)'
                            : `1px solid ${borders.subtle}`,
                    }}
                  >
                    {conn && (
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                        style={{
                          background: isCorrect
                            ? '#22c55e'
                            : isIncorrect
                              ? '#ef4444'
                              : 'var(--house-secondary)',
                        }}
                      />
                    )}
                    <span className={clsx('text-white font-medium', conn && 'ml-5')}>
                      {item.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={lessonSprings.card}
                className="mt-6 flex items-start gap-4"
              >
                <BitMascot mood={allCorrect ? 'celebrating' : 'thinking'} size="sm" />
                <div
                  className="flex-1 p-4 rounded-2xl"
                  style={{
                    background: allCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: `1px solid ${allCorrect ? '#22c55e' : '#f59e0b'}`,
                  }}
                >
                  <p
                    className="font-semibold text-lg"
                    style={{ color: allCorrect ? '#22c55e' : '#f59e0b' }}
                  >
                    {allCorrect
                      ? successFeedback
                      : `${connections.filter(isConnectionCorrect).length} de ${pairs.length} correctos`}
                  </p>
                  {!allCorrect && (
                    <p className="text-white/70 mt-1">Revisa las conexiones marcadas en rojo</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer actions */}
      <div className="relative z-10 px-6 pb-6 flex justify-center gap-4">
        {!showResults && allConnected && (
          <Button variant="primary" size="lg" onClick={handleCheck}>
            <Check className="w-5 h-5 mr-2" />
            Verificar
          </Button>
        )}

        {showResults && !allCorrect && (
          <Button variant="ghost" onClick={handleRetry}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Reintentar
          </Button>
        )}

        {showResults && (
          <Button variant="primary" size="lg" onClick={handleContinue}>
            Continuar
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

MatchingIntent.displayName = 'MatchingIntent';
