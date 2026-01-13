import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { BookOpen, Lightbulb } from 'lucide-react';
import { Card } from '../primitives/Card';
import { BitMascot } from './BitMascot';
import { backgrounds, borders } from '../tokens/lesson';

export interface DefineCardProps {
  /** The term being defined */
  term: string;
  /** The definition text */
  definition: string;
  /** Optional example */
  example?: string;
  /** Optional visual/image URL */
  visual?: string;
  /** Mascot speech bubble text */
  mascotSpeech?: string;
  /** Show mascot */
  showMascot?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * DefineCard - Organism for the "define" intent
 *
 * Full-screen slide for introducing new terms/concepts.
 * Features large typography, optional examples, and mascot interaction.
 *
 * @example
 * ```tsx
 * <DefineCard
 *   term="Variable"
 *   definition="Un espacio en memoria donde guardas información que puede cambiar."
 *   example="let edad = 12"
 *   mascotSpeech="¿Y si tu edad cambia el año que viene? ¡La variable puede cambiar!"
 * />
 * ```
 */
export function DefineCard({
  term,
  definition,
  example,
  visual,
  mascotSpeech,
  showMascot = true,
  className,
}: DefineCardProps) {
  return (
    <Card
      variant="intent"
      padding="2xl"
      className={clsx('flex flex-col justify-center', className)}
    >
      {/* Decorative accent line */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-r-full"
        style={{ background: 'var(--house-primary)' }}
      />

      {/* Background glow */}
      <div
        className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 blur-[100px] pointer-events-none"
        style={{ background: 'var(--house-primary)' }}
      />

      <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10 h-full">
        {/* Left: Content */}
        <div className="space-y-8">
          {/* Label */}
          <div className="flex items-center gap-3 text-slate-400">
            <div className="p-2 rounded-lg bg-white/5">
              <BookOpen size={20} />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.25em]">NUEVO CONCEPTO</span>
          </div>

          {/* Term with gradient */}
          <div>
            <h2
              className="font-extrabold text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight tracking-tight"
              style={{
                color: 'transparent',
                backgroundImage:
                  'linear-gradient(to right, var(--house-primary), var(--house-accent))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
              }}
            >
              {term}
            </h2>

            {/* Definition */}
            <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-200 tracking-wide">
              {definition}
            </p>
          </div>

          {/* Example (if provided) */}
          {example && (
            <div
              className="rounded-2xl p-6 border shadow-inner"
              style={{
                background: `${backgrounds.code}80`,
                borderColor: borders.accent,
              }}
            >
              <div
                className="flex items-center gap-2 mb-3 font-bold text-sm tracking-widest uppercase"
                style={{ color: 'var(--house-accent)' }}
              >
                <Lightbulb size={18} />
                Ejemplo
              </div>
              <code
                className="font-mono text-lg md:text-xl text-white block pl-4 py-2 border-l-4 rounded-r-lg"
                style={{
                  borderColor: 'var(--house-primary)',
                  background: `${backgrounds.code}50`,
                }}
              >
                {example}
              </code>
            </div>
          )}
        </div>

        {/* Right: Visual or Mascot */}
        <div className="h-full min-h-[300px] bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden">
          {visual ? (
            <img src={visual} alt={term} className="w-full h-full object-contain p-8" />
          ) : showMascot ? (
            <>
              {/* Speech bubble */}
              {mascotSpeech && (
                <div className="absolute top-10 right-10 lg:right-auto lg:left-10 bg-[#27272a] p-6 rounded-3xl rounded-bl-none max-w-[280px] border border-white/10 shadow-xl z-20">
                  <p className="text-lg font-bold text-white leading-relaxed">
                    {mascotSpeech.split(/(\[house\].*?\[\/house\])/).map((part, i) => {
                      if (part.startsWith('[house]')) {
                        const content = part.replace('[house]', '').replace('[/house]', '');
                        return (
                          <span key={i} style={{ color: 'var(--house-primary)' }}>
                            {content}
                          </span>
                        );
                      }
                      return part;
                    })}
                  </p>
                </div>
              )}

              {/* Mascot */}
              <div className="scale-125 transform translate-y-8">
                <BitMascot mood="thinking" size="lg" floating />
              </div>
            </>
          ) : (
            <div className="text-slate-600 text-center">
              <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">Sin visual</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

DefineCard.displayName = 'DefineCard';
