'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { BookOpen, Volume2 } from 'lucide-react';
import { Card, Button } from '@mateatletas/ui/primitives';
import { Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings, shadows, radius } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface DefineIntentProps {
  /** The term being defined */
  term: string;
  /** The definition text */
  definition: string;
  /** Optional pronunciation guide */
  pronunciation?: string;
  /** Optional example showing the term in context */
  example?: string;
  /** Visual element (image, diagram, formula) */
  visual?: ReactNode;
  /** Category label (e.g., "Concepto", "Fórmula", "Vocabulario") */
  category?: string;
  /** Enable text-to-speech for the term */
  enableAudio?: boolean;
  /** Called when user clicks continue */
  onContinue?: () => void;
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
      delayChildren: 0.05,
    },
  },
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: lessonSprings.card,
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: lessonSprings.button,
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * DefineIntent - Definition slide for vocabulary/concepts
 *
 * Presents a term with its definition, optional visual, and example.
 * Designed for clear comprehension of new vocabulary.
 *
 * @example
 * ```tsx
 * <DefineIntent
 *   term="Numerador"
 *   definition="El número que está arriba de la línea de fracción. Indica cuántas partes tomamos del total."
 *   category="Concepto"
 *   example="En 3/4, el numerador es 3"
 *   visual={<FractionVisual numerator={3} denominator={4} />}
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function DefineIntent({
  term,
  definition,
  pronunciation,
  example,
  visual,
  category = 'Definición',
  enableAudio = false,
  onContinue,
  className,
}: DefineIntentProps) {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(term);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={clsx(
        'h-[100dvh] w-full overflow-hidden relative flex items-center justify-center p-6',
        className,
      )}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />

      {/* Main content - horizontal layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl flex items-stretch gap-8"
      >
        {/* Left side - Definition */}
        <div className="flex-1 flex flex-col">
          {/* Category badge */}
          <motion.div variants={slideIn} className="mb-4">
            <Badge variant="level" className="inline-flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              {category}
            </Badge>
          </motion.div>

          {/* Term */}
          <motion.div variants={slideIn} className="flex items-center gap-4 mb-6">
            <h1
              className="text-4xl md:text-5xl font-bold"
              style={{ color: 'var(--house-primary)' }}
            >
              {term}
            </h1>
            {enableAudio && (
              <button
                onClick={handleSpeak}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ border: `1px solid ${borders.subtle}` }}
                aria-label="Escuchar pronunciación"
              >
                <Volume2 className="w-5 h-5 text-white/60" />
              </button>
            )}
          </motion.div>

          {/* Pronunciation */}
          {pronunciation && (
            <motion.p variants={slideIn} className="text-white/50 text-lg mb-4 font-mono">
              /{pronunciation}/
            </motion.p>
          )}

          {/* Definition */}
          <motion.div
            variants={fadeUp}
            className="p-6 rounded-2xl mb-6"
            style={{
              background: backgrounds.card,
              backdropFilter: `blur(${blur.md})`,
              border: `1px solid ${borders.subtle}`,
            }}
          >
            <p className="text-xl text-white/90 leading-relaxed">{definition}</p>
          </motion.div>

          {/* Example */}
          {example && (
            <motion.div
              variants={fadeUp}
              className="p-4 rounded-xl"
              style={{
                background: 'var(--house-primary-alpha)',
                border: `1px solid var(--house-primary)`,
                borderLeftWidth: '4px',
              }}
            >
              <p className="text-sm text-white/60 mb-1 uppercase tracking-wider font-medium">
                Ejemplo
              </p>
              <p className="text-white/90">{example}</p>
            </motion.div>
          )}

          {/* Continue button */}
          <motion.div variants={fadeUp} className="mt-auto pt-6">
            <Button variant="primary" size="lg" onClick={onContinue}>
              Continuar
            </Button>
          </motion.div>
        </div>

        {/* Right side - Visual */}
        {visual && (
          <motion.div
            variants={scaleIn}
            className="flex-1 max-w-md flex items-center justify-center"
          >
            <div
              className="w-full aspect-square rounded-3xl flex items-center justify-center p-8"
              style={{
                background: backgrounds.card,
                backdropFilter: `blur(${blur.md})`,
                border: `1px solid ${borders.subtle}`,
                boxShadow: shadows.card,
              }}
            >
              {visual}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

DefineIntent.displayName = 'DefineIntent';
