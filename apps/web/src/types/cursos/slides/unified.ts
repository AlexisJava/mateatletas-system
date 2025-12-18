/**
 * lib/types/slides/unified.ts
 * ===========================
 * Sistema unificado de tipos para slides de todos los cursos
 *
 * Este archivo define un sistema de tipos flexible que puede manejar:
 * - Matemáticas: Slides complejos con interactividad
 * - Astro: Slides con contenido multimedia
 * - Roblox: Slides con código y ejemplos
 * - Química/Mes de la Ciencia: Slides narrativos
 */

// ============================================================================
// TIPOS BASE Y COMPARTIDOS
// ============================================================================

export type Curso = 'matematicas' | 'astro' | 'roblox' | 'mes-ciencia';

/**
 * Tipos de slides soportados por el sistema unificado
 */
export type UnifiedSlideType =
  // Slides comunes a todos los cursos
  | 'intro'
  | 'content'
  | 'quiz'
  | 'reflection'
  | 'game_dashboard'
  | 'recap'
  | 'outro'
  // Slides específicos de matemáticas
  | 'interactive_quiz'
  | 'game_embed'
  | 'outro_preview'
  | 'cuento'
  | 'verdadero_falso'
  | 'analogia'
  | 'celebracion'
  // Slides específicos de roblox
  | 'title'
  | 'narrative'
  | 'objective'
  | 'example'
  | 'code'
  | 'explanation'
  | 'activity'
  | 'mini_lesson'
  | 'summary'
  | 'closing'
  | 'image'
  // Slides específicos de astro
  | 'interactive_embed'
  | 'game_break'
  | 'content_special';

/**
 * Tipos de transición entre slides
 */
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'none';

/**
 * Tipos de interactividad disponibles
 */
export type InteractivityType =
  | 'copy_button'
  | 'user_task'
  | 'quiz'
  | 'reflection_input'
  | 'conversatorio'
  | 'checkbox_multiple';

// ============================================================================
// INTERFACES COMPARTIDAS
// ============================================================================

/**
 * Opción de quiz base
 */
export interface BaseQuizOption {
  id: string;
  text: string;
  correct: boolean;
}

/**
 * Pregunta de quiz base
 */
export interface BaseQuizQuestion {
  id: string;
  question: string;
  options: BaseQuizOption[];
}

/**
 * Quiz con feedback (matemáticas)
 */
export interface QuizWithFeedback extends BaseQuizQuestion {
  feedback_correct: string;
  feedback_incorrect: string;
}

/**
 * Quiz simple (roblox)
 */
export interface SimpleQuiz {
  question: string;
  options: string[];
  correct_answer: string;
  feedback: string;
}

/**
 * Punto clave de aprendizaje
 */
export interface KeyLearning {
  icon: string;
  title: string;
  description: string;
}

/**
 * Información de juego
 */
export interface GameInfo {
  id: string;
  title: string;
  description: string;
  route: string;
  icon?: string;
  estimated_time?: string;
  points?: number;
}

/**
 * Botón CTA
 */
export interface CTAButton {
  text: string;
  route: string;
}

// ============================================================================
// SLIDE BASE UNIFICADO
// ============================================================================

/**
 * Slide base del que heredan todos los demás
 */
export interface UnifiedBaseSlide {
  id: string | number;
  type: UnifiedSlideType;
  title?: string;
  transition?: TransitionType;
  interactivity?: InteractivityType;

  /**
   * Contenido del slide
   * Puede ser string (HTML) o un objeto estructurado
   */
  content: string | Record<string, unknown>;

  /**
   * Metadata opcional del slide
   */
  metadata?: {
    duration?: string;
    points?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
  };
}

// ============================================================================
// SLIDES ESPECÍFICOS - COMUNES
// ============================================================================

export interface UnifiedIntroSlide extends UnifiedBaseSlide {
  type: 'intro';
  content: {
    lambda_message?: string;
    message?: string;
    visual?: string;
    theme?: string;
    duration?: string;
    cta: string;
  };
}

