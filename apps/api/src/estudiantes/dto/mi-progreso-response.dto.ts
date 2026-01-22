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
  xpTotal: number;
  nivel: number;
  xpProgreso: number;
  xpNecesario: number;
  porcentajeNivel: number;
}

/**
 * Estadísticas de racha
 */
export interface RachaDto {
  rachaActual: number;
  rachaMaxima: number;
  totalDiasActivos: number;
  ultimaActividad: Date | null;
}

/**
 * Logro desbloqueado reciente
 */
export interface LogroRecienteDto {
  nombre: string;
  icono: string;
  rareza: string;
  fechaDesbloqueo: Date;
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
  xpGanado: number;
  creadoEn: Date;
}

/**
 * Respuesta completa del endpoint mi-progreso
 */
export interface MiProgresoResponseDto {
  estudiante: EstudianteInfoDto;
  gamificacion: GamificacionDto;
  racha: RachaDto;
  logros: LogrosResumenDto;
  actividadReciente: ActividadRecienteDto[];
}
