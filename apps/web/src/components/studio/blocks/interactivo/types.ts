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
// MATCHING PAIRS
// ═══════════════════════════════════════════════════════════════════════════════

/** Par de elementos a conectar */
export interface MatchingPair {
  /** ID único del par */
  id: string;
  /** Contenido del lado izquierdo */
  izquierda: string;
  /** Contenido del lado derecho */
  derecha: string;
}

/** Feedback para MatchingPairs */
export interface MatchingPairsFeedback {
  /** Mensaje cuando todas las conexiones son correctas */
  correcto: string;
  /** Mensaje cuando hay conexiones incorrectas */
  incorrecto: string;
}

/** Configuración del componente MatchingPairs */
export interface MatchingPairsConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Pares a conectar */
  pares: MatchingPair[];
  /** Mensajes de feedback */
  feedback: MatchingPairsFeedback;
  /** Número máximo de intentos (opcional) */
  intentosMaximos?: number;
  /** Mostrar respuestas correctas después de N intentos (opcional) */
  mostrarRespuestasTras?: number;
}

/** Conexión realizada por el usuario */
export interface MatchingConnection {
  /** ID del item izquierdo */
  leftId: string;
  /** ID del item derecho */
  rightId: string;
}

/** Estado interno del componente MatchingPairs */
export interface MatchingPairsState {
  /** Conexiones realizadas */
  connections: MatchingConnection[];
  /** Item seleccionado actualmente (null si ninguno) */
  selectedItem: { side: 'left' | 'right'; pairId: string } | null;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
  /** Si debe mostrar respuestas correctas */
  mostrarRespuestas: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════════

/** Elemento de la secuencia a ordenar */
export interface OrderSequenceElement {
  /** ID único del elemento */
  id: string;
  /** Contenido a mostrar */
  contenido: string;
  /** Posición correcta (1-indexed) */
  ordenCorrecto: number;
}

/** Feedback para OrderSequence */
export interface OrderSequenceFeedback {
  /** Mensaje cuando el orden es correcto */
  correcto: string;
  /** Mensaje cuando el orden es incorrecto */
  incorrecto: string;
}

/** Configuración del componente OrderSequence */
export interface OrderSequenceConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Elementos a ordenar */
  elementos: OrderSequenceElement[];
  /** Mensajes de feedback */
  feedback: OrderSequenceFeedback;
  /** Número máximo de intentos (opcional) */
  intentosMaximos?: number;
  /** Mostrar respuestas correctas después de N intentos (opcional) */
  mostrarRespuestasTras?: number;
}

/** Estado interno del componente OrderSequence */
export interface OrderSequenceState {
  /** IDs de elementos en el orden actual del usuario */
  ordenActual: string[];
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
  /** Si debe mostrar respuestas correctas */
  mostrarRespuestas: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDER
// ═══════════════════════════════════════════════════════════════════════════════

/** Marcador en el slider */
export interface SliderMarker {
  /** Valor donde mostrar el marcador */
  valor: number;
  /** Etiqueta del marcador */
  etiqueta: string;
}

/** Feedback para Slider */
export interface SliderFeedback {
  /** Mensaje cuando el valor es correcto */
  correcto: string;
  /** Mensaje cuando el valor es incorrecto */
  incorrecto: string;
}

/** Configuración del componente Slider */
export interface SliderConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Valor mínimo */
  min: number;
  /** Valor máximo */
  max: number;
  /** Incremento del paso */
  paso: number;
  /** Valor inicial del slider */
  valorInicial: number;
  /** Valor correcto (opcional, si no se especifica es modo exploración libre) */
  valorCorrecto?: number;
  /** Tolerancia para aceptar respuesta como correcta (default: 0) */
  tolerancia?: number;
  /** Unidad a mostrar (ej: "°C", "kg", "%") */
  unidad?: string;
  /** Marcadores opcionales en el slider */
  marcadores?: SliderMarker[];
  /** Mensajes de feedback (solo si hay valorCorrecto) */
  feedback?: SliderFeedback;
  /** Número máximo de intentos (opcional) */
  intentosMaximos?: number;
  /** Mostrar respuesta correcta después de N intentos (opcional) */
  mostrarRespuestaTras?: number;
}

/** Estado interno del componente Slider */
export interface SliderState {
  /** Valor actual del slider */
  valorActual: number;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
  /** Si debe mostrar la respuesta correcta */
  mostrarRespuesta: boolean;
}
