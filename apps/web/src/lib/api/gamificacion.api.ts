import apiClient from '../axios';
import {
  accionesPuntuablesListSchema,
  dashboardGamificacionSchema,
  logrosListSchema,
  otorgarPuntosSchema,
  puntosObtenidosListSchema,
  puntosSchema,
  progresoRutaListSchema,
  rankingSchema,
  type AccionPuntuable as ContractsAccionPuntuable,
  type DashboardGamificacion,
  type Logro as ContractsLogro,
  type OtorgarPuntosInput,
  type PuntoObtenido as ContractsPuntoObtenido,
  type Puntos as ContractsPuntos,
  type Ranking as ContractsRanking,
  type RankingGlobalItem,
  type RankingIntegrante,
  type ProgresoRuta,
} from '@mateatletas/contracts';

export type DashboardData = DashboardGamificacion;
export type ProximaClase = DashboardData['proximasClases'][number];
export type Logro = ContractsLogro;
export type Puntos = ContractsPuntos;
export type Ranking = ContractsRanking;
export type Progreso = ProgresoRuta;
export type AccionPuntuable = ContractsAccionPuntuable;
export type PuntoObtenido = ContractsPuntoObtenido;
export type OtorgarPuntosData = OtorgarPuntosInput;
export type RankingEquipoEntry = RankingIntegrante;
export type RankingGlobalEntry = RankingGlobalItem;

export const gamificacionApi = {
  /**
   * Obtener dashboard completo del estudiante
  */
  getDashboard: async (estudianteId: string): Promise<DashboardData> => {
    try {
      const response = await apiClient.get(`/gamificacion/dashboard/${estudianteId}`);
      return dashboardGamificacionSchema.parse(response.data);
    } catch (error) {
      console.error('Error al obtener el dashboard de gamificación:', error);
      throw error;
    }
  },

  /**
   * Obtener logros del estudiante
   */
  getLogros: async (estudianteId: string): Promise<Logro[]> => {
    try {
      const response = await apiClient.get(`/gamificacion/logros/${estudianteId}`);
      return logrosListSchema.parse(response.data);
    } catch (error) {
      console.error('Error al obtener los logros de gamificación:', error);
      throw error;
    }
  },

  /**
   * Obtener puntos del estudiante
   */
  getPuntos: async (estudianteId: string): Promise<Puntos> => {
    try {
      const response = await apiClient.get(`/gamificacion/puntos/${estudianteId}`);
      return puntosSchema.parse(response.data);
    } catch (error) {
      console.error('Error al obtener los puntos del estudiante:', error);
      throw error;
    }
  },

  /**
   * Obtener ranking del estudiante
   */
  getRanking: async (estudianteId: string): Promise<Ranking> => {
    try {
      const response = await apiClient.get(`/gamificacion/ranking/${estudianteId}`);
      return rankingSchema.parse(response.data);
    } catch (error) {
      console.error('Error al obtener el ranking de gamificación:', error);
      throw error;
    }
  },

  /**
   * Obtener progreso por rutas
   */
  getProgreso: async (estudianteId: string): Promise<Progreso[]> => {
    try {
      const response = await apiClient.get(`/gamificacion/progreso/${estudianteId}`);
      return progresoRutaListSchema.parse(response.data);
    } catch (error) {
      console.error('Error al obtener el progreso de gamificación:', error);
      throw error;
    }
  },

  /**
   * Desbloquear logro
   */
  desbloquearLogro: async (logroId: string): Promise<unknown> => {
    try {
      const response = await apiClient.post(
        `/gamificacion/logros/${logroId}/desbloquear`
      );
      return response.data;
    } catch (error) {
      console.error('Error al desbloquear el logro:', error);
      throw error;
    }
  },

  /**
   * Obtener acciones puntuables disponibles (docentes)
   */
  getAcciones: async (): Promise<AccionPuntuable[]> => {
    try {
      const response = await apiClient.get('/gamificacion/acciones');
      return accionesPuntuablesListSchema.parse(response.data);
    } catch (error) {
      console.error('Error al obtener las acciones puntuables:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de puntos de un estudiante
   */
  getHistorial: async (estudianteId: string): Promise<PuntoObtenido[]> => {
    try {
      const response = await apiClient.get(`/gamificacion/historial/${estudianteId}`);
      return puntosObtenidosListSchema.parse(response.data);
    } catch (error) {
      console.error('Error al obtener el historial de puntos:', error);
      throw error;
    }
  },

  /**
   * Otorgar puntos a un estudiante (docentes)
   */
  otorgarPuntos: async (data: OtorgarPuntosData): Promise<unknown> => {
    try {
      const payload = otorgarPuntosSchema.parse(data);
      const response = await apiClient.post('/gamificacion/puntos', payload);
      return response.data;
    } catch (error) {
      console.error('Error al otorgar puntos de gamificación:', error);
      throw error;
    }
  },
};
