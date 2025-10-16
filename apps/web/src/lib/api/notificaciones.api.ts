/**
 * Notificaciones API Client
 * Integración con endpoints de notificaciones del backend
 */

import axios from '@/lib/axios';

// ============================================================================
// TYPES
// ============================================================================

export enum TipoNotificacion {
  CLASE_PROGRAMADA = 'CLASE_PROGRAMADA',
  CLASE_CANCELADA = 'CLASE_CANCELADA',
  NUEVA_RESERVA = 'NUEVA_RESERVA',
  CANCELACION_RESERVA = 'CANCELACION_RESERVA',
  ESTUDIANTE_NUEVO = 'ESTUDIANTE_NUEVO',
  PAGO_RECIBIDO = 'PAGO_RECIBIDO',
  MEMBRESIA_PROXIMO_VENCIMIENTO = 'MEMBRESIA_PROXIMO_VENCIMIENTO',
  MEMBRESIA_VENCIDA = 'MEMBRESIA_VENCIDA',
  SISTEMA = 'SISTEMA',
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

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
  return await axios.get('/notificaciones', { params }) as unknown as Notificacion[];
};

/**
 * Obtener contador de notificaciones no leídas
 */
export const getNotificacionesCount = async (): Promise<number> => {
  const response = await axios.get<CountResponse>('/notificaciones/count') as unknown as CountResponse;
  return response.count;
};

/**
 * Marcar una notificación específica como leída
 * @param id - ID de la notificación
 */
export const marcarNotificacionComoLeida = async (id: string): Promise<Notificacion> => {
  return await axios.patch(`/notificaciones/${id}/leer`) as unknown as Notificacion;
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasComoLeidas = async (): Promise<{ message: string; count: number }> => {
  return await axios.patch('/notificaciones/leer-todas') as unknown as { message: string; count: number };
};

/**
 * Eliminar una notificación
 * @param id - ID de la notificación a eliminar
 */
export const eliminarNotificacion = async (id: string): Promise<{ message: string }> => {
  return await axios.delete(`/notificaciones/${id}`) as unknown as { message: string };
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtener ícono según tipo de notificación
 */
export const getNotificacionIcon = (tipo: TipoNotificacion): string => {
  switch (tipo) {
    case TipoNotificacion.CLASE_PROGRAMADA:
      return '📅';
    case TipoNotificacion.CLASE_CANCELADA:
      return '❌';
    case TipoNotificacion.NUEVA_RESERVA:
      return '✅';
    case TipoNotificacion.CANCELACION_RESERVA:
      return '🔴';
    case TipoNotificacion.ESTUDIANTE_NUEVO:
      return '👤';
    case TipoNotificacion.PAGO_RECIBIDO:
      return '💰';
    case TipoNotificacion.MEMBRESIA_PROXIMO_VENCIMIENTO:
      return '⚠️';
    case TipoNotificacion.MEMBRESIA_VENCIDA:
      return '⏰';
    case TipoNotificacion.SISTEMA:
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
    case TipoNotificacion.CLASE_PROGRAMADA:
      return 'bg-blue-100 border-blue-500 text-blue-900';
    case TipoNotificacion.CLASE_CANCELADA:
      return 'bg-red-100 border-red-500 text-red-900';
    case TipoNotificacion.NUEVA_RESERVA:
      return 'bg-green-100 border-green-500 text-green-900';
    case TipoNotificacion.CANCELACION_RESERVA:
      return 'bg-orange-100 border-orange-500 text-orange-900';
    case TipoNotificacion.ESTUDIANTE_NUEVO:
      return 'bg-purple-100 border-purple-500 text-purple-900';
    case TipoNotificacion.PAGO_RECIBIDO:
      return 'bg-emerald-100 border-emerald-500 text-emerald-900';
    case TipoNotificacion.MEMBRESIA_PROXIMO_VENCIMIENTO:
      return 'bg-yellow-100 border-yellow-500 text-yellow-900';
    case TipoNotificacion.MEMBRESIA_VENCIDA:
      return 'bg-red-100 border-red-500 text-red-900';
    case TipoNotificacion.SISTEMA:
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
