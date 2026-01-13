import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { mascot, lessonSprings } from '../tokens/lesson';

export type MascotMood = 'happy' | 'thinking' | 'celebrating' | 'sad' | 'excited';
export type MascotSize = 'sm' | 'md' | 'lg';

export interface BitMascotProps {
  /** Current mood/expression */
  mood?: MascotMood;
  /** Size of the mascot */
  size?: MascotSize;
  /** Enable floating animation */
  floating?: boolean;
  /** Speech bubble content */
  speech?: string;
  /** Additional class names */
  className?: string;
}

const sizeClasses: Record<MascotSize, string> = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
};

const sizePx: Record<MascotSize, number> = {
  sm: 64,
  md: 128,
  lg: 192,
};

/**
 * BitMascot - The Mateatletas robot mascot
 *
 * An animated SVG mascot that responds to different moods.
 * Eyes are ALWAYS cyan (#06b6d4), body uses house-primary color.
 *
 * @example
 * ```tsx
 * <BitMascot mood="happy" size="lg" />
 * <BitMascot mood="thinking" speech="¡Piensa bien!" />
 * <BitMascot mood="celebrating" floating />
 * ```
 */
export function BitMascot({
  mood = 'happy',
  size = 'md',
  floating = true,
  speech,
  className,
}: BitMascotProps) {
  const eyeColor = mascot.eyeColor;

  return (
    <div
      className={clsx('relative flex items-center justify-center', sizeClasses[size], className)}
    >
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-30"
        style={{ background: 'var(--house-primary)' }}
      />

      {/* Speech bubble */}
      <AnimatePresence>
        {speech && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full z-20"
          >
            <div className="bg-[#27272a] p-4 rounded-2xl rounded-bl-none max-w-[200px] border border-white/10 shadow-xl">
              <p className="text-sm font-bold text-white leading-relaxed">{speech}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating animation wrapper */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 drop-shadow-2xl"
        animate={
          floating
            ? {
                y: [0, -15, 0],
              }
            : {}
        }
        transition={floating ? lessonSprings.float : {}}
      >
        {/* Definitions */}
        <defs>
          <filter id="bit-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Antenna */}
        <motion.g
          animate={mood === 'thinking' ? { rotate: [0, 15, -10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ transformOrigin: '100px 50px' }}
        >
          <line
            x1="100"
            y1="50"
            x2="100"
            y2="20"
            stroke="var(--house-primary)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="100" cy="20" r="10" fill="white" className="animate-pulse" />
        </motion.g>

        {/* Arms */}
        <motion.path
          d="M 30 130 Q 10 130 10 110"
          stroke="var(--house-primary)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
          animate={
            mood === 'celebrating'
              ? { d: 'M 30 130 Q 10 80 10 60' }
              : mood === 'excited'
                ? {
                    d: [
                      'M 30 130 Q 10 130 10 110',
                      'M 30 130 Q 10 80 10 60',
                      'M 30 130 Q 10 130 10 110',
                    ],
                  }
                : { d: 'M 30 130 Q 10 130 10 110' }
          }
          transition={mood === 'excited' ? { repeat: Infinity, duration: 0.5 } : {}}
        />
        <motion.path
          d="M 170 130 Q 190 130 190 110"
          stroke="var(--house-primary)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
          animate={
            mood === 'celebrating'
              ? { d: 'M 170 130 Q 190 80 190 60' }
              : mood === 'excited'
                ? {
                    d: [
                      'M 170 130 Q 190 130 190 110',
                      'M 170 130 Q 190 80 190 60',
                      'M 170 130 Q 190 130 190 110',
                    ],
                  }
                : { d: 'M 170 130 Q 190 130 190 110' }
          }
          transition={mood === 'excited' ? { repeat: Infinity, duration: 0.5 } : {}}
        />

        {/* Body */}
        <rect x="30" y="50" width="140" height="110" rx="40" fill="var(--house-primary)" />

        {/* Screen/Face */}
        <rect
          x="45"
          y="65"
          width="110"
          height="70"
          rx="25"
          fill="#050510"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />

        {/* Eyes - STRICTLY CYAN */}
        <g fill={eyeColor} filter="url(#bit-glow)">
          {/* Happy eyes - curved arcs */}
          {mood === 'happy' && (
            <>
              <path
                d="M 70 95 Q 80 85 90 95"
                stroke={eyeColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 110 95 Q 120 85 130 95"
                stroke={eyeColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {/* Thinking eyes - one dot, one line */}
          {mood === 'thinking' && (
            <>
              <circle cx="80" cy="95" r="8" />
              <path
                d="M 110 95 Q 120 95 130 95"
                stroke={eyeColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {/* Celebrating eyes - star shapes */}
          {mood === 'celebrating' && (
            <>
              <path
                d="M 70 100 L 80 90 L 90 100"
                stroke={eyeColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 110 100 L 120 90 L 130 100"
                stroke={eyeColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {/* Sad eyes - downward arcs */}
          {mood === 'sad' && (
            <>
              <path
                d="M 70 90 Q 80 100 90 90"
                stroke={eyeColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 110 90 Q 120 100 130 90"
                stroke={eyeColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {/* Excited eyes - big circles */}
          {mood === 'excited' && (
            <>
              <motion.circle
                cx="80"
                cy="95"
                r="10"
                animate={{ r: [10, 12, 10] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
              <motion.circle
                cx="120"
                cy="95"
                r="10"
                animate={{ r: [10, 12, 10] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
            </>
          )}
        </g>

        {/* Mouth */}
        {(mood === 'happy' || mood === 'celebrating' || mood === 'excited') && (
          <path
            d="M 90 115 Q 100 120 110 115"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {mood === 'sad' && (
          <path
            d="M 90 120 Q 100 115 110 120"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </motion.svg>
    </div>
  );
}

BitMascot.displayName = 'BitMascot';
