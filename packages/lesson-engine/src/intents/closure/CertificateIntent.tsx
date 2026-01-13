'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Award, Star, Download, Share2 } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings, shadows } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface CertificateIntentProps {
  /** Student name */
  studentName: string;
  /** Course/lesson title */
  courseTitle: string;
  /** Completion date */
  completionDate?: string;
  /** Achievement description */
  achievement?: string;
  /** XP earned total */
  xpEarned?: number;
  /** Score percentage */
  score?: number;
  /** Show download button */
  showDownload?: boolean;
  /** Show share button */
  showShare?: boolean;
  /** Download handler */
  onDownload?: () => void;
  /** Share handler */
  onShare?: () => void;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const certificateVariants = {
  hidden: { opacity: 0, scale: 0.8, rotateX: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
      delay: 0.3,
    },
  },
};

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 3,
      ease: 'easeInOut',
    },
  },
};

const starVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: (i: number) => ({
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
      delay: 0.5 + i * 0.1,
    },
  }),
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CertificateIntent - Completion certificate
 *
 * Celebrates course/lesson completion with a beautiful certificate.
 * Includes options to download or share the achievement.
 *
 * @example
 * ```tsx
 * <CertificateIntent
 *   studentName="María García"
 *   courseTitle="Maestro de Fracciones"
 *   completionDate="15 de Enero, 2024"
 *   achievement="Completaste todas las lecciones de fracciones"
 *   xpEarned={500}
 *   score={95}
 *   showDownload
 *   showShare
 *   onContinue={() => goToDashboard()}
 * />
 * ```
 */
export function CertificateIntent({
  studentName,
  courseTitle,
  completionDate,
  achievement,
  xpEarned,
  score,
  showDownload = false,
  showShare = false,
  onDownload,
  onShare,
  ctaText = 'Volver al inicio',
  onContinue,
  className,
}: CertificateIntentProps) {
  const formattedDate =
    completionDate ||
    new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div
      className={clsx(
        'h-[100dvh] w-full overflow-hidden relative flex flex-col items-center justify-center',
        className,
      )}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.15,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-secondary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center px-6 w-full max-w-xl"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <Badge variant="level" className="inline-flex items-center gap-2 mb-6">
            <Award className="w-3.5 h-3.5" />
            Certificado
          </Badge>
        </motion.div>

        {/* Certificate card */}
        <motion.div
          variants={certificateVariants}
          className="relative w-full rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: `blur(${blur.lg})`,
            border: `2px solid ${borders.medium}`,
            boxShadow: shadows.houseGlow,
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            }}
          />

          {/* Content */}
          <div className="relative p-8 md:p-10 text-center">
            {/* Stars decoration */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} custom={i} variants={starVariants}>
                  <Star
                    className={clsx(
                      'w-8 h-8',
                      i === 1 ? 'text-amber-400 w-10 h-10' : 'text-amber-400/60',
                    )}
                    fill="currentColor"
                  />
                </motion.div>
              ))}
            </div>

            {/* Title */}
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">
              Certificado de Logro
            </h2>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">{courseTitle}</h1>

            {/* Divider */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-6" />

            {/* Student name */}
            <p className="text-white/60 mb-1">Otorgado a</p>
            <p className="text-xl md:text-2xl font-bold text-white mb-6">{studentName}</p>

            {/* Achievement */}
            {achievement && (
              <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">{achievement}</p>
            )}

            {/* Stats */}
            {(xpEarned || score) && (
              <div className="flex justify-center gap-6 mb-6">
                {xpEarned && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-400">+{xpEarned}</p>
                    <p className="text-xs text-white/40">XP Ganados</p>
                  </div>
                )}
                {score && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{score}%</p>
                    <p className="text-xs text-white/40">Puntuación</p>
                  </div>
                )}
              </div>
            )}

            {/* Date */}
            <p className="text-white/40 text-sm">{formattedDate}</p>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 mt-6">
          {showDownload && (
            <Button variant="ghost" onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          )}
          {showShare && (
            <Button variant="ghost" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          )}
        </motion.div>

        {/* Continue button */}
        <motion.div variants={itemVariants} className="mt-6">
          <Button variant="primary" size="lg" onClick={onContinue}>
            {ctaText}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

CertificateIntent.displayName = 'CertificateIntent';