export interface UnifiedContentSlide extends UnifiedBaseSlide {
  type: 'content' | 'content_special';
  content: {
    lambda_message?: string;
    message?: string;

    // Contenido visual
    visual_timeline?: Array<{
      era: string;
      description: string;
      image_search: string;
    }>;
    visual_grid?: Array<{
      profession: string;
      skill: string;
      image_search: string;
    }>;

    // Puntos clave
    key_points?: string[];
    fun_fact?: string;
    visual_note?: string;
    reflection_prompt?: string;

    // Mini quiz embebido
    mini_quiz?: {
      question: string;
      options: Array<{
        id: string;
        text: string;
        correct: boolean;
        feedback: string;
      }>;
    };

    // Tratamiento especial (astro)
    special_treatment?: {
      animation?: string;
      music_cue?: string;
      visual_sequence?: string[];
    };

    cta: string;
  };
}

export interface UnifiedQuizSlide extends UnifiedBaseSlide {
  type: 'quiz';
  content: {
    lambda_intro?: string;
    intro?: string;
    questions: QuizWithFeedback[] | SimpleQuiz[];
    cta: string;
  };
  quiz?: SimpleQuiz; // Formato legacy de roblox
}

export interface UnifiedReflectionSlide extends UnifiedBaseSlide {
  type: 'reflection';
  content: {
    lambda_message?: string;
    message?: string;
    interaction_type?: string;
    input_config?: {
      placeholder: string;
      max_chars: number;
      optional: boolean;
    };
    closing_message?: string;
    cta: string;
  };
}

export interface UnifiedGameDashboardSlide extends UnifiedBaseSlide {
  type: 'game_dashboard' | 'game_break';
  content: {
    lambda_message?: string;
    message?: string;
    games?: GameInfo[];
    game_name?: string;
    game_url?: string;
    game_description?: string;
    game_route?: string;
    points_available?: number;
    estimated_time?: string;
    navigation_note?: string;
    cta_continue?: string;
    cta?: string;
  };
}

export interface UnifiedRecapSlide extends UnifiedBaseSlide {
  type: 'recap' | 'summary';
  content: {
    lambda_message?: string;
    message?: string;
    key_learnings?: KeyLearning[];
    learnings?: string[];
    closing_message?: string;
    cta: string;
  };
}

export interface UnifiedOutroSlide extends UnifiedBaseSlide {
  type: 'outro' | 'closing';
  content: {
    lambda_message?: string;
    message?: string;
    preview_next?: string;
    achievements?: string[];
    logros?: string[];
    cta_feedback?: string;
    cta_next?: string;
    cta?: string;
  };
}

// ============================================================================
// SLIDES ESPECÍFICOS - MATEMÁTICAS
// ============================================================================

export interface UnifiedInteractiveQuizSlide extends UnifiedBaseSlide {
  type: 'interactive_quiz';
  content: {
    lambda_message: string;
    interaction_type: string;
    options: Array<{
      id: string;
      label: string;
      icon: string;
      description: string;
      feedback: string;
    }>;
    final_message: string;
    cta: string;
  };
}

export interface UnifiedGameEmbedSlide extends UnifiedBaseSlide {
  type: 'game_embed';
  content: {
    lambda_message: string;
    game_route: string;
    game_config: {
      mode: string;
      cases_count: number;
      embedded: boolean;
    };
    cta_after_game: string;
  };
}

export interface UnifiedCuentoSlide extends UnifiedBaseSlide {
  type: 'cuento';
  content: {
    emoji?: string;
    escenas: Array<{
      imagen: string;
      texto: string;
      color?: string;
    }>;
  };
}

export interface UnifiedVerdaderoFalsoSlide extends UnifiedBaseSlide {
  type: 'verdadero_falso';
  content: {
    emoji?: string;
    pregunta: string;
    respuestaCorrecta: boolean;
    feedbackCorrecto: string;
    feedbackIncorrecto: string;
  };
}

export interface UnifiedAnalogiaSlide extends UnifiedBaseSlide {
  type: 'analogia';
  content: {
    emoji?: string;
    comparacion: {
      concepto: string;
      esComoParte1: string;
      porque: string;
      ejemplo: string;
    };
  };
}

export interface UnifiedCelebracionSlide extends UnifiedBaseSlide {
  type: 'celebracion';
  content: {
    emoji?: string;
    mensaje: string;
    logros: string[];
  };
}

// ============================================================================
// SLIDES ESPECÍFICOS - ROBLOX
// ============================================================================

export interface UnifiedCodeSlide extends UnifiedBaseSlide {
  type: 'code' | 'example';
  content: string; // HTML con código formateado
  interactivity?: 'copy_button' | 'user_task';
}

