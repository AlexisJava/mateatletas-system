'use client';

import React, { ReactElement, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { QuizConfig, QuizQuestion, QuizAnswer } from './types';
import type { StudioBlockProps } from '../types';

interface QuestionProps {
  question: QuizQuestion;
  selectedAnswer: string | boolean | null;
  isInteractive: boolean;
  onSelect: (answer: string | boolean) => void;
}

function QuestionDisplay({
  question,
  selectedAnswer,
  isInteractive,
  onSelect,
}: QuestionProps): ReactElement {
  if (question.tipo === 'opcionMultiple') {
    return (
      <div className="space-y-3">
        <p className="text-white text-lg font-medium mb-4">{question.pregunta}</p>
        {question.opciones.map((opcion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => isInteractive && onSelect(opcion)}
            disabled={!isInteractive}
            className={`
              w-full p-3 rounded-lg text-left transition-colors
              ${selectedAnswer === opcion ? 'selected bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}
              ${!isInteractive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            {opcion}
          </button>
        ))}
      </div>
    );
  }

  if (question.tipo === 'verdaderoFalso') {
    return (
      <div className="space-y-3">
        <p className="text-white text-lg font-medium mb-4">{question.pregunta}</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => isInteractive && onSelect(true)}
            disabled={!isInteractive}
            className={`
              flex-1 p-4 rounded-lg transition-colors font-medium
              ${selectedAnswer === true ? 'selected bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}
              ${!isInteractive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            Verdadero
          </button>
          <button
            type="button"
            onClick={() => isInteractive && onSelect(false)}
            disabled={!isInteractive}
            className={`
              flex-1 p-4 rounded-lg transition-colors font-medium
              ${selectedAnswer === false ? 'selected bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}
              ${!isInteractive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            Falso
          </button>
        </div>
      </div>
    );
  }

  // respuestaCorta - no implementado en MVP
  return (
    <div className="space-y-3">
      <p className="text-white text-lg font-medium mb-4">{question.pregunta}</p>
      <input
        type="text"
        disabled={!isInteractive}
        className="w-full p-3 rounded-lg bg-slate-700 text-white"
        placeholder="Escribe tu respuesta..."
      />
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Quiz({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<QuizConfig>): ReactElement {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string | boolean>>({});
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(config.tiempoLimite ?? null);
  const [completado, setCompletado] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPreguntas = config.preguntas.length;
  const currentQuestion = config.preguntas[preguntaActual];
  const currentAnswer = currentQuestion ? respuestas[currentQuestion.id] : undefined;

  const isInteractive = modo === 'estudiante' && !disabled && !completado;

  // Calculate answered count
  const answeredCount = Object.keys(respuestas).length;

  // Progress percentage
  const progressPercent = Math.round((answeredCount / totalPreguntas) * 100);

  // Check if current question is answered
  const isCurrentAnswered = currentAnswer !== undefined;

  // Check if on last question
  const isLastQuestion = preguntaActual === totalPreguntas - 1;

  // Calculate results
  const results = useMemo(() => {
    if (!completado) return null;

    let correctCount = 0;
    const answers: QuizAnswer[] = [];

    config.preguntas.forEach((q) => {
      const userAnswer = respuestas[q.id];
      let isCorrect = false;

      if (q.tipo === 'opcionMultiple') {
        isCorrect = userAnswer === q.respuestaCorrecta;
      } else if (q.tipo === 'verdaderoFalso') {
        isCorrect = userAnswer === q.respuestaCorrecta;
      }

      if (isCorrect) correctCount++;

      answers.push({
        questionId: q.id,
        respuesta: userAnswer ?? '',
        esCorrecta: isCorrect,
      });
    });

    const score = Math.round((correctCount / totalPreguntas) * 100);

    return {
      correctCount,
      totalPreguntas,
      score,
      answers,
    };
  }, [completado, config.preguntas, respuestas, totalPreguntas]);

  // Timer effect
  useEffect(() => {
    if (!config.tiempoLimite || completado || modo !== 'estudiante') return;

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev === null || prev <= 0) {
          return prev;
        }
        if (prev === 1) {
          // Time's up - auto submit
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.tiempoLimite, completado, modo]);

  const handleSelect = useCallback(
    (answer: string | boolean) => {
      if (!isInteractive || !currentQuestion) return;

      setRespuestas((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));

      onProgress?.(((answeredCount + 1) / totalPreguntas) * 100);
    },
    [isInteractive, currentQuestion, answeredCount, totalPreguntas, onProgress],
  );

  const handleNext = useCallback(() => {
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((prev) => prev + 1);
    }
  }, [preguntaActual, totalPreguntas]);

  const handlePrevious = useCallback(() => {
    if (preguntaActual > 0) {
      setPreguntaActual((prev) => prev - 1);
    }
  }, [preguntaActual]);

  const handleFinish = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCompletado(true);

    // Calculate score
    let correctCount = 0;
    config.preguntas.forEach((q) => {
      const userAnswer = respuestas[q.id];
      if (q.tipo === 'opcionMultiple' && userAnswer === q.respuestaCorrecta) {
        correctCount++;
      } else if (q.tipo === 'verdaderoFalso' && userAnswer === q.respuestaCorrecta) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalPreguntas) * 100);

    onComplete?.({
      completado: true,
      puntuacion: score,
      respuesta: respuestas,
      tiempoMs: 0,
      intentos: 1,
    });
  }, [config.preguntas, respuestas, totalPreguntas, onComplete]);

  const handleRetry = useCallback(() => {
    setCompletado(false);
    setPreguntaActual(0);
    setRespuestas({});
    setTiempoRestante(config.tiempoLimite ?? null);
  }, [config.tiempoLimite]);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - Quiz
        </div>
        <h3 className="text-white font-medium">{config.titulo || config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm">
          {config.preguntas.length} preguntas
          {config.tiempoLimite && ` | ${Math.floor(config.tiempoLimite / 60)} min`}
        </div>
      </div>
    );
  }

  // Results view
  if (completado && results) {
    return (
      <div className="relative" data-testid={`quiz-${id}`}>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {config.titulo || 'Quiz Completado'}
          </h2>
          <div className="text-6xl font-bold text-blue-400 mb-2">
            {results.correctCount} de {results.totalPreguntas}
          </div>
          <p className="text-slate-400 mb-6">respuestas correctas</p>

          <div
            className={`
              p-4 rounded-lg mb-6
              ${results.score >= 80 ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
            `}
          >
            <p className={`font-medium ${results.score >= 80 ? 'text-green-400' : 'text-red-400'}`}>
              {results.score >= 80 ? config.feedback.correcto : config.feedback.incorrecto}
            </p>
          </div>

          {config.permitirReintentar && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" data-testid={`quiz-${id}`}>
      {/* Header */}
      <div className="mb-4">
        {config.titulo && <h2 className="text-xl font-bold text-white mb-1">{config.titulo}</h2>}
        <p className="text-slate-400">{config.instruccion}</p>
        {config.descripcion && <p className="text-sm text-slate-500 mt-1">{config.descripcion}</p>}
      </div>

      {/* Timer */}
      {config.tiempoLimite && tiempoRestante !== null && (
        <div
          data-testid="quiz-timer"
          className={`
            text-center mb-4 text-2xl font-mono font-bold
            ${tiempoRestante < 30 ? 'text-red-400' : 'text-blue-400'}
          `}
        >
          {formatTime(tiempoRestante)}
        </div>
      )}

      {/* Progress bar */}
      <div data-testid="quiz-progress" className="mb-4">
        <div className="flex justify-between text-sm text-slate-400 mb-1">
          <span>
            {preguntaActual + 1} de {totalPreguntas}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            data-testid="quiz-progress-fill"
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-slate-800/50 rounded-lg p-6 mb-4">
          <QuestionDisplay
            question={currentQuestion}
            selectedAnswer={currentAnswer ?? null}
            isInteractive={isInteractive}
            onSelect={handleSelect}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={preguntaActual === 0}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${preguntaActual === 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-600 hover:bg-slate-500 text-white'}
          `}
        >
          Anterior
        </button>

        {isLastQuestion && isCurrentAnswered ? (
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-500 text-white transition-colors"
          >
            Finalizar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentAnswered}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${!isCurrentAnswered ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}
            `}
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}
