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
// ═════════════════════════════��═════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// HOTSPOT
// ═══════════════════════════════════════════════════════════════════════════════

/** Forma de una zona hotspot */
export type HotspotForma = 'circulo' | 'rectangulo';

/** Zona interactiva en la imagen */
export interface HotspotZona {
  /** ID único de la zona */
  id: string;
  /** Etiqueta de la zona */
  label: string;
  /** Descripción opcional para tooltip */
  descripcion?: string;
  /** Posición X en porcentaje (0-100) */
  x: number;
  /** Posición Y en porcentaje (0-100) */
  y: number;
  /** Ancho en porcentaje */
  ancho: number;
  /** Alto en porcentaje */
  alto: number;
  /** Forma de la zona */
  forma: HotspotForma;
}

/** Feedback para Hotspot */
export interface HotspotFeedback {
  /** Mensaje cuando la selección es correcta */
  correcto: string;
  /** Mensaje cuando la selección es incorrecta */
  incorrecto: string;
}

/** Configuración del componente Hotspot */
export interface HotspotConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** URL de la imagen */
  imagenUrl: string;
  /** Texto alternativo de la imagen */
  imagenAlt: string;
  /** Zonas interactivas */
  zonas: HotspotZona[];
  /** Descripción adicional */
  descripcion?: string;
  /** Pregunta para modo interactivo */
  pregunta?: string;
  /** IDs de las zonas correctas (si es interactivo) */
  zonasCorrectasIds?: string[];
  /** Si permite selección múltiple */
  seleccionMultiple?: boolean;
  /** Mensajes de feedback */
  feedback?: HotspotFeedback;
  /** Número máximo de intentos */
  intentosMaximos?: number;
}

/** Estado interno del componente Hotspot */
export interface HotspotState {
  /** IDs de zonas seleccionadas */
  zonasSeleccionadas: string[];
  /** Zona con hover */
  zonaHover: string | null;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Evento en la línea temporal */
export interface TimelineEvento {
  /** ID único del evento */
  id: string;
  /** Título del evento */
  titulo: string;
  /** Año del evento */
  año: number;
  /** Descripción opcional */
  descripcion?: string;
  /** Icono o imagen opcional */
  icono?: string;
}

/** Feedback para Timeline */
export interface TimelineFeedback {
  /** Mensaje cuando el orden es correcto */
  correcto: string;
  /** Mensaje cuando el orden es incorrecto */
  incorrecto: string;
}

/** Configuración del componente Timeline */
export interface TimelineConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Título de la línea temporal */
  titulo?: string;
  /** Eventos a mostrar */
  eventos: TimelineEvento[];
  /** Descripción adicional */
  descripcion?: string;
  /** Orientación de la línea */
  orientacion?: 'horizontal' | 'vertical';
  /** Si está en modo ordenar (interactivo) */
  modoOrdenar?: boolean;
  /** Mensajes de feedback (solo si modoOrdenar es true) */
  feedback?: TimelineFeedback;
  /** Número máximo de intentos */
  intentosMaximos?: number;
}

/** Estado interno del componente Timeline */
export interface TimelineState {
  /** IDs de eventos en el orden actual */
  ordenActual: string[];
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SORTING BINS
// ═══════════════════════════════════════════════════════════════════════════════

/** Tipo de contenido para SortingBins */
export type SortingElementType = 'texto' | 'imagen';

/** Elemento a clasificar */
export interface SortingElement {
  /** ID único del elemento */
  id: string;
  /** Contenido a mostrar (texto o URL de imagen) */
  contenido: string;
  /** Tipo de contenido */
  tipo: SortingElementType;
  /** ID de la categoría correcta */
  categoriaCorrecta: string;
}

/** Categoría (bin) para clasificar elementos */
export interface SortingCategory {
  /** ID único de la categoría */
  id: string;
  /** Etiqueta visible */
  etiqueta: string;
  /** Color del bin */
  color?: string;
  /** Descripción opcional */
  descripcion?: string;
}

/** Feedback para SortingBins */
export interface SortingBinsFeedback {
  /** Mensaje cuando es correcto */
  correcto: string;
  /** Mensaje cuando es incorrecto */
  incorrecto: string;
}

/** Configuración del componente SortingBins */
export interface SortingBinsConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Elementos a clasificar */
  elementos: SortingElement[];
  /** Categorías disponibles */
  categorias: SortingCategory[];
  /** Descripción adicional */
  descripcion?: string;
  /** Mensajes de feedback */
  feedback: SortingBinsFeedback;
  /** Número máximo de intentos */
  intentosMaximos?: number;
  /** Mostrar respuestas correctas después de N intentos */
  mostrarRespuestasTras?: number;
}

