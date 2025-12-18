import { AnswerType } from '@/lib/types/juegos';

interface AnswerButtonsProps {
  onAnswer: (answer: AnswerType) => void;
  disabled: boolean;
  selectedAnswer: AnswerType | null;
  correctAnswer?: AnswerType;
  showFeedback: boolean;
}

export default function AnswerButtons({
  onAnswer,
  disabled,
  selectedAnswer,
  correctAnswer,
  showFeedback,
}: AnswerButtonsProps) {
  const getButtonStyles = (type: AnswerType) => {
    const isSelected = selectedAnswer === type;
    const isCorrect = showFeedback && correctAnswer === type;
    const isIncorrect = showFeedback && isSelected && correctAnswer !== type;

    let baseStyles =
      'flex-1 min-h-14 md:min-h-16 px-8 py-4 rounded-lg font-bold text-lg md:text-xl transition-all duration-300';
    let colorStyles = 'bg-indigo-600 hover:bg-indigo-700 text-white';

    if (showFeedback) {
      if (isCorrect) {
        colorStyles = 'bg-emerald-500 text-white';
      } else if (isIncorrect) {
        colorStyles = 'bg-red-500 text-white animate-shake';
      } else {
        colorStyles = 'bg-slate-700 text-slate-400';
      }
    } else if (isSelected) {
      colorStyles = 'bg-purple-600 text-white scale-105';
    }

    if (!disabled && !showFeedback) {
      baseStyles += ' hover:scale-105 active:scale-95';
    }

    if (disabled) {
      baseStyles += ' cursor-not-allowed opacity-75';
    }

    return `${baseStyles} ${colorStyles}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <button
        onClick={() => onAnswer('bien')}
        disabled={disabled}
        className={getButtonStyles('bien')}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">📦</span>
          <span>BIEN</span>
        </div>
      </button>

      <button
        onClick={() => onAnswer('servicio')}
        disabled={disabled}
        className={getButtonStyles('servicio')}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">🛠️</span>
          <span>SERVICIO</span>
        </div>
      </button>
    </div>
  );
}
