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
  type RecursosEstudiante,
  type TransaccionRecurso,
} from '@mateatletas/contracts';
import type { ProgresoLogros } from '@/types/gamificacion';

export type DashboardData = DashboardGamificacion;
export type ProximaClase = DashboardData['proximasClases'][number];
export type Logro = ContractsLogro;
export type Puntos = ContractsPuntos;
export type Ranking = ContractsRanking;
export type Progreso = ProgresoRuta;
export type AccionPuntuable = ContractsAccionPuntuable & { codigo?: string };
export type PuntoObtenido = ContractsPuntoObtenido;
export type OtorgarPuntosData = OtorgarPuntosInput;
export type RankingEquipoEntry = RankingIntegrante;
export type RankingGlobalEntry = RankingGlobalItem;

// Tipos para endpoints V2 (sin schemas definidos aún en contracts)
export interface ProgresoLogroV2 {
  total: number;
  desbloqueados: number;
  porcentaje: number;
  categorias: Record<
    string,
    {
      total: number;
      desbloqueados: number;
      logros?: Array<Logro & { desbloqueado: boolean; fecha_desbloqueo: string | null; secreto?: boolean }>;
    }
  >;
}

export interface RecursosResponse {
  xp: number;
  monedas: number;
  nivel: number;
  xp_siguiente_nivel: number;
}

export interface RachaResponse {
  dias_consecutivos: number;
  ultima_actividad: string;
  record_personal: number;
}

