'use client';

import { Check } from 'lucide-react';
import type { WizardStep } from '../types';

interface StepIndicatorProps {
  readonly number: number;
  readonly label: string;
  readonly active: boolean;
  readonly completed: boolean;
}

/**
 * Indicador visual de un paso del wizard
 */
export function StepIndicator({
  number,
  label,
  active,
  completed,
}: StepIndicatorProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
          completed
            ? 'bg-emerald-500 text-white'
            : active
              ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
              : 'bg-white/10 text-slate-500'
        }`}
      >
        {completed ? <Check className="w-4 h-4" /> : number}
      </div>
      <span
        className={`text-sm hidden sm:inline ${active ? 'text-white font-medium' : 'text-slate-500'}`}
      >
        {label}
      </span>
    </div>
  );
}

interface StepProgressProps {
  readonly steps: Array<{ id: WizardStep; label: string }>;
  readonly currentStep: WizardStep;
  readonly currentStepIndex: number;
}

/**
 * Barra de progreso del wizard con todos los pasos
 */
export function StepProgress({
  steps,
  currentStep,
  currentStepIndex,
}: StepProgressProps): React.ReactElement {
  return (
    <div className="relative z-10 px-6 py-4 border-b border-white/5">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            {idx > 0 && <div className="flex-1 h-px bg-white/10 mx-2 min-w-[16px]" />}
            <StepIndicator
              number={idx + 1}
              label={step.label}
              active={currentStep === step.id}
              completed={idx < currentStepIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
