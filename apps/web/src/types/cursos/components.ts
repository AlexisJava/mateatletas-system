/**
 * Tipos base para todos los componentes educativos de Ciudad Mateatleta
 *
 * REGLAS ESTRICTAS:
 * - NO usar `any`, `unknown`, o `Record<string, any>`
 * - Todos los tipos deben ser explícitos y bien documentados
 * - Usar union types en lugar de tipos abiertos
 * - Preferir interfaces sobre types para mejor composición
 *
 * @module lms-core/types/components
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Tipo base para todos los slides educativos
 */
export interface BaseSlideProps {
  /** Identificador único del slide */
  id: string;

  /** Título principal del slide */
  title: string;

  /** Descripción opcional del slide */
  description?: string;
}

/**
 * Tema de curso disponible
 */
export type CourseTheme = 'matematicas' | 'astro' | 'roblox' | 'quimica' | 'fisica' | 'default';

/**
 * Nivel de dificultad
 */
export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'experto';

/**
 * Tipo de animación para transiciones
 */
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce' | 'none';

// ============================================================================
// CONTENIDO DE TEXTO
// ============================================================================

/**
 * Tipo de contenido de texto enriquecido
 */
export type RichTextType =
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'code'
  | 'quote'
  | 'callout'
  | 'visual-split';

/**
 * Nivel de heading (h1-h6)
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Tipo de lista
 */
export type ListType = 'ordered' | 'unordered' | 'checklist';

/**
 * Tipo de callout/alert
 */
export type CalloutType =
  | 'info'
  | 'warning'
  | 'success'
  | 'error'
  | 'tip'
  | 'danger'
  | 'question'
  | 'epic';

/**
 * Contenido de texto enriquecido
 */
export interface RichTextContent {
  /** Tipo de contenido */
  type: RichTextType;

  /** Contenido del texto (puede incluir markdown) */
  content: string;

  /** Nivel del heading (solo para type='heading') */
  level?: HeadingLevel;

  /** Items de la lista (solo para type='list') */
  items?: string[];

  /** Tipo de lista (solo para type='list') */
  listType?: ListType;

  /** Lenguaje para syntax highlighting (solo para type='code') */
  language?: string;

  /** Mostrar números de línea (solo para type='code') */
  showLineNumbers?: boolean;

  /** Líneas a resaltar (solo para type='code') */
  highlightLines?: number[];

  /** Tipo de callout (solo para type='callout') */
  calloutType?: CalloutType;

  /** Título del callout (solo para type='callout') */
  calloutTitle?: string;

  /** Descripción del visual (solo para type='visual-split') */
  visual?: string;

  /** Componente de visualización React (solo para type='visual-split') */
  visualComponent?: string;
}

// ============================================================================
// CONTENIDO MULTIMEDIA
// ============================================================================

/**
 * Tipo de media
 */
export type MediaType = 'image' | 'video' | 'audio' | 'iframe';

/**
 * Posición del media en el layout
 */
export type MediaPosition = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'background';

/**
 * Contenido multimedia
 */
export interface MediaContent {
  /** Tipo de media */
  type: MediaType;

  /** URL del recurso */
  src: string;

  /** Texto alternativo (accesibilidad) */
  alt?: string;

  /** Caption o descripción del media */
  caption?: string;

  /** Ancho en píxeles */
  width?: number;

  /** Alto en píxeles */
  height?: number;

  /** Posición en el layout */
  position?: MediaPosition;

  /** Si debe hacer autoplay (solo video/audio) */
  autoplay?: boolean;

  /** Si debe hacer loop (solo video/audio) */
  loop?: boolean;

  /** Si debe mostrar controles (solo video/audio) */
  controls?: boolean;

  /** Thumbnail para video */
  poster?: string;
}

// ============================================================================
// QUIZ Y EVALUACIÓN
// ============================================================================

/**
 * Tipo de pregunta de quiz
 */
export type QuizQuestionType =
  | 'multiple-choice' // Opción múltiple
  | 'true-false' // Verdadero/Falso
  | 'fill-blank' // Llenar el espacio
  | 'ordering' // Ordenar secuencia
  | 'matching' // Emparejar
  | 'short-answer'; // Respuesta corta

/**
 * Opción de respuesta en quiz
 */
export interface QuizOption {
  /** ID único de la opción */
  id: string;

  /** Texto de la opción */
  text: string;

  /** Si esta opción es correcta */
  isCorrect: boolean;

  /** Explicación de por qué es/no es correcta */
  explanation?: string;

  /** Imagen opcional para la opción */
  image?: string;
}

/**
 * Pregunta de quiz
 */
export interface QuizQuestion {
  /** ID único de la pregunta */
  id: string;

  /** Texto de la pregunta */
  question: string;

  /** Tipo de pregunta */
  type: QuizQuestionType;

  /** Opciones de respuesta */
  options: QuizOption[];

  /** Explicación general de la pregunta */
  explanation?: string;

  /** Feedback cuando se responde correctamente */
  feedback_correct?: string;

  /** Feedback cuando se responde incorrectamente */
  feedback_incorrect?: string;

  /** Puntos que vale la pregunta */
  points?: number;

  /** Hints o pistas para ayudar */
  hints?: string[];

  /** Imagen o diagrama de la pregunta */
  image?: string;

  /** Tiempo límite en segundos */
  timeLimit?: number;
}

/**
 * Resultado de un quiz
 */
export interface QuizResult {
  /** ID del quiz */
  quizId: string;

  /** Respuestas del usuario */
  answers: Map<string, string>; // questionId -> answerId

  /** Puntos obtenidos */
  score: number;

  /** Puntos máximos posibles */
  maxScore: number;

  /** Porcentaje (0-100) */
  percentage: number;

  /** Si pasó el quiz */
  passed: boolean;