export const gamificacionApi = {
  /**
   * Obtener dashboard completo del estudiante
   * NOTA: Este endpoint aún no está implementado en el backend
   * Retorna datos mock por ahora
  */
  getDashboard: async (estudianteId: string): Promise<DashboardData> => {
    try {
      const response = await apiClient.get(`/gamificacion/dashboard/${estudianteId}`);
      return dashboardGamificacionSchema.parse(response);
    } catch (error) {
      // Si es 404, retornar mock data en lugar de error
      if ((error as any)?.response?.status === 404) {
        console.warn('⚠️ Dashboard endpoint no implementado, usando datos mock');
        return {
          estudiante: {
            id: estudianteId,
            nombre: 'Estudiante',
            apellido: 'Test',
            avatar_gradient: 0,
            equipo: { id: '', nombre: 'Sin equipo', color: '#cccccc' }
          },
          stats: { puntosToales: 0, clasesAsistidas: 0, clasesTotales: 0, racha: 0 },
          nivel: {
            nivelActual: 1,
            nombre: 'Iniciante',
            descripcion: 'Comenzando tu aventura',
            puntosActuales: 0,
            puntosMinimos: 0,
            puntosMaximos: 100,
            puntosParaSiguienteNivel: 100,
            porcentajeProgreso: 0,
            color: '#888888',
            icono: '🌱',
            siguienteNivel: null,
          },
          proximasClases: [],
          equipoRanking: [],
          ultimasAsistencias: [],
        } as DashboardData;
      }
      console.error('Error al obtener el dashboard de gamificación:', error);
      throw error;
    }
  },

  /**
   * Obtener logros del estudiante
   */
  getLogros: async (estudianteId: string): Promise<Logro[]> => {
    try {
      const response = await apiClient.get(`/gamificacion/logros/estudiante/${estudianteId}`);
      return logrosListSchema.parse(response);
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
      return puntosSchema.parse(response);
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
      return rankingSchema.parse(response);
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
      return progresoRutaListSchema.parse(response);
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
      const response = await apiClient.post(`/gamificacion/logros/${logroId}/desbloquear`);
      return response;
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
      return accionesPuntuablesListSchema.parse(response);
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
      return puntosObtenidosListSchema.parse(response);
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
      return response;
    } catch (error) {
      console.error('Error al otorgar puntos de gamificación:', error);
      throw error;
    }
  },

  // ==========================================
  // GAMIFICACIÓN V2 - NUEVOS ENDPOINTS
  // ==========================================

  /**
   * Obtener todos los logros disponibles
   */
  obtenerTodosLogrosV2: async (): Promise<Logro[]> => {
    try {
      const response = await apiClient.get('/gamificacion/logros');
      return logrosListSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener logros V2:', error);
      throw error;
    }
  },

  /**
   * Obtener logros del estudiante actual (con autenticación)
   */
  obtenerMisLogrosV2: async (estudianteId: string): Promise<Logro[]> => {
    try {
      const response = await apiClient.get(`/gamificacion/logros/estudiante/${estudianteId}`);
      return logrosListSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener mis logros V2:', error);
      throw error;
    }
  },

  /**
   * Obtener logros no vistos (para notificaciones)
   */
  obtenerLogrosNoVistos: async (estudianteId: string): Promise<Logro[]> => {
    try {
      const response = await apiClient.get(`/gamificacion/logros/estudiante/${estudianteId}/no-vistos`);
      return logrosListSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener logros no vistos:', error);
      throw error;
    }
  },

  /**
   * Marcar logro como visto
   */
  marcarLogroVisto: async (estudianteId: string, logroId: string): Promise<void> => {
    try {
      await apiClient.patch(`/gamificacion/logros/estudiante/${estudianteId}/${logroId}/visto`);
    } catch (error) {
      console.error('Error al marcar logro como visto:', error);
      throw error;
    }
  },

  /**
   * Obtener progreso de logros V2
   */
  obtenerProgresoV2: async (estudianteId: string): Promise<ProgresoLogros> => {
    try {
      const response = await apiClient.get<ProgresoLogros | ProgresoLogroV2>(
        `/gamificacion/logros/estudiante/${estudianteId}/progreso`,
      );

      const isProgresoLogros = (value: unknown): value is ProgresoLogros =>
        typeof value === 'object' &&
        value !== null &&
        'total_logros' in value &&
        'logros_desbloqueados' in value &&
        'por_categoria' in value;

      if (isProgresoLogros(response)) {
        return response;
      }

      const data = response as ProgresoLogroV2;

      const porCategoria = Object.entries(data.categorias ?? {}).reduce<ProgresoLogros['por_categoria']>(
        (acc, [categoria, valores]) => {
          acc[categoria] = {
            total: valores.total ?? 0,
            desbloqueados: valores.desbloqueados ?? 0,
            logros: (valores.logros ?? []).map((logro) => ({
              ...logro,
              fecha_desbloqueo: logro.fecha_desbloqueo ? new Date(logro.fecha_desbloqueo) : null,
            })),
          };
          return acc;
        },
        {},
      );

      return {
        total_logros: data.total ?? 0,
        logros_desbloqueados: data.desbloqueados ?? 0,
        porcentaje: data.porcentaje ?? 0,
        por_categoria: porCategoria,
      };
    } catch (error) {
      console.error('Error al obtener progreso V2:', error);
      throw error;
    }
  },

  /**
   * Obtener recursos del estudiante (XP + Monedas + Nivel)
   */
  obtenerRecursos: async (estudianteId: string): Promise<RecursosResponse> => {
    try {
      const response = await apiClient.get(`/gamificacion/recursos/${estudianteId}`);
      return response as RecursosResponse;
    } catch (error) {
      console.error('Error al obtener recursos:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de transacciones V2
   */
  obtenerHistorialRecursos: async (estudianteId: string): Promise<TransaccionRecurso[]> => {
    try {
      const response = await apiClient.get(`/gamificacion/recursos/${estudianteId}/historial`);
      return response as TransaccionRecurso[];
    } catch (error) {
      console.error('Error al obtener historial de recursos:', error);
      throw error;
    }
  },

  /**
   * Obtener racha del estudiante
   */
  obtenerRacha: async (estudianteId: string): Promise<RachaResponse> => {
    try {
      const response = await apiClient.get(`/gamificacion/recursos/${estudianteId}/racha`);
      return response as RachaResponse;
    } catch (error) {
      console.error('Error al obtener racha:', error);
      throw error;
    }
  },

  /**
   * Registrar actividad del día (actualiza racha)
   */
  registrarActividad: async (estudianteId: string): Promise<RachaResponse> => {
    try {
      const response = await apiClient.post(`/gamificacion/recursos/${estudianteId}/racha`);
      return response as RachaResponse;
    } catch (error) {
      console.error('Error al registrar actividad:', error);
      throw error;
    }
  },
};
