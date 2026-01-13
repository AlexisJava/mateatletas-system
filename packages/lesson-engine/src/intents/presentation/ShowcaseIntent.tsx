'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, ChevronLeft, Image as ImageIcon, Eye } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface ShowcaseItem {
  /** Unique identifier */
  id: string;
  /** Title for this example */
  title: string;
  /** Description or caption */
  description?: string;
  /** Image URL or visual content */
  image?: string;
  /** Custom visual element (instead of image) */
  visual?: ReactNode;
  /** Optional tag/label */
  tag?: string;
}

export interface ShowcaseIntentProps {
  /** Page title */
  title: string;
  /** Items to showcase */
  items: ShowcaseItem[];
  /** Layout variant */
  variant?: 'gallery' | 'carousel' | 'grid';
  /** Called when showcase is completed */
  onComplete?: () => void;
  /** Show item counter */
  showCounter?: boolean;
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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: lessonSprings.card,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  }),
};

const thumbnailVariants = {
  inactive: { opacity: 0.5, scale: 0.95 },
  active: { opacity: 1, scale: 1, transition: lessonSprings.button },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ShowcaseIntent - Gallery of visual examples
 *
 * Presents a collection of images/visuals with horizontal navigation.
 * Perfect for showing examples, step results, or visual concepts.
 *
 * @example
 * ```tsx
 * <ShowcaseIntent
 *   title="Ejemplos de Fracciones"
 *   items={[
 *     { id: '1', title: 'Pizza', description: '1/4 de pizza', image: '/pizza.png' },
 *     { id: '2', title: 'Pastel', description: '1/2 de pastel', image: '/cake.png' },
 *     { id: '3', title: 'Chocolate', description: '3/4 de barra', image: '/choco.png' },
 *   ]}
 *   onComplete={() => nextSlide()}
 * />
 * ```
 */
export function ShowcaseIntent({
  title,
  items,
  variant = 'carousel',
  onComplete,
  showCounter = true,
  className,
}: ShowcaseIntentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentItem = items[currentIndex];
  const isFirstItem = currentIndex === 0;
  const isLastItem = currentIndex === items.length - 1;

  const goToItem = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= items.length) return;
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    if (isLastItem) {
      onComplete?.();
    } else {
      goToItem(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    goToItem(currentIndex - 1);
  };

  // Grid layout for 'grid' variant
  if (variant === 'grid') {
    return (
      <div
        className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
        style={{ background: backgrounds.base }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'var(--house-primary)',
            filter: `blur(${blur['2xl']})`,
            opacity: 0.08,
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
              <Eye className="w-3.5 h-3.5" />
              Galería
            </Badge>
            {showCounter && <span className="text-sm text-white/50">{items.length} ejemplos</span>}
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mt-3">
            {title}
          </motion.h1>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 relative z-10 p-6 grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-min overflow-x-auto"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
              style={{
                background: backgrounds.card,
                backdropFilter: `blur(${blur.md})`,
                border: `1px solid ${borders.subtle}`,
              }}
              onClick={() => goToItem(items.indexOf(item))}
            >
              {/* Image */}
              <div className="aspect-video relative">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : item.visual ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {item.visual}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <ImageIcon className="w-10 h-10 text-white/30" />
                  </div>
                )}
                {item.tag && (
                  <div
                    className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      background: 'var(--house-primary)',
                      color: 'white',
                    }}
                  >
                    {item.tag}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                {item.description && (
                  <p className="text-white/60 text-xs mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Continue button */}
        <div className="relative z-10 px-6 pb-6 flex justify-center">
          <Button variant="primary" size="lg" onClick={onComplete}>
            Continuar
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Carousel/Gallery layout
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
          opacity: 0.1,
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pt-6"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Badge variant="level" className="inline-flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            Galería
          </Badge>
          {showCounter && (
            <span className="text-sm text-white/50">
              {currentIndex + 1} / {items.length}
            </span>
          )}
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mt-3">
          {title}
        </motion.h1>
      </motion.div>

      {/* Main content area */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentItem.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative"
            >
              {/* Main showcase card */}
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: backgrounds.card,
                  backdropFilter: `blur(${blur.md})`,
                  border: `1px solid ${borders.subtle}`,
                }}
              >
                {/* Visual area */}
                <div className="aspect-video relative">
                  {currentItem.image ? (
                    <img
                      src={currentItem.image}
                      alt={currentItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : currentItem.visual ? (
                    <div className="w-full h-full flex items-center justify-center p-8">
                      {currentItem.visual}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <ImageIcon className="w-20 h-20 text-white/30" />
                    </div>
                  )}
                  {currentItem.tag && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-sm font-medium"
                      style={{
                        background: 'var(--house-primary)',
                        color: 'white',
                      }}
                    >
                      {currentItem.tag}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-white">{currentItem.title}</h2>
                  {currentItem.description && (
                    <p className="text-white/70 mt-2 text-base md:text-lg leading-relaxed">
                      {currentItem.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Thumbnails (gallery variant) */}
      {variant === 'gallery' && items.length > 1 && (
        <div className="relative z-10 px-6 pb-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {items.map((item, idx) => (
              <motion.button
                key={item.id}
                variants={thumbnailVariants}
                animate={idx === currentIndex ? 'active' : 'inactive'}
                onClick={() => goToItem(idx)}
                className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden"
                style={{
                  border:
                    idx === currentIndex
                      ? '2px solid var(--house-primary)'
                      : `1px solid ${borders.subtle}`,
                }}
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white/30" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="relative z-10 px-6 pb-6">
        {/* Progress dots (carousel variant) */}
        {variant === 'carousel' && items.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => goToItem(idx)}
                className={clsx(
                  'h-2 rounded-full transition-all duration-300',
                  idx === currentIndex ? 'w-8' : 'w-2 hover:bg-white/30',
                  idx === currentIndex ? '' : 'bg-white/20',
                )}
                style={{
                  background: idx === currentIndex ? 'var(--house-primary)' : undefined,
                }}
                aria-label={`Ver ejemplo ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirstItem}
            className={clsx(isFirstItem && 'opacity-0 pointer-events-none')}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Anterior
          </Button>

          <Button variant="primary" size="lg" onClick={handleNext}>
            {isLastItem ? (
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

ShowcaseIntent.displayName = 'ShowcaseIntent';