  /** Tiempo total en segundos */
  timeSpent: number;

  /** Timestamp de finalización */
  completedAt: Date;
}

// ============================================================================
// CÓDIGO INTERACTIVO
// ============================================================================

/**
 * Lenguajes de programación soportados
 */
export type ProgrammingLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'lua'
  | 'html'
  | 'css'
  | 'sql'
  | 'json';

/**
 * Contenido de código
 */
export interface CodeContent {
  /** Lenguaje de programación */
  language: ProgrammingLanguage;

  /** Código fuente */
  code: string;

  /** Si el código es de solo lectura */
  readonly?: boolean;

  /** Mostrar números de línea */
  showLineNumbers?: boolean;

  /** Líneas a resaltar */
  highlightLines?: number[];

  /** Tema del editor */
  theme?: 'light' | 'dark' | 'github' | 'monokai';

  /** Alto del editor en píxeles */
  height?: number;

  /** Si debe mostrar minimap */
  showMinimap?: boolean;
}

/**
 * Test case para código
 */
export interface CodeTestCase {
  /** ID del test */
  id: string;

  /** Descripción del test */
  description: string;

  /** Input del test */
  input: string;

  /** Output esperado */
  expectedOutput: string;

  /** Si es un test oculto (no se muestra al estudiante) */
  hidden?: boolean;

  /** Puntos que vale este test */
  points?: number;
}

// ============================================================================
// GAMIFICACIÓN
// ============================================================================

/**
 * Tipo de logro/achievement
 */
export type AchievementType =
  | 'completion' // Completar algo
  | 'perfection' // Hacer algo perfecto
  | 'speed' // Hacer algo rápido
  | 'streak' // Racha de días
  | 'mastery' // Dominar un tema
  | 'exploration'; // Explorar contenido

/**
 * Rareza de un logro
 */
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Logro/Achievement
 */
export interface Achievement {
  /** ID único del logro */
  id: string;

  /** Nombre del logro */
  name: string;

  /** Descripción */
  description: string;

  /** Tipo de logro */
  type: AchievementType;

  /** Rareza */
  rarity: AchievementRarity;

  /** Icono (emoji o ruta de imagen) */
  icon: string;

  /** Puntos que otorga */
  points: number;

  /** Si es un logro secreto */
  secret?: boolean;

  /** Fecha de desbloqueo (si ya fue desbloqueado) */
  unlockedAt?: Date;
}

/**
 * Configuración de scoring
 */
export interface ScoringConfig {
  /** Puntos por respuesta correcta */
  pointsPerCorrect: number;

  /** Puntos que se restan por error (puede ser 0) */
  pointsPerError: number;

  /** Multiplicador de bonus */
  bonusMultiplier?: number;

  /** Umbral para pasar (0-100) */
  passingThreshold?: number;

  /** Puntos extra por velocidad */
  speedBonus?: boolean;

  /** Puntos extra por racha perfecta */
  perfectStreakBonus?: boolean;
}

// ============================================================================
// METADATA Y CONFIGURACIÓN
// ============================================================================

/**
 * Metadata común para componentes interactivos
 */
export interface InteractiveMetadata {
  /** Tiempo estimado en minutos */
  estimatedTime?: number;

  /** Nivel de dificultad */
  difficulty?: DifficultyLevel;

  /** Conocimientos previos requeridos */
  requiredKnowledge?: string[];

  /** Objetivos de aprendizaje */
  learningObjectives?: string[];

  /** Tags para categorización */
  tags?: string[];

  /** Autor del contenido */
  author?: string;

  /** Fecha de creación */
  createdAt?: Date;

  /** Fecha de última actualización */
  updatedAt?: Date;

  /** Versión del contenido */
  version?: string;
}

/**
 * Configuración de navegación
 */
export interface NavigationConfig {
  /** Si se puede ir al siguiente slide */
  canGoNext: boolean;

  /** Si se puede ir al anterior slide */
  canGoPrevious: boolean;

  /** Texto del botón siguiente */
  nextButtonText?: string;

  /** Texto del botón anterior */
  previousButtonText?: string;

  /** Si debe mostrar progress bar */
  showProgress?: boolean;

  /** Slide actual (1-indexed) */
  currentSlide?: number;

  /** Total de slides */
  totalSlides?: number;

  /** Si debe confirmar antes de salir */
  confirmExit?: boolean;
}

/**
 * Configuración de accesibilidad
 */
export interface AccessibilityConfig {
  /** Habilitar navegación por teclado */
  keyboardNavigation?: boolean;

  /** Habilitar lector de pantalla */
  screenReader?: boolean;

  /** Nivel de contraste */
  highContrast?: boolean;

  /** Reducir animaciones */
  reducedMotion?: boolean;

  /** Tamaño de fuente aumentado */
  largeFonts?: boolean;

  /** Subtítulos para videos */
  captions?: boolean;
}

// ============================================================================
// CALLBACKS Y EVENTOS
// ============================================================================

/**
 * Callback de navegación
 */
export type NavigationCallback = () => void;

/**
 * Callback de cambio de valor
 */
export type ChangeCallback<T> = (value: T) => void;

/**
 * Callback de completado
 */
export type CompletionCallback<T = void> = (result: T) => void;

/**
 * Callback de error
 */
export type ErrorCallback = (error: Error) => void;

/**
 * Evento de progreso
 */
export interface ProgressEvent {
  /** ID del elemento */
  elementId: string;

  /** Tipo de elemento */
  elementType: string;

  /** Progreso (0-1) */
  progress: number;

  /** Si fue completado */
  completed: boolean;

  /** Timestamp del evento */
  timestamp: Date;

  /** Datos adicionales */
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Callback de progreso
 */
export type ProgressCallback = (event: ProgressEvent) => void;
