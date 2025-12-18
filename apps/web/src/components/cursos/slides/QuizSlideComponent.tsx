import { useState } from 'react';
import { QuizSlide, NavigationButtons } from '@ciudad-mateatleta/lms-core';
import LambdaMessage from './LambdaMessage';
import QuizQuestion from './QuizQuestion';
import { CourseTheme } from '../../themes/courseThemes';

interface QuizSlideProps {
  slide: QuizSlide;
  onNext: () => void;
  onPrevious: () => void;
  theme?: CourseTheme;
}

const indicatorColors: Record<CourseTheme, string> = {
  matematicas: 'bg-orange-500',
  programacion: 'bg-indigo-500',
  ciencias: 'bg-emerald-500',
};

const nextButtonColors: Record<CourseTheme, string> = {
  matematicas: 'bg-orange-600 hover:bg-orange-700',
  programacion: 'bg-indigo-600 hover:bg-indigo-700',
  ciencias: 'bg-emerald-600 hover:bg-emerald-700',
};

export default function QuizSlideComponent({
  slide,
  onNext,
  onPrevious,
  theme = 'matematicas',
}: QuizSlideProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(slide.questions.length).fill(false),
  );

  const handleQuestionAnswered = (correct: boolean) => {
    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < slide.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const allAnswered = answeredQuestions.every((answered) => answered);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">{slide.title}</h1>

      {slide.description && <LambdaMessage message={slide.description} theme={theme} />}

      <div className="bg-slate-800 rounded-xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-slate-400 text-sm">
            Pregunta {currentQuestion + 1} de {slide.questions.length}
          </span>
          <div className="flex gap-2">
            {slide.questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  answeredQuestions[index]
                    ? indicatorColors[theme]
                    : index === currentQuestion
                      ? indicatorColors[theme]
                      : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        <QuizQuestion
          question={slide.questions[currentQuestion]}
          onAnswered={handleQuestionAnswered}
          theme={theme}
        />

        {answeredQuestions[currentQuestion] && (
          <div className="mt-6 flex justify-between">
            {currentQuestion > 0 && (
              <button
                onClick={handlePreviousQuestion}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all"
              >
                ← Anterior pregunta
              </button>
            )}
            {currentQuestion < slide.questions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className={`px-4 py-2 rounded-lg ${nextButtonColors[theme]} text-white transition-all ml-auto`}
              >
                Siguiente pregunta →
              </button>
            )}
          </div>
        )}
      </div>

      <NavigationButtons
        onPrevious={onPrevious}
        onNext={onNext}
        nextLabel="Continuar"
        nextDisabled={!allAnswered}
        theme={theme}
      />
    </div>
  );
}
