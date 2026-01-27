/**
 * Tipos de Notificación - Alineados con enum TipoNotificacion del backend
 *
 * FUENTE DE VERDAD: apps/api/prisma/schema.prisma (enum TipoNotificacion)
 * Última sincronización: Enero 2026
 */

// ============================================================================
// NOTIFICACIONES PARA TUTORES (22 tipos)
// ============================================================================

export const TIPOS_NOTIFICACION_TUTOR = [
  'TUTOR_PAGO_EXITOSO',
  'TUTOR_PAGO_FALLIDO',
  'TUTOR_SUSCRIPCION_PROXIMA_VENCER',
  'TUTOR_SUSCRIPCION_RENOVADA',
  'TUTOR_SUSCRIPCION_CANCELADA',
  'TUTOR_SUSCRIPCION_PAUSADA',
  'TUTOR_SUSCRIPCION_REACTIVADA',
  'TUTOR_BECA_ASIGNADA',
  'TUTOR_CAMBIO_TIER',
  'TUTOR_HIJO_INSCRITO',
  'TUTOR_CLASE_PROXIMA_HIJO',
  'TUTOR_CLASE_CANCELADA_HIJO',
  'TUTOR_LOGRO_HIJO',
  'TUTOR_REPORTE_PROGRESO_HIJO',
  'TUTOR_ALERTA_ASISTENCIA_HIJO',
  'TUTOR_MENSAJE_DOCENTE',
  'TUTOR_NUEVO_MATERIAL',
  'TUTOR_TAREA_ASIGNADA_HIJO',
  'TUTOR_PERIODO_INSCRIPCION_ABIERTO',
  'TUTOR_RECORDATORIO',
  'TUTOR_ANUNCIO_IMPORTANTE',
  'TUTOR_ANUNCIO_URGENTE',
] as const;

export type TipoNotificacionTutor = (typeof TIPOS_NOTIFICACION_TUTOR)[number];

// ============================================================================
// NOTIFICACIONES PARA ESTUDIANTES (18 tipos)
// ============================================================================

export const TIPOS_NOTIFICACION_ESTUDIANTE = [
  'ESTUDIANTE_LOGRO_DESBLOQUEADO',
  'ESTUDIANTE_NIVEL_SUBIDO',
  'ESTUDIANTE_NUEVO_CONTENIDO',
  'ESTUDIANTE_CLASE_PROXIMA',
  'ESTUDIANTE_CLASE_CANCELADA',
  'ESTUDIANTE_TAREA_ASIGNADA',
  'ESTUDIANTE_TAREA_PROXIMA_VENCER',
  'ESTUDIANTE_FEEDBACK_DOCENTE',
  'ESTUDIANTE_RECOMPENSA_DIARIA',
  'ESTUDIANTE_RACHA_EN_RIESGO',
  'ESTUDIANTE_RACHA_PERDIDA',
  'ESTUDIANTE_DESAFIO_DISPONIBLE',
  'ESTUDIANTE_RANKING_ACTUALIZADO',
  'ESTUDIANTE_EVENTO_ESPECIAL',
  'ESTUDIANTE_BIENVENIDA',
  'ESTUDIANTE_RECORDATORIO',
  'ESTUDIANTE_ANUNCIO_IMPORTANTE',
  'ESTUDIANTE_ANUNCIO_URGENTE',
] as const;

export type TipoNotificacionEstudiante = (typeof TIPOS_NOTIFICACION_ESTUDIANTE)[number];

// ============================================================================
// NOTIFICACIONES PARA DOCENTES (19 tipos)
// ============================================================================

export const TIPOS_NOTIFICACION_DOCENTE = [
  'DOCENTE_CLASE_PROXIMA',
  'DOCENTE_ASISTENCIA_PENDIENTE',
  'DOCENTE_ESTUDIANTE_ALERTA',
  'DOCENTE_CLASE_CANCELADA',
  'DOCENTE_LOGRO_ESTUDIANTE',
  'DOCENTE_NUEVO_ESTUDIANTE',
  'DOCENTE_ESTUDIANTE_BAJA',
  'DOCENTE_MENSAJE_TUTOR',
  'DOCENTE_TAREAS_PENDIENTES',
  'DOCENTE_EVALUACION_PENDIENTE',
  'DOCENTE_MATERIAL_ASIGNADO',
  'DOCENTE_CLASE_REPROGRAMADA',
  'DOCENTE_REPORTE_MENSUAL',
  'DOCENTE_RECORDATORIO_PLANIFICACION',
  'DOCENTE_FEEDBACK_ADMIN',
  'DOCENTE_RECORDATORIO',
  'DOCENTE_CLASE_ASIGNADA',
  'DOCENTE_COMISION_ASIGNADA',
  'DOCENTE_ASIGNACION_ESTRATEGICA',
] as const;