/** Estado interno del componente SortingBins */
export interface SortingBinsState {
  /** Mapeo de elemento ID -> categoría ID donde está */
  ubicaciones: Record<string, string | null>;
  /** Elemento siendo arrastrado */
  arrastrando: string | null;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCALE BALANCE
// ═══════════════════════════════════════════════════════════════════════════════

/** Item de peso para la balanza */
export interface ScaleItem {
  /** ID único del item */
  id: string;
  /** Etiqueta visible (ej: "5kg", "2lb") */
  etiqueta: string;
  /** Peso numérico */
  peso: number;
  /** Color opcional del item */
  color?: string;
}

/** Configuración de un lado de la balanza */
export interface ScaleSide {
  /** Items en este lado */
  items: ScaleItem[];
}

/** Feedback para ScaleBalance */
export interface ScaleBalanceFeedback {
  /** Mensaje cuando está equilibrada */
  correcto: string;
  /** Mensaje cuando no está equilibrada */
  incorrecto: string;
}

/** Configuración del componente ScaleBalance */
export interface ScaleBalanceConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Items iniciales en el lado izquierdo */
  ladoIzquierdo: ScaleSide;
  /** Items iniciales en el lado derecho */
  ladoDerecho: ScaleSide;
  /** Items disponibles para arrastrar */
  itemsDisponibles: ScaleItem[];
  /** Descripción adicional */
  descripcion?: string;
  /** Mostrar el peso total de cada lado */
  mostrarPesos?: boolean;
  /** Mensajes de feedback */
  feedback: ScaleBalanceFeedback;
  /** Número máximo de intentos */
  intentosMaximos?: number;
}

/** Estado interno del componente ScaleBalance */
export interface ScaleBalanceState {
  /** Items en el lado izquierdo (iniciales + agregados) */
  itemsIzquierdo: ScaleItem[];
  /** Items en el lado derecho (iniciales + agregados) */
  itemsDerecho: ScaleItem[];
  /** Items disponibles restantes */
  itemsDisponibles: ScaleItem[];
  /** Item siendo arrastrado */
  arrastrando: string | null;
  /** Si ya se verificó */
  verificado: boolean;
  /** Número de intentos */
  intentos: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════════════════════════════════════

/** Tipo de pregunta en el quiz */
export type QuizQuestionType = 'opcionMultiple' | 'verdaderoFalso' | 'respuestaCorta';

/** Pregunta de opción múltiple */
export interface QuizQuestionMultiple {
  /** ID único de la pregunta */
  id: string;
  /** Tipo de pregunta */
  tipo: 'opcionMultiple';
  /** Texto de la pregunta */
  pregunta: string;
  /** Opciones de respuesta */
  opciones: string[];
  /** Respuesta correcta */
  respuestaCorrecta: string;
  /** Explicación (mostrada después de responder) */
  explicacion?: string;
}

/** Pregunta verdadero/falso */
export interface QuizQuestionTrueFalse {
  /** ID único de la pregunta */
  id: string;
  /** Tipo de pregunta */
  tipo: 'verdaderoFalso';
  /** Texto de la pregunta */
  pregunta: string;
  /** Respuesta correcta */
  respuestaCorrecta: boolean;
  /** Explicación (mostrada después de responder) */
  explicacion?: string;
}

/** Pregunta de respuesta corta */
export interface QuizQuestionShort {
  /** ID único de la pregunta */
  id: string;
  /** Tipo de pregunta */
  tipo: 'respuestaCorta';
  /** Texto de la pregunta */
  pregunta: string;
  /** Respuesta correcta */
  respuestaCorrecta: string;
  /** Respuestas alternativas aceptadas */
  alternativas?: string[];
  /** Case sensitive */
  caseSensitive?: boolean;
  /** Explicación (mostrada después de responder) */
  explicacion?: string;
}

/** Union de tipos de pregunta */
export type QuizQuestion = QuizQuestionMultiple | QuizQuestionTrueFalse | QuizQuestionShort;

/** Feedback para Quiz */
export interface QuizFeedback {
  /** Mensaje cuando el puntaje es alto (>80%) */
  correcto: string;
  /** Mensaje cuando el puntaje es bajo */
  incorrecto: string;
}

/** Configuración del componente Quiz */
export interface QuizConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Título del quiz */
  titulo?: string;
  /** Preguntas del quiz */
  preguntas: QuizQuestion[];
  /** Descripción adicional */
  descripcion?: string;
  /** Tiempo límite en segundos */
  tiempoLimite?: number;
  /** Permitir reintentar */
  permitirReintentar?: boolean;
  /** Mostrar explicación después de cada pregunta */
  mostrarExplicacion?: boolean;
  /** Orden aleatorio de preguntas */
  ordenAleatorio?: boolean;
  /** Mensajes de feedback */
  feedback: QuizFeedback;
}

