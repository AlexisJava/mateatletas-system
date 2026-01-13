'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Lightbulb, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Card, Button } from '@mateatletas/ui/primitives';
import { Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings, shadows } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface ExplainStep {
  /** Step title */
  title: string;
  /** Step content/explanation */
  content: string;
  /** Optional visual for this step */
  visual?: ReactNode;
  /** Optional tip/note */
  tip?: string;
}

export interface ExplainIntentProps {
  /** Main title of the explanation */
  title: string;
  /** Optional subtitle/context */
  subtitle?: string;
  /** Steps to explain (can be navigated horizontally) */
  steps: ExplainStep[];
  /** Category label */
  category?: string;
  /** Called when all steps are completed */
  onComplete?: () => void;
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

const stepVariants = {
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

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ExplainIntent - Step-by-step explanation slide
 *
 * Presents concepts in sequential steps with horizontal navigation.
 * Each step can have its own visual and tip.
 * NO VERTICAL SCROLL - uses horizontal navigation between steps.
 *
 * @example
 * ```tsx
 * <ExplainIntent
 *   title="¿Cómo sumar fracciones?"
 *   steps={[
 *     { title: "Paso 1", content: "Verifica denominadores iguales", tip: "Si son diferentes, busca MCM" },
 *     { title: "Paso 2", content: "Suma los numeradores" },
 *     { title: "Paso 3", content: "Mantén el denominador" },
 *   ]}
 *   onComplete={() => nextSlide()}
 * />
 * ```
 */
export function ExplainIntent({
  title,
  subtitle,
  steps,
  category = 'Explicación',
  onComplete,
  className,
}: ExplainIntentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const allStepsVisited = visitedSteps.size === steps.length;

  const goToStep = (newStep: number) => {
    if (newStep < 0 || newStep >= steps.length) return;
    setDirection(newStep > currentStep ? 1 : -1);
    setCurrentStep(newStep);
    setVisitedSteps((prev) => new Set([...prev, newStep]));
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      goToStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    goToStep(currentStep - 1);
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
          background: 'var(--house-secondary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.08,
        }}
      />

      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pt-6 pb-4"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-3">
          <Badge variant="level" className="inline-flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" />
            {category}
          </Badge>
          <span className="text-white/40 text-sm">
            {currentStep + 1} de {steps.length}
          </span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-2">
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p variants={fadeUp} className="text-white/60 text-lg">
            {subtitle}
          </motion.p>
        )}
      </motion.div>

      {/* Step progress dots */}
      <div className="relative z-10 px-6 pb-4">
        <div className="flex items-center gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToStep(idx)}
              className={clsx(
                'h-2 rounded-full transition-all duration-300',
                idx === currentStep ? 'w-8' : 'w-2 hover:bg-white/30',
                visitedSteps.has(idx) ? (idx === currentStep ? '' : 'bg-white/40') : 'bg-white/10',
              )}
              style={{
                background: idx === currentStep ? 'var(--house-primary)' : undefined,
              }}
              aria-label={`Ir al paso ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Step content - horizontal navigation */}
      <div className="flex-1 relative z-10 px-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="h-full flex gap-8"
          >
            {/* Step text content */}
            <div className="flex-1 flex flex-col">
              {/* Step number badge */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background:
                    'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
                  boxShadow: shadows.houseGlow,
                }}
              >
                <span className="text-2xl font-bold text-white">{currentStep + 1}</span>
              </div>

              {/* Step title */}
              <h2 className="text-2xl font-bold text-white mb-4">{step.title}</h2>

              {/* Step content */}
              <div
                className="p-6 rounded-2xl mb-6"
                style={{
                  background: backgrounds.card,
                  backdropFilter: `blur(${blur.md})`,
                  border: `1px solid ${borders.subtle}`,
                }}
              >
                <p className="text-xl text-white/90 leading-relaxed">{step.content}</p>
              </div>

              {/* Tip */}
              {step.tip && (
                <div
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-200/90 text-sm">{step.tip}</p>
                </div>
              )}
            </div>

            {/* Step visual */}
            {step.visual && (
              <div className="flex-1 max-w-md flex items-center justify-center">
                <div
                  className="w-full aspect-square rounded-3xl flex items-center justify-center p-8"
                  style={{
                    background: backgrounds.card,
                    backdropFilter: `blur(${blur.md})`,
                    border: `1px solid ${borders.subtle}`,
                  }}
                >
                  {step.visual}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      <div className="relative z-10 px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Previous button */}
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirstStep}
            className={clsx(isFirstStep && 'opacity-0 pointer-events-none')}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Anterior
          </Button>

          {/* Next/Complete button */}
          <Button variant="primary" size="lg" onClick={handleNext}>
            {isLastStep ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Completar
              </>
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

ExplainIntent.displayName = 'ExplainIntent';
