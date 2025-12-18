/**
 * components/slides/shared/NavigationButtons.tsx
 * ================================================
 * Componente compartido de navegación entre slides
 */

type CourseTheme = 'matematicas' | 'programacion' | 'ciencias';

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  showPrevious?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
  theme?: CourseTheme;
}

const buttonGradients: Record<CourseTheme, string> = {
  matematicas:
    'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700',
  programacion:
    'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
  ciencias:
    'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
};

export default function NavigationButtons({
  onPrevious,
  onNext,
  nextLabel = 'Siguiente',
  showPrevious = true,
  showNext = true,
  nextDisabled = false,
  theme = 'programacion',
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center gap-4 mt-8">
      {showPrevious && onPrevious ? (
        <button
          onClick={onPrevious}
          className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-all duration-300 min-h-12 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Anterior
        </button>
      ) : (
        <div />
      )}

      {showNext && onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`px-8 py-3 rounded-lg ${buttonGradients[theme]} text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-12 flex items-center gap-2 shadow-lg`}
        >
          {nextLabel}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
