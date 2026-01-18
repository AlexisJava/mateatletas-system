'use client';

import { ArrowLeft } from 'lucide-react';

interface WizardHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly onBack: () => void;
}

/**
 * Header del wizard con botón de volver y título
 */
export function WizardHeader({
  title,
  subtitle = 'Inscribí a tu hijo en Mateatletas',
  onBack,
}: WizardHeaderProps): React.ReactElement {
  return (
    <header className="h-16 shrink-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 flex items-center relative z-20">
      <button
        onClick={onBack}
        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        aria-label="Volver"
      >
        <ArrowLeft className="w-5 h-5 text-slate-400" />
      </button>
      <div className="ml-3">
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </header>
  );
}
