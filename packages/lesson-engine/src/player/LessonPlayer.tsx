'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { backgrounds } from '@mateatletas/ui/tokens';
import { IntentRegistry } from '../renderer/IntentRegistry';
import { LessonProvider, useLessonContext, type LessonMetadata } from '../context/LessonContext';
import { registerAllIntents, areIntentsRegistered } from '../intents/registerIntents';

// =============================================================================
// TYPES
// =============================================================================

export interface SlideDefinition {
  /** Unique slide ID */
  id: string;
  /** Intent type (e.g., 'presentation:hero', 'interaction:quiz-mc') */
  intent: string;
  /** Props passed to the intent component */
  props: Record<string, unknown>;
  /** XP awarded for completing this slide */
  xp?: number;
}

export interface LessonDefinition {
  /** Lesson metadata */
  metadata: LessonMetadata;
  /** Array of slides */
  slides: SlideDefinition[];
}

export interface LessonPlayerProps {
  /** The lesson to render */
  lesson: LessonDefinition;
  /** Called when lesson is completed */
  onComplete?: (result: LessonResult) => void;
  /** Called when a slide is completed */
  onSlideComplete?: (slideId: string, slideIndex: number, result?: unknown) => void;
  /** Called on exit (back button, etc.) */
  onExit?: () => void;
  /** House colors for theming */
  houseColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
}

export interface LessonResult {
  lessonId: string;
  totalXp: number;
  completedSlides: number;
  answers: Record<string, unknown>;
  duration: number;
}

// =============================================================================
// SLIDE TRANSITION VARIANTS
// =============================================================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  }),
};

// =============================================================================
// INTERNAL PLAYER COMPONENT
// =============================================================================

interface InternalPlayerProps {
  slides: SlideDefinition[];
  onSlideComplete?: (slideId: string, slideIndex: number, result?: unknown) => void;
  onLessonComplete: () => void;
}

