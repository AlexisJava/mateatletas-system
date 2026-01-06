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

export type EstadoClase = 'Programada' | 'EnVivo' | 'Finalizada' | 'Cancelada';

export interface ClaseEnVivoResponse {
  id: string;
  nombre: string;
  estado_clase: EstadoClase;
  iniciada_en: string | null;
  finalizada_en: string | null;
  livekit_room_name: string | null;
}

export interface IniciarClaseResponse extends ClaseEnVivoResponse {
  mensaje: string;
}

export interface FinalizarClaseResponse extends ClaseEnVivoResponse {
  mensaje: string;
  duracion_minutos: number;
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

  // ============================================================================
  // GESTIÓN DE ESTADO DE CLASE EN VIVO
  // ============================================================================

  /**
   * Iniciar una clase en vivo (solo docente titular)
   * Cambia el estado a EnVivo
   * @param claseGrupoId - ID del ClaseGrupo
   */
  iniciarClase: async (claseGrupoId: string): Promise<IniciarClaseResponse> => {
    return apiClient.patch<IniciarClaseResponse>(`/clase-grupos/${claseGrupoId}/iniciar-clase`);
  },

  /**
   * Finalizar una clase en vivo (solo docente titular)
   * Cambia el estado a Finalizada
   * @param claseGrupoId - ID del ClaseGrupo
   */
  finalizarClase: async (claseGrupoId: string): Promise<FinalizarClaseResponse> => {
    return apiClient.patch<FinalizarClaseResponse>(`/clase-grupos/${claseGrupoId}/finalizar-clase`);
  },

  /**
   * Obtener estado actual de una clase (ClaseGrupo)
   * @param claseGrupoId - ID del ClaseGrupo
   */
  obtenerEstadoClase: async (claseGrupoId: string): Promise<ClaseEnVivoResponse> => {
    return apiClient.get<ClaseEnVivoResponse>(`/clase-grupos/${claseGrupoId}/estado-clase`);
  },

  // ============================================================================
  // GESTIÓN DE ESTADO DE COMISIÓN EN VIVO
  // ============================================================================

  /**
   * Iniciar una clase de comisión en vivo (solo docente asignado)
   * Cambia el estado a EnVivo
   * @param comisionId - ID de la Comisión
   */
  iniciarClaseComision: async (comisionId: string): Promise<IniciarClaseResponse> => {
    return apiClient.patch<IniciarClaseResponse>(`/comisiones/${comisionId}/iniciar-clase`);
  },

  /**
   * Finalizar una clase de comisión en vivo (solo docente asignado)
   * Cambia el estado a Finalizada
   * @param comisionId - ID de la Comisión
   */
  finalizarClaseComision: async (comisionId: string): Promise<FinalizarClaseResponse> => {
    return apiClient.patch<FinalizarClaseResponse>(`/comisiones/${comisionId}/finalizar-clase`);
  },

  /**
   * Obtener estado actual de una comisión
   * @param comisionId - ID de la Comisión
   */
  obtenerEstadoComision: async (comisionId: string): Promise<ClaseEnVivoResponse> => {
    return apiClient.get<ClaseEnVivoResponse>(`/comisiones/${comisionId}/estado-clase`);
  },
};
