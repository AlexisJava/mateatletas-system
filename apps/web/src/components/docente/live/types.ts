/**
 * Tipos para LiveKit - Clase en Vivo
 */

export type RoomState = 'preClass' | 'connecting' | 'connected' | 'ended' | 'error';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isTeacher: boolean;
}

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
