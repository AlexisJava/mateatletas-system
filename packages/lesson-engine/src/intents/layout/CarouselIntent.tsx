'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, GalleryHorizontal } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface CarouselSlide {
  /** Unique identifier */
  id: string;
  /** Slide content */
  content: React.ReactNode;
  /** Optional title */
  title?: string;
  /** Optional caption */
  caption?: string;
}

export interface CarouselIntentProps {
  /** Title above carousel */
  title?: string;
  /** Carousel slides */
  slides: CarouselSlide[];
  /** Start at specific slide index */
  startAt?: number;
  /** Category badge */
  category?: string;
  /** Show slide counter */
  showCounter?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Auto-advance interval in ms (0 to disable) */
  autoAdvance?: number;
  /** Show continue button (only on last slide) */
  showContinue?: boolean;
  /** CTA text */
  ctaText?: string;
  /** Called when continuing */
  onContinue?: () => void;
  /** Additional class names */
  className?: string;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: lessonSprings.card,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CarouselIntent - Horizontal slide carousel
 *
 * Navigate through slides with swipe gestures or arrows.
 * Perfect for step-by-step examples or visual galleries.
 *
 * @example
 * ```tsx
 * <CarouselIntent
 *   title="Ejemplos de Fracciones"
 *   slides={[
 *     { id: '1', title: 'Pizza', content: <PizzaExample /> },
 *     { id: '2', title: 'Pastel', content: <CakeExample /> },
 *     { id: '3', title: 'Chocolate', content: <ChocolateExample /> },
 *   ]}
 *   showDots
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function CarouselIntent({
  title,
  slides,
  startAt = 0,
  category = 'Galería',
  showCounter = true,
  showDots = true,
  autoAdvance = 0,
  showContinue = true,
  ctaText = 'Continuar',
  onContinue,
  className,
}: CarouselIntentProps) {
  const [[currentIndex, direction], setSlide] = useState([startAt, 0]);

  const currentSlide = slides[currentIndex];
  const isLastSlide = currentIndex === slides.length - 1;
  const isFirstSlide = currentIndex === 0;

  const paginate = (newDirection: number) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < slides.length) {
      setSlide([nextIndex, newDirection]);
    }
  };

  const goToSlide = (index: number) => {
    const direction = index > currentIndex ? 1 : -1;
    setSlide([index, direction]);
  };

  // Auto-advance effect
  // Commented out to avoid complexity - can be enabled if needed
  // useEffect(() => {
  //   if (autoAdvance > 0 && !isLastSlide) {
  //     const timer = setTimeout(() => paginate(1), autoAdvance);
  //     return () => clearTimeout(timer);
  //   }
  // }, [currentIndex, autoAdvance, isLastSlide]);

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pt-6 flex items-start justify-between"
      >
        <div>
          <Badge variant="level" className="inline-flex items-center gap-2 mb-3">
            <GalleryHorizontal className="w-3.5 h-3.5" />
            {category}
          </Badge>
          {title && <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>}
        </div>

        {showCounter && (
          <div className="px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-sm font-medium">
            {currentIndex + 1} / {slides.length}
          </div>
        )}
      </motion.div>

      {/* Carousel content */}
      <div className="flex-1 relative z-10 px-6 py-6 flex items-center">
        {/* Navigation arrows */}
        <button
          onClick={() => paginate(-1)}
          disabled={isFirstSlide}
          className={clsx(
            'absolute left-2 md:left-4 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all',
            isFirstSlide
              ? 'opacity-30 cursor-not-allowed bg-white/5'
              : 'bg-white/10 hover:bg-white/20 cursor-pointer',
          )}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        <button
          onClick={() => paginate(1)}
          disabled={isLastSlide}
          className={clsx(
            'absolute right-2 md:right-4 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all',
            isLastSlide
              ? 'opacity-30 cursor-not-allowed bg-white/5'
              : 'bg-white/10 hover:bg-white/20 cursor-pointer',
          )}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        {/* Slide container */}
        <div className="w-full max-w-3xl mx-auto overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: backgrounds.card,
                  backdropFilter: `blur(${blur.md})`,
                  border: `1px solid ${borders.subtle}`,
                }}
              >
                {/* Slide title */}
                {currentSlide.title && (
                  <div className="px-6 pt-5">
                    <h3 className="text-lg font-semibold text-white">{currentSlide.title}</h3>
                  </div>
                )}

                {/* Slide content */}
                <div className="p-6">{currentSlide.content}</div>

                {/* Slide caption */}
                {currentSlide.caption && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-white/50">{currentSlide.caption}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer with dots and continue */}
      <div className="relative z-10 px-6 pb-6 flex flex-col items-center gap-4">
        {/* Dot indicators */}
        {showDots && slides.length > 1 && (
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={clsx(
                  'h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-6 bg-[var(--house-primary)]'
                    : 'w-2 bg-white/20 hover:bg-white/40',
                )}
              />
            ))}
          </div>
        )}

        {/* Continue button (only on last slide) */}
        {showContinue && isLastSlide && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={lessonSprings.button}
          >
            <Button variant="primary" size="lg" onClick={onContinue}>
              {ctaText}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

CarouselIntent.displayName = 'CarouselIntent';
