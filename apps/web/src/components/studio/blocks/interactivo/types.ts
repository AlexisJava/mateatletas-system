/**
 * Tipos para componentes interactivos de Studio
 */

// ═══════════════════════════════════════════════════════════════════════════════
// DRAG AND DROP
// ═══════════════════════════════════════════════════════════════════════════════

/** Tipo de contenido de un elemento arrastrable */
export type DragElementType = 'texto' | 'imagen';

/** Elemento arrastrable */
export interface DragElement {
  /** ID único del elemento */
  id: string;
  /** Contenido a mostrar (texto o URL de imagen) */
  contenido: string;
  /** Tipo de contenido */
  tipo: DragElementType;
  /** ID de la zona donde debe ser soltado correctamente */
  zonaCorrecta: string;
}

/** Zona de destino para elementos */
export interface DropZone {
  /** ID único de la zona */
  id: string;
  /** Etiqueta visible de la zona */
  etiqueta: string;
  /** Si acepta múltiples elementos */
  aceptaMultiples: boolean;
}

/** Feedback para respuestas */
export interface DragDropFeedback {
  /** Mensaje cuando es correcto */
  correcto: string;
  /** Mensaje cuando es incorrecto */
  incorrecto: string;
}

/** Configuración del componente DragAndDrop */
export interface DragAndDropConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Elementos arrastrables */
  elementos: DragElement[];
  /** Zonas de destino */
  zonas: DropZone[];
  /** Mensajes de feedback */
  feedback: DragDropFeedback;
  /** Número máximo de intentos (opcional) */
  intentosMaximos?: number;
  /** Mostrar respuestas correctas después de N intentos (opcional) */
  mostrarRespuestasTras?: number;
}

/** Estado interno del componente DragAndDrop */
export interface DragAndDropState {
  /** Mapeo de elemento ID -> zona ID donde está actualmente */
  ubicaciones: Record<string, string | null>;
  /** Elemento siendo arrastrado actualmente */
  arrastrando: string | null;
  /** Si ya se verificó la respuesta */
  verificado: boolean;
  /** Número de intentos realizados */
  intentos: number;
  /** IDs de elementos en posición correcta */
  correctos: string[];
  /** Si se completó exitosamente */
  completado: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SORTING GAME (futuro)
// ═══════════════════════════════════════════════════════════════════════════════

/** Configuración del componente SortingGame */
export interface SortingGameConfig {
  instruccion: string;
  elementos: Array<{
    id: string;
    contenido: string;
    ordenCorrecto: number;
  }>;
  feedback: DragDropFeedback;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATCHING PAIRS (futuro)
// ═══════════════════════════════════════════════════════════════════════════════

/** Configuración del componente MatchingPairs */
export interface MatchingPairsConfig {
  instruccion: string;
  pares: Array<{
    id: string;
    izquierda: { contenido: string; tipo: DragElementType };
    derecha: { contenido: string; tipo: DragElementType };
  }>;
  feedback: DragDropFeedback;
}
