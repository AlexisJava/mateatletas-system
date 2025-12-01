'use client';

interface WizardProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export function WizardProgress({ currentStep, totalSteps = 6 }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isActive = step === currentStep;
          const isComplete = step < currentStep;

          return (
            <div
              key={step}
              className={`
                h-0.5 w-8 transition-all duration-300
                ${isActive ? 'bg-orange-500' : isComplete ? 'bg-orange-500/50' : 'bg-white/10'}
              `}
            />
          );
        })}
      </div>
      <span className="text-[10px] font-medium tracking-wider text-white/40">
        PASO {currentStep}/{totalSteps}
      </span>
    </div>
  );
}
