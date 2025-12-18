interface FeedbackPanelProps {
  isCorrect: boolean;
  message: string;
  onNext: () => void;
  showNextButton: boolean;
}

export default function FeedbackPanel({
  isCorrect,
  message,
  onNext,
  showNextButton,
}: FeedbackPanelProps) {
  return (
    <div className="animate-fadeIn space-y-4">
      <div
        className={`rounded-xl p-6 border-2 ${
          isCorrect ? 'bg-emerald-900/40 border-emerald-500' : 'bg-red-900/40 border-red-500'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
              🤖
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-indigo-400 mb-1">Lambda</div>
            <p
              className={`text-base md:text-lg leading-relaxed ${
                isCorrect ? 'text-emerald-100' : 'text-red-100'
              }`}
            >
              {message}
            </p>
          </div>
        </div>
      </div>

      {showNextButton && (
        <button
          onClick={onNext}
          className="w-full px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
        >
          Siguiente →
        </button>
      )}
    </div>
  );
}
