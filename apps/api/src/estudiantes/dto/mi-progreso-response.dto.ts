/**
 * DTO para la respuesta del endpoint GET /estudiantes/mi-progreso
 * Consolida datos de múltiples servicios de gamificación
 */

/**
 * Datos básicos del estudiante
 */
export interface EstudianteInfoDto {
  id: string;
  nombre: string;
  apellido: string;
  avatarUrl: string | null;
  casa: string | null;
}

/**
 * Estadísticas de XP y nivel
 */
export interface GamificacionDto {
  xp_total: number;
  nivel: number;
  xp_progreso: number;
  xp_necesario: number;
  porcentaje_nivel: number;
}

/**
 * Estadísticas de racha
 */
export interface RachaDto {
  racha_actual: number;
  racha_maxima: number;
  total_dias_activos: number;
  ultima_actividad: Date | null;
}

/**
 * Logro desbloqueado reciente
 */
export interface LogroRecienteDto {
  nombre: string;
  icono: string;
  rareza: string;
  fecha_desbloqueo: Date;
}

/**
 * Resumen de logros del estudiante
 */
export interface LogrosResumenDto {
  desbloqueados: number;
  totales: number;
  recientes: LogroRecienteDto[];
}

/**
 * Actividad reciente del feed
 */
export interface ActividadRecienteDto {
  tipo: string;
  mensaje: string;
  xp_ganado: number;
  creado_en: Date;
}

/**
 * Respuesta completa del endpoint mi-progreso
 */
export interface MiProgresoResponseDto {
  estudiante: EstudianteInfoDto;
  gamificacion: GamificacionDto;
  racha: RachaDto;
  logros: LogrosResumenDto;
  actividad_reciente: ActividadRecienteDto[];
}
