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
    const response = await apiClient.get(`/gamificacion/dashboard/${estudianteId}`);
    return dashboardGamificacionSchema.parse(response);
  },

  /**
   * Obtener logros del estudiante
   */
  getLogros: async (estudianteId: string): Promise<Logro[]> => {
    const response = await apiClient.get(`/gamificacion/logros/${estudianteId}`);
    return logrosListSchema.parse(response);
  },

  /**
   * Obtener puntos del estudiante
   */
  getPuntos: async (estudianteId: string): Promise<Puntos> => {
    const response = await apiClient.get(`/gamificacion/puntos/${estudianteId}`);
    return puntosSchema.parse(response);
  },

  /**
   * Obtener ranking del estudiante
   */
  getRanking: async (estudianteId: string): Promise<Ranking> => {
    const response = await apiClient.get(`/gamificacion/ranking/${estudianteId}`);
    return rankingSchema.parse(response);
  },

  /**
   * Obtener progreso por rutas
   */
  getProgreso: async (estudianteId: string): Promise<Progreso[]> => {
    const response = await apiClient.get(`/gamificacion/progreso/${estudianteId}`);
    return progresoRutaListSchema.parse(response);
  },

  /**
   * Desbloquear logro
   */
  desbloquearLogro: async (logroId: string): Promise<unknown> => {
    return await apiClient.post(`/gamificacion/logros/${logroId}/desbloquear`);
  },

  /**
   * Obtener acciones puntuables disponibles (docentes)
   */
  getAcciones: async (): Promise<AccionPuntuable[]> => {
    const response = await apiClient.get('/gamificacion/acciones');
    return accionesPuntuablesListSchema.parse(response);
  },

  /**
   * Obtener historial de puntos de un estudiante
   */
  getHistorial: async (estudianteId: string): Promise<PuntoObtenido[]> => {
    const response = await apiClient.get(`/gamificacion/historial/${estudianteId}`);
    return puntosObtenidosListSchema.parse(response);
  },

  /**
   * Otorgar puntos a un estudiante (docentes)
   */
  otorgarPuntos: async (data: OtorgarPuntosData): Promise<unknown> => {
    const payload = otorgarPuntosSchema.parse(data);
    return await apiClient.post('/gamificacion/puntos', payload);
  },
};
