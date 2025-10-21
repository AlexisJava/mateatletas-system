import { z } from 'zod';

/**
 * Schema de Notificación
 * Coincide con el modelo de notificaciones del backend
 */
export const notificacionSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  mensaje: z.string(),
  tipo: z.enum(['info', 'success', 'warning', 'error']),
  leida: z.boolean(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Schema para lista de notificaciones
 */
export const notificacionesListSchema = z.array(notificacionSchema);

/**
 * Schema para respuesta de conteo
 */
export const countResponseSchema = z.object({
  count: z.number(),
});

/**
 * Schema para respuesta de marcar como leída
 */
export const marcarLeidaResponseSchema = z.object({
  message: z.string(),
  notificacion: notificacionSchema,
});

/**
 * Schema para respuesta de eliminación
 */
export const eliminarNotificacionResponseSchema = z.object({
  message: z.string(),
});

/**
 * Derivar tipos desde los schemas
 */
export type Notificacion = z.infer<typeof notificacionSchema>;
export type TipoNotificacion = Notificacion['tipo'];
export type CountResponse = z.infer<typeof countResponseSchema>;
export type MarcarLeidaResponse = z.infer<typeof marcarLeidaResponseSchema>;
export type EliminarNotificacionResponse = z.infer<typeof eliminarNotificacionResponseSchema>;
