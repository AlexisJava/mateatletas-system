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

// ═══════════════════════════════════════════════════════════════════════════════
// TOGGLE SWITCH
// ═══════════════════════════════════════════════════════════════════════════════

/** Feedback para ToggleSwitch */
export interface ToggleSwitchFeedback {
  /** Mensaje cuando el valor es correcto */
  correcto: string;
  /** Mensaje cuando el valor es incorrecto */
  incorrecto: string;
}

/** Configuración del componente ToggleSwitch */
export interface ToggleSwitchConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Etiqueta del toggle */
  label: string;
  /** Valor inicial (true = on, false = off) */
  valorInicial: boolean;
  /** Valor correcto (opcional, si no se especifica es modo exploración) */
  valorCorrecto?: boolean;
  /** Descripción adicional del toggle */
  descripcion?: string;
  /** Etiqueta personalizada para estado OFF (default: "Off") */
  labelOff?: string;
  /** Etiqueta personalizada para estado ON (default: "On") */
  labelOn?: string;
  /** Mensajes de feedback (solo si hay valorCorrecto) */
  feedback?: ToggleSwitchFeedback;
  /** Número máximo de intentos (opcional) */
  intentosMaximos?: number;
  /** Mostrar respuesta correcta después de N intentos (opcional) */
  mostrarRespuestaTras?: number;
}

/** Estado interno del componente ToggleSwitch */
export interface ToggleSwitchState {
  /** Valor actual del toggle */
  valorActual: boolean;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
  /** Si debe mostrar la respuesta correcta */
  mostrarRespuesta: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NUMBER INPUT
// ═══════════════════════════════════════════════════════════════════════════════

/** Feedback para NumberInput */
export interface NumberInputFeedback {
  /** Mensaje cuando el valor es correcto */
  correcto: string;
  /** Mensaje cuando el valor es incorrecto */
  incorrecto: string;
}

/** Configuración del componente NumberInput */
export interface NumberInputConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Etiqueta del campo */
  label: string;
  /** Valor mínimo permitido */
  min: number;
  /** Valor máximo permitido */
  max: number;
  /** Valor correcto (opcional, si no se especifica es modo libre) */
  valorCorrecto?: number;
  /** Tolerancia para aceptar respuesta como correcta (default: 0) */
  tolerancia?: number;
  /** Número de decimales permitidos (default: 0 = enteros) */
  decimales?: number;
  /** Unidad a mostrar (ej: "g/mol", "kg", "m") */
  unidad?: string;
  /** Descripción adicional */
  descripcion?: string;
  /** Placeholder del input */
  placeholder?: string;
  /** Mensajes de feedback (solo si hay valorCorrecto) */
  feedback?: NumberInputFeedback;
  /** Número máximo de intentos (opcional) */
  intentosMaximos?: number;
  /** Mostrar respuesta correcta después de N intentos (opcional) */
  mostrarRespuestaTras?: number;
}

/** Estado interno del componente NumberInput */
export interface NumberInputState {
  /** Valor actual del input */
  valorActual: number | null;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
  /** Si debe mostrar la respuesta correcta */
  mostrarRespuesta: boolean;
  /** Mensaje de error de validación */
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT INPUT
// ═══════════════════════════════════════════════════════════════════════════════

/** Feedback para TextInput */
export interface TextInputFeedback {
  /** Mensaje cuando la respuesta es correcta */
  correcto: string;
  /** Mensaje cuando la respuesta es incorrecta */
  incorrecto: string;
}

/** Configuración del componente TextInput */
export interface TextInputConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Etiqueta del campo */
  label: string;
  /** Placeholder del input */
  placeholder?: string;
  /** Respuesta correcta (opcional, si no se especifica es modo libre) */
  respuestaCorrecta?: string;
  /** Respuestas alternativas aceptadas */
  respuestasAlternativas?: string[];
  /** Si la comparación es case-sensitive (default: false) */
  caseSensitive?: boolean;
  /** Descripción adicional */
  descripcion?: string;
  /** Longitud máxima del texto */
  maxLength?: number;
  /** Si es textarea multilínea */
  multiline?: boolean;
  /** Filas del textarea (si multiline es true) */
  rows?: number;
  /** Patrón regex para validación */
  patron?: string;
  /** Mensaje de error cuando no cumple el patrón */
  mensajePatron?: string;
  /** Mensajes de feedback (solo si hay respuestaCorrecta) */
  feedback?: TextInputFeedback;
  /** Número máximo de intentos (opcional) */
  intentosMaximos?: number;
  /** Mostrar respuesta correcta después de N intentos (opcional) */
  mostrarRespuestaTras?: number;
}

