/**
 * Tipos para el sistema de Actividades
 * Cada semana tiene 4 actividades temáticas
 */

export type TipoActividad = 'video' | 'ejercicio' | 'juego' | 'evaluacion';
export type EstadoActividad = 'bloqueada' | 'disponible' | 'en-progreso' | 'completada';
export type DificultadActividad = 'facil' | 'medio' | 'dificil';

/**
 * Tipo de ejercicio matemático
 */
export type TipoEjercicio =
  | 'multiple-choice'
  | 'fill-blank'
  | 'drag-drop'
  | 'verdadero-falso'
  | 'ordenar';

/**
 * Pregunta de tipo Multiple Choice
 */
export interface PreguntaMultipleChoice {
  tipo: 'multiple-choice';
  enunciado: string;
  opciones: {
    id: string;
    texto: string;
    esCorrecta: boolean;
  }[];
  explicacion: string;
  puntaje: number;
}

/**
 * Pregunta de tipo Fill in the Blank
 */
export interface PreguntaFillBlank {
  tipo: 'fill-blank';
  enunciado: string;
  respuestaCorrecta: string | string[]; // Puede aceptar múltiples respuestas válidas
  placeholder?: string;
  explicacion: string;
  puntaje: number;
  caseSensitive?: boolean;
}

/**
 * Pregunta de tipo Verdadero/Falso
 */
export interface PreguntaVerdaderoFalso {
  tipo: 'verdadero-falso';
  enunciado: string;
  respuestaCorrecta: boolean;
  explicacion: string;
  puntaje: number;
}

/**
 * Union type de todos los tipos de preguntas
 */
export type Pregunta = PreguntaMultipleChoice | PreguntaFillBlank | PreguntaVerdaderoFalso;

/**
 * Contenido de tipo Video
 */
export interface ContenidoVideo {
  tipo: 'video';
  url: string;
  duracion: number; // segundos
  thumbnail?: string;
  subtitulos?: boolean;
}

/**
 * Contenido de tipo Ejercicio
 */
export interface ContenidoEjercicio {
  tipo: 'ejercicio';
  preguntas: Pregunta[];
  tiempoLimite?: number; // segundos, opcional
  intentosMaximos?: number;
  porcentajeAprobacion: number; // 0-100
}

/**
 * Contenido de tipo Juego
 */
export interface ContenidoJuego {
  tipo: 'juego';
  juegoId: string;
  instrucciones: string;
  objetivo: string;
  config: Record<string, unknown>;
}

/**
 * Contenido de tipo Evaluación
 */
export interface ContenidoEvaluacion {
  tipo: 'evaluacion';
  preguntas: Pregunta[];
  tiempoLimite: number; // segundos
  intentosMaximos: 1; // Las evaluaciones solo tienen 1 intento
  porcentajeAprobacion: number; // 0-100
}

/**
 * Union type de todos los tipos de contenido
 */
export type ContenidoActividad =
  | ContenidoVideo
  | ContenidoEjercicio
  | ContenidoJuego
  | ContenidoEvaluacion;

/**
 * Resultado de una actividad completada
 */
export interface ResultadoActividad {
  actividadId: string;
  completada: boolean;
  puntajeObtenido: number;
  puntajeMaximo: number;
  porcentaje: number;
  estrellas: 0 | 1 | 2 | 3;
  tiempoEmpleado: number; // segundos
  intentos: number;
  fechaCompletado?: Date;
}

/**
 * Actividad individual
 */
export interface Actividad {
  id: string;
  semanaId: string;
  numero: number; // 1-4 (posición en la semana)
  titulo: string;
  descripcion: string;
  emoji: string;
  tipo: TipoActividad;
  dificultad: DificultadActividad;
  duracionEstimada: number; // minutos
  puntosMaximos: number;
  xpRecompensa: number;
  monedasRecompensa: number;
  estado: EstadoActividad;
  progreso: number; // 0-100
  estrellas: 0 | 1 | 2 | 3;
  contenido: ContenidoActividad;
  resultado?: ResultadoActividad;
  requisitos?: {
    actividadPreviaId?: string;
    nivelMinimo?: number;
  };
}

/**
 * Props para el componente ActividadView
 */
export interface ActividadViewProps {
  config?: {
    type: 'actividad';
    actividadId: string;
    semanaId: string;
  };
  estudiante?: {
    nombre: string;
    id?: string;
    nivel_actual?: number;
  };
}

/**
 * Configuración de colores por dificultad
 */
export const DIFICULTAD_COLORS: Record<DificultadActividad, { gradient: string; border: string; emoji: string }> = {
  facil: {
    gradient: 'from-green-500 to-emerald-600',
    border: '#10b981',
    emoji: '⭐',
  },
  medio: {
    gradient: 'from-yellow-500 to-orange-500',
    border: '#f59e0b',
    emoji: '⭐⭐',
  },
  dificil: {
    gradient: 'from-red-500 to-pink-600',
    border: '#ef4444',
    emoji: '⭐⭐⭐',
  },
};

/**
 * Configuración de colores por tipo de actividad
 */
export const TIPO_ACTIVIDAD_COLORS: Record<TipoActividad, { gradient: string; border: string; emoji: string }> = {
  video: {
    gradient: 'from-blue-500 to-indigo-600',
    border: '#3b82f6',
    emoji: '🎥',
  },
  ejercicio: {
    gradient: 'from-purple-500 to-violet-600',
    border: '#8b5cf6',
    emoji: '✏️',
  },
  juego: {
    gradient: 'from-pink-500 to-rose-600',
    border: '#ec4899',
    emoji: '🎮',
  },
  evaluacion: {
    gradient: 'from-orange-500 to-red-600',
    border: '#f97316',
    emoji: '📝',
  },
};
