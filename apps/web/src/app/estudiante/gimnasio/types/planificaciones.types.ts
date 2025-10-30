/**
 * Tipos para el sistema de planificaciones mensuales 2025
 */

/**
 * Estados posibles de una planificación mensual
 */
export type EstadoPlanificacion = 'disponible' | 'en-progreso' | 'completada' | 'bloqueada';

/**
 * Planificación mensual con progreso y metadata
 */
export interface PlanificacionMensual {
  /** Código único identificador (ej: '2025-11-mes-ciencia') */
  codigo: string;

  /** Nombre del mes */
  mes: string;

  /** Emoji representativo del mes */
  emoji: string;

  /** Título descriptivo de la planificación */
  titulo: string;

  /** Descripción breve */
  descripcion: string;

  /** Progreso en porcentaje (0-100) */
  progreso: number;

  /** Estado actual */
  estado: EstadoPlanificacion;

  /** Total de semanas en la planificación */
  totalSemanas: number;

  /** Cantidad de semanas completadas */
  semanasCompletadas: number;
}

/**
 * Configuración visual según estado
 */
export interface EstadoConfig {
  border: string;
  bg: string;
  badge: string;
  badgeBg: string;
}

/**
 * Props para componente PlanificacionCardMensual
 */
export interface PlanificacionCardMensualProps {
  planificacion: PlanificacionMensual;
}