/** Estado interno del componente TextInput */
export interface TextInputState {
  /** Valor actual del input */
  valorActual: string;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
  /** Si debe mostrar la respuesta correcta */
  mostrarRespuesta: boolean;
  /** Mensaje de error de validación */
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PIE CHART
// ═══════════════════════════════════════════════════════════════════════════════

/** Dato para un segmento del gráfico circular */
export interface PieChartDato {
  /** ID único del segmento */
  id: string;
  /** Etiqueta del segmento */
  label: string;
  /** Valor numérico */
  valor: number;
  /** Color del segmento (opcional, usa paleta por defecto) */
  color?: string;
}

/** Feedback para PieChart */
export interface PieChartFeedback {
  /** Mensaje cuando la selección es correcta */
  correcto: string;
  /** Mensaje cuando la selección es incorrecta */
  incorrecto: string;
}

/** Configuración del componente PieChart */
export interface PieChartConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Título del gráfico */
  titulo?: string;
  /** Datos para el gráfico */
  datos: PieChartDato[];
  /** Mostrar porcentajes en las etiquetas */
  mostrarPorcentaje?: boolean;
  /** Mostrar leyenda */
  mostrarLeyenda?: boolean;
  /** Descripción adicional */
  descripcion?: string;
  /** Pregunta para modo interactivo (opcional) */
  pregunta?: string;
  /** ID del segmento correcto (si es interactivo) */
  segmentoCorrectoId?: string;
  /** Mensajes de feedback (solo si hay segmentoCorrectoId) */
  feedback?: PieChartFeedback;
  /** Número máximo de intentos (opcional) */
  intentosMaximos?: number;
}

/** Estado interno del componente PieChart */
export interface PieChartState {
  /** ID del segmento seleccionado */
  segmentoSeleccionado: string | null;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BAR GRAPH
// ═══════════════════════════════════════════════════════════════════════════════

/** Dato para una barra del gráfico */
export interface BarGraphDato {
  /** ID único de la barra */
  id: string;
  /** Etiqueta de la barra */
  label: string;
  /** Valor numérico */
  valor: number;
  /** Color de la barra (opcional) */
  color?: string;
}

/** Feedback para BarGraph */
export interface BarGraphFeedback {
  /** Mensaje cuando la selección es correcta */
  correcto: string;
  /** Mensaje cuando la selección es incorrecta */
  incorrecto: string;
}

/** Configuración del componente BarGraph */
export interface BarGraphConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Título del gráfico */
  titulo?: string;
  /** Datos para el gráfico */
  datos: BarGraphDato[];
  /** Etiqueta del eje X */
  ejeX?: string;
  /** Etiqueta del eje Y */
  ejeY?: string;
  /** Mostrar valores sobre las barras */
  mostrarValores?: boolean;
  /** Descripción adicional */
  descripcion?: string;
  /** Orientación de las barras */
  orientacion?: 'vertical' | 'horizontal';
  /** Pregunta para modo interactivo (opcional) */
  pregunta?: string;
  /** ID de la barra correcta (si es interactivo) */
  barraCorrectaId?: string;
  /** Mensajes de feedback (solo si hay barraCorrectaId) */
  feedback?: BarGraphFeedback;
  /** Número máximo de intentos (opcional) */
  intentosMaximos?: number;
}

/** Estado interno del componente BarGraph */
export interface BarGraphState {
  /** ID de la barra seleccionada */
  barraSeleccionada: string | null;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
}
