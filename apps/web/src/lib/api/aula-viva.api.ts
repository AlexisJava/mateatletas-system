/**
 * API Client para Aula Viva - Chat en Tiempo Real
 *
 * Proporciona funciones para obtener tokens de autenticación
 * para la conexión WebSocket del chat.
 */

import apiClient from '../axios';

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Respuesta del endpoint de token WebSocket
 */
export interface WsTokenResponse {
  /** Token JWT para autenticar conexión WebSocket */
  token: string;
}

/**
 * Mensaje de chat recibido del servidor
 */
export interface MensajeChat {
  id: string;
  visibleIdUsuario: string;
  nombreUsuario: string;
  rol: 'DOCENTE' | 'ESTUDIANTE' | 'ADMIN';
  contenido: string;
  timestamp: string;
  salaId: string;
}

/**
 * Participante en una sala
 */
export interface Participante {
  odidentidadUsuario: string;
  odidentidadSala: string;
  socketId: string;
  nombre: string;
  rol: 'DOCENTE' | 'ESTUDIANTE' | 'ADMIN';
  conectadoEn: string;
}

/**
 * Respuesta al unirse a una sala
 */
export interface UnirseSalaResponse {
  exito: boolean;
  salaId: string;
  participantes: Participante[];
}

/**
 * Respuesta al enviar un mensaje
 */
export interface EnviarMensajeResponse {
  exito: boolean;
  mensaje?: MensajeChat;
  error?: string;
}

// ============================================================================
// API
// ============================================================================

export const aulaVivaApi = {
  /**
   * Obtener token JWT para conexión WebSocket
   *
   * Este token tiene corta duración (5 min) y se usa solo para
   * autenticar la conexión inicial al WebSocket.
   *
   * @returns Token JWT para WebSocket
   */
  getWsToken: async (): Promise<WsTokenResponse> => {
    return apiClient.post<WsTokenResponse>('/aula-viva/token');
  },
};
