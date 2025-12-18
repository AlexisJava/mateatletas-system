/**
 * Tipos base compartidos entre todos los cursos y juegos
 */

// ============================================
// QUIZ TYPES
// ============================================

export interface BaseQuizOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface BaseQuizQuestion {
  id: string | number;
  question: string;
  options: BaseQuizOption[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
  // Compatibilidad con versiones antiguas
  feedback_correct?: string;
  feedback_incorrect?: string;
}

// Helper para normalizar feedback
export function normalizeFeedback(question: BaseQuizQuestion): {
  correct: string;
  incorrect: string;
} {
  if (question.feedback) {
    return question.feedback;
  }
  return {
    correct: question.feedback_correct || 'Correcto',
    incorrect: question.feedback_incorrect || 'Incorrecto',
  };
}

// ============================================
// SLIDE TYPES COMUNES
// ============================================

export interface KeyLearning {
  icon: string;
  title: string;
  description: string;
}

export interface BaseSlide {
  id: string;
  type: string;
  title: string;
}

// ============================================
// PROGRESS TYPES
// ============================================

export interface BaseProgressState {
  currentSlide: number;
  quizAnswers: Record<string, string[]>;
}
