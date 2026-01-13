'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Lightbulb, AlertCircle, Info, Star, Zap } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings, shadows } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface HighlightIntentProps {
  /** Main content to highlight */
  content: string;
  /** Title/label for the highlight */
  title?: string;
  /** Type of highlight affects styling and icon */
  type?: 'tip' | 'important' | 'warning' | 'fact' | 'formula';
  /** Optional supporting text */
  supportingText?: string;
  /** Optional visual/icon override */
  icon?: ReactNode;
  /** Optional example */
  example?: string;
  /** Called when user continues */
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
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: lessonSprings.button,
  },
};

const pulseGlow = {
  initial: { opacity: 0.4, scale: 0.95 },
  animate: {
    opacity: [0.4, 0.7, 0.4],
    scale: [0.95, 1.05, 0.95],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// =============================================================================
// HELPERS
// =============================================================================

interface TypeConfig {
  icon: ReactNode;
  label: string;
  accentClass: string;
  bgClass: string;
}

function getTypeConfig(type: HighlightIntentProps['type']): TypeConfig {
  switch (type) {
    case 'tip':
      return {
        icon: <Lightbulb className="w-8 h-8" />,
        label: 'Tip',
        accentClass: 'var(--house-primary)',
        bgClass: 'var(--house-primary-alpha)',
      };
    case 'important':
      return {
        icon: <AlertCircle className="w-8 h-8" />,
        label: 'Importante',
        accentClass: '#ef4444',
        bgClass: 'rgba(239, 68, 68, 0.15)',
      };
    case 'warning':
      return {
        icon: <AlertCircle className="w-8 h-8" />,
        label: 'Atención',
        accentClass: '#f59e0b',
        bgClass: 'rgba(245, 158, 11, 0.15)',
      };
    case 'fact':
      return {
        icon: <Info className="w-8 h-8" />,
        label: 'Dato curioso',
        accentClass: '#06b6d4',
        bgClass: 'rgba(6, 182, 212, 0.15)',
      };
    case 'formula':
      return {
        icon: <Zap className="w-8 h-8" />,
        label: 'Fórmula',
        accentClass: '#a855f7',
        bgClass: 'rgba(168, 85, 247, 0.15)',
      };
    default:
      return {
        icon: <Star className="w-8 h-8" />,
        label: 'Destacado',
        accentClass: 'var(--house-primary)',
        bgClass: 'var(--house-primary-alpha)',
      };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * HighlightIntent - Emphasize a key concept or information
 *
 * Creates visual emphasis on important content with type-specific styling.
 * Perfect for tips, warnings, formulas, and key facts.
 *
 * @example
 * ```tsx
 * <HighlightIntent
 *   type="formula"
 *   title="Área del círculo"
 *   content="A = π × r²"
 *   supportingText="Donde r es el radio del círculo"
 *   example="Si r = 5cm, entonces A = π × 25 = 78.54 cm²"
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function HighlightIntent({
  content,
  title,
  type = 'tip',
  supportingText,
  icon,
  example,
  onContinue,
  className,
}: HighlightIntentProps) {
  const config = getTypeConfig(type);
  const displayIcon = icon || config.icon;

  return (
    <div
      className={clsx(
        'h-[100dvh] w-full overflow-hidden relative flex flex-col items-center justify-center',
        className,
      )}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow - matches highlight type */}
      <motion.div
        variants={pulseGlow}
        initial="initial"
        animate="animate"
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: config.accentClass,
          filter: `blur(${blur['2xl']})`,
          opacity: 0.15,
        }}
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <Badge
            variant="level"
            className="inline-flex items-center gap-2 mb-6"
            style={{
              background: config.bgClass,
              color: config.accentClass,
              borderColor: config.accentClass,
            }}
          >
            {config.label}
          </Badge>
        </motion.div>

        {/* Icon */}
        <motion.div
          variants={scaleIn}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: config.bgClass,
            border: `2px solid ${config.accentClass}`,
            color: config.accentClass,
            boxShadow: `0 0 40px ${config.accentClass}40`,
          }}
        >
          {displayIcon}
        </motion.div>

        {/* Title */}
        {title && (
          <motion.h1
            variants={fadeUp}
            className="text-xl md:text-2xl font-semibold text-white/80 mb-4"
          >
            {title}
          </motion.h1>
        )}

        {/* Main content - the highlight */}
        <motion.div
          variants={fadeUp}
          className="p-8 rounded-3xl relative"
          style={{
            background: backgrounds.card,
            backdropFilter: `blur(${blur.md})`,
            border: `2px solid ${config.accentClass}`,
            boxShadow: shadows.houseGlow,
          }}
        >
          {/* Accent line at top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-b-full"
            style={{ background: config.accentClass }}
          />

          <p
            className={clsx(
              'text-white leading-relaxed',
              type === 'formula'
                ? 'text-3xl md:text-4xl font-mono font-bold'
                : 'text-xl md:text-2xl font-medium',
            )}
          >
            {content}
          </p>
        </motion.div>

        {/* Supporting text */}
        {supportingText && (
          <motion.p variants={fadeUp} className="text-white/60 mt-4 max-w-md text-base">
            {supportingText}
          </motion.p>
        )}

        {/* Example */}
        {example && (
          <motion.div
            variants={fadeUp}
            className="mt-6 p-4 rounded-xl w-full max-w-md"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${borders.subtle}`,
            }}
          >
            <p className="text-sm text-white/50 mb-1">Ejemplo:</p>
            <p className="text-white/80">{example}</p>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.div variants={fadeUp} className="mt-10">
          <Button variant="primary" size="lg" onClick={onContinue}>
            Entendido
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

HighlightIntent.displayName = 'HighlightIntent';
