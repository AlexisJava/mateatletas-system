/**
 * Hook: useQuiz
 *
 * Hook headless para manejar la lógica de un quiz de opción múltiple.
 * No incluye UI - solo lógica de estado y validación.
 *
 * @example
 * ```tsx
 * const quiz = useQuiz({
 *   options: ['A', 'B', 'C', 'D'],
 *   correctIndex: 1,
 *   onComplete: (correct) => console.log(correct)
 * });
 *
 * return (
 *   <>
 *     {quiz.options.map((opt, i) => (
 *       <button
 *         key={i}
 *         onClick={() => quiz.select(i)}
 *         disabled={quiz.isSubmitted}
 *       >
 *         {opt}
 *       </button>
 *     ))}
 *     <button onClick={quiz.submit} disabled={!quiz.canSubmit}>
 *       Confirmar
 *     </button>
 *   </>
 * );
 * ```
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseQuizOptions {
  /** Opciones del quiz */
  options: string[];
  /** Índice de la respuesta correcta */
  correctIndex: number;
  /** Si se permite cambiar la selección después de elegir */
  allowChange?: boolean;
  /** Callback al completar (submit) el quiz */
  onComplete?: (isCorrect: boolean, selectedIndex: number) => void;
}

export interface UseQuizReturn {
  /** Las opciones del quiz */
  options: string[];
  /** Índice seleccionado actualmente (null si ninguno) */
  selectedIndex: number | null;
  /** Si ya se envió la respuesta */
  isSubmitted: boolean;
  /** Si la respuesta fue correcta (null si no se envió) */
  isCorrect: boolean | null;
  /** Si se puede enviar (hay selección y no se envió) */
  canSubmit: boolean;
  /** Seleccionar una opción */
  select: (index: number) => void;
  /** Enviar la respuesta */
  submit: () => void;
  /** Reiniciar el quiz */
  reset: () => void;
  /** Índice de la respuesta correcta (solo visible después de submit) */
  correctIndex: number | null;
}

export function useQuiz({
  options,
  correctIndex,
  allowChange = true,
  onComplete,
}: UseQuizOptions): UseQuizReturn {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = useMemo(() => {
    if (!isSubmitted || selectedIndex === null) return null;
    return selectedIndex === correctIndex;
  }, [isSubmitted, selectedIndex, correctIndex]);

  const canSubmit = useMemo(() => {
    return selectedIndex !== null && !isSubmitted;
  }, [selectedIndex, isSubmitted]);

  const select = useCallback(
    (index: number) => {
      if (isSubmitted) return;
      if (!allowChange && selectedIndex !== null) return;
      if (index < 0 || index >= options.length) return;
      setSelectedIndex(index);
    },
    [isSubmitted, allowChange, selectedIndex, options.length],
  );

  const submit = useCallback(() => {
    if (!canSubmit || selectedIndex === null) return;
    setIsSubmitted(true);
    const correct = selectedIndex === correctIndex;
    onComplete?.(correct, selectedIndex);
  }, [canSubmit, selectedIndex, correctIndex, onComplete]);

  const reset = useCallback(() => {
    setSelectedIndex(null);
    setIsSubmitted(false);
  }, []);

  return {
    options,
    selectedIndex,
    isSubmitted,
    isCorrect,
    canSubmit,
    select,
    submit,
    reset,
    correctIndex: isSubmitted ? correctIndex : null,
  };
}
