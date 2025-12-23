/**
 * Studio Bento Grid - Type Definitions
 *
 * Sistema de editor visual basado en CSS Grid de 12 columnas
 * inspirado en bento-generator
 */

/**
 * Posición de un bloque en la grilla Bento
 * Usa sistema CSS Grid con columnas 1-12
 */
export interface BentoPosition {
  /** Columna de inicio (1-12) */
  colStart: number;
  /** Cantidad de columnas que ocupa (1-12) */
  colSpan: number;
  /** Fila de inicio (1-based) */
  rowStart: number;
  /** Cantidad de filas que ocupa */
  rowSpan: number;
}

/**
 * Bloque en la hoja del editor
 * Representa un componente educativo posicionado en la grilla
 */
export interface BloqueHoja {
  /** UUID único del bloque */
  id: string;
  /** Tipo de componente (Quiz, DragAndDrop, etc.) */
  componentType: string;
  /** Posición en la grilla Bento */
  position: BentoPosition;
  /** Props específicas del componente */
  props: Record<string, unknown>;
}

/**
 * Estado del store de la hoja
 */
export interface HojaState {
  /** Lista de bloques en la hoja */
  bloques: BloqueHoja[];
  /** ID del bloque seleccionado (null si ninguno) */
  selectedId: string | null;
  /** ID del tema visual activo */
  themeId: string;
}

/**
 * Acciones del store de la hoja
 */
export interface HojaActions {
  /** Agregar un nuevo bloque */
  addBloque: (type: string, position: BentoPosition) => string;
  /** Eliminar un bloque por ID */
  removeBloque: (id: string) => void;
  /** Actualizar posición de un bloque */
  updateBloquePosition: (id: string, position: Partial<BentoPosition>) => void;
  /** Actualizar props de un bloque */
  updateBloqueProps: (id: string, props: Record<string, unknown>) => void;
  /** Seleccionar un bloque */
  selectBloque: (id: string) => void;
  /** Deseleccionar bloque actual */
  deselectBloque: () => void;
  /** Cambiar tema */
  setTheme: (themeId: string) => void;
  /** Limpiar toda la hoja */
  clear: () => void;
}

/**
 * Store completo de la hoja
 */
export type HojaStore = HojaState & HojaActions;

/**
 * Configuración de la grilla Bento
 */
export const BENTO_CONFIG = {
  /** Número de columnas en la grilla */
  COLUMNS: 12,
  /** Altura de cada fila en píxeles */
  ROW_HEIGHT: 80,
  /** Gap entre celdas en píxeles */
  GAP: 16,
  /** Tamaño mínimo de un bloque en columnas */
  MIN_COL_SPAN: 2,
  /** Tamaño mínimo de un bloque en filas */
  MIN_ROW_SPAN: 2,
} as const;

/**
 * Tamaños predefinidos para bloques (inspirado en bento-generator)
 */
export const BLOCK_SIZES = {
  /** 2x2 - Pequeño cuadrado */
  small: { colSpan: 2, rowSpan: 2 },
  /** 4x2 - Ancho */
  wide: { colSpan: 4, rowSpan: 2 },
  /** 2x4 - Alto */
  tall: { colSpan: 2, rowSpan: 4 },
  /** 4x4 - Grande cuadrado */
  large: { colSpan: 4, rowSpan: 4 },
  /** 6x3 - Extra ancho */
  extraWide: { colSpan: 6, rowSpan: 3 },
} as const;

export type BlockSizeKey = keyof typeof BLOCK_SIZES;
