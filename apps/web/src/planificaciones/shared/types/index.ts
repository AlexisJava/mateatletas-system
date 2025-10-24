/**
 * Tipos compartidos para el sistema de planificaciones
 */

export interface PlanificacionMetadata {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  nivel: number;
  edades: string;
  mes: number;
  anio: number;
  grupos_objetivo: string[];
  tematica_principal: string;
  narrativa: string;
  duracion_semanas: number;
  duracion_minutos_por_sesion: number;
  objetivos_aprendizaje: string[];
  semanas: SemanaMetadata[];
  recursos_necesarios: string[];
  notas_docentes: string;
  creado_por: string;
  fecha_creacion: string;
  version: string;
}

export interface SemanaMetadata {
  numero: number;
  titulo: string;
  objetivo: string;
  duracion_minutos: number;
}

export interface ProgresoEstudiante {
  estudiante_id: string;
  planificacion_id: string;
  actividad_id?: string;
  iniciado: boolean;
  completado: boolean;
  fecha_inicio?: Date;
  fecha_completado?: Date;
  puntos_obtenidos: number;
  tiempo_total_minutos: number;
  intentos: number;
  mejor_puntaje: number;
  estado_juego?: Record<string, any>;
  respuestas_detalle?: Record<string, any>;
}

export interface PlanificacionState {
  puntos: number;
  nivel_actual: number;
  semana_actual: number;
  actividades_completadas: string[];
  tiempo_total: number;
  ultimo_guardado: Date;
  datos_personalizados?: Record<string, any>;
}

export interface GameScoreProps {
  puntos: number;
  className?: string;
}

export interface ActivityTimerProps {
  tiempoRestante: number;
  tiempoTotal?: number;
  className?: string;
  onTimeout?: () => void;
}

export interface ProgressTrackerProps {
  progreso: number; // 0-100
  label?: string;
  className?: string;
}

export interface WeekNavigationProps {
  semanaActual: number;
  totalSemanas: number;
  onCambiarSemana: (semana: number) => void;
  semanasDesbloqueadas?: number[];
}

export interface AchievementData {
  titulo: string;
  descripcion: string;
  icono?: string;
  puntos?: number;
}

export interface AchievementPopupProps {
  achievement: AchievementData;
  visible: boolean;
  onClose: () => void;
}