function InternalPlayer({ slides, onSlideComplete, onLessonComplete }: InternalPlayerProps) {
  const { state, nextSlide, addXp, recordAnswer } = useLessonContext();
  const [direction, setDirection] = useState(1);
  const [prevIndex, setPrevIndex] = useState(0);

  const currentSlide = slides[state.currentSlideIndex];
  const isLastSlide = state.currentSlideIndex === slides.length - 1;

  // Track direction for animation
  useEffect(() => {
    setDirection(state.currentSlideIndex > prevIndex ? 1 : -1);
    setPrevIndex(state.currentSlideIndex);
  }, [state.currentSlideIndex, prevIndex]);

  // Handle slide completion
  const handleComplete = useCallback(
    (result?: unknown) => {
      // Record answer if provided
      if (result !== undefined) {
        recordAnswer(currentSlide.id, result);
      }

      // Add XP if slide has it
      if (currentSlide.xp) {
        addXp(currentSlide.xp);
      }

      // Also add XP from result if provided
      if (result && typeof result === 'object' && 'xp' in result) {
        addXp((result as { xp: number }).xp);
      }

      // Notify parent
      onSlideComplete?.(currentSlide.id, state.currentSlideIndex, result);

      // Move to next or complete lesson
      if (isLastSlide) {
        onLessonComplete();
      } else {
        nextSlide();
      }
    },
    [
      currentSlide,
      state.currentSlideIndex,
      isLastSlide,
      addXp,
      recordAnswer,
      nextSlide,
      onSlideComplete,
      onLessonComplete,
    ],
  );

  // Get intent component
  const IntentComponent = IntentRegistry.get(currentSlide.intent);

  if (!IntentComponent) {
    return (
      <div
        className="h-[100dvh] w-full flex items-center justify-center"
        style={{ background: backgrounds.base }}
      >
        <div className="p-6 bg-red-950/90 border border-red-500/20 text-red-200 rounded-xl text-sm font-mono">
          <p className="font-bold mb-2">Intent no registrado</p>
          <p className="text-xs opacity-80">"{currentSlide.intent}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden relative">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="h-full w-full"
        >
          <IntentComponent props={currentSlide.props} onComplete={handleComplete} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// LESSON PLAYER (PUBLIC API)
// =============================================================================

/**
 * LessonPlayer - Fullscreen lesson experience
 *
 * Renders a lesson as a series of fullscreen intents with smooth transitions.
 * Each intent occupies exactly 100dvh (NO SCROLL rule).
 *
 * @example
 * ```tsx
 * <LessonPlayer
 *   lesson={{
 *     metadata: { id: '1', title: 'Fracciones', area: 'math', house: 'quantum', duration: 10, xpTotal: 100 },
 *     slides: [
 *       { id: 's1', intent: 'presentation:hero', props: { title: '¡Bienvenido!' } },
 *       { id: 's2', intent: 'presentation:define', props: { term: 'Fracción', definition: '...' } },
 *       { id: 's3', intent: 'interaction:quiz-mc', props: { question: '...', options: [...] }, xp: 20 },
 *       { id: 's4', intent: 'closure:certificate', props: { title: '¡Completaste!' } },
 *     ]
 *   }}
 *   onComplete={(result) => console.log('Lesson done!', result)}
 *   houseColors={{ primary: '#00d4ff', secondary: '#0066ff' }}
 * />
 * ```
 */
export function LessonPlayer({
  lesson,
  onComplete,
  onSlideComplete,
  onExit: _onExit,
  houseColors = { primary: '#00d4ff', secondary: '#0066ff' },
}: LessonPlayerProps) {
  const [startTime] = useState(() => Date.now());
  const [isCompleted, setIsCompleted] = useState(false);

  // Register intents on mount
  useEffect(() => {
    if (!areIntentsRegistered()) {
      registerAllIntents();
    }
  }, []);

  // Handle lesson completion
  const handleLessonComplete = useCallback(() => {
    if (isCompleted) return;
    setIsCompleted(true);
    // Result will be built in the effect below
  }, [isCompleted]);

  // CSS variables for house theming
  const themeStyle = {
    '--house-primary': houseColors.primary,
    '--house-secondary': houseColors.secondary,
    '--house-accent': houseColors.accent || houseColors.secondary,
    '--house-primary-alpha': `${houseColors.primary}40`,
  } as React.CSSProperties;

  return (
    <div className="h-[100dvh] w-full overflow-hidden" style={themeStyle}>
      <LessonProvider metadata={lesson.metadata} totalSlides={lesson.slides.length}>
        <LessonPlayerInner
          lesson={lesson}
          onSlideComplete={onSlideComplete}
          onComplete={onComplete}
          onLessonComplete={handleLessonComplete}
          startTime={startTime}
          isCompleted={isCompleted}
        />
      </LessonProvider>
    </div>
  );
}

// Inner component that has access to context
interface LessonPlayerInnerProps {
  lesson: LessonDefinition;
  onSlideComplete?: (slideId: string, slideIndex: number, result?: unknown) => void;
  onComplete?: (result: LessonResult) => void;
  onLessonComplete: () => void;
  startTime: number;
  isCompleted: boolean;
}

function LessonPlayerInner({
  lesson,
  onSlideComplete,
  onComplete,
  onLessonComplete,
  startTime,
  isCompleted,
}: LessonPlayerInnerProps) {
  const { state } = useLessonContext();

  // Fire completion callback when lesson is done
  useEffect(() => {
    if (isCompleted && onComplete) {
      const result: LessonResult = {
        lessonId: lesson.metadata.id,
        totalXp: state.xpEarned,
        completedSlides: lesson.slides.length,
        answers: state.answers,
        duration: Math.floor((Date.now() - startTime) / 1000),
      };
      onComplete(result);
    }
  }, [isCompleted, onComplete, lesson, state, startTime]);

  return (
    <InternalPlayer
      slides={lesson.slides}
      onSlideComplete={onSlideComplete}
      onLessonComplete={onLessonComplete}
    />
  );
}

LessonPlayer.displayName = 'LessonPlayer';
