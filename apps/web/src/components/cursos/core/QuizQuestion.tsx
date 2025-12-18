import { useState, useEffect } from 'react';
import { BaseQuizQuestion, normalizeFeedback } from '@/lib/types/shared';
import { FeedbackPanel } from '@/components/ui';

interface QuizQuestionProps {
  question: BaseQuizQuestion;
  onAnswered: (correct: boolean) => void;
}

export default function QuizQuestion({ question, onAnswered }: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
  }, [question.id]);

  const handleOptionClick = (optionId: string) => {
    if (showFeedback) return; // Already answered

    setSelectedOption(optionId);
    setShowFeedback(true);

    const selected = question.options.find((opt) => opt.id === optionId);
    onAnswered(selected?.correct || false);
  };

  // Normalizar feedback para compatibilidad con ambos formatos
  const feedback = normalizeFeedback(question);
  const selectedIsCorrect =
    question.options.find((opt) => opt.id === selectedOption)?.correct || false;

  return (
    <div className="space-y-4">
      <h3 className="text-xl md:text-2xl font-semibold text-slate-100 mb-6">{question.question}</h3>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.correct;

          let buttonStyles = 'bg-slate-700 hover:bg-slate-600 border-slate-600';

          if (showFeedback && isSelected) {
            buttonStyles = isCorrect
              ? 'bg-emerald-600 border-emerald-500'
              : 'bg-red-600 border-red-500';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={showFeedback}
              className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-300 ${buttonStyles} disabled:cursor-not-allowed min-h-12`}
            >
              <span className="text-slate-100 text-base md:text-lg">{option.text}</span>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <FeedbackPanel
          type={selectedIsCorrect ? 'success' : 'error'}
          message={selectedIsCorrect ? feedback.correct : feedback.incorrect}
        />
      )}
    </div>
  );
}
