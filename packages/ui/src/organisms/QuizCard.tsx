import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Zap } from 'lucide-react';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { OptionButton } from '../molecules/OptionButton';
import { BitMascot } from './BitMascot';
import { feedback } from '../tokens/lesson';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizCardProps {
  /** The question to display */
  question: string;
  /** Available options */
  options: QuizOption[];
  /** ID of the correct option */
  correctId: string;
  /** Called when answer is submitted with result */
  onAnswer?: (isCorrect: boolean, selectedId: string) => void;
  /** Called when user wants to continue after answering */
  onContinue?: () => void;
  /** Show combo/streak indicator */
  combo?: number;
  /** Time limit in seconds (optional) */
  timeLimit?: number;
  /** Show mascot */
  showMascot?: boolean;
  /** Feedback messages */
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
  /** Additional class names */
  className?: string;
}

type QuizStatus = 'idle' | 'correct' | 'incorrect';

/**
 * QuizCard - Organism for quiz/multiple choice interactions
 *
 * Complete quiz component with question, options, feedback, and mascot.
 * Handles selection, validation, and result display.
 *
 * @example
 * ```tsx
 * <QuizCard
 *   question="¿Qué línea crea una variable 'puntos' con valor 10?"
 *   options={[
 *     { id: 'a', text: 'var puntos = 10' },
 *     { id: 'b', text: 'puntos es 10' },
 *     { id: 'c', text: 'crear puntos(10)' },
 *   ]}
 *   correctId="a"
 *   onAnswer={(isCorrect) => console.log(isCorrect)}
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function QuizCard({
  question,
  options,
  correctId,
  onAnswer,
  onContinue,
  combo,
  timeLimit,
  showMascot = true,
  feedback: feedbackMessages,
  className,
}: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');

  const handleCheck = () => {
    if (!selected) return;

    const isCorrect = selected === correctId;
    setStatus(isCorrect ? 'correct' : 'incorrect');
    onAnswer?.(isCorrect, selected);
  };

  const handleRetry = () => {
    setSelected(null);
    setStatus('idle');
  };

  const handleContinue = () => {
    onContinue?.();
  };

  // Get mascot mood based on status
  const mascotMood = status === 'idle' ? 'thinking' : status === 'correct' ? 'celebrating' : 'sad';

  // Status bar color
  const statusBarColor =
    status === 'idle'
      ? 'var(--house-primary)'
      : status === 'correct'
        ? feedback.correct.solid
        : feedback.incorrect.solid;

  return (
    <div className={clsx('w-full relative', className)}>
      {/* Combo indicator */}
      {combo && combo > 1 && (
        <div className="absolute top-0 right-0 p-4 z-20">
          <Badge variant="xp" pulse>
            <Zap className="w-4 h-4 fill-current" />
            Combo x{combo}
          </Badge>
        </div>
      )}

      {/* Mascot */}
      {showMascot && (
        <div className="flex justify-center -mb-8 relative z-20 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <BitMascot mood={mascotMood} size="sm" />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Main card */}
      <Card variant="quiz" padding="lg" className="relative overflow-hidden">
        {/* Status bar at top */}
        <div
          className="absolute top-0 left-0 w-full h-2 transition-colors duration-500"
          style={{ background: statusBarColor }}
        />

        {/* Question */}
        <h2 className="font-bold text-2xl md:text-3xl text-center mb-8 mt-4 leading-tight text-white">
          {question}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {options.map((opt, index) => (
            <OptionButton
              key={opt.id}
              selected={selected === opt.id}
              submitted={status !== 'idle'}
              isCorrect={opt.id === correctId}
              onClick={() => status === 'idle' && setSelected(opt.id)}
              disabled={status !== 'idle'}
              letter={String.fromCharCode(65 + index)} // A, B, C, D...
            >
              {opt.text}
            </OptionButton>
          ))}
        </div>

        {/* Feedback message */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={clsx(
                'text-center mb-6 p-4 rounded-xl',
                status === 'correct'
                  ? 'bg-green-500/10 text-green-300'
                  : 'bg-red-500/10 text-red-300',
              )}
            >
              {status === 'correct'
                ? feedbackMessages?.correct || '¡Excelente! Respuesta correcta.'
                : feedbackMessages?.incorrect || 'No es correcto. Intenta de nuevo.'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-4">
          {status === 'incorrect' && (
            <Button variant="ghost" onClick={handleRetry} className="flex-1">
              Reintentar
            </Button>
          )}

          <Button
            variant={status === 'correct' ? 'secondary' : 'primary'}
            onClick={status === 'idle' ? handleCheck : handleContinue}
            className="flex-1"
            disabled={!selected && status === 'idle'}
          >
            {status === 'idle' ? 'COMPROBAR' : 'CONTINUAR'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

QuizCard.displayName = 'QuizCard';
