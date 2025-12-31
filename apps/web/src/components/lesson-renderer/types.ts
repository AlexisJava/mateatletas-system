/**
 * Lesson Renderer Types
 *
 * Tipos compartidos para el renderizado de contenido educativo.
 * Usado tanto por el Admin (Studio) como por el Portal Estudiante.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT STRUCTURE (JSON Schema)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ContentBlock - Estructura recursiva para contenido educativo
 *
 * Cada bloque tiene un tipo (componente), props opcionales,
 * y children que pueden ser más bloques o texto.
 *
 * Ejemplo:
 * ```json
 * {
 *   "type": "Stage",
 *   "props": { "pattern": "cyber-grid" },
 *   "children": [
 *     {
 *       "type": "ContentZone",
 *       "children": [
 *         { "type": "LessonHeader", "props": { "title": "Suma", "icon": "➕" } }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export interface ContentBlock {
  type: string;
  props?: Record<string, unknown>;
  children?: ContentBlock[] | string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOUSE CONFIGURATION (for theming)
// ─────────────────────────────────────────────────────────────────────────────

export interface HouseColors {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Colores predefinidos por casa
 */
export const HOUSE_COLORS: Record<string, HouseColors> = {
  QUANTUM: {
    primary: '#F472B6', // pink-400
    secondary: '#EC4899', // pink-500
    accent: '#FBCFE8', // pink-200
  },
  VERTEX: {
    primary: '#60A5FA', // blue-400
    secondary: '#3B82F6', // blue-500
    accent: '#BFDBFE', // blue-200
  },
  PULSAR: {
    primary: '#34D399', // emerald-400
    secondary: '#10B981', // emerald-500
    accent: '#A7F3D0', // emerald-200
  },
};

/**
 * Colores por defecto si no se especifica casa
 */
export const DEFAULT_HOUSE_COLORS: HouseColors = {
  primary: '#A855F7', // violet-500
  secondary: '#8B5CF6', // violet-500
  accent: '#C4B5FD', // violet-300
};