/** Respuesta del usuario a una pregunta */
export interface QuizAnswer {
  /** ID de la pregunta */
  questionId: string;
  /** Respuesta dada */
  respuesta: string | boolean;
  /** Si es correcta */
  esCorrecta: boolean;
}

/** Estado interno del componente Quiz */
export interface QuizState {
  /** Índice de la pregunta actual */
  preguntaActual: number;
  /** Respuestas dadas */
  respuestas: QuizAnswer[];
  /** Tiempo restante en segundos */
  tiempoRestante: number | null;
  /** Si el quiz está completado */
  completado: boolean;
  /** Puntaje final (0-100) */
  puntaje: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS TRACKER
// ═══════════════════════════════════════════════════════════════════════════════

/** Paso individual del progreso */
export interface ProgressStep {
  /** ID único del paso */
  id: string;
  /** Título del paso */
  titulo: string;
  /** Descripción opcional del paso */
  descripcion?: string;
  /** Si el paso está completado */
  completado: boolean;
}

/** Configuración del componente ProgressTracker */
export interface ProgressTrackerConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Título opcional */
  titulo?: string;
  /** Descripción general opcional */
  descripcion?: string;
  /** Lista de pasos */
  pasos: ProgressStep[];
  /** ID del paso actual (para resaltar) */
  pasoActual?: string;
  /** Orientación del tracker */
  orientacion?: 'horizontal' | 'vertical';
  /** Modo compacto (solo barra de progreso) */
  modoCompacto?: boolean;
}

/** Estado interno del componente ProgressTracker */
export interface ProgressTrackerState {
  /** Porcentaje de progreso (0-100) */
  porcentaje: number;
  /** Número de pasos completados */
  completados: number;
  /** Número total de pasos */
  total: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE GALLERY
// ═══════════════════════════════════════════════════════════════════════════════

/** Imagen individual de la galería */
export interface GalleryImage {
  /** ID único de la imagen */
  id: string;
  /** URL de la imagen */
  url: string;
  /** Texto alternativo */
  alt: string;
  /** Título de la imagen */
  titulo?: string;
  /** Descripción de la imagen */
  descripcion?: string;
  /** URL de thumbnail (si es diferente) */
  thumbnailUrl?: string;
}

/** Disposición de la galería */
export type GalleryLayout = 'grid' | 'carousel';

/** Configuración del componente ImageGallery */
export interface ImageGalleryConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Título de la galería */
  titulo?: string;
  /** Descripción general */
  descripcion?: string;
  /** Imágenes de la galería */
  imagenes: GalleryImage[];
  /** Disposición de las miniaturas */
  disposicion?: GalleryLayout;
  /** Habilitar autoplay */
  autoplay?: boolean;
  /** Intervalo de autoplay en ms */
  intervaloAutoplay?: number;
}

/** Estado interno del componente ImageGallery */
export interface ImageGalleryState {
  /** Índice de la imagen actual */
  imagenActual: number;
  /** Si el modal de zoom está abierto */
  zoomAbierto: boolean;
  /** Si el autoplay está activo */
  autoplayActivo: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO PLAYER
// ═══════════════════════════════════════════════════════════════════════════════

/** Línea de transcripción sincronizada con el audio */
export interface TranscriptionLine {
  /** Tiempo en segundos donde comienza este texto */
  tiempo: number;
  /** Texto de la transcripción */
  texto: string;
}

/** Configuración del componente AudioPlayer */
export interface AudioPlayerConfig {
  /** Instrucción para el estudiante */
  instruccion: string;
  /** Título del audio */
  titulo?: string;
  /** Descripción adicional */
  descripcion?: string;
  /** URL del archivo de audio */
  audioUrl: string;
  /** Transcripción sincronizada (opcional) */
  transcripcion?: TranscriptionLine[];
  /** Mostrar control de velocidad */
  mostrarVelocidad?: boolean;
  /** Permitir loop */
  permitirLoop?: boolean;
  /** Velocidades disponibles */
  velocidades?: number[];
}

/** Estado interno del componente AudioPlayer */
export interface AudioPlayerState {
  /** Si está reproduciendo */
  reproduciendo: boolean;
  /** Tiempo actual en segundos */
  tiempoActual: number;
  /** Duración total en segundos */
  duracion: number;
  /** Volumen (0-1) */
  volumen: number;
  /** Si está en mute */
  muted: boolean;
  /** Velocidad de reproducción */
  velocidad: number;
  /** Si el loop está activo */
  loop: boolean;
}
