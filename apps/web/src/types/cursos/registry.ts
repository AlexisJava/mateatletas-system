/**
 * Sistema de registro centralizado de componentes educativos
 *
 * Este archivo define union types discriminados que permiten:
 * - Type-safe component registration
 * - Autocompletado en IDEs
 * - Pattern matching exhaustivo
 * - Validación de tipos en runtime con Zod
 *
 * REGLAS ESTRICTAS:
 * - NO usar `any`, `unknown`, o `Record<string, any>`
 * - Usar discriminated unions con campo "type"
 * - Todos los componentes deben estar registrados aquí
 *
 * @module lms-core/types/registry
 */

import type {
  // Slides
  IntroSlideProps,
  ContentSlideProps,
  TitleSlideProps,
  ReflectionSlideProps,
  SummarySlideProps,
  QuizSlideProps,
  InteractiveQuizSlideProps,
  CodeSlideProps,
  SimulationSlideProps,
  GameSlideProps,
  MathSlideProps,
  PhysicsSlideProps,
  ChemistrySlideProps,
  AstronomySlideProps,
  RobloxSlideProps,
  TableOfContentsSlideProps,
  GameDashboardSlideProps,
  RecapSlideProps,
  OutroPreviewSlideProps,
  ProgressSlideProps,
  VideoSlideProps,
  InteractiveImageSlideProps,
  ImageGallerySlideProps,
  FinalExamSlideProps,
  CertificateSlideProps,
} from './slides';

import type {
  // Games
  TriviaGameProps,
  TrueFalseGameProps,
  MatchingGameProps,
  SequenceGameProps,
  CategorizationGameProps,
  MemoryGameProps,
  WordSearchGameProps,
  CrosswordGameProps,
  WordCompletionGameProps,
  PuzzleGameProps,
  MazeGameProps,
  HanoiGameProps,
  MathOperationsGameProps,
  FractionsGameProps,
  GeometryGameProps,
  PhysicsExperimentGameProps,
  PeriodicTableGameProps,
  SolarSystemGameProps,
  CodeSequenceGameProps,
  DebugGameProps,
  AlgorithmBuildingGameProps,
  TextAdventureGameProps,
  DecisionGameProps,
  ReactionGameProps,
  RhythmGameProps,
  ResourceManagementGameProps,
  BuildingGameProps,
} from './games';

// ============================================================================
// TIPOS DISCRIMINADOS PARA SLIDES
// ============================================================================

export type IntroSlide = IntroSlideProps & { type: 'intro' };
export type ContentSlide = ContentSlideProps & { type: 'content' };
export type TitleSlide = TitleSlideProps & { type: 'title' };
export type ReflectionSlide = ReflectionSlideProps & { type: 'reflection' };
export type SummarySlide = SummarySlideProps & { type: 'summary' };
export type QuizSlide = QuizSlideProps & { type: 'quiz' };
export type InteractiveQuizSlide = InteractiveQuizSlideProps & { type: 'interactive_quiz' };
export type CodeSlide = CodeSlideProps & { type: 'code' };
export type SimulationSlide = SimulationSlideProps & { type: 'simulation' };
export type GameSlide = GameSlideProps & { type: 'game' };
export type MathSlide = MathSlideProps & { type: 'math' };
export type PhysicsSlide = PhysicsSlideProps & { type: 'physics' };
export type ChemistrySlide = ChemistrySlideProps & { type: 'chemistry' };
export type AstronomySlide = AstronomySlideProps & { type: 'astronomy' };
export type RobloxSlide = RobloxSlideProps & { type: 'roblox' };
export type TableOfContentsSlide = TableOfContentsSlideProps & { type: 'table-of-contents' };
export type GameDashboardSlide = GameDashboardSlideProps & {
  type: 'game-dashboard' | 'game_dashboard';
};
export type RecapSlide = RecapSlideProps & { type: 'recap' };
export type OutroPreviewSlide = OutroPreviewSlideProps & { type: 'outro_preview' };
export type ProgressSlide = ProgressSlideProps & { type: 'progress' };
export type VideoSlide = VideoSlideProps & { type: 'video' };
export type InteractiveImageSlide = InteractiveImageSlideProps & { type: 'interactive-image' };
export type ImageGallerySlide = ImageGallerySlideProps & { type: 'image-gallery' };
export type FinalExamSlide = FinalExamSlideProps & { type: 'final-exam' };
export type CertificateSlide = CertificateSlideProps & { type: 'certificate' };

/**
 * Union type de TODOS los slides con discriminador de tipo
 */
export type Slide =
  | IntroSlide
  | ContentSlide
  | TitleSlide
  | ReflectionSlide
  | SummarySlide
  | QuizSlide
  | InteractiveQuizSlide
  | CodeSlide
  | SimulationSlide
  | GameSlide
  | MathSlide
  | PhysicsSlide
  | ChemistrySlide
  | AstronomySlide
  | RobloxSlide
  | TableOfContentsSlide
  | GameDashboardSlide
  | RecapSlide
  | OutroPreviewSlide
  | ProgressSlide
  | VideoSlide
  | InteractiveImageSlide
  | ImageGallerySlide
  | FinalExamSlide
  | CertificateSlide;

