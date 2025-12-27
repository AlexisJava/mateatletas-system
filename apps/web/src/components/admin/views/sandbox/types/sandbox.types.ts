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
// NODO STRUCTURE (Hierarchical Content)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * NodoContenido - Estructura jerárquica recursiva para contenido educativo
 *
 * Reglas del árbol:
 * - Nodos raíz: Teoría, Práctica, Evaluación (bloqueado=true, no eliminables)
 * - Si hijos.length > 0: Es contenedor (no editable directamente)
 * - Si hijos.length === 0: Es hoja (editable, tiene contenidoJson)
 * - Profundidad infinita permitida
 */
export interface NodoContenido {
  id: string;
  titulo: string;
  bloqueado: boolean;
  parentId: string | null;
  orden: number;
  /** JSON string que Monaco edita - NULL si es contenedor con hijos */
  contenidoJson: string | null;
  /** Nodos hijos (estructura recursiva) */
  hijos: NodoContenido[];
}

/**
 * @deprecated Use NodoContenido instead - slides replaced by hierarchical nodos
 */
export interface Slide {
  id: string;
  title: string;
  /** JSON string que Monaco edita - se parsea a ContentBlock para renderizar */
  content: string;
}

export type EstadoContenido = 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';

export interface Lesson {
  id: string;
  title: string;
  house: House;
  subject: Subject;
  estado: EstadoContenido;
  /**
   * Árbol jerárquico de nodos - Siempre 3 raíces: Teoría, Práctica, Evaluación
   * Cada raíz puede tener hijos anidados infinitamente
   */
  nodos: NodoContenido[];
  /**
   * @deprecated Use nodos instead
   */
  slides?: Slide[];
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
// SAVE STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estado del auto-guardado
 * - draft: Sin cambios pendientes
 * - saving: Guardando en el servidor
 * - saved: Guardado exitosamente
 * - error: Error al guardar
 */
export type SaveStatus = 'draft' | 'saving' | 'saved' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

export type BackgroundPattern = 'dots' | 'cyber-grid' | 'stars' | 'aurora' | 'matrix';

export interface BackgroundPreset {
  id: BackgroundPattern | string;
  name: string;
  css: string;
}
