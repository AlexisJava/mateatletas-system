'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, ChevronLeft, MessageCircle } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface StorySegment {
  /** Text content */
  text: string;
  /** Bit's mood for this segment */
  mood?: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'excited';
  /** Optional highlight/emphasis */
  highlight?: string;
}

export interface StoryIntentProps {
  /** Story segments (each is a "speech bubble") */
  segments: StorySegment[];
  /** Optional title */
  title?: string;
  /** Called when story is completed */
  onComplete?: () => void;
  /** Show navigation dots */
  showDots?: boolean;
  /** Mascot position */
  mascotPosition?: 'left' | 'center';
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

const bubbleVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: lessonSprings.card,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const mascotFloat = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * StoryIntent - Narrative/story slide with Bit mascot
 *
 * Presents story segments as speech bubbles from Bit.
 * Navigation is horizontal between segments.
 *
 * @example
 * ```tsx
 * <StoryIntent
 *   title="Una aventura matemática"
 *   segments={[
 *     { text: "¡Hola! Soy Bit, tu guía de matemáticas.", mood: "happy" },
 *     { text: "Hoy vamos a explorar las fracciones.", mood: "thinking" },
 *     { text: "¿Estás listo para la aventura?", mood: "celebrating" },
 *   ]}
 *   onComplete={() => nextSlide()}
 * />
 * ```
 */
export function StoryIntent({
  segments,
  title,
  onComplete,
  showDots = true,
  mascotPosition = 'left',
  className,
}: StoryIntentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const segment = segments[currentIndex];
  const isLastSegment = currentIndex === segments.length - 1;
  const isFirstSegment = currentIndex === 0;

  const goToSegment = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= segments.length) return;
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    if (isLastSegment) {
      onComplete?.();
    } else {
      goToSegment(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    goToSegment(currentIndex - 1);
  };

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.08,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-secondary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.06,
        }}
      />

      {/* Header */}
      {title && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-6 pt-6"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <Badge variant="level" className="inline-flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5" />
              Historia
            </Badge>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mt-3">
            {title}
          </motion.h1>
        </motion.div>
      )}

      {/* Main content */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6">
        <div
          className={clsx(
            'w-full max-w-4xl flex items-center gap-8',
            mascotPosition === 'center' && 'flex-col',
          )}
        >
          {/* Bit mascot */}
          <motion.div
            variants={mascotFloat}
            animate="animate"
            className={clsx('flex-shrink-0', mascotPosition === 'center' && 'order-first')}
          >
            <BitMascot mood={segment.mood || 'happy'} size="md" />
          </motion.div>

          {/* Speech bubble */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={bubbleVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative"
              >
                {/* Bubble */}
                <div
                  className="p-8 rounded-3xl relative"
                  style={{
                    background: backgrounds.card,
                    backdropFilter: `blur(${blur.md})`,
                    border: `1px solid ${borders.subtle}`,
                  }}
                >
                  {/* Tail pointing to mascot */}
                  {mascotPosition === 'left' && (
                    <div
                      className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 w-6 h-6 rotate-45"
                      style={{
                        background: backgrounds.card,
                        border: `1px solid ${borders.subtle}`,
                        borderRight: 'none',
                        borderTop: 'none',
                      }}
                    />
                  )}

                  {/* Text */}
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                    {segment.text}
                  </p>

                  {/* Highlight */}
                  {segment.highlight && (
                    <div
                      className="mt-4 p-3 rounded-xl inline-block"
                      style={{
                        background: 'var(--house-primary-alpha)',
                        border: '1px solid var(--house-primary)',
                      }}
                    >
                      <p className="font-semibold" style={{ color: 'var(--house-primary)' }}>
                        {segment.highlight}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 px-6 pb-6">
        {/* Dots */}
        {showDots && segments.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {segments.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSegment(idx)}
                className={clsx(
                  'h-2 rounded-full transition-all duration-300',
                  idx === currentIndex ? 'w-8' : 'w-2 hover:bg-white/30',
                  idx === currentIndex ? '' : 'bg-white/20',
                )}
                style={{
                  background: idx === currentIndex ? 'var(--house-primary)' : undefined,
                }}
                aria-label={`Ir al segmento ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirstSegment}
            className={clsx(isFirstSegment && 'opacity-0 pointer-events-none')}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Anterior
          </Button>

          <Button variant="primary" size="lg" onClick={handleNext}>
            {isLastSegment ? (
              'Continuar'
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

StoryIntent.displayName = 'StoryIntent';
