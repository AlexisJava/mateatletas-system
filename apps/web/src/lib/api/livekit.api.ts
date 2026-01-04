/**
 * API Client para LiveKit - Clases en Vivo
 *
 * Permite a docentes y estudiantes obtener tokens para conectarse a clases en vivo
 */

import apiClient from '../axios';

// ============================================================================
// TIPOS
// ============================================================================

export interface TokenRequestDto {
  /** ID de la clase grupo (opcional) */
  claseGrupoId?: string;
  /** ID de la comisión (opcional) */
  comisionId?: string;
}

export interface TokenResponseDto {
  /** Token JWT para conectarse a LiveKit */
  token: string;
  /** URL del servidor WebSocket de LiveKit */
  wsUrl: string;
  /** Nombre de la sala */
  roomName: string;
}

// ============================================================================
// API
// ============================================================================

export const livekitApi = {
  /**
   * Obtener token LiveKit para docente (puede transmitir)
   * @param data - { claseGrupoId } o { comisionId }
   * @returns Token, wsUrl y roomName
   */
  getTokenDocente: async (data: TokenRequestDto): Promise<TokenResponseDto> => {
    return apiClient.post<TokenResponseDto>('/livekit/token/docente', data);
  },

  /**
   * Obtener token LiveKit para estudiante (solo puede ver)
   * @param data - { claseGrupoId } o { comisionId }
   * @returns Token, wsUrl y roomName
   */
  getTokenEstudiante: async (data: TokenRequestDto): Promise<TokenResponseDto> => {
    return apiClient.post<TokenResponseDto>('/livekit/token/estudiante', data);
  },
};
