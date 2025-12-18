import { useState, useEffect } from 'react';
import { Question } from '@/lib/types/juegos/preguntados-moleculares';

interface PreguntaProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (correct: boolean, selectedId: string) => void;
}

export default function PreguntaComponent({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: PreguntaProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
  }, [question.id]);

  const handleOptionClick = (optionId: string) => {
    if (showFeedback) return; // Already answered

    const selected = question.options.find((opt) => opt.id === optionId);
    if (!selected) return;

    setSelectedOption(optionId);
    setShowFeedback(true);
    onAnswer(selected.correct, optionId);
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'easy':
        return 'text-emerald-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
    }
  };

  const getDifficultyLabel = () => {
    switch (question.difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Media';
      case 'hard':
        return 'Difícil';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">
          Pregunta {questionNumber} de {totalQuestions}
        </span>
        <span className={`text-sm font-semibold ${getDifficultyColor()}`}>
          {getDifficultyLabel()}
        </span>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-2 border-purple-500/30 rounded-xl p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">{question.question}</h2>
        {question.visualHint && (
          <p className="text-slate-400 text-sm italic mt-2">💡 {question.visualHint}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.correct;
          const letters = ['A', 'B', 'C', 'D'];

          let buttonStyles = 'bg-slate-800 hover:bg-slate-700 border-slate-600';

          if (showFeedback && isSelected) {
            buttonStyles = isCorrect
              ? 'bg-emerald-600 border-emerald-500 ring-2 ring-emerald-400'
              : 'bg-red-600 border-red-500 ring-2 ring-red-400';
          }

          // Show correct answer after answering incorrectly
          if (showFeedback && !isSelected && isCorrect) {
            buttonStyles = 'bg-emerald-600/50 border-emerald-500/50 ring-2 ring-emerald-400/50';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={showFeedback}
              className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-300 ${buttonStyles} disabled:cursor-not-allowed flex items-center gap-4`}
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-100 font-bold">
                {letters[index]}
              </span>
              <span className="text-slate-100 text-base md:text-lg flex-1">{option.text}</span>
              {showFeedback && isSelected && (
                <span className="flex-shrink-0 text-2xl">{isCorrect ? '✅' : '❌'}</span>
              )}
              {showFeedback && !isSelected && isCorrect && (
                <span className="flex-shrink-0 text-2xl">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div
          className={`rounded-xl p-6 ${
            question.options.find((opt) => opt.id === selectedOption)?.correct
              ? 'bg-emerald-900/30 border-2 border-emerald-500/50'
              : 'bg-red-900/30 border-2 border-red-500/50'
          }`}
        >
          <p className="text-slate-100 text-base md:text-lg leading-relaxed">
            {question.options.find((opt) => opt.id === selectedOption)?.correct
              ? question.feedback.correct
              : question.feedback.incorrect}
          </p>
        </div>
      )}
    </div>
  );
}