export type TipoNotificacionDocente = (typeof TIPOS_NOTIFICACION_DOCENTE)[number];

// ============================================================================
// NOTIFICACIONES PARA ADMINS (15 tipos)
// ============================================================================

export const TIPOS_NOTIFICACION_ADMIN = [
  'ADMIN_NUEVO_PAGO',
  'ADMIN_PAGO_FALLIDO',
  'ADMIN_NUEVA_SUSCRIPCION',
  'ADMIN_SUSCRIPCION_CANCELADA',
  'ADMIN_NUEVO_USUARIO',
  'ADMIN_ALERTA_SISTEMA',
  'ADMIN_REPORTE_DIARIO',
  'ADMIN_CONTENIDO_PENDIENTE',
  'ADMIN_SOLICITUD_SOPORTE',
  'ADMIN_DOCENTE_INACTIVO',
  'ADMIN_CLASE_LLENA',
  'ADMIN_MIGRACION_COMPLETADA',
  'ADMIN_BACKUP_COMPLETADO',
  'ADMIN_AUDITORIA_SEGURIDAD',
  'ADMIN_RECORDATORIO',
] as const;

export type TipoNotificacionAdmin = (typeof TIPOS_NOTIFICACION_ADMIN)[number];

// ============================================================================
// TIPOS LEGACY (mantener por compatibilidad con datos existentes)
// @deprecated - Usar tipos específicos por portal
// ============================================================================

export const TIPOS_NOTIFICACION_LEGACY = [
  'ClaseProxima',
  'AsistenciaPendiente',
  'EstudianteAlerta',
  'ClaseCancelada',
  'LogroEstudiante',
  'Recordatorio',
  'General',
] as const;

export type TipoNotificacionLegacy = (typeof TIPOS_NOTIFICACION_LEGACY)[number];

// ============================================================================
// UNION DE TODOS LOS TIPOS
// ============================================================================

export type TipoNotificacion =
  | TipoNotificacionTutor
  | TipoNotificacionEstudiante
  | TipoNotificacionDocente
  | TipoNotificacionAdmin
  | TipoNotificacionLegacy;

/**
 * Array de todos los tipos de notificación (útil para validación)
 */
export const TODOS_TIPOS_NOTIFICACION = [
  ...TIPOS_NOTIFICACION_TUTOR,
  ...TIPOS_NOTIFICACION_ESTUDIANTE,
  ...TIPOS_NOTIFICACION_DOCENTE,
  ...TIPOS_NOTIFICACION_ADMIN,
  ...TIPOS_NOTIFICACION_LEGACY,
] as const;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function esTipoNotificacionTutor(tipo: string): tipo is TipoNotificacionTutor {
  return (TIPOS_NOTIFICACION_TUTOR as readonly string[]).includes(tipo);
}

export function esTipoNotificacionEstudiante(tipo: string): tipo is TipoNotificacionEstudiante {
  return (TIPOS_NOTIFICACION_ESTUDIANTE as readonly string[]).includes(tipo);
}

export function esTipoNotificacionDocente(tipo: string): tipo is TipoNotificacionDocente {
  return (TIPOS_NOTIFICACION_DOCENTE as readonly string[]).includes(tipo);
}

export function esTipoNotificacionAdmin(tipo: string): tipo is TipoNotificacionAdmin {
  return (TIPOS_NOTIFICACION_ADMIN as readonly string[]).includes(tipo);
}

export function esTipoNotificacionLegacy(tipo: string): tipo is TipoNotificacionLegacy {
  return (TIPOS_NOTIFICACION_LEGACY as readonly string[]).includes(tipo);
}

export function esTipoNotificacionValido(tipo: string): tipo is TipoNotificacion {
  return (TODOS_TIPOS_NOTIFICACION as readonly string[]).includes(tipo);
}
