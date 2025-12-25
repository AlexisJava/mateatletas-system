/**
 * Sandbox Types - Mateatletas Content Editor
 *
 * Tipos para el sistema de creación de contenido educativo.
 * El Sandbox usa JSON estructurado que se renderiza como componentes React.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export enum House {
  QUANTUM = 'QUANTUM',
  VERTEX = 'VERTEX',
  PULSAR = 'PULSAR',
}

export type Subject = 'MATH' | 'CODE' | 'SCIENCE';

// ─────────────────────────────────────────────────────────────────────────────
// HOUSE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export interface HouseConfig {
  name: string;
  ageRange: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT STRUCTURE (JSON Schema)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ContentBlock - Estructura recursiva para contenido educativo
 *
 * Cada bloque tiene un tipo (componente), props opcionales,
 * y children que pueden ser más bloques o texto.
 */
export interface ContentBlock {
  type: string;
  props?: Record<string, unknown>;
  children?: ContentBlock[] | string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LESSON STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

export interface Slide {
  id: string;
  title: string;
  /** JSON string que Monaco edita - se parsea a ContentBlock para renderizar */
  content: string;
}

export interface Lesson {
  id: string;
  title: string;
  house: House;
  subject: Subject;
  slides: Slide[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM COMPONENT DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

export interface DesignSystemComponent {
  name: string;
  description: string;
  /** JSON por defecto cuando se inserta el componente */
  defaultStructure: ContentBlock;
  category: 'layout' | 'content';
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW STATE
// ─────────────────────────────────────────────────────────────────────────────

export type SandboxViewMode = 'split' | 'editor' | 'preview';
export type PreviewMode = 'desktop' | 'mobile';

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

export type BackgroundPattern = 'dots' | 'cyber-grid' | 'stars' | 'aurora' | 'matrix';

export interface BackgroundPreset {
  id: BackgroundPattern | string;
  name: string;
  css: string;
}
