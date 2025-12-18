/**
 * components/slides/renderers/QuizSlideRenderer.tsx
 * ==================================================
 * Renderizador para slides de quiz/evaluación
 *
 * MIGRACIÓN PROMPT 3: Actualizado para usar tipos nuevos
 */

'use client';

import { useState } from 'react';
import type { QuizSlide } from '../../../types/registry';
import LambdaMessage from '../../LambdaMessage';
import NavigationButtons from '../shared/NavigationButtons';
import { ScienceConfetti } from '@ciudad-mateatleta/design-system';

interface QuizSlideRendererProps {
  slide: QuizSlide;
  onNext: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  hideNavigation?: boolean;
}

export default function QuizSlideRenderer({
  slide,
  onNext,
  onPrevious,
  showPrevious = true,
  hideNavigation = false,
}: QuizSlideRendererProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Extraer del tipo nuevo
  const intro = slide.description || '';
  const ctaText = 'Siguiente';
  const questions = slide.questions || [];

  // Manejar respuesta a pregunta
  const handleAnswer = (answerId: string) => {
    setSelectedAnswer(answerId);
    setShowFeedback(true);

    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);

    // Mostrar celebración si la respuesta es correcta
    const currentQ = questions[currentQuestion];
    const selectedOption = currentQ.options.find((opt) => opt.id === answerId);
    if (selectedOption?.isCorrect) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  // Siguiente pregunta
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setShowCelebration(false);
    }
  };

  // Pregunta anterior
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const allAnswered = answeredQuestions.filter(Boolean).length === questions.length;

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  const selectedOption = currentQ.options.find((opt) => opt.id === selectedAnswer);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ScienceConfetti active={showCelebration} duration={3000} />

      {/* Container principal CENTRADO */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-6">
          {intro && <LambdaMessage message={intro} />}

          <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-400">
                Pregunta {currentQuestion + 1} de {questions.length}
              </span>
              <div className="flex gap-2">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${answeredQuestions[i] ? 'bg-emerald-500' : i === currentQuestion ? 'bg-purple-500' : 'bg-slate-600'}`}
                  />
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">{currentQ.question}</h2>

            <div className="space-y-3">
              {currentQ.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrect = option.isCorrect;
                return (
                  <button
                    key={option.id}
                    onClick={() => !showFeedback && handleAnswer(option.id)}
                    disabled={showFeedback}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showFeedback && isSelected
                        ? isCorrect
                          ? 'bg-emerald-900/30 border-emerald-500'
                          : 'bg-red-900/30 border-red-500'
                        : isSelected
                          ? 'bg-purple-600 border-purple-500'
                          : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-white">{option.text}</span>
                    {showFeedback && isSelected && (
                      <span className="float-right text-2xl">{isCorrect ? '✅' : '❌'}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {showFeedback && selectedOption && (
              <div
                className={`mt-6 p-4 rounded-lg ${selectedOption.isCorrect ? 'bg-emerald-900/20 border border-emerald-500/50' : 'bg-red-900/20 border border-red-500/50'}`}
              >
                <p className="text-white">
                  {selectedOption.explanation ||
                    (selectedOption.isCorrect ? '¡Correcto!' : 'Intenta de nuevo')}
                </p>
              </div>
            )}

            {showFeedback && (
              <div className="mt-6 flex justify-between">
                {currentQuestion > 0 && (
                  <button
                    onClick={handlePreviousQuestion}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                  >
                    ← Anterior
                  </button>
                )}
                {currentQuestion < questions.length - 1 && (
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg ml-auto"
                  >
                    Siguiente →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de navegación FIJOS abajo - solo si NO está hideNavigation */}
      {!hideNavigation && (
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <NavigationButtons
              onPrevious={onPrevious}
              onNext={onNext}
              nextLabel={ctaText}
              nextDisabled={!allAnswered}
              showPrevious={showPrevious}
            />
          </div>
        </div>
      )}
    </div>
  );
}
