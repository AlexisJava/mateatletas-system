'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import type { Quiz } from '@/data/roblox/semana2-estilo-astro';

interface QuizInteractivoProps {
  quizzes: Quiz[];
  onComplete?: () => void;
}

export default function QuizInteractivo({ quizzes, onComplete }: QuizInteractivoProps) {
  const { width, height } = useWindowSize();
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentQuiz = quizzes[currentQuizIndex];
  const isLastQuiz = currentQuizIndex === quizzes.length - 1;

  const handleOptionClick = (index: number) => {
    if (showFeedback) return; // No permitir cambiar si ya mostró feedback
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    setShowFeedback(true);

    const isCorrect = selectedOption === currentQuiz.respuestaCorrecta;

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleNext = () => {
    if (isLastQuiz) {
      setCompleted(true);
      if (onComplete) {
        onComplete();
      }
    } else {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  if (completed) {
    const score = (correctAnswers / quizzes.length) * 100;
    const emoji = score === 100 ? '🏆' : score >= 70 ? '🎉' : score >= 50 ? '👍' : '💪';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-2xl p-8 text-center"
      >
        <div className="text-6xl mb-4">{emoji}</div>
        <h3 className="text-3xl font-black text-white mb-4">¡Quiz Completado!</h3>
        <p className="text-xl text-green-300 mb-6">
          Acertaste {correctAnswers} de {quizzes.length} preguntas
        </p>
        <div className="text-5xl font-black text-white mb-4">{score.toFixed(0)}%</div>
        {score === 100 && (
          <p className="text-green-300 text-lg">¡PERFECTO! Dominás completamente este tema 🎓</p>
        )}
        {score >= 70 && score < 100 && (
          <p className="text-green-300 text-lg">¡Muy bien! Entendiste el tema 👏</p>
        )}
        {score >= 50 && score < 70 && (
          <p className="text-yellow-300 text-lg">Bien, pero podés mejorar. Repasá un poco más 📚</p>
        )}
        {score < 50 && (
          <p className="text-orange-300 text-lg">Seguí practicando, ¡vas a mejorar! 💪</p>
        )}
      </motion.div>
    );
  }

  const isCorrect = showFeedback && selectedOption === currentQuiz.respuestaCorrecta;
  const isWrong = showFeedback && selectedOption !== currentQuiz.respuestaCorrecta;

  return (
    <div className="my-8">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* Header del Quiz */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80 font-bold">
            Pregunta {currentQuizIndex + 1} de {quizzes.length}
          </span>
          <span className="text-white/80 font-bold">✓ {correctAnswers} correctas</span>
        </div>
        <h3 className="text-2xl font-black text-white">{currentQuiz.pregunta}</h3>
      </div>

      {/* Opciones */}
      <div className="bg-slate-900 border-2 border-purple-500/40 border-t-0 rounded-b-2xl p-6">
        <div className="space-y-3 mb-6">
          {currentQuiz.opciones.map((opcion, index) => {
            const isSelected = selectedOption === index;
            const isCorrectOption = index === currentQuiz.respuestaCorrecta;

            let bgColor = 'bg-slate-800/50';
            let borderColor = 'border-slate-700';
            let textColor = 'text-slate-300';

            if (showFeedback) {
              if (isCorrectOption) {
                bgColor = 'bg-green-500/20';
                borderColor = 'border-green-500/60';
                textColor = 'text-green-300';
              } else if (isSelected && !isCorrectOption) {
                bgColor = 'bg-red-500/20';
                borderColor = 'border-red-500/60';
                textColor = 'text-red-300';
              }
            } else if (isSelected) {
              bgColor = 'bg-purple-500/20';
              borderColor = 'border-purple-500/60';
              textColor = 'text-purple-300';
            }

            return (
              <motion.button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={showFeedback}
                whileHover={!showFeedback ? { scale: 1.02 } : {}}
                whileTap={!showFeedback ? { scale: 0.98 } : {}}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${bgColor} ${borderColor} ${textColor}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{String.fromCharCode(65 + index)})</span>
                  <span className="flex-1">{opcion}</span>
                  {showFeedback && isCorrectOption && <span className="text-2xl">✅</span>}
                  {showFeedback && isSelected && !isCorrectOption && (
                    <span className="text-2xl">❌</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence mode="wait">
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-6 rounded-xl mb-6 border-2 ${
                isCorrect
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-4xl">{isCorrect ? '🎉' : '🤔'}</span>
                <div>
                  <h4
                    className={`text-xl font-black mb-2 ${
                      isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isCorrect ? '¡Correcto!' : 'No es correcto'}
                  </h4>
                  <p className={isCorrect ? 'text-green-300' : 'text-red-300'}>
                    {currentQuiz.explicacion}
                  </p>
                </div>
              </div>

              {currentQuiz.curiosidad && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h5 className="text-amber-400 font-bold mb-1">Curiosidad:</h5>
                      <p className="text-amber-300 text-sm">{currentQuiz.curiosidad}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones */}
        <div className="flex gap-3">
          {!showFeedback ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-300 ${
                selectedOption === null
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 active:scale-95'
              }`}
            >
              Confirmar Respuesta
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-6 rounded-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 active:scale-95 transition-all duration-300"
            >
              {isLastQuiz ? '🏁 Ver Resultados' : '➡️ Siguiente'}
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
