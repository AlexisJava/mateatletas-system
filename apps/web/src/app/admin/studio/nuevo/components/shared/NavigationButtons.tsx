'use client';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  showBack?: boolean;
  isSubmitting?: boolean;
  variant?: 'default' | 'submit';
}

export function NavigationButtons({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = 'CONTINUAR →',
  showBack = true,
  isSubmitting = false,
  variant = 'default',
}: NavigationButtonsProps) {
  const isSubmitVariant = variant === 'submit';

  return (
    <div className="flex items-center gap-4">
      {showBack && onBack && (
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          ← ATRÁS
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled || isSubmitting}
        className={`
          px-6 py-2.5 rounded-lg font-semibold text-sm tracking-wide transition-all duration-300
          ${
            isSubmitVariant
              ? isSubmitting
                ? 'bg-white/10 text-white/30 cursor-wait'
                : nextDisabled
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-black hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/20 px-8 rounded-xl font-bold'
              : nextDisabled
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-orange-500 text-black hover:bg-orange-400'
          }
        `}
      >
        {isSubmitting ? 'CREANDO...' : nextLabel}
      </button>
    </div>
  );
}
