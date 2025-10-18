import { z } from 'zod';

// ============================================================================
// NOTIFICACION SCHEMAS
// ============================================================================

/**
 * Enum para tipo de notificación
 */
export const tipoNotificacionEnum = z.enum([
  'CLASE_PROGRAMADA',
  'CLASE_CANCELADA',
  'NUEVA_RESERVA',
  'CANCELACION_RESERVA',
  'ESTUDIANTE_NUEVO',
  'PAGO_RECIBIDO',
  'MEMBRESIA_PROXIMO_VENCIMIENTO',
  'MEMBRESIA_VENCIDA',
  'SISTEMA',
]);

export type TipoNotificacion = z.infer<typeof tipoNotificacionEnum>;

/**
 * Schema base de Notificación
 */
export const notificacionSchema = z.object({
  id: z.string(),
  usuario_id: z.string(),
  tipo: tipoNotificacionEnum,
  titulo: z.string(),
  mensaje: z.string(),
  leida: z.boolean(),
  metadata: z.record(z.unknown()).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Notificacion = z.infer<typeof notificacionSchema>;

/**
 * Schema para lista de notificaciones
 */
export const notificacionesListSchema = z.array(notificacionSchema);

export type NotificacionesList = z.infer<typeof notificacionesListSchema>;

/**
 * Schema para response de notificaciones
 */
export const notificacionesResponseSchema = z.object({
  notificaciones: z.array(notificacionSchema),
  total: z.number(),
  noLeidas: z.number(),
});

export type NotificacionesResponse = z.infer<typeof notificacionesResponseSchema>;

/**
 * Schema para contador de notificaciones
 */
export const countResponseSchema = z.object({
  count: z.number(),
});

export type CountResponse = z.infer<typeof countResponseSchema>;

/**
 * Schema para respuesta de marcar como leída
 */
export const marcarLeidaResponseSchema = z.object({
  message: z.string(),
  count: z.number(),
});

export type MarcarLeidaResponse = z.infer<typeof marcarLeidaResponseSchema>;

/**
 * Schema para respuesta de eliminación
 */
export const eliminarNotificacionResponseSchema = z.object({
  message: z.string(),
});

export type EliminarNotificacionResponse = z.infer<typeof eliminarNotificacionResponseSchema>;
