import apiClient from '../axios';
import {
  dashboardGamificacionSchema,
  logrosListSchema,
  puntosSchema,
  rankingSchema,
  progresoRutaListSchema,
  accionesPuntuablesListSchema,
  puntosObtenidosListSchema,
  otorgarPuntosSchema,
  type DashboardGamificacion,
  type Logro,
  type Puntos,
  type Ranking,
  type ProgresoRuta,
  type AccionPuntuable,
  type PuntoObtenido,
  type OtorgarPuntosInput,
  type ProximaClase,
} from '@mateatletas/contracts';

export type {
  ProximaClase,
  Logro,
  Puntos,
  Ranking,
  AccionPuntuable,
  PuntoObtenido,
};

export type DashboardData = DashboardGamificacion;
export type Progreso = ProgresoRuta;
export type OtorgarPuntosData = OtorgarPuntosInput;

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