export type SlideType = Slide['type'];

// ============================================================================
// TIPOS DISCRIMINADOS PARA JUEGOS
// ============================================================================

export type TriviaGame = TriviaGameProps & { type: 'trivia' };
export type TrueFalseGame = TrueFalseGameProps & { type: 'true-false' };
export type MatchingGame = MatchingGameProps & { type: 'matching' };
export type SequenceGame = SequenceGameProps & { type: 'sequence' };
export type CategorizationGame = CategorizationGameProps & { type: 'categorization' };
export type MemoryGame = MemoryGameProps & { type: 'memory' };
export type WordSearchGame = WordSearchGameProps & { type: 'word-search' };
export type CrosswordGame = CrosswordGameProps & { type: 'crossword' };
export type WordCompletionGame = WordCompletionGameProps & { type: 'word-completion' };
export type PuzzleGame = PuzzleGameProps & { type: 'puzzle' };
export type MazeGame = MazeGameProps & { type: 'maze' };
export type HanoiGame = HanoiGameProps & { type: 'hanoi' };
export type MathOperationsGame = MathOperationsGameProps & { type: 'math-operations' };
export type FractionsGame = FractionsGameProps & { type: 'fractions' };
export type GeometryGame = GeometryGameProps & { type: 'geometry' };
export type PhysicsExperimentGame = PhysicsExperimentGameProps & { type: 'physics-experiment' };
export type PeriodicTableGame = PeriodicTableGameProps & { type: 'periodic-table' };
export type SolarSystemGame = SolarSystemGameProps & { type: 'solar-system' };
export type CodeSequenceGame = CodeSequenceGameProps & { type: 'code-sequence' };
export type DebugGame = DebugGameProps & { type: 'debug' };
export type AlgorithmBuildingGame = AlgorithmBuildingGameProps & { type: 'algorithm-building' };
export type TextAdventureGame = TextAdventureGameProps & { type: 'text-adventure' };
export type DecisionGame = DecisionGameProps & { type: 'decision' };
export type ReactionGame = ReactionGameProps & { type: 'reaction' };
export type RhythmGame = RhythmGameProps & { type: 'rhythm' };
export type ResourceManagementGame = ResourceManagementGameProps & { type: 'resource-management' };
export type BuildingGame = BuildingGameProps & { type: 'building' };

/**
 * Union type de TODOS los juegos con discriminador de tipo
 */
export type Game =
  | TriviaGame
  | TrueFalseGame
  | MatchingGame
  | SequenceGame
  | CategorizationGame
  | MemoryGame
  | WordSearchGame
  | CrosswordGame
  | WordCompletionGame
  | PuzzleGame
  | MazeGame
  | HanoiGame
  | MathOperationsGame
  | FractionsGame
  | GeometryGame
  | PhysicsExperimentGame
  | PeriodicTableGame
  | SolarSystemGame
  | CodeSequenceGame
  | DebugGame
  | AlgorithmBuildingGame
  | TextAdventureGame
  | DecisionGame
  | ReactionGame
  | RhythmGame
  | ResourceManagementGame
  | BuildingGame;

export type GameType = Game['type'];

// ============================================================================
// UNION DE COMPONENTES
// ============================================================================

export type EducationalComponent = Slide | Game;
export type EducationalComponentType = EducationalComponent['type'];

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isSlide(component: EducationalComponent): component is Slide {
  const slideTypes: SlideType[] = [
    'intro',
    'content',
    'title',
    'reflection',
    'summary',
    'quiz',
    'code',
    'simulation',
    'game',
    'math',
    'physics',
    'chemistry',
    'astronomy',
    'roblox',
    'table-of-contents',
    'game-dashboard',
    'progress',
    'video',
    'interactive-image',
    'image-gallery',
    'final-exam',
    'certificate',
  ];
  return slideTypes.includes(component.type as SlideType);
}

export function isGame(component: EducationalComponent): component is Game {
  return !isSlide(component);
}

// ============================================================================
// COMPOSICIÓN DE CURSOS
// ============================================================================

export interface Lesson {
  id: string;
  name: string;
  description?: string;
  slides: Slide[];
  order: number;
  published: boolean;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  lessons: Lesson[];
  order: number;
  published: boolean;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  theme: 'matematicas' | 'astro' | 'roblox' | 'quimica' | 'fisica' | 'default';
  modules: Module[];
  published: boolean;
}

// ============================================================================
// PROGRESO
// ============================================================================

export interface SlideProgress {
  slideId: string;
  completed: boolean;
  score?: number;
  timeSpent?: number;
  lastInteraction: Date;
}

export interface LessonProgress {
  lessonId: string;
  slideProgress: SlideProgress[];
  completed: boolean;
  progress: number;
}

export interface CourseProgress {
  courseId: string;
  studentId: string;
  lessonProgress: LessonProgress[];
  overallProgress: number;
  completed: boolean;
  enrolledAt: Date;
}