export interface UnifiedActivitySlide extends UnifiedBaseSlide {
  type: 'activity';
  content: string; // HTML con instrucciones
  interactivity?: 'user_task';
}

export interface UnifiedImageSlide extends UnifiedBaseSlide {
  type: 'image';
  content: string; // HTML con imagen
}

// ============================================================================
// SLIDES ESPECÍFICOS - ASTRO
// ============================================================================

export interface UnifiedInteractiveEmbedSlide extends UnifiedBaseSlide {
  type: 'interactive_embed';
  content: {
    lambda_message: string;
    embed_url: string;
    embed_title: string;
    instructions: string;
    reflection_prompt: string;
    cta: string;
  };
}

// ============================================================================
// TIPO UNIÓN FINAL
// ============================================================================

/**
 * Tipo unión de todos los slides posibles
 * Este es el tipo principal que se debe usar en la aplicación
 */
export type UnifiedSlide =
  // Comunes
  | UnifiedIntroSlide
  | UnifiedContentSlide
  | UnifiedQuizSlide
  | UnifiedReflectionSlide
  | UnifiedGameDashboardSlide
  | UnifiedRecapSlide
  | UnifiedOutroSlide
  // Matemáticas específico
  | UnifiedInteractiveQuizSlide
  | UnifiedGameEmbedSlide
  | UnifiedCuentoSlide
  | UnifiedVerdaderoFalsoSlide
  | UnifiedAnalogiaSlide
  | UnifiedCelebracionSlide
  // Roblox específico
  | UnifiedCodeSlide
  | UnifiedActivitySlide
  | UnifiedImageSlide
  // Astro específico
  | UnifiedInteractiveEmbedSlide
  // Simples (narrativa, objetivo, explicación, mini_lesson)
  | UnifiedBaseSlide;

// ============================================================================
// ESTADO DE PROGRESO UNIFICADO
// ============================================================================

export interface UnifiedProgressState {
  currentSlide: number;
  completedGames: string[];
  quizAnswers: Record<string, string[]>;
  conversatorioAnswers?: Record<string, string[]>;
  reflection?: string;
  completedActivities?: string[];
  totalSlides?: number;
}

// ============================================================================
// CONFIGURACIÓN DE SEMANA UNIFICADA
// ============================================================================

export interface UnifiedWeekConfig {
  weekNumber: number;
  curso: Curso;
  title: string;
  description: string;
  unlock_date?: string;
  status: 'locked' | 'unlocked' | 'in-progress' | 'completed';
  theme?: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    font?: string;
  };
  slides: UnifiedSlide[];
  metadata?: {
    estimated_duration: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    learning_objectives: string[];
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isQuizSlide(slide: UnifiedSlide): slide is UnifiedQuizSlide {
  return slide.type === 'quiz';
}

export function isGameSlide(
  slide: UnifiedSlide,
): slide is UnifiedGameDashboardSlide | UnifiedGameEmbedSlide {
  return (
    slide.type === 'game_dashboard' || slide.type === 'game_embed' || slide.type === 'game_break'
  );
}

export function isInteractiveSlide(slide: UnifiedSlide): boolean {
  return Boolean(slide.interactivity);
}

export function isCodeSlide(slide: UnifiedSlide): slide is UnifiedCodeSlide {
  return slide.type === 'code' || slide.type === 'example';
}

export function isReflectionSlide(slide: UnifiedSlide): slide is UnifiedReflectionSlide {
  return slide.type === 'reflection';
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extrae el mensaje principal de un slide
 */
export function getSlideMessage(slide: UnifiedSlide): string {
  if (typeof slide.content === 'string') {
    return slide.content;
  }

  const content = slide.content as Record<string, unknown>;
  return (content.lambda_message || content.message || slide.title || '') as string;
}

/**
 * Verifica si un slide tiene CTA
 */
export function hasCTA(slide: UnifiedSlide): boolean {
  if (typeof slide.content === 'string') {
    return false;
  }

  const content = slide.content as Record<string, unknown>;
  return Boolean(content.cta || content.cta_continue || content.cta_next);
}

/**
 * Obtiene el texto del CTA
 */
export function getCTAText(slide: UnifiedSlide): string | null {
  if (typeof slide.content === 'string') {
    return null;
  }

  const content = slide.content as Record<string, unknown>;
  return (content.cta || content.cta_continue || content.cta_next || null) as string | null;
}
