/**
 * Tipos para Clase en Vivo (LiveKit + Chat WebSocket)
 */

export type RoomState = 'preClass' | 'connecting' | 'connected' | 'ended' | 'error';

/**
 * Mensaje de chat del servidor WebSocket
 * Coincide con el formato del backend aula-viva
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
 * Estado de conexión del chat
 */
export type ChatConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface LiveClassConfig {
  comisionId?: string;
  claseGrupoId?: string;
  title: string;
  subtitle?: string;
}

export interface ParticipantInfo {
  identity: string;
  name: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
}
