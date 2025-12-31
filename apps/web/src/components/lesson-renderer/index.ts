/**
 * Lesson Renderer - Shared Content Rendering System
 *
 * Este módulo proporciona el sistema de renderizado de contenido educativo
 * usado tanto por el Admin (Studio) como por el Portal Estudiante.
 *
 * Componentes principales:
 * - LessonRenderer: Componente principal que renderiza contenidoJson
 * - JSONRenderer: Renderizador recursivo de ContentBlocks
 * - DesignSystem: Componentes visuales (Stage, InfoAlert, etc.)
 */

// Main renderer component
export { LessonRenderer } from './LessonRenderer';

// Core rendering
export { JSONRenderer } from './JSONRenderer';

// Design System components
export {
  ViewportContext,
  Stage,
  ContentZone,
  Columns,
  LessonHeader,
  ActionCard,
  STEAMChallenge,
  MathHero,
  InfoAlert,
  StatCard,
  Formula,
  Timeline,
  TextBlock,
  Heading,
} from './DesignSystem';

// Types
export type { ContentBlock, HouseColors } from './types';
export { HOUSE_COLORS, DEFAULT_HOUSE_COLORS } from './types';
