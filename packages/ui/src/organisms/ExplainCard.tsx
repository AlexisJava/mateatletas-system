import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { List, Lightbulb, ArrowRight } from 'lucide-react';
import { Card } from '../primitives/Card';

export interface ExplainCardProps {
  /** Title of the explanation */
  title: string;
  /** List of points to explain */
  points: string[];
  /** Optional visual/image URL */
  visual?: string;
  /** Custom visual content */
  visualContent?: ReactNode;
  /** Optional subtitle/intro text */
  subtitle?: string;
  /** Additional class names */
  className?: string;
}

/**
 * ExplainCard - Organism for the "explain" intent
 *
 * Full-screen slide for explaining concepts with bullet points.
 * Features numbered list with hover effects and optional visual.
 *
 * @example
 * ```tsx
 * <ExplainCard
 *   title="¿Por qué usar Variables?"
 *   points={[
 *     "Guardan información para usarla después",
 *     "Pueden cambiar su valor cuando quieras",
 *     "Hacen tu código más fácil de leer",
 *   ]}
 * />
 * ```
 */
export function ExplainCard({
  title,
  points,
  visual,
  visualContent,
  subtitle,
  className,
}: ExplainCardProps) {
  return (
    <Card
      variant="intent"
      padding="2xl"
      className={clsx('flex flex-col justify-center', className)}
    >
      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-white/10 rounded-r-full" />

      <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10 h-full">
        {/* Left: Content */}
        <div className="space-y-10">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-xl text-white"
              style={{
                background: 'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
              }}
            >
              <List size={24} />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">
              ENTENDIENDO...
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-4xl md:text-5xl text-white leading-tight tracking-tight">
            {title}
          </h3>

          {/* Subtitle (if provided) */}
          {subtitle && <p className="text-lg text-slate-300">{subtitle}</p>}

          {/* Points list */}
          <div className="space-y-4">
            {points.map((point, i) => (
              <div
                key={i}
                className="group flex items-start gap-6 p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-[var(--house-primary-alpha)] cursor-default"
              >
                {/* Number badge */}
                <div
                  className="w-10 h-10 rounded-full bg-[#0a0a0f] border border-white/20 flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform flex-shrink-0"
                  style={{ color: 'var(--house-accent)' }}
                >
                  {i + 1}
                </div>

                {/* Point text */}
                <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed pt-1">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visual */}
        <div className="h-full min-h-[400px] bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] border border-white/5 flex items-center justify-center relative overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-20 blur-[80px]"
            style={{ background: 'var(--house-primary)' }}
          />

          {visual ? (
            <img
              src={visual}
              alt={title}
              className="w-full h-full object-contain p-8 relative z-10"
            />
          ) : visualContent ? (
            <div className="relative z-10">{visualContent}</div>
          ) : (
            // Default visual placeholder
            <div className="relative z-10 flex flex-col items-center gap-6 text-center p-8">
              <div
                className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
                  boxShadow: '0 0 50px var(--house-primary-alpha)',
                }}
              >
                <Lightbulb size={64} className="text-white" strokeWidth={1.5} />
              </div>

              {/* Placeholder lines */}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-white/10 rounded-full mx-auto" />
                <div className="h-4 w-24 bg-white/10 rounded-full mx-auto" />
              </div>
            </div>
          )}

          {/* Decorative arrow */}
          <ArrowRight className="absolute top-1/4 right-1/4 text-white/10 w-24 h-24 -rotate-12" />
        </div>
      </div>
    </Card>
  );
}

ExplainCard.displayName = 'ExplainCard';
