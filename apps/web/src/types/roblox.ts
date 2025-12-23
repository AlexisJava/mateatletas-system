/**
 * Types for Roblox/Luau educational content
 */

export interface TestCase {
  description: string;
  check: (code: string) => boolean;
}

export interface Exercise {
  id: number;
  title: string;
  theory: string;
  image_url?: string;
  description: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  mode: 'theory' | 'practice' | 'quiz';
  starter_code: string;
  solution: string;
  expected_output: string[];
  hints: string[];
  test_cases: TestCase[];
  quiz?: QuizData;
}

export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation?: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export interface LuauOutput {
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp?: number;
}

export interface EditorState {
  code: string;
  output: LuauOutput[];
  isRunning: boolean;
  currentExercise: number;
}
