/**
 * Notificaciones API Client
 * Integración con endpoints de notificaciones del backend
 */

import axios from '@/lib/axios';
import {
  notificacionSchema,
  notificacionesListSchema,
  countResponseSchema,
  marcarLeidaResponseSchema,
  eliminarNotificacionResponseSchema,
  type Notificacion,
  type TipoNotificacion,
} from '@mateatletas/contracts';

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export types from contracts for convenience
export type { Notificacion, TipoNotificacion };

export interface NotificacionesResponse {
  notificaciones: Notificacion[];
  total: number;
  noLeidas: number;
}

export interface CountResponse {
  count: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Obtener todas las notificaciones del usuario actual
 * @param soloNoLeidas - Si true, retorna solo las notificaciones no leídas
 */
export const getNotificaciones = async (soloNoLeidas?: boolean): Promise<Notificacion[]> => {
  const params = soloNoLeidas ? { soloNoLeidas: 'true' } : {};
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get('/notificaciones', { params });
    return notificacionesListSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener las notificaciones:', error);
    throw error;
  }
};

/**
 * Obtener contador de notificaciones no leídas
 */
export const getNotificacionesCount = async (): Promise<number> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<CountResponse>('/notificaciones/count');
    const validated = countResponseSchema.parse(response);
    return validated.count;
  } catch (error) {
    console.error('Error al obtener el conteo de notificaciones:', error);
    throw error;
  }
};

/**
 * Marcar una notificación específica como leída
 * @param id - ID de la notificación
 */
export const marcarNotificacionComoLeida = async (id: string): Promise<Notificacion> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.patch(`/notificaciones/${id}/leer`);
    return notificacionSchema.parse(response);
  } catch (error) {
    console.error('Error al marcar la notificación como leída:', error);
    throw error;
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasComoLeidas = async (): Promise<{ message: string; count: number }> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.patch('/notificaciones/leer-todas');
    return marcarLeidaResponseSchema.parse(response);
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    throw error;
  }
};

/**
 * Eliminar una notificación
 * @param id - ID de la notificación a eliminar
 */
export const eliminarNotificacion = async (id: string): Promise<{ message: string }> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.delete(`/notificaciones/${id}`);
    return eliminarNotificacionResponseSchema.parse(response);
  } catch (error) {
    console.error('Error al eliminar la notificación:', error);
    throw error;
  }
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtener ícono según tipo de notificación
 */
export const getNotificacionIcon = (tipo: TipoNotificacion): string => {
  switch (tipo) {
    case 'CLASE_PROGRAMADA':
      return '📅';
    case 'CLASE_CANCELADA':
      return '❌';
    case 'NUEVA_RESERVA':
      return '✅';
    case 'CANCELACION_RESERVA':
      return '🔴';
    case 'ESTUDIANTE_NUEVO':
      return '👤';
    case 'PAGO_RECIBIDO':
      return '💰';
    case 'MEMBRESIA_PROXIMO_VENCIMIENTO':
      return '⚠️';
    case 'MEMBRESIA_VENCIDA':
      return '⏰';
    case 'SISTEMA':
      return '🔔';
    default:
      return '📬';
  }
};

/**
 * Obtener color según tipo de notificación
 */
export const getNotificacionColor = (tipo: TipoNotificacion): string => {
  switch (tipo) {
    case 'CLASE_PROGRAMADA':
      return 'bg-blue-100 border-blue-500 text-blue-900';
    case 'CLASE_CANCELADA':
      return 'bg-red-100 border-red-500 text-red-900';
    case 'NUEVA_RESERVA':
      return 'bg-green-100 border-green-500 text-green-900';
    case 'CANCELACION_RESERVA':
      return 'bg-orange-100 border-orange-500 text-orange-900';
    case 'ESTUDIANTE_NUEVO':
      return 'bg-purple-100 border-purple-500 text-purple-900';
    case 'PAGO_RECIBIDO':
      return 'bg-emerald-100 border-emerald-500 text-emerald-900';
    case 'MEMBRESIA_PROXIMO_VENCIMIENTO':
      return 'bg-yellow-100 border-yellow-500 text-yellow-900';
    case 'MEMBRESIA_VENCIDA':
      return 'bg-red-100 border-red-500 text-red-900';
    case 'SISTEMA':
      return 'bg-gray-100 border-gray-500 text-gray-900';
    default:
      return 'bg-gray-100 border-gray-500 text-gray-900';
  }
};

/**
 * Formatear tiempo relativo (ej: "hace 5 minutos")
 */
export const formatearTiempoRelativo = (fecha: string): string => {
  const ahora = new Date();
  const fechaNotif = new Date(fecha);
  const diffMs = ahora.getTime() - fechaNotif.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;

  return fechaNotif.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
};
